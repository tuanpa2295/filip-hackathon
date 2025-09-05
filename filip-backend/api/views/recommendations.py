# recommendations_view.py

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


@extend_schema(
    request=RecommendationRequestSerializer,
    responses={200: RecommendationResponseSerializer},
    summary="Recommend internal courses for given skills",
    description="Returns top internal courses based on skills and proficiency levels.",
)
@api_view(["POST"])
def recommend_courses(request):
    skills = request.data.get("skills", [])
    if not skills:
        return Response({"error": "No skills provided"}, status=400)

    result = get_recommendations_for_skills(skills)
    return Response(result)
