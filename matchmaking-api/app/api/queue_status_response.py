"""Queue status response model."""
from typing import Optional

from pydantic import BaseModel

from app.schemas.ticket import (
    HardConstraintsSchema,
    PlayerSchema,
    SoftConstraintsSchema,
    TicketTypeEnum,
    WideningStateSchema,
)


class QueueStatusResponse(BaseModel):
    """Queue status response."""

    ticket_id: str
    status: str
    ticket_type: TicketTypeEnum
    players: list[PlayerSchema]
    hard_constraints: HardConstraintsSchema
    soft_constraints: SoftConstraintsSchema | None = None
    widening_state: Optional[WideningStateSchema] = None
    estimated_wait_seconds: Optional[int] = None
    game_id: Optional[str] = None
    opponent: Optional[dict] = None
