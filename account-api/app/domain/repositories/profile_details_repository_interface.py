"""Profile details repository interface."""
from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID

from app.domain.models.account_profile_details import AccountProfileDetails


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
