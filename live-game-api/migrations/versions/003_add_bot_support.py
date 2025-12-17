"""Add bot support to games table.

Revision ID: 003_add_bot_support
Revises: 002_rated_unrated_logic
Create Date: 2025-12-06

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "003_add_bot_support"
down_revision = "002_rated_unrated_logic"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add bot_id and bot_color columns to games table."""
    op.add_column("games", sa.Column("bot_id", sa.String(64), nullable=True))
    op.add_column("games", sa.Column("bot_color", sa.String(1), nullable=True))
    
    # Add index on bot_id for faster lookups
    op.create_index("idx_games_bot_id", "games", ["bot_id"])


def downgrade() -> None:
    """Remove bot_id and bot_color columns from games table."""
    op.drop_index("idx_games_bot_id", table_name="games")
    op.drop_column("games", "bot_color")
    op.drop_column("games", "bot_id")
