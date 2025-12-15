"""Ticket lifecycle routes."""
import uuid
from datetime import datetime, timedelta, timezone
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.api.dependencies import get_ticket_repo
from app.core.config import get_settings
from app.infrastructure.database.match_ticket_model import (
    MatchTicketStatus,
    MatchTicketType,
)
from app.repositories.postgres_ticket_repository import PostgresTicketRepository
from app.repositories.ticket_repository import Ticket, TicketPlayerInput

router = APIRouter(prefix="/tickets", tags=["tickets"])


class EnqueuePlayer(BaseModel):
    """Inbound player payload for ticket creation."""

    player_id: str
    mmr: int
    rd: float
    latency_preferences: dict[str, Any] = Field(default_factory=dict)
    preferred_platform: str | None = None
    input_type: str | None = None
    risk_profile: str | None = None


class ConstraintPayload(BaseModel):
    """Hard constraints that define the matchmaking pool."""

    time_control: str
    mode: str
    variant: str = "standard"
    region: str = "DEFAULT"

    model_config = {"extra": "allow"}


class WideningConfigPayload(BaseModel):
    """Configuration for widening searches over time."""

    rating_window: int | None = None
    max_latency_ms: int | None = None

    model_config = {"extra": "allow"}


class EnqueueTicketRequest(BaseModel):
    """Request body for ticket enqueue."""

    enqueue_key: str
    mutation_seq: int
    constraints: ConstraintPayload
    soft_constraints: dict[str, Any] = Field(default_factory=dict)
    players: list[EnqueuePlayer]
    widening_config: WideningConfigPayload = Field(default_factory=WideningConfigPayload)
    search_params: dict[str, Any] = Field(default_factory=dict)


class UpdateTicketRequest(BaseModel):
    """Request body for updating ticket preferences."""

    mutation_seq: int
    soft_constraints: dict[str, Any] = Field(default_factory=dict)
    widening_stage: int | None = Field(
        default=None, description="Progress of widening for this ticket"
    )


class TicketPlayerResponse(BaseModel):
    """Player representation in ticket responses."""

    match_ticket_player_id: str
    player_id: str
    mmr: int
    rd: float
    latency_preferences: dict[str, Any]
    preferred_platform: str | None
    input_type: str | None
    risk_profile: str | None
    status: MatchTicketStatus
    pool_key: str
    enqueue_key: str
    created_at: datetime


class TicketResponse(BaseModel):
    """Ticket lifecycle response."""

    ticket_id: str
    enqueue_key: str
    idempotency_key: str
    pool_key: str
    status: MatchTicketStatus
    type: MatchTicketType
    search_params: dict[str, Any]
    widening_config: dict[str, Any]
    constraints: dict[str, Any]
    soft_constraints: dict[str, Any]
    mutation_seq: int
    widening_stage: int
    last_heartbeat_at: datetime | None
    heartbeat_timeout_at: datetime | None
    created_at: datetime
    updated_at: datetime
    players: list[TicketPlayerResponse]


class HeartbeatRequest(BaseModel):
    """Request to refresh ticket heartbeat."""

    heartbeat_at: datetime | None = None


def _build_pool_key(constraints: ConstraintPayload) -> str:
    return (
        f"{constraints.variant}_{constraints.time_control}_{constraints.mode}_{constraints.region}"
    )


def _to_player_responses(ticket: Ticket) -> list[TicketPlayerResponse]:
    return [
        TicketPlayerResponse(
            match_ticket_player_id=player.match_ticket_player_id,
            player_id=player.player_id,
            mmr=player.mmr,
            rd=player.rd,
            latency_preferences=player.latency_preferences,
            preferred_platform=player.preferred_platform,
            input_type=player.input_type,
            risk_profile=player.risk_profile,
            status=player.status,
            pool_key=player.pool_key,
            enqueue_key=player.enqueue_key,
            created_at=player.created_at,
        )
        for player in ticket.players
    ]


def _to_ticket_response(ticket: Ticket) -> TicketResponse:
    return TicketResponse(
        ticket_id=ticket.ticket_id,
        enqueue_key=ticket.enqueue_key,
        idempotency_key=ticket.idempotency_key,
        pool_key=ticket.pool_key,
        status=ticket.status,
        type=ticket.type,
        search_params=ticket.search_params,
        widening_config=ticket.widening_config,
        constraints=ticket.constraints,
        soft_constraints=ticket.soft_constraints,
        mutation_seq=ticket.mutation_seq,
        widening_stage=ticket.widening_stage,
        last_heartbeat_at=ticket.last_heartbeat_at,
        heartbeat_timeout_at=ticket.heartbeat_timeout_at,
        created_at=ticket.created_at,
        updated_at=ticket.updated_at,
        players=_to_player_responses(ticket),
    )


@router.post(
    "/enqueue", status_code=status.HTTP_201_CREATED, response_model=TicketResponse
)
async def enqueue_ticket(
    request: EnqueueTicketRequest,
    ticket_repo: Annotated[PostgresTicketRepository, Depends(get_ticket_repo)],
) -> TicketResponse:
    """Create or return a matchmaking ticket for the enqueue key."""

    pool_key = _build_pool_key(request.constraints)
    ticket_type = MatchTicketType.PARTY if len(request.players) > 1 else MatchTicketType.SOLO
    idempotency_key = f"{request.enqueue_key}:{request.mutation_seq}"

    try:
        ticket = await ticket_repo.enqueue_ticket(
            ticket_id=f"tkt_{uuid.uuid4().hex[:12]}",
            enqueue_key=request.enqueue_key,
            idempotency_key=idempotency_key,
            pool_key=pool_key,
            ticket_type=ticket_type,
            search_params=request.search_params,
            widening_config=request.widening_config.model_dump(),
            constraints=request.constraints.model_dump(),
            soft_constraints=request.soft_constraints,
            mutation_seq=request.mutation_seq,
            widening_stage=0,
            players=[
                TicketPlayerInput(
                    player_id=player.player_id,
                    mmr=player.mmr,
                    rd=player.rd,
                    latency_preferences=player.latency_preferences,
                    preferred_platform=player.preferred_platform,
                    input_type=player.input_type,
                    risk_profile=player.risk_profile,
                )
                for player in request.players
            ],
            heartbeat_timeout_at=None,
        )
    except ValueError as exc:  # Active tickets for players
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=str(exc)
        ) from exc

    return _to_ticket_response(ticket)


@router.get("/{ticket_id}", response_model=TicketResponse)
async def get_ticket(
    ticket_id: str,
    ticket_repo: Annotated[PostgresTicketRepository, Depends(get_ticket_repo)],
) -> TicketResponse:
    """Retrieve ticket state."""

    ticket = await ticket_repo.get_ticket(ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    return _to_ticket_response(ticket)


@router.patch("/{ticket_id}", response_model=TicketResponse)
async def update_ticket(
    ticket_id: str,
    update_request: UpdateTicketRequest,
    ticket_repo: Annotated[PostgresTicketRepository, Depends(get_ticket_repo)],
) -> TicketResponse:
    """Update ticket soft constraints or widening stage."""

    ticket = await ticket_repo.get_ticket(ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    if update_request.mutation_seq <= ticket.mutation_seq:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Stale mutation_seq",
        )

    updated_ticket = await ticket_repo.update_soft_constraints(
        ticket_id,
        soft_constraints=update_request.soft_constraints,
        mutation_seq=update_request.mutation_seq,
        widening_stage=update_request.widening_stage,
    )

    if not updated_ticket:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Update rejected")

    return _to_ticket_response(updated_ticket)


@router.post("/{ticket_id}/heartbeat", response_model=TicketResponse)
async def heartbeat_ticket(
    ticket_id: str,
    heartbeat_request: HeartbeatRequest,
    ticket_repo: Annotated[PostgresTicketRepository, Depends(get_ticket_repo)],
) -> TicketResponse:
    """Record a heartbeat for a ticket and extend its TTL."""

    settings = get_settings()
    heartbeat_at = heartbeat_request.heartbeat_at or datetime.now(timezone.utc)
    heartbeat_timeout_at = heartbeat_at + timedelta(seconds=settings.HEARTBEAT_TIMEOUT_SECONDS)

    ticket = await ticket_repo.record_heartbeat(
        ticket_id,
        heartbeat_timeout_at=heartbeat_timeout_at,
        heartbeat_at=heartbeat_at,
    )
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    return _to_ticket_response(ticket)


@router.post("/{ticket_id}/cancel", response_model=TicketResponse)
async def cancel_ticket(
    ticket_id: str,
    ticket_repo: Annotated[PostgresTicketRepository, Depends(get_ticket_repo)],
) -> TicketResponse:
    """Cancel a queued ticket."""

    ticket = await ticket_repo.cancel_ticket(ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    return _to_ticket_response(ticket)

