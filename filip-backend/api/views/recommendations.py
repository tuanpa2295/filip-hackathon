# recommendations_view.py

import logging
from drf_spectacular.utils import extend_schema
from rest_framework.decorators import api_view
from rest_framework.response import Response

from api.ai.agent_rag_course import get_recommendations_for_skills
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
    description="Returns top internal courses based on skills and proficiency levels.",
)
@api_view(["POST"])
def recommend_courses(request):
    logger.info(f"Course recommendation request started - IP: {request.META.get('REMOTE_ADDR')}")
    logger.debug(f"Request data: {request.data}")
    
    skills = request.data.get("skills", [])
    if not skills:
        logger.warning("Course recommendation request failed: No skills provided")
        return Response({"error": "No skills provided"}, status=400)

    logger.info(f"Processing course recommendations for {len(skills)} skills")
    
    try:
        result = get_recommendations_for_skills(skills)
        logger.info(f"Course recommendation completed successfully - returned {len(result.get('courses', []))} recommendations")
        return Response(result)
    except Exception as e:
        logger.error(f"Course recommendation failed: {str(e)}", exc_info=True)
        return Response({"error": "Internal server error"}, status=500)
