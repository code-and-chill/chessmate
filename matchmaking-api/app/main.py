"""FastAPI application factory."""
import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import httpx
import redis.asyncio as redis
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from app.api.routes.internal.queues import router as internal_queues_router
from app.api.routes.v1.queue import router as v1_queue_router
from app.core.config import get_settings
from app.core.exceptions import setup_exception_handlers
from app.infrastructure.database.connection import database_manager
from app.infrastructure.external.live_game_api import LiveGameAPIClient
from app.infrastructure.repositories.postgres_challenge_repo import (
    PostgresChallengeRepository,
)
from app.infrastructure.repositories.postgres_match_record_repo import (
    PostgresMatchRecordRepository,
)
from app.infrastructure.repositories.redis_queue_store import RedisQueueStore

logger = logging.getLogger(__name__)


# Global state
redis_client: redis.Redis | None = None
http_client: httpx.AsyncClient | None = None


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan manager.

    Handles startup and shutdown.
    """
    global redis_client, http_client

    # Startup
    settings = get_settings()

    logger.info(f"Starting {settings.SERVICE_NAME} v{settings.VERSION}")

    # Connect to database
    await database_manager.connect()

    # Connect to Redis
    redis_client = await redis.from_url(
        settings.REDIS_URL,
        decode_responses=settings.REDIS_DECODE_RESPONSES,
    )
    logger.info("Redis connected")

    # Create HTTP client
    http_client = httpx.AsyncClient(timeout=settings.LIVE_GAME_API_TIMEOUT_SECONDS)
    logger.info("HTTP client created")

    # TODO: Start matchmaking worker in background
    # await run_worker(matchmaking_service)

    yield

    # Shutdown
    logger.info("Shutting down")

    if http_client:
        await http_client.aclose()
        logger.info("HTTP client closed")

    if redis_client:
        await redis_client.close()
        logger.info("Redis disconnected")

    await database_manager.disconnect()

    logger.info(f"{settings.SERVICE_NAME} shutdown complete")


def create_app() -> FastAPI:
    """Create FastAPI application.

    Returns:
        Configured FastAPI application
    """
    settings = get_settings()

    app = FastAPI(
        title=settings.PROJECT_NAME,
        description=settings.DESCRIPTION,
        version=settings.VERSION,
        docs_url="/docs",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_HOSTS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.ALLOWED_HOSTS,
    )

    # Exception handlers
    setup_exception_handlers(app)

    # Health check
    @app.get("/health")
    async def health_check() -> dict:
        """Health check endpoint."""
        return {
            "status": "ok",
            "service": settings.SERVICE_NAME,
            "version": settings.VERSION,
        }

    # Routes
    app.include_router(v1_queue_router)
    app.include_router(internal_queues_router)

    return app


app = create_app()

if __name__ == "__main__":
    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )
