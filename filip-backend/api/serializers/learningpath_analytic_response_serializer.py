# serializers.py
from rest_framework import serializers


class LearningPathAnalyticResponseSerializer(serializers.Serializer):
    total_hours = serializers.FloatField()
    total_weeks_required = serializers.FloatField()
    estimated_completion_date = serializers.DateField()
    total_days_late = serializers.IntegerField()
    available_weeks = serializers.FloatField()
    available_hours = serializers.FloatField()
    ai_feedback = serializers.CharField()
