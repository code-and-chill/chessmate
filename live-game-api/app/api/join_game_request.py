"""Join game request model."""
from pydantic import BaseModel, Field


class JoinGameRequest(BaseModel):
    """Join game request model."""

    color_preference: str = Field(default="random", pattern=r"^(white|black|random)$")
