"""Redis caching for puzzle-api."""

import json
import logging
import time
from typing import Optional, Dict, Any

import redis.asyncio as redis

try:
    from app.core.metrics import (
        cache_hits_total,
        cache_latency_seconds,
        cache_misses_total,
    )
except ImportError:
    # Metrics not available, create no-op metrics
    from prometheus_client import Counter, Histogram
    cache_hits_total = Counter("cache_hits_total", "Total cache hits", ["cache_type"])
    cache_misses_total = Counter("cache_misses_total", "Total cache misses", ["cache_type"])
    cache_latency_seconds = Histogram("cache_latency_seconds", "Cache latency", ["cache_type", "operation"])

logger = logging.getLogger(__name__)


class PuzzleCache:
    """Redis-based cache for puzzle queries."""

    def __init__(self, redis_client: Optional[redis.Redis] = None, redis_url: str = "redis://localhost:6379/0"):
        """Initialize cache.

        Args:
            redis_client: Optional Redis client (will create if not provided)
            redis_url: Redis connection URL
        """
        self.redis_client = redis_client
        self.redis_url = redis_url
        self.daily_puzzle_ttl = 86400  # 24 hours
        self.puzzle_feed_ttl = 3600  # 1 hour

    async def _get_redis_client(self) -> Optional[redis.Redis]:
        """Get or create Redis client."""
        if self.redis_client is None:
            try:
                self.redis_client = await redis.from_url(
                    self.redis_url,
                    decode_responses=True,
                )
            except Exception as e:
                logger.warning(f"Failed to connect to Redis: {e}", exc_info=True)
                return None
        return self.redis_client

    def _get_daily_puzzle_key(self, date: str) -> str:
        """Get cache key for daily puzzle."""
        return f"daily_puzzle:{date}"

    def _get_puzzle_feed_key(self, user_id: str) -> str:
        """Get cache key for puzzle feed (user history)."""
        return f"puzzle_feed:{user_id}"

    async def get_daily_puzzle(self, date: str) -> Optional[Dict[str, Any]]:
        """Get daily puzzle from cache.

        Args:
            date: Date string (YYYY-MM-DD)

        Returns:
            Cached daily puzzle data if found, None otherwise
        """
        start_time = time.time()
        try:
            redis_client = await self._get_redis_client()
            if not redis_client:
                cache_misses_total.labels(cache_type="daily_puzzle").inc()
                return None

            key = self._get_daily_puzzle_key(date)
            cached_data = await redis_client.get(key)

            latency = time.time() - start_time
            cache_latency_seconds.labels(cache_type="daily_puzzle", operation="get").observe(latency)

            if cached_data:
                cache_hits_total.labels(cache_type="daily_puzzle").inc()
                return json.loads(cached_data)
            else:
                cache_misses_total.labels(cache_type="daily_puzzle").inc()
        except Exception as e:
            cache_misses_total.labels(cache_type="daily_puzzle").inc()
            logger.warning(f"Cache read error for daily puzzle: {e}", exc_info=True)

        return None

    async def set_daily_puzzle(self, date: str, data: Dict[str, Any]) -> None:
        """Cache daily puzzle data.

        Args:
            date: Date string (YYYY-MM-DD)
            data: Daily puzzle data to cache
        """
        start_time = time.time()
        try:
            redis_client = await self._get_redis_client()
            if not redis_client:
                return

            key = self._get_daily_puzzle_key(date)
            await redis_client.setex(
                key,
                self.daily_puzzle_ttl,
                json.dumps(data),
            )
            latency = time.time() - start_time
            cache_latency_seconds.labels(cache_type="daily_puzzle", operation="set").observe(latency)
        except Exception as e:
            logger.warning(f"Cache write error for daily puzzle: {e}", exc_info=True)

    async def get_puzzle_feed(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get puzzle feed (user history) from cache.

        Args:
            user_id: User ID

        Returns:
            Cached puzzle feed data if found, None otherwise
        """
        start_time = time.time()
        try:
            redis_client = await self._get_redis_client()
            if not redis_client:
                cache_misses_total.labels(cache_type="puzzle_feed").inc()
                return None

            key = self._get_puzzle_feed_key(user_id)
            cached_data = await redis_client.get(key)

            latency = time.time() - start_time
            cache_latency_seconds.labels(cache_type="puzzle_feed", operation="get").observe(latency)

            if cached_data:
                cache_hits_total.labels(cache_type="puzzle_feed").inc()
                return json.loads(cached_data)
            else:
                cache_misses_total.labels(cache_type="puzzle_feed").inc()
        except Exception as e:
            cache_misses_total.labels(cache_type="puzzle_feed").inc()
            logger.warning(f"Cache read error for puzzle feed: {e}", exc_info=True)

        return None

    async def set_puzzle_feed(self, user_id: str, data: Dict[str, Any]) -> None:
        """Cache puzzle feed data.

        Args:
            user_id: User ID
            data: Puzzle feed data to cache
        """
        start_time = time.time()
        try:
            redis_client = await self._get_redis_client()
            if not redis_client:
                return

            key = self._get_puzzle_feed_key(user_id)
            await redis_client.setex(
                key,
                self.puzzle_feed_ttl,
                json.dumps(data),
            )
            latency = time.time() - start_time
            cache_latency_seconds.labels(cache_type="puzzle_feed", operation="set").observe(latency)
        except Exception as e:
            logger.warning(f"Cache write error for puzzle feed: {e}", exc_info=True)

    async def invalidate_daily_puzzle(self, date: Optional[str] = None) -> int:
        """Invalidate daily puzzle cache.

        Args:
            date: Optional date string to invalidate specific entry, None to clear all

        Returns:
            Number of keys deleted
        """
        try:
            redis_client = await self._get_redis_client()
            if not redis_client:
                return 0

            if date:
                key = self._get_daily_puzzle_key(date)
                deleted = await redis_client.delete(key)
                return deleted
            else:
                pattern = "daily_puzzle:*"
                keys = []
                async for key in redis_client.scan_iter(match=pattern):
                    keys.append(key)
                if keys:
                    return await redis_client.delete(*keys)
                return 0
        except Exception as e:
            logger.error(f"Cache invalidation error: {e}", exc_info=True)
            return 0

    async def invalidate_puzzle_feed(self, user_id: Optional[str] = None) -> int:
        """Invalidate puzzle feed cache.

        Args:
            user_id: Optional user ID to invalidate specific entry, None to clear all

        Returns:
            Number of keys deleted
        """
        try:
            redis_client = await self._get_redis_client()
            if not redis_client:
                return 0

            if user_id:
                key = self._get_puzzle_feed_key(user_id)
                deleted = await redis_client.delete(key)
                return deleted
            else:
                pattern = "puzzle_feed:*"
                keys = []
                async for key in redis_client.scan_iter(match=pattern):
                    keys.append(key)
                if keys:
                    return await redis_client.delete(*keys)
                return 0
        except Exception as e:
            logger.error(f"Cache invalidation error: {e}", exc_info=True)
            return 0
