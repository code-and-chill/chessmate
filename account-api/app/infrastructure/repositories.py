from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.models.account import (
    Account,
    AccountMedia,
    AccountPreferences,
    AccountPrivacySettings,
    AccountProfileDetails,
    AccountSocialCounters,
)
from app.domain.repositories.account_repository import (
    AccountRepositoryInterface,
    MediaRepositoryInterface,
    PreferencesRepositoryInterface,
    PrivacySettingsRepositoryInterface,
    ProfileDetailsRepositoryInterface,
    SocialCountersRepositoryInterface,
)
from app.infrastructure.database.models import (
    AccountMediaORM,
    AccountORM,
    AccountPreferencesORM,
    AccountPrivacySettingsORM,
    AccountProfileDetailsORM,
    AccountSocialCountersORM,
)


class AccountRepository(AccountRepositoryInterface):
    """SQLAlchemy account repository implementation."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, account: Account) -> Account:
        """Create new account."""
        orm_obj = AccountORM(
            id=account.id,
            auth_user_id=account.auth_user_id,
            username=account.username,
            display_name=account.display_name,
            title_code=account.title_code.value if account.title_code else None,
            country_code=account.country_code,
            time_zone=account.time_zone,
            language_code=account.language_code,
            is_active=account.is_active,
            is_banned=account.is_banned,
            is_kid_account=account.is_kid_account,
            is_titled_player=account.is_titled_player,
            member_since=account.member_since,
            last_seen_at=account.last_seen_at,
            created_at=account.created_at,
            updated_at=account.updated_at,
        )
        self.session.add(orm_obj)
        await self.session.flush()
        return self._orm_to_domain(orm_obj)

    async def get_by_id(self, account_id: UUID) -> Optional[Account]:
        """Get account by ID."""
        stmt = select(AccountORM).where(AccountORM.id == account_id)
        result = await self.session.execute(stmt)
        orm_obj = result.scalars().first()
        return self._orm_to_domain(orm_obj) if orm_obj else None

    async def get_by_username(self, username: str) -> Optional[Account]:
        """Get account by username."""
        stmt = select(AccountORM).where(AccountORM.username == username)
        result = await self.session.execute(stmt)
        orm_obj = result.scalars().first()
        return self._orm_to_domain(orm_obj) if orm_obj else None

    async def get_by_auth_user_id(self, auth_user_id: UUID) -> Optional[Account]:
        """Get account by auth user ID."""
        stmt = select(AccountORM).where(AccountORM.auth_user_id == auth_user_id)
        result = await self.session.execute(stmt)
        orm_obj = result.scalars().first()
        return self._orm_to_domain(orm_obj) if orm_obj else None

    async def update(self, account: Account) -> Account:
        """Update account."""
        stmt = select(AccountORM).where(AccountORM.id == account.id)
        result = await self.session.execute(stmt)
        orm_obj = result.scalars().one()

        orm_obj.display_name = account.display_name
        orm_obj.title_code = account.title_code.value if account.title_code else None
        orm_obj.country_code = account.country_code
        orm_obj.time_zone = account.time_zone
        orm_obj.language_code = account.language_code
        orm_obj.is_active = account.is_active
        orm_obj.is_banned = account.is_banned
        orm_obj.is_kid_account = account.is_kid_account
        orm_obj.is_titled_player = account.is_titled_player
        orm_obj.last_seen_at = account.last_seen_at
        orm_obj.updated_at = account.updated_at

        await self.session.flush()
        return self._orm_to_domain(orm_obj)

    async def ban(self, account_id: UUID) -> Account:
        """Ban account."""
        stmt = select(AccountORM).where(AccountORM.id == account_id)
        result = await self.session.execute(stmt)
        orm_obj = result.scalars().one()

        orm_obj.is_banned = True
        orm_obj.updated_at = Account.model_fields["updated_at"].default_factory()
        await self.session.flush()
        return self._orm_to_domain(orm_obj)

    async def unban(self, account_id: UUID) -> Account:
        """Unban account."""
        stmt = select(AccountORM).where(AccountORM.id == account_id)
        result = await self.session.execute(stmt)
        orm_obj = result.scalars().one()

        orm_obj.is_banned = False
        orm_obj.updated_at = Account.model_fields["updated_at"].default_factory()
        await self.session.flush()
        return self._orm_to_domain(orm_obj)

    async def deactivate(self, account_id: UUID) -> Account:
        """Deactivate account."""
        stmt = select(AccountORM).where(AccountORM.id == account_id)
        result = await self.session.execute(stmt)
        orm_obj = result.scalars().one()

        orm_obj.is_active = False
        orm_obj.updated_at = Account.model_fields["updated_at"].default_factory()
        await self.session.flush()
        return self._orm_to_domain(orm_obj)

    def _orm_to_domain(self, orm_obj: AccountORM) -> Account:
        """Convert ORM object to domain model."""
        from app.domain.models.account import TitleCode

        return Account(
            id=orm_obj.id,
            auth_user_id=orm_obj.auth_user_id,
            username=orm_obj.username,
            display_name=orm_obj.display_name,
            title_code=TitleCode(orm_obj.title_code) if orm_obj.title_code else None,
            country_code=orm_obj.country_code,
            time_zone=orm_obj.time_zone,
            language_code=orm_obj.language_code,
            is_active=orm_obj.is_active,
            is_banned=orm_obj.is_banned,
            is_kid_account=orm_obj.is_kid_account,
            is_titled_player=orm_obj.is_titled_player,
            member_since=orm_obj.member_since,
            last_seen_at=orm_obj.last_seen_at,
            created_at=orm_obj.created_at,
            updated_at=orm_obj.updated_at,
        )


class ProfileDetailsRepository(ProfileDetailsRepositoryInterface):
    """SQLAlchemy profile details repository implementation."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, profile_details: AccountProfileDetails) -> AccountProfileDetails:
        """Create profile details."""
        orm_obj = AccountProfileDetailsORM(
            account_id=profile_details.account_id,
            bio=profile_details.bio,
            location_text=profile_details.location_text,
            website_url=profile_details.website_url,
            youtube_url=profile_details.youtube_url,
            twitch_url=profile_details.twitch_url,
            twitter_url=profile_details.twitter_url,
            other_link_url=profile_details.other_link_url,
            favorite_players=profile_details.favorite_players,
            favorite_openings=profile_details.favorite_openings,
            created_at=profile_details.created_at,
            updated_at=profile_details.updated_at,
        )
        self.session.add(orm_obj)
        await self.session.flush()
        return self._orm_to_domain(orm_obj)

    async def get_by_account_id(self, account_id: UUID) -> Optional[AccountProfileDetails]:
        """Get profile details by account ID."""
        stmt = select(AccountProfileDetailsORM).where(
            AccountProfileDetailsORM.account_id == account_id
        )
        result = await self.session.execute(stmt)
        orm_obj = result.scalars().first()
        return self._orm_to_domain(orm_obj) if orm_obj else None

    async def update(self, profile_details: AccountProfileDetails) -> AccountProfileDetails:
        """Update profile details."""
        stmt = select(AccountProfileDetailsORM).where(
            AccountProfileDetailsORM.account_id == profile_details.account_id
        )
        result = await self.session.execute(stmt)
        orm_obj = result.scalars().one()

        orm_obj.bio = profile_details.bio
        orm_obj.location_text = profile_details.location_text
        orm_obj.website_url = profile_details.website_url
        orm_obj.youtube_url = profile_details.youtube_url
        orm_obj.twitch_url = profile_details.twitch_url
        orm_obj.twitter_url = profile_details.twitter_url
        orm_obj.other_link_url = profile_details.other_link_url
        orm_obj.favorite_players = profile_details.favorite_players
        orm_obj.favorite_openings = profile_details.favorite_openings
        orm_obj.updated_at = profile_details.updated_at

        await self.session.flush()
        return self._orm_to_domain(orm_obj)

    def _orm_to_domain(self, orm_obj: AccountProfileDetailsORM) -> AccountProfileDetails:
        """Convert ORM object to domain model."""
        return AccountProfileDetails(
            account_id=orm_obj.account_id,
            bio=orm_obj.bio,
            location_text=orm_obj.location_text,
            website_url=orm_obj.website_url,
            youtube_url=orm_obj.youtube_url,
            twitch_url=orm_obj.twitch_url,
            twitter_url=orm_obj.twitter_url,
            other_link_url=orm_obj.other_link_url,
            favorite_players=orm_obj.favorite_players,
            favorite_openings=orm_obj.favorite_openings,
            created_at=orm_obj.created_at,
            updated_at=orm_obj.updated_at,
        )


class MediaRepository(MediaRepositoryInterface):
    """SQLAlchemy media repository implementation."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, media: AccountMedia) -> AccountMedia:
        """Create media record."""
        orm_obj = AccountMediaORM(
            account_id=media.account_id,
            avatar_file_id=media.avatar_file_id,
            banner_file_id=media.banner_file_id,
            avatar_version=media.avatar_version,
            created_at=media.created_at,
            updated_at=media.updated_at,
        )
        self.session.add(orm_obj)
        await self.session.flush()
        return self._orm_to_domain(orm_obj)

    async def get_by_account_id(self, account_id: UUID) -> Optional[AccountMedia]:
        """Get media by account ID."""
        stmt = select(AccountMediaORM).where(AccountMediaORM.account_id == account_id)
        result = await self.session.execute(stmt)
        orm_obj = result.scalars().first()
        return self._orm_to_domain(orm_obj) if orm_obj else None

    async def update(self, media: AccountMedia) -> AccountMedia:
        """Update media."""
        stmt = select(AccountMediaORM).where(AccountMediaORM.account_id == media.account_id)
        result = await self.session.execute(stmt)
        orm_obj = result.scalars().one()

        orm_obj.avatar_file_id = media.avatar_file_id
        orm_obj.banner_file_id = media.banner_file_id
        orm_obj.avatar_version = media.avatar_version
        orm_obj.updated_at = media.updated_at

        await self.session.flush()
        return self._orm_to_domain(orm_obj)

    def _orm_to_domain(self, orm_obj: AccountMediaORM) -> AccountMedia:
        """Convert ORM object to domain model."""
        return AccountMedia(
            account_id=orm_obj.account_id,
            avatar_file_id=orm_obj.avatar_file_id,
            banner_file_id=orm_obj.banner_file_id,
            avatar_version=orm_obj.avatar_version,
            created_at=orm_obj.created_at,
            updated_at=orm_obj.updated_at,
        )


class PreferencesRepository(PreferencesRepositoryInterface):
    """SQLAlchemy preferences repository implementation."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, preferences: AccountPreferences) -> AccountPreferences:
        """Create preferences."""
        orm_obj = AccountPreferencesORM(
            account_id=preferences.account_id,
            board_theme=preferences.board_theme,
            piece_set=preferences.piece_set,
            sound_enabled=preferences.sound_enabled,
            animation_level=preferences.animation_level.value,
            highlight_legal_moves=preferences.highlight_legal_moves,
            show_coordinates=preferences.show_coordinates,
            confirm_moves=preferences.confirm_moves,
            default_time_control=preferences.default_time_control.value,
            auto_queen_promotion=preferences.auto_queen_promotion,
            created_at=preferences.created_at,
            updated_at=preferences.updated_at,
        )
        self.session.add(orm_obj)
        await self.session.flush()
        return self._orm_to_domain(orm_obj)

    async def get_by_account_id(self, account_id: UUID) -> Optional[AccountPreferences]:
        """Get preferences by account ID."""
        stmt = select(AccountPreferencesORM).where(
            AccountPreferencesORM.account_id == account_id
        )
        result = await self.session.execute(stmt)
        orm_obj = result.scalars().first()
        return self._orm_to_domain(orm_obj) if orm_obj else None

    async def update(self, preferences: AccountPreferences) -> AccountPreferences:
        """Update preferences."""
        stmt = select(AccountPreferencesORM).where(
            AccountPreferencesORM.account_id == preferences.account_id
        )
        result = await self.session.execute(stmt)
        orm_obj = result.scalars().one()

        orm_obj.board_theme = preferences.board_theme
        orm_obj.piece_set = preferences.piece_set
        orm_obj.sound_enabled = preferences.sound_enabled
        orm_obj.animation_level = preferences.animation_level.value
        orm_obj.highlight_legal_moves = preferences.highlight_legal_moves
        orm_obj.show_coordinates = preferences.show_coordinates
        orm_obj.confirm_moves = preferences.confirm_moves
        orm_obj.default_time_control = preferences.default_time_control.value
        orm_obj.auto_queen_promotion = preferences.auto_queen_promotion
        orm_obj.updated_at = preferences.updated_at

        await self.session.flush()
        return self._orm_to_domain(orm_obj)

    def _orm_to_domain(self, orm_obj: AccountPreferencesORM) -> AccountPreferences:
        """Convert ORM object to domain model."""
        from app.domain.models.account import AnimationLevel, DefaultTimeControl

        return AccountPreferences(
            account_id=orm_obj.account_id,
            board_theme=orm_obj.board_theme,
            piece_set=orm_obj.piece_set,
            sound_enabled=orm_obj.sound_enabled,
            animation_level=AnimationLevel(orm_obj.animation_level),
            highlight_legal_moves=orm_obj.highlight_legal_moves,
            show_coordinates=orm_obj.show_coordinates,
            confirm_moves=orm_obj.confirm_moves,
            default_time_control=DefaultTimeControl(orm_obj.default_time_control),
            auto_queen_promotion=orm_obj.auto_queen_promotion,
            created_at=orm_obj.created_at,
            updated_at=orm_obj.updated_at,
        )


class PrivacySettingsRepository(PrivacySettingsRepositoryInterface):
    """SQLAlchemy privacy settings repository implementation."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(
        self, privacy_settings: AccountPrivacySettings
    ) -> AccountPrivacySettings:
        """Create privacy settings."""
        orm_obj = AccountPrivacySettingsORM(
            account_id=privacy_settings.account_id,
            show_ratings=privacy_settings.show_ratings,
            show_online_status=privacy_settings.show_online_status,
            show_game_archive=privacy_settings.show_game_archive,
            allow_friend_requests=privacy_settings.allow_friend_requests.value,
            allow_messages_from=privacy_settings.allow_messages_from.value,
            allow_challenges_from=privacy_settings.allow_challenges_from.value,
            is_profile_public=privacy_settings.is_profile_public,
            created_at=privacy_settings.created_at,
            updated_at=privacy_settings.updated_at,
        )
        self.session.add(orm_obj)
        await self.session.flush()
        return self._orm_to_domain(orm_obj)

    async def get_by_account_id(self, account_id: UUID) -> Optional[AccountPrivacySettings]:
        """Get privacy settings by account ID."""
        stmt = select(AccountPrivacySettingsORM).where(
            AccountPrivacySettingsORM.account_id == account_id
        )
        result = await self.session.execute(stmt)
        orm_obj = result.scalars().first()
        return self._orm_to_domain(orm_obj) if orm_obj else None

    async def update(
        self, privacy_settings: AccountPrivacySettings
    ) -> AccountPrivacySettings:
        """Update privacy settings."""
        stmt = select(AccountPrivacySettingsORM).where(
            AccountPrivacySettingsORM.account_id == privacy_settings.account_id
        )
        result = await self.session.execute(stmt)
        orm_obj = result.scalars().one()

        orm_obj.show_ratings = privacy_settings.show_ratings
        orm_obj.show_online_status = privacy_settings.show_online_status
        orm_obj.show_game_archive = privacy_settings.show_game_archive
        orm_obj.allow_friend_requests = privacy_settings.allow_friend_requests.value
        orm_obj.allow_messages_from = privacy_settings.allow_messages_from.value
        orm_obj.allow_challenges_from = privacy_settings.allow_challenges_from.value
        orm_obj.is_profile_public = privacy_settings.is_profile_public
        orm_obj.updated_at = privacy_settings.updated_at

        await self.session.flush()
        return self._orm_to_domain(orm_obj)

    def _orm_to_domain(
        self, orm_obj: AccountPrivacySettingsORM
    ) -> AccountPrivacySettings:
        """Convert ORM object to domain model."""
        from app.domain.models.account import PrivacyLevel

        return AccountPrivacySettings(
            account_id=orm_obj.account_id,
            show_ratings=orm_obj.show_ratings,
            show_online_status=orm_obj.show_online_status,
            show_game_archive=orm_obj.show_game_archive,
            allow_friend_requests=PrivacyLevel(orm_obj.allow_friend_requests),
            allow_messages_from=PrivacyLevel(orm_obj.allow_messages_from),
            allow_challenges_from=PrivacyLevel(orm_obj.allow_challenges_from),
            is_profile_public=orm_obj.is_profile_public,
            created_at=orm_obj.created_at,
            updated_at=orm_obj.updated_at,
        )


class SocialCountersRepository(SocialCountersRepositoryInterface):
    """SQLAlchemy social counters repository implementation."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, counters: AccountSocialCounters) -> AccountSocialCounters:
        """Create social counters."""
        orm_obj = AccountSocialCountersORM(
            account_id=counters.account_id,
            followers_count=counters.followers_count,
            following_count=counters.following_count,
            friends_count=counters.friends_count,
            clubs_count=counters.clubs_count,
            total_games_played=counters.total_games_played,
            total_puzzles_solved=counters.total_puzzles_solved,
            last_game_at=counters.last_game_at,
            last_puzzle_at=counters.last_puzzle_at,
            updated_at=counters.updated_at,
        )
        self.session.add(orm_obj)
        await self.session.flush()
        return self._orm_to_domain(orm_obj)

    async def get_by_account_id(self, account_id: UUID) -> Optional[AccountSocialCounters]:
        """Get social counters by account ID."""
        stmt = select(AccountSocialCountersORM).where(
            AccountSocialCountersORM.account_id == account_id
        )
        result = await self.session.execute(stmt)
        orm_obj = result.scalars().first()
        return self._orm_to_domain(orm_obj) if orm_obj else None

    async def update(self, counters: AccountSocialCounters) -> AccountSocialCounters:
        """Update social counters."""
        stmt = select(AccountSocialCountersORM).where(
            AccountSocialCountersORM.account_id == counters.account_id
        )
        result = await self.session.execute(stmt)
        orm_obj = result.scalars().one()

        orm_obj.followers_count = counters.followers_count
        orm_obj.following_count = counters.following_count
        orm_obj.friends_count = counters.friends_count
        orm_obj.clubs_count = counters.clubs_count
        orm_obj.total_games_played = counters.total_games_played
        orm_obj.total_puzzles_solved = counters.total_puzzles_solved
        orm_obj.last_game_at = counters.last_game_at
        orm_obj.last_puzzle_at = counters.last_puzzle_at
        orm_obj.updated_at = counters.updated_at

        await self.session.flush()
        return self._orm_to_domain(orm_obj)

    def _orm_to_domain(self, orm_obj: AccountSocialCountersORM) -> AccountSocialCounters:
        """Convert ORM object to domain model."""
        return AccountSocialCounters(
            account_id=orm_obj.account_id,
            followers_count=orm_obj.followers_count,
            following_count=orm_obj.following_count,
            friends_count=orm_obj.friends_count,
            clubs_count=orm_obj.clubs_count,
            total_games_played=orm_obj.total_games_played,
            total_puzzles_solved=orm_obj.total_puzzles_solved,
            last_game_at=orm_obj.last_game_at,
            last_puzzle_at=orm_obj.last_puzzle_at,
            updated_at=orm_obj.updated_at,
        )
