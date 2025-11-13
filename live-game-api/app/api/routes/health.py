"""Health check routes."""

from fastapi import APIRouter

from app.api.models import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(status="ok", service="live-game-api")
