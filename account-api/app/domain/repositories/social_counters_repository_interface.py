"""Social counters repository interface."""
from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID

from app.domain.models.account_social_counters import AccountSocialCounters


class SocialCountersRepositoryInterface(ABC):
    """Social counters repository interface."""

    @abstractmethod
    async def create(self, counters: AccountSocialCounters) -> AccountSocialCounters:
        """Create social counters."""
        pass

    @abstractmethod
    async def get_by_account_id(self, account_id: UUID) -> Optional[AccountSocialCounters]:
        """Get social counters by account ID."""
        pass

    @abstractmethod
    async def update(self, counters: AccountSocialCounters) -> AccountSocialCounters:
        """Update social counters."""
        pass
