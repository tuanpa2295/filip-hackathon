import csv

from django.core.management.base import BaseCommand
from django.db import transaction

from api.models.udemy import UdemyCourse


class Command(BaseCommand):
    help = "Efficiently load Udemy courses from CSV using bulk_create (excludes existing entries)"

    def add_arguments(self, parser):
        parser.add_argument(
            "--file", type=str, required=True, help="Path to Udemy CSV file"
        )

    def handle(self, *args, **options):
        path = options["file"]
        self.stdout.write(f"📥 Reading CSV: {path}")

        try:
            with open(path, newline="", encoding="utf-8") as csvfile:
                reader = csv.DictReader(csvfile)
                rows = list(reader)

            if not rows:
                self.stdout.write(self.style.WARNING("⚠️  No rows found in CSV."))
                return

            input_ids = [str(row["ID"]) for row in rows]
            existing_ids = set(
                UdemyCourse.objects.filter(id__in=input_ids).values_list(
                    "id", flat=True
                )
            )

            to_insert = []
            for row in rows:
                course_id = str(row["ID"])
                if course_id in existing_ids:
                    continue  # skip existing course

                to_insert.append(
                    UdemyCourse(
                        id=course_id,
                        title=row.get("Title", ""),
                        level=row.get("Level", ""),
                        url=row.get("URL", ""),
                        instructors=row.get("Instructors", ""),
                        duration=row.get("Duration", ""),
                        price=row.get("Price (VND)", ""),
                        description=row.get("Description", ""),
                    )
                )

            with transaction.atomic():
                UdemyCourse.objects.bulk_create(to_insert, batch_size=500)

            self.stdout.write(
                self.style.SUCCESS(
                    f"✅ Inserted {len(to_insert)} new courses. Skipped {len(existing_ids)} existing."
                )
            )

        except FileNotFoundError:
            self.stderr.write(self.style.ERROR(f"❌ File not found: {path}"))
        except KeyError as e:
            self.stderr.write(
                self.style.ERROR(f"❌ Missing required column in CSV: {e}")
            )
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"❌ Unexpected error: {e}"))
