"""Redis caching for chess knowledge API."""

import json
import logging
import time
from typing import Optional, List, Dict, Any

import redis.asyncio as redis

from app.core.config import get_settings
from app.core.metrics import (
    cache_hits_total,
    cache_latency_seconds,
    cache_misses_total,
)
from app.domain.opening_book import BookMove
from app.domain.tablebase import TablebaseResponse

logger = logging.getLogger(__name__)


class KnowledgeCache:
    """Redis-based cache for opening book and tablebase queries."""

    def __init__(self, redis_client: Optional[redis.Redis] = None):
        """Initialize cache.

        Args:
            redis_client: Optional Redis client (will create if not provided)
        """
        self.redis_client = redis_client
        self.settings = get_settings()
        self.opening_cache_ttl = self.settings.OPENING_CACHE_TTL_SECONDS
        self.tablebase_cache_ttl = self.settings.TABLEBASE_CACHE_TTL_SECONDS

    async def _get_redis_client(self) -> redis.Redis:
        """Get or create Redis client."""
        if self.redis_client is None:
            self.redis_client = await redis.from_url(
                self.settings.REDIS_URL,
                decode_responses=True,
            )
        return self.redis_client

    def _get_opening_cache_key(self, fen: str, depth: Optional[int] = None) -> str:
        """Get cache key for opening book query."""
        if depth:
            return f"opening:{fen}:{depth}"
        return f"opening:{fen}"

    def _get_tablebase_cache_key(self, fen: str) -> str:
        """Get cache key for tablebase query."""
        return f"tablebase:{fen}"

    async def get_opening_moves(
        self, fen: str, depth: Optional[int] = None
    ) -> Optional[List[BookMove]]:
        """Get opening moves from cache.

        Args:
            fen: FEN string
            depth: Optional depth parameter

        Returns:
            List of BookMove if found in cache, None otherwise
        """
        start_time = time.time()
        try:
            redis_client = await self._get_redis_client()
            key = self._get_opening_cache_key(fen, depth)
            cached_data = await redis_client.get(key)

            latency = time.time() - start_time
            cache_latency_seconds.labels(cache_type="opening", operation="get").observe(latency)

            if cached_data:
                data = json.loads(cached_data)
                cache_hits_total.labels(cache_type="opening").inc()
                return [BookMove(**move) for move in data]
            else:
                cache_misses_total.labels(cache_type="opening").inc()
        except Exception as e:
            cache_misses_total.labels(cache_type="opening").inc()
            logger.warning(f"Cache read error for opening: {e}", exc_info=True)

        return None

    async def set_opening_moves(
        self, fen: str, moves: List[BookMove], depth: Optional[int] = None
    ) -> None:
        """Cache opening moves.

        Args:
            fen: FEN string
            moves: List of BookMove to cache
            depth: Optional depth parameter
        """
        start_time = time.time()
        try:
            redis_client = await self._get_redis_client()
            key = self._get_opening_cache_key(fen, depth)
            data = [move.model_dump() for move in moves]
            await redis_client.setex(
                key,
                self.opening_cache_ttl,
                json.dumps(data),
            )
            latency = time.time() - start_time
            cache_latency_seconds.labels(cache_type="opening", operation="set").observe(latency)
        except Exception as e:
            logger.warning(f"Cache write error for opening: {e}", exc_info=True)

    async def get_tablebase_result(self, fen: str) -> Optional[TablebaseResponse]:
        """Get tablebase result from cache.

        Args:
            fen: FEN string

        Returns:
            TablebaseResponse if found in cache, None otherwise
        """
        start_time = time.time()
        try:
            redis_client = await self._get_redis_client()
            key = self._get_tablebase_cache_key(fen)
            cached_data = await redis_client.get(key)

            latency = time.time() - start_time
            cache_latency_seconds.labels(cache_type="tablebase", operation="get").observe(latency)

            if cached_data:
                data = json.loads(cached_data)
                cache_hits_total.labels(cache_type="tablebase").inc()
                return TablebaseResponse(**data)
            else:
                cache_misses_total.labels(cache_type="tablebase").inc()
        except Exception as e:
            cache_misses_total.labels(cache_type="tablebase").inc()
            logger.warning(f"Cache read error for tablebase: {e}", exc_info=True)

        return None

    async def set_tablebase_result(
        self, fen: str, result: TablebaseResponse
    ) -> None:
        """Cache tablebase result.

        Args:
            fen: FEN string
            result: TablebaseResponse to cache
        """
        start_time = time.time()
        try:
            redis_client = await self._get_redis_client()
            key = self._get_tablebase_cache_key(fen)
            data = result.model_dump()
            await redis_client.setex(
                key,
                self.tablebase_cache_ttl,
                json.dumps(data),
            )
            latency = time.time() - start_time
            cache_latency_seconds.labels(cache_type="tablebase", operation="set").observe(latency)
        except Exception as e:
            logger.warning(f"Cache write error for tablebase: {e}", exc_info=True)

    async def invalidate_opening_cache(self, fen: Optional[str] = None) -> int:
        """Invalidate opening book cache.

        Args:
            fen: Optional FEN string to invalidate specific entry, None to clear all

        Returns:
            Number of keys deleted
        """
        try:
            redis_client = await self._get_redis_client()
            if fen:
                # Delete specific entry
                key = self._get_opening_cache_key(fen)
                deleted = await redis_client.delete(key)
                return deleted
            else:
                # Delete all opening cache entries
                pattern = "opening:*"
                keys = []
                async for key in redis_client.scan_iter(match=pattern):
                    keys.append(key)
                if keys:
                    return await redis_client.delete(*keys)
                return 0
        except Exception as e:
            logger.error(f"Cache invalidation error: {e}", exc_info=True)
            return 0

    async def invalidate_tablebase_cache(self, fen: Optional[str] = None) -> int:
        """Invalidate tablebase cache.

        Args:
            fen: Optional FEN string to invalidate specific entry, None to clear all

        Returns:
            Number of keys deleted
        """
        try:
            redis_client = await self._get_redis_client()
            if fen:
                # Delete specific entry
                key = self._get_tablebase_cache_key(fen)
                deleted = await redis_client.delete(key)
                return deleted
            else:
                # Delete all tablebase cache entries
                pattern = "tablebase:*"
                keys = []
                async for key in redis_client.scan_iter(match=pattern):
                    keys.append(key)
                if keys:
                    return await redis_client.delete(*keys)
                return 0
        except Exception as e:
            logger.error(f"Cache invalidation error: {e}", exc_info=True)
            return 0
