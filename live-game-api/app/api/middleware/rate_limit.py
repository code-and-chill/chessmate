"""Rate limiting middleware for live-game-api."""

import logging
from datetime import datetime, timezone
from typing import Optional, Callable

from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

import redis.asyncio as redis

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware using Redis."""

    def __init__(self, app: Callable, redis_client: Optional[redis.Redis] = None):
        """Initialize rate limiting middleware.

        Args:
            app: ASGI application
            redis_client: Redis async client (will create if not provided)
        """
        super().__init__(app)
        self.settings = get_settings()
        self.redis_client = redis_client
        self.enabled = True

        # Rate limit configuration
        self.move_submission_limit = 10  # Max 10 moves per user per window
        self.move_submission_window_seconds = 60  # 60 second window
        self.ip_limit = 50  # Max 50 requests per IP per window
        self.ip_window_seconds = 60  # 60 second window

    async def _get_redis_client(self) -> redis.Redis:
        """Get or create Redis client."""
        if self.redis_client is None:
            self.redis_client = await redis.from_url(
                self.settings.REDIS_URL,
                decode_responses=self.settings.REDIS_DECODE_RESPONSES,
            )
        return self.redis_client

    def _get_user_rate_limit_key(self, user_id: str, endpoint: str) -> str:
        """Get Redis key for user rate limit."""
        return f"rate_limit:user:{user_id}:{endpoint}"

    def _get_ip_rate_limit_key(self, ip: str) -> str:
        """Get Redis key for IP rate limit."""
        return f"rate_limit:ip:{ip}"

    async def _check_rate_limit(self, key: str, limit: int, window_seconds: int) -> tuple[bool, int, int]:
        """Check rate limit for a key.

        Args:
            key: Redis key
            limit: Maximum number of requests
            window_seconds: Time window in seconds

        Returns:
            Tuple of (allowed, remaining, reset_after)
        """
        redis_client = await self._get_redis_client()
        
        current = await redis_client.get(key)
        current_count = int(current) if current else 0

        if current_count >= limit:
            ttl = await redis_client.ttl(key)
            return False, 0, ttl if ttl > 0 else window_seconds

        # Increment counter
        pipe = redis_client.pipeline()
        pipe.incr(key)
        pipe.expire(key, window_seconds)
        await pipe.execute()

        remaining = limit - (current_count + 1)
        return True, remaining, window_seconds

    def _get_user_id(self, request: Request) -> Optional[str]:
        """Extract user ID from request (from JWT or header).

        Args:
            request: FastAPI request

        Returns:
            User ID or None
        """
        # In a real implementation, decode JWT to get user_id
        # For now, return None if not available
        return None

    def _get_client_ip(self, request: Request) -> str:
        """Get client IP address.

        Args:
            request: FastAPI request

        Returns:
            Client IP address
        """
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()

        if request.client:
            return request.client.host

        return "unknown"

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process request with rate limiting.

        Args:
            request: FastAPI request
            call_next: Next middleware/handler

        Returns:
            Response

        Raises:
            HTTPException: If rate limit exceeded
        """
        if not self.enabled:
            return await call_next(request)

        path = request.url.path
        method = request.method

        # Move submission endpoint - user-based rate limiting
        if "/moves" in path and method == "POST":
            user_id = self._get_user_id(request)
            if user_id:
                allowed, remaining, reset_after = await self._check_rate_limit(
                    self._get_user_rate_limit_key(user_id, "move_submission"),
                    self.move_submission_limit,
                    self.move_submission_window_seconds,
                )
                if not allowed:
                    response = Response(
                        content='{"error": "Rate limit exceeded. Please try again later."}',
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        media_type="application/json",
                    )
                    response.headers["X-RateLimit-Limit"] = str(self.move_submission_limit)
                    response.headers["X-RateLimit-Remaining"] = "0"
                    response.headers["X-RateLimit-Reset"] = str(int(datetime.now(timezone.utc).timestamp()) + reset_after)
                    logger.warning(f"Rate limit exceeded for user: {user_id} on move submission")
                    return response

        # IP-based rate limiting for all endpoints
        client_ip = self._get_client_ip(request)
        allowed, remaining, reset_after = await self._check_rate_limit(
            self._get_ip_rate_limit_key(client_ip),
            self.ip_limit,
            self.ip_window_seconds,
        )
        if not allowed:
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            response = Response(
                content='{"error": "Rate limit exceeded. Please try again later."}',
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                media_type="application/json",
            )
            response.headers["X-RateLimit-Limit"] = str(self.ip_limit)
            response.headers["X-RateLimit-Remaining"] = "0"
            response.headers["X-RateLimit-Reset"] = str(int(datetime.now(timezone.utc).timestamp()) + reset_after)
            return response

        # Process request
        response = await call_next(request)

        # Add rate limit headers
        if "/moves" in path and method == "POST" and self._get_user_id(request):
            response.headers["X-RateLimit-Limit"] = str(self.move_submission_limit)
            response.headers["X-RateLimit-Remaining"] = str(remaining)
            response.headers["X-RateLimit-Reset"] = str(int(datetime.now(timezone.utc).timestamp()) + reset_after)
        else:
            response.headers["X-RateLimit-Limit"] = str(self.ip_limit)
            response.headers["X-RateLimit-Remaining"] = str(remaining)
            response.headers["X-RateLimit-Reset"] = str(int(datetime.now(timezone.utc).timestamp()) + reset_after)

        return response
