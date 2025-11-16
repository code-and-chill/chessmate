"""Health check response model."""
from pydantic import BaseModel


class HealthResponse(BaseModel):
    """Health check response model."""

    status: str
    service: str
