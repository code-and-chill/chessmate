"""Animation level enumeration."""
from enum import Enum


class AnimationLevel(str, Enum):
    """Animation levels."""

    NONE = "none"
    MINIMAL = "minimal"
    FULL = "full"
