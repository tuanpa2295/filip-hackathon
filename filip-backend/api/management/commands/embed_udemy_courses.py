import time

from django.core.management.base import BaseCommand
from django.db import transaction

from api.models.udemy import UdemyCourse
from api.utils.embedding import embed_text
from langchain_postgres.vectorstores import PGVector
from langchain_openai import AzureChatOpenAI, AzureOpenAIEmbeddings
from langchain.schema import Document
from langchain.schema.document import Document as LangchainDocument

from filip import settings


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
        # COLLECTION_NAME = "course"

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

                    # # Initialize embedder
                    # embedder = AzureOpenAIEmbeddings(
                    #     openai_api_version=settings.AZURE_OPENAI_API_VERSION,
                    #     azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
                    #     api_key=settings.AZURE_OPENAI_EMBEDDING_API_KEY,
                    #     model=settings.AZURE_OPENAI_EMBEDDING_MODEL,
                    # )

                    # langchain_documents = []
                    # for course in updated:
                    #     content = self.build_text(course)  # Your existing method
                    #     metadata = {
                    #         "course_id": course.id,
                    #         "title": course.title,
                    #         "instructors": course.instructors,
                    #         "level": course.level,
                    #         "duration": course.duration,
                    #         "price": course.price,
                    #         "url": course.url,
                    #     }
                    #     langchain_documents.append(Document(page_content=content, metadata=metadata))

                    # # Then use the Document objects
                    # PGVector.from_documents(
                    #     documents=langchain_documents,  # ✅ Correct Document objects
                    #     embedding=embedder,
                    #     connection=settings.PGVECTOR_CONNECTION,
                    #     collection_name=COLLECTION_NAME,
                    # )

            self.stdout.write(f"✅ Embedded {count}/{total}")

        self.stdout.write(self.style.SUCCESS(f"🎉 Finished embedding {count} courses."))
