"""Shard routing for game state distribution."""

import hashlib
import logging
from typing import Optional
from uuid import UUID

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class ShardRouter:
    """Routes game requests to appropriate shard using consistent hashing."""

    def __init__(self, shard_count: Optional[int] = None):
        """Initialize shard router.

        Args:
            shard_count: Number of shards (defaults to config value)
        """
        settings = get_settings()
        self.shard_count = shard_count or settings.SHARD_COUNT
        self.enabled = settings.SHARD_ENABLED

    def get_shard_for_game(self, game_id: UUID) -> int:
        """Get shard number for a game using consistent hashing.

        Args:
            game_id: Game UUID

        Returns:
            Shard number (0 to shard_count-1)
        """
        if not self.enabled:
            return 0  # Single shard mode

        # Use consistent hashing (MD5 hash of game_id, modulo shard_count)
        game_id_str = str(game_id)
        hash_value = int(hashlib.md5(game_id_str.encode()).hexdigest(), 16)
        shard = hash_value % self.shard_count
        
        logger.debug(f"Game {game_id} routed to shard {shard}")
        return shard

    def should_handle_shard(self, game_id: UUID, current_shard: int) -> bool:
        """Check if current instance should handle this game.

        Args:
            game_id: Game UUID
            current_shard: Shard number of current instance

        Returns:
            True if this instance should handle the game
        """
        target_shard = self.get_shard_for_game(game_id)
        return target_shard == current_shard
