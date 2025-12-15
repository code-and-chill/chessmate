"""Widening state tracking for matchmaking tickets."""
from datetime import datetime
from typing import Optional


class WideningState:
    """Represents the widening progress for soft constraints."""

    def __init__(
        self,
        current_window: int,
        widen_count: int = 0,
        last_widened_at: Optional[datetime] = None,
        stage: int = 0,
    ) -> None:
        self.current_window = current_window
        self.widen_count = widen_count
        self.last_widened_at = last_widened_at
        self.stage = stage

    def widen(self, amount: int, at: Optional[datetime] = None) -> None:
        """Increase the window with a timestamp."""
        self.current_window += amount
        self.widen_count += 1
        self.last_widened_at = at or datetime.now()

    def to_dict(self) -> dict:
        """Serialize the widening state."""
        return {
            "current_window": self.current_window,
            "widen_count": self.widen_count,
            "last_widened_at": self.last_widened_at.isoformat() if self.last_widened_at else None,
            "stage": self.stage,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "WideningState":
        """Instantiate widening state from dictionary data."""
        last_widened_at = data.get("last_widened_at")
        return cls(
            current_window=data.get("current_window", 0),
            widen_count=data.get("widen_count", 0),
            last_widened_at=datetime.fromisoformat(last_widened_at) if last_widened_at else None,
            stage=data.get("stage", 0),
        )
