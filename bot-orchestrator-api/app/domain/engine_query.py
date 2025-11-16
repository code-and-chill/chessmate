"""Engine query domain model."""
from pydantic import BaseModel


class EngineQuery(BaseModel):
    """Engine query parameters."""

    time_limit_ms: int
    max_depth: int
    multi_pv: int
