"""API dependencies."""

from typing import AsyncGenerator

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.core.security import extract_user_id_from_token
from app.infrastructure.database import get_db_session

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> UUID:
    """Get current authenticated user from JWT token."""
    try:
        user_id = extract_user_id_from_token(credentials.credentials)
        return user_id
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )


# Singleton event publisher instance (shared across requests)
_event_publisher_instance = None


def get_event_publisher():
    """Get event publisher instance (singleton)."""
    global _event_publisher_instance
    if _event_publisher_instance is None:
        from app.infrastructure.events.event_publisher import EventPublisher
        _event_publisher_instance = EventPublisher()
    return _event_publisher_instance


# Singleton WebSocket connection manager instance
_websocket_manager_instance = None


def get_websocket_manager():
    """Get WebSocket connection manager instance (singleton)."""
    global _websocket_manager_instance
    if _websocket_manager_instance is None:
        from app.infrastructure.websocket.connection_manager import WebSocketConnectionManager
        _websocket_manager_instance = WebSocketConnectionManager()
    return _websocket_manager_instance


async def get_game_service(
    db: AsyncSession = Depends(get_db_session),
    event_publisher = Depends(get_event_publisher),
    websocket_manager = Depends(get_websocket_manager),
):
    """Get game service with dependencies."""
    from app.domain.repositories.game_repository import GameRepositoryInterface
    from app.domain.services.game_service import GameService
    from app.domain.services.rating_decision_engine import RatingDecisionEngine, RulesConfig
    from app.infrastructure.database.repository import GameRepository
    import os

    repository: GameRepositoryInterface = GameRepository(db)

    # Configure decision engine from environment (with sensible defaults)
    max_gap = int(os.getenv("RATED_MAX_RATING_DIFFERENCE", "500"))
    allow_custom_fen = os.getenv("ALLOW_CUSTOM_FEN_RATED", "false").lower() == "true"
    allow_odds = os.getenv("ALLOW_ODDS_RATED", "false").lower() == "true"

    rules = RulesConfig(
        MAX_RATED_RATING_DIFFERENCE=max_gap,
        ALLOW_CUSTOM_FEN_RATED=allow_custom_fen,
        ALLOW_ODDS_RATED=allow_odds,
    )
    decision_engine = RatingDecisionEngine(rules)

    return GameService(
        repository,
        decision_engine,
        event_publisher=event_publisher,
        websocket_manager=websocket_manager,
    )
