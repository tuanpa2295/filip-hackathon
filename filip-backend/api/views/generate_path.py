from pgvector.django import CosineDistance
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from api.models import Course, Skill
from api.utils.embedding import embed_text


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
        known_skills = request.data.get("known_skills", [])
        if not isinstance(known_skills, list) or not known_skills:
            return Response(
                {"error": "'known_skills' must be a non-empty list."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        courses = retrieve_courses_for_query(known_skills)

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

        return Response({"learning_path": result})
