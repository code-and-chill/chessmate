"""WebSocket connection manager for game subscriptions."""

import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import Dict, Set, Optional
from uuid import UUID, uuid4

import redis.asyncio as redis

from app.core.config import get_settings
from app.core.metrics import (
    live_game_websocket_connections,
    live_game_websocket_reconnects_total,
)

logger = logging.getLogger(__name__)


class WebSocketConnectionManager:
    """Manages WebSocket connections and game subscriptions."""

    def __init__(self, redis_client: Optional[redis.Redis] = None):
        """Initialize connection manager.

        Args:
            redis_client: Optional Redis client (will create if not provided)
        """
        self.redis_client = redis_client
        self.settings = get_settings()
        # In-memory connection tracking (per-instance)
        self.active_connections: Dict[str, Set] = {}  # game_id -> set of connection IDs
        self.connection_games: Dict[str, Set] = {}  # connection_id -> set of game_ids

    async def _get_redis_client(self) -> redis.Redis:
        """Get or create Redis client."""
        if self.redis_client is None:
            self.redis_client = await redis.from_url(
                self.settings.REDIS_URL,
                decode_responses=self.settings.REDIS_DECODE_RESPONSES,
            )
        return self.redis_client

    def _get_connection_key(self, connection_id: str) -> str:
        """Get Redis key for connection state."""
        return f"ws:conn:{connection_id}"

    def _get_game_subscribers_key(self, game_id: UUID) -> str:
        """Get Redis key for game subscribers."""
        return f"ws:game:{game_id}:subscribers"

    def _get_pubsub_channel(self, game_id: UUID) -> str:
        """Get Redis pub/sub channel for game updates."""
        return f"pubsub:game:{game_id}"

    async def connect(self, connection_id: str, game_id: UUID) -> None:
        """Register a connection for a game.

        Args:
            connection_id: Unique connection identifier
            game_id: Game UUID to subscribe to
        """
        game_id_str = str(game_id)
        
        # Track in memory
        if game_id_str not in self.active_connections:
            self.active_connections[game_id_str] = set()
        self.active_connections[game_id_str].add(connection_id)
        
        if connection_id not in self.connection_games:
            self.connection_games[connection_id] = set()
        self.connection_games[connection_id].add(game_id_str)

        # Track in Redis (for cross-instance awareness)
        try:
            redis_client = await self._get_redis_client()
            await redis_client.sadd(self._get_game_subscribers_key(game_id), connection_id)
            await redis_client.setex(
                self._get_connection_key(connection_id),
                3600,  # TTL 1 hour
                json.dumps({
                    "connected_at": datetime.now(timezone.utc).isoformat(),
                    "games": [game_id_str],
                })
            )
            
            # Update metrics
            total_connections = sum(len(conns) for conns in self.active_connections.values())
            live_game_websocket_connections.set(total_connections)
        except Exception as e:
            logger.error(f"Failed to track connection in Redis: {e}", exc_info=True)

    async def disconnect(self, connection_id: str) -> None:
        """Unregister a connection.

        Args:
            connection_id: Connection identifier
        """
        # Remove from memory tracking
        if connection_id in self.connection_games:
            game_ids = self.connection_games[connection_id].copy()
            for game_id_str in game_ids:
                if game_id_str in self.active_connections:
                    self.active_connections[game_id_str].discard(connection_id)
                    if not self.active_connections[game_id_str]:
                        del self.active_connections[game_id_str]
            del self.connection_games[connection_id]

        # Remove from Redis
        try:
            redis_client = await self._get_redis_client()
            connection_key = self._get_connection_key(connection_id)
            connection_data = await redis_client.get(connection_key)
            
            if connection_data:
                data = json.loads(connection_data)
                for game_id_str in data.get("games", []):
                    game_id = UUID(game_id_str)
                    await redis_client.srem(self._get_game_subscribers_key(game_id), connection_id)
            
            await redis_client.delete(connection_key)
            
            # Update metrics
            total_connections = sum(len(conns) for conns in self.active_connections.values())
            live_game_websocket_connections.set(total_connections)
        except Exception as e:
            logger.error(f"Failed to remove connection from Redis: {e}", exc_info=True)

    async def get_subscribers(self, game_id: UUID) -> Set[str]:
        """Get all connection IDs subscribed to a game.

        Args:
            game_id: Game UUID

        Returns:
            Set of connection IDs
        """
        game_id_str = str(game_id)
        subscribers = self.active_connections.get(game_id_str, set()).copy()
        
        # Also get from Redis (for cross-instance)
        try:
            redis_client = await self._get_redis_client()
            redis_subscribers = await redis_client.smembers(self._get_game_subscribers_key(game_id))
            subscribers.update(redis_subscribers)
        except Exception as e:
            logger.error(f"Failed to get subscribers from Redis: {e}", exc_info=True)
        
        return subscribers

    async def broadcast_to_game(self, game_id: UUID, message: dict) -> None:
        """Broadcast message to all subscribers of a game.

        Args:
            game_id: Game UUID
            message: Message dictionary to broadcast
        """
        # Publish to Redis pub/sub for cross-instance broadcasting
        try:
            redis_client = await self._get_redis_client()
            channel = self._get_pubsub_channel(game_id)
            await redis_client.publish(channel, json.dumps(message))
        except Exception as e:
            logger.error(f"Failed to publish to Redis pub/sub: {e}", exc_info=True)

    async def close(self) -> None:
        """Close Redis connection."""
        if self.redis_client:
            await self.redis_client.close()
