import logging

import openai

from filip import settings

openai.api_key = settings.OPENAI_API_KEY
logger = logging.getLogger(__name__)


def embed_text(text: str) -> list[float] | None:
    try:
        response = openai.embeddings.create(
            model="text-embedding-3-small",
            input=text,
        )
        return response.data[0].embedding
    except Exception as e:
        logger.error("Embedding failed for: %s\n%s", text[:100], e)
        return None
