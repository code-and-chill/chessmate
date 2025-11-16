"""Move response domain model."""
from __future__ import annotations
from typing import Optional

from pydantic import BaseModel

from .debug_info import DebugInfo


class MoveResponse(BaseModel):
    """Response with selected bot move."""

    game_id: str
    bot_id: str
    move: str
    thinking_time_ms: int
    debug_info: Optional[DebugInfo] = None
