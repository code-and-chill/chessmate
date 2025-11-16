"""Game status enumeration."""
from enum import Enum


class GameStatus(str, Enum):
    """Game status enumeration."""

    WAITING_FOR_OPPONENT = "waiting_for_opponent"
    IN_PROGRESS = "in_progress"
    ENDED = "ended"
