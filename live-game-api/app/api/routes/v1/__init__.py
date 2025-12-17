"""V1 routes package."""

from fastapi import APIRouter

from app.api.routes.v1.games import router as games_router
from app.api.routes.v1.websocket import router as websocket_router

router = APIRouter()
router.include_router(games_router)
router.include_router(websocket_router)
