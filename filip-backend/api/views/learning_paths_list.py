import datetime
import logging

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from api.models import LearningPath, Course, Skill

logger = logging.getLogger(__name__)


class LearningPathsListView(APIView):
    def get(self, request):
        """
        Return a list of learning paths in a format used by the dashboard.
        """
        client_ip = request.META.get('REMOTE_ADDR', 'unknown')
        logger.info(f"[LearningPathsListView] Request started from IP: {client_ip}")
        
        try:
            # Try to get data from the database
            learning_paths = LearningPath.objects.all()
            data = []
            
            logger.info(f"[LearningPathsListView] Found {learning_paths.count()} learning paths in database")
            
            # If there are learning paths in the database, use them
            if learning_paths.exists():
                for path in learning_paths:
                    try:
                        # Get skills for this learning path (across all courses)
                        path_skills = set()
                        if path.courses.exists():
                            # Get courses related to the learning path
                            path_courses = path.courses.all()
                            logger.debug(f"[LearningPathsListView] Processing learning path '{path.name}' with {path_courses.count()} courses")
                            for course in path_courses:
                                # Add skills from each course to the set
                                if course.skills.exists():
                                    for skill in course.skills.all():
                                        path_skills.add(skill.name)
                        
                        # No need to handle the else case - we just won't have any skills
                                                
                        # Safely get attributes with default values if missing
                        path_data = {
                            "id": str(path.id),  # Convert UUID to string for JSON
                            "title": path.name,  # Use name field as title
                            "progress": path.progress or 0,
                            "startDate": getattr(path, 'start_date', datetime.date.today()).isoformat(),
                            "endDate": getattr(path, 'end_date', datetime.date.today()).isoformat(),
                            "skills": list(path_skills)[:4] if path_skills else [],  # Limit to 4 skills for display
                            "estimatedHours": getattr(path, 'estimated_hours', 100),
                            "completedHours": getattr(path, 'completed_hours', 0),
                            "level": getattr(path, 'target_level', "Beginner"),
                        }
                        
                        data.append(path_data)
                    except Exception as e:
                        # Log error but continue processing other paths
                        logger.error(f"[LearningPathsListView] Error processing learning path {path.id}: {str(e)}", exc_info=True)
                
                logger.info(f"[LearningPathsListView] Successfully processed {len(data)} learning paths")
                return Response(data)
            
            # If no learning paths exist, return empty array
            logger.info(f"[LearningPathsListView] No learning paths found, returning empty array")
            return Response(data)
            
        except Exception as e:
            # Log the error
            logger.error(f"[LearningPathsListView] Error processing request from IP {client_ip}: {str(e)}", exc_info=True)
            
            # Return a simple error response
            return Response(
                {"error": "An error occurred while processing your request."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
