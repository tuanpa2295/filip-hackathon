from django.core.management.base import BaseCommand
from django.db import transaction

from api.models.udemy import UdemyCourse
from langchain_postgres.vectorstores import PGVector
from langchain_openai import AzureOpenAIEmbeddings
from langchain.schema import Document

from filip import settings


class Command(BaseCommand):
    help = "Populate PGVector store with existing course embeddings"

    def add_arguments(self, parser):
        parser.add_argument(
            '--batch-size',
            type=int,
            default=100,
            help='Number of courses to process per batch (default: 100)'
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force repopulation even if collection already exists'
        )

    def build_text(self, course):
        """Build the same text representation used in embed_udemy_courses.py"""
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
        BATCH_SIZE = options['batch_size']
        COLLECTION_NAME = "course"
        
        # Query courses that have embeddings but may not be in PGVector
        queryset = UdemyCourse.objects.filter(embedding__isnull=False)
        total = queryset.count()
        
        if total == 0:
            self.stdout.write("❌ No courses with embeddings found.")
            return
            
        self.stdout.write(f"🚀 Found {total} courses with embeddings to populate in PGVector...")
        
        # Initialize embedder (needed for PGVector initialization)
        embedder = AzureOpenAIEmbeddings(
            openai_api_version=settings.AZURE_OPENAI_API_VERSION,
            azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
            api_key=settings.AZURE_OPENAI_EMBEDDING_API_KEY,
            model=settings.AZURE_OPENAI_EMBEDDING_MODEL,
        )
        
        processed = 0
        batch_num = 0
        
        while processed < total:
            batch_num += 1
            batch = list(queryset[processed:processed + BATCH_SIZE])
            
            if not batch:
                break
                
            self.stdout.write(f"📦 Processing batch {batch_num} ({len(batch)} courses)...")
            
            # Convert courses to LangChain Documents
            langchain_documents = []
            for course in batch:
                content = self.build_text(course)
                metadata = {
                    "course_id": course.id,
                    "title": course.title,
                    "instructors": course.instructors,
                    "level": course.level,
                    "duration": course.duration,
                    "price": course.price,
                    "url": course.url,
                }
                langchain_documents.append(Document(page_content=content, metadata=metadata))
            
            try:
                # Add documents to PGVector
                PGVector.from_documents(
                    documents=langchain_documents,
                    embedding=embedder,
                    connection=settings.PGVECTOR_CONNECTION,
                    collection_name=COLLECTION_NAME,
                )
                
                processed += len(batch)
                self.stdout.write(f"✅ Processed {processed}/{total} courses")
                
            except Exception as e:
                self.stderr.write(f"❌ Error processing batch {batch_num}: {e}")
                # Continue with next batch instead of stopping
                processed += len(batch)
                continue
        
        self.stdout.write(
            self.style.SUCCESS(f"🎉 Finished populating PGVector with {total} courses!")
        )
        self.stdout.write(
            self.style.SUCCESS(f"💡 You can now test course recommendations!")
        )
