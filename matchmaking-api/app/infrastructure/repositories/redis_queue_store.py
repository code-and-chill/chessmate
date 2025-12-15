"""Redis queue store implementation."""
import json
import logging
from datetime import datetime, timezone
from typing import Optional

import redis.asyncio as redis

from app.domain.models import QueueEntryStatus, Ticket
from app.domain.repositories.queue_store import QueueStoreRepository

logger = logging.getLogger(__name__)


class RedisQueueStore(QueueStoreRepository):
    """Redis implementation of queue store.

    Stores active queue entries in Redis for fast access and matching.
    """

    def __init__(self, redis_client: redis.Redis) -> None:
        """Initialize Redis queue store.

        Args:
            redis_client: Redis async client
        """
        self.redis = redis_client

    def _get_entry_key(self, queue_entry_id: str) -> str:
        """Get Redis key for queue entry."""
        return f"queue_entry:{queue_entry_id}"

    def _get_user_queue_key(self, user_id: str, tenant_id: str) -> str:
        """Get Redis key for user's active queue entry."""
        return f"user_queue:{tenant_id}:{user_id}"

    def _get_pool_key(self, tenant_id: str, pool_key: str, status: QueueEntryStatus) -> str:
        """Get Redis key for pool entries."""
        return f"pool:{tenant_id}:{pool_key}:{status.value}"

    def _serialize_entry(self, entry: Ticket) -> str:
        """Serialize ticket to JSON."""
        return json.dumps(entry.to_dict())

    def _deserialize_entry(self, data: str) -> Ticket:
        """Deserialize ticket from JSON."""
        obj = json.loads(data)
        return Ticket.from_dict(obj)

    def _get_pool_key_from_entry(self, entry: Ticket) -> str:
        """Build pool key from entry attributes."""
        return entry.hard_constraints.pool_key()

    async def add_entry(self, entry: Ticket) -> None:
        """Add entry to queue."""
        entry_key = self._get_entry_key(entry.ticket_id)
        user_queue_key = self._get_user_queue_key(entry.players[0].user_id, entry.tenant_id)
        pool_key = self._get_pool_key_from_entry(entry)
        pool_entries_key = self._get_pool_key(entry.tenant_id, pool_key, entry.status)

        entry_data = self._serialize_entry(entry)

        # Use pipeline for atomic operations
        pipe = self.redis.pipeline()
        pipe.set(entry_key, entry_data, ex=3600)  # 1 hour expiry
        pipe.set(user_queue_key, entry.ticket_id, ex=3600)
        pipe.zadd(pool_entries_key, {entry.ticket_id: entry.enqueued_at.timestamp()})
        await pipe.execute()

        logger.info(
            f"Added ticket {entry.ticket_id} for user {entry.players[0].user_id}",
            extra={"tenant_id": entry.tenant_id, "ticket_type": entry.ticket_type.value},
        )

    async def get_entry(self, ticket_id: str) -> Optional[Ticket]:
        """Get ticket by ID."""
        entry_key = self._get_entry_key(ticket_id)
        data = await self.redis.get(entry_key)
        if not data:
            return None
        return self._deserialize_entry(data)

    async def update_entry_status(
        self,
        ticket_id: str,
        status: QueueEntryStatus,
        match_id: Optional[str] = None,
    ) -> None:
        """Update entry status."""
        entry = await self.get_entry(ticket_id)
        if not entry:
            logger.warning(f"Queue entry {ticket_id} not found for status update")
            return

        old_pool_key = self._get_pool_key_from_entry(entry)
        old_pool_entries_key = self._get_pool_key(entry.tenant_id, old_pool_key, entry.status)

        entry.status = status
        entry.updated_at = datetime.now(timezone.utc)
        if match_id:
            entry.match_id = match_id

        new_pool_key = self._get_pool_key_from_entry(entry)
        new_pool_entries_key = self._get_pool_key(entry.tenant_id, new_pool_key, status)

        entry_key = self._get_entry_key(ticket_id)
        entry_data = self._serialize_entry(entry)

        # Update and move to new pool
        pipe = self.redis.pipeline()
        pipe.set(entry_key, entry_data, ex=3600)
        pipe.zrem(old_pool_entries_key, ticket_id)
        pipe.zadd(new_pool_entries_key, {ticket_id: datetime.now(timezone.utc).timestamp()})
        await pipe.execute()

        logger.info(
            f"Updated ticket {ticket_id} status to {status.value}",
            extra={"tenant_id": entry.tenant_id},
        )

    async def get_active_entry_for_user(self, user_id: str, tenant_id: str) -> Optional[Ticket]:
        """Get active ticket for user."""
        user_queue_key = self._get_user_queue_key(user_id, tenant_id)
        ticket_id = await self.redis.get(user_queue_key)
        if not ticket_id:
            return None
        return await self.get_entry(ticket_id)

    async def remove_entry(self, ticket_id: str) -> None:
        """Remove entry from queue."""
        entry = await self.get_entry(ticket_id)
        if not entry:
            return

        entry_key = self._get_entry_key(ticket_id)
        user_queue_key = self._get_user_queue_key(entry.players[0].user_id, entry.tenant_id)
        pool_key = self._get_pool_key_from_entry(entry)
        pool_entries_key = self._get_pool_key(entry.tenant_id, pool_key, entry.status)

        pipe = self.redis.pipeline()
        pipe.delete(entry_key)
        pipe.delete(user_queue_key)
        pipe.zrem(pool_entries_key, ticket_id)
        await pipe.execute()

        logger.info(f"Removed ticket {ticket_id}")

    async def get_queue_by_pool(
        self,
        tenant_id: str,
        pool_key: str,
        status: QueueEntryStatus = QueueEntryStatus.SEARCHING,
    ) -> list[Ticket]:
        """Get all entries in a pool by status."""
        pool_entries_key = self._get_pool_key(tenant_id, pool_key, status)
        entry_ids = await self.redis.zrange(pool_entries_key, 0, -1)

        entries: list[Ticket] = []
        for entry_id in entry_ids:
            entry = await self.get_entry(entry_id)
            if entry:
                entries.append(entry)

        return entries

    async def get_queue_stats(self, tenant_id: str, pool_key: str) -> dict:
        """Get queue statistics."""
        pool_entries_key = self._get_pool_key(tenant_id, pool_key, QueueEntryStatus.SEARCHING)
        entry_ids = await self.redis.zrange(pool_entries_key, 0, -1)

        if not entry_ids:
            return {
                "waiting_count": 0,
                "avg_wait_seconds": 0.0,
                "p95_wait_seconds": 0.0,
            }

        entries: list[Ticket] = []
        for entry_id in entry_ids:
            entry = await self.get_entry(entry_id)
            if entry:
                entries.append(entry)

        now = datetime.now(timezone.utc)
        wait_times = [entry.time_in_queue_seconds(now) for entry in entries]
        wait_times.sort()

        avg_wait = sum(wait_times) / len(wait_times) if wait_times else 0.0
        p95_index = max(0, int(len(wait_times) * 0.95) - 1)
        p95_wait = wait_times[p95_index] if p95_index < len(wait_times) else 0.0

        return {
            "waiting_count": len(entries),
            "avg_wait_seconds": avg_wait,
            "p95_wait_seconds": p95_wait,
        }

    async def is_user_in_queue(self, user_id: str, tenant_id: str) -> bool:
        """Check if user is in any queue."""
        user_queue_key = self._get_user_queue_key(user_id, tenant_id)
        exists = await self.redis.exists(user_queue_key)
        return bool(exists)
