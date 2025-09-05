from langchain_community.callbacks.manager import get_openai_callback
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, StateGraph
from langgraph.graph.graph import CompiledGraph
from typing_extensions import Any, Dict, List, TypedDict, cast

from api.types import LLMUsage

from .agent_rag_skills import (
    compute_missing,
    enrich_skills_with_level,
    fetch_similar_role_skills,
    recommend_skills,
)


class SkillGapState(TypedDict, total=False):
    current_skills: List[Dict[str, str]]
    target_goal: str
    timeline: str
    project_requirements: str
    target_skills: List[Dict[str, str]]
    target_skills_raw: List[str]
    missing_skills: List[Dict[str, str]]
    recommended_skills: List[Dict[str, Any]]
    overall_score: int
    llm_usage: Dict[str, LLMUsage]
    total_cost: float


def with_cost_tracking(state: SkillGapState, tool, inputs):
    with get_openai_callback() as cb:
        result = tool.invoke(inputs)
        usage: LLMUsage = {
            "prompt_tokens": cb.prompt_tokens,
            "completion_tokens": cb.completion_tokens,
            "total_tokens": cb.total_tokens,
            "cost": cb.total_cost,
        }
        step_name = getattr(tool, "name", tool.__class__.__name__)
        state.setdefault("llm_usage", {})[step_name] = usage

    return result


# Step 1: Fetch role skills
def node_fetch_similar_role_skills(state: SkillGapState) -> SkillGapState:
    result = with_cost_tracking(
        state,
        fetch_similar_role_skills,
        {"target_goal": state.get("target_goal")},
    )
    return {
        "target_skills_raw": result,
        "llm_usage": cast(Dict[str, LLMUsage], state.get("llm_usage")),
    }


# Step 2: Enrich with levels
def node_enrich_skills(state: SkillGapState) -> SkillGapState:
    result = with_cost_tracking(
        state,
        enrich_skills_with_level,
        {
            "skills": state.get("target_skills_raw"),
            "target_goal": state.get("target_goal"),
        },
    )

    return {
        "target_skills": result,
        "llm_usage": cast(Dict[str, LLMUsage], state.get("llm_usage")),
    }


# Step 3: Compute missing
def node_compute_missing(state: SkillGapState) -> SkillGapState:
    result = with_cost_tracking(
        state,
        compute_missing,
        {
            "current_skills": state.get("current_skills"),
            "target_skills": state.get("target_skills"),
        },
    )

    return {
        "missing_skills": result.get("missing_skills"),
        "overall_score": result.get("overall_score"),
        "llm_usage": cast(Dict[str, LLMUsage], state.get("llm_usage")),
    }


# Step 4: Recommend skills
def node_recommend_skills(state: SkillGapState) -> SkillGapState:
    result = with_cost_tracking(
        state,
        recommend_skills,
        {
            "current_skills": state.get("current_skills"),
            "missing_skills": state.get("missing_skills"),
            "target_goal": state.get("target_goal"),
            "timeline": state.get("timeline"),
            "project_requirements": state.get("project_requirements"),
        },
    )

    return {
        "recommended_skills": result,
        "llm_usage": cast(Dict[str, LLMUsage], state.get("llm_usage")),
    }


def build_skill_gap_graph(checkpointer: MemorySaver) -> CompiledGraph:
    builder = StateGraph(SkillGapState)

    builder.add_node("fetch_skills", node_fetch_similar_role_skills)
    builder.add_node("enrich_skills", node_enrich_skills)
    builder.add_node("compute_missing", node_compute_missing)
    builder.add_node("recommend_skills", node_recommend_skills)

    builder.set_entry_point("fetch_skills")
    builder.add_edge("fetch_skills", "enrich_skills")
    builder.add_edge("enrich_skills", "compute_missing")
    builder.add_edge("compute_missing", "recommend_skills")
    builder.add_edge("recommend_skills", END)

    return builder.compile(checkpointer=checkpointer, debug=True)


_graph: CompiledGraph | None = None


def get_skill_gap_graph():
    global _graph
    if _graph is None:
        checkpointer = MemorySaver()
        _graph = build_skill_gap_graph(checkpointer)
    return _graph


def run_skill_gap_pipeline(
    current_skills: List[Dict[str, str]],
    target_goal: str,
    timeline: str,
    project_requirements: str,
    thread_id: str,
) -> SkillGapState:
    graph = get_skill_gap_graph()

    final_state = cast(
        SkillGapState,
        graph.invoke(
            {
                "current_skills": current_skills,
                "target_goal": target_goal,
                "timeline": timeline,
                "project_requirements": project_requirements,
            },
            config={"configurable": {"thread_id": thread_id}},
        ),
    )

    return final_state
