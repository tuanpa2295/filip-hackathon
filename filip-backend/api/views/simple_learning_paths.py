import datetime
import logging

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from api.models import LearningPath

logger = logging.getLogger(__name__)


class SimpleLearningPathsView(APIView):
    def get(self, request):
        """
        Return a simplified list of learning paths without accessing related models.
        """
        client_ip = request.META.get('REMOTE_ADDR', 'unknown')
        logger.info(f"[SimpleLearningPathsView] Request started from IP: {client_ip}")
        
        try:
            # Try to get data from the database
            learning_paths = LearningPath.objects.all()
            data = []
            
            logger.info(f"[SimpleLearningPathsView] Found {learning_paths.count()} learning paths in database")
            
            # If there are learning paths in the database, use them
            if learning_paths.exists():
                for path in learning_paths:
                    try:
                        # Only use direct attributes of learning path
                        path_data = {
                            "id": str(path.id),
                            "title": path.name,
                            "priority": path.priority,
                            "current_level": path.current_level,
                            "target_level": path.target_level,
                            "progress": path.progress or 0
                        }
                        
                        # Only try to access the new fields if they exist
                        try:
                            if hasattr(path, 'start_date'):
                                path_data["startDate"] = path.start_date.isoformat()
                            
                            if hasattr(path, 'end_date'):
                                path_data["endDate"] = path.end_date.isoformat()
                                
                            if hasattr(path, 'estimated_hours'):
                                path_data["estimatedHours"] = path.estimated_hours
                                
                            if hasattr(path, 'completed_hours'):
                                path_data["completedHours"] = path.completed_hours
                        except Exception as attr_err:
                            logger.warning(f"[SimpleLearningPathsView] Error accessing path attributes for {path.id}: {attr_err}")
                        
                        data.append(path_data)
                        logger.debug(f"[SimpleLearningPathsView] Processed learning path: {path.name}")
                    except Exception as e:
                        logger.error(f"[SimpleLearningPathsView] Error processing learning path {path.id}: {str(e)}", exc_info=True)
            
            logger.info(f"[SimpleLearningPathsView] Successfully processed {len(data)} learning paths")
            return Response(data)
            
        except Exception as e:
            logger.error(f"[SimpleLearningPathsView] Error processing request from IP {client_ip}: {str(e)}", exc_info=True)
            
            return Response(
                {"error": "An error occurred while processing your request."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
