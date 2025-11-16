"""Game ORM model."""
from uuid import UUID

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

from app.domain.models.end_reason import EndReason
from app.domain.models.game_model import Game
from app.domain.models.game_result import GameResult
from app.domain.models.game_status import GameStatus
from app.domain.models.time_control import TimeControl

Base = declarative_base()


class GameORM(Base):
    """Game ORM model."""

    __tablename__ = "games"

    id = Column(PG_UUID(as_uuid=True), primary_key=True)
    creator_account_id = Column(PG_UUID(as_uuid=True), nullable=False)
    white_account_id = Column(PG_UUID(as_uuid=True), nullable=True)
    black_account_id = Column(PG_UUID(as_uuid=True), nullable=True)

    status = Column(String(32), nullable=False, default=GameStatus.WAITING_FOR_OPPONENT)
    rated = Column(Boolean, nullable=False, default=True)
    variant_code = Column(String(32), nullable=False, default="standard")

    time_initial_ms = Column(Integer, nullable=False)
    time_increment_ms = Column(Integer, nullable=False, default=0)

    white_clock_ms = Column(Integer, nullable=False)
    black_clock_ms = Column(Integer, nullable=False)

    side_to_move = Column(String(1), nullable=False, default="w")
    fen = Column(
        Text,
        nullable=False,
        default="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    )

    result = Column(String(8), nullable=True)
    end_reason = Column(String(32), nullable=True)

    created_at = Column(DateTime, nullable=False)
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, nullable=False)

    moves = relationship("GameMoveORM", back_populates="game", cascade="all, delete-orphan")

    def to_domain(self) -> Game:
        """Convert ORM model to domain model."""
        return Game(
            id=self.id,
            creator_account_id=self.creator_account_id,
            white_account_id=self.white_account_id,
            black_account_id=self.black_account_id,
            status=GameStatus(self.status),
            rated=self.rated,
            variant_code=self.variant_code,
            time_control=TimeControl(
                initial_seconds=self.time_initial_ms // 1000,
                increment_seconds=self.time_increment_ms // 1000,
            ),
            white_clock_ms=self.white_clock_ms,
            black_clock_ms=self.black_clock_ms,
            side_to_move=self.side_to_move,
            fen=self.fen,
            moves=[move.to_domain() for move in self.moves],
            result=GameResult(self.result) if self.result else None,
            end_reason=EndReason(self.end_reason) if self.end_reason else None,
            created_at=self.created_at,
            started_at=self.started_at,
            ended_at=self.ended_at,
            updated_at=self.updated_at,
        )

    @staticmethod
    def from_domain(game: Game) -> "GameORM":
        """Convert domain model to ORM model."""
        return GameORM(
            id=game.id,
            creator_account_id=game.creator_account_id,
            white_account_id=game.white_account_id,
            black_account_id=game.black_account_id,
            status=game.status.value,
            rated=game.rated,
            variant_code=game.variant_code,
            time_initial_ms=game.time_control.initial_seconds * 1000,
            time_increment_ms=game.time_control.increment_seconds * 1000,
            white_clock_ms=game.white_clock_ms,
            black_clock_ms=game.black_clock_ms,
            side_to_move=game.side_to_move,
            fen=game.fen,
            result=game.result.value if game.result else None,
            end_reason=game.end_reason.value if game.end_reason else None,
            created_at=game.created_at,
            started_at=game.started_at,
            ended_at=game.ended_at,
            updated_at=game.updated_at,
        )
