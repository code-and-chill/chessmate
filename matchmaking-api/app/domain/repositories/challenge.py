"""Challenge repository interface."""
from abc import ABC, abstractmethod
from typing import Optional

from app.domain.models import Challenge


class ChallengeRepository(ABC):
    """Repository interface for challenge storage."""

    @abstractmethod
    async def create(self, challenge: Challenge) -> None:
        """Create challenge.

        Args:
            challenge: Challenge to create
        """
        pass

    @abstractmethod
    async def get_by_id(self, challenge_id: str) -> Optional[Challenge]:
        """Get challenge by ID.

        Args:
            challenge_id: ID of challenge

        Returns:
            Challenge or None if not found
        """
        pass

    @abstractmethod
    async def update(self, challenge: Challenge) -> None:
        """Update challenge.

        Args:
            challenge: Challenge to update
        """
        pass

    @abstractmethod
    async def get_incoming_challenges(self, user_id: str, tenant_id: str) -> list[Challenge]:
        """Get incoming challenges for user.

        Args:
            user_id: User ID
            tenant_id: Tenant ID

        Returns:
            List of incoming challenges
        """
        pass
