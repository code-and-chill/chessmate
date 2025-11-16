"""Queue entry status enumeration."""
from enum import Enum


class QueueEntryStatus(str, Enum):
    """Queue entry status enumeration."""

    SEARCHING = "SEARCHING"
    MATCHED = "MATCHED"
    CANCELLED = "CANCELLED"
    TIMED_OUT = "TIMED_OUT"
