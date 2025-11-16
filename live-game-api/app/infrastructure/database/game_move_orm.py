"""Game move ORM model."""
from uuid import UUID

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.infrastructure.database import Base
from app.infrastructure.database.game_orm import GUID
from app.domain.models.move import Move


class GameMoveORM(Base):
    """Game move ORM model."""

    __tablename__ = "game_moves"

    id = Column(GUID(), primary_key=True)
    game_id = Column(
        GUID(), ForeignKey("games.id"), nullable=False
    )

    ply = Column(Integer, nullable=False)
    move_number = Column(Integer, nullable=False)
    color = Column(String(1), nullable=False)

    from_square = Column(String(2), nullable=False)
    to_square = Column(String(2), nullable=False)
    promotion = Column(String(1), nullable=True)
    san = Column(String(16), nullable=False)
    fen_after = Column(Text, nullable=False)

    played_at = Column(DateTime, nullable=False)
    elapsed_ms = Column(Integer, nullable=False)

    game = relationship("GameORM", back_populates="moves")

    def to_domain(self) -> Move:
        """Convert ORM model to domain model."""
        return Move(
            ply=self.ply,
            move_number=self.move_number,
            color=self.color,
            from_square=self.from_square,
            to_square=self.to_square,
            promotion=self.promotion,
            san=self.san,
            fen_after=self.fen_after,
            played_at=self.played_at,
            elapsed_ms=self.elapsed_ms,
        )

    @staticmethod
    def from_domain(move: Move, game_id: UUID) -> "GameMoveORM":
        """Convert domain model to ORM model."""
        import uuid
        return GameMoveORM(
            id=uuid.uuid4(),
            game_id=game_id,
            ply=move.ply,
            move_number=move.move_number,
            color=move.color,
            from_square=move.from_square,
            to_square=move.to_square,
            promotion=move.promotion,
            san=move.san,
            fen_after=move.fen_after,
            played_at=move.played_at,
            elapsed_ms=move.elapsed_ms,
        )
