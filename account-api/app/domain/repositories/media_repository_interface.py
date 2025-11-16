"""Media repository interface."""
from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID

from app.domain.models.account_media import AccountMedia


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
