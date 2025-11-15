"""Match record repository interface."""
from abc import ABC, abstractmethod
from typing import Optional

from app.domain.models import MatchRecord


class MatchRecordRepository(ABC):
    """Repository interface for match record storage.

    Persists match records to durable storage (PostgreSQL).
    """

    @abstractmethod
    async def create(self, match: MatchRecord) -> None:
        """Create match record.

        Args:
            match: Match record to create
        """
        pass

    @abstractmethod
    async def get_by_id(self, match_id: str) -> Optional[MatchRecord]:
        """Get match record by ID.

        Args:
            match_id: ID of match

        Returns:
            Match record or None if not found
        """
        pass

    @abstractmethod
    async def get_by_game_id(self, game_id: str) -> Optional[MatchRecord]:
        """Get match record by game ID.

        Args:
            game_id: ID of game

        Returns:
            Match record or None if not found
        """
        pass
