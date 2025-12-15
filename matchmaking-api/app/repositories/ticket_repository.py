"""Ticket repository contract and DTOs."""
from abc import ABC, abstractmethod
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Sequence

from app.infrastructure.database.match_ticket_model import (
    MatchTicketStatus,
    MatchTicketType,
)


@dataclass
class TicketPlayerInput:
    """Payload for creating a ticket player."""

    player_id: str
    mmr: int
    rd: float
    latency_preferences: dict[str, Any]
    preferred_platform: str | None = None
    input_type: str | None = None
    risk_profile: str | None = None


@dataclass
class TicketPlayer:
    """Player persisted on a matchmaking ticket."""

    match_ticket_player_id: str
    ticket_id: str
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


@dataclass
class Ticket:
    """Aggregate describing a matchmaking ticket."""

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
    proposal_id: str | None
    proposal_timeout_at: datetime | None
    leader_player_id: str | None
    created_at: datetime
    updated_at: datetime
    players: list[TicketPlayer] = field(default_factory=list)


class TicketRepository(ABC):
    """Abstract base class for ticket persistence."""

    @abstractmethod
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
        """Persist a new ticket if no conflicting active tickets exist."""
        raise NotImplementedError

    @abstractmethod
    async def get_ticket(self, ticket_id: str) -> Ticket | None:
        """Fetch a ticket by identifier."""
        raise NotImplementedError

    @abstractmethod
    async def cancel_ticket(self, ticket_id: str) -> Ticket | None:
        """Cancel a ticket and mark players inactive."""
        raise NotImplementedError

    @abstractmethod
    async def update_status(
        self, ticket_id: str, status: MatchTicketStatus
    ) -> Ticket | None:
        """Update a ticket status."""
        raise NotImplementedError

    @abstractmethod
    async def update_soft_constraints(
        self,
        ticket_id: str,
        *,
        soft_constraints: dict[str, Any],
        mutation_seq: int,
        widening_stage: int | None = None,
    ) -> Ticket | None:
        """Persist updated soft constraints for a ticket."""
        raise NotImplementedError

    @abstractmethod
    async def record_heartbeat(
        self,
        ticket_id: str,
        *,
        heartbeat_timeout_at: datetime,
        heartbeat_at: datetime | None = None,
    ) -> Ticket | None:
        """Update heartbeat tracking fields for a ticket."""
        raise NotImplementedError

    @abstractmethod
    async def find_stale_tickets(self, cutoff: datetime) -> list[Ticket]:
        """Locate tickets whose heartbeat has expired."""
        raise NotImplementedError

    @abstractmethod
    async def list_active_tickets(self) -> list[Ticket]:
        """Return tickets that are still eligible for matchmaking."""
        raise NotImplementedError

    @abstractmethod
    async def create_proposal(
        self,
        ticket_ids: Sequence[str],
        *,
        proposal_id: str,
        proposal_timeout_at: datetime,
    ) -> list[Ticket]:
        """Mark tickets as proposing under a shared proposal identifier."""
        raise NotImplementedError

    @abstractmethod
    async def finalize_proposal(
        self, proposal_id: str, status: MatchTicketStatus
    ) -> list[Ticket]:
        """Finalize a proposal by updating all participating tickets."""
        raise NotImplementedError

    @abstractmethod
    async def find_expired_proposals(self, cutoff: datetime) -> list[str]:
        """Locate proposal identifiers whose ready-check timed out."""
        raise NotImplementedError
