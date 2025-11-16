"""Game aggregate root domain model."""
from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

from pydantic import Field

from .base_entity import BaseEntity
from .end_reason import EndReason
from .game_result import GameResult
from .game_status import GameStatus
from .move import Move
from .time_control import TimeControl


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
        # If creator already has a color, assign opponent to the opposite color
        if self.white_account_id == self.creator_account_id:
            # Creator is white, opponent must be black
            self.black_account_id = opponent_id
        elif self.black_account_id == self.creator_account_id:
            # Creator is black, opponent must be white
            self.white_account_id = opponent_id
        else:
            # No colors assigned yet, use preference
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
        self.started_at = datetime.now(timezone.utc)
        self.white_clock_ms = self.time_control.initial_seconds * 1000
        self.black_clock_ms = self.time_control.initial_seconds * 1000
        self.side_to_move = "w"

    def add_move(self, move: Move) -> None:
        """Add a move to the game and update clocks."""
        self.moves.append(move)
        self.updated_at = datetime.now(timezone.utc)

    def end_game(
        self, result: GameResult, reason: EndReason, ended_at: Optional[datetime] = None
    ) -> None:
        """End the game."""
        self.status = GameStatus.ENDED
        self.result = result
        self.end_reason = reason
        self.ended_at = ended_at or datetime.now(timezone.utc)
        self.updated_at = self.ended_at
