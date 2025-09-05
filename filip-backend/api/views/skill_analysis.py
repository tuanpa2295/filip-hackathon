from uuid import uuid4

from django.core.files.uploadedfile import UploadedFile
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.request import MultiValueDict, Request
from rest_framework.response import Response
from rest_framework.views import APIView
from typing_extensions import Dict, TypedDict, cast

from api.ai import run_skill_gap_pipeline
from api.services import (
    extract_data_from_cv_text,
    extract_text_from_file,
    fetch_skills_from_akajob,
)
from api.types import LLMUsage


class SkillAnalysisRequest(TypedDict):
    learning_type: str  # "individual" or "project"
    user_description: str  # used if provider == "akajob"
    timeline: str
    provider: str  # "cv" or "akajob"
    cv_file: UploadedFile
    project_requirements: str
    thread_id: str


def _compute_total_llm_usage(
    llm_usage: Dict[str, LLMUsage],
) -> LLMUsage:
    total: LLMUsage = {
        "prompt_tokens": 0,
        "completion_tokens": 0,
        "total_tokens": 0,
        "cost": 0.0,
    }

    # Sum values across all tool steps
    for usage in llm_usage.values():
        if isinstance(usage, dict):
            total["prompt_tokens"] += usage.get("prompt_tokens", 0)
            total["completion_tokens"] += usage.get("completion_tokens", 0)
            total["total_tokens"] += usage.get("total_tokens", 0)
            total["cost"] += usage.get("cost", 0.0)

    # Round the cost for readability
    total["cost"] = round(total["cost"], 6)

    return total


class SkillAnalysisView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request: Request):
        data = cast(SkillAnalysisRequest, request.data)
        # learning_type = data.get("learning_type", "individual")
        user_description = data.get("user_description", "")
        timeline = data.get("timeline", "6-months")
        provider = data.get("provider", "cv")
        project_requirements = data.get("project_requirements", "")
        thread_id = data.get("thread_id", str(uuid4()))

        cv_result = fetch_skills_from_akajob()

        if provider == "cv":
            cv_file = cast(MultiValueDict, request.FILES).get("cv_file")
            if not cv_file:
                return Response(
                    {"error": "Missing 'cv_file' for CV provider."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                cv_text = extract_text_from_file(cv_file)
            except Exception as e:
                return Response(
                    {"error": f"Failed to read CV file: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            try:
                cv_result = extract_data_from_cv_text(cv_text)
            except Exception as e:
                return Response(
                    {"error": f"Failed to analyze CV: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        try:
            skill_gap_result = run_skill_gap_pipeline(
                current_skills=[
                    {
                        "name": s.get("name", ""),
                        "level": s.get("level", ""),
                    }
                    for s in cv_result.get("extracted_skills", [])
                ],
                target_goal=user_description,
                timeline=timeline,
                project_requirements=project_requirements,
                thread_id=thread_id,
            )
        except Exception as e:
            return Response(
                {"error": f"Skill gap analysis failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        llm_usage = cv_result.get("llm_usage", {}) | skill_gap_result.get(
            "llm_usage", {}
        )

        llm_usage["total"] = _compute_total_llm_usage(llm_usage)

        return Response(
            {
                "thread_id": thread_id,
                "target_goal": user_description,
                "timeline": timeline,
                "education": cv_result.get("education", []),
                "experience": cv_result.get("experience", {}),
                "extracted_skills": cv_result.get("extracted_skills", []),
                "skills_gap": skill_gap_result.get("recommended_skills", []),
                "overall_score": skill_gap_result.get("overall_score", 0),
                "llm_usage": llm_usage,
            }
        )
