import json
import logging
import re
from datetime import datetime, timedelta

from drf_spectacular.utils import extend_schema
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import AzureChatOpenAI
from rest_framework.response import Response
from rest_framework.views import APIView

from api.serializers.learningpath_analytic_request_serializer import (
    LearningPathAnalyticRequestSerializer,
)
from api.serializers.learningpath_analytic_response_serializer import (
    LearningPathAnalyticResponseSerializer,
)
from filip import settings

logger = logging.getLogger(__name__)

llm = AzureChatOpenAI(
    openai_api_version=settings.AZURE_OPENAI_API_VERSION,
    azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
    api_key=settings.AZURE_OPENAI_CHAT_API_KEY,
    model=settings.AZURE_OPENAI_CHAT_MODEL,
    temperature=0.4,
)
output_parser = StrOutputParser()
prompt_template = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You're an expert career and learning advisor. Help users prioritize and manage their learning goals.",
        ),
        ("human", "{input}"),
    ]
)


def estimate_hours(duration_str):
    duration_str = duration_str.strip().lower()
    match = re.findall(r"(\d+)", duration_str)
    if "less than" in duration_str:
        return 2
    elif "hour" in duration_str:
        return int(match[0]) if match else 2
    elif "week" in duration_str:
        weeks = int(match[0]) if match else 4
        return weeks * 5
    elif "month" in duration_str:
        months = [int(x) for x in match]
        avg_months = sum(months) / len(months) if months else 4
        return avg_months * 20
    else:
        return 20


def generate_feedback(input_summary):
    chain = prompt_template | llm | output_parser
    return chain.invoke({"input": input_summary})


class LearningPathAnalysisView(APIView):
    @extend_schema(
        request=LearningPathAnalyticRequestSerializer,
        responses={200: LearningPathAnalyticResponseSerializer},
        summary="Analyze learning plan",
        description="Analyze learning plan based on available time and course info. ",
    )
    def post(self, request):
        logger.info(f"Learning path analysis request started - IP: {request.META.get('REMOTE_ADDR')}")
        
        try:
            data = request.data
            courses = data.get("courses", [])
            start_date = datetime.strptime(data["start_date"], "%Y-%m-%d")
            end_date = datetime.strptime(data["end_date"], "%Y-%m-%d")
            hours_per_week = float(data["available_hours_per_week"])

            logger.info(f"Learning path analysis parameters - Courses: {len(courses)}, Start: {start_date}, End: {end_date}, Hours/week: {hours_per_week}")

            if end_date <= start_date:
                logger.warning("Learning path analysis failed: End date must be after start date")
                return Response(
                    {"error": "End date must be after start date"}, status=400
                )

            evaluated_courses = []
            total_required_hours = 0

            for course in courses:
                title = course.get("title", "Untitled")
                duration_str = course.get("duration", "")
                estimated_hours = estimate_hours(duration_str)

                evaluated_courses.append(
                    {
                        "title": title,
                        "estimated_hours": estimated_hours,
                        "duration_text": duration_str,
                    }
                )

                total_required_hours += estimated_hours

            total_weeks_required = total_required_hours / hours_per_week
            estimated_completion_date = start_date + timedelta(
                weeks=total_weeks_required
            )
            days_diff = (end_date - estimated_completion_date).days
            total_days_late = max(0, days_diff)

            if days_diff < -30:
                risk_level = "high"
            elif days_diff < 0:
                risk_level = "medium"
            else:
                risk_level = "low"
                
            logger.info(f"Learning path calculations - Total hours: {total_required_hours}, Risk level: {risk_level}, Days diff: {days_diff}")
            
            prompt = (
                f"You are a career coach analyzing a learning path.\n"
                f"Start Date: {start_date}\n"
                f"End Date: {end_date}\n"
                f"Total Estimated Hours: {total_required_hours}\n"
                f"Weekly Hours Needed: {hours_per_week}\n"
                f"Estimated End Date Based on Progress: {estimated_completion_date}\n"
                f"Risk Level: {risk_level}\n"
                f"Suggest personalized, actionable recommendations in JSON format:\n"
                f"[{{'type': 'suggestion'|'warning'|'success', 'title': string, 'message': string, 'action': string}}]"
            )
            try:
                logger.debug("Generating LLM feedback for learning path analysis")
                response = generate_feedback(prompt)
                if response.strip().startswith("```"):
                    response = response.strip().strip("`").strip("json").strip()
                print("🔍 RAW LLM response:", response)
                recommendations = json.loads(response)
                logger.info(f"LLM feedback generated successfully - {len(recommendations)} recommendations")
            except Exception as e:
                logger.error(f"LLM feedback generation failed: {str(e)}", exc_info=True)
                recommendations = [
                    {
                        "type": "warning",
                        "title": "LLM Failure",
                        "message": "AI recommendation generation failed.",
                        "action": "Please try again later.",
                    }
                ]
                
            logger.info("Learning path analysis completed successfully")
            return Response(
                {
                    "totalHours": total_required_hours,
                    "weeklyHours": hours_per_week,
                    "totalWeeks": total_weeks_required,
                    "estimatedEndDate": estimated_completion_date,
                    "targetDate": end_date,
                    "daysDiff": total_days_late,
                    "riskLevel": risk_level,
                    "recommendations": recommendations,
                }
            )

        except Exception as e:
            logger.error(f"Learning path analysis failed: {str(e)}", exc_info=True)
            return Response({"error": str(e)}, status=500)
