"""Queue store repository interface."""
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Optional

from app.domain.models import QueueEntry, QueueEntryStatus


class QueueStoreRepository(ABC):
    """Repository interface for queue storage.

    Manages queue entries in Redis.
    """

    @abstractmethod
    async def add_entry(self, entry: QueueEntry) -> None:
        """Add entry to queue.

        Args:
            entry: Queue entry to add
        """
        pass

    @abstractmethod
    async def get_entry(self, queue_entry_id: str) -> Optional[QueueEntry]:
        """Get queue entry by ID.

        Args:
            queue_entry_id: ID of queue entry

        Returns:
            Queue entry or None if not found
        """
        pass

    @abstractmethod
    async def update_entry_status(
        self, queue_entry_id: str, status: QueueEntryStatus, match_id: Optional[str] = None
    ) -> None:
        """Update entry status.

        Args:
            queue_entry_id: ID of queue entry
            status: New status
            match_id: Match ID if matched
        """
        pass

    @abstractmethod
    async def get_active_entry_for_user(self, user_id: str, tenant_id: str) -> Optional[QueueEntry]:
        """Get active queue entry for user.

        Args:
            user_id: User ID
            tenant_id: Tenant ID

        Returns:
            Active queue entry or None
        """
        pass

    @abstractmethod
    async def remove_entry(self, queue_entry_id: str) -> None:
        """Remove entry from queue.

        Args:
            queue_entry_id: ID of queue entry
        """
        pass

    @abstractmethod
    async def get_queue_by_pool(
        self,
        tenant_id: str,
        pool_key: str,
        status: QueueEntryStatus = QueueEntryStatus.SEARCHING,
    ) -> list[QueueEntry]:
        """Get all entries in a pool by status.

        Args:
            tenant_id: Tenant ID
            pool_key: Pool key (e.g., "5+0_rated_ASIA")
            status: Status filter

        Returns:
            List of queue entries
        """
        pass

    @abstractmethod
    async def get_queue_stats(
        self, tenant_id: str, pool_key: str
    ) -> dict:
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
