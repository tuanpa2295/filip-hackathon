import json
from io import BytesIO

import textract
from django.core.files.uploadedfile import UploadedFile
from docx import Document
from langchain_community.callbacks.manager import get_openai_callback
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import AzureChatOpenAI
from typing_extensions import Dict, List, TypedDict, cast

from api.types import Education, Experience, LLMUsage, SkillGap
from filip import settings


class CVExtractionResult(TypedDict):
    experience: Experience
    education: List[Education]
    extracted_skills: List[SkillGap]
    llm_usage: Dict[str, LLMUsage]


def extract_text_from_file(file: UploadedFile) -> str:
    filename = (file.name or "").lower()

    file.seek(0)
    content = file.read()

    if filename.endswith(".docx"):
        doc = Document(BytesIO(content))
        return "\n".join(p.text for p in doc.paragraphs if p.text.strip())
    else:
        try:
            text = textract.process(filename, input_data=content).decode("utf-8")
            return text
        except Exception as e:
            raise RuntimeError(f"Text extraction failed: {str(e)}")


def extract_data_from_cv_text(cv_text: str) -> CVExtractionResult:
    llm = AzureChatOpenAI(
        openai_api_version=settings.AZURE_OPENAI_API_VERSION,
        azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
        api_key=settings.AZURE_OPENAI_CHAT_API_KEY,
        model=settings.AZURE_OPENAI_CHAT_MODEL,
        temperature=0,
    )

    system_prompt = (
        "You are an AI that extracts structured information from a CV.\n"
        "Your output MUST be a single raw JSON object with exactly 1 field:\n"
        "1. extracted_skills (array): each item must include:\n"
        "   - name (string)\n"
        "   - level (string): 'beginner', 'intermediate', or 'advanced'\n"
        "   - confidence (int): 0–100 — this represents your confidence in detecting this skill based on the user's described work experience and projects\n"
        "   - category (string): general grouping (e.g., 'Programming', 'Cloud', etc.)\n\n"
        "**Important:** Output ONLY a valid raw JSON object. No markdown, no explanation, no comments, no code fences."
    )

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=cv_text),
    ]

    with get_openai_callback() as cb:
        response = llm.invoke(messages)
        usage = {
            "prompt_tokens": cb.prompt_tokens,
            "completion_tokens": cb.completion_tokens,
            "total_tokens": cb.total_tokens,
            "cost": cb.total_cost,
        }

    response = llm.invoke(messages)
    raw = cast(str, response.content).strip()

    try:
        parsed = json.loads(raw)

        # Basic structure validation
        if not isinstance(parsed, dict):
            raise ValueError("Output is not a dictionary.")

        required_fields = {"extracted_skills"}
        if not required_fields.issubset(parsed):
            raise ValueError("Missing required field: extracted_skills")

        parsed["llm_usage"] = {"extract_data_from_cv": usage}
        return cast(CVExtractionResult, parsed)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON: {e}")
