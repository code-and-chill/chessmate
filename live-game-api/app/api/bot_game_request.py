"""Create bot game request model."""
from pydantic import BaseModel, Field

from .time_control_request import TimeControlRequest


class CreateBotGameRequest(BaseModel):
    """Create bot game request model."""

    difficulty: str = Field(
        ..., 
        pattern=r"^(beginner|easy|medium|hard|expert|master)$",
        description="Bot difficulty level"
    )
    player_color: str = Field(
        default="random",
        pattern=r"^(white|black|random)$",
        description="Color preference for the human player"
    )
    time_control: TimeControlRequest
    rated: bool = Field(default=False, description="Bot games are always unrated")

