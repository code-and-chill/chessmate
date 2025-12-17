"""FastAPI dependencies for puzzle-api."""

from functools import lru_cache
from typing import Optional

import redis.asyncio as redis

from app.core.config import get_settings
from app.infrastructure.cache.puzzle_cache import PuzzleCache

_settings = get_settings()
_redis_client: Optional[redis.Redis] = None
_puzzle_cache: Optional[PuzzleCache] = None


async def get_redis_client() -> Optional[redis.Redis]:
    """Get Redis client (singleton)."""
    global _redis_client
    
    if not _settings.CACHE_ENABLED:
        return None
        
    if _redis_client is None:
        try:
            _redis_client = await redis.from_url(
                _settings.REDIS_URL,
                decode_responses=_settings.REDIS_DECODE_RESPONSES,
            )
        except Exception as e:
            # Log error but don't fail if Redis is unavailable
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Failed to connect to Redis: {e}")
            return None
    
    return _redis_client


def get_puzzle_cache() -> Optional[PuzzleCache]:
    """Get puzzle cache instance (singleton)."""
    global _puzzle_cache
    
    if not _settings.CACHE_ENABLED:
        return None
        
    if _puzzle_cache is None:
        _puzzle_cache = PuzzleCache(redis_url=_settings.REDIS_URL)
    
    return _puzzle_cache
