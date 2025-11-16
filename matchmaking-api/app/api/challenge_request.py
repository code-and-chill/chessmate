"""Challenge creation request model."""
from pydantic import BaseModel


class ChallengeRequest(BaseModel):
    """Challenge creation request."""

    opponent_user_id: str
    time_control: str
    mode: str
    variant: str = "standard"
    preferred_color: str = "random"
