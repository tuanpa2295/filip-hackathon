from rest_framework import serializers

from api.models.learning_path_course import LearningPathCourse


class LearningPathCourseSerializer(serializers.ModelSerializer):
    course_progress = serializers.SerializerMethodField()
    course_rating = serializers.SerializerMethodField()

    def get_course_progress(self, obj):
        return float(obj.course_progress or 0)

    def get_course_rating(self, obj):
        return float(obj.course_rating or 0)

    class Meta:
        model = LearningPathCourse
        exclude = ["id", "learningpath", "created_at", "target"]
        read_only_fields = ["id", "created_at"]
