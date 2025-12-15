"""Player representation for matchmaking tickets."""
from typing import Optional


class Player:
    """Represents a player within a matchmaking ticket."""

    def __init__(
        self,
        user_id: str,
        rating: Optional[int] = None,
        party_id: Optional[str] = None,
        metadata: Optional[dict] = None,
    ) -> None:
        self.user_id = user_id
        self.rating = rating
        self.party_id = party_id
        self.metadata = metadata or {}

    def to_dict(self) -> dict:
        """Serialize the player to a dictionary."""
        return {
            "user_id": self.user_id,
            "rating": self.rating,
            "party_id": self.party_id,
            "metadata": self.metadata,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Player":
        """Create a player instance from dictionary data."""
        return cls(
            user_id=data["user_id"],
            rating=data.get("rating"),
            party_id=data.get("party_id"),
            metadata=data.get("metadata"),
        )
