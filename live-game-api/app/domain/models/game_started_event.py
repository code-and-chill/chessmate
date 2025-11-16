"""Game started domain event."""
from datetime import datetime
from uuid import UUID

from .base_domain_event import BaseDomainEvent


class GameStartedEvent(BaseDomainEvent):
    """Game started domain event."""

    event_type: str = "game.started"
    white_account_id: UUID
    black_account_id: UUID
    started_at: datetime
