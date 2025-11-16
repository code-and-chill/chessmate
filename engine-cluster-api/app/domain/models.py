from __future__ import annotations
from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class EvaluateRequest(BaseModel):
    fen: str = Field(..., description="Position in FEN notation")
    side_to_move: Literal["w", "b"] = Field(..., description="Side to move (w/b)")
    max_depth: int = Field(default=12, ge=1, le=30, description="Maximum search depth")
    time_limit_ms: int = Field(default=1000, ge=10, le=30000, description="Time limit in milliseconds")
    multi_pv: int = Field(default=1, ge=1, le=10, description="Number of principal variations")


class Candidate(BaseModel):
    move: str = Field(..., description="Move in UCI notation (e.g., e2e4)")
    eval: float = Field(..., description="Evaluation in pawns from side-to-move perspective")
    depth: int = Field(..., description="Depth reached for this candidate")
    pv: Optional[List[str]] = Field(default=None, description="Principal variation (line of moves)")


class EvaluateResponse(BaseModel):
    candidates: List[Candidate]
    fen: str
    time_ms: int
