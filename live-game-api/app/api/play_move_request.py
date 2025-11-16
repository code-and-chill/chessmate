"""Play move request model."""
from typing import Optional

from pydantic import BaseModel, Field


class PlayMoveRequest(BaseModel):
    """Play move request model."""

    from_square: str = Field(..., pattern=r"^[a-h][1-8]$")
    to_square: str = Field(..., pattern=r"^[a-h][1-8]$")
    promotion: Optional[str] = Field(None, pattern=r"^[qrbn]$")
