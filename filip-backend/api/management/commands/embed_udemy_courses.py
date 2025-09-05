import time

from django.core.management.base import BaseCommand
from django.db import transaction

from api.models.udemy import UdemyCourse
from api.utils.embedding import embed_text


class Command(BaseCommand):
    help = "Generate and store OpenAI embeddings for UdemyCourse descriptions"

    def build_text(self, course):
        return (
            f"Course title: {course.title} "
            f"Instructors: {course.instructors} "
            f"Level: {course.level} "
            f"Duration: {course.duration} "
            f"Price (VND): {course.price} "
            f"Course description: {course.description} "
            f"Link: {course.url}"
        )

    def handle(self, *args, **options):
        BATCH_SIZE = 100

        queryset = UdemyCourse.objects.filter(embedding__isnull=True)
        total = queryset.count()
        if total == 0:
            self.stdout.write("✅ No unembedded courses found.")
            return

        self.stdout.write(f"🚀 Starting embedding for {total} courses...")

        count = 0
        while True:
            batch = list(queryset[:BATCH_SIZE])
            if not batch:
                break

            updated = []
            for course in batch:
                try:
                    text = self.build_text(course)
                    embedding = embed_text(text)
                    if embedding:
                        course.embedding = embedding
                        updated.append(course)
                        count += 1
                    else:
                        self.stderr.write(f"⚠️ Embedding failed for ID={course.id}")
                except Exception as e:
                    self.stderr.write(f"❌ Error for ID={course.id}: {e}")

                time.sleep(0.2)  # honor rate limits

            if updated:
                with transaction.atomic():
                    UdemyCourse.objects.bulk_update(
                        updated, ["embedding"], batch_size=100
                    )

            self.stdout.write(f"✅ Embedded {count}/{total}")

        self.stdout.write(self.style.SUCCESS(f"🎉 Finished embedding {count} courses."))
