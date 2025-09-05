import json
import logging
from uuid import UUID

from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponse
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from api.models import LearningPath
from api.serializers.learning_path_serializer import LearningPathSerializer

logger = logging.getLogger(__name__)


class LearningPathViewSet(ModelViewSet):
    @extend_schema(
        request=None,
        responses={200: LearningPathSerializer(many=True)},
        summary="List Learning Paths",
        description="Retrieve a list of available learning paths with their details, including courses and progress.",
    )
    def list(self, request):
        client_ip = request.META.get('REMOTE_ADDR', 'unknown')
        logger.info(f"[LearningPathViewSet.list] Request started from IP: {client_ip}")
        
        try:
            queryset = LearningPath.objects.all().order_by("-created_at")
            serializer_class = LearningPathSerializer
            serializer = serializer_class(queryset, many=True)
            data = serializer.data

            logger.info(f"[LearningPathViewSet.list] Successfully retrieved {len(data)} learning paths")
            return Response(data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"[LearningPathViewSet.list] Error processing request from IP {client_ip}: {str(e)}", exc_info=True)
            return Response(
                {"error": "An error occurred while retrieving learning paths"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        request=None,
        responses={200: LearningPathSerializer},
        summary="Retrieve Learning Path",
        description="Retrieve details of a specific learning path.",
    )
    def retrieve(self, request, pk=None):
        client_ip = request.META.get('REMOTE_ADDR', 'unknown')
        logger.info(f"[LearningPathViewSet.retrieve] Request started from IP: {client_ip} for learning path ID: {pk}")
        
        try:
            try:
                UUID(pk)
            except ValueError:
                logger.warning(f"[LearningPathViewSet.retrieve] Invalid UUID format: {pk}")
                raise ValidationError("Invalid UUID format for learning path ID.")
                
            queryset = LearningPath.objects.all()
            serializer_class = LearningPathSerializer
            try:
                learning_path = queryset.prefetch_related("learningpath_courses").get(pk=pk)
                logger.info(f"[LearningPathViewSet.retrieve] Found learning path: {learning_path.name}")
            except LearningPath.DoesNotExist:
                logger.warning(f"[LearningPathViewSet.retrieve] Learning path not found for ID: {pk}")
                return Response(
                    {"detail": "Learning Path not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            serializer = serializer_class(learning_path)
            data = serializer.data
            data["learningpath_courses"] = [
                {
                    "course_level": course.course_level,
                    "course_description": course.course_description,
                    "course_title": course.course_title,
                    "course_duration": course.course_duration,
                    "course_instructor": course.course_instructor,
                    "course_price": course.course_price,
                    "course_rating": course.course_rating,
                    "course_skills": course.course_skills,
                    "course_url": course.course_url,
                    "course_progress": course.course_progress,
                    "course_status": course.course_status,
                    "course_students": course.course_students,
                    "course_provider": course.course_provider,
                    "course_highlights": course.course_highlights,
                }
                for course in learning_path.learningpath_courses.all()
            ]
            
            logger.info(f"[LearningPathViewSet.retrieve] Successfully retrieved learning path with {len(data['learningpath_courses'])} courses")
            return Response(data, status=status.HTTP_200_OK)
            
        except ValidationError:
            raise
        except Exception as e:
            logger.error(f"[LearningPathViewSet.retrieve] Error processing request from IP {client_ip}: {str(e)}", exc_info=True)
            return Response(
                {"error": "An error occurred while retrieving the learning path"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        request=LearningPathSerializer,
        responses={201: LearningPathSerializer},
        summary="Create Learning Path",
        description="Create a new learning path with initial course details.",
    )
    def create(self, request):
        client_ip = request.META.get('REMOTE_ADDR', 'unknown')
        logger.info(f"[LearningPathViewSet.create] Request started from IP: {client_ip}")
        
        try:
            logger.info(f"[LearningPathViewSet.create] Request data: {request.data}")
            serializer = LearningPathSerializer(data=request.data)

            if serializer.is_valid():
                learning_path = serializer.save(
                    completed_hours=0,
                    status="Active",
                    target_level=serializer.validated_data.get("target_level", "Beginner"),
                )
                logger.info(f"[LearningPathViewSet.create] Successfully created learning path: {learning_path.name} (ID: {learning_path.id})")
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                logger.warning(f"[LearningPathViewSet.create] Validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"[LearningPathViewSet.create] Error processing request from IP {client_ip}: {str(e)}", exc_info=True)
            return Response(
                {"error": "An error occurred while creating the learning path"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        request=None,
        responses={200: LearningPathSerializer(many=True)},
        summary="Export Learning Path",
        description="Export learning path with course details.",
    )
    @action(detail=True, methods=["get"], url_path="export")
    def export(self, request, pk=None):
        client_ip = request.META.get('REMOTE_ADDR', 'unknown')
        logger.info(f"[LearningPathViewSet.export] Request started from IP: {client_ip} for learning path ID: {pk}")
        
        try:
            try:
                UUID(pk)
            except ValueError:
                logger.warning(f"[LearningPathViewSet.export] Invalid UUID format: {pk}")
                raise ValidationError("Invalid UUID format for learning path ID.")
                
            queryset = LearningPath.objects.all()
            serializer_class = LearningPathSerializer
            try:
                learning_path = queryset.prefetch_related("learningpath_courses").get(pk=pk)
                logger.info(f"[LearningPathViewSet.export] Found learning path for export: {learning_path.name}")
            except LearningPath.DoesNotExist:
                logger.warning(f"[LearningPathViewSet.export] Learning path not found for ID: {pk}")
                return Response(
                    {"detail": "Learning Path not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            serializer = serializer_class(learning_path)
            json_data = json.dumps(serializer.data, indent=2, cls=DjangoJSONEncoder)

            response = HttpResponse(json_data, content_type="application/json")
            filename = f"learning_path_{learning_path.id}.json"
            response["Content-Disposition"] = f'attachment; filename="{filename}"'
            
            logger.info(f"[LearningPathViewSet.export] Successfully exported learning path to file: {filename}")
            return response
            
        except ValidationError:
            raise
        except Exception as e:
            logger.error(f"[LearningPathViewSet.export] Error processing request from IP {client_ip}: {str(e)}", exc_info=True)
            return Response(
                {"error": "An error occurred while exporting the learning path"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
