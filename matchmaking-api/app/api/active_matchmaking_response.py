"""Active matchmaking response model."""
from typing import Optional

from pydantic import BaseModel


class ActiveMatchmakingResponse(BaseModel):
    """Active matchmaking response."""

    queue_entry: Optional[dict] = None
    match: Optional[dict] = None
