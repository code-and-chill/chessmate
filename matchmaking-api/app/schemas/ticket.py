"""Ticket and player schemas for request/response validation."""
from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class TicketTypeEnum(str, Enum):
    """Supported ticket types."""

    SOLO = "SOLO"
    PARTY = "PARTY"


class PlayerSchema(BaseModel):
    """Player metadata carried by a ticket."""

    user_id: str
    rating: Optional[int] = Field(default=None, description="Latest rating snapshot")
    rating_deviation: Optional[float] = Field(
        default=None, description="Rating deviation from rating-api"
    )
    party_id: Optional[str] = Field(default=None, description="Party identifier for grouped tickets")
    metadata: Optional[dict] = Field(default=None, description="Client supplied metadata")


class HardConstraintsSchema(BaseModel):
    """Hard matchmaking constraints."""

    time_control: str
    mode: str
    variant: str = "standard"
    region: str = "DEFAULT"


class SoftConstraintsSchema(BaseModel):
    """Soft matchmaking preferences that may be widened over time."""

    preferred_region: Optional[str] = None
    rating_window: Optional[int] = None
    max_latency_ms: Optional[int] = None


class WideningStateSchema(BaseModel):
    """Client-visible widening state."""

    current_window: int
    widen_count: int
    last_widened_at: Optional[datetime] = None


class TicketSchema(BaseModel):
    """Ticket representation returned to clients."""

    ticket_id: str
    tenant_id: str
    ticket_type: TicketTypeEnum
    status: str
    players: list[PlayerSchema]
    hard_constraints: HardConstraintsSchema
    soft_constraints: Optional[SoftConstraintsSchema] = None
    widening_state: Optional[WideningStateSchema] = None
    enqueued_at: datetime
    updated_at: datetime
    last_heartbeat_at: Optional[datetime] = None
    match_id: Optional[str] = None
    idempotency_key: Optional[str] = None
    client_request_id: Optional[str] = None


class QueueRequestSchema(BaseModel):
    """Request to create a ticket."""

    ticket_type: TicketTypeEnum = TicketTypeEnum.SOLO
    players: list[PlayerSchema] = Field(default_factory=list)
    hard_constraints: HardConstraintsSchema
    soft_constraints: Optional[SoftConstraintsSchema] = None
    idempotency_key: Optional[str] = None
    client_request_id: Optional[str] = None
