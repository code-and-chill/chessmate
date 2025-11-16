"""Tablebase response DTO."""
from typing import Optional

from pydantic import BaseModel, Field


class TablebaseResponse(BaseModel):
    """Response from tablebase query."""

    best_move: str = Field(..., description="Best move in UCI notation")
    result: str = Field(..., description="Game result: win/draw/loss from side-to-move perspective")
    dtm: Optional[int] = Field(default=None, description="Distance to mate (moves)")
