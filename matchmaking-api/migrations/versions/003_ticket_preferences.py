"""Add soft constraints and widening stage fields"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "003_ticket_preferences"
down_revision = "002_match_tickets"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "match_tickets",
        sa.Column(
            "soft_constraints",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
    )
    op.add_column(
        "match_tickets",
        sa.Column("mutation_seq", sa.Integer(), nullable=False, server_default=sa.text("0")),
    )
    op.add_column(
        "match_tickets",
        sa.Column("widening_stage", sa.Integer(), nullable=False, server_default=sa.text("0")),
    )


def downgrade() -> None:
    op.drop_column("match_tickets", "widening_stage")
    op.drop_column("match_tickets", "mutation_seq")
    op.drop_column("match_tickets", "soft_constraints")
