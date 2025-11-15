"""Internal/admin routes."""
import logging
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Header, status

from app.api.models import QueueSummary, QueuesSummaryResponse
from app.core.security import JWTTokenData, decode_token

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/internal", tags=["internal"])


async def verify_internal_auth(
    authorization: Annotated[str, Header()] = "",
) -> JWTTokenData:
    """Verify internal service authentication.

    Args:
        authorization: Authorization header

    Returns:
        Token data

    Raises:
        UnauthorizedException: If not authorized
    """
    if not authorization.startswith("Bearer "):
        from app.core.exceptions import UnauthorizedException

        raise UnauthorizedException("Invalid authorization")

    token = authorization[7:]
    return decode_token(token)


@router.get(
    "/queues/summary",
    status_code=status.HTTP_200_OK,
    response_model=QueuesSummaryResponse,
)
async def get_queues_summary(
    token_data: Annotated[JWTTokenData, Depends(verify_internal_auth)],
) -> QueuesSummaryResponse:
    """Get queue metrics summary.

    Per service-spec 4.3.1 GET /internal/queues/summary

    Args:
        token_data: Authenticated service data

    Returns:
        Queue summary response
    """
    # TODO: Inject queue store and aggregate stats
    logger.info("Get queues summary")

    return QueuesSummaryResponse(
        timestamp=datetime.utcnow(),
        queues=[
            QueueSummary(
                tenant_id="t_default",
                pool_key="standard_5+0_rated_ASIA",
                waiting_count=1234,
                avg_wait_seconds=8.5,
                p95_wait_seconds=20.1,
            )
        ],
    )
