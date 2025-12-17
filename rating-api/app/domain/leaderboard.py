"""Leaderboard ORM model."""

from datetime import datetime, timezone

from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.domain import Base


class Leaderboard(Base):
    """Materialized leaderboard for rating pools."""

    __tablename__ = "leaderboard"
    __table_args__ = (
        UniqueConstraint("pool_id", "user_id", name="uq_leaderboard_pool_user"),
        # Indexes will be created via migration
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    pool_id: Mapped[int] = mapped_column(Integer, ForeignKey("rating_pool.id", ondelete="RESTRICT"), index=True)
    user_id: Mapped[str] = mapped_column(String(64), index=True)
    rating: Mapped[int] = mapped_column(BigInteger)  # Store as integer (multiply by 100) for easier ranking
    rank: Mapped[int] = mapped_column(Integer)  # Rank within pool (1 = highest rating)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
