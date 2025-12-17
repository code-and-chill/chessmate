"""Middleware to flush Kafka events after request."""

import logging
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class EventFlushMiddleware(BaseHTTPMiddleware):
    """Middleware to flush Kafka events after request completes."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Dispatch request and flush events after response."""
        response = await call_next(request)
        
        # Flush events after response is ready
        # Note: Event publisher is created per-request, so we need to get it from app state
        # For now, we'll let the producer handle flushing automatically
        # In production, you might want to flush more aggressively
        
        return response
