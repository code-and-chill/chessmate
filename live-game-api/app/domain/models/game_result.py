"""Game result enumeration."""
from enum import Enum


class GameResult(str, Enum):
    """Game result enumeration."""

    WHITE_WIN = "1-0"
    BLACK_WIN = "0-1"
    DRAW = "1/2-1/2"
