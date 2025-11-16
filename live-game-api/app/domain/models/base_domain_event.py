"""Base domain event model."""
from datetime import datetime
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class BaseDomainEvent(BaseModel):
    """Base domain event."""

    event_id: UUID = Field(default_factory=uuid4)
    event_type: str
    aggregate_id: UUID
    occurred_at: datetime = Field(default_factory=datetime.utcnow)
    version: int = 1

    class Config:
        frozen = True
