from django.core.management.base import BaseCommand
from langchain.chains.summarize import load_summarize_chain
from langchain.prompts import PromptTemplate
from langchain.schema import Document
from langchain.schema.document import Document as LangchainDocument
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_postgres.vectorstores import PGVector

from api.models import JobPost
from filip import settings


class Command(BaseCommand):
    help = "Generate and store vector embeddings for job posts into PGVector in batches"

    def handle(self, *args, **options):
        COLLECTION_NAME = "jobpost"
        BATCH_SIZE = 10

        job_posts = JobPost.objects.filter(embedding__isnull=True)
        count = job_posts.count()

        self.stdout.write(f"Generating embeddings for {count} job posts...")

        if count == 0:
            self.stdout.write(self.style.WARNING("No job posts to process."))
            return

        llm = ChatOpenAI(model="gpt-4o", temperature=0)

        prompt_template = """
        Summarize the following job description in a concise paragraph that captures:
        1. Main responsibilities
        2. Key requirements
        3. Important qualifications

        Keep the summary to about 150 words maximum while preserving the most essential information.

        JOB DESCRIPTION:
        {text}

        CONCISE SUMMARY:
        """
        PROMPT = PromptTemplate(template=prompt_template, input_variables=["text"])
        summarize_chain = load_summarize_chain(llm, chain_type="stuff", prompt=PROMPT)

        all_ids = list(job_posts.values_list("id", flat=True))

        for start in range(0, count, BATCH_SIZE):
            end = min(start + BATCH_SIZE, count)
            batch_ids = all_ids[start:end]
            batch = list(JobPost.objects.filter(id__in=batch_ids))

            self.stdout.write(f"📦 Processing batch {start+1}–{end} of {count}...")

            updated_posts = []
            documents = []

            for i, job_post in enumerate(batch):
                self.stdout.write(
                    f"📦 Processing job_id: {job_post.id} ({start + i + 1} of {count})..."
                )
                try:
                    doc = [LangchainDocument(page_content=job_post.job_description)]
                    summary = summarize_chain.run(doc)
                except Exception as e:
                    self.stdout.write(
                        self.style.WARNING(
                            f"❌ Error summarizing job {job_post.id}: {e}"
                        )
                    )
                    summary = job_post.job_description[:500] + "..."

                # Update summary field in memory
                job_post.summary = summary
                updated_posts.append(job_post)

                skills_text = ", ".join(job_post.skills)
                content = (
                    f"Title: {job_post.job_title}\n"
                    f"Category: {job_post.category}\n"
                    f"Summary: {summary}\n"
                    f"Skills: {skills_text}"
                )

                metadata = {
                    "job_id": job_post.job_id,
                    "job_title": job_post.job_title,
                    "category": job_post.category,
                    "skills": job_post.skills,
                }

                documents.append(Document(page_content=content, metadata=metadata))

            # Update summaries in DB in bulk
            try:
                JobPost.objects.bulk_update(updated_posts, ["summary"])
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"🚨 Failed to update summaries for batch: {e}")
                )

            # Store embeddings in PGVector
            if documents:
                try:
                    PGVector.from_documents(
                        documents=documents,
                        embedding=OpenAIEmbeddings(),
                        connection=settings.PGVECTOR_CONNECTION,
                        collection_name=COLLECTION_NAME,
                    )
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"✅ Embedded and stored batch {start+1}–{end} in '{COLLECTION_NAME}'"
                        )
                    )
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(
                            f"🚨 Failed to embed batch {start+1}–{end}: {e}"
                        )
                    )

        self.stdout.write(self.style.SUCCESS("🎉 All batches processed."))
