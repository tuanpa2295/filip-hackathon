import logging
from django.http import JsonResponse, StreamingHttpResponse
from openai import OpenAI
from pgvector.django import CosineDistance
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from api.models import UdemyCourse
from api.utils.embedding import embed_text
from filip import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)
logger = logging.getLogger(__name__)


class GenerateRecommendationsView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        logger.info(f"Generate recommendations request started - IP: {request.META.get('REMOTE_ADDR')}")
        
        prompt = request.data.get("prompt")
        if not prompt:
            logger.warning("Generate recommendations failed: Missing query parameter")
            return JsonResponse({"error": "Query is required"}, status=400)

        logger.info(f"Processing recommendation query: '{prompt[:100]}...'")

        # Step 1: Embed query
        logger.debug("Generating embedding for query")
        embedding = embed_text(prompt)
        if embedding is None:
            logger.error("Embedding generation failed for query")
            return JsonResponse({"error": "Embedding failed"}, status=500)

        # Step 2: Vector search with Django ORM
        logger.debug("Performing vector search in database")
        courses = (
            UdemyCourse.objects.annotate(
                similarity=CosineDistance("embedding", embedding)
            )
            .order_by("similarity")[:30]
            .values_list("title", "description", "level", "url", "duration")
        )

        logger.info(f"Found {len(courses)} relevant courses from vector search")

        # Step 3: Format text for prompt
        courses_text = ""
        for i, (title, description, level, url, duration) in enumerate(courses, 1):
            courses_text += (
                f"{i}. [{level}] {title}\n"
                f"Description: {description}\nURL: {url}\nDuration: {duration}\n\n"
            )

        openai_prompt = f"""
You are an academic advisor. Create a 2-month study plan for Python based on these courses:
{courses_text}
Respond with steps, each containing course title, duration, URL, and estimated price.
"""

        # Step 4: Streaming GPT response
        def gpt_stream():
            try:
                logger.debug("Starting OpenAI streaming response")
                response = client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {"role": "system", "content": "You are an academic advisor."},
                        {"role": "user", "content": openai_prompt},
                    ],
                    stream=True,
                )
                for chunk in response:
                    content = chunk.choices[0].delta.content
                    if content:
                        yield content
                logger.info("OpenAI streaming response completed successfully")
            except Exception as e:
                logger.error(f"OpenAI streaming failed: {str(e)}", exc_info=True)
                yield f"\n\n[Error from OpenAI: {e}]"

        return StreamingHttpResponse(gpt_stream(), content_type="text/plain")
