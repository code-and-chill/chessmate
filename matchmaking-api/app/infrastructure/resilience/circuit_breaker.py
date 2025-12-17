"""Circuit breaker implementation for external service calls."""

import asyncio
import logging
from datetime import datetime, timezone
from enum import Enum
from typing import Callable, Optional, TypeVar, Any
from functools import wraps

logger = logging.getLogger(__name__)

T = TypeVar("T")


class CircuitState(Enum):
    """Circuit breaker states."""

    CLOSED = "closed"  # Normal operation
    OPEN = "open"  # Failing, reject requests immediately
    HALF_OPEN = "half_open"  # Testing if service recovered


class CircuitBreaker:
    """Circuit breaker for protecting external service calls."""

    def __init__(
        self,
        failure_threshold: int = 5,
        timeout_seconds: int = 60,
        half_open_timeout_seconds: int = 30,
        expected_exception: type[Exception] = Exception,
    ):
        """Initialize circuit breaker.

        Args:
            failure_threshold: Number of failures before opening circuit
            timeout_seconds: Time to wait before transitioning from OPEN to HALF_OPEN
            half_open_timeout_seconds: Time to wait in HALF_OPEN before allowing more requests
            expected_exception: Exception type that counts as failures
        """
        self.failure_threshold = failure_threshold
        self.timeout_seconds = timeout_seconds
        self.half_open_timeout_seconds = half_open_timeout_seconds
        self.expected_exception = expected_exception

        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time: Optional[datetime] = None
        self.last_state_change: Optional[datetime] = None
        self.lock = asyncio.Lock()

    async def call(self, func: Callable[..., T], *args: Any, **kwargs: Any) -> T:
        """Call function with circuit breaker protection.

        Args:
            func: Function to call
            *args: Positional arguments
            **kwargs: Keyword arguments

        Returns:
            Function result

        Raises:
            CircuitBreakerOpenError: If circuit is open
            Exception: If function call fails
        """
        # Check circuit state (non-blocking check)
        if self.state == CircuitState.OPEN:
            # Check if we should transition to HALF_OPEN
            if self.last_failure_time:
                elapsed = (datetime.now(timezone.utc) - self.last_failure_time).total_seconds()
                if elapsed >= self.timeout_seconds:
                    async with self.lock:
                        if self.state == CircuitState.OPEN:  # Double-check after acquiring lock
                            logger.info("Circuit breaker transitioning from OPEN to HALF_OPEN")
                            self.state = CircuitState.HALF_OPEN
                            self.success_count = 0
                            self.last_state_change = datetime.now(timezone.utc)
                else:
                    raise CircuitBreakerOpenError(
                        f"Circuit breaker is OPEN. Retry after {self.timeout_seconds - elapsed:.1f}s"
                    )
            else:
                raise CircuitBreakerOpenError("Circuit breaker is OPEN")

        async with self.lock:
            # Check circuit state
            if self.state == CircuitState.OPEN:
                # Check if we should transition to HALF_OPEN
                if self.last_failure_time:
                    elapsed = (datetime.now(timezone.utc) - self.last_failure_time).total_seconds()
                    if elapsed >= self.timeout_seconds:
                        logger.info("Circuit breaker transitioning from OPEN to HALF_OPEN")
                        self.state = CircuitState.HALF_OPEN
                        self.success_count = 0
                        self.last_state_change = datetime.now(timezone.utc)
                    else:
                        raise CircuitBreakerOpenError(
                            f"Circuit breaker is OPEN. Retry after {self.timeout_seconds - elapsed:.1f}s"
                        )
                else:
                    raise CircuitBreakerOpenError("Circuit breaker is OPEN")

        # Try the call (outside lock to avoid blocking)
        try:
            if asyncio.iscoroutinefunction(func):
                result = await func(*args, **kwargs)
            else:
                result = func(*args, **kwargs)

            # Success - reset failure count
                self.failure_count = 0
                if self.state == CircuitState.HALF_OPEN:
                    self.success_count += 1
                    # If we've had enough successes, close the circuit
                    if self.success_count >= 2:  # Require 2 successes to close
                        logger.info("Circuit breaker transitioning from HALF_OPEN to CLOSED")
                        self.state = CircuitState.CLOSED
                        self.success_count = 0
                elif self.state == CircuitState.CLOSED:
                    # Already closed, no action needed
                    pass

            return result

        except self.expected_exception as e:
            # Failure - increment failure count
            async with self.lock:
                self.failure_count += 1
                self.last_failure_time = datetime.now(timezone.utc)

                if self.state == CircuitState.HALF_OPEN:
                    # Any failure in HALF_OPEN immediately opens the circuit
                    logger.warning("Circuit breaker failure in HALF_OPEN state, opening circuit")
                    self.state = CircuitState.OPEN
                    self.last_state_change = datetime.now(timezone.utc)
                elif self.failure_count >= self.failure_threshold:
                    # Open the circuit
                    logger.warning(
                        f"Circuit breaker opened after {self.failure_count} failures",
                        extra={"failure_count": self.failure_count},
                    )
                    self.state = CircuitState.OPEN
                    self.last_state_change = datetime.now(timezone.utc)

            raise

    def get_state(self) -> CircuitState:
        """Get current circuit breaker state."""
        return self.state

    def get_metrics(self) -> dict:
        """Get circuit breaker metrics."""
        return {
            "state": self.state.value,
            "failure_count": self.failure_count,
            "success_count": self.success_count,
            "last_failure_time": self.last_failure_time.isoformat() if self.last_failure_time else None,
            "last_state_change": self.last_state_change.isoformat() if self.last_state_change else None,
        }


class CircuitBreakerOpenError(Exception):
    """Raised when circuit breaker is open."""

    pass


def circuit_breaker(
    failure_threshold: int = 5,
    timeout_seconds: int = 60,
    expected_exception: type[Exception] = Exception,
):
    """Decorator for circuit breaker protection.

    Args:
        failure_threshold: Number of failures before opening circuit
        timeout_seconds: Time to wait before transitioning from OPEN to HALF_OPEN
        expected_exception: Exception type that counts as failures

    Returns:
        Decorated function
    """
    breaker = CircuitBreaker(
        failure_threshold=failure_threshold,
        timeout_seconds=timeout_seconds,
        expected_exception=expected_exception,
    )

    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> T:
            return await breaker.call(func, *args, **kwargs)

        # Attach breaker to function for access to metrics
        wrapper.circuit_breaker = breaker  # type: ignore
        return wrapper

    return decorator
