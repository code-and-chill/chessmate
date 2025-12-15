"""Match ticket player ORM model."""
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum as SqlEnum, Float, ForeignKey, Integer, String, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from .base import Base
from .match_ticket_model import MatchTicketStatus


class MatchTicketPlayerModel(Base):
    """Players attached to a matchmaking ticket."""

    __tablename__ = "match_ticket_players"

    match_ticket_player_id = Column(String(64), primary_key=True)
    ticket_id = Column(
        String(64), ForeignKey("match_tickets.ticket_id", ondelete="CASCADE"), nullable=False
    )
    player_id = Column(String(50), nullable=False, index=True)
    mmr = Column(Integer, nullable=False)
    rd = Column(Float, nullable=False)
    latency_preferences = Column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    preferred_platform = Column(String(50), nullable=True)
    input_type = Column(String(50), nullable=True)
    risk_profile = Column(String(50), nullable=True)
    status = Column(SqlEnum(MatchTicketStatus, name="match_ticket_status"), nullable=False)
    pool_key = Column(String(100), nullable=False)
    enqueue_key = Column(String(100), nullable=False)
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    ticket = relationship("MatchTicketModel", back_populates="players")

    __table_args__ = (
        UniqueConstraint(
            "enqueue_key", "player_id", "pool_key", name="uq_match_ticket_players_enqueue_player_pool"
        ),
    )
