"""Add proposing status and proposal metadata to tickets"""
from alembic import op
import sqlalchemy as sa


revision = "004_ticket_proposals"
down_revision = "003_ticket_preferences"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TYPE match_ticket_status ADD VALUE IF NOT EXISTS 'proposing'")

    op.add_column("match_tickets", sa.Column("proposal_id", sa.String(length=64), nullable=True))
    op.add_column(
        "match_tickets",
        sa.Column("proposal_timeout_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "match_tickets", sa.Column("leader_player_id", sa.String(length=50), nullable=True)
    )
    op.create_index(
        "ix_match_tickets_proposal_id", "match_tickets", ["proposal_id"], unique=False
    )


def downgrade() -> None:
    op.drop_index("ix_match_tickets_proposal_id", table_name="match_tickets")
    op.drop_column("match_tickets", "leader_player_id")
    op.drop_column("match_tickets", "proposal_timeout_at")
    op.drop_column("match_tickets", "proposal_id")
