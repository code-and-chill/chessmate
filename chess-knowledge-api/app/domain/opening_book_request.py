"""Opening book request DTO."""
from typing import Optional

from pydantic import BaseModel, Field


class OpeningBookRequest(BaseModel):
    """Request to query opening book."""

    fen: str = Field(..., description="Position in FEN notation")
    repertoire: Optional[str] = Field(default=None, description="Specific opening repertoire to use")
