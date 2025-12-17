from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, Text, JSON, ForeignKey, Index
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Puzzle(Base):
    """
    Puzzle model with optimized indexes for common query patterns.
    """
    __tablename__ = "puzzles"

    id = Column(String(36), primary_key=True)
    fen = Column(String(256), nullable=False)
    solution_moves = Column(JSON, nullable=False)
    side_to_move = Column(String(5), nullable=False)
    initial_depth = Column(Integer, nullable=False)
    difficulty = Column(String(20), nullable=False, index=True)  # Index for filtering by difficulty
    themes = Column(JSON, nullable=False)
    source = Column(String(50), nullable=False)
    rating = Column(Integer, nullable=False, index=True)  # Index for rating-based queries
    popularity_score = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True, index=True)  # Index for active puzzle filtering
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Composite index for common query: active puzzles by difficulty and rating
    __table_args__ = (
        Index('ix_puzzles_active_difficulty_rating', 'is_active', 'difficulty', 'rating'),
    )

class DailyPuzzle(Base):
    __tablename__ = "daily_puzzles"

    id = Column(String(36), primary_key=True)
    puzzle_id = Column(String(36), ForeignKey("puzzles.id"), nullable=False)
    date_utc = Column(String(10), nullable=False, unique=True)
    global_title = Column(String(256), nullable=False)
    short_description = Column(Text)
    featured = Column(Boolean, default=False)
    created_by_admin_id = Column(String(36), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class UserPuzzleAttempt(Base):
    """
    User puzzle attempt tracking with optimized indexes.
    """
    __tablename__ = "puzzle_attempts"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), nullable=False, index=True)
    puzzle_id = Column(String(36), ForeignKey("puzzles.id"), nullable=False, index=True)
    attempt_id = Column(String(36), nullable=True)  # Client-generated UUID for idempotency
    is_daily = Column(Boolean, default=False)
    started_at = Column(DateTime, default=datetime.utcnow, index=True)  # Index for recent attempts
    completed_at = Column(DateTime, nullable=True)
    status = Column(String(20), nullable=False)
    moves_played = Column(JSON, nullable=False)
    mistakes = Column(Integer, default=0)
    hints_used = Column(Integer, default=0)
    time_spent_ms = Column(Integer, nullable=False)
    rating_change = Column(Integer, nullable=True)
    client_metadata = Column(JSON, nullable=True)

    # Composite indexes for common query patterns
    __table_args__ = (
        # For querying user's daily attempts
        Index('ix_attempts_user_puzzle_daily', 'user_id', 'puzzle_id', 'is_daily'),
        # For getting user's recent attempts (history)
        Index('ix_attempts_user_started', 'user_id', 'started_at'),
        # Unique constraint for idempotency (attempt_id must be provided)
        Index('ix_attempts_user_puzzle_attempt_id', 'user_id', 'puzzle_id', 'attempt_id', unique=True),
    )

class UserPuzzleStats(Base):
    __tablename__ = "user_puzzle_stats"

    user_id = Column(String(36), primary_key=True)
    tactics_rating = Column(Integer, default=1200)
    tactics_rd = Column(Float, default=350.0)
    total_attempts = Column(Integer, default=0)
    total_success = Column(Integer, default=0)
    current_daily_streak = Column(Integer, default=0)
    longest_daily_streak = Column(Integer, default=0)
    last_daily_solved_date = Column(String(10), nullable=True)
