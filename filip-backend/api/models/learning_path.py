import datetime
from uuid import uuid4

from django.db import models


class LearningPath(models.Model):
    """Model representing a learning path."""

    STATUS_CHOICES: list[tuple[str, str]] = [
        ("Active", "Active"),
        ("Inactive", "Inactive"),
    ]

    id: models.UUIDField = models.UUIDField(
        primary_key=True, default=uuid4, editable=False
    )
    name: models.CharField = models.CharField(
        max_length=255, default="Custom Learning Path"
    )
    start_date: models.DateField = models.DateField(default=datetime.date.today)
    end_date: models.DateField = models.DateField(default=datetime.date.today)
    estimated_hours: models.FloatField = models.FloatField(default=0.0)
    completed_hours: models.FloatField = models.FloatField(default=0.0)
    status: models.CharField = models.CharField(
        max_length=10, choices=STATUS_CHOICES, default="Active"
    )
    target_level: models.CharField = models.CharField(max_length=50, default="Beginner")
    created_at: models.DateTimeField = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.name)
