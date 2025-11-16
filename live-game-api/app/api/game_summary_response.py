"""Game summary response model."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel

from app.domain.models.end_reason import EndReason
from app.domain.models.game_result import GameResult
from app.domain.models.game_status import GameStatus


class GameSummaryResponse(BaseModel):
    """Game summary response model."""

    id: UUID
    status: GameStatus
    rated: bool

    white_account_id: Optional[UUID]
    black_account_id: Optional[UUID]

    result: Optional[GameResult]
    end_reason: Optional[EndReason]

    created_at: datetime
    started_at: Optional[datetime]
    ended_at: Optional[datetime]

    class Config:
        use_enum_values = True
