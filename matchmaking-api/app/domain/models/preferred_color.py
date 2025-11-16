"""Preferred color enumeration."""
from enum import Enum


class PreferredColor(str, Enum):
    """Preferred color enumeration."""

    WHITE = "white"
    BLACK = "black"
    RANDOM = "random"
