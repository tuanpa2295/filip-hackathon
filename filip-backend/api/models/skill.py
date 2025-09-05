# mypy: disable-error-code=var-annotated
from uuid import uuid4

from django.db import models
from pgvector.django import VectorField


class Skill(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    embedding = VectorField(dimensions=1536, null=True, blank=True)

    def __str__(self):
        return str(self.name)


class Course(models.Model):
    LEVEL_CHOICES = [
        ("Beginner", "Beginner"),
        ("Intermediate", "Intermediate"),
        ("Advanced", "Advanced"),
    ]

    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    instructors = models.CharField(max_length=255)
    rating = models.FloatField()
    duration = models.CharField(max_length=50)
    price = models.CharField(max_length=50)
    level = models.CharField(max_length=50, choices=LEVEL_CHOICES)
    embedding = VectorField(dimensions=1536, null=True, blank=True)
    skills = models.ManyToManyField(Skill, through="CourseSkill")

    def __str__(self):
        return str(self.title)


class CourseSkill(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("course", "skill")
