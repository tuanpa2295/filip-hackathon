from rest_framework import serializers

from api.models.learning_path import LearningPath
from api.models.learning_path_course import LearningPathCourse
from api.serializers.learning_path_course_serializer import LearningPathCourseSerializer


class LearningPathSerializer(serializers.ModelSerializer):
    progress = serializers.SerializerMethodField()
    learningpath_courses = LearningPathCourseSerializer(many=True)

    class Meta:
        model = LearningPath
        fields = [
            "id",
            "name",
            "start_date",
            "end_date",
            "estimated_hours",
            "completed_hours",
            "status",
            "target_level",
            "progress",
            "learningpath_courses",
            "created_at",
        ]
        read_only_fields = ["id", "progress"]

    def get_progress(self, obj):
        courses = obj.learningpath_courses.all()
        if not courses:
            return float(0.0)
        total_progress = sum(course.course_progress for course in courses)
        return float(round(total_progress / len(courses), 2) or 0.0)

    def create(self, validated_data):
        courses_data = validated_data.pop("learningpath_courses", [])
        learning_path = LearningPath.objects.create(**validated_data)

        for course_data in courses_data:
            LearningPathCourse.objects.create(learningpath=learning_path, **course_data)

        return learning_path
