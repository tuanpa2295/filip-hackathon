# serializers.py
from rest_framework import serializers

from api.serializers.recommendation_response_serializer import CourseItemSerializer


class LearningPathAnalyticRequestSerializer(serializers.Serializer):
    available_hours_per_week = serializers.IntegerField()
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    courses = CourseItemSerializer(many=True)
