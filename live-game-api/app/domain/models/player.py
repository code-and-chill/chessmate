"""Player domain model."""
from uuid import UUID

from pydantic import BaseModel, Field


class Player(BaseModel):
    """Player information in a game."""

    account_id: UUID
    remaining_ms: int = Field(..., ge=0)

    class Config:
        from_attributes = True
