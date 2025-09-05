# mypy: disable-error-code=var-annotated
from django.db import models
from pgvector.django import VectorField


class UdemyCourse(models.Model):
    id = models.CharField(primary_key=True, max_length=64)
    title = models.TextField()
    level = models.CharField(max_length=100, blank=True)
    url = models.URLField(max_length=500)
    instructors = models.TextField(blank=True)
    duration = models.CharField(max_length=100, blank=True)
    price = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    embedding = VectorField(dimensions=1536, null=True, blank=True)

    def __str__(self):
        return str(self.title)
