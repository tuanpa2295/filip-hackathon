import logging
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

logger = logging.getLogger(__name__)


class LearningPathView(APIView):
    def get(self, request):
        logger.info(f"Learning path list request - IP: {request.META.get('REMOTE_ADDR')}")
        
        data = [
            {
                "id": 1,
                "title": "Full Stack Developer Path",
                "progress": 65,
                "startDate": "2025-03-15",
                "endDate": "2025-09-15",
                "skills": ["React", "Node.js", "MongoDB", "AWS"],
                "estimatedHours": 120,
                "completedHours": 78,
                "level": "Intermediate",
            },
            {
                "id": 2,
                "title": "Cloud Architecture Specialist",
                "progress": 30,
                "startDate": "2025-04-20",
                "endDate": "2025-10-20",
                "skills": ["AWS", "Azure", "Kubernetes", "Terraform"],
                "estimatedHours": 160,
                "completedHours": 48,
                "level": "Advanced",
            },
            {
                "id": 3,
                "title": "Data Science Fundamentals",
                "progress": 90,
                "startDate": "2025-01-10",
                "endDate": "2025-04-10",
                "skills": ["Python", "Pandas", "NumPy", "Matplotlib"],
                "estimatedHours": 90,
                "completedHours": 81,
                "level": "Beginner",
            },
            {
                "id": 4,
                "title": "DevOps Engineering",
                "progress": 45,
                "startDate": "2025-02-28",
                "endDate": "2025-08-28",
                "skills": ["Docker", "Jenkins", "Kubernetes", "GitOps"],
                "estimatedHours": 140,
                "completedHours": 63,
                "level": "Intermediate",
            },
            {
                "id": 5,
                "title": "Mobile App Development",
                "progress": 15,
                "startDate": "2025-05-01",
                "endDate": "2025-11-01",
                "skills": ["React Native", "Swift", "Firebase", "UI/UX"],
                "estimatedHours": 130,
                "completedHours": 20,
                "level": "Intermediate",
            },
            {
                "id": 6,
                "title": "AI & Machine Learning",
                "progress": 5,
                "startDate": "2025-05-15",
                "endDate": "2026-05-15",
                "skills": ["Python", "TensorFlow", "PyTorch", "Data Analysis"],
                "estimatedHours": 180,
                "completedHours": 9,
                "level": "Advanced",
            },
        ]

        return Response(data, status=status.HTTP_200_OK)
