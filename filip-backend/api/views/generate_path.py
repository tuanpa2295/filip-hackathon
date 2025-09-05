import logging
from pgvector.django import CosineDistance
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from api.models import Course, Skill
from api.utils.embedding import embed_text

logger = logging.getLogger(__name__)


def get_user_profile_vector(known_skills: list[str]) -> list[float]:
    # Expand single-word skills into richer prompts
    enriched = [f"I want to learn {skill}" for skill in known_skills]
    query_text = ". ".join(enriched)

    return embed_text(query_text) or []


def retrieve_courses_for_query(skills):
    user_vector = get_user_profile_vector(skills)
    queryset = Course.objects.exclude(embedding=None)

    # Optionally enforce that at least 1 matching skill is tagged
    matching_skills = Skill.objects.filter(name__in=skills)
    if matching_skills.exists():
        queryset = queryset.filter(skills__in=matching_skills)

    return queryset.annotate(
        similarity=CosineDistance("embedding", user_vector)
    ).order_by("similarity")[:5]


class GeneratePathView(APIView):
    def post(self, request: Request):
        client_ip = request.META.get('REMOTE_ADDR', 'unknown')
        logger.info(f"[GeneratePathView] Request started from IP: {client_ip}")
        
        try:
            known_skills = request.data.get("known_skills", [])
            logger.info(f"[GeneratePathView] Request parameters - known_skills: {known_skills}")
            
            if not isinstance(known_skills, list) or not known_skills:
                logger.warning(f"[GeneratePathView] Invalid request - known_skills must be a non-empty list. Received: {known_skills}")
                return Response(
                    {"error": "'known_skills' must be a non-empty list."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            logger.info(f"[GeneratePathView] Retrieving courses for skills: {known_skills}")
            courses = retrieve_courses_for_query(known_skills)
            logger.info(f"[GeneratePathView] Found {len(courses)} courses")

            result = [
                {
                    "title": course.title,
                    "provider": course.provider,
                    "instructor": course.instructor,
                    "level": course.level,
                    "skills": [s.name for s in course.skills.all()],
                    "similarity": course.similarity,
                }
                for course in courses
            ]

            logger.info(f"[GeneratePathView] Successfully generated learning path with {len(result)} courses")
            return Response({"learning_path": result})
            
        except Exception as e:
            logger.error(f"[GeneratePathView] Error processing request from IP {client_ip}: {str(e)}", exc_info=True)
            return Response(
                {"error": "An error occurred while generating the learning path"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
