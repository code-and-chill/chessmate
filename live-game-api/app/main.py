"""FastAPI application factory."""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from app.api.routes import router as api_v1_router
from app.api.routes.health import router as health_router
from app.core.config import get_settings
from app.core.exceptions import setup_exception_handlers
from app.core.tracing import (
    instrument_fastapi,
    instrument_httpx,
    instrument_sqlalchemy,
    setup_tracing,
)
from app.infrastructure.database import database_manager
from app.api.middleware.rate_limit import RateLimitMiddleware
from app.api.middleware.metrics import MetricsMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan manager."""
    # Startup
    await database_manager.connect()

    yield

    # Shutdown
    await database_manager.disconnect()


def create_app() -> FastAPI:
    """Create FastAPI application."""
    settings = get_settings()

    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description=settings.DESCRIPTION,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
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

    # Add metrics middleware (before rate limiting to track all requests)
    app.add_middleware(MetricsMiddleware)

    # Add rate limiting middleware
    if settings.RATE_LIMIT_ENABLED:
        app.add_middleware(RateLimitMiddleware)

    # Initialize observability
    setup_tracing()
    instrument_fastapi(app)
    instrument_httpx()
    instrument_sqlalchemy()

    # Exception handlers
    setup_exception_handlers(app)

    # Routes
    app.include_router(health_router)
    app.include_router(api_v1_router, prefix=settings.API_V1_STR)

    return app


app = create_app()

if __name__ == "__main__":
    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info",
    )
