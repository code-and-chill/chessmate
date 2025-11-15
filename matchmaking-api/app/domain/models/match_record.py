"""Match record domain model."""
from datetime import datetime
from typing import Optional


class RatingSnapshot:
    """Rating snapshot at match time."""

    def __init__(self, white: int, black: int) -> None:
        self.white = white
        self.black = black

    def to_dict(self) -> dict:
        """Convert to dictionary."""
        return {"white": self.white, "black": self.black}


class MatchRecord:
    """Match record aggregate root.

    Represents a completed match between two players.
    Per service-spec section 5.2.
    """

    def __init__(
        self,
        match_id: str,
        tenant_id: str,
        game_id: str,
        white_user_id: str,
        black_user_id: str,
        time_control: str,
        mode: str,
        variant: str,
        created_at: datetime,
        queue_entry_ids: list[str],
        rating_snapshot: Optional[RatingSnapshot] = None,
    ) -> None:
        self.match_id = match_id
        self.tenant_id = tenant_id
        self.game_id = game_id
        self.white_user_id = white_user_id
        self.black_user_id = black_user_id
        self.time_control = time_control
        self.mode = mode
        self.variant = variant
        self.created_at = created_at
        self.queue_entry_ids = queue_entry_ids
        self.rating_snapshot = rating_snapshot or RatingSnapshot(1500, 1500)

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, MatchRecord):
            return NotImplemented
        return self.match_id == other.match_id

    def __hash__(self) -> int:
        return hash(self.match_id)
