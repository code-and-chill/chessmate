"""API request and response models."""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.domain.models.game import GameResult, GameStatus, EndReason, Move


class TimeControlRequest(BaseModel):
    """Time control request model."""

    initial_seconds: int = Field(..., gt=0)
    increment_seconds: int = Field(default=0, ge=0)


class CreateGameRequest(BaseModel):
    """Create game request model."""

    opponent_account_id: Optional[UUID] = None
    color_preference: str = Field(default="random", regex=r"^(white|black|random)$")
    time_control: TimeControlRequest
    rated: bool = True


class JoinGameRequest(BaseModel):
    """Join game request model."""

    color_preference: str = Field(default="random", regex=r"^(white|black|random)$")


class PlayMoveRequest(BaseModel):
    """Play move request model."""

    from_square: str = Field(..., regex=r"^[a-h][1-8]$")
    to_square: str = Field(..., regex=r"^[a-h][1-8]$")
    promotion: Optional[str] = Field(None, regex=r"^[qrbn]$")


class MoveResponse(BaseModel):
    """Move response model."""

    ply: int
    move_number: int
    color: str
    from_square: str
    to_square: str
    promotion: Optional[str]
    san: str
    played_at: datetime
    elapsed_ms: int

    class Config:
        orm_mode = True


class PlayerResponse(BaseModel):
    """Player response model."""

    account_id: UUID
    remaining_ms: int


class GameResponse(BaseModel):
    """Game response model."""

    id: UUID
    status: GameStatus
    rated: bool
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


class HealthResponse(BaseModel):
    """Health check response model."""

    status: str
    service: str
