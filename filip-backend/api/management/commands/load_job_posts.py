import ast
import csv
import os

from django.core.management.base import BaseCommand

from api.models import JobPost


class Command(BaseCommand):
    help = "Load job posts from CSV file in batches"

    def add_arguments(self, parser):
        parser.add_argument("--file", type=str, help="Path to the CSV file")
        parser.add_argument(
            "--batch-size",
            type=int,
            default=500,
            help="Number of records to insert per batch",
        )

    def handle(self, *args, **kwargs):
        file_path = kwargs["file"]
        batch_size = kwargs["batch_size"]

        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f"File {file_path} does not exist"))
            return

        with open(file_path, "r") as f:
            reader = csv.DictReader(f)
            buffer = []
            total_created = 0

            for row in reader:
                try:
                    skills_list = ast.literal_eval(row["job_skill_set"])

                    job_post = JobPost(
                        job_id=row["job_id"],
                        category=row["category"],
                        job_title=row["job_title"],
                        job_description=row["job_description"],
                        skills=skills_list,
                    )
                    buffer.append(job_post)
                except Exception as e:
                    self.stderr.write(
                        self.style.ERROR(
                            f"Error processing row {row['job_id']}: {str(e)}"
                        )
                    )
                    continue

                if len(buffer) >= batch_size:
                    total_created += self._bulk_upsert(buffer)
                    buffer = []

            if buffer:
                total_created += self._bulk_upsert(buffer)

            self.stdout.write(
                self.style.SUCCESS(f"Successfully upserted {total_created} job posts")
            )

    def _bulk_upsert(self, objects):
        """Bulk insert or update on conflict with job_id."""
        JobPost.objects.bulk_create(
            objects,
            batch_size=len(objects),
            update_conflicts=True,
            update_fields=[
                "category",
                "job_title",
                "job_description",
                "skills",
                "updated_at",
            ],
            unique_fields=["job_id"],
        )
        return len(objects)
