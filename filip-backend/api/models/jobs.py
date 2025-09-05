# mypy: disable-error-code=var-annotated
from django.contrib.postgres.fields import ArrayField
from django.db import models
from pgvector.django import VectorField


class JobPost(models.Model):
    id = models.AutoField(primary_key=True)
    job_id = models.BigIntegerField(unique=True, null=True)
    category = models.CharField(max_length=100)
    job_title = models.CharField(max_length=255)
    job_description = models.TextField()
    skills = ArrayField(models.CharField(max_length=255), blank=True, default=list)
    summary = models.TextField(null=True, blank=True)
    embedding = VectorField(dimensions=1536, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.job_title
