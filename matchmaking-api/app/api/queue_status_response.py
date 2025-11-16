"""Queue status response model."""
from typing import Optional

from pydantic import BaseModel


class QueueStatusResponse(BaseModel):
    """Queue status response."""

    queue_entry_id: str
    status: str
    estimated_wait_seconds: Optional[int] = None
    game_id: Optional[str] = None
    opponent: Optional[dict] = None
