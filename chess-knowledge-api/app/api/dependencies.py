"""FastAPI dependencies for chess-knowledge-api."""

from functools import lru_cache
from typing import Optional

import redis.asyncio as redis

from app.core.config import get_settings
from app.infrastructure.cache.knowledge_cache import KnowledgeCache

_settings = get_settings()
_redis_client: Optional[redis.Redis] = None
_knowledge_cache: Optional[KnowledgeCache] = None


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


async def get_knowledge_cache() -> Optional[KnowledgeCache]:
    """Get knowledge cache instance (singleton)."""
    global _knowledge_cache
    
    if not _settings.CACHE_ENABLED:
        return None
        
    if _knowledge_cache is None:
        redis_client = await get_redis_client()
        if redis_client:
            _knowledge_cache = KnowledgeCache(redis_client=redis_client)
    
    return _knowledge_cache
