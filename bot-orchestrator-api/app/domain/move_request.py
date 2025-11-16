"""Move request domain model."""
from __future__ import annotations

from pydantic import BaseModel, Field

from .clocks import Clocks
from .types import Color


class MoveRequest(BaseModel):
    """Request to calculate a bot move."""

    game_id: str
    bot_color: Color
    fen: str
    move_number: int
    clocks: Clocks
    metadata: dict = Field(default_factory=dict)
    debug: bool = False
