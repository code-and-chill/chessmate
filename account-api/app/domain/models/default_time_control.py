"""Default time control enumeration."""
from enum import Enum


class DefaultTimeControl(str, Enum):
    """Default time control."""

    BULLET = "bullet"
    BLITZ = "blitz"
    RAPID = "rapid"
    CLASSICAL = "classical"
