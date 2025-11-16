"""Engine evaluation request model."""
from typing import Literal

from pydantic import BaseModel, Field


class EvaluateRequest(BaseModel):
    """Request to evaluate a chess position."""

    fen: str = Field(..., description="Position in FEN notation")
    side_to_move: Literal["w", "b"] = Field(..., description="Side to move (w/b)")
    max_depth: int = Field(default=12, ge=1, le=30, description="Maximum search depth")
    time_limit_ms: int = Field(default=1000, ge=10, le=30000, description="Time limit in milliseconds")
    multi_pv: int = Field(default=1, ge=1, le=10, description="Number of principal variations")
