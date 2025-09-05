import json

import numpy as np
from langchain.chat_models import init_chat_model
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, ToolMessage
from langchain_core.tools import tool
from langchain_openai import AzureChatOpenAI, AzureOpenAIEmbeddings
from langchain_postgres.vectorstores import PGVector
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.prebuilt import create_react_agent
from sklearn.metrics.pairwise import cosine_similarity
from threadpoolctl import textwrap
from typing_extensions import (
    Annotated,
    Any,
    Dict,
    List,
    Optional,
    Union,
    cast,
)

from api.types import SkillGap
from filip import settings


def _skills_to_str(current_skills: List[Dict[str, str]]) -> str:
    return "\n".join(
        f"- name: {s['name']}, level: {s['level']}" for s in current_skills
    )


@tool
def fetch_similar_role_skills(
    target_goal: Annotated[str, "Job title or free-form role description."], k: int = 10
) -> List[str]:
    """
    Step 1 of 4: Fetch required skills for the target role.
    This is the first step in the skill gap analysis.

    Given a free-text job title or description (e.g. "Senior Backend Engineer"),
    return a list of skills (name only).
    """
    # Initialize Azure OpenAI embeddings & vector store over your existing 'jobpost' collection
    embedder = AzureOpenAIEmbeddings(
        api_key=settings.AZURE_OPENAI_EMBEDDING_API_KEY,
        azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
        api_version=settings.AZURE_OPENAI_API_VERSION,
        model=settings.AZURE_OPENAI_EMBEDDING_MODEL
    )
    vectorstore = PGVector.from_existing_index(
        connection=settings.PGVECTOR_CONNECTION,
        embedding=embedder,
        collection_name="jobpost",
    )
    # Embed query and perform similarity search
    query_emb = embedder.embed_query(target_goal)
    results = vectorstore.similarity_search_by_vector(query_emb, k=k)

    # Return skills from the top match
    if not results:
        return []
    top = results[0]
    skills = top.metadata.get("skills", [])

    return skills


@tool
def enrich_skills_with_level(
    skills: Annotated[List[str], "List of skill names without level"],
    target_goal: Annotated[str, "The job title or role these skills should support"],
) -> List[Dict[str, str]]:
    """
    Step 2 of 4: Normalize and validate skills with default levels.
    This is the second step in the skill gap analysis

    Given a list of skill names returned by a database query (which may contain irrelevant entries),
    and a target career goal, the LLM should validate each skill's relevance and assign a reasonable default level
    (beginner, intermediate, advanced) based on typical industry expectations for that role.

    Output format:
    [
        { "name": "Git", "level": "intermediate" }
    ]
    """
    llm = AzureChatOpenAI(
        api_key=settings.AZURE_OPENAI_CHAT_API_KEY,
        azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
        api_version=settings.AZURE_OPENAI_API_VERSION,
        model=settings.AZURE_OPENAI_CHAT_MODEL,
        temperature=0
    )
    skills_list_text = "\n".join(f"- {skill}" for skill in skills)

    prompt = (
        f"You are reviewing a list of technical skills for the role: '{target_goal}'.\n"
        "These skills were retrieved from a database and may include outdated, irrelevant, or incorrect items.\n"
        "Your task is to filter out irrelevant or invalid skills, and assign each valid skill a skill level:\n"
        "  - beginner\n"
        "  - intermediate\n"
        "  - advanced\n\n"
        "Return ONLY a raw JSON array of cleaned and enriched skill objects.\n"
        "Do not include any explanatory text, markdown, or code formatting.\n\n"
        "Input skills:\n"
        f"{skills_list_text}\n\n"
        "Example output:\n"
        '[{ "name": "Docker", "level": "intermediate" }, ...]'
    )

    response = llm.invoke([HumanMessage(content=prompt)])
    raw = cast(str, response.content).strip()
    try:
        enriched = json.loads(raw)
        if not isinstance(enriched, list):
            raise ValueError("Expected a JSON array")
        return enriched
    except json.JSONDecodeError:
        raise ValueError("Invalid JSON in enrichment output")


@tool
def compute_missing(
    current_skills: Annotated[
        List[Dict[str, str]], "List of current skills (each with name and level)"
    ],
    target_skills: Annotated[
        List[Dict[str, str]], "List of target skills (each with name and level)"
    ],
) -> Dict[str, Any]:
    """
    Step 3 of 4: Identify missing or underdeveloped skills.
    This is the third step in the skill gap analysis.

    Compares user's current skills with target role using semantic similarity (embeddings) and level rank.

    Returns:
    - missing_skills: list of missing or underdeveloped skills (name and required level)
    - overall_score: a percentage score (0–100) representing how well current skills match target role
    """
    threshold: float = 0.9
    level_rank = {"beginner": 0, "intermediate": 1, "advanced": 2}
    embedder = AzureOpenAIEmbeddings(
        api_key=settings.AZURE_OPENAI_EMBEDDING_API_KEY,
        azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
        api_version=settings.AZURE_OPENAI_API_VERSION,
        model=settings.AZURE_OPENAI_EMBEDDING_MODEL
    )

    current_names = [s["name"] for s in current_skills]
    current_levels = {s["name"]: s["level"] for s in current_skills}
    target_names = [t["name"] for t in target_skills]

    cur_emb = np.array(embedder.embed_documents(current_names))
    tgt_emb = np.array(embedder.embed_documents(target_names))
    sim_matrix = cosine_similarity(tgt_emb, cur_emb)

    missing_skills: List[Any] = []
    best_similarities: List[float] = []

    for i, target_skill in enumerate(target_skills):
        target_name = target_skill["name"]
        required_level = target_skill.get("level", "intermediate")

        best_match_idx = np.argmax(sim_matrix[i])
        similarity = sim_matrix[i][best_match_idx]
        best_similarities.append(similarity)

        if similarity < threshold:
            missing_skills.append({"name": target_name, "level": required_level})
        else:
            matched_name = current_names[best_match_idx]
            current_level = current_levels.get(matched_name, "beginner")

            if level_rank.get(current_level, 0) < level_rank.get(required_level, 1):
                missing_skills.append({"name": target_name, "level": required_level})

    # Compute average similarity score (scaled to 0–100)
    overall_score = round(float(np.mean(best_similarities)) * 100, 2)

    return {"missing_skills": missing_skills, "overall_score": overall_score}


@tool
def recommend_skills(
    current_skills: Annotated[
        List[Dict[str, str]],
        "User's current skills with levels (e.g: {name: Git, level: intermediate})",
    ],
    missing_skills: Annotated[
        List[Dict[str, str]], "List of missing skills with a name and a required level"
    ],
    target_goal: Annotated[str, "Career goal or job title"],
    timeline: Annotated[str, "How many months (or years) available to learn"],
    project_requirements: Annotated[str, "Optional constraints"] = "",
) -> List[SkillGap]:
    """
    Step 4 of 4: Recommend prioritized skills to achieve the target goal.

    The advisor should evaluate the user's current skills, the missing skills, the timeline,
    and any project constraints, to generate a list of at least 10 prioritized skills to pursue.

    Skills can include:
    - New skills not yet known by the user
    - Existing skills that should be leveled up (e.g., intermediate → advanced)

    Each recommended skill must include:
      - name (str)
      - level (str): 'beginner' | 'intermediate' | 'advanced'
      - priority (str): 'High' | 'Medium' | 'Low'
      - description (str): why the skill matters
      - market_demand (int): 0–100 scale
      - salary_impact (str): e.g., '+15%', '-5%'
      - type (str): 'new' or 'current'
      - relevant_info (str): rationale based on user's current level and career goal

    The final list will be sorted by priority: High → Medium → Low.
    """
    llm = AzureChatOpenAI(
        api_key=settings.AZURE_OPENAI_CHAT_API_KEY,
        azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
        api_version=settings.AZURE_OPENAI_API_VERSION,
        model=settings.AZURE_OPENAI_CHAT_MODEL,
        temperature=0
    )

    messages = [
        SystemMessage(
            content=(
                "You are a career development advisor.\n"
                "Recommend the most impactful skills to help the user reach their target role.\n\n"
                "Use all of the following information:\n"
                "- The user's current skills and levels\n"
                "- The required skills (missing or underdeveloped)\n"
                "- The target job title (goal)\n"
                "- The available learning timeline (in months)\n"
                "- Any project-specific constraints\n\n"
                "You must suggest at least 10 skills, including:\n"
                "- New skills that the user has not yet learned (type: 'new')\n"
                "- Existing skills that should be upgraded (e.g., from 'intermediate' to 'advanced') — set their type to 'current'\n\n"
                "For current skills, check whether the user's level is below 'advanced'. If so, and the skill is valuable for the target role, include it with a higher level.\n"
                "Return ONLY a valid raw JSON array of at least **10 skill objects**. No markdown, no explanations, no code fences.\n\n"
                "Each skill must include the following fields:\n"
                "- name (string)\n"
                "- level (string): 'beginner', 'intermediate', or 'advanced'\n"
                "- priority (string): 'High', 'Medium', or 'Low'\n"
                "- description (string): why the skill matters\n"
                "- market_demand (int): 0–100\n"
                "- salary_impact (string): e.g., '+15%'\n"
                "- type (string): 'new' if not yet known, or 'current' if already known and needs deeper proficiency\n"
                "- relevant_info (string): justification based on their CV or role transition\n"
            )
        ),
        HumanMessage(
            content=(
                f"You are helping a user become a {target_goal}.\n"
                f"Here are their current skills and levels:\n{_skills_to_str(current_skills)}\n\n"
                f"Here are the missing skills (with required level):\n{_skills_to_str(missing_skills)}\n\n"
                f"Timeline: {timeline}\n"
                f"Project requirements: {project_requirements or 'None'}\n\n"
                "Return a list of at least 10 structured skill recommendations. Include both new skills and existing skills that should be improved."
            )
        ),
    ]

    response = llm.invoke(messages)
    raw = cast(str, response.content).strip()
    priority_order = {"High": 0, "Medium": 1, "Low": 2}

    try:
        skills = json.loads(raw)
        if not isinstance(skills, list) or len(skills) < 5:
            raise ValueError(
                "Returned value is not a valid list with at least 5 items."
            )
        skills.sort(key=lambda s: priority_order.get(s.get("priority", "Medium"), 1))
        return skills
    except json.JSONDecodeError:
        raise ValueError("Response is not a valid JSON array.")


def create_skill_gap_tools():
    """Create and return the tools used by the agent."""
    return [
        fetch_similar_role_skills,
        enrich_skills_with_level,
        compute_missing,
        recommend_skills,
    ]


def create_agent():
    """Create and return an initialized agent with the appropriate tools."""
    model = init_chat_model(model="openai:gpt-4o", temperature=0)
    tools = create_skill_gap_tools()
    checkpointer = InMemorySaver()

    return create_react_agent(
        model=model,
        tools=tools,
        checkpointer=checkpointer,
        debug=True,
    )


# Use lazy initialization to create the agent only when needed
_agent = None


def get_skill_gap_agent():
    """Get the singleton agent instance, creating it if necessary."""
    global _agent
    if _agent is None:
        _agent = create_agent()
    return _agent


def try_json_parse(value: Union[str, None]) -> Optional[Union[dict, list]]:
    if not value or not isinstance(value, str):
        return None
    try:
        return json.loads(value)
    except json.JSONDecodeError:
        return None


def extract_agent_trace(messages: List[Any]) -> Dict[str, Any]:
    trace: Dict[str, Any] = {
        "input": None,
        "tool_calls": [],
        "tool_outputs": [],
        "final_output": None,
        "parsed_tool_outputs": {},
        "parsed_final_output": None,
    }

    for msg in messages:
        if isinstance(msg, HumanMessage) and trace["input"] is None:
            trace["input"] = msg.content

        elif isinstance(msg, AIMessage):
            if msg.tool_calls:
                for tool_call in msg.tool_calls:
                    trace["tool_calls"].append(
                        {"tool": tool_call["name"], "args": tool_call["args"]}
                    )
            elif msg.content:
                trace["final_output"] = msg.content

        elif isinstance(msg, ToolMessage):
            tool_name = msg.name
            output = msg.content
            trace["tool_outputs"].append({"tool": tool_name, "output": output})
            parsed = try_json_parse(cast(str, output))
            if parsed is not None:
                trace["parsed_tool_outputs"][tool_name] = parsed

    return trace


def run_skill_gap_analysis(
    current_skills: List[Dict[str, str]],
    target_goal: str,
    timeline: str,
    project_requirements: str,
    thread_id: str,
):
    input_str = textwrap.dedent(
        f"""
        You are an expert assistant helping a user become a {target_goal}.

        Follow these 4 steps **exactly in this order**. You must use the output of each tool as the input to the next tool.
        NEVER invent skill data or skip required inputs.

        ### Tool Call Policy:
        - All tool calls must include **all required fields**.
        - The tool `compute_missing` requires 3 arguments: `current_input`, `target_input`, and `threshold`.
        - If any are missing, the tool will fail and you must restart. Do NOT make partial calls.
        - Before reusing a prior tool's output, echo the full structured result as a JSON block.

        ### Step-by-step instructions:

        1. Call `fetch_similar_role_skills` using the `target_goal`.
        - This will return a list of required skills, either with or without skill levels.

        2. Call `enrich_skills_with_level` using the **exact output from Step 1**.
        - This guarantees that all skills have both `name` and `level` fields.
        - Echo the output exactly in this format:
        target_skills:
        ```json
            [
                {{ "name": "Skill1", "level": "intermediate" }}
                {{ "name": "Skill2", "level": "advanced" }}
            ]
        - This will be reused in the next step.

        3. Call `compute_missing` using:
        - `current_skills`: the same list of current skills you received at the beginning (do not regenerate or change it)
        - `target_skills`: the `target_skills` block you echoed above
        - You MUST include all 2 parameters in the tool call. Do NOT omit any of them.
        - This will return:
            - `missing_skills`: a list of skills that are either missing or require improvement
            - `overall_score`: a float from 0 to 100 representing how well the user's skills match the target requirements

        4. Call `recommend_skills` with:
        - `current_skills`: the user's current skills (same as above)
        - `missing_skills`: the exact result from Step 3
        - `target_goal`: the goal passed to you
        - `timeline`: how many months (or years) the user has available to learn
        - `project_requirements`: optional string to customize focus areas

        ### Output constraints:
        - NEVER call a tool with empty arguments.
        - NEVER invent skills or levels on your own.
        - ONLY use tool outputs as tool inputs in later steps.
        - If any step returns an empty list, proceed anyway using the empty result.

        ### User context:
        - Current skills:
        {_skills_to_str(current_skills)}

        - Target goal: {target_goal}
        - Timeline: {timeline}
        - Project requirements: {project_requirements}
    """
    )

    result = get_skill_gap_agent().invoke(
        {
            "messages": [
                HumanMessage(content=input_str),
            ],
            "current_skills": current_skills,
            "target_goal": target_goal,
            "timeline": timeline,
            "project_requirements": project_requirements,
        },
        config={
            "configurable": {"thread_id": thread_id},
        },
    )

    return extract_agent_trace(result["messages"])
