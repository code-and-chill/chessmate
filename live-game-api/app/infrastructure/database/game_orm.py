"""Game ORM model."""
from uuid import UUID as PythonUUID

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.types import TypeDecorator, CHAR
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship

from app.infrastructure.database import Base
from app.domain.models.end_reason import EndReason
from app.domain.models.game_model import Game
from app.domain.models.game_result import GameResult
from app.domain.models.game_status import GameStatus
from app.domain.models.time_control import TimeControl


class GUID(TypeDecorator):
    """Platform-independent GUID type."""
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        else:
            return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            return value
        else:
            if isinstance(value, PythonUUID):
                return str(value)
            return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            return value
        else:
            return PythonUUID(value) if value else None


class GameORM(Base):
    """Game ORM model."""

    __tablename__ = "games"

    id = Column(GUID(), primary_key=True)
    creator_account_id = Column(GUID(), nullable=False)
    white_account_id = Column(GUID(), nullable=True)
    black_account_id = Column(GUID(), nullable=True)

    # Bot support
    bot_id = Column(String(64), nullable=True)
    bot_color = Column(String(1), nullable=True)

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
        game = Game(
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
        # Add bot fields if present
        if self.bot_id:
            game.bot_id = self.bot_id
        if self.bot_color:
            game.bot_color = self.bot_color
        return game

    @staticmethod
    def from_domain(game: Game) -> "GameORM":
        """Convert domain model to ORM model."""
        # Handle status - could be enum or string
        status_value = game.status.value if isinstance(game.status, GameStatus) else game.status
        
        # Handle result - could be enum or string
        result_value = None
        if game.result:
            result_value = game.result.value if isinstance(game.result, GameResult) else game.result
        
        # Handle end_reason - could be enum or string
        end_reason_value = None
        if game.end_reason:
            end_reason_value = game.end_reason.value if isinstance(game.end_reason, EndReason) else game.end_reason
        
        # Convert moves
        from app.infrastructure.database.game_move_orm import GameMoveORM
        move_orms = [GameMoveORM.from_domain(move, game.id) for move in game.moves]
        
        game_orm = GameORM(
            id=game.id,
            creator_account_id=game.creator_account_id,
            white_account_id=game.white_account_id,
            black_account_id=game.black_account_id,
            bot_id=game.bot_id,
            bot_color=game.bot_color,
            status=status_value,
            rated=game.rated,
            variant_code=game.variant_code,
            time_initial_ms=game.time_control.initial_seconds * 1000,
            time_increment_ms=game.time_control.increment_seconds * 1000,
            white_clock_ms=game.white_clock_ms,
            black_clock_ms=game.black_clock_ms,
            side_to_move=game.side_to_move,
            fen=game.fen,
            result=result_value,
            end_reason=end_reason_value,
            created_at=game.created_at,
            started_at=game.started_at,
            ended_at=game.ended_at,
            updated_at=game.updated_at,
        )
        game_orm.moves = move_orms
        return game_orm
