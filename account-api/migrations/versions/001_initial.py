"""Initial migration - create account tables

Revision ID: 001_initial
Revises:
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Apply upgrade."""
    op.create_table(
        "accounts",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("auth_user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("username", sa.String(32), nullable=False),
        sa.Column("display_name", sa.String(64), nullable=False),
        sa.Column("title_code", sa.String(8), nullable=True),
        sa.Column("country_code", sa.String(2), nullable=True),
        sa.Column("time_zone", sa.String(64), nullable=True),
        sa.Column("language_code", sa.String(8), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("is_banned", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("is_kid_account", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("is_titled_player", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("member_since", sa.DateTime(timezone=True), nullable=False),
        sa.Column("last_seen_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("auth_user_id", name="uq_auth_user_id"),
        sa.UniqueConstraint("username", name="uq_username"),
    )
    op.create_index(op.f("ix_accounts_auth_user_id"), "accounts", ["auth_user_id"])
    op.create_index(op.f("ix_accounts_username"), "accounts", ["username"])

    op.create_table(
        "account_profile_details",
        sa.Column("account_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("location_text", sa.String(128), nullable=True),
        sa.Column("website_url", sa.String(255), nullable=True),
        sa.Column("youtube_url", sa.String(255), nullable=True),
        sa.Column("twitch_url", sa.String(255), nullable=True),
        sa.Column("twitter_url", sa.String(255), nullable=True),
        sa.Column("other_link_url", sa.String(255), nullable=True),
        sa.Column("favorite_players", sa.Text(), nullable=True),
        sa.Column("favorite_openings", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("account_id"),
    )

    op.create_table(
        "account_media",
        sa.Column("account_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("avatar_file_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("banner_file_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("avatar_version", sa.Integer(), nullable=False, server_default="1"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("account_id"),
    )

    op.create_table(
        "account_preferences",
        sa.Column("account_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("board_theme", sa.String(32), nullable=False, server_default="classic"),
        sa.Column("piece_set", sa.String(32), nullable=False, server_default="classic"),
        sa.Column("sound_enabled", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("animation_level", sa.String(16), nullable=False, server_default="full"),
        sa.Column("highlight_legal_moves", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("show_coordinates", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("confirm_moves", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("default_time_control", sa.String(16), nullable=False, server_default="blitz"),
        sa.Column("auto_queen_promotion", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("account_id"),
    )

    op.create_table(
        "account_privacy_settings",
        sa.Column("account_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("show_ratings", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("show_online_status", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("show_game_archive", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column(
            "allow_friend_requests",
            sa.String(16),
            nullable=False,
            server_default="everyone",
        ),
        sa.Column("allow_messages_from", sa.String(16), nullable=False, server_default="everyone"),
        sa.Column(
            "allow_challenges_from",
            sa.String(16),
            nullable=False,
            server_default="everyone",
        ),
        sa.Column("is_profile_public", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("account_id"),
    )

    op.create_table(
        "account_social_counters",
        sa.Column("account_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("followers_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("following_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("friends_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("clubs_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total_games_played", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total_puzzles_solved", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("last_game_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_puzzle_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("account_id"),
    )


def downgrade() -> None:
    """Apply downgrade."""
    op.drop_table("account_social_counters")
    op.drop_table("account_privacy_settings")
    op.drop_table("account_preferences")
    op.drop_table("account_media")
    op.drop_table("account_profile_details")
    op.drop_index(op.f("ix_accounts_username"), table_name="accounts")
    op.drop_index(op.f("ix_accounts_auth_user_id"), table_name="accounts")
    op.drop_table("accounts")
