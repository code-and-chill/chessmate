"""Candidate move domain model."""
from typing import List, Optional

from pydantic import BaseModel, Field


class Candidate(BaseModel):
    """A candidate move from engine analysis."""

    move: str = Field(..., description="Move in UCI notation (e.g., e2e4)")
    eval: float = Field(..., description="Evaluation in pawns from side-to-move perspective")
    depth: int = Field(..., description="Depth reached for this candidate")
    pv: Optional[List[str]] = Field(default=None, description="Principal variation (line of moves)")
