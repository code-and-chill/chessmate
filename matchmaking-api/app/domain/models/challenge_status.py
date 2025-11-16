"""Challenge status enumeration."""
from enum import Enum


class ChallengeStatus(str, Enum):
    """Challenge status enumeration."""

    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    DECLINED = "DECLINED"
    EXPIRED = "EXPIRED"
