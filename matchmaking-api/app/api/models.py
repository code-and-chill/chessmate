"""HTTP request/response models."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# Queue request/response models
class QueueRequest(BaseModel):
    """Queue entry request."""

    time_control: str
    mode: str
    variant: str = "standard"
    region: str = "DEFAULT"
    client_metadata: Optional[dict] = None


class QueueResponse(BaseModel):
    """Queue entry response."""

    queue_entry_id: str
    status: str
    estimated_wait_seconds: int = 10


class QueueStatusResponse(BaseModel):
    """Queue status response."""

    queue_entry_id: str
    status: str
    estimated_wait_seconds: Optional[int] = None
    game_id: Optional[str] = None
    opponent: Optional[dict] = None


class OpponentInfo(BaseModel):
    """Opponent information."""

    user_id: str
    username: str
    rating_snapshot: Optional[dict] = None


class ActiveMatchmakingResponse(BaseModel):
    """Active matchmaking response."""

    queue_entry: Optional[dict] = None
    match: Optional[dict] = None


# Challenge request/response models
class ChallengeRequest(BaseModel):
    """Challenge creation request."""

    opponent_user_id: str
    time_control: str
    mode: str
    variant: str = "standard"
    preferred_color: str = "random"


class ChallengeResponse(BaseModel):
    """Challenge response."""

    challenge_id: str
    status: str
    game_id: Optional[str] = None


# Internal/Admin models
class QueueSummary(BaseModel):
    """Queue summary for metrics."""

    tenant_id: str
    pool_key: str
    waiting_count: int
    avg_wait_seconds: float
    p95_wait_seconds: float


class QueuesSummaryResponse(BaseModel):
    """Queues summary response."""

    timestamp: datetime
    queues: list[QueueSummary]
