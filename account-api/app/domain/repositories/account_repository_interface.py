"""Account repository interface."""
from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID

from app.domain.models.account_model import Account


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
