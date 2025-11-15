"""V1 Matchmaking routes."""
import logging
from typing import Annotated

from fastapi import APIRouter, Depends, Header, Path, Query, status

from app.api.dependencies import get_token_data
from app.api.models import (
    ActiveMatchmakingResponse,
    ChallengeRequest,
    ChallengeResponse,
    QueueRequest,
    QueueResponse,
    QueueStatusResponse,
)
from app.core.security import JWTTokenData

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/matchmaking", tags=["matchmaking"])


@router.post("/queue", status_code=status.HTTP_201_CREATED, response_model=QueueResponse)
async def join_queue(
    request: QueueRequest,
    token_data: Annotated[JWTTokenData, Depends(get_token_data)],
) -> QueueResponse:
    """Join matchmaking queue.

    Per service-spec 4.1.1 POST /v1/matchmaking/queue

    Args:
        request: Queue configuration
        token_data: Authenticated user data

    Returns:
        Queue entry response
    """
    # TODO: Inject matchmaking service and handle request
    logger.info(
        f"Enqueue request: {request.time_control} {request.mode}",
        extra={"user_id": token_data.user_id, "tenant_id": token_data.tenant_id},
    )

    return QueueResponse(
        queue_entry_id="q_01hqxf4b8qk1",
        status="SEARCHING",
        estimated_wait_seconds=10,
    )


@router.delete(
    "/queue/{queue_entry_id}",
    status_code=status.HTTP_200_OK,
    response_model=QueueStatusResponse,
)
async def cancel_queue(
    queue_entry_id: Annotated[str, Path()],
    token_data: Annotated[JWTTokenData, Depends(get_token_data)],
) -> QueueStatusResponse:
    """Cancel queue entry.

    Per service-spec 4.1.2 DELETE /v1/matchmaking/queue/{queue_entry_id}

    Args:
        queue_entry_id: ID of queue entry
        token_data: Authenticated user data

    Returns:
        Updated queue entry response
    """
    # TODO: Inject matchmaking service and handle request
    logger.info(
        f"Cancel queue entry: {queue_entry_id}",
        extra={"user_id": token_data.user_id},
    )

    return QueueStatusResponse(
        queue_entry_id=queue_entry_id,
        status="CANCELLED",
    )


@router.get(
    "/queue/{queue_entry_id}",
    status_code=status.HTTP_200_OK,
    response_model=QueueStatusResponse,
)
async def get_queue_status(
    queue_entry_id: Annotated[str, Path()],
    token_data: Annotated[JWTTokenData, Depends(get_token_data)],
) -> QueueStatusResponse:
    """Get queue entry status.

    Per service-spec 4.1.3 GET /v1/matchmaking/queue/{queue_entry_id}

    Args:
        queue_entry_id: ID of queue entry
        token_data: Authenticated user data

    Returns:
        Queue entry status response
    """
    # TODO: Inject matchmaking service and handle request
    logger.info(
        f"Get queue status: {queue_entry_id}",
        extra={"user_id": token_data.user_id},
    )

    return QueueStatusResponse(
        queue_entry_id=queue_entry_id,
        status="SEARCHING",
        estimated_wait_seconds=7,
    )


@router.get(
    "/active",
    status_code=status.HTTP_200_OK,
    response_model=ActiveMatchmakingResponse,
)
async def get_active_matchmaking(
    token_data: Annotated[JWTTokenData, Depends(get_token_data)],
) -> ActiveMatchmakingResponse:
    """Get active matchmaking for user.

    Per service-spec 4.1.4 GET /v1/matchmaking/active

    Args:
        token_data: Authenticated user data

    Returns:
        Active matchmaking response
    """
    # TODO: Inject matchmaking service and handle request
    logger.info(
        "Get active matchmaking",
        extra={"user_id": token_data.user_id},
    )

    return ActiveMatchmakingResponse(
        queue_entry=None,
        match=None,
    )


@router.post(
    "/challenges",
    status_code=status.HTTP_201_CREATED,
    response_model=ChallengeResponse,
)
async def create_challenge(
    request: ChallengeRequest,
    token_data: Annotated[JWTTokenData, Depends(get_token_data)],
) -> ChallengeResponse:
    """Create direct challenge.

    Per service-spec 4.2.1 POST /v1/matchmaking/challenges

    Args:
        request: Challenge configuration
        token_data: Authenticated user data

    Returns:
        Challenge response
    """
    # TODO: Inject service and handle request
    logger.info(
        f"Create challenge to {request.opponent_user_id}",
        extra={"user_id": token_data.user_id},
    )

    return ChallengeResponse(
        challenge_id="c_01hr08p9m7h4",
        status="PENDING",
    )


@router.post(
    "/challenges/{challenge_id}/accept",
    status_code=status.HTTP_200_OK,
    response_model=ChallengeResponse,
)
async def accept_challenge(
    challenge_id: Annotated[str, Path()],
    token_data: Annotated[JWTTokenData, Depends(get_token_data)],
) -> ChallengeResponse:
    """Accept challenge.

    Per service-spec 4.2.2 POST /v1/matchmaking/challenges/{challenge_id}/accept

    Args:
        challenge_id: ID of challenge
        token_data: Authenticated user data

    Returns:
        Challenge response with game_id
    """
    # TODO: Inject service and handle request
    logger.info(
        f"Accept challenge {challenge_id}",
        extra={"user_id": token_data.user_id},
    )

    return ChallengeResponse(
        challenge_id=challenge_id,
        status="ACCEPTED",
        game_id="g_01hr08bkj1x9",
    )


@router.post(
    "/challenges/{challenge_id}/decline",
    status_code=status.HTTP_200_OK,
    response_model=ChallengeResponse,
)
async def decline_challenge(
    challenge_id: Annotated[str, Path()],
    token_data: Annotated[JWTTokenData, Depends(get_token_data)],
) -> ChallengeResponse:
    """Decline challenge.

    Per service-spec 4.2.3 POST /v1/matchmaking/challenges/{challenge_id}/decline

    Args:
        challenge_id: ID of challenge
        token_data: Authenticated user data

    Returns:
        Challenge response
    """
    # TODO: Inject service and handle request
    logger.info(
        f"Decline challenge {challenge_id}",
        extra={"user_id": token_data.user_id},
    )

    return ChallengeResponse(
        challenge_id=challenge_id,
        status="DECLINED",
    )


@router.get("/challenges/incoming")
async def get_incoming_challenges(
    token_data: Annotated[JWTTokenData, Depends(get_token_data)],
) -> list:
    """Get incoming challenges.

    Per service-spec 4.2.4 GET /v1/matchmaking/challenges/incoming

    Args:
        token_data: Authenticated user data

    Returns:
        List of incoming challenges
    """
    # TODO: Inject service and handle request
    logger.info(
        "Get incoming challenges",
        extra={"user_id": token_data.user_id},
    )

    return []
