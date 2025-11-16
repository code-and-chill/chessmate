"""Time control request model."""
from pydantic import BaseModel, Field


class TimeControlRequest(BaseModel):
    """Time control request model."""

    initial_seconds: int = Field(..., gt=0)
    increment_seconds: int = Field(default=0, ge=0)
