"""Privacy settings repository interface."""
from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID

from app.domain.models.account_privacy_settings import AccountPrivacySettings


class PrivacySettingsRepositoryInterface(ABC):
    """Privacy settings repository interface."""

    @abstractmethod
    async def create(
        self, privacy_settings: AccountPrivacySettings
    ) -> AccountPrivacySettings:
        """Create privacy settings."""
        pass

    @abstractmethod
    async def get_by_account_id(self, account_id: UUID) -> Optional[AccountPrivacySettings]:
        """Get privacy settings by account ID."""
        pass

    @abstractmethod
    async def update(
        self, privacy_settings: AccountPrivacySettings
    ) -> AccountPrivacySettings:
        """Update privacy settings."""
        pass
