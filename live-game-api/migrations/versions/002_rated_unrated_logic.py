"""Add decision_reason, starting_fen, and is_odds_game to games table.

Revision ID: 002_rated_unrated_logic
Revises: 001_initial
Create Date: 2025-12-03

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "002_rated_unrated_logic"
down_revision = "001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add rated/unrated decision logic fields."""
    # Add decision_reason column
    op.add_column(
        "games",
        sa.Column("decision_reason", sa.String(32), nullable=True),
    )

    # Add starting_fen column (for custom positions)
    op.add_column(
        "games",
        sa.Column("starting_fen", sa.Text(), nullable=True),
    )

    # Add is_odds_game column (for handicap games)
    op.add_column(
        "games",
        sa.Column("is_odds_game", sa.Boolean(), nullable=False, server_default="false"),
    )

    # Create index on decision_reason for analytics
    op.create_index("idx_games_decision_reason", "games", ["decision_reason"])

    # Backfill existing games with manual decision reason for rated games
    op.execute(
        """
        UPDATE games 
        SET decision_reason = 'manual' 
        WHERE rated = true AND decision_reason IS NULL
        """
    )


def downgrade() -> None:
    """Remove rated/unrated decision logic fields."""
    op.drop_index("idx_games_decision_reason", table_name="games")
    op.drop_column("games", "is_odds_game")
    op.drop_column("games", "starting_fen")
    op.drop_column("games", "decision_reason")
