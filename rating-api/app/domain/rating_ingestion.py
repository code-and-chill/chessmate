"""Rating ingestion ORM model."""
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Boolean, CheckConstraint, Column, DateTime, Float, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.domain import Base


class RatingIngestion(Base):
    """Game result ingestion tracking (idempotency)."""

    __tablename__ = "rating_ingestion"
    __table_args__ = (
        UniqueConstraint("game_id", "pool_code", name="uq_game_pool"),
        CheckConstraint("result in ('white_win','black_win','draw')", name="ck_result_enum"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    game_id: Mapped[str] = mapped_column(String(64))
    pool_code: Mapped[str] = mapped_column(String(64))
    white_user_id: Mapped[str] = mapped_column(String(64))
    black_user_id: Mapped[str] = mapped_column(String(64))
    result: Mapped[str] = mapped_column(String(16))  # white_win | black_win | draw
    rated: Mapped[bool] = mapped_column(Boolean, default=True)
    ended_at: Mapped[datetime] = mapped_column(DateTime)
    processed_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    white_rating_after: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    black_rating_after: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
