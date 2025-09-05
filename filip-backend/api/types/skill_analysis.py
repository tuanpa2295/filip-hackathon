from typing_extensions import List, Literal, TypedDict


class Education(TypedDict):
    degree: str
    institution: str
    year: int


class Experience(TypedDict):
    total_years: int
    current_role: str
    industry: str
    companies: List[str]


class SkillGap(TypedDict, total=False):
    name: str
    level: Literal["beginner", "intermediate", "advanced"]
    confidence: int
    category: str
    type: Literal["current", "new"]
    priority: Literal["high", "medium", "low"]
    relevant_info: str
    description: str
    market_demand: int  # 0–100 scale
    salary_impact: str  # e.g., "+15%", "-5%"
