"""PostgreSQL implementation of the ticket repository."""
from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Sequence

import redis.asyncio as redis

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.infrastructure.database.match_ticket_model import (
    MatchTicketModel,
    MatchTicketStatus,
    MatchTicketType,
)
from app.infrastructure.database.match_ticket_player_model import MatchTicketPlayerModel
from app.repositories.ticket_repository import (
    Ticket,
    TicketPlayer,
    TicketPlayerInput,
    TicketRepository,
)

logger = logging.getLogger(__name__)


_ACTIVE_STATUSES = {MatchTicketStatus.QUEUED, MatchTicketStatus.SEARCHING}


class PostgresTicketRepository(TicketRepository):
    """Transactional SQLAlchemy-backed ticket repository."""

    def __init__(
        self,
        session: AsyncSession,
        redis_client: redis.Redis | None = None,
        *,
        enable_heartbeat_cache: bool = False,
    ) -> None:
        self.session = session
        self.redis = redis_client
        self.enable_heartbeat_cache = enable_heartbeat_cache

    async def enqueue_ticket(
        self,
        *,
        ticket_id: str,
        enqueue_key: str,
        idempotency_key: str,
        pool_key: str,
        ticket_type: MatchTicketType,
        search_params: dict[str, Any],
        widening_config: dict[str, Any],
        constraints: dict[str, Any],
        players: Sequence[TicketPlayerInput],
        heartbeat_timeout_at: datetime | None = None,
    ) -> Ticket:
        async with self.session.begin():
            existing_ticket = await self._find_idempotent_ticket(
                enqueue_key, pool_key, players
            )
            if existing_ticket:
                return existing_ticket

            ticket_model = MatchTicketModel(
                ticket_id=ticket_id,
                enqueue_key=enqueue_key,
                idempotency_key=idempotency_key,
                pool_key=pool_key,
                status=MatchTicketStatus.QUEUED,
                type=ticket_type,
                search_params=search_params,
                widening_config=widening_config,
                constraints=constraints,
                heartbeat_timeout_at=heartbeat_timeout_at,
            )
            self.session.add(ticket_model)
            await self.session.flush()

            for player in players:
                player_model = MatchTicketPlayerModel(
                    match_ticket_player_id=f"mtp_{uuid.uuid4().hex[:12]}",
                    ticket_id=ticket_model.ticket_id,
                    player_id=player.player_id,
                    mmr=player.mmr,
                    rd=player.rd,
                    latency_preferences=player.latency_preferences,
                    preferred_platform=player.preferred_platform,
                    input_type=player.input_type,
                    risk_profile=player.risk_profile,
                    status=MatchTicketStatus.QUEUED,
                    pool_key=pool_key,
                    enqueue_key=enqueue_key,
                )
                self.session.add(player_model)

            await self.session.flush()
            loaded_ticket = await self._fetch_ticket_model(ticket_model.ticket_id)
            if not loaded_ticket:
                raise RuntimeError("Failed to persist ticket")

            logger.info(
                "Enqueued ticket %s with %d players",
                ticket_id,
                len(players),
                extra={"pool_key": pool_key},
            )

            return self._to_entity(loaded_ticket)

    async def get_ticket(self, ticket_id: str) -> Ticket | None:
        model = await self._fetch_ticket_model(ticket_id)
        return self._to_entity(model) if model else None

    async def cancel_ticket(self, ticket_id: str) -> Ticket | None:
        async with self.session.begin():
            model = await self._fetch_ticket_model(ticket_id, for_update=True)
            if not model:
                return None

            model.status = MatchTicketStatus.CANCELLED
            for player in model.players:
                if player.status in _ACTIVE_STATUSES:
                    player.status = MatchTicketStatus.CANCELLED

            await self.session.flush()
            return self._to_entity(model)

    async def update_status(
        self, ticket_id: str, status: MatchTicketStatus
    ) -> Ticket | None:
        async with self.session.begin():
            model = await self._fetch_ticket_model(ticket_id, for_update=True)
            if not model:
                return None

            model.status = status
            for player in model.players:
                if player.status in _ACTIVE_STATUSES:
                    player.status = status

            await self.session.flush()
            return self._to_entity(model)

    async def update_soft_constraints(
        self, ticket_id: str, constraints: dict[str, Any]
    ) -> Ticket | None:
        async with self.session.begin():
            model = await self._fetch_ticket_model(ticket_id, for_update=True)
            if not model:
                return None

            model.constraints = constraints
            await self.session.flush()
            return self._to_entity(model)

    async def record_heartbeat(
        self,
        ticket_id: str,
        *,
        heartbeat_timeout_at: datetime,
        heartbeat_at: datetime | None = None,
    ) -> Ticket | None:
        async with self.session.begin():
            model = await self._fetch_ticket_model(ticket_id, for_update=True)
            if not model:
                return None

            if model.status not in _ACTIVE_STATUSES:
                return None

            model.last_heartbeat_at = heartbeat_at or datetime.now(timezone.utc)
            model.heartbeat_timeout_at = heartbeat_timeout_at

            await self.session.flush()
            ticket = self._to_entity(model)

        await self._cache_heartbeat(ticket)
        return ticket

    async def find_stale_tickets(self, cutoff: datetime) -> list[Ticket]:
        stmt = (
            select(MatchTicketModel)
            .options(selectinload(MatchTicketModel.players))
            .where(
                MatchTicketModel.heartbeat_timeout_at.is_not(None),
                MatchTicketModel.heartbeat_timeout_at <= cutoff,
                MatchTicketModel.status.in_(_ACTIVE_STATUSES),
            )
        )
        result = await self.session.execute(stmt)
        models = result.scalars().unique().all()
        return [self._to_entity(model) for model in models]

    async def list_active_tickets(self) -> list[Ticket]:
        now = datetime.now(timezone.utc)
        stmt = (
            select(MatchTicketModel)
            .options(selectinload(MatchTicketModel.players))
            .where(
                MatchTicketModel.status.in_(_ACTIVE_STATUSES),
                (
                    MatchTicketModel.heartbeat_timeout_at.is_(None)
                    | (MatchTicketModel.heartbeat_timeout_at > now)
                ),
            )
        )
        result = await self.session.execute(stmt)
        models = result.scalars().unique().all()
        return [self._to_entity(model) for model in models]

    async def _find_idempotent_ticket(
        self,
        enqueue_key: str,
        pool_key: str,
        players: Sequence[TicketPlayerInput],
    ) -> Ticket | None:
        player_ids = [p.player_id for p in players]
        if not player_ids:
            return None

        stmt = (
            select(MatchTicketPlayerModel)
            .options(selectinload(MatchTicketPlayerModel.ticket))
            .where(MatchTicketPlayerModel.player_id.in_(player_ids))
        )
        result = await self.session.execute(stmt)
        existing_players = result.scalars().all()

        for existing in existing_players:
            if existing.enqueue_key == enqueue_key and existing.pool_key == pool_key:
                ticket = await self._fetch_ticket_model(existing.ticket_id)
                return self._to_entity(ticket) if ticket else None
            if existing.status in _ACTIVE_STATUSES:
                raise ValueError(
                    f"Active ticket already exists for player {existing.player_id}"
                )

        return None

    async def _cache_heartbeat(self, ticket: Ticket) -> None:
        if not (self.redis and self.enable_heartbeat_cache):
            return

        if not ticket.heartbeat_timeout_at:
            return

        ttl_seconds = int(
            max(
                (ticket.heartbeat_timeout_at - datetime.now(timezone.utc)).total_seconds(),
                0,
            )
        )
        await self.redis.set(self._heartbeat_key(ticket.ticket_id), "1", ex=ttl_seconds)

    def _heartbeat_key(self, ticket_id: str) -> str:
        return f"matchmaking:ticket:{ticket_id}:heartbeat"

    async def _fetch_ticket_model(
        self, ticket_id: str, *, for_update: bool = False
    ) -> MatchTicketModel | None:
        stmt = (
            select(MatchTicketModel)
            .options(selectinload(MatchTicketModel.players))
            .where(MatchTicketModel.ticket_id == ticket_id)
        )
        if for_update:
            stmt = stmt.with_for_update()

        result = await self.session.execute(stmt)
        return result.scalars().unique().first()

    def _to_entity(self, model: MatchTicketModel) -> Ticket:
        players = [
            TicketPlayer(
                match_ticket_player_id=player.match_ticket_player_id,
                ticket_id=player.ticket_id,
                player_id=player.player_id,
                mmr=player.mmr,
                rd=player.rd,
                latency_preferences=player.latency_preferences or {},
                preferred_platform=player.preferred_platform,
                input_type=player.input_type,
                risk_profile=player.risk_profile,
                status=MatchTicketStatus(player.status),
                pool_key=player.pool_key,
                enqueue_key=player.enqueue_key,
                created_at=player.created_at,
            )
            for player in model.players
        ]

        return Ticket(
            ticket_id=model.ticket_id,
            enqueue_key=model.enqueue_key,
            idempotency_key=model.idempotency_key,
            pool_key=model.pool_key,
            status=MatchTicketStatus(model.status),
            type=MatchTicketType(model.type),
            search_params=model.search_params or {},
            widening_config=model.widening_config or {},
            constraints=model.constraints or {},
            last_heartbeat_at=model.last_heartbeat_at,
            heartbeat_timeout_at=model.heartbeat_timeout_at,
            created_at=model.created_at,
            updated_at=model.updated_at,
            players=players,
        )
