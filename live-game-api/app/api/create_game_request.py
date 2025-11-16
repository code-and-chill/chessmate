"""Create game request model."""
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from .time_control_request import TimeControlRequest


class CreateGameRequest(BaseModel):
    """Create game request model."""

    opponent_account_id: Optional[UUID] = None
    color_preference: str = Field(default="random", pattern=r"^(white|black|random)$")
    time_control: TimeControlRequest
    rated: bool = True
