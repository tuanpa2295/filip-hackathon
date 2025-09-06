"""
Enhanced Course Agent with Validation and Regeneration

Provides an advanced course recommendation agent that integrates with the
validation system to ensure high-quality responses with automatic regeneration
for failed validations.
"""

import logging
import asyncio
import time
from typing import Dict, List, Any, Optional, Tuple
import json

from langchain_openai import AzureChatOpenAI, AzureOpenAIEmbeddings
from langchain_postgres.vectorstores import PGVector
from langchain.schema import Document

from .response_validation import ResponseValidator
from .validation_config import ValidationConfig, ValidationConfigManager, ValidationMode, validation_metrics

logger = logging.getLogger(__name__)


class ValidatedCourseAgent:
    """Enhanced course agent with validation and regeneration capabilities"""
    
    def __init__(self, azure_config: Dict[str, str], vector_store: PGVector, 
                 validation_config: ValidationConfig = None):
        """
        Initialize the validated course agent
        
        Args:
            azure_config: Azure OpenAI configuration
            vector_store: Vector store for course data
            validation_config: Validation configuration (optional)
        """
        self.azure_config = azure_config
        self.vector_store = vector_store
        self.config = validation_config or ValidationConfigManager.get_default_config()
        
        # Initialize Azure OpenAI components
        self.llm = AzureChatOpenAI(
            model=azure_config["deployment_name"],
            openai_api_version=azure_config["api_version"],
            azure_endpoint=azure_config["azure_endpoint"],
            api_key=azure_config["api_key"],
            temperature=0,
        )
        
        self.embeddings = AzureOpenAIEmbeddings(
            openai_api_version=azure_config["api_version"],
            azure_endpoint=azure_config["azure_endpoint"],
            api_key=azure_config["embeddings_api_key"],
            model=azure_config["embeddings_deployment"],
        )
        
        # Initialize validator
        self.validator = ResponseValidator(
            embeddings_model=self.embeddings,
            llm=self.llm,
            vector_store=vector_store
        )
        
        self.logger = logging.getLogger(f"{__name__}.ValidatedCourseAgent")
    
    async def get_course_recommendations(self, user_skills: List[str], target_skills: List[str], 
                                       max_results: int = 5, domain: str = "courses") -> Dict[str, Any]:
        """
        Get validated course recommendations with automatic regeneration
        
        Args:
            user_skills: User's current skills
            target_skills: Skills the user wants to learn
            max_results: Maximum number of courses to return
            domain: Domain context for validation
            
        Returns:
            Dictionary containing courses, validation results, and metadata
        """
        start_time = time.time()
        
        try:
            # Generate query
            query = self._build_recommendation_query(user_skills, target_skills)
            
            # Generate recommendation with validation
            result = await self._generate_recommendation_with_validation(
                query=query,
                user_skills=user_skills,
                target_skills=target_skills,
                max_results=max_results,
                domain=domain
            )
            
            # Add metadata
            result["processing_metadata"] = {
                "total_duration_seconds": time.time() - start_time,
                "validation_config": self.config.mode.value,
                "user_skills_count": len(user_skills),
                "target_skills_count": len(target_skills),
                "max_results": max_results
            }
            
            return result
            
        except Exception as e:
            self.logger.error(f"Course recommendation failed: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "courses": [],
                "reasoning": "An error occurred while generating recommendations.",
                "validation": {
                    "is_valid": False,
                    "overall_score": 0.0,
                    "reasons": [f"System error: {str(e)}"],
                    "suggestions": ["Please try again later"]
                }
            }
    
    async def _generate_recommendation_with_validation(self, query: str, user_skills: List[str], 
                                                     target_skills: List[str], max_results: int, 
                                                     domain: str) -> Dict[str, Any]:
        """
        Generate recommendation with validation and regeneration
        
        Args:
            query: Generated query for course search
            user_skills: User's current skills
            target_skills: Target skills to learn
            max_results: Maximum results to return
            domain: Domain for validation
            
        Returns:
            Recommendation result with validation
        """
        attempts = 0
        max_attempts = self.config.max_regeneration_attempts + 1
        
        while attempts < max_attempts:
            attempts += 1
            
            try:
                # Generate courses and reasoning
                courses, reasoning = await self._generate_courses_and_reasoning(
                    query, user_skills, target_skills, max_results, attempts
                )
                
                # Validate the response
                validation_result = await self.validator.validate_response(
                    query=query,
                    response=reasoning,
                    domain=domain,
                    weights=self.config.get_weights()
                )
                
                # Check if validation passed or we've exhausted attempts
                is_valid = validation_result.get("is_valid", False)
                should_regenerate = (
                    self.validator.should_regenerate_response(validation_result) and 
                    attempts < max_attempts and 
                    self.config.enable_regeneration
                )
                
                if is_valid or not should_regenerate:
                    # Record metrics
                    if attempts > 1:
                        validation_metrics.record_regeneration()
                    
                    return {
                        "success": True,
                        "courses": courses,
                        "reasoning": reasoning,
                        "validation": validation_result,
                        "generation_metadata": {
                            "attempts": attempts,
                            "regenerated": attempts > 1,
                            "final_attempt": True
                        }
                    }
                
                # Log regeneration attempt
                self.logger.info(f"Regenerating response (attempt {attempts}/{max_attempts})")
                suggestions = self.validator.get_improvement_suggestions(validation_result)
                self.logger.debug(f"Improvement suggestions: {suggestions}")
                
            except Exception as e:
                self.logger.error(f"Generation attempt {attempts} failed: {str(e)}")
                
                # If this is the last attempt, return error
                if attempts == max_attempts:
                    return {
                        "success": False,
                        "error": str(e),
                        "courses": [],
                        "reasoning": "Failed to generate valid recommendation after multiple attempts.",
                        "validation": {
                            "is_valid": False,
                            "overall_score": 0.0,
                            "reasons": [f"Generation error: {str(e)}"],
                            "suggestions": ["Check system configuration"]
                        },
                        "generation_metadata": {
                            "attempts": attempts,
                            "regenerated": attempts > 1,
                            "final_attempt": True,
                            "error": str(e)
                        }
                    }
        
        # Should not reach here, but fallback
        return {
            "success": False,
            "error": "Exceeded maximum generation attempts",
            "courses": [],
            "reasoning": "Unable to generate valid recommendation.",
            "validation": {
                "is_valid": False,
                "overall_score": 0.0,
                "reasons": ["Exceeded maximum regeneration attempts"],
                "suggestions": ["Review validation thresholds"]
            }
        }
    
    async def _generate_courses_and_reasoning(self, query: str, user_skills: List[str], 
                                            target_skills: List[str], max_results: int, 
                                            attempt: int) -> Tuple[List[Dict[str, Any]], str]:
        """
        Generate courses and reasoning text
        
        Args:
            query: Search query
            user_skills: User's current skills
            target_skills: Target skills
            max_results: Maximum results
            attempt: Current generation attempt
            
        Returns:
            Tuple of (courses, reasoning)
        """
        # Search for relevant courses
        context_docs = await asyncio.to_thread(
            self.vector_store.similarity_search, query, k=max_results * 2
        )
        
        if not context_docs:
            return [], "No relevant courses found in the database."
        
        # Extract course information
        courses = await self._extract_course_information(context_docs, target_skills, max_results)
        
        # Generate reasoning
        reasoning = await self._generate_reasoning(
            user_skills, target_skills, courses, attempt
        )
        
        return courses, reasoning
    
    async def _extract_course_information(self, docs: List[Document], 
                                        target_skills: List[str], 
                                        max_results: int) -> List[Dict[str, Any]]:
        """Extract and structure course information from documents"""
        courses = []
        
        for doc in docs[:max_results]:
            metadata = doc.metadata
            
            # Get course highlights using LLM
            highlights = await self._get_course_highlights(metadata.get("url", ""), doc.page_content)
            
            # Match skills
            matched_skills = []
            for skill in target_skills:
                matched_skills.append({
                    "name": skill,
                    "matched": skill.lower() in doc.page_content.lower()
                })
            
            course_info = {
                "course_title": metadata.get("title", ""),
                "course_description": doc.page_content,
                "course_url": metadata.get("url", ""),
                "course_level": metadata.get("level", ""),
                "course_duration": metadata.get("duration", ""),
                "course_instructor": metadata.get("instructors", ""),
                "course_rating": metadata.get("rating", 0),
                "course_price": metadata.get("price", ""),
                "course_provider": metadata.get("provider", ""),
                "course_students": metadata.get("students", 0),
                "course_skills": matched_skills,
                "course_highlights": highlights,
                "target": str(int(time.time()))  # Current timestamp
            }
            
            courses.append(course_info)
        
        return courses
    
    async def _get_course_highlights(self, url: str, content: str) -> List[str]:
        """Get course highlights using LLM"""
        try:
            prompt = f"""
            Based on the following course information, extract 3-5 key highlights or learning outcomes:
            
            Course Content: {content[:500]}...
            
            Return as a JSON list of strings, for example:
            ["Learn Python fundamentals", "Build web applications", "Master data structures"]
            
            Focus on specific, actionable learning outcomes.
            """
            
            response = await asyncio.to_thread(self.llm.invoke, prompt)
            
            try:
                highlights = json.loads(response.content.strip())
                if isinstance(highlights, list):
                    return highlights[:5]  # Max 5 highlights
            except json.JSONDecodeError:
                pass
            
            # Fallback to simple extraction
            return ["Comprehensive course content", "Expert instruction", "Practical skills"]
            
        except Exception as e:
            self.logger.warning(f"Failed to extract highlights: {e}")
            return ["Course highlights not available"]
    
    async def _generate_reasoning(self, user_skills: List[str], target_skills: List[str], 
                                courses: List[Dict[str, Any]], attempt: int) -> str:
        """Generate reasoning for course recommendations"""
        try:
            # Adjust prompt based on attempt to improve validation
            improvement_note = ""
            if attempt > 1:
                improvement_note = """
                
                Focus on:
                - Being more specific and actionable
                - Clearly connecting recommendations to user needs
                - Using appropriate educational terminology
                - Ensuring completeness and clarity
                """
            
            prompt = f"""
            As an expert learning advisor, provide a clear and comprehensive explanation for these course recommendations.
            
            User's Current Skills: {', '.join(user_skills) if user_skills else 'Beginner level'}
            Target Skills to Learn: {', '.join(target_skills)}
            
            Recommended Courses:
            {self._format_courses_for_prompt(courses)}
            
            Provide a well-structured explanation that:
            1. Acknowledges the user's current skill level
            2. Explains how these courses align with their learning goals
            3. Highlights the progression and learning path
            4. Mentions key benefits and outcomes
            5. Provides actionable next steps
            
            Write in a professional, encouraging tone suitable for learners.
            Be specific about how each course contributes to their skill development.
            {improvement_note}
            """
            
            response = await asyncio.to_thread(self.llm.invoke, prompt)
            return response.content.strip()
            
        except Exception as e:
            self.logger.error(f"Failed to generate reasoning: {e}")
            return f"Based on your interest in {', '.join(target_skills)}, I've selected these courses to help you develop the necessary skills effectively."
    
    def _format_courses_for_prompt(self, courses: List[Dict[str, Any]]) -> str:
        """Format courses for LLM prompt"""
        formatted = []
        for i, course in enumerate(courses, 1):
            formatted.append(f"""
            Course {i}: {course['course_title']}
            - Level: {course['course_level']}
            - Duration: {course['course_duration']}
            - Provider: {course['course_provider']}
            - Description: {course['course_description'][:200]}...
            """)
        return "\n".join(formatted)
    
    def _build_recommendation_query(self, user_skills: List[str], target_skills: List[str]) -> str:
        """Build search query for course recommendations"""
        user_context = f"with background in {', '.join(user_skills)}" if user_skills else "for beginners"
        target_context = ', '.join(target_skills)
        
        return f"Find relevant courses for learning {target_context} {user_context}. Focus on practical, well-rated courses that provide clear learning outcomes."
    
    async def validate_existing_recommendation(self, query: str, response: str, 
                                             domain: str = "courses") -> Dict[str, Any]:
        """
        Validate an existing recommendation without regeneration
        
        Args:
            query: Original query
            response: Response to validate
            domain: Domain context
            
        Returns:
            Validation results
        """
        try:
            return await self.validator.validate_response(
                query=query,
                response=response,
                domain=domain,
                weights=self.config.get_weights()
            )
        except Exception as e:
            self.logger.error(f"Validation failed: {str(e)}")
            return {
                "is_valid": False,
                "overall_score": 0.0,
                "confidence_level": "failed",
                "failed_validations": ["all"],
                "reasons": [f"Validation error: {str(e)}"],
                "suggestions": ["Check validation system configuration"]
            }


def create_validated_course_agent(azure_config: Dict[str, str], 
                                vector_store: PGVector,
                                validation_mode: ValidationMode = ValidationMode.COMPREHENSIVE) -> ValidatedCourseAgent:
    """
    Factory function to create a validated course agent
    
    Args:
        azure_config: Azure OpenAI configuration
        vector_store: Vector store with course data
        validation_mode: Validation mode to use
        
    Returns:
        Configured ValidatedCourseAgent instance
    """
    validation_config = ValidationConfigManager.get_config(validation_mode)
    
    return ValidatedCourseAgent(
        azure_config=azure_config,
        vector_store=vector_store,
        validation_config=validation_config
    )
