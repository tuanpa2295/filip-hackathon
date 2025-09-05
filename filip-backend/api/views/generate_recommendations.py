from django.http import JsonResponse, StreamingHttpResponse
from openai import OpenAI
from pgvector.django import CosineDistance
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from api.models import UdemyCourse
from api.utils.embedding import embed_text
from filip import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)


class GenerateRecommendationsView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        prompt = request.data.get("prompt")
        if not prompt:
            return JsonResponse({"error": "Query is required"}, status=400)

        # Step 1: Embed query
        embedding = embed_text(prompt)
        if embedding is None:
            return JsonResponse({"error": "Embedding failed"}, status=500)

        # Step 2: Vector search with Django ORM
        courses = (
            UdemyCourse.objects.annotate(
                similarity=CosineDistance("embedding", embedding)
            )
            .order_by("similarity")[:30]
            .values_list("title", "description", "level", "url", "duration")
        )

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
            except Exception as e:
                yield f"\n\n[Error from OpenAI: {e}]"

        return StreamingHttpResponse(gpt_stream(), content_type="text/plain")
