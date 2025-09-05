# serializers.py
from rest_framework import serializers


class RecommendationSerializer(serializers.Serializer):
    name = serializers.CharField()
    level = serializers.CharField(required=False, default="general")


class RecommendationRequestSerializer(serializers.Serializer):
    skills = RecommendationSerializer(many=True)
