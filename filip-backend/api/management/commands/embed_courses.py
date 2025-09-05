import pandas as pd
from django.core.management.base import BaseCommand
from langchain.schema import Document
from langchain_openai import OpenAIEmbeddings
from langchain_postgres.vectorstores import PGVector

from filip import settings


class Command(BaseCommand):
    help = (
        "Generate and store vector embeddings for courses from a CSV file into PGVector"
    )

    def handle(self, *args, **options):
        COLLECTION_NAME = "course"

        # Step 1: Load CSV
        csv_path = options["file"]
        df = pd.read_csv(csv_path)

        # Inspect expected columns
        self.stdout.write(f"🔍 CSV Columns: {df.columns.tolist()}")

        # Step 2: Convert rows into LangChain Documents
        documents = []
        for _, row in df.iterrows():
            content_parts = []
            if "Description" in row and pd.notna(row["Description"]):
                content_parts.append(str(row["Description"]))
            content = "\n".join(content_parts).strip()

            metadata = {
                k: v for k, v in row.items() if k not in ["Description"] and pd.notna(v)
            }

            if content:
                documents.append(Document(page_content=content, metadata=metadata))

        self.stdout.write(f"📄 Parsed {len(documents)} course documents")

        # Step 3: Embed and store in PGVector
        PGVector.from_documents(
            documents=documents,
            embedding=OpenAIEmbeddings(),
            connection=settings.PGVECTOR_CONNECTION,
            collection_name=COLLECTION_NAME,
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"✅ Embedded and stored {len(documents)} courses in PGVector collection '{COLLECTION_NAME}'"
            )
        )
