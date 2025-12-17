"""Redis cache for active game state."""

import json
import logging
from typing import Optional
from uuid import UUID

import redis.asyncio as redis

from app.core.config import get_settings
from app.domain.models.game import Game

logger = logging.getLogger(__name__)


class GameCache:
    """Redis-based cache for active game state."""

    def __init__(self, redis_client: Optional[redis.Redis] = None):
        """Initialize game cache.

        Args:
            redis_client: Optional Redis client (will create if not provided)
        """
        self.redis_client = redis_client
        self.settings = get_settings()
        self.ttl_seconds = self.settings.GAME_CACHE_TTL_SECONDS

    async def _get_client(self) -> redis.Redis:
        """Get or create Redis client."""
        if self.redis_client is None:
            self.redis_client = await redis.from_url(
                self.settings.REDIS_URL,
                decode_responses=self.settings.REDIS_DECODE_RESPONSES,
            )
        return self.redis_client

    def _get_cache_key(self, game_id: UUID) -> str:
        """Get cache key for game.

        Args:
            game_id: Game UUID

        Returns:
            Cache key string
        """
        return f"game:{game_id}"

    async def get(self, game_id: UUID) -> Optional[Game]:
        """Get game from cache.

        Args:
            game_id: Game UUID

        Returns:
            Game domain object or None if not cached
        """
        try:
            client = await self._get_client()
            cache_key = self._get_cache_key(game_id)
            cached_data = await client.get(cache_key)
            
            if cached_data is None:
                return None

            # Deserialize game from JSON
            game_dict = json.loads(cached_data)
            # Convert dict to Game domain object using Pydantic
            from app.domain.models.game import Game
            try:
                game = Game.model_validate(game_dict)
                logger.debug(f"Cache hit for game {game_id}")
                return game
            except Exception as e:
                logger.warning(f"Failed to deserialize cached game {game_id}: {e}")
                # Delete corrupted cache entry
                await self.delete(game_id)
                return None
            
        except Exception as e:
            logger.error(f"Error getting game from cache: {e}", exc_info=True)
            return None

    async def set(self, game: Game, ttl: Optional[int] = None) -> None:
        """Cache game state.

        Args:
            game: Game domain object
            ttl: Optional TTL in seconds (defaults to config value)
        """
        try:
            client = await self._get_client()
            cache_key = self._get_cache_key(game.id)
            ttl = ttl or self.ttl_seconds

            # Serialize game to JSON using Pydantic
            game_dict = game.model_dump(mode="json")
            cached_data = json.dumps(game_dict)
            
            await client.setex(cache_key, ttl, cached_data)
            logger.debug(f"Cached game {game.id} with TTL {ttl}s")
            
        except Exception as e:
            logger.error(f"Error caching game: {e}", exc_info=True)
            # Don't raise - caching failures shouldn't break operations

    async def delete(self, game_id: UUID) -> None:
        """Remove game from cache.

        Args:
            game_id: Game UUID
        """
        try:
            client = await self._get_client()
            cache_key = self._get_cache_key(game_id)
            await client.delete(cache_key)
            logger.debug(f"Removed game {game_id} from cache")
        except Exception as e:
            logger.error(f"Error deleting game from cache: {e}", exc_info=True)

    async def close(self) -> None:
        """Close Redis connection."""
        if self.redis_client:
            await self.redis_client.close()
