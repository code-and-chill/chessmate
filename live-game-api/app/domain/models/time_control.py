"""Time control domain model."""
from pydantic import BaseModel, Field, field_validator


class TimeControl(BaseModel):
    """Time control configuration."""

    initial_seconds: int = Field(..., gt=0)
    increment_seconds: int = Field(default=0, ge=0)

    @field_validator("initial_seconds")
    @classmethod
    def validate_initial_seconds(cls, v):
        if v < 1:
            raise ValueError("Initial time must be at least 1 second")
        if v > 86400:  # 24 hours max
            raise ValueError("Initial time cannot exceed 24 hours")
        return v
