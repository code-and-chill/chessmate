"""Game ended domain event."""
from uuid import UUID

from .base_domain_event import BaseDomainEvent
from .end_reason import EndReason
from .game_result import GameResult
from .time_control import TimeControl


from typing import Optional


class GameEndedEvent(BaseDomainEvent):
    """Game ended domain event."""

    event_type: str = "game.ended"
    white_account_id: Optional[UUID] = None
    black_account_id: Optional[UUID] = None
    result: GameResult
    end_reason: EndReason
    time_control: TimeControl
    rated: bool
