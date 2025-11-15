from datetime import datetime
from typing import Optional

from sqlalchemy import (
    UniqueConstraint,
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.domain import Base


class RatingPool(Base):
    __tablename__ = "rating_pool"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    time_control_min: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    time_control_max: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    variant: Mapped[str] = mapped_column(String(32), default="standard")
    mode: Mapped[str] = mapped_column(String(32), default="normal")
    rating_system: Mapped[str] = mapped_column(String(16), default="glicko2")
    initial_rating: Mapped[float] = mapped_column(Float, default=1500.0)
    glicko_tau: Mapped[float] = mapped_column(Float, default=0.5)
    glicko_default_rd: Mapped[float] = mapped_column(Float, default=350.0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class UserRating(Base):
    __tablename__ = "user_rating"
    __table_args__ = (
        UniqueConstraint("user_id", "pool_id", name="uq_user_pool"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(64), index=True)
    pool_id: Mapped[int] = mapped_column(Integer, ForeignKey("rating_pool.id", ondelete="RESTRICT"))
    rating: Mapped[float] = mapped_column(Float, default=1500.0)
    rating_deviation: Mapped[float] = mapped_column(Float, default=350.0)
    volatility: Mapped[float] = mapped_column(Float, default=0.06)
    games_played: Mapped[int] = mapped_column(Integer, default=0)
    provisional: Mapped[bool] = mapped_column(Boolean, default=True)
    locked: Mapped[bool] = mapped_column(Boolean, default=False)
    last_updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class RatingEvent(Base):
    __tablename__ = "rating_event"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(64), index=True)
    pool_id: Mapped[int] = mapped_column(Integer, ForeignKey("rating_pool.id", ondelete="RESTRICT"))
    game_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    old_rating: Mapped[float] = mapped_column(Float)
    new_rating: Mapped[float] = mapped_column(Float)
    old_rd: Mapped[float] = mapped_column(Float)
    new_rd: Mapped[float] = mapped_column(Float)
    old_volatility: Mapped[float] = mapped_column(Float)
    new_volatility: Mapped[float] = mapped_column(Float)
    reason: Mapped[str] = mapped_column(String(32))  # game | admin_adjustment | recompute
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)


class RatingIngestion(Base):
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
    processed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    white_rating_after: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    black_rating_after: Mapped[Optional[float]] = mapped_column(Float, nullable=True)


class EventOutbox(Base):
    __tablename__ = "event_outbox"
    __table_args__ = (
        UniqueConstraint("aggregate_id", "event_type", "event_key", name="uq_outbox_dedup"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    event_type: Mapped[str] = mapped_column(String(64))  # rating.updated
    aggregate_id: Mapped[str] = mapped_column(String(128))  # user_id:pool_code
    event_key: Mapped[str] = mapped_column(String(128))  # game_id or recompute batch
    payload: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
