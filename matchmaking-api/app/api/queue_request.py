"""Queue entry request model."""
from app.schemas.ticket import (
    HardConstraintsSchema,
    PlayerSchema,
    QueueRequestSchema,
    SoftConstraintsSchema,
    TicketTypeEnum,
)


class QueueRequest(QueueRequestSchema):
    """Queue entry request schema aligning with ticket fields."""

    ticket_type: TicketTypeEnum = TicketTypeEnum.SOLO
    players: list[PlayerSchema] = []
    hard_constraints: HardConstraintsSchema
    soft_constraints: SoftConstraintsSchema | None = None
