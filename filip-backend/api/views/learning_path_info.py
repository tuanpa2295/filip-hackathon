import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from uuid import uuid4
import datetime

logger = logging.getLogger(__name__)

class LearningPathInfoView(APIView):
    def post(self, request):
        client_ip = request.META.get('REMOTE_ADDR', 'unknown')
        logger.info(f"[LearningPathInfoView] Request started from IP: {client_ip}")
        
        try:
            data = request.data
            courses = data.get("courses", [])
            logger.info(f"[LearningPathInfoView] Processing {len(courses)} courses for learning path creation")
            
            # Các trường cho learning_path
            learning_path_id = str(uuid4())
            start_date = data.get("start_date")
            end_date = data.get("end_date")
            estimated_hours = sum([float(c.get("duration", 0)) for c in courses])
            completed_hours = sum([float(c.get("progress", 0)) for c in courses])

            logger.info(f"[LearningPathInfoView] Generated learning path ID: {learning_path_id}, estimated_hours: {estimated_hours}, completed_hours: {completed_hours}")

            learning_path = {
                "id": learning_path_id,
                "name": data.get("name", "My Learning Path"),
                "progress": data.get("progress", 0),
                "start_date": start_date,
                "end_date": end_date,
                "estimated_hours": estimated_hours,
                "completed_hours": completed_hours,
            }

            # Build learning_path_courses list
            learning_path_courses = []
            for course in courses:
                course_dict = {
                    "id": str(uuid4()),
                    "learningpath": learning_path_id,
                    "skill_name": course.get("skill_name", ""),
                    "target": end_date,
                    "progress": float(course.get("progress", 0)),
                    "level": course.get("level", ""),
                    "course_title": course.get("title", ""),
                    "course_duration": course.get("duration", ""),
                    "course_instructor": course.get("instructor", ""),
                    "course_price": course.get("price", ""),
                    "course_rating": float(course.get("rating", 0)),
                    "course_skills": course.get("skills", []) if isinstance(course.get("skills", []), list) else [],
                    "course_progress": float(course.get("progress", 0)),
                    "course_status": course.get("course_status", "Not Started"),
                    "course_url": course.get("url", ""),
                    "course_provider": course.get("provider", ""),
                    "course_students": int(course.get("students", 0)),
                    "course_description": course.get("description", ""),
                    "course_highlights": course.get("highlights", []) if isinstance(course.get("highlights", []), list) else [],
                    "course_level": course.get("level", ""),
                }
                learning_path_courses.append(course_dict)

            logger.info(f"[LearningPathInfoView] Successfully created learning path with {len(learning_path_courses)} courses")

            response_data = {
                "learning_path": learning_path,
                "learning_path_courses": learning_path_courses,
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"[LearningPathInfoView] Error processing request from IP {client_ip}: {str(e)}", exc_info=True)
            return Response({"error": str(e)}, status=500)