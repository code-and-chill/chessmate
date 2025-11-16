"""Engine evaluation response model."""
from __future__ import annotations
from typing import List

from pydantic import BaseModel

from .candidate import Candidate


class EvaluateResponse(BaseModel):
    """Response from position evaluation."""

    candidates: List[Candidate]
    fen: str
    time_ms: int
