from uuid import uuid4

from django.db import models

from api.models.learning_path import LearningPath


class LearningPathCourse(models.Model):
    COURSE_STATUS_CHOICES: list[tuple[str, str]] = [
        ("Current", "Current"),
        ("Completed", "Completed"),
        ("Not Started", "Not Started"),
    ]

    id: models.UUIDField = models.UUIDField(
        primary_key=True, default=uuid4, editable=False
    )
    learningpath: models.ForeignKey = models.ForeignKey(
        LearningPath, on_delete=models.CASCADE, related_name="learningpath_courses"
    )
    target: models.DateField = models.DateField(auto_now_add=True)
    course_level: models.TextField = models.TextField(default="Beginner")
    course_description: models.TextField = models.TextField(blank=True, default="")
    course_title: models.TextField = models.TextField(blank=True, default="")
    course_duration: models.TextField = models.TextField(blank=True, default="0h")
    course_instructor: models.TextField = models.TextField(blank=True, default="N/A")
    course_price: models.TextField = models.TextField(blank=True, default="0")
    course_url: models.TextField = models.TextField(default="")
    course_rating: models.FloatField = models.FloatField(default=3.5)
    course_skills: models.TextField = models.TextField(blank=True, default="[]")
    course_students: models.IntegerField = models.IntegerField(default=1989)
    course_provider: models.TextField = models.TextField(default="")
    course_highlights: models.TextField = models.TextField(default="[]")
    course_progress: models.DecimalField = models.DecimalField(
        max_digits=5, decimal_places=2, default=0
    )
    course_status: models.CharField = models.CharField(
        max_length=15, choices=COURSE_STATUS_CHOICES, default="Not Started"
    )
    created_at: models.DateTimeField = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.course_title} ({self.course_skills})"
