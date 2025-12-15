"""Match ticket ORM model."""
from datetime import datetime, timezone
from enum import Enum

from sqlalchemy import Column, DateTime, Enum as SqlEnum, Index, Integer, String, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from .base import Base


class MatchTicketStatus(str, Enum):
    """Possible lifecycle states for a match ticket."""

    QUEUED = "queued"
    SEARCHING = "searching"
    MATCHED = "matched"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


class MatchTicketType(str, Enum):
    """Supported ticket shapes."""

    SOLO = "solo"
    PARTY = "party"


class MatchTicketModel(Base):
    """Match ticket ORM model."""

    __tablename__ = "match_tickets"

    ticket_id = Column(String(64), primary_key=True, index=True)
    enqueue_key = Column(String(100), nullable=False, index=True)
    idempotency_key = Column(String(100), nullable=False, unique=True)
    pool_key = Column(String(100), nullable=False, index=True)
    status = Column(SqlEnum(MatchTicketStatus, name="match_ticket_status"), nullable=False)
    type = Column(SqlEnum(MatchTicketType, name="match_ticket_type"), nullable=False)
    search_params = Column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    widening_config = Column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    constraints = Column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    soft_constraints = Column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    mutation_seq = Column(Integer, nullable=False, server_default=text("0"))
    widening_stage = Column(Integer, nullable=False, server_default=text("0"))
    last_heartbeat_at = Column(DateTime(timezone=True), nullable=True)
    heartbeat_timeout_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    players = relationship(
        "MatchTicketPlayerModel", back_populates="ticket", cascade="all, delete-orphan"
    )

    __table_args__ = (Index("ix_match_tickets_pool_status", "pool_key", "status"),)
