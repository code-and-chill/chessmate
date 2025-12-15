"""Add match tickets and player linkage tables."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "002_match_tickets"
down_revision = "001_initial"
branch_labels = None
depends_on = None


match_ticket_status_enum = sa.Enum(
    "queued",
    "searching",
    "matched",
    "cancelled",
    "expired",
    name="match_ticket_status",
)

match_ticket_type_enum = sa.Enum("solo", "party", name="match_ticket_type")


def upgrade() -> None:
    """Upgrade database schema with match ticket tables."""
    bind = op.get_bind()
    match_ticket_status_enum.create(bind, checkfirst=True)
    match_ticket_type_enum.create(bind, checkfirst=True)

    op.create_table(
        "match_tickets",
        sa.Column("ticket_id", sa.String(length=64), nullable=False),
        sa.Column("enqueue_key", sa.String(length=100), nullable=False),
        sa.Column("idempotency_key", sa.String(length=100), nullable=False),
        sa.Column("pool_key", sa.String(length=100), nullable=False),
        sa.Column(
            "status",
            match_ticket_status_enum,
            nullable=False,
            server_default=sa.text("'queued'::match_ticket_status"),
        ),
        sa.Column(
            "type",
            match_ticket_type_enum,
            nullable=False,
            server_default=sa.text("'solo'::match_ticket_type"),
        ),
        sa.Column("search_params", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("widening_config", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("constraints", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("last_heartbeat_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("heartbeat_timeout_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("ticket_id"),
        sa.UniqueConstraint("idempotency_key", name="uq_match_tickets_idempotency_key"),
    )
    op.create_index(
        "ix_match_tickets_pool_status",
        "match_tickets",
        ["pool_key", "status"],
    )

    op.create_table(
        "match_ticket_players",
        sa.Column("match_ticket_player_id", sa.String(length=64), nullable=False),
        sa.Column("ticket_id", sa.String(length=64), nullable=False),
        sa.Column("player_id", sa.String(length=50), nullable=False),
        sa.Column("mmr", sa.Integer(), nullable=False),
        sa.Column("rd", sa.Float(), nullable=False),
        sa.Column("latency_preferences", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("preferred_platform", sa.String(length=50), nullable=True),
        sa.Column("input_type", sa.String(length=50), nullable=True),
        sa.Column("risk_profile", sa.String(length=50), nullable=True),
        sa.Column(
            "status",
            match_ticket_status_enum,
            nullable=False,
            server_default=sa.text("'queued'::match_ticket_status"),
        ),
        sa.Column("pool_key", sa.String(length=100), nullable=False),
        sa.Column("enqueue_key", sa.String(length=100), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["ticket_id"], ["match_tickets.ticket_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("match_ticket_player_id"),
        sa.UniqueConstraint(
            "enqueue_key",
            "player_id",
            "pool_key",
            name="uq_match_ticket_players_enqueue_player_pool",
        ),
    )
    op.create_index(
        "ix_match_ticket_players_active_player",
        "match_ticket_players",
        ["player_id"],
        unique=False,
        postgresql_where=sa.text("status IN ('queued','searching')"),
    )
    op.create_index(
        "ix_match_ticket_players_ticket_id",
        "match_ticket_players",
        ["ticket_id"],
    )


def downgrade() -> None:
    """Downgrade database schema."""
    op.drop_index("ix_match_ticket_players_ticket_id", table_name="match_ticket_players")
    op.drop_index(
        "ix_match_ticket_players_active_player", table_name="match_ticket_players"
    )
    op.drop_table("match_ticket_players")
    op.drop_index("ix_match_tickets_pool_status", table_name="match_tickets")
    op.drop_table("match_tickets")

    bind = op.get_bind()
    match_ticket_type_enum.drop(bind, checkfirst=True)
    match_ticket_status_enum.drop(bind, checkfirst=True)
