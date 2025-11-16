"""End reason enumeration."""
from enum import Enum


class EndReason(str, Enum):
    """Game end reason enumeration."""

    CHECKMATE = "checkmate"
    RESIGNATION = "resignation"
    TIMEOUT = "timeout"
    DRAW_AGREED = "draw_agreed"
    STALEMATE = "stalemate"
    INSUFFICIENT_MATERIAL = "insufficient_material"
    FIFTY_MOVE_RULE = "fifty_move_rule"
    THREEFOLD_REPETITION = "threefold_repetition"
    ABANDONED = "abandoned"
