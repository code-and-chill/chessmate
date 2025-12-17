"""WebSocket routes for real-time game updates."""

import asyncio
import json
import logging
from typing import Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, status

from app.core.security import extract_user_id_from_token
from app.infrastructure.websocket.connection_manager import WebSocketConnectionManager

logger = logging.getLogger(__name__)

router = APIRouter()

# Singleton connection manager
_connection_manager: Optional[WebSocketConnectionManager] = None


def get_connection_manager() -> WebSocketConnectionManager:
    """Get WebSocket connection manager instance."""
    global _connection_manager
    if _connection_manager is None:
        _connection_manager = WebSocketConnectionManager()
    return _connection_manager


async def authenticate_websocket(websocket: WebSocket, token: Optional[str] = None) -> UUID:
    """Authenticate WebSocket connection.

    Args:
        websocket: WebSocket connection
        token: Optional JWT token from query parameter or header

    Returns:
        User UUID

    Raises:
        HTTPException: If authentication fails
    """
    # Try to get token from query parameter first
    if not token:
        token = websocket.query_params.get("token")
    
    # Try to get from Authorization header
    if not token:
        auth_header = websocket.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    try:
        user_id = extract_user_id_from_token(token)
        return user_id
    except Exception as e:
        logger.warning(f"WebSocket authentication failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )


@router.websocket("/ws/games/{game_id}")
async def websocket_game_updates(
    websocket: WebSocket,
    game_id: UUID,
    connection_manager: WebSocketConnectionManager = Depends(get_connection_manager),
):
    """WebSocket endpoint for real-time game updates.

    Args:
        websocket: WebSocket connection
        game_id: Game UUID to subscribe to
        connection_manager: WebSocket connection manager
    """
    connection_id = str(uuid4())
    
    # Authenticate connection
    try:
        user_id = await authenticate_websocket(websocket)
    except HTTPException:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # Accept connection
    await websocket.accept()
    
    try:
        # Register connection
        await connection_manager.connect(connection_id, game_id)
        logger.info(f"WebSocket connected: {connection_id} for game {game_id}, user {user_id}")

        # Send connection confirmation
        await websocket.send_json({
            "type": "connected",
            "connection_id": connection_id,
            "game_id": str(game_id),
        })

        # Heartbeat/ping loop (keep connection alive)
        async def send_heartbeat():
            while True:
                await asyncio.sleep(30)  # Send ping every 30 seconds
                try:
                    await websocket.send_json({"type": "ping"})
                except Exception:
                    break

        heartbeat_task = asyncio.create_task(send_heartbeat())

        # Message loop
        try:
            while True:
                # Receive message (client can send pong, subscribe, unsubscribe)
                data = await websocket.receive_text()
                
                try:
                    message = json.loads(data)
                    message_type = message.get("type")
                    
                    if message_type == "pong":
                        # Client response to ping
                        continue
                    elif message_type == "subscribe":
                        # Subscribe to additional games (future: multi-game support)
                        target_game_id = UUID(message.get("game_id"))
                        await connection_manager.connect(connection_id, target_game_id)
                    elif message_type == "unsubscribe":
                        # Unsubscribe from games (future: multi-game support)
                        target_game_id = UUID(message.get("game_id"))
                        # Note: Full unsubscribe would require tracking per-game subscriptions
                        pass
                    else:
                        logger.warning(f"Unknown message type: {message_type}")
                except json.JSONDecodeError:
                    logger.warning(f"Invalid JSON message: {data}")
                except Exception as e:
                    logger.error(f"Error processing message: {e}", exc_info=True)

        except WebSocketDisconnect:
            logger.info(f"WebSocket disconnected: {connection_id}")
        finally:
            heartbeat_task.cancel()
            await connection_manager.disconnect(connection_id)

    except Exception as e:
        logger.error(f"WebSocket error: {e}", exc_info=True)
        await connection_manager.disconnect(connection_id)
        try:
            await websocket.close()
        except Exception:
            pass
