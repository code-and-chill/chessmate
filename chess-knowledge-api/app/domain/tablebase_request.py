"""Tablebase request DTO."""
from pydantic import BaseModel, Field


class TablebaseRequest(BaseModel):
    """Request to query endgame tablebase."""

    fen: str = Field(..., description="Position in FEN notation")
