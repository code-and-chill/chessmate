"""Book move DTO."""
from typing import Optional

from pydantic import BaseModel, Field


class BookMove(BaseModel):
    """A move from the opening book."""

    move: str = Field(..., description="Move in UCI notation")
    weight: float = Field(..., description="Weight/popularity of this move (0.0-1.0)")
    games: Optional[int] = Field(default=None, description="Number of games with this move")
    win_rate: Optional[float] = Field(default=None, description="Win rate for this move")
