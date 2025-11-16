"""Move response model."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class MoveResponse(BaseModel):
    """Move response model."""

    ply: int
    move_number: int
    color: str
    from_square: str
    to_square: str
    promotion: Optional[str]
    san: str
    played_at: datetime
    elapsed_ms: int

    class Config:
        from_attributes = True
