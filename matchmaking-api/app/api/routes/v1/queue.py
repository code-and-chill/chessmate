"""V1 Matchmaking routes."""
import logging
from typing import Annotated

from fastapi import APIRouter, Depends, Header, Path, Query, status

from app.api.dependencies import (
    get_challenge_service,
    get_matchmaking_service,
    get_token_data,
)
from app.api.models import (
    ActiveMatchmakingResponse,
    ChallengeRequest,
    ChallengeResponse,
    QueueRequest,
    QueueResponse,
    QueueStatusResponse,
)
from app.core.security import JWTTokenData
from app.domain.models import Player, SoftConstraints
from app.domain.services.challenge_service import ChallengeService
from app.domain.services.matchmaking_service import MatchmakingService
from app.schemas.ticket import (
    HardConstraintsSchema,
    PlayerSchema,
    SoftConstraintsSchema,
    TicketSchema,
    WideningStateSchema,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/matchmaking", tags=["matchmaking"])


def _to_player_schemas(players: list[Player]) -> list[PlayerSchema]:
    """Convert domain players to response schemas."""

    schemas: list[PlayerSchema] = []
    for player in players:
        schemas.append(
            PlayerSchema(
                user_id=player.user_id,
                rating=player.rating,
                party_id=player.party_id,
                metadata=player.metadata,
            )
        )
    return schemas


def _to_hard_constraints_schema(entry) -> HardConstraintsSchema:
    return HardConstraintsSchema(
        time_control=entry.hard_constraints.time_control,
        mode=entry.hard_constraints.mode,
        variant=entry.hard_constraints.variant,
        region=entry.hard_constraints.region,
    )


def _to_soft_constraints_schema(entry) -> SoftConstraintsSchema | None:
    if not entry.soft_constraints:
        return None
    return SoftConstraintsSchema(
        preferred_region=entry.soft_constraints.preferred_region,
        rating_window=entry.soft_constraints.rating_window,
        max_latency_ms=entry.soft_constraints.max_latency_ms,
    )


def _to_widening_state_schema(entry) -> WideningStateSchema | None:
    if not entry.widening_state:
        return None
    return WideningStateSchema(
        current_window=entry.widening_state.current_window,
        widen_count=entry.widening_state.widen_count,
        last_widened_at=entry.widening_state.last_widened_at,
    )


@router.post("/queue", status_code=status.HTTP_201_CREATED, response_model=QueueResponse)
async def join_queue(
    request: QueueRequest,
    token_data: Annotated[JWTTokenData, Depends(get_token_data)],
    matchmaking: Annotated[MatchmakingService, Depends(get_matchmaking_service)],
) -> QueueResponse:
    """Join matchmaking queue.

    Per service-spec 4.1.1 POST /v1/matchmaking/queue

    Args:
        request: Queue configuration
        token_data: Authenticated user data
        matchmaking: Matchmaking service

    Returns:
        Queue entry response
    """
    logger.info(
        f"Enqueue request: {request.hard_constraints.time_control} {request.hard_constraints.mode}",
        extra={"user_id": token_data.user_id, "tenant_id": token_data.tenant_id},
    )

    soft_constraints = None
    if request.soft_constraints:
        soft_constraints = SoftConstraints(
            preferred_region=request.soft_constraints.preferred_region,
            rating_window=request.soft_constraints.rating_window,
            max_latency_ms=request.soft_constraints.max_latency_ms,
        )

    players = [Player(user_id=token_data.user_id)]
    for player in request.players:
        if player.user_id == token_data.user_id:
            continue
        players.append(Player(user_id=player.user_id, rating=player.rating, party_id=player.party_id, metadata=player.metadata))

    entry = await matchmaking.enqueue_player(
        user_id=token_data.user_id,
        tenant_id=token_data.tenant_id,
        time_control=request.hard_constraints.time_control,
        mode=request.hard_constraints.mode,
        variant=request.hard_constraints.variant or "standard",
        region=request.hard_constraints.region or "DEFAULT",
        ticket_type=request.ticket_type,
        players=players,
        soft_constraints=soft_constraints,
        idempotency_key=request.idempotency_key,
        client_request_id=request.client_request_id,
    )

    return QueueResponse(
        ticket_id=entry.ticket_id,
        status=entry.status.value,
        ticket_type=request.ticket_type,
        players=_to_player_schemas(entry.players),
        hard_constraints=_to_hard_constraints_schema(entry),
        soft_constraints=_to_soft_constraints_schema(entry),
        widening_state=_to_widening_state_schema(entry),
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
    matchmaking: Annotated[MatchmakingService, Depends(get_matchmaking_service)],
) -> QueueStatusResponse:
    """Cancel queue entry.

    Per service-spec 4.1.2 DELETE /v1/matchmaking/queue/{queue_entry_id}

    Args:
        queue_entry_id: ID of queue entry
        token_data: Authenticated user data
        matchmaking: Matchmaking service

    Returns:
        Updated queue entry response
    """
    logger.info(
        f"Cancel queue entry: {queue_entry_id}",
        extra={"user_id": token_data.user_id},
    )

    entry = await matchmaking.cancel_queue_entry(queue_entry_id, token_data.user_id)

    return QueueStatusResponse(
        ticket_id=entry.ticket_id,
        status=entry.status.value,
        ticket_type=entry.ticket_type,
        players=_to_player_schemas(entry.players),
        hard_constraints=_to_hard_constraints_schema(entry),
        soft_constraints=_to_soft_constraints_schema(entry),
        widening_state=_to_widening_state_schema(entry),
    )


@router.get(
    "/queue/{queue_entry_id}",
    status_code=status.HTTP_200_OK,
    response_model=QueueStatusResponse,
)
async def get_queue_status(
    queue_entry_id: Annotated[str, Path()],
    token_data: Annotated[JWTTokenData, Depends(get_token_data)],
    matchmaking: Annotated[MatchmakingService, Depends(get_matchmaking_service)],
) -> QueueStatusResponse:
    """Get queue entry status.

    Per service-spec 4.1.3 GET /v1/matchmaking/queue/{queue_entry_id}

    Args:
        queue_entry_id: ID of queue entry
        token_data: Authenticated user data
        matchmaking: Matchmaking service

    Returns:
        Queue entry status response
    """
    logger.info(
        f"Get queue status: {queue_entry_id}",
        extra={"user_id": token_data.user_id},
    )

    entry = await matchmaking.get_queue_status(queue_entry_id)

    return QueueStatusResponse(
        ticket_id=entry.ticket_id,
        status=entry.status.value,
        ticket_type=entry.ticket_type,
        players=_to_player_schemas(entry.players),
        hard_constraints=_to_hard_constraints_schema(entry),
        soft_constraints=_to_soft_constraints_schema(entry),
        widening_state=_to_widening_state_schema(entry),
        estimated_wait_seconds=int(entry.time_in_queue_seconds(
            __import__('datetime').datetime.now(__import__('datetime').timezone.utc)
        )) if entry.is_searching() else None,
    )


@router.get(
    "/active",
    status_code=status.HTTP_200_OK,
    response_model=ActiveMatchmakingResponse,
)
async def get_active_matchmaking(
    token_data: Annotated[JWTTokenData, Depends(get_token_data)],
    matchmaking: Annotated[MatchmakingService, Depends(get_matchmaking_service)],
) -> ActiveMatchmakingResponse:
    """Get active matchmaking for user.

    Per service-spec 4.1.4 GET /v1/matchmaking/active

    Args:
        token_data: Authenticated user data
        matchmaking: Matchmaking service

    Returns:
        Active matchmaking response
    """
    logger.info(
        "Get active matchmaking",
        extra={"user_id": token_data.user_id},
    )

    result = await matchmaking.get_active_matchmaking(token_data.user_id, token_data.tenant_id)

    return ActiveMatchmakingResponse(
        queue_entry=TicketSchema(**result["queue_entry"].to_dict()) if result.get("queue_entry") else None,
        match=result.get("match"),
    )


@router.post(
    "/challenges",
    status_code=status.HTTP_201_CREATED,
    response_model=ChallengeResponse,
)
async def create_challenge(
    request: ChallengeRequest,
    token_data: Annotated[JWTTokenData, Depends(get_token_data)],
    challenge_service: Annotated[ChallengeService, Depends(get_challenge_service)],
) -> ChallengeResponse:
    """Create direct challenge.

    Per service-spec 4.2.1 POST /v1/matchmaking/challenges

    Args:
        request: Challenge configuration
        token_data: Authenticated user data
        challenge_service: Challenge service

    Returns:
        Challenge response
    """
    logger.info(
        f"Create challenge to {request.opponent_user_id}",
        extra={"user_id": token_data.user_id},
    )

    challenge = await challenge_service.create_challenge(
        challenger_user_id=token_data.user_id,
        tenant_id=token_data.tenant_id,
        opponent_user_id=request.opponent_user_id,
        time_control=request.time_control,
        mode=request.mode,
        variant=request.variant or "standard",
        preferred_color=request.preferred_color or "random",
    )

    return ChallengeResponse(
        challenge_id=challenge.challenge_id,
        status=challenge.status.value,
    )


@router.post(
    "/challenges/{challenge_id}/accept",
    status_code=status.HTTP_200_OK,
    response_model=ChallengeResponse,
)
async def accept_challenge(
    challenge_id: Annotated[str, Path()],
    token_data: Annotated[JWTTokenData, Depends(get_token_data)],
    challenge_service: Annotated[ChallengeService, Depends(get_challenge_service)],
) -> ChallengeResponse:
    """Accept challenge.

    Per service-spec 4.2.2 POST /v1/matchmaking/challenges/{challenge_id}/accept

    Args:
        challenge_id: ID of challenge
        token_data: Authenticated user data
        challenge_service: Challenge service

    Returns:
        Challenge response with game_id
    """
    logger.info(
        f"Accept challenge {challenge_id}",
        extra={"user_id": token_data.user_id},
    )

    # TODO: Get actual ratings from rating service or cache
    challenge = await challenge_service.accept_challenge(
        challenge_id=challenge_id,
        user_id=token_data.user_id,
        challenger_rating=1500,
        opponent_rating=1500,
    )

    return ChallengeResponse(
        challenge_id=challenge.challenge_id,
        status=challenge.status.value,
        game_id=challenge.game_id,
    )


@router.post(
    "/challenges/{challenge_id}/decline",
    status_code=status.HTTP_200_OK,
    response_model=ChallengeResponse,
)
async def decline_challenge(
    challenge_id: Annotated[str, Path()],
    token_data: Annotated[JWTTokenData, Depends(get_token_data)],
    challenge_service: Annotated[ChallengeService, Depends(get_challenge_service)],
) -> ChallengeResponse:
    """Decline challenge.

    Per service-spec 4.2.3 POST /v1/matchmaking/challenges/{challenge_id}/decline

    Args:
        challenge_id: ID of challenge
        token_data: Authenticated user data
        challenge_service: Challenge service

    Returns:
        Challenge response
    """
    logger.info(
        f"Decline challenge {challenge_id}",
        extra={"user_id": token_data.user_id},
    )

    challenge = await challenge_service.decline_challenge(
        challenge_id=challenge_id,
        user_id=token_data.user_id,
    )

    return ChallengeResponse(
        challenge_id=challenge.challenge_id,
        status=challenge.status.value,
    )


@router.get("/challenges/incoming")
async def get_incoming_challenges(
    token_data: Annotated[JWTTokenData, Depends(get_token_data)],
    challenge_service: Annotated[ChallengeService, Depends(get_challenge_service)],
) -> list[dict]:
    """Get incoming challenges.

    Per service-spec 4.2.4 GET /v1/matchmaking/challenges/incoming

    Args:
        token_data: Authenticated user data
        challenge_service: Challenge service

    Returns:
        List of incoming challenges
    """
    logger.info(
        "Get incoming challenges",
        extra={"user_id": token_data.user_id},
    )

    challenges = await challenge_service.get_incoming_challenges(
        user_id=token_data.user_id,
        tenant_id=token_data.tenant_id,
    )

    return [
        {
            "challenge_id": c.challenge_id,
            "challenger_user_id": c.challenger_user_id,
            "time_control": c.time_control,
            "mode": c.mode,
            "variant": c.variant,
            "preferred_color": c.preferred_color,
            "created_at": c.created_at.isoformat(),
            "expires_at": c.expires_at.isoformat(),
        }
        for c in challenges
    ]
