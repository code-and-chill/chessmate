"""Preferences repository interface."""
from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID

from app.domain.models.account_preferences import AccountPreferences


class PreferencesRepositoryInterface(ABC):
    """Preferences repository interface."""

    @abstractmethod
    async def create(self, preferences: AccountPreferences) -> AccountPreferences:
        """Create preferences."""
        pass

    @abstractmethod
    async def get_by_account_id(self, account_id: UUID) -> Optional[AccountPreferences]:
        """Get preferences by account ID."""
        pass

    @abstractmethod
    async def update(self, preferences: AccountPreferences) -> AccountPreferences:
        """Update preferences."""
        pass
