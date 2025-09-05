import logging

from openai import AzureOpenAI

from filip import settings

# Configure Azure OpenAI client
client = AzureOpenAI(
    api_key=settings.AZURE_OPENAI_EMBEDDING_API_KEY,
    api_version=settings.AZURE_OPENAI_API_VERSION,
    azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
)

logger = logging.getLogger(__name__)


def embed_text(text: str) -> list[float] | None:
    try:
        response = client.embeddings.create(
            model=settings.AZURE_OPENAI_EMBEDDING_MODEL,
            input=text,
        )
        return response.data[0].embedding
    except Exception as e:
        logger.error("Embedding failed for: %s\n%s", text[:100], e)
        return None
