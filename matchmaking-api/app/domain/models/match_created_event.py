"""Match created domain event."""
from datetime import datetime, timezone
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class MatchCreatedEvent(BaseModel):
    """Match created domain event."""

    event_id: UUID = Field(default_factory=uuid4)
    event_type: str = "match.created"
    match_id: str
    white_player_id: str
    black_player_id: str
    game_id: str
    time_control: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    version: int = 1

    class Config:
        frozen = True
