import logging
from datetime import datetime

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

logger = logging.getLogger(__name__)


class LearningTimelineView(APIView):
    def get(self, request):
        client_ip = request.META.get('REMOTE_ADDR', 'unknown')
        logger.info(f"[LearningTimelineView] Request started from IP: {client_ip}")
        
        try:
            data = {
                "startDate": "2024-12-01",
                "targetDate": "2025-06-01",
                "currentDate": datetime.today().strftime("%Y-%m-%d"),
                "milestones": [
                    {
                        "id": 1,
                        "title": "Kubernetes Foundations",
                        "skill": "Kubernetes",
                        "targetDate": "2025-01-15",
                        "status": "in-progress",
                        "courses": ["Kubernetes for Beginners"],
                        "progress": 45,
                        "estimatedHours": 20,
                        "completedHours": 9,
                    },
                    {
                        "id": 2,
                        "title": "Container Orchestration Mastery",
                        "skill": "Kubernetes",
                        "targetDate": "2025-02-28",
                        "status": "upcoming",
                        "courses": ["Certified Kubernetes Administrator (CKA)"],
                        "progress": 0,
                        "estimatedHours": 40,
                        "completedHours": 0,
                    },
                    {
                        "id": 3,
                        "title": "GraphQL API Development",
                        "skill": "GraphQL",
                        "targetDate": "2025-03-15",
                        "status": "upcoming",
                        "courses": ["The Modern GraphQL Bootcamp"],
                        "progress": 0,
                        "estimatedHours": 25,
                        "completedHours": 0,
                    },
                    {
                        "id": 4,
                        "title": "Machine Learning Fundamentals",
                        "skill": "TensorFlow",
                        "targetDate": "2025-04-30",
                        "status": "upcoming",
                        "courses": ["TensorFlow 2.0 Complete Course"],
                        "progress": 0,
                        "estimatedHours": 60,
                        "completedHours": 0,
                    },
                    {
                        "id": 5,
                        "title": "Cloud Architecture Expert",
                        "skill": "Cloud Architecture",
                        "targetDate": "2025-06-01",
                        "status": "upcoming",
                        "courses": ["AWS Solutions Architect Associate"],
                        "progress": 0,
                        "estimatedHours": 80,
                        "completedHours": 0,
                    },
                ],
            }

            logger.info(f"[LearningTimelineView] Successfully retrieved timeline with {len(data['milestones'])} milestones")
            return Response(data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"[LearningTimelineView] Error processing request from IP {client_ip}: {str(e)}", exc_info=True)
            return Response(
                {"error": "An error occurred while retrieving the learning timeline"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
