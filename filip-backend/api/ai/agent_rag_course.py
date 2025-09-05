import datetime
import json
import re

from langchain.agents import AgentType, Tool, initialize_agent
from langchain.chains import RetrievalQA
from langchain_openai import AzureChatOpenAI, AzureOpenAIEmbeddings
from langchain_postgres.vectorstores import PGVector

from filip import settings


def get_retriever():
    try:
        # First try to connect to existing collection
        vectorstore = PGVector.from_existing_index(
            embedding=AzureOpenAIEmbeddings(
                openai_api_version=settings.AZURE_OPENAI_API_VERSION,
                azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
                api_key=settings.AZURE_OPENAI_EMBEDDING_API_KEY,
                model=settings.AZURE_OPENAI_EMBEDDING_MODEL,
            ),
            connection=settings.PGVECTOR_CONNECTION,
            collection_name="course",
        )
    except Exception as e:
        # If collection exists but can't connect due to constraint violation,
        # try creating a new PGVector instance directly
        if "duplicate key value violates unique constraint" in str(e):
            vectorstore = PGVector(
                embedding_function=AzureOpenAIEmbeddings(
                    openai_api_version=settings.AZURE_OPENAI_API_VERSION,
                    azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
                    api_key=settings.AZURE_OPENAI_EMBEDDING_API_KEY,
                    model=settings.AZURE_OPENAI_EMBEDDING_MODEL,
                ),
                connection=settings.PGVECTOR_CONNECTION,
                collection_name="course",
                pre_delete_collection=False,  # Don't delete existing collection
            )
        else:
            raise e
    
    return vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 5})


def build_rag_chain():
    retriever = get_retriever()
    llm = AzureChatOpenAI(
        model=settings.AZURE_OPENAI_CHAT_MODEL,
        openai_api_version=settings.AZURE_OPENAI_API_VERSION,
        azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
        api_key=settings.AZURE_OPENAI_CHAT_API_KEY,
        temperature=0,
    )
    return RetrievalQA.from_chain_type(
        llm=llm, retriever=retriever, return_source_documents=True
    )


def query_chain(query: str) -> dict:
    chain = build_rag_chain()
    return chain.invoke({"query": query})


def extract_learning_path_name(text: str) -> str:
    match = re.search(
        r"(?i)(learning path name|suggested path name|learning path could be)\s*[:\-]?\s*(.+)",
        text,
    )
    if match:
        return match.group(2).strip().strip('"').strip(".")
    return "Custom Learning Path"


def get_course_tool() -> Tool:
    rag_chain = build_rag_chain()

    def structured_course_lookup(input: str) -> dict:
        result = rag_chain.invoke({"query": input})
        courses = []
        for doc in result.get("source_documents", []):
            md = doc.metadata
            url = md.get("URL", "")
            # Ask the LLM to extract details from the URL
            prompt = (
                f"Visit the following course page:\n{url}\n\n"
                "Extract and return these fields in JSON format:\n"
                "1. 'course_highlights': A bullet list from the 'What you'll learn' section\n"
                "2. 'related_topics': Broader topics or categories this course relates to\n\n"
                "Respond in this format: "
                '{"course_highlights": [...], "related_topics": [...]}'
            )
            scraper = AzureChatOpenAI(
                model=settings.AZURE_OPENAI_CHAT_MODEL,
                openai_api_version=settings.AZURE_OPENAI_API_VERSION,
                azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
                api_key=settings.AZURE_OPENAI_CHAT_API_KEY,
                temperature=0,
            )
            scraped = scraper.invoke(prompt).content
            try:
                if isinstance(scraped, str):
                    scraped_json = json.loads(scraped)
            except Exception as e:
                print(f"Error: {e}")
                scraped_json = {"course_highlights": [], "related_topics": []}

            courses.append(
                {
                    "course_rating": md.get("Ratings", 0),
                    "target": str(datetime.date.today()),
                    "course_level": md.get("Level", ""),
                    "course_description": doc.page_content.split("\n")[0],
                    "course_title": md.get("Title", ""),
                    "course_duration": md.get("Duration", ""),
                    "course_instructor": md.get("Instructors", "")
                    or md.get("Instructor", ""),
                    "course_price": md.get("Price", "") or md.get("Price (VND)", ""),
                    "course_url": url,
                    "course_skills": scraped_json["related_topics"],
                    "course_highlights": scraped_json["course_highlights"],
                    "course_provider": md.get("Provider", ""),
                    "course_students": md.get("Students", 0),
                }
            )
        learning_path_name = extract_learning_path_name(result.get("result", ""))
        recommendations = result.get("result")
        return {
            "learning_path_name": learning_path_name,
            "answer": recommendations,
            "courses": courses,
        }

    return Tool(
        name="StructuredCourseRecommender",
        func=structured_course_lookup,
        description="Use this to get internal courses with structured metadata to improve a specific skill. Returns structured metadata including title, URL, duration, and level.",
    )


def get_agent():
    tools = [get_course_tool()]
    llm = AzureChatOpenAI(
        model=settings.AZURE_OPENAI_CHAT_MODEL,
        openai_api_version=settings.AZURE_OPENAI_API_VERSION,
        azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
        api_key=settings.AZURE_OPENAI_CHAT_API_KEY,
        temperature=0,
    )
    return initialize_agent(
        tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
    )


def get_recommendations_for_skills(skills: list[dict]) -> dict:
    agent = get_agent()
    combined_query_parts = []
    skill_names = []

    for skill in skills:
        skill_name = skill.get("name") or skill.get("skill") or str(skill)
        level = skill.get("level", "general")
        combined_query_parts.append(f"'{skill_name}' ({level})")
        skill_names.append(skill_name.lower())

    combined_query = (
        "Given the following skills and levels: "
        + ", ".join(combined_query_parts)
        + ". Recommend the best internal courses to improve these skills, prioritizing relevance, appropriate level, and shorter durations. "
        "Also suggest a meaningful, concise name for the overall learning path."
    )

    raw_result = agent.tools[0].func(combined_query)

    for course in raw_result["courses"]:
        matched_skills = []
        for skill in course["course_skills"]:
            matched_skills.append(
                {"name": skill, "matched": skill.lower() in skill_names}
            )
        course["course_skills"] = matched_skills

    return {
        "learning_path_name": raw_result["learning_path_name"],
        "recommendations": raw_result["answer"],
        "courses": raw_result["courses"],
    }
