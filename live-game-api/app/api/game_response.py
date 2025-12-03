"""Game response model."""
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.domain.models.decision_reason import DecisionReason
from app.domain.models.end_reason import EndReason
from app.domain.models.game_result import GameResult
from app.domain.models.game_status import GameStatus

from .move_response import MoveResponse


class GameResponse(BaseModel):
    """Game response model."""

    id: UUID
    status: GameStatus
    rated: bool
    decision_reason: Optional[DecisionReason]
    variant_code: str

    white_account_id: Optional[UUID]
    black_account_id: Optional[UUID]
    white_remaining_ms: int
    black_remaining_ms: int

    side_to_move: str
    fen: str
    moves: List[MoveResponse] = Field(default_factory=list)

    result: Optional[GameResult]
    end_reason: Optional[EndReason]

    created_at: datetime
    started_at: Optional[datetime]
    ended_at: Optional[datetime]

    class Config:
        use_enum_values = True
