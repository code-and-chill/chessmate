from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID

from app.domain.models.account import (
    Account,
    AccountMedia,
    AccountPreferences,
    AccountPrivacySettings,
    AccountProfileDetails,
    AccountSocialCounters,
)


class AccountRepositoryInterface(ABC):
    """Account repository interface."""

    @abstractmethod
    async def create(self, account: Account) -> Account:
        """Create new account."""
        pass

    @abstractmethod
    async def get_by_id(self, account_id: UUID) -> Optional[Account]:
        """Get account by ID."""
        pass

    @abstractmethod
    async def get_by_username(self, username: str) -> Optional[Account]:
        """Get account by username."""
        pass

    @abstractmethod
    async def get_by_auth_user_id(self, auth_user_id: UUID) -> Optional[Account]:
        """Get account by auth user ID."""
        pass

    @abstractmethod
    async def update(self, account: Account) -> Account:
        """Update account."""
        pass

    @abstractmethod
    async def ban(self, account_id: UUID) -> Account:
        """Ban account."""
        pass

    @abstractmethod
    async def unban(self, account_id: UUID) -> Account:
        """Unban account."""
        pass

    @abstractmethod
    async def deactivate(self, account_id: UUID) -> Account:
        """Deactivate account."""
        pass


class ProfileDetailsRepositoryInterface(ABC):
    """Profile details repository interface."""

    @abstractmethod
    async def create(self, profile_details: AccountProfileDetails) -> AccountProfileDetails:
        """Create profile details."""
        pass

    @abstractmethod
    async def get_by_account_id(self, account_id: UUID) -> Optional[AccountProfileDetails]:
        """Get profile details by account ID."""
        pass

    @abstractmethod
    async def update(self, profile_details: AccountProfileDetails) -> AccountProfileDetails:
        """Update profile details."""
        pass


class MediaRepositoryInterface(ABC):
    """Media repository interface."""

    @abstractmethod
    async def create(self, media: AccountMedia) -> AccountMedia:
        """Create media record."""
        pass

    @abstractmethod
    async def get_by_account_id(self, account_id: UUID) -> Optional[AccountMedia]:
        """Get media by account ID."""
        pass

    @abstractmethod
    async def update(self, media: AccountMedia) -> AccountMedia:
        """Update media."""
        pass


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
