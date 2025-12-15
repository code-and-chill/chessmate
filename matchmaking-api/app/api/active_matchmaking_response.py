"""Active matchmaking response model."""
from typing import Optional

from pydantic import BaseModel

from app.schemas.ticket import TicketSchema


class ActiveMatchmakingResponse(BaseModel):
    """Active matchmaking response."""

    queue_entry: Optional[TicketSchema] = None
    match: Optional[dict] = None
