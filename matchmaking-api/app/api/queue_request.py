"""Queue entry request model."""
from typing import Optional

from pydantic import BaseModel


class QueueRequest(BaseModel):
    """Queue entry request."""

    time_control: str
    mode: str
    variant: str = "standard"
    region: str = "DEFAULT"
    client_metadata: Optional[dict] = None
