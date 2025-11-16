"""Candidate move domain model."""
from typing import Optional

from pydantic import BaseModel


class Candidate(BaseModel):
    """Candidate move from engine analysis."""

    move: str
    eval: float
    depth: Optional[int] = None
