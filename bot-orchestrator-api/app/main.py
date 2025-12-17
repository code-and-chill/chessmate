from contextlib import asynccontextmanager
from typing import AsyncGenerator

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from app.api.routes.health import router as health_router
from app.api.routes.v1.bots import router as v1_bots_router
from app.core.config import get_settings
from app.core.tracing import (
    instrument_fastapi,
    instrument_httpx,
    setup_tracing,
)
from app.api.middleware.metrics import MetricsMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # Startup
    yield
    # Shutdown


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.PROJECT_NAME,
        description=settings.DESCRIPTION,
        version=settings.VERSION,
        docs_url="/docs",
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        lifespan=lifespan,
    )

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

    # Add metrics middleware
    app.add_middleware(MetricsMiddleware)

    # Initialize observability
    setup_tracing()
    instrument_fastapi(app)
    instrument_httpx()

    # Routes
    app.include_router(health_router)
    app.include_router(v1_bots_router, prefix=settings.API_V1_STR)

    # Metrics endpoint
    @app.get("/metrics")
    async def metrics():
        """Prometheus metrics endpoint."""
        from fastapi import Response
        from app.core.metrics import get_metrics_response

        metrics_data, content_type = get_metrics_response()
        return Response(content=metrics_data, media_type=content_type)

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
