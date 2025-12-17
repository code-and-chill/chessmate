"""
Migration: Add attempt_id field for idempotency

This migration adds the attempt_id column to the puzzle_attempts table
and creates a unique constraint on (user_id, puzzle_id, attempt_id).

Run with: python -m alembic upgrade head
Or manually with SQLAlchemy migration tools.
"""

from sqlalchemy import Column, String, Index
from alembic import op
import sqlalchemy as sa


def upgrade():
    # Add attempt_id column (nullable initially for backward compatibility)
    op.add_column('puzzle_attempts', Column('attempt_id', String(36), nullable=True))
    
    # Create unique index for idempotency (only applies when attempt_id is not NULL)
    # Note: SQLite doesn't support partial unique indexes, so we'll use a regular unique index
    # For PostgreSQL, we could use: CREATE UNIQUE INDEX ... WHERE attempt_id IS NOT NULL
    op.create_index(
        'ix_attempts_user_puzzle_attempt_id',
        'puzzle_attempts',
        ['user_id', 'puzzle_id', 'attempt_id'],
        unique=True,
    )


def downgrade():
    # Drop the unique index
    op.drop_index('ix_attempts_user_puzzle_attempt_id', table_name='puzzle_attempts')
    
    # Drop the attempt_id column
    op.drop_column('puzzle_attempts', 'attempt_id')
