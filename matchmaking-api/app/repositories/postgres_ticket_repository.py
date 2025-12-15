"""PostgreSQL implementation of the ticket repository."""
from __future__ import annotations

import json
import logging
import uuid
from dataclasses import asdict
from datetime import datetime, timezone
from typing import Any, Sequence

import redis.asyncio as redis

from app.core.config import get_settings
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


_ACTIVE_STATUSES = {
    MatchTicketStatus.QUEUED,
    MatchTicketStatus.SEARCHING,
    MatchTicketStatus.PROPOSING,
}
_PROPOSABLE_STATUSES = {MatchTicketStatus.QUEUED, MatchTicketStatus.SEARCHING}


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
        self.settings = get_settings()

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
        soft_constraints: dict[str, Any],
        mutation_seq: int,
        widening_stage: int,
        players: Sequence[TicketPlayerInput],
        heartbeat_timeout_at: datetime | None = None,
    ) -> Ticket:
        if len(players) > self.settings.MAX_PARTY_SIZE:
            raise ValueError(
                f"Party size {len(players)} exceeds max of {self.settings.MAX_PARTY_SIZE}"
            )

        mmr_values = [p.mmr for p in players]
        if mmr_values:
            spread = max(mmr_values) - min(mmr_values)
            if spread > self.settings.MAX_PARTY_MMR_SPREAD:
                raise ValueError(
                    f"Party MMR spread {spread} exceeds allowed {self.settings.MAX_PARTY_MMR_SPREAD}"
                )

        ticket: Ticket | None = None

        async with self.session.begin():
            existing_ticket = await self._find_idempotent_ticket(
                enqueue_key, pool_key, players
            )
            if existing_ticket:
                ticket = existing_ticket
            else:
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
                    soft_constraints=soft_constraints,
                    mutation_seq=mutation_seq,
                    widening_stage=widening_stage,
                    heartbeat_timeout_at=heartbeat_timeout_at,
                    leader_player_id=players[0].player_id if players else None,
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

                ticket = self._to_entity(loaded_ticket)

                logger.info(
                    "Enqueued ticket %s with %d players",
                    ticket_id,
                    len(players),
                    extra={"pool_key": pool_key},
                )

        if not ticket:
            raise RuntimeError("Failed to load ticket after enqueue")

        await self._sync_ticket_cache(ticket)

        return ticket

    async def get_ticket(self, ticket_id: str) -> Ticket | None:
        model = await self._fetch_ticket_model(ticket_id)
        return self._to_entity(model) if model else None

    async def cancel_ticket(self, ticket_id: str) -> Ticket | None:
        ticket: Ticket | None = None

        async with self.session.begin():
            model = await self._fetch_ticket_model(ticket_id, for_update=True)
            if not model:
                return None

            model.status = MatchTicketStatus.CANCELLED
            model.proposal_id = None
            model.proposal_timeout_at = None
            for player in model.players:
                if player.status in _ACTIVE_STATUSES:
                    player.status = MatchTicketStatus.CANCELLED

            await self.session.flush()
            ticket = self._to_entity(model)

        await self._sync_ticket_cache(ticket)
        return ticket

    async def update_status(
        self, ticket_id: str, status: MatchTicketStatus
    ) -> Ticket | None:
        ticket: Ticket | None = None

        async with self.session.begin():
            model = await self._fetch_ticket_model(ticket_id, for_update=True)
            if not model:
                return None

            model.status = status
            model.proposal_id = None
            model.proposal_timeout_at = None
            for player in model.players:
                if player.status in _ACTIVE_STATUSES:
                    player.status = status

            await self.session.flush()
            ticket = self._to_entity(model)

        await self._sync_ticket_cache(ticket)
        return ticket

    async def update_soft_constraints(
        self,
        ticket_id: str,
        *,
        soft_constraints: dict[str, Any],
        mutation_seq: int,
        widening_stage: int | None = None,
    ) -> Ticket | None:
        async with self.session.begin():
            model = await self._fetch_ticket_model(ticket_id, for_update=True)
            if not model:
                return None

            if mutation_seq <= (model.mutation_seq or 0):
                return None

            updated_soft_constraints = model.soft_constraints or {}
            updated_soft_constraints.update(soft_constraints)

            model.soft_constraints = updated_soft_constraints
            model.mutation_seq = mutation_seq
            if widening_stage is not None:
                model.widening_stage = widening_stage

            await self.session.flush()
            ticket = self._to_entity(model)

        await self._sync_ticket_cache(ticket)
        return ticket

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

        await self._sync_ticket_cache(ticket)
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

    async def create_proposal(
        self,
        ticket_ids: Sequence[str],
        *,
        proposal_id: str,
        proposal_timeout_at: datetime,
    ) -> list[Ticket]:
        tickets: list[Ticket] = []

        async with self.session.begin():
            stmt = (
                select(MatchTicketModel)
                .options(selectinload(MatchTicketModel.players))
                .where(MatchTicketModel.ticket_id.in_(ticket_ids))
                .with_for_update()
            )
            result = await self.session.execute(stmt)
            models = result.scalars().unique().all()

            if len(models) != len(ticket_ids):
                return []

            if any(model.status not in _PROPOSABLE_STATUSES for model in models):
                return []

            for model in models:
                model.status = MatchTicketStatus.PROPOSING
                model.proposal_id = proposal_id
                model.proposal_timeout_at = proposal_timeout_at
                for player in model.players:
                    if player.status in _PROPOSABLE_STATUSES:
                        player.status = MatchTicketStatus.PROPOSING

            await self.session.flush()
            tickets = [self._to_entity(model) for model in models]

        for ticket in tickets:
            await self._sync_ticket_cache(ticket)

        return tickets

    async def finalize_proposal(
        self, proposal_id: str, status: MatchTicketStatus
    ) -> list[Ticket]:
        if status not in {MatchTicketStatus.MATCHED, MatchTicketStatus.CANCELLED}:
            raise ValueError("Proposal can only transition to matched or cancelled")

        tickets: list[Ticket] = []

        async with self.session.begin():
            stmt = (
                select(MatchTicketModel)
                .options(selectinload(MatchTicketModel.players))
                .where(MatchTicketModel.proposal_id == proposal_id)
                .with_for_update()
            )
            result = await self.session.execute(stmt)
            models = result.scalars().unique().all()

            if not models or any(
                model.status != MatchTicketStatus.PROPOSING for model in models
            ):
                return []

            for model in models:
                model.status = status
                model.proposal_id = None
                model.proposal_timeout_at = None
                for player in model.players:
                    if player.status in _ACTIVE_STATUSES:
                        player.status = status

            await self.session.flush()
            tickets = [self._to_entity(model) for model in models]

        for ticket in tickets:
            await self._sync_ticket_cache(ticket)

        return tickets

    async def find_expired_proposals(self, cutoff: datetime) -> list[str]:
        stmt = (
            select(MatchTicketModel.proposal_id)
            .where(
                MatchTicketModel.proposal_timeout_at.is_not(None),
                MatchTicketModel.proposal_timeout_at <= cutoff,
                MatchTicketModel.status == MatchTicketStatus.PROPOSING,
            )
            .group_by(MatchTicketModel.proposal_id)
        )
        result = await self.session.execute(stmt)
        return [proposal_id for proposal_id in result.scalars().all() if proposal_id]

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

    async def rebuild_cache_from_active(self) -> int:
        """Repopulate Redis with active tickets from Postgres."""

        if not self._cache_enabled():
            return 0

        tickets = await self.list_active_tickets()
        for ticket in tickets:
            await self._sync_ticket_cache(ticket)
        return len(tickets)

    def _cache_enabled(self) -> bool:
        return bool(self.redis and self.enable_heartbeat_cache)

    def _ticket_key(self, ticket_id: str) -> str:
        return f"mm:ticket:{ticket_id}"

    def _pool_zset_key(self, pool_key: str) -> str:
        return f"mm:pool:{pool_key}:zset"

    def _player_active_key(self, player_id: str) -> str:
        return f"mm:player_active:{player_id}"

    def _ticket_payload(self, ticket: Ticket) -> str:
        return json.dumps(asdict(ticket), default=str)

    def _cache_ttl_seconds(self, ticket: Ticket) -> int:
        ttl_seconds = (
            (ticket.heartbeat_timeout_at - datetime.now(timezone.utc)).total_seconds()
            if ticket.heartbeat_timeout_at
            else self.settings.HEARTBEAT_TIMEOUT_SECONDS
        )
        return max(int(ttl_seconds), 1)

    async def _sync_ticket_cache(self, ticket: Ticket) -> None:
        if not self._cache_enabled():
            return

        if ticket.status in _ACTIVE_STATUSES:
            await self._write_ticket_cache(ticket)
        else:
            await self._purge_ticket_cache(ticket)

    async def _write_ticket_cache(self, ticket: Ticket) -> None:
        ttl_seconds = self._cache_ttl_seconds(ticket)
        ticket_key = self._ticket_key(ticket.ticket_id)
        pool_key = self._pool_zset_key(ticket.pool_key)
        player_keys = [self._player_active_key(player.player_id) for player in ticket.players]

        pipe = self.redis.pipeline()
        pipe.set(ticket_key, self._ticket_payload(ticket), ex=ttl_seconds)
        pipe.zadd(pool_key, {ticket.ticket_id: ticket.created_at.timestamp()})
        for key in player_keys:
            pipe.set(key, ticket.ticket_id, ex=ttl_seconds)
        await pipe.execute()

        await self._ensure_pool_ttl(pool_key, ttl_seconds)

    async def _purge_ticket_cache(self, ticket: Ticket) -> None:
        ticket_key = self._ticket_key(ticket.ticket_id)
        pool_key = self._pool_zset_key(ticket.pool_key)
        player_keys = [self._player_active_key(player.player_id) for player in ticket.players]

        pipe = self.redis.pipeline()
        pipe.delete(ticket_key)
        pipe.zrem(pool_key, ticket.ticket_id)
        for key in player_keys:
            pipe.delete(key)
        await pipe.execute()

    async def _ensure_pool_ttl(self, pool_key: str, ttl_seconds: int) -> None:
        current_ttl = await self.redis.ttl(pool_key)
        effective_ttl = ttl_seconds if current_ttl in {-2, -1} else max(current_ttl, ttl_seconds)
        await self.redis.expire(pool_key, effective_ttl)

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
            soft_constraints=model.soft_constraints or {},
            mutation_seq=model.mutation_seq or 0,
            widening_stage=model.widening_stage or 0,
            last_heartbeat_at=model.last_heartbeat_at,
            heartbeat_timeout_at=model.heartbeat_timeout_at,
            proposal_id=model.proposal_id,
            proposal_timeout_at=model.proposal_timeout_at,
            leader_player_id=model.leader_player_id,
            created_at=model.created_at,
            updated_at=model.updated_at,
            players=players,
        )
