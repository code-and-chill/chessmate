"""Game and move domain models."""

from datetime import datetime
from enum import Enum
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from .base import BaseEntity, BaseDomainEvent


class GameStatus(str, Enum):
    """Game status enumeration."""

    WAITING_FOR_OPPONENT = "waiting_for_opponent"
    IN_PROGRESS = "in_progress"
    ENDED = "ended"


class GameResult(str, Enum):
    """Game result enumeration."""

    WHITE_WIN = "1-0"
    BLACK_WIN = "0-1"
    DRAW = "1/2-1/2"


class EndReason(str, Enum):
    """Game end reason enumeration."""

    CHECKMATE = "checkmate"
    RESIGNATION = "resignation"
    TIMEOUT = "timeout"
    DRAW_AGREED = "draw_agreed"
    STALEMATE = "stalemate"
    INSUFFICIENT_MATERIAL = "insufficient_material"


class TimeControl(BaseModel):
    """Time control configuration."""

    initial_seconds: int = Field(..., gt=0)
    increment_seconds: int = Field(default=0, ge=0)

    @field_validator("initial_seconds")
    @classmethod
    def validate_initial_seconds(cls, v):
        if v < 1:
            raise ValueError("Initial time must be at least 1 second")
        if v > 86400:  # 24 hours max
            raise ValueError("Initial time cannot exceed 24 hours")
        return v


class Player(BaseModel):
    """Player information in a game."""

    account_id: UUID
    remaining_ms: int = Field(..., ge=0)

    class Config:
        from_attributes = True


class Move(BaseModel):
    """Chess move representation."""

    ply: int = Field(..., ge=1)
    move_number: int = Field(..., ge=1)
    color: str = Field(..., pattern=r"^[wb]$")  # 'w' or 'b'
    from_square: str = Field(..., pattern=r"^[a-h][1-8]$")
    to_square: str = Field(..., pattern=r"^[a-h][1-8]$")
    promotion: Optional[str] = Field(None, pattern=r"^[qrbn]$")
    san: str  # Standard Algebraic Notation
    fen_after: str
    played_at: datetime = Field(default_factory=datetime.utcnow)
    elapsed_ms: int = Field(..., ge=0)

    class Config:
        from_attributes = True


class Game(BaseEntity):
    """Game aggregate root domain model."""

    creator_account_id: UUID
    white_account_id: Optional[UUID] = None
    black_account_id: Optional[UUID] = None

    status: GameStatus = GameStatus.WAITING_FOR_OPPONENT
    rated: bool = True
    variant_code: str = "standard"

    time_control: TimeControl
    white_clock_ms: int
    black_clock_ms: int

    side_to_move: str = Field(default="w", pattern=r"^[wb]$")
    fen: str = Field(default="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")

    moves: List[Move] = Field(default_factory=list)

    result: Optional[GameResult] = None
    end_reason: Optional[EndReason] = None

    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None

    def is_waiting_for_opponent(self) -> bool:
        """Check if game is waiting for opponent."""
        return self.status == GameStatus.WAITING_FOR_OPPONENT

    def is_in_progress(self) -> bool:
        """Check if game is in progress."""
        return self.status == GameStatus.IN_PROGRESS

    def is_ended(self) -> bool:
        """Check if game has ended."""
        return self.status == GameStatus.ENDED

    def get_player_by_id(self, account_id: UUID) -> Optional[str]:
        """Get player color by account ID. Returns 'w', 'b', or None."""
        if self.white_account_id == account_id:
            return "w"
        if self.black_account_id == account_id:
            return "b"
        return None

    def is_player_in_game(self, account_id: UUID) -> bool:
        """Check if account is participating in this game."""
        return self.get_player_by_id(account_id) is not None

    def can_join(self, account_id: UUID) -> bool:
        """Check if account can join this game."""
        return (
            self.is_waiting_for_opponent()
            and self.white_account_id != account_id
            and self.black_account_id != account_id
        )

    def assign_colors(self, opponent_id: UUID, color_preference: str) -> None:
        """Assign colors to players based on preference."""
        if color_preference == "white":
            self.white_account_id = self.creator_account_id
            self.black_account_id = opponent_id
        elif color_preference == "black":
            self.white_account_id = opponent_id
            self.black_account_id = self.creator_account_id
        else:  # random
            import random

            if random.choice([True, False]):
                self.white_account_id = self.creator_account_id
                self.black_account_id = opponent_id
            else:
                self.white_account_id = opponent_id
                self.black_account_id = self.creator_account_id

    def start_game(self) -> None:
        """Start the game after opponent joins."""
        self.status = GameStatus.IN_PROGRESS
        self.started_at = datetime.utcnow()
        self.white_clock_ms = self.time_control.initial_seconds * 1000
        self.black_clock_ms = self.time_control.initial_seconds * 1000
        self.side_to_move = "w"

    def add_move(self, move: Move) -> None:
        """Add a move to the game and update clocks."""
        self.moves.append(move)
        self.updated_at = datetime.utcnow()

    def end_game(
        self, result: GameResult, reason: EndReason, ended_at: Optional[datetime] = None
    ) -> None:
        """End the game."""
        self.status = GameStatus.ENDED
        self.result = result
        self.end_reason = reason
        self.ended_at = ended_at or datetime.utcnow()
        self.updated_at = self.ended_at


# Domain Events
class GameCreatedEvent(BaseDomainEvent):
    """Game created domain event."""

    event_type: str = "game.created"
    creator_account_id: UUID
    time_control: TimeControl
    rated: bool


class GameStartedEvent(BaseDomainEvent):
    """Game started domain event."""

    event_type: str = "game.started"
    white_account_id: UUID
    black_account_id: UUID
    started_at: datetime


class MovePlayedEvent(BaseDomainEvent):
    """Move played domain event."""

    event_type: str = "move.played"
    move: Move
    fen: str


class GameEndedEvent(BaseDomainEvent):
    """Game ended domain event."""

    event_type: str = "game.ended"
    white_account_id: UUID
    black_account_id: UUID
    result: GameResult
    end_reason: EndReason
    time_control: TimeControl
    rated: bool
