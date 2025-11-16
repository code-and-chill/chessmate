"""Game created domain event."""
from uuid import UUID

from .base_domain_event import BaseDomainEvent
from .time_control import TimeControl


class GameCreatedEvent(BaseDomainEvent):
    """Game created domain event."""

    event_type: str = "game.created"
    creator_account_id: UUID
    time_control: TimeControl
    rated: bool
