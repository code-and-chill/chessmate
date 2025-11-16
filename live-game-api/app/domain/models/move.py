"""Move domain model."""
from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field


class Move(BaseModel):
    """Chess move representation."""

    ply: int = Field(..., ge=1)
    move_number: int = Field(..., ge=1)
    color: str = Field(..., pattern=r"^[wb]$")  # 'w' or 'b'
    from_square: str = Field(..., pattern=r"^[a-h][1-8]$")
    to_square: str = Field(..., pattern=r"^[a-h][1-8]$")
    promotion: Optional[str] = Field(None, pattern=r"^[qrbn]$")
    san: str  # Standard Algebraic Notation
    fen_after: str
    played_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    elapsed_ms: int = Field(..., ge=0)

    class Config:
        from_attributes = True
