"""Queue for failed matches that need to be retried."""

import json
import logging
from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

import redis.asyncio as redis

logger = logging.getLogger(__name__)


class FailedMatch:
    """Represents a failed match that needs to be retried."""

    def __init__(
        self,
        tenant_id: str,
        white_user_id: str,
        black_user_id: str,
        time_control: str,
        mode: str,
        variant: str,
        rating_snapshot: dict,
        metadata: dict,
        failure_reason: str,
        retry_count: int = 0,
        failed_at: Optional[datetime] = None,
        match_id: Optional[str] = None,
    ):
        """Initialize failed match.

        Args:
            tenant_id: Tenant ID
            white_user_id: White player user ID
            black_user_id: Black player user ID
            time_control: Time control
            mode: Game mode
            variant: Chess variant
            rating_snapshot: Rating snapshot dict
            metadata: Additional metadata
            failure_reason: Reason for failure
            retry_count: Number of retry attempts
            failed_at: When the match failed
            match_id: Optional match ID
        """
        self.match_id = match_id or str(uuid4())
        self.tenant_id = tenant_id
        self.white_user_id = white_user_id
        self.black_user_id = black_user_id
        self.time_control = time_control
        self.mode = mode
        self.variant = variant
        self.rating_snapshot = rating_snapshot
        self.metadata = metadata
        self.failure_reason = failure_reason
        self.retry_count = retry_count
        self.failed_at = failed_at or datetime.now(timezone.utc)

    def to_dict(self) -> dict:
        """Convert to dictionary."""
        return {
            "match_id": self.match_id,
            "tenant_id": self.tenant_id,
            "white_user_id": self.white_user_id,
            "black_user_id": self.black_user_id,
            "time_control": self.time_control,
            "mode": self.mode,
            "variant": self.variant,
            "rating_snapshot": self.rating_snapshot,
            "metadata": self.metadata,
            "failure_reason": self.failure_reason,
            "retry_count": self.retry_count,
            "failed_at": self.failed_at.isoformat(),
        }

    @classmethod
    def from_dict(cls, data: dict) -> "FailedMatch":
        """Create from dictionary."""
        return cls(
            match_id=data.get("match_id"),
            tenant_id=data["tenant_id"],
            white_user_id=data["white_user_id"],
            black_user_id=data["black_user_id"],
            time_control=data["time_control"],
            mode=data["mode"],
            variant=data["variant"],
            rating_snapshot=data["rating_snapshot"],
            metadata=data["metadata"],
            failure_reason=data["failure_reason"],
            retry_count=data.get("retry_count", 0),
            failed_at=datetime.fromisoformat(data["failed_at"]) if data.get("failed_at") else None,
        )


class FailedMatchesQueue:
    """Queue for storing and retrying failed matches."""

    def __init__(self, redis_client: redis.Redis):
        """Initialize failed matches queue.

        Args:
            redis_client: Redis async client
        """
        self.redis = redis_client
        self.queue_key = "failed_matches:queue"
        self.max_retries = 5
        self.retry_delay_seconds = 60  # Retry after 1 minute

    async def enqueue(self, failed_match: FailedMatch) -> None:
        """Add a failed match to the queue.

        Args:
            failed_match: Failed match to queue
        """
        match_data = json.dumps(failed_match.to_dict())
        
        # Add to sorted set with score = failed_at timestamp (oldest first)
        await self.redis.zadd(
            self.queue_key,
            {match_data: failed_match.failed_at.timestamp()}
        )
        
        logger.info(
            f"Queued failed match {failed_match.match_id} for retry",
            extra={
                "match_id": failed_match.match_id,
                "retry_count": failed_match.retry_count,
                "failure_reason": failed_match.failure_reason,
            }
        )

    async def dequeue_ready(self, limit: int = 10) -> list[FailedMatch]:
        """Get matches ready for retry (older than retry_delay_seconds).

        Args:
            limit: Maximum number of matches to return

        Returns:
            List of failed matches ready for retry
        """
        # Get matches older than retry_delay_seconds
        cutoff_time = datetime.now(timezone.utc).timestamp() - self.retry_delay_seconds
        
        # Get matches from sorted set (oldest first)
        items = await self.redis.zrangebyscore(
            self.queue_key,
            min=0,
            max=cutoff_time,
            start=0,
            num=limit,
            withscores=False,
        )
        
        matches = []
        for item in items:
            try:
                match_dict = json.loads(item)
                matches.append(FailedMatch.from_dict(match_dict))
            except (json.JSONDecodeError, KeyError) as e:
                logger.error(f"Failed to parse failed match from queue: {e}")
                # Remove corrupted entry
                await self.redis.zrem(self.queue_key, item)
        
        return matches

    async def remove(self, match_id: str) -> None:
        """Remove a match from the queue.

        Args:
            match_id: Match ID to remove
        """
        # Find and remove by match_id
        items = await self.redis.zrange(self.queue_key, 0, -1)
        for item in items:
            try:
                match_dict = json.loads(item)
                if match_dict.get("match_id") == match_id:
                    await self.redis.zrem(self.queue_key, item)
                    logger.info(f"Removed match {match_id} from failed matches queue")
                    return
            except (json.JSONDecodeError, KeyError):
                continue
        
        logger.warning(f"Match {match_id} not found in failed matches queue")

    async def increment_retry(self, failed_match: FailedMatch) -> FailedMatch:
        """Increment retry count and update in queue.

        Args:
            failed_match: Failed match to update

        Returns:
            Updated failed match
        """
        # Remove old entry
        await self.remove(failed_match.match_id)
        
        # Update retry count
        failed_match.retry_count += 1
        failed_match.failed_at = datetime.now(timezone.utc)
        
        # Re-add to queue
        await self.enqueue(failed_match)
        
        return failed_match

    async def size(self) -> int:
        """Get queue size.

        Returns:
            Number of matches in queue
        """
        return await self.redis.zcard(self.queue_key)
