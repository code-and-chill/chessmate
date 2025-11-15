"""Initial migration for matchmaking-api."""
from alembic import op
import sqlalchemy as sa


revision = "001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Upgrade database schema."""
    op.create_table(
        "match_records",
        sa.Column("match_id", sa.String(50), nullable=False),
        sa.Column("tenant_id", sa.String(50), nullable=False),
        sa.Column("game_id", sa.String(50), nullable=False),
        sa.Column("white_user_id", sa.String(50), nullable=False),
        sa.Column("black_user_id", sa.String(50), nullable=False),
        sa.Column("time_control", sa.String(20), nullable=False),
        sa.Column("mode", sa.String(20), nullable=False),
        sa.Column("variant", sa.String(50), nullable=False),
        sa.Column("rating_snapshot", sa.JSON(), nullable=True),
        sa.Column("queue_entry_ids", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("match_id"),
    )
    op.create_index("idx_match_records_tenant_game", "match_records", ["tenant_id", "game_id"])
    op.create_index("idx_match_records_game", "match_records", ["game_id"])

    op.create_table(
        "challenges",
        sa.Column("challenge_id", sa.String(50), nullable=False),
        sa.Column("tenant_id", sa.String(50), nullable=False),
        sa.Column("challenger_user_id", sa.String(50), nullable=False),
        sa.Column("opponent_user_id", sa.String(50), nullable=False),
        sa.Column("time_control", sa.String(20), nullable=False),
        sa.Column("mode", sa.String(20), nullable=False),
        sa.Column("variant", sa.String(50), nullable=False),
        sa.Column("preferred_color", sa.String(20), nullable=False),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("game_id", sa.String(50), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("challenge_id"),
    )
    op.create_index("idx_challenges_tenant_opponent", "challenges", ["tenant_id", "opponent_user_id"])


def downgrade() -> None:
    """Downgrade database schema."""
    op.drop_index("idx_challenges_tenant_opponent")
    op.drop_table("challenges")
    op.drop_index("idx_match_records_game")
    op.drop_index("idx_match_records_tenant_game")
    op.drop_table("match_records")
