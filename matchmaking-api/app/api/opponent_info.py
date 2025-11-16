"""Opponent information model."""
from typing import Optional

from pydantic import BaseModel


class OpponentInfo(BaseModel):
    """Opponent information."""

    user_id: str
    username: str
    rating_snapshot: Optional[dict] = None
