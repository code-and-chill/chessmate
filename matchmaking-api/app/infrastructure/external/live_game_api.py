"""Live Game API client."""
import logging
from typing import Optional

import httpx

from app.core.config import get_settings
from app.infrastructure.resilience.circuit_breaker import CircuitBreaker, CircuitBreakerOpenError
from typing import Optional

logger = logging.getLogger(__name__)


class LiveGameAPIClient:
    """Client for live-game-api internal service.

    Per service-spec section 6.2
    """

    def __init__(self, http_client: httpx.AsyncClient, circuit_breaker: Optional[CircuitBreaker] = None) -> None:
        """Initialize client.

        Args:
            http_client: Async HTTP client
            circuit_breaker: Optional circuit breaker instance (creates default if not provided)
        """
        self.http_client = http_client
        self.settings = get_settings()
        if circuit_breaker is None:
            # Create default circuit breaker
            from app.infrastructure.resilience.circuit_breaker import CircuitBreaker
            self.circuit_breaker = CircuitBreaker(
                failure_threshold=5,
                timeout_seconds=60,
                expected_exception=(httpx.HTTPError, httpx.TimeoutException),
            )
        else:
            self.circuit_breaker = circuit_breaker

    async def create_game(
        self,
        tenant_id: str,
        white_user_id: str,
        black_user_id: str,
        time_control: str,
        mode: str,
        variant: str,
        rating_snapshot: dict,
        metadata: dict,
    ) -> str:
        """Create game in live-game-api.

        Per service-spec 6.2 live-game-api contract

        Args:
            tenant_id: Tenant ID
            white_user_id: White player user ID
            black_user_id: Black player user ID
            time_control: Time control
            mode: Game mode
            variant: Chess variant
            rating_snapshot: Rating snapshot dict
            metadata: Additional metadata

        Returns:
            Game ID

        Raises:
            Exception: If game creation fails
        """
        url = f"{self.settings.LIVE_GAME_API_URL}/internal/games"

        payload = {
            "tenant_id": tenant_id,
            "white_user_id": white_user_id,
            "black_user_id": black_user_id,
            "time_control": time_control,
            "mode": mode,
            "variant": variant,
            "rating_snapshot": rating_snapshot,
            "metadata": metadata,
        }

        # Wrap call with circuit breaker
        async def _make_request() -> str:
            response = await self.http_client.post(
                url,
                json=payload,
                timeout=self.settings.LIVE_GAME_API_TIMEOUT_SECONDS,
            )
            response.raise_for_status()

            data = response.json()
            game_id = data.get("game_id")

            if not game_id:
                raise ValueError("No game_id in response")

            logger.info(
                f"Created game {game_id} via live-game-api",
                extra={
                    "tenant_id": tenant_id,
                    "white_user_id": white_user_id,
                    "black_user_id": black_user_id,
                },
            )

            return game_id

        try:
            return await self.circuit_breaker.call(_make_request)
        except CircuitBreakerOpenError as e:
            logger.warning(f"Circuit breaker is open: {str(e)}")
            raise
        except httpx.TimeoutException as e:
            logger.error(f"Live game API timeout: {str(e)}")
            raise
        except httpx.HTTPError as e:
            logger.error(f"Live game API error: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Failed to create game: {str(e)}")
            raise
