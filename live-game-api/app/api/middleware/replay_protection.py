"""Replay protection middleware for move submission."""

import hashlib
import logging
from typing import Optional

from fastapi import Request, HTTPException, status

import redis.asyncio as redis

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class ReplayProtectionMiddleware:
    """Middleware to prevent replay attacks on move submissions."""

    def __init__(self, redis_client: Optional[redis.Redis] = None):
        """Initialize replay protection middleware.

        Args:
            redis_client: Redis async client (will create if not provided)
        """
        self.settings = get_settings()
        self.redis_client = redis_client
        self.ttl_seconds = 3600  # 1 hour TTL for recent moves

    async def _get_redis_client(self) -> redis.Redis:
        """Get or create Redis client."""
        if self.redis_client is None:
            self.redis_client = await redis.from_url(
                self.settings.REDIS_URL,
                decode_responses=self.settings.REDIS_DECODE_RESPONSES,
            )
        return self.redis_client

    def _get_move_key(self, game_id: str, move_id: str) -> str:
        """Get Redis key for move replay protection.

        Args:
            game_id: Game ID
            move_id: Move ID (or move signature)

        Returns:
            Redis key string
        """
        return f"move:replay:{game_id}:{move_id}"

    async def check_replay(self, game_id: str, move_signature: str) -> bool:
        """Check if move has been seen before.

        Args:
            game_id: Game ID
            move_signature: Unique move signature (e.g., move_id or hash of move data)

        Returns:
            True if move is a replay (should reject), False if new move (allow)
        """
        redis_client = await self._get_redis_client()
        key = self._get_move_key(game_id, move_signature)
        
        # Check if move exists in Redis
        exists = await redis_client.exists(key)
        if exists:
            logger.warning(f"Replay detected for game {game_id}, move signature: {move_signature}")
            return True  # Replay detected
        
        # Mark move as seen
        await redis_client.setex(key, self.ttl_seconds, "1")
        return False  # Not a replay

    async def mark_move_seen(self, game_id: str, move_signature: str) -> None:
        """Mark a move as seen (for idempotency).

        Args:
            game_id: Game ID
            move_signature: Move signature
        """
        redis_client = await self._get_redis_client()
        key = self._get_move_key(game_id, move_signature)
        await redis_client.setex(key, self.ttl_seconds, "1")


# Global instance
_replay_protection: Optional[ReplayProtectionMiddleware] = None


def get_replay_protection() -> ReplayProtectionMiddleware:
    """Get global replay protection instance."""
    global _replay_protection
    if _replay_protection is None:
        _replay_protection = ReplayProtectionMiddleware()
    return _replay_protection
