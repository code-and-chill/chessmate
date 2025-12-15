"""Queue store repository interface."""
from abc import ABC, abstractmethod
from typing import Optional

from app.domain.models import QueueEntryStatus, Ticket


class QueueStoreRepository(ABC):
    """Repository interface for queue storage.

    Manages matchmaking tickets in Redis.
    """

    @abstractmethod
    async def add_entry(self, entry: Ticket) -> None:
        """Add ticket to queue.

        Args:
            entry: Ticket to add
        """
        pass

    @abstractmethod
    async def get_entry(self, ticket_id: str) -> Optional[Ticket]:
        """Get ticket by ID.

        Args:
            ticket_id: ID of ticket

        Returns:
            Ticket or None if not found
        """
        pass

    @abstractmethod
    async def update_entry_status(
        self, ticket_id: str, status: QueueEntryStatus, match_id: Optional[str] = None
    ) -> None:
        """Update ticket status.

        Args:
            ticket_id: ID of ticket
            status: New status
            match_id: Match ID if matched
        """
        pass

    @abstractmethod
    async def get_active_entry_for_user(self, user_id: str, tenant_id: str) -> Optional[Ticket]:
        """Get active ticket for user.

        Args:
            user_id: User ID
            tenant_id: Tenant ID

        Returns:
            Active ticket or None
        """
        pass

    @abstractmethod
    async def remove_entry(self, ticket_id: str) -> None:
        """Remove ticket from queue.

        Args:
            ticket_id: ID of ticket
        """
        pass

    @abstractmethod
    async def get_queue_by_pool(
        self,
        tenant_id: str,
        pool_key: str,
        status: QueueEntryStatus = QueueEntryStatus.SEARCHING,
    ) -> list[Ticket]:
        """Get all tickets in a pool by status.

        Args:
            tenant_id: Tenant ID
            pool_key: Pool key (e.g., "5+0_rated_ASIA")
            status: Status filter

        Returns:
            List of tickets
        """
        pass

    @abstractmethod
    async def get_queue_stats(self, tenant_id: str, pool_key: str) -> dict:
        """Get queue statistics.

        Args:
            tenant_id: Tenant ID
            pool_key: Pool key

        Returns:
            Stats dict with waiting_count, avg_wait_seconds, p95_wait_seconds
        """
        pass

    @abstractmethod
    async def is_user_in_queue(self, user_id: str, tenant_id: str) -> bool:
        """Check if user is in any queue.

        Args:
            user_id: User ID
            tenant_id: Tenant ID

        Returns:
            True if user is in queue
        """
        pass
