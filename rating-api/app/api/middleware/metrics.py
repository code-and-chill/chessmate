"""Prometheus metrics middleware for FastAPI."""

import time
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.routing import Match

from app.core.metrics import (
    http_errors_total,
    http_request_latency_seconds,
    http_requests_total,
)


class MetricsMiddleware(BaseHTTPMiddleware):
    """Middleware to collect HTTP metrics."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Record metrics for each HTTP request."""
        start_time = time.time()

        # Get route info
        method = request.method
        route_path = self._get_route_path(request)

        # Process request
        try:
            response = await call_next(request)
            status_code = response.status_code
        except Exception as e:
            status_code = 500
            raise
        finally:
            # Calculate latency
            latency = time.time() - start_time

            # Record metrics
            status_class = f"{status_code // 100}xx"
            http_requests_total.labels(
                method=method,
                endpoint=route_path,
                status=status_class,
            ).inc()

            http_request_latency_seconds.labels(
                method=method,
                endpoint=route_path,
            ).observe(latency)

            # Record errors (4xx and 5xx)
            if status_code >= 400:
                http_errors_total.labels(
                    method=method,
                    endpoint=route_path,
                    status=str(status_code),
                ).inc()

        return response

    def _get_route_path(self, request: Request) -> str:
        """Extract route path pattern for metrics labeling."""
        for route in request.app.routes:
            match, _ = route.matches(request.scope)
            if match == Match.FULL:
                return route.path
        return request.url.path
