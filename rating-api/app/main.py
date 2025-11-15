from contextlib import asynccontextmanager
from typing import AsyncGenerator

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from app.api.routes.v1.ratings import router as v1_ratings_router
from app.api.routes.v1.bulk import router as v1_bulk_router
from app.api.routes.v1.game_results import router as v1_game_results_router
from app.api.routes.v1.batch_ingestion import router as v1_batch_router
from app.api.routes.admin.pools import router as admin_pools_router
from app.api.routes.admin.recompute import router as admin_recompute_router
from app.api.routes.admin.adjust import router as admin_adjust_router
from app.core.config import get_settings
from app.core.exceptions import setup_exception_handlers
from app.infrastructure.database import database_manager
from app.infrastructure.outbox_publisher import outbox_publisher


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    await database_manager.connect()
    # Start background outbox publisher
    await outbox_publisher.start()
    yield
    await outbox_publisher.stop()
    await database_manager.disconnect()


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.PROJECT_NAME,
        description=settings.DESCRIPTION,
        version=settings.VERSION,
        docs_url="/docs",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_HOSTS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.ALLOWED_HOSTS)

    setup_exception_handlers(app)

    @app.get("/health")
    async def health_check() -> dict:
        return {"status": "ok", "service": settings.SERVICE_NAME}

    app.include_router(v1_ratings_router)
    app.include_router(v1_bulk_router)
    app.include_router(v1_game_results_router)
    app.include_router(v1_batch_router)
    app.include_router(admin_pools_router)
    app.include_router(admin_recompute_router)
    app.include_router(admin_adjust_router)

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
