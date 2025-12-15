"""Constraint models for matchmaking tickets."""
from typing import Optional

from typing import Optional

from app.domain.utils.pool_key import format_pool_key


class HardConstraints:
    """Hard requirements that must be satisfied for matchmaking."""

    def __init__(self, time_control: str, mode: str, variant: str = "standard", region: str = "DEFAULT") -> None:
        self.time_control = time_control
        self.mode = mode
        self.variant = variant
        self.region = region

    def pool_key(self) -> str:
        """Generate the pool key used for grouping tickets."""
        return format_pool_key(
            mode=self.mode, variant=self.variant, time_control=self.time_control, region=self.region
        )

    def to_dict(self) -> dict:
        """Serialize the hard constraints."""
        return {
            "time_control": self.time_control,
            "mode": self.mode,
            "variant": self.variant,
            "region": self.region,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "HardConstraints":
        """Instantiate from dictionary data."""
        return cls(
            time_control=data["time_control"],
            mode=data["mode"],
            variant=data.get("variant", "standard"),
            region=data.get("region", "DEFAULT"),
        )


class SoftConstraints:
    """Soft preferences that can be widened over time."""

    def __init__(
        self,
        preferred_region: Optional[str] = None,
        rating_window: Optional[int] = None,
        max_latency_ms: Optional[int] = None,
    ) -> None:
        self.preferred_region = preferred_region
        self.rating_window = rating_window
        self.max_latency_ms = max_latency_ms

    def to_dict(self) -> dict:
        """Serialize the soft constraints."""
        return {
            "preferred_region": self.preferred_region,
            "rating_window": self.rating_window,
            "max_latency_ms": self.max_latency_ms,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "SoftConstraints":
        """Instantiate soft constraints from dictionary data."""
        return cls(
            preferred_region=data.get("preferred_region"),
            rating_window=data.get("rating_window"),
            max_latency_ms=data.get("max_latency_ms"),
        )
