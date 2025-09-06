# recommendations_view.py

import logging
from drf_spectacular.utils import extend_schema
from rest_framework.decorators import api_view
from rest_framework.response import Response

from api.ai.agent_rag_course import get_recommendations_for_skills, get_validated_recommendations_for_skills
from api.serializers.recommendation_request_serializer import (
    RecommendationRequestSerializer,
)
from api.serializers.recommendation_response_serializer import (
    RecommendationResponseSerializer,
)

logger = logging.getLogger(__name__)


@extend_schema(
    request=RecommendationRequestSerializer,
    responses={200: RecommendationResponseSerializer},
    summary="Recommend internal courses for given skills",
    description="Returns top internal courses based on skills and proficiency levels with optional validation.",
)
@api_view(["POST"])
def recommend_courses(request):
    logger.info(f"Course recommendation request started - IP: {request.META.get('REMOTE_ADDR')}")
    logger.debug(f"Request data: {request.data}")
    
    skills = request.data.get("skills", [])
    use_validation = request.data.get("use_validation", True)  # Enable validation by default
    validation_mode = request.data.get("validation_mode", "comprehensive")
    
    if not skills:
        logger.warning("Course recommendation request failed: No skills provided")
        return Response({"error": "No skills provided"}, status=400)

    logger.info(f"Processing course recommendations for {len(skills)} skills (validation: {use_validation})")
    
    try:
        # Use enhanced validation system if requested
        if use_validation:
            validation_config = {
                "validation_mode": validation_mode,
                "use_validation": use_validation
            }
            
            result = get_validated_recommendations_for_skills(
                skills=skills, 
                use_enhanced_validation=True,
                validation_config=validation_config
            )
            
            # Log validation results
            validation = result.get("validation", {})
            if validation.get("is_valid", False):
                logger.info(f"Course recommendation validation passed with score: {validation.get('overall_score', 0):.3f}")
            else:
                logger.warning(f"Course recommendation validation issues: {validation.get('reasons', [])}")
        else:
            # Use legacy system
            result = get_recommendations_for_skills(skills)
            logger.info("Using legacy recommendation system (validation disabled)")
        
        # Add response metadata
        result["response_metadata"] = {
            "validation_enabled": use_validation,
            "validation_mode": validation_mode,
            "enhanced_validation": result.get("enhanced_validation", False),
            "course_count": len(result.get("courses", [])),
            "request_id": request.META.get("HTTP_X_REQUEST_ID", "unknown")
        }
        
        logger.info(f"Course recommendation completed successfully - returned {len(result.get('courses', []))} recommendations")
        return Response(result)
        
    except Exception as e:
        logger.error(f"Course recommendation failed: {str(e)}", exc_info=True)
        return Response({
            "error": "Internal server error",
            "validation": {
                "is_valid": False,
                "overall_score": 0.0,
                "confidence_level": "failed",
                "failed_validations": ["system"],
                "reasons": [f"System error: {str(e)}"],
                "suggestions": ["Please try again later"],
                "validation_type": "error"
            }
        }, status=500)
