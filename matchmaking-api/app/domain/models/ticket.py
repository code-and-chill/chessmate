"""Ticket aggregate for matchmaking."""
from datetime import datetime
from enum import Enum
from typing import Optional

from .constraints import HardConstraints, SoftConstraints
from .player import Player
from .queue_entry_status import QueueEntryStatus
from .widening import WideningState


class TicketType(str, Enum):
    """Ticket type enumeration."""

    SOLO = "SOLO"
    PARTY = "PARTY"


class Ticket:
    """Matchmaking ticket representing solo or party queues."""

    def __init__(
        self,
        ticket_id: str,
        tenant_id: str,
        ticket_type: TicketType,
        status: QueueEntryStatus,
        players: list[Player],
        hard_constraints: HardConstraints,
        soft_constraints: Optional[SoftConstraints],
        widening_state: WideningState,
        enqueued_at: datetime,
        updated_at: datetime,
        last_heartbeat_at: Optional[datetime] = None,
        match_id: Optional[str] = None,
        idempotency_key: Optional[str] = None,
        client_request_id: Optional[str] = None,
    ) -> None:
        self.ticket_id = ticket_id
        self.tenant_id = tenant_id
        self.ticket_type = ticket_type
        self.status = status
        self.players = players
        self.hard_constraints = hard_constraints
        self.soft_constraints = soft_constraints
        self.widening_state = widening_state
        self.enqueued_at = enqueued_at
        self.updated_at = updated_at
        self.last_heartbeat_at = last_heartbeat_at or enqueued_at
        self.match_id = match_id
        self.idempotency_key = idempotency_key
        self.client_request_id = client_request_id

    @property
    def queue_entry_id(self) -> str:
        """Alias for backward compatibility with queue terminology."""
        return self.ticket_id

    def is_searching(self) -> bool:
        """Check if ticket is actively searching."""
        return self.status == QueueEntryStatus.SEARCHING

    def is_matched(self) -> bool:
        """Check if ticket has been matched."""
        return self.status == QueueEntryStatus.MATCHED

    def is_finalized(self) -> bool:
        """Check if ticket is in a terminal state."""
        return self.status in (
            QueueEntryStatus.MATCHED,
            QueueEntryStatus.CANCELLED,
            QueueEntryStatus.TIMED_OUT,
            QueueEntryStatus.EXPIRED,
        )

    def time_in_queue_seconds(self, now: datetime) -> float:
        """Get seconds the ticket has been in queue."""
        delta = now - self.enqueued_at
        return delta.total_seconds()

    def to_dict(self) -> dict:
        """Serialize the ticket for storage."""
        return {
            "ticket_id": self.ticket_id,
            "tenant_id": self.tenant_id,
            "ticket_type": self.ticket_type.value,
            "status": self.status.value,
            "players": [player.to_dict() for player in self.players],
            "hard_constraints": self.hard_constraints.to_dict(),
            "soft_constraints": self.soft_constraints.to_dict() if self.soft_constraints else None,
            "widening_state": self.widening_state.to_dict(),
            "enqueued_at": self.enqueued_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "last_heartbeat_at": self.last_heartbeat_at.isoformat()
            if self.last_heartbeat_at
            else None,
            "match_id": self.match_id,
            "idempotency_key": self.idempotency_key,
            "client_request_id": self.client_request_id,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Ticket":
        """Create a ticket from stored representation."""
        return cls(
            ticket_id=data["ticket_id"],
            tenant_id=data["tenant_id"],
            ticket_type=TicketType(data.get("ticket_type", TicketType.SOLO.value)),
            status=QueueEntryStatus(data["status"]),
            players=[Player.from_dict(p) for p in data.get("players", [])],
            hard_constraints=HardConstraints.from_dict(data["hard_constraints"]),
            soft_constraints=SoftConstraints.from_dict(data["soft_constraints"])
            if data.get("soft_constraints")
            else None,
            widening_state=WideningState.from_dict(data.get("widening_state", {})),
            enqueued_at=datetime.fromisoformat(data["enqueued_at"]),
            updated_at=datetime.fromisoformat(data["updated_at"]),
            last_heartbeat_at=datetime.fromisoformat(data["last_heartbeat_at"])
            if data.get("last_heartbeat_at")
            else None,
            match_id=data.get("match_id"),
            idempotency_key=data.get("idempotency_key"),
            client_request_id=data.get("client_request_id"),
        )

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Ticket):
            return NotImplemented
        return self.ticket_id == other.ticket_id

    def __hash__(self) -> int:
        return hash(self.ticket_id)
