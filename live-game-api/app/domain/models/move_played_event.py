"""Move played domain event."""
from .base_domain_event import BaseDomainEvent
from .move import Move


class MovePlayedEvent(BaseDomainEvent):
    """Move played domain event."""

    event_type: str = "move.played"
    move: Move
    fen: str
