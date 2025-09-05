# serializers.py (extend this)
from rest_framework import serializers


class SkillMatchSerializer(serializers.Serializer):
    name = serializers.CharField()
    matched = serializers.BooleanField()


class CourseItemSerializer(serializers.Serializer):
    course_rating = serializers.FloatField()
    target = serializers.DateField()
    course_level = serializers.CharField()
    course_description = serializers.CharField()
    course_title = serializers.CharField()
    course_duration = serializers.CharField()
    course_instructor = serializers.CharField()
    course_price = serializers.CharField()
    course_url = serializers.URLField()
    course_skills = SkillMatchSerializer(many=True)
    course_highlights = serializers.ListField(child=serializers.CharField())
    course_provider = serializers.CharField()
    course_students = serializers.IntegerField()


class RecommendationResponseSerializer(serializers.Serializer):
    recommendations = serializers.CharField()
    courses = CourseItemSerializer(many=True)
