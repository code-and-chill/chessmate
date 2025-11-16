"""Queue entry response model."""
from pydantic import BaseModel


class QueueResponse(BaseModel):
    """Queue entry response."""

    queue_entry_id: str
    status: str
    estimated_wait_seconds: int = 10
