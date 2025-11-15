"""Challenge domain model."""
from datetime import datetime
from enum import Enum
from typing import Optional


class ChallengeStatus(str, Enum):
    """Challenge status enumeration."""

    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    DECLINED = "DECLINED"
    EXPIRED = "EXPIRED"


class PreferredColor(str, Enum):
    """Preferred color enumeration."""

    WHITE = "white"
    BLACK = "black"
    RANDOM = "random"


class Challenge:
    """Challenge aggregate root.

    Represents a direct challenge between two players.
    Per service-spec section 5.3.
    """

    def __init__(
        self,
        challenge_id: str,
        tenant_id: str,
        challenger_user_id: str,
        opponent_user_id: str,
        time_control: str,
        mode: str,
        variant: str,
        preferred_color: str,
        status: ChallengeStatus,
        created_at: datetime,
        expires_at: datetime,
        game_id: Optional[str] = None,
    ) -> None:
        self.challenge_id = challenge_id
        self.tenant_id = tenant_id
        self.challenger_user_id = challenger_user_id
        self.opponent_user_id = opponent_user_id
        self.time_control = time_control
        self.mode = mode
        self.variant = variant
        self.preferred_color = preferred_color
        self.status = status
        self.created_at = created_at
        self.expires_at = expires_at
        self.game_id = game_id

    def is_pending(self) -> bool:
        """Check if challenge is pending."""
        return self.status == ChallengeStatus.PENDING

    def is_expired(self, now: datetime) -> bool:
        """Check if challenge has expired."""
        return now > self.expires_at

    def can_accept(self, now: datetime) -> bool:
        """Check if challenge can be accepted."""
        return self.is_pending() and not self.is_expired(now)

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Challenge):
            return NotImplemented
        return self.challenge_id == other.challenge_id

    def __hash__(self) -> int:
        return hash(self.challenge_id)
