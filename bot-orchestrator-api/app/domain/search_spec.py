"""Search specification domain model."""
from pydantic import BaseModel


class SearchSpec(BaseModel):
    """Search/engine configuration."""

    depth_min: int
    depth_max: int
    multi_pv: int
    think_time_ms_min: int
    think_time_ms_max: int
