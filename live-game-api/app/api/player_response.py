"""Player response model."""
from uuid import UUID

from pydantic import BaseModel


class PlayerResponse(BaseModel):
    """Player response model."""

    account_id: UUID
    remaining_ms: int
