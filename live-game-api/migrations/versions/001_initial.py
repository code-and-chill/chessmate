"""Initial migration for live-game-api."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create initial schema."""
    # Create games table
    op.create_table(
        "games",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("creator_account_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("white_account_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("black_account_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("status", sa.String(32), nullable=False),
        sa.Column("rated", sa.Boolean(), nullable=False),
        sa.Column("variant_code", sa.String(32), nullable=False),
        sa.Column("time_initial_ms", sa.Integer(), nullable=False),
        sa.Column("time_increment_ms", sa.Integer(), nullable=False),
        sa.Column("white_clock_ms", sa.Integer(), nullable=False),
        sa.Column("black_clock_ms", sa.Integer(), nullable=False),
        sa.Column("side_to_move", sa.String(1), nullable=False),
        sa.Column("fen", sa.Text(), nullable=False),
        sa.Column("result", sa.String(8), nullable=True),
        sa.Column("end_reason", sa.String(32), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("started_at", sa.DateTime(), nullable=True),
        sa.Column("ended_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index("idx_games_creator_account_id", "games", ["creator_account_id"])
    op.create_index("idx_games_white_account_id", "games", ["white_account_id"])
    op.create_index("idx_games_black_account_id", "games", ["black_account_id"])
    op.create_index("idx_games_status", "games", ["status"])

    # Create game_moves table
    op.create_table(
        "game_moves",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("game_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("ply", sa.Integer(), nullable=False),
        sa.Column("move_number", sa.Integer(), nullable=False),
        sa.Column("color", sa.String(1), nullable=False),
        sa.Column("from_square", sa.String(2), nullable=False),
        sa.Column("to_square", sa.String(2), nullable=False),
        sa.Column("promotion", sa.String(1), nullable=True),
        sa.Column("san", sa.String(16), nullable=False),
        sa.Column("fen_after", sa.Text(), nullable=False),
        sa.Column("played_at", sa.DateTime(), nullable=False),
        sa.Column("elapsed_ms", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["game_id"], ["games.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index("idx_game_moves_game_id", "game_moves", ["game_id"])


def downgrade() -> None:
    """Drop schema."""
    op.drop_index("idx_game_moves_game_id", table_name="game_moves")
    op.drop_table("game_moves")

    op.drop_index("idx_games_status", table_name="games")
    op.drop_index("idx_games_black_account_id", table_name="games")
    op.drop_index("idx_games_white_account_id", table_name="games")
    op.drop_index("idx_games_creator_account_id", table_name="games")
    op.drop_table("games")
