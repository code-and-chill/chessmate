"""Redis queue store implementation."""
import json
import logging
from datetime import datetime, timezone
from typing import Optional

import redis.asyncio as redis

from app.domain.models import QueueEntry, QueueEntryStatus
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

    def _serialize_entry(self, entry: QueueEntry) -> str:
        """Serialize queue entry to JSON."""
        return json.dumps({
            "queue_entry_id": entry.queue_entry_id,
            "tenant_id": entry.tenant_id,
            "user_id": entry.user_id,
            "time_control": entry.time_control,
            "mode": entry.mode,
            "variant": entry.variant,
            "region": entry.region,
            "status": entry.status.value,
            "enqueued_at": entry.enqueued_at.isoformat(),
            "updated_at": entry.updated_at.isoformat(),
            "match_id": entry.match_id,
        })

    def _deserialize_entry(self, data: str) -> QueueEntry:
        """Deserialize queue entry from JSON."""
        obj = json.loads(data)
        return QueueEntry(
            queue_entry_id=obj["queue_entry_id"],
            tenant_id=obj["tenant_id"],
            user_id=obj["user_id"],
            time_control=obj["time_control"],
            mode=obj["mode"],
            variant=obj["variant"],
            region=obj["region"],
            status=QueueEntryStatus(obj["status"]),
            enqueued_at=datetime.fromisoformat(obj["enqueued_at"]),
            updated_at=datetime.fromisoformat(obj["updated_at"]),
            match_id=obj.get("match_id"),
        )

    def _get_pool_key_from_entry(self, entry: QueueEntry) -> str:
        """Build pool key from entry attributes."""
        return f"{entry.variant}_{entry.time_control}_{entry.mode}_{entry.region}"

    async def add_entry(self, entry: QueueEntry) -> None:
        """Add entry to queue."""
        entry_key = self._get_entry_key(entry.queue_entry_id)
        user_queue_key = self._get_user_queue_key(entry.user_id, entry.tenant_id)
        pool_key = self._get_pool_key_from_entry(entry)
        pool_entries_key = self._get_pool_key(entry.tenant_id, pool_key, entry.status)

        entry_data = self._serialize_entry(entry)

        # Use pipeline for atomic operations
        pipe = self.redis.pipeline()
        pipe.set(entry_key, entry_data, ex=3600)  # 1 hour expiry
        pipe.set(user_queue_key, entry.queue_entry_id, ex=3600)
        pipe.zadd(pool_entries_key, {entry.queue_entry_id: entry.enqueued_at.timestamp()})
        await pipe.execute()

        logger.info(
            f"Added queue entry {entry.queue_entry_id} for user {entry.user_id}",
            extra={"tenant_id": entry.tenant_id},
        )

    async def get_entry(self, queue_entry_id: str) -> Optional[QueueEntry]:
        """Get queue entry by ID."""
        entry_key = self._get_entry_key(queue_entry_id)
        data = await self.redis.get(entry_key)
        if not data:
            return None
        return self._deserialize_entry(data)

    async def update_entry_status(
        self,
        queue_entry_id: str,
        status: QueueEntryStatus,
        match_id: Optional[str] = None,
    ) -> None:
        """Update entry status."""
        entry = await self.get_entry(queue_entry_id)
        if not entry:
            logger.warning(f"Queue entry {queue_entry_id} not found for status update")
            return

        old_pool_key = self._get_pool_key_from_entry(entry)
        old_pool_entries_key = self._get_pool_key(entry.tenant_id, old_pool_key, entry.status)

        entry.status = status
        entry.updated_at = datetime.now(timezone.utc)
        if match_id:
            entry.match_id = match_id

        new_pool_key = self._get_pool_key_from_entry(entry)
        new_pool_entries_key = self._get_pool_key(entry.tenant_id, new_pool_key, status)

        entry_key = self._get_entry_key(queue_entry_id)
        entry_data = self._serialize_entry(entry)

        # Update and move to new pool
        pipe = self.redis.pipeline()
        pipe.set(entry_key, entry_data, ex=3600)
        pipe.zrem(old_pool_entries_key, queue_entry_id)
        pipe.zadd(new_pool_entries_key, {queue_entry_id: datetime.now(timezone.utc).timestamp()})
        await pipe.execute()

        logger.info(
            f"Updated queue entry {queue_entry_id} status to {status.value}",
            extra={"tenant_id": entry.tenant_id},
        )

    async def get_active_entry_for_user(self, user_id: str, tenant_id: str) -> Optional[QueueEntry]:
        """Get active queue entry for user."""
        user_queue_key = self._get_user_queue_key(user_id, tenant_id)
        queue_entry_id = await self.redis.get(user_queue_key)
        if not queue_entry_id:
            return None
        return await self.get_entry(queue_entry_id)

    async def remove_entry(self, queue_entry_id: str) -> None:
        """Remove entry from queue."""
        entry = await self.get_entry(queue_entry_id)
        if not entry:
            return

        entry_key = self._get_entry_key(queue_entry_id)
        user_queue_key = self._get_user_queue_key(entry.user_id, entry.tenant_id)
        pool_key = self._get_pool_key_from_entry(entry)
        pool_entries_key = self._get_pool_key(entry.tenant_id, pool_key, entry.status)

        pipe = self.redis.pipeline()
        pipe.delete(entry_key)
        pipe.delete(user_queue_key)
        pipe.zrem(pool_entries_key, queue_entry_id)
        await pipe.execute()

        logger.info(f"Removed queue entry {queue_entry_id}")

    async def get_queue_by_pool(
        self,
        tenant_id: str,
        pool_key: str,
        status: QueueEntryStatus = QueueEntryStatus.SEARCHING,
    ) -> list[QueueEntry]:
        """Get all entries in a pool by status."""
        pool_entries_key = self._get_pool_key(tenant_id, pool_key, status)
        entry_ids = await self.redis.zrange(pool_entries_key, 0, -1)

        entries = []
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

        entries = []
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
