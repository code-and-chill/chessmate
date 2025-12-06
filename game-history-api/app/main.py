from fastapi import FastAPI

from app.api.routes.v1.games import router as games_router
from app.core.dependencies import get_repository
from app.services.repository import GameHistoryRepository


# Initialize shared repository instance
repository = GameHistoryRepository()


def create_app() -> FastAPI:
    app = FastAPI(title="game-history-api", version="1.0.0")

    @app.get("/health", tags=["health"])
    async def health_check() -> dict:
        return {"status": "ok", "service": "game-history-api"}

    # Dependency override for repository
    app.dependency_overrides[get_repository] = lambda: repository

    app.include_router(games_router, prefix="/api/v1")
    return app


app = create_app()
