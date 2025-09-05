from django.core.management.base import BaseCommand
from django.db import transaction
from langchain.embeddings.openai import OpenAIEmbeddings

from api.models import Skill

BATCH_SIZE = 10

embedder = OpenAIEmbeddings()


class Command(BaseCommand):
    help = "Embed all Skill entries missing embeddings using OpenAI."

    def handle(self, *args, **kwargs):
        skills_qs = Skill.objects.filter(embedding__isnull=True).only("id", "name")
        total = skills_qs.count()

        if total == 0:
            self.stdout.write(self.style.SUCCESS("No skills need embedding."))
            return

        self.stdout.write(f"Found {total} skills to embed...")

        updated_total = 0

        with transaction.atomic():
            for i in range(0, total, BATCH_SIZE):
                batch = list(skills_qs[i : i + BATCH_SIZE])
                for skill in batch:
                    try:
                        vector = embedder.embed_query(skill.name)
                        skill.embedding = vector
                    except Exception as e:
                        self.stderr.write(f"❌ Failed to embed '{skill.name}': {e}")

                Skill.objects.bulk_update(batch, ["embedding"])
                updated_total += len(batch)
                self.stdout.write(f"✅ Embedded {updated_total}/{total}")

        self.stdout.write(
            self.style.SUCCESS(f"✅ Done. {updated_total} skills embedded.")
        )
