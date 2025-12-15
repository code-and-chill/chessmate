"""Queue entry response model."""
from pydantic import BaseModel

from app.schemas.ticket import (
    HardConstraintsSchema,
    PlayerSchema,
    SoftConstraintsSchema,
    TicketTypeEnum,
    WideningStateSchema,
)


class QueueResponse(BaseModel):
    """Queue entry response."""

    ticket_id: str
    status: str
    ticket_type: TicketTypeEnum
    players: list[PlayerSchema]
    hard_constraints: HardConstraintsSchema
    soft_constraints: SoftConstraintsSchema | None = None
    widening_state: WideningStateSchema | None = None
    estimated_wait_seconds: int = 10
