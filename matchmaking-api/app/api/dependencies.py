"""Dependencies for request handlers."""
from typing import Annotated

import httpx
import redis.asyncio as redis
from fastapi import Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.exceptions import UnauthorizedException
from app.core.security import JWTTokenData, decode_token
from app.domain.services.challenge_service import ChallengeService
from app.domain.services.matchmaking_service import MatchmakingService
from app.infrastructure.database.connection import database_manager
from app.infrastructure.external.live_game_api import LiveGameAPIClient
from app.infrastructure.repositories.postgres_challenge_repo import (
    PostgresChallengeRepository,
)
from app.infrastructure.repositories.postgres_match_record_repo import (
    PostgresMatchRecordRepository,
)
from app.infrastructure.repositories.redis_queue_store import RedisQueueStore


async def get_token_data(
    authorization: Annotated[str, Header()] = "",
) -> JWTTokenData:
    """Extract and validate JWT token from Authorization header.

    Args:
        authorization: Authorization header value

    Returns:
        Decoded JWT token data

    Raises:
        UnauthorizedException: If token is invalid
    """
    if not authorization.startswith("Bearer "):
        raise UnauthorizedException("Invalid authorization header format")

    token = authorization[7:]  # Remove "Bearer " prefix
    return decode_token(token)


async def get_db_session() -> AsyncSession:
    """Get database session."""
    async with database_manager.session() as session:
        yield session


async def get_redis_client() -> redis.Redis:
    """Get Redis client from app state."""
    settings = get_settings()
    client = await redis.from_url(
        settings.REDIS_URL,
        decode_responses=settings.REDIS_DECODE_RESPONSES,
    )
    try:
        yield client
    finally:
        await client.close()


async def get_http_client() -> httpx.AsyncClient:
    """Get HTTP client."""
    settings = get_settings()
    client = httpx.AsyncClient(timeout=settings.LIVE_GAME_API_TIMEOUT_SECONDS)
    try:
        yield client
    finally:
        await client.aclose()


def get_queue_store(
    redis_client: Annotated[redis.Redis, Depends(get_redis_client)],
) -> RedisQueueStore:
    """Get queue store repository."""
    return RedisQueueStore(redis_client)


def get_challenge_repo(
    session: Annotated[AsyncSession, Depends(get_db_session)],
) -> PostgresChallengeRepository:
    """Get challenge repository."""
    return PostgresChallengeRepository(session)


def get_match_record_repo(
    session: Annotated[AsyncSession, Depends(get_db_session)],
) -> PostgresMatchRecordRepository:
    """Get match record repository."""
    return PostgresMatchRecordRepository(session)


def get_live_game_api_client(
    http_client: Annotated[httpx.AsyncClient, Depends(get_http_client)],
) -> LiveGameAPIClient:
    """Get live game API client."""
    return LiveGameAPIClient(http_client)


def get_matchmaking_service(
    queue_store: Annotated[RedisQueueStore, Depends(get_queue_store)],
    match_repo: Annotated[PostgresMatchRecordRepository, Depends(get_match_record_repo)],
    live_game_api: Annotated[LiveGameAPIClient, Depends(get_live_game_api_client)],
) -> MatchmakingService:
    """Get matchmaking service."""
    return MatchmakingService(queue_store, match_repo, live_game_api)


def get_challenge_service(
    challenge_repo: Annotated[PostgresChallengeRepository, Depends(get_challenge_repo)],
    live_game_api: Annotated[LiveGameAPIClient, Depends(get_live_game_api_client)],
) -> ChallengeService:
    """Get challenge service."""
    return ChallengeService(challenge_repo, live_game_api)
