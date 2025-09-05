from typing_extensions import TypedDict


class LLMUsage(TypedDict, total=False):
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    cost: float
