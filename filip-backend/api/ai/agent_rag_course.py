import datetime
import json
import re
import logging
import asyncio
from typing import Dict, List, Any, Optional
import time

from langchain.agents import AgentType, Tool, initialize_agent
from langchain.chains import RetrievalQA
from langchain_openai import AzureChatOpenAI, AzureOpenAIEmbeddings
from langchain_postgres.vectorstores import PGVector

from filip import settings

# Import validation system
try:
    from .response_validation import ResponseValidator
    from .validated_course_agent import ValidatedCourseAgent, create_validated_course_agent
    from .validation_config import (
        ValidationConfigManager, ValidationMode, validation_metrics,
        get_validation_config_for_request, log_validation_result
    )
    VALIDATION_AVAILABLE = True
except ImportError as e:
    print(f"Validation system not available: {e}")
    VALIDATION_AVAILABLE = False

logger = logging.getLogger(__name__)

def get_retriever():
    # First try to connect to existing collection
    vectorstore = PGVector.from_existing_index(
        embedding=AzureOpenAIEmbeddings(
            openai_api_version=settings.AZURE_OPENAI_API_VERSION,
            azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
            api_key=settings.AZURE_OPENAI_EMBEDDING_API_KEY,
            model=settings.AZURE_OPENAI_EMBEDDING_MODEL,
        ),
        connection=settings.PGVECTOR_CONNECTION,
        collection_name="course",
    )
    
    return vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 5})


def build_rag_chain():
    retriever = get_retriever()
    llm = AzureChatOpenAI(
        model=settings.AZURE_OPENAI_CHAT_MODEL,
        openai_api_version=settings.AZURE_OPENAI_API_VERSION,
        azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
        api_key=settings.AZURE_OPENAI_CHAT_API_KEY,
        temperature=0,
    )
    return RetrievalQA.from_chain_type(
        llm=llm, retriever=retriever, return_source_documents=True
    )


def query_chain(query: str) -> dict:
    chain = build_rag_chain()
    return chain.invoke({"query": query})


def extract_learning_path_name(text: str) -> str:
    match = re.search(
        r"(?i)(learning path name|suggested path name|learning path could be)\s*[:\-]?\s*(.+)",
        text,
    )
    if match:
        return match.group(2).strip().strip('"').strip(".")
    return "Custom Learning Path"


def get_course_tool() -> Tool:
    rag_chain = build_rag_chain()

    def structured_course_lookup(input: str) -> dict:
        result = rag_chain.invoke({"query": input})
        courses = []
        for doc in result.get("source_documents", []):
            md = doc.metadata
            url = md.get("url", "")
            # Ask the LLM to extract details from the URL
            prompt = (
                f"Visit the following course page:\n{url}\n\n"
                "Extract and return these fields in JSON format:\n"
                "1. 'course_highlights': A bullet list from the 'What you'll learn' section\n"
                "2. 'related_topics': Broader topics or categories this course relates to\n\n"
                "Respond in this format: "
                '{"course_highlights": [...], "related_topics": [...]}'
            )
            scraper = AzureChatOpenAI(
                model=settings.AZURE_OPENAI_CHAT_MODEL,
                openai_api_version=settings.AZURE_OPENAI_API_VERSION,
                azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
                api_key=settings.AZURE_OPENAI_CHAT_API_KEY,
                temperature=0,
            )
            scraped = scraper.invoke(prompt).content
            try:
                if isinstance(scraped, str):
                    scraped_json = json.loads(scraped)
            except Exception as e:
                print(f"Error: {e}")
                scraped_json = {"course_highlights": [], "related_topics": []}

            courses.append(
                {
                    "course_rating": md.get("rating", 0),
                    "target": str(datetime.date.today()),
                    "course_level": md.get("level", ""),
                    "course_description": doc.page_content,
                    "course_title": md.get("title", ""),
                    "course_duration": md.get("duration", ""),
                    "course_instructor": md.get("instructors", ""),
                    "course_price": md.get("price", ""),
                    "course_url": url,
                    "course_skills": scraped_json["related_topics"],
                    "course_highlights": scraped_json["course_highlights"],
                    "course_provider": md.get("provider", "Udemy"),
                    "course_students": md.get("students", 0),
                }
            )
        learning_path_name = extract_learning_path_name(result.get("result", ""))
        recommendations = result.get("result")
        return {
            "learning_path_name": learning_path_name,
            "answer": recommendations,
            "courses": courses,
        }

    return Tool(
        name="StructuredCourseRecommender",
        func=structured_course_lookup,
        description="Use this to get internal courses with structured metadata to improve a specific skill. Returns structured metadata including title, URL, duration, and level.",
    )


def get_agent():
    tools = [get_course_tool()]
    llm = AzureChatOpenAI(
        model=settings.AZURE_OPENAI_CHAT_MODEL,
        openai_api_version=settings.AZURE_OPENAI_API_VERSION,
        azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
        api_key=settings.AZURE_OPENAI_CHAT_API_KEY,
        temperature=0,
    )
    return initialize_agent(
        tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
    )


def get_recommendations_for_skills(skills: list[dict]) -> dict:
    """
    Legacy course recommendation function without validation
    
    Args:
        skills: List of skill dictionaries with name/level information
        
    Returns:
        Dictionary containing recommendations and courses
    """
    try:
        logger.info(f"Getting legacy course recommendations for {len(skills)} skills")
        
        agent = get_agent()
        combined_query_parts = []
        skill_names = []

        for skill in skills:
            skill_name = skill.get("name") or skill.get("skill") or str(skill)
            level = skill.get("level", "general")
            combined_query_parts.append(f"'{skill_name}' ({level})")
            skill_names.append(skill_name.lower())

        combined_query = (
            "Given the following skills and levels: "
            + ", ".join(combined_query_parts)
            + ". Recommend the best internal courses to improve these skills, prioritizing relevance, appropriate level, and shorter durations. "
            "Also suggest a meaningful, concise name for the overall learning path."
        )

        # Get raw recommendations
        raw_result = agent.tools[0].func(combined_query)

        # Process skill matching
        for course in raw_result["courses"]:
            matched_skills = []
            for skill in course["course_skills"]:
                matched_skills.append(
                    {"name": skill, "matched": skill.lower() in skill_names}
                )
            course["course_skills"] = matched_skills

        # Return without validation
        return {
            "learning_path_name": raw_result["learning_path_name"],
            "recommendations": raw_result["answer"],
            "courses": raw_result["courses"],
            "validation": {
                "is_valid": True,
                "overall_score": 0.8,  # Default score for legacy mode
                "confidence_level": "medium",
                "failed_validations": [],
                "reasons": ["Legacy mode - validation not performed"],
                "suggestions": [],
                "validation_type": "legacy"
            }
        }
        
    except Exception as e:
        logger.error(f"Legacy course recommendation failed: {str(e)}")
        return {
            "learning_path_name": "Error in Recommendation",
            "recommendations": f"An error occurred while generating recommendations: {str(e)}",
            "courses": [],
            "validation": {
                "is_valid": False,
                "overall_score": 0.0,
                "confidence_level": "failed",
                "failed_validations": ["system"],
                "reasons": [f"System error: {str(e)}"],
                "suggestions": ["Please try again later"],
                "validation_type": "legacy_error"
            }
        }


def get_validated_recommendations_for_skills(skills: list[dict], 
                                           use_enhanced_validation: bool = True,
                                           validation_config: dict = None) -> dict:
    """
    Get course recommendations with comprehensive validation system
    
    Args:
        skills: List of skill dictionaries with name/level information
        use_enhanced_validation: Whether to use the enhanced validation agent
        validation_config: Custom validation configuration
        
    Returns:
        Dictionary containing recommendations, courses, and validation results
    """
    if not VALIDATION_AVAILABLE:
        logger.warning("Validation system not available, using legacy recommendations")
        return get_recommendations_for_skills(skills)
    
    try:
        start_time = time.time()
        logger.info(f"Getting validated course recommendations for {len(skills)} skills")
        
        # Prepare Azure configuration
        azure_config = {
            "azure_endpoint": settings.AZURE_OPENAI_ENDPOINT,
            "api_key": settings.AZURE_OPENAI_CHAT_API_KEY,
            "deployment_name": settings.AZURE_OPENAI_CHAT_MODEL,
            "embeddings_api_key": settings.AZURE_OPENAI_EMBEDDING_API_KEY,
            "embeddings_deployment": settings.AZURE_OPENAI_EMBEDDING_MODEL,
            "api_version": settings.AZURE_OPENAI_API_VERSION
        }
        
        # Get vector store
        vectorstore = PGVector.from_existing_index(
            embedding=AzureOpenAIEmbeddings(
                openai_api_version=settings.AZURE_OPENAI_API_VERSION,
                azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
                api_key=settings.AZURE_OPENAI_EMBEDDING_API_KEY,
                model=settings.AZURE_OPENAI_EMBEDDING_MODEL,
            ),
            connection=settings.PGVECTOR_CONNECTION,
            collection_name="course",
        )
        
        if use_enhanced_validation:
            # Use enhanced validation system
            return _run_enhanced_validation(skills, azure_config, vectorstore, validation_config)
        else:
            # Use simple validation system
            return _run_simple_validation(skills, azure_config, vectorstore, validation_config)
            
    except Exception as e:
        logger.error(f"Validated recommendations failed: {str(e)}")
        # Fallback to legacy system
        result = get_recommendations_for_skills(skills)
        result["validation"] = {
            "is_valid": False,
            "overall_score": 0.0,
            "confidence_level": "failed",
            "failed_validations": ["system"],
            "reasons": [f"Validation system error: {str(e)}"],
            "suggestions": ["Check validation system configuration"],
            "fallback_used": True
        }
        return result


def _run_enhanced_validation(skills: list[dict], azure_config: dict, 
                           vectorstore, validation_config: dict = None) -> dict:
    """Run enhanced validation with regeneration capabilities"""
    try:
        # Determine validation mode
        mode = ValidationMode.COMPREHENSIVE
        if validation_config:
            mode_str = validation_config.get("validation_mode", "comprehensive")
            try:
                mode = ValidationMode(mode_str.lower())
            except ValueError:
                logger.warning(f"Invalid validation mode: {mode_str}, using comprehensive")
        
        # Create validated agent
        validated_agent = create_validated_course_agent(azure_config, vectorstore, mode)
        
        # Extract skills
        user_skills = []
        target_skills = []
        
        for skill in skills:
            skill_name = skill.get("name") or skill.get("skill", "")
            skill_level = skill.get("level", "beginner")
            
            target_skills.append(skill_name)
            if skill_level not in ["beginner", "basic"]:
                user_skills.append(skill_name)
        
        # Get validated recommendations using async
        async def get_recommendations():
            return await validated_agent.get_course_recommendations(
                user_skills=user_skills,
                target_skills=target_skills,
                max_results=5
            )
        
        # Run async function
        result = asyncio.run(get_recommendations())
        
        # Format for API response
        if result.get("success", False):
            formatted_result = {
                "learning_path_name": _extract_learning_path_name(target_skills),
                "recommendations": result.get("reasoning", ""),
                "courses": result.get("courses", []),
                "validation": result.get("validation", {}),
                "enhanced_validation": True,
                "processing_metadata": result.get("processing_metadata", {})
            }
            
            # Log validation results
            validation = formatted_result.get("validation", {})
            config = ValidationConfigManager.get_config(mode)
            log_validation_result(validation, config)
            
            return formatted_result
        else:
            # Enhanced validation failed, fallback to simple
            logger.warning("Enhanced validation failed, falling back to simple validation")
            return _run_simple_validation(skills, azure_config, vectorstore, validation_config)
            
    except Exception as e:
        logger.error(f"Enhanced validation failed: {str(e)}")
        # Fallback to simple validation
        return _run_simple_validation(skills, azure_config, vectorstore, validation_config)


def _run_simple_validation(skills: list[dict], azure_config: dict, 
                         vectorstore, validation_config: dict = None) -> dict:
    """Run simple validation without regeneration"""
    try:
        # Get basic recommendations first
        agent = get_agent()
        combined_query_parts = []
        skill_names = []

        for skill in skills:
            skill_name = skill.get("name") or skill.get("skill") or str(skill)
            level = skill.get("level", "general")
            combined_query_parts.append(f"'{skill_name}' ({level})")
            skill_names.append(skill_name.lower())

        combined_query = (
            "Given the following skills and levels: "
            + ", ".join(combined_query_parts)
            + ". Recommend the best internal courses to improve these skills, prioritizing relevance, appropriate level, and shorter durations. "
            "Also suggest a meaningful, concise name for the overall learning path."
        )

        # Get raw recommendations
        raw_result = agent.tools[0].func(combined_query)

        # Process skill matching
        for course in raw_result["courses"]:
            matched_skills = []
            for skill in course["course_skills"]:
                matched_skills.append(
                    {"name": skill, "matched": skill.lower() in skill_names}
                )
            course["course_skills"] = matched_skills

        # Run simple validation on the response
        validation_result = _simple_validate_response(
            combined_query, raw_result["answer"], azure_config, vectorstore
        )

        # Prepare result
        base_result = {
            "learning_path_name": raw_result["learning_path_name"],
            "recommendations": raw_result["answer"],
            "courses": raw_result["courses"],
            "validation": validation_result,
            "enhanced_validation": False
        }

        # Log validation results
        if validation_config:
            mode_str = validation_config.get("validation_mode", "comprehensive")
            try:
                mode = ValidationMode(mode_str.lower())
                config = ValidationConfigManager.get_config(mode)
                log_validation_result(validation_result, config)
            except ValueError:
                pass

        return base_result

    except Exception as e:
        logger.error(f"Simple validation failed: {str(e)}")
        # Final fallback to legacy system
        result = get_recommendations_for_skills(skills)
        result["validation"] = {
            "is_valid": False,
            "overall_score": 0.0,
            "confidence_level": "failed",
            "failed_validations": ["all"],
            "reasons": [f"Simple validation error: {str(e)}"],
            "suggestions": ["Check system configuration"],
            "fallback_used": True
        }
        return result


def _simple_validate_response(query: str, response: str, azure_config: dict, 
                            vectorstore) -> dict:
    """Simple validation without async operations"""
    try:
        # Initialize components
        embeddings = AzureOpenAIEmbeddings(
            openai_api_version=azure_config["api_version"],
            azure_endpoint=azure_config["azure_endpoint"],
            api_key=azure_config["embeddings_api_key"],
            model=azure_config["embeddings_deployment"],
        )
        
        llm = AzureChatOpenAI(
            model=azure_config["deployment_name"],
            openai_api_version=azure_config["api_version"],
            azure_endpoint=azure_config["azure_endpoint"],
            api_key=azure_config["api_key"],
            temperature=0,
        )
        
        # Get embeddings for semantic similarity
        query_embedding = embeddings.embed_query(query)
        response_embedding = embeddings.embed_query(response)
        
        # Calculate cosine similarity
        def cosine_similarity(vec1, vec2):
            dot_product = sum(a * b for a, b in zip(vec1, vec2))
            magnitude1 = sum(a * a for a in vec1) ** 0.5
            magnitude2 = sum(b * b for b in vec2) ** 0.5
            if magnitude1 == 0 or magnitude2 == 0:
                return 0.0
            return dot_product / (magnitude1 * magnitude2)
        
        semantic_score = cosine_similarity(query_embedding, response_embedding)
        
        # Simple quality assessment using LLM
        quality_prompt = f"""
        Rate the quality of this course recommendation response from 0.0 to 1.0.
        
        Query: {query}
        Response: {response}
        
        Consider clarity, relevance, and usefulness.
        Respond with only a number between 0.0 and 1.0.
        """
        
        try:
            quality_response = llm.invoke(quality_prompt).content.strip()
            quality_score = float(quality_response)
            quality_score = max(0.0, min(1.0, quality_score))
        except (ValueError, TypeError):
            quality_score = 0.7  # Default score
        
        # Calculate overall score
        overall_score = (semantic_score * 0.4 + quality_score * 0.6)
        
        # Determine validation status
        is_valid = overall_score >= 0.60
        
        # Generate confidence level
        if overall_score >= 0.85:
            confidence = "high"
        elif overall_score >= 0.70:
            confidence = "medium"
        elif overall_score >= 0.55:
            confidence = "low"
        else:
            confidence = "failed"
        
        # Generate reasons and suggestions
        reasons = []
        suggestions = []
        failed_validations = []
        
        if semantic_score >= 0.70:
            reasons.append(f"[SEMANTIC] Good semantic relevance (score: {semantic_score:.3f})")
        else:
            reasons.append(f"[SEMANTIC] Low semantic relevance (score: {semantic_score:.3f})")
            failed_validations.append("semantic")
            suggestions.append("Improve response relevance to the query")
        
        if quality_score >= 0.70:
            reasons.append(f"[QUALITY] Good response quality (score: {quality_score:.3f})")
        else:
            reasons.append(f"[QUALITY] Response quality needs improvement (score: {quality_score:.3f})")
            failed_validations.append("quality")
            suggestions.append("Enhance response clarity and completeness")
        
        return {
            "is_valid": is_valid,
            "overall_score": overall_score,
            "confidence_level": confidence,
            "failed_validations": failed_validations,
            "reasons": reasons,
            "suggestions": suggestions,
            "validation_type": "simple",
            "individual_results": {
                "semantic": {
                    "is_valid": semantic_score >= 0.55,
                    "score": semantic_score,
                    "confidence_level": "high" if semantic_score >= 0.85 else "medium" if semantic_score >= 0.70 else "low"
                },
                "quality": {
                    "is_valid": quality_score >= 0.55,
                    "score": quality_score,
                    "confidence_level": "high" if quality_score >= 0.85 else "medium" if quality_score >= 0.70 else "low"
                }
            }
        }
        
    except Exception as e:
        logger.error(f"Simple validation failed: {str(e)}")
        return {
            "is_valid": False,
            "overall_score": 0.0,
            "confidence_level": "failed",
            "failed_validations": ["all"],
            "reasons": [f"Validation error: {str(e)}"],
            "suggestions": ["Check validation configuration"],
            "validation_type": "simple_error"
        }


def _extract_learning_path_name(target_skills: List[str]) -> str:
    """Generate a learning path name from target skills"""
    if not target_skills:
        return "Custom Learning Path"
    
    if len(target_skills) == 1:
        return f"{target_skills[0]} Learning Path"
    elif len(target_skills) == 2:
        return f"{target_skills[0]} & {target_skills[1]} Learning Path"
    else:
        return f"{target_skills[0]} & {len(target_skills)-1} More Skills Learning Path"
    agent = get_agent()
    combined_query_parts = []
    skill_names = []

    for skill in skills:
        skill_name = skill.get("name") or skill.get("skill") or str(skill)
        level = skill.get("level", "general")
        combined_query_parts.append(f"'{skill_name}' ({level})")
        skill_names.append(skill_name.lower())

    combined_query = (
        "Given the following skills and levels: "
        + ", ".join(combined_query_parts)
        + ". Recommend the best internal courses to improve these skills, prioritizing relevance, appropriate level, and shorter durations. "
        "Also suggest a meaningful, concise name for the overall learning path."
    )

    raw_result = agent.tools[0].func(combined_query)

    for course in raw_result["courses"]:
        matched_skills = []
        for skill in course["course_skills"]:
            matched_skills.append(
                {"name": skill, "matched": skill.lower() in skill_names}
            )
        course["course_skills"] = matched_skills

    return {
        "learning_path_name": raw_result["learning_path_name"],
        "recommendations": raw_result["answer"],
        "courses": raw_result["courses"],
    }
