"""
LLM Response Relevance Validation System

A comprehensive quality assurance framework for evaluating AI-generated responses
with multi-layer validation including semantic relevance, contextual accuracy,
domain-specific validation, and quality assessment.
"""

import logging
import asyncio
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import time
import json

from langchain_openai import AzureChatOpenAI, AzureOpenAIEmbeddings
from langchain_postgres.vectorstores import PGVector
from langchain.schema import Document

logger = logging.getLogger(__name__)


class ConfidenceLevel(Enum):
    """Confidence levels for validation results"""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    FAILED = "failed"


@dataclass
class ValidationResult:
    """Result of a validation operation"""
    is_valid: bool
    score: float  # 0.0 to 1.0
    confidence_level: ConfidenceLevel
    reasons: List[str]
    suggestions: List[str]
    metadata: Dict[str, Any] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for API responses"""
        return {
            "is_valid": self.is_valid,
            "score": self.score,
            "confidence_level": self.confidence_level.value,
            "reasons": self.reasons,
            "suggestions": self.suggestions,
            "metadata": self.metadata or {}
        }


class BaseValidator:
    """Base class for all validators"""
    
    def __init__(self, name: str):
        self.name = name
        self.logger = logging.getLogger(f"{__name__}.{name}")
    
    async def validate(self, query: str, response: str, **kwargs) -> ValidationResult:
        """Validate a response against a query"""
        raise NotImplementedError("Subclasses must implement validate method")
    
    def _calculate_confidence_level(self, score: float) -> ConfidenceLevel:
        """Calculate confidence level based on score"""
        if score >= 0.85:
            return ConfidenceLevel.HIGH
        elif score >= 0.70:
            return ConfidenceLevel.MEDIUM
        elif score >= 0.55:
            return ConfidenceLevel.LOW
        else:
            return ConfidenceLevel.FAILED


class SemanticRelevanceValidator(BaseValidator):
    """Validates semantic similarity between query and response"""
    
    def __init__(self, embeddings_model: AzureOpenAIEmbeddings):
        super().__init__("SemanticRelevance")
        self.embeddings = embeddings_model
    
    async def validate(self, query: str, response: str, **kwargs) -> ValidationResult:
        """Validate semantic relevance using embedding similarity"""
        try:
            start_time = time.time()
            
            # Get embeddings for query and response
            query_embedding = await asyncio.to_thread(
                self.embeddings.embed_query, query
            )
            response_embedding = await asyncio.to_thread(
                self.embeddings.embed_query, response
            )
            
            # Calculate cosine similarity
            similarity_score = self._cosine_similarity(query_embedding, response_embedding)
            
            # Determine validation result
            is_valid = similarity_score >= 0.55
            confidence_level = self._calculate_confidence_level(similarity_score)
            
            # Generate reasons and suggestions
            reasons = self._generate_reasons(similarity_score, confidence_level)
            suggestions = self._generate_suggestions(similarity_score)
            
            duration = time.time() - start_time
            
            return ValidationResult(
                is_valid=is_valid,
                score=similarity_score,
                confidence_level=confidence_level,
                reasons=reasons,
                suggestions=suggestions,
                metadata={
                    "validator": self.name,
                    "duration_seconds": duration,
                    "similarity_score": similarity_score
                }
            )
            
        except Exception as e:
            self.logger.error(f"Semantic validation failed: {str(e)}")
            return ValidationResult(
                is_valid=False,
                score=0.0,
                confidence_level=ConfidenceLevel.FAILED,
                reasons=[f"Semantic validation error: {str(e)}"],
                suggestions=["Check embedding model configuration"],
                metadata={"error": str(e)}
            )
    
    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors"""
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        magnitude1 = sum(a * a for a in vec1) ** 0.5
        magnitude2 = sum(b * b for b in vec2) ** 0.5
        
        if magnitude1 == 0 or magnitude2 == 0:
            return 0.0
        
        return max(0.0, min(1.0, dot_product / (magnitude1 * magnitude2)))
    
    def _generate_reasons(self, score: float, confidence: ConfidenceLevel) -> List[str]:
        """Generate explanation reasons based on score"""
        if confidence == ConfidenceLevel.HIGH:
            return [f"[SEMANTIC] High semantic similarity between query and response (score: {score:.3f})"]
        elif confidence == ConfidenceLevel.MEDIUM:
            return [f"[SEMANTIC] Moderate semantic similarity between query and response (score: {score:.3f})"]
        elif confidence == ConfidenceLevel.LOW:
            return [f"[SEMANTIC] Low semantic similarity between query and response (score: {score:.3f})"]
        else:
            return [f"[SEMANTIC] Very low semantic similarity between query and response (score: {score:.3f})"]
    
    def _generate_suggestions(self, score: float) -> List[str]:
        """Generate improvement suggestions based on score"""
        if score < 0.55:
            return [
                "Ensure response directly addresses the user's query",
                "Include key terms from the original question",
                "Focus on the specific domain requested"
            ]
        elif score < 0.70:
            return [
                "Consider using more specific terminology from the query",
                "Ensure response covers all aspects of the question"
            ]
        return []


class ContextualAccuracyValidator(BaseValidator):
    """Validates response accuracy against knowledge base context"""
    
    def __init__(self, llm: AzureChatOpenAI, vector_store: PGVector):
        super().__init__("ContextualAccuracy")
        self.llm = llm
        self.vector_store = vector_store
    
    async def validate(self, query: str, response: str, context_docs: List[Document] = None, **kwargs) -> ValidationResult:
        """Validate contextual accuracy using LLM assessment"""
        try:
            start_time = time.time()
            
            # Get context documents if not provided
            if context_docs is None:
                context_docs = await asyncio.to_thread(
                    self.vector_store.similarity_search, query, k=5
                )
            
            # Prepare context text
            context_text = "\n\n".join([
                f"Source {i+1}: {doc.page_content}" 
                for i, doc in enumerate(context_docs[:3])
            ])
            
            # Create validation prompt
            validation_prompt = f"""
            Evaluate the accuracy of the following response against the provided context.
            
            Query: {query}
            
            Response to evaluate: {response}
            
            Context from knowledge base:
            {context_text}
            
            Rate the accuracy from 0.0 to 1.0 based on:
            1. Factual correctness against the context
            2. Consistency with knowledge base information
            3. Absence of contradictions
            
            Respond with only a JSON object:
            {{
                "accuracy_score": <float between 0.0 and 1.0>,
                "factual_issues": [<list of any factual problems>],
                "consistency_rating": <float between 0.0 and 1.0>
            }}
            """
            
            # Get LLM assessment
            llm_response = await asyncio.to_thread(
                self.llm.invoke, validation_prompt
            )
            
            # Parse LLM response
            assessment = self._parse_llm_response(llm_response.content)
            accuracy_score = assessment.get("accuracy_score", 0.5)
            factual_issues = assessment.get("factual_issues", [])
            
            # Determine validation result
            is_valid = accuracy_score >= 0.60
            confidence_level = self._calculate_confidence_level(accuracy_score)
            
            # Generate reasons and suggestions
            reasons = self._generate_reasons(accuracy_score, factual_issues, confidence_level)
            suggestions = self._generate_suggestions(accuracy_score, factual_issues)
            
            duration = time.time() - start_time
            
            return ValidationResult(
                is_valid=is_valid,
                score=accuracy_score,
                confidence_level=confidence_level,
                reasons=reasons,
                suggestions=suggestions,
                metadata={
                    "validator": self.name,
                    "duration_seconds": duration,
                    "factual_issues": factual_issues,
                    "context_docs_count": len(context_docs)
                }
            )
            
        except Exception as e:
            self.logger.error(f"Contextual validation failed: {str(e)}")
            return ValidationResult(
                is_valid=False,
                score=0.0,
                confidence_level=ConfidenceLevel.FAILED,
                reasons=[f"Contextual validation error: {str(e)}"],
                suggestions=["Check LLM and vector store configuration"],
                metadata={"error": str(e)}
            )
    
    def _parse_llm_response(self, response: str) -> Dict[str, Any]:
        """Parse LLM JSON response safely"""
        try:
            # Clean response and parse JSON
            cleaned = response.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            
            return json.loads(cleaned)
        except Exception as e:
            self.logger.warning(f"Failed to parse LLM response: {e}")
            return {
                "accuracy_score": 0.5,
                "factual_issues": ["Unable to parse validation response"],
                "consistency_rating": 0.5
            }
    
    def _generate_reasons(self, score: float, issues: List[str], confidence: ConfidenceLevel) -> List[str]:
        """Generate explanation reasons"""
        reasons = []
        
        if confidence == ConfidenceLevel.HIGH:
            reasons.append(f"[CONTEXTUAL] High contextual accuracy: Response well-grounded in course data (score: {score:.3f})")
        elif confidence == ConfidenceLevel.MEDIUM:
            reasons.append(f"[CONTEXTUAL] Moderate contextual accuracy with minor issues (score: {score:.3f})")
        elif confidence == ConfidenceLevel.LOW:
            reasons.append(f"[CONTEXTUAL] Low contextual accuracy with several issues (score: {score:.3f})")
        else:
            reasons.append(f"[CONTEXTUAL] Poor contextual accuracy with significant issues (score: {score:.3f})")
        
        if issues:
            reasons.extend([f"[CONTEXTUAL] Issue: {issue}" for issue in issues[:2]])
        
        return reasons
    
    def _generate_suggestions(self, score: float, issues: List[str]) -> List[str]:
        """Generate improvement suggestions"""
        suggestions = []
        
        if score < 0.60:
            suggestions.extend([
                "Verify information against knowledge base",
                "Remove any unsupported claims",
                "Cross-reference with authoritative sources"
            ])
        
        if issues:
            suggestions.append("Address factual inconsistencies identified")
        
        return suggestions


class DomainSpecificValidator(BaseValidator):
    """Validates domain-specific terminology and relevance"""
    
    def __init__(self, llm: AzureChatOpenAI):
        super().__init__("DomainSpecific")
        self.llm = llm
        self.domain_keywords = {
            "courses": [
                "course", "lesson", "module", "curriculum", "instructor", 
                "enrollment", "certificate", "learning", "skill", "training"
            ],
            "skills": [
                "skill", "competency", "proficiency", "expertise", "knowledge",
                "ability", "talent", "capability", "experience", "mastery"
            ]
        }
    
    async def validate(self, query: str, response: str, domain: str = "courses", **kwargs) -> ValidationResult:
        """Validate domain-specific appropriateness"""
        try:
            start_time = time.time()
            
            # Keyword-based assessment
            keyword_score = self._assess_keyword_presence(response, domain)
            
            # LLM-based domain assessment
            llm_score = await self._assess_domain_appropriateness(query, response, domain)
            
            # Combined score
            overall_score = (keyword_score * 0.3 + llm_score * 0.7)
            
            # Determine validation result
            is_valid = overall_score >= 0.65
            confidence_level = self._calculate_confidence_level(overall_score)
            
            # Generate reasons and suggestions
            reasons = self._generate_reasons(overall_score, keyword_score, llm_score, domain, confidence_level)
            suggestions = self._generate_suggestions(overall_score, domain)
            
            duration = time.time() - start_time
            
            return ValidationResult(
                is_valid=is_valid,
                score=overall_score,
                confidence_level=confidence_level,
                reasons=reasons,
                suggestions=suggestions,
                metadata={
                    "validator": self.name,
                    "duration_seconds": duration,
                    "domain": domain,
                    "keyword_score": keyword_score,
                    "llm_score": llm_score
                }
            )
            
        except Exception as e:
            self.logger.error(f"Domain validation failed: {str(e)}")
            return ValidationResult(
                is_valid=False,
                score=0.0,
                confidence_level=ConfidenceLevel.FAILED,
                reasons=[f"Domain validation error: {str(e)}"],
                suggestions=["Check domain configuration"],
                metadata={"error": str(e)}
            )
    
    def _assess_keyword_presence(self, response: str, domain: str) -> float:
        """Assess presence of domain-specific keywords"""
        keywords = self.domain_keywords.get(domain, [])
        if not keywords:
            return 0.8  # Default score for unknown domains
        
        response_lower = response.lower()
        present_keywords = [kw for kw in keywords if kw in response_lower]
        
        return min(1.0, len(present_keywords) / max(1, len(keywords) * 0.3))
    
    async def _assess_domain_appropriateness(self, query: str, response: str, domain: str) -> float:
        """Use LLM to assess domain appropriateness"""
        try:
            prompt = f"""
            Evaluate how well the following response is appropriate for the {domain} domain.
            
            Query: {query}
            Response: {response}
            Domain: {domain}
            
            Rate from 0.0 to 1.0 based on:
            1. Use of appropriate terminology for {domain}
            2. Relevance to {domain} context
            3. Professional tone suitable for {domain}
            
            Respond with only a number between 0.0 and 1.0.
            """
            
            llm_response = await asyncio.to_thread(self.llm.invoke, prompt)
            score_text = llm_response.content.strip()
            
            try:
                return max(0.0, min(1.0, float(score_text)))
            except ValueError:
                return 0.6  # Default if parsing fails
                
        except Exception:
            return 0.6  # Default on error
    
    def _generate_reasons(self, score: float, keyword_score: float, llm_score: float, 
                         domain: str, confidence: ConfidenceLevel) -> List[str]:
        """Generate explanation reasons"""
        if confidence == ConfidenceLevel.HIGH:
            return [f"[DOMAIN] Response contains appropriate {domain}-related information (score: {score:.3f})"]
        elif confidence == ConfidenceLevel.MEDIUM:
            reasons = [f"[DOMAIN] Response partially appropriate for {domain} domain (score: {score:.3f})"]
            if keyword_score < 0.5:
                reasons.append(f"[DOMAIN] Limited use of {domain}-specific terminology")
            return reasons
        else:
            reasons = [f"[DOMAIN] Response lacks {domain}-specific appropriateness (score: {score:.3f})"]
            if keyword_score < 0.3:
                reasons.append(f"[DOMAIN] Missing {domain}-specific terminology")
            if llm_score < 0.5:
                reasons.append(f"[DOMAIN] Content not well-suited for {domain} context")
            return reasons
    
    def _generate_suggestions(self, score: float, domain: str) -> List[str]:
        """Generate improvement suggestions"""
        if score < 0.65:
            return [
                f"Include more {domain}-specific terminology",
                f"Focus on {domain}-relevant aspects",
                f"Use professional tone appropriate for {domain} context"
            ]
        return []


class QualityAssessmentValidator(BaseValidator):
    """Validates overall response quality and completeness"""
    
    def __init__(self, llm: AzureChatOpenAI):
        super().__init__("QualityAssessment")
        self.llm = llm
    
    async def validate(self, query: str, response: str, **kwargs) -> ValidationResult:
        """Validate response quality across multiple dimensions"""
        try:
            start_time = time.time()
            
            # Assess different quality dimensions
            completeness_score = await self._assess_completeness(query, response)
            clarity_score = await self._assess_clarity(response)
            actionability_score = await self._assess_actionability(query, response)
            length_score = self._assess_length_appropriateness(response)
            
            # Weighted average
            overall_score = (
                completeness_score * 0.35 +
                clarity_score * 0.25 +
                actionability_score * 0.25 +
                length_score * 0.15
            )
            
            # Determine validation result
            is_valid = overall_score >= 0.65
            confidence_level = self._calculate_confidence_level(overall_score)
            
            # Generate reasons and suggestions
            reasons = self._generate_reasons(
                overall_score, completeness_score, clarity_score, 
                actionability_score, length_score, confidence_level
            )
            suggestions = self._generate_suggestions(
                completeness_score, clarity_score, actionability_score, length_score
            )
            
            duration = time.time() - start_time
            
            return ValidationResult(
                is_valid=is_valid,
                score=overall_score,
                confidence_level=confidence_level,
                reasons=reasons,
                suggestions=suggestions,
                metadata={
                    "validator": self.name,
                    "duration_seconds": duration,
                    "completeness_score": completeness_score,
                    "clarity_score": clarity_score,
                    "actionability_score": actionability_score,
                    "length_score": length_score
                }
            )
            
        except Exception as e:
            self.logger.error(f"Quality validation failed: {str(e)}")
            return ValidationResult(
                is_valid=False,
                score=0.0,
                confidence_level=ConfidenceLevel.FAILED,
                reasons=[f"Quality validation error: {str(e)}"],
                suggestions=["Check quality assessment configuration"],
                metadata={"error": str(e)}
            )
    
    async def _assess_completeness(self, query: str, response: str) -> float:
        """Assess if response completely addresses the query"""
        try:
            prompt = f"""
            Rate how completely the response addresses the query from 0.0 to 1.0.
            
            Query: {query}
            Response: {response}
            
            Consider:
            - Does it answer all parts of the question?
            - Are key aspects covered?
            - Is anything important missing?
            
            Respond with only a number between 0.0 and 1.0.
            """
            
            llm_response = await asyncio.to_thread(self.llm.invoke, prompt)
            try:
                return max(0.0, min(1.0, float(llm_response.content.strip())))
            except ValueError:
                return 0.7
        except Exception:
            return 0.7
    
    async def _assess_clarity(self, response: str) -> float:
        """Assess clarity and readability of response"""
        try:
            prompt = f"""
            Rate the clarity and readability of this response from 0.0 to 1.0.
            
            Response: {response}
            
            Consider:
            - Is the language clear and easy to understand?
            - Is the structure logical?
            - Are explanations well-organized?
            
            Respond with only a number between 0.0 and 1.0.
            """
            
            llm_response = await asyncio.to_thread(self.llm.invoke, prompt)
            try:
                return max(0.0, min(1.0, float(llm_response.content.strip())))
            except ValueError:
                return 0.7
        except Exception:
            return 0.7
    
    async def _assess_actionability(self, query: str, response: str) -> float:
        """Assess if response provides actionable guidance"""
        try:
            prompt = f"""
            Rate how actionable this response is from 0.0 to 1.0.
            
            Query: {query}
            Response: {response}
            
            Consider:
            - Does it provide specific, actionable recommendations?
            - Can the user take concrete steps based on this?
            - Are there clear next steps?
            
            Respond with only a number between 0.0 and 1.0.
            """
            
            llm_response = await asyncio.to_thread(self.llm.invoke, prompt)
            try:
                return max(0.0, min(1.0, float(llm_response.content.strip())))
            except ValueError:
                return 0.7
        except Exception:
            return 0.7
    
    def _assess_length_appropriateness(self, response: str) -> float:
        """Assess if response length is appropriate"""
        length = len(response)
        
        if 100 <= length <= 800:
            return 1.0  # Ideal length
        elif 50 <= length < 100 or 800 < length <= 1500:
            return 0.8  # Acceptable
        elif 20 <= length < 50 or 1500 < length <= 3000:
            return 0.6  # Suboptimal
        else:
            return 0.3  # Too short or too long
    
    def _generate_reasons(self, overall_score: float, completeness: float, clarity: float, 
                         actionability: float, length: float, confidence: ConfidenceLevel) -> List[str]:
        """Generate explanation reasons"""
        reasons = []
        
        if confidence == ConfidenceLevel.HIGH:
            reasons.append(f"[QUALITY] High quality response with good completeness and clarity (score: {overall_score:.3f})")
        elif confidence == ConfidenceLevel.MEDIUM:
            reasons.append(f"[QUALITY] Moderate quality response with some areas for improvement (score: {overall_score:.3f})")
        else:
            reasons.append(f"[QUALITY] Response quality below acceptable threshold (score: {overall_score:.3f})")
        
        # Add specific issues
        if completeness < 0.6:
            reasons.append("[QUALITY] Response incompletely addresses the query")
        if clarity < 0.6:
            reasons.append("[QUALITY] Response lacks clarity or organization")
        if actionability < 0.6:
            reasons.append("[QUALITY] Response provides limited actionable guidance")
        if length < 0.6:
            reasons.append("[QUALITY] Response length is inappropriate")
        
        return reasons
    
    def _generate_suggestions(self, completeness: float, clarity: float, 
                           actionability: float, length: float) -> List[str]:
        """Generate improvement suggestions"""
        suggestions = []
        
        if completeness < 0.6:
            suggestions.append("Ensure all aspects of the query are addressed")
        if clarity < 0.6:
            suggestions.append("Improve organization and clarity of explanations")
        if actionability < 0.6:
            suggestions.append("Provide more specific, actionable recommendations")
        if length < 0.6:
            suggestions.append("Adjust response length to be more appropriate")
        
        return suggestions


class ResponseValidator:
    """Main validator orchestrating all validation components"""
    
    def __init__(self, embeddings_model: AzureOpenAIEmbeddings, 
                 llm: AzureChatOpenAI, vector_store: PGVector):
        self.embeddings = embeddings_model
        self.llm = llm
        self.vector_store = vector_store
        
        # Initialize validators
        self.semantic_validator = SemanticRelevanceValidator(embeddings_model)
        self.contextual_validator = ContextualAccuracyValidator(llm, vector_store)
        self.domain_validator = DomainSpecificValidator(llm)
        self.quality_validator = QualityAssessmentValidator(llm)
        
        self.logger = logging.getLogger(__name__)
    
    async def validate_response(self, query: str, response: str, domain: str = "courses", 
                              context_docs: List[Document] = None, 
                              weights: Dict[str, float] = None) -> Dict[str, Any]:
        """
        Perform comprehensive validation of a response
        
        Args:
            query: Original user query
            response: Generated response to validate
            domain: Domain context (courses, skills, general)
            context_docs: Context documents from vector search
            weights: Custom weights for different validators
        
        Returns:
            Comprehensive validation results
        """
        start_time = time.time()
        
        # Default weights
        if weights is None:
            weights = {
                "semantic": 0.25,
                "contextual": 0.30,
                "domain": 0.20,
                "quality": 0.25
            }
        
        try:
            # Run all validators in parallel
            semantic_task = self.semantic_validator.validate(query, response)
            contextual_task = self.contextual_validator.validate(
                query, response, context_docs=context_docs
            )
            domain_task = self.domain_validator.validate(query, response, domain=domain)
            quality_task = self.quality_validator.validate(query, response)
            
            # Await all results
            semantic_result = await semantic_task
            contextual_result = await contextual_task
            domain_result = await domain_task
            quality_result = await quality_task
            
            # Calculate overall score
            overall_score = (
                semantic_result.score * weights["semantic"] +
                contextual_result.score * weights["contextual"] +
                domain_result.score * weights["domain"] +
                quality_result.score * weights["quality"]
            )
            
            # Determine overall validation status
            is_valid = overall_score >= 0.60
            overall_confidence = self._calculate_overall_confidence(overall_score)
            
            # Collect all reasons and suggestions
            all_reasons = []
            all_suggestions = []
            failed_validations = []
            
            for name, result in [
                ("semantic", semantic_result),
                ("contextual", contextual_result),
                ("domain", domain_result),
                ("quality", quality_result)
            ]:
                all_reasons.extend(result.reasons)
                all_suggestions.extend(result.suggestions)
                if not result.is_valid:
                    failed_validations.append(name)
            
            # Remove duplicates while preserving order
            all_suggestions = list(dict.fromkeys(all_suggestions))
            
            duration = time.time() - start_time
            
            return {
                "is_valid": is_valid,
                "overall_score": overall_score,
                "confidence_level": overall_confidence.value,
                "failed_validations": failed_validations,
                "reasons": all_reasons,
                "suggestions": all_suggestions,
                "individual_results": {
                    "semantic": semantic_result.to_dict(),
                    "contextual": contextual_result.to_dict(),
                    "domain": domain_result.to_dict(),
                    "quality": quality_result.to_dict()
                },
                "validation_metadata": {
                    "query_length": len(query),
                    "response_length": len(response),
                    "domain": domain,
                    "weights": weights,
                    "duration_seconds": duration,
                    "timestamp": time.time()
                }
            }
            
        except Exception as e:
            self.logger.error(f"Validation orchestration failed: {str(e)}")
            return {
                "is_valid": False,
                "overall_score": 0.0,
                "confidence_level": ConfidenceLevel.FAILED.value,
                "failed_validations": ["all"],
                "reasons": [f"Validation system error: {str(e)}"],
                "suggestions": ["Check validation system configuration"],
                "individual_results": {},
                "validation_metadata": {
                    "error": str(e),
                    "duration_seconds": time.time() - start_time
                }
            }
    
    def _calculate_overall_confidence(self, score: float) -> ConfidenceLevel:
        """Calculate overall confidence level"""
        if score >= 0.85:
            return ConfidenceLevel.HIGH
        elif score >= 0.70:
            return ConfidenceLevel.MEDIUM
        elif score >= 0.55:
            return ConfidenceLevel.LOW
        else:
            return ConfidenceLevel.FAILED
    
    def should_regenerate_response(self, validation_result: Dict[str, Any]) -> bool:
        """Determine if response should be regenerated based on validation"""
        return (
            not validation_result.get("is_valid", False) or
            validation_result.get("overall_score", 0) < 0.50 or
            len(validation_result.get("failed_validations", [])) >= 3
        )
    
    def get_improvement_suggestions(self, validation_result: Dict[str, Any]) -> List[str]:
        """Get prioritized improvement suggestions"""
        suggestions = validation_result.get("suggestions", [])
        failed_validations = validation_result.get("failed_validations", [])
        
        # Add high-priority suggestions based on failed validations
        priority_suggestions = []
        if "semantic" in failed_validations:
            priority_suggestions.append("Improve response relevance to the original query")
        if "contextual" in failed_validations:
            priority_suggestions.append("Verify information against knowledge base")
        if "domain" in failed_validations:
            priority_suggestions.append("Use more domain-appropriate terminology")
        if "quality" in failed_validations:
            priority_suggestions.append("Enhance response completeness and clarity")
        
        return priority_suggestions + suggestions[:3]  # Top 3 additional suggestions
