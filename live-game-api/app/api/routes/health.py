"""Health check routes."""

from fastapi import APIRouter, Response

from app.api.models import HealthResponse
from app.core.metrics import get_metrics_response

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(status="ok", service="live-game-api")


@router.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint."""
    metrics_data, content_type = get_metrics_response()
    return Response(content=metrics_data, media_type=content_type)
