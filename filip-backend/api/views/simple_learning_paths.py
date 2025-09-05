import datetime

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from api.models import LearningPath


class SimpleLearningPathsView(APIView):
    def get(self, request):
        """
        Return a simplified list of learning paths without accessing related models.
        """
        try:
            # Try to get data from the database
            learning_paths = LearningPath.objects.all()
            data = []
            
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
                            print(f"Error accessing path attributes: {attr_err}")
                        
                        data.append(path_data)
                    except Exception as e:
                        print(f"Error processing learning path {path.id}: {str(e)}")
            
            return Response(data)
            
        except Exception as e:
            import traceback
            print(f"Error in SimpleLearningPathsView: {str(e)}")
            traceback.print_exc()
            
            return Response(
                {"error": "An error occurred while processing your request."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
