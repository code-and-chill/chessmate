"""Challenge response model."""
from typing import Optional

from pydantic import BaseModel


class ChallengeResponse(BaseModel):
    """Challenge response."""

    challenge_id: str
    status: str
    game_id: Optional[str] = None
