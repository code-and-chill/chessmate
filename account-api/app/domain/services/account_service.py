from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4

from app.core.exceptions import (
    AccountAlreadyExistsError,
    AccountNotFoundError,
    InvalidUsernameError,
)
from app.domain.models.account import (
    Account,
    AccountMedia,
    AccountPreferences,
    AccountPrivacySettings,
    AccountProfileDetails,
    AccountSocialCounters,
    AnimationLevel,
    DefaultTimeControl,
    PrivacyLevel,
    TitleCode,
)
from app.domain.repositories.account_repository import (
    AccountRepositoryInterface,
    MediaRepositoryInterface,
    PreferencesRepositoryInterface,
    PrivacySettingsRepositoryInterface,
    ProfileDetailsRepositoryInterface,
    SocialCountersRepositoryInterface,
)


class AccountService:
    """Account domain service."""

    def __init__(
        self,
        account_repository: AccountRepositoryInterface,
        profile_details_repository: ProfileDetailsRepositoryInterface,
        media_repository: MediaRepositoryInterface,
        preferences_repository: PreferencesRepositoryInterface,
        privacy_settings_repository: PrivacySettingsRepositoryInterface,
        social_counters_repository: SocialCountersRepositoryInterface,
    ):
        self.account_repository = account_repository
        self.profile_details_repository = profile_details_repository
        self.media_repository = media_repository
        self.preferences_repository = preferences_repository
        self.privacy_settings_repository = privacy_settings_repository
        self.social_counters_repository = social_counters_repository

    async def create_account(
        self,
        auth_user_id: UUID,
        username: str,
        display_name: str,
        country_code: Optional[str] = None,
        language_code: Optional[str] = None,
        time_zone: Optional[str] = None,
    ) -> Account:
        """Create new account with all related entities."""
        # Validate username
        self._validate_username(username)

        # Check if account already exists
        existing_account = await self.account_repository.get_by_username(username)
        if existing_account:
            raise AccountAlreadyExistsError(f"Username '{username}' already exists")

        existing_by_auth = await self.account_repository.get_by_auth_user_id(auth_user_id)
        if existing_by_auth:
            raise AccountAlreadyExistsError(f"Account for auth_user_id already exists")

        # Create account
        now = datetime.now(timezone.utc)
        account_id = uuid4()
        account = Account(
            id=account_id,
            auth_user_id=auth_user_id,
            username=username,
            display_name=display_name,
            country_code=country_code,
            language_code=language_code,
            time_zone=time_zone,
            is_active=True,
            is_banned=False,
            is_kid_account=False,
            is_titled_player=False,
            member_since=now,
            last_seen_at=None,
            created_at=now,
            updated_at=now,
        )

        created_account = await self.account_repository.create(account)

        # Create related entities with defaults
        await self._create_default_profile_details(account_id, now)
        await self._create_default_media(account_id, now)
        await self._create_default_preferences(account_id, now)
        await self._create_default_privacy_settings(account_id, now)
        await self._create_default_social_counters(account_id, now)

        return created_account

    async def get_account_by_id(self, account_id: UUID) -> Account:
        """Get account by ID."""
        account = await self.account_repository.get_by_id(account_id)
        if not account:
            raise AccountNotFoundError(f"Account {account_id} not found")
        return account

    async def get_account_by_username(self, username: str) -> Account:
        """Get account by username."""
        account = await self.account_repository.get_by_username(username)
        if not account:
            raise AccountNotFoundError(f"Account with username '{username}' not found")
        return account

    async def get_account_by_auth_user_id(self, auth_user_id: UUID) -> Account:
        """Get account by auth user ID."""
        account = await self.account_repository.get_by_auth_user_id(auth_user_id)
        if not account:
            raise AccountNotFoundError(f"Account for auth_user_id {auth_user_id} not found")
        return account

    async def update_account(
        self,
        account_id: UUID,
        display_name: Optional[str] = None,
        country_code: Optional[str] = None,
        language_code: Optional[str] = None,
        time_zone: Optional[str] = None,
    ) -> Account:
        """Update account basic information."""
        account = await self.get_account_by_id(account_id)

        if display_name:
            account.display_name = display_name
        if country_code is not None:
            account.country_code = country_code
        if language_code is not None:
            account.language_code = language_code
        if time_zone is not None:
            account.time_zone = time_zone

        account.updated_at = datetime.now(timezone.utc)

        return await self.account_repository.update(account)

    async def update_profile_details(
        self,
        account_id: UUID,
        bio: Optional[str] = None,
        location_text: Optional[str] = None,
        website_url: Optional[str] = None,
        youtube_url: Optional[str] = None,
        twitch_url: Optional[str] = None,
        twitter_url: Optional[str] = None,
        other_link_url: Optional[str] = None,
        favorite_players: Optional[str] = None,
        favorite_openings: Optional[str] = None,
    ) -> AccountProfileDetails:
        """Update account profile details."""
        # Ensure account exists
        await self.get_account_by_id(account_id)

        profile_details = await self.profile_details_repository.get_by_account_id(account_id)
        if not profile_details:
            raise AccountNotFoundError(f"Profile details for account {account_id} not found")

        if bio is not None:
            profile_details.bio = bio
        if location_text is not None:
            profile_details.location_text = location_text
        if website_url is not None:
            profile_details.website_url = website_url
        if youtube_url is not None:
            profile_details.youtube_url = youtube_url
        if twitch_url is not None:
            profile_details.twitch_url = twitch_url
        if twitter_url is not None:
            profile_details.twitter_url = twitter_url
        if other_link_url is not None:
            profile_details.other_link_url = other_link_url
        if favorite_players is not None:
            profile_details.favorite_players = favorite_players
        if favorite_openings is not None:
            profile_details.favorite_openings = favorite_openings

        profile_details.updated_at = datetime.now(timezone.utc)

        return await self.profile_details_repository.update(profile_details)

    async def update_preferences(
        self,
        account_id: UUID,
        board_theme: Optional[str] = None,
        piece_set: Optional[str] = None,
        sound_enabled: Optional[bool] = None,
        animation_level: Optional[AnimationLevel] = None,
        highlight_legal_moves: Optional[bool] = None,
        show_coordinates: Optional[bool] = None,
        confirm_moves: Optional[bool] = None,
        default_time_control: Optional[DefaultTimeControl] = None,
        auto_queen_promotion: Optional[bool] = None,
    ) -> AccountPreferences:
        """Update account preferences."""
        # Ensure account exists
        await self.get_account_by_id(account_id)

        preferences = await self.preferences_repository.get_by_account_id(account_id)
        if not preferences:
            raise AccountNotFoundError(f"Preferences for account {account_id} not found")

        if board_theme is not None:
            preferences.board_theme = board_theme
        if piece_set is not None:
            preferences.piece_set = piece_set
        if sound_enabled is not None:
            preferences.sound_enabled = sound_enabled
        if animation_level is not None:
            preferences.animation_level = animation_level
        if highlight_legal_moves is not None:
            preferences.highlight_legal_moves = highlight_legal_moves
        if show_coordinates is not None:
            preferences.show_coordinates = show_coordinates
        if confirm_moves is not None:
            preferences.confirm_moves = confirm_moves
        if default_time_control is not None:
            preferences.default_time_control = default_time_control
        if auto_queen_promotion is not None:
            preferences.auto_queen_promotion = auto_queen_promotion

        preferences.updated_at = datetime.now(timezone.utc)

        return await self.preferences_repository.update(preferences)

    async def update_privacy_settings(
        self,
        account_id: UUID,
        show_ratings: Optional[bool] = None,
        show_online_status: Optional[bool] = None,
        show_game_archive: Optional[bool] = None,
        allow_friend_requests: Optional[PrivacyLevel] = None,
        allow_messages_from: Optional[PrivacyLevel] = None,
        allow_challenges_from: Optional[PrivacyLevel] = None,
        is_profile_public: Optional[bool] = None,
    ) -> AccountPrivacySettings:
        """Update account privacy settings."""
        # Ensure account exists
        await self.get_account_by_id(account_id)

        privacy_settings = await self.privacy_settings_repository.get_by_account_id(account_id)
        if not privacy_settings:
            raise AccountNotFoundError(f"Privacy settings for account {account_id} not found")

        if show_ratings is not None:
            privacy_settings.show_ratings = show_ratings
        if show_online_status is not None:
            privacy_settings.show_online_status = show_online_status
        if show_game_archive is not None:
            privacy_settings.show_game_archive = show_game_archive
        if allow_friend_requests is not None:
            privacy_settings.allow_friend_requests = allow_friend_requests
        if allow_messages_from is not None:
            privacy_settings.allow_messages_from = allow_messages_from
        if allow_challenges_from is not None:
            privacy_settings.allow_challenges_from = allow_challenges_from
        if is_profile_public is not None:
            privacy_settings.is_profile_public = is_profile_public

        privacy_settings.updated_at = datetime.now(timezone.utc)

        return await self.privacy_settings_repository.update(privacy_settings)

    async def ban_account(self, account_id: UUID) -> Account:
        """Ban an account."""
        return await self.account_repository.ban(account_id)

    async def unban_account(self, account_id: UUID) -> Account:
        """Unban an account."""
        return await self.account_repository.unban(account_id)

    async def deactivate_account(self, account_id: UUID) -> Account:
        """Deactivate an account."""
        return await self.account_repository.deactivate(account_id)

    async def get_full_account(self, account_id: UUID) -> dict:
        """Get full account data with all related entities."""
        account = await self.get_account_by_id(account_id)
        profile_details = await self.profile_details_repository.get_by_account_id(account_id)
        media = await self.media_repository.get_by_account_id(account_id)
        preferences = await self.preferences_repository.get_by_account_id(account_id)
        privacy_settings = await self.privacy_settings_repository.get_by_account_id(account_id)
        social_counters = await self.social_counters_repository.get_by_account_id(account_id)

        return {
            "account": account,
            "profile_details": profile_details,
            "media": media,
            "preferences": preferences,
            "privacy_settings": privacy_settings,
            "social_counters": social_counters,
        }

    async def get_public_profile(self, username: str) -> dict:
        """Get public profile (respecting privacy settings)."""
        account = await self.get_account_by_username(username)

        # Check if profile is public
        privacy_settings = await self.privacy_settings_repository.get_by_account_id(account.id)
        if privacy_settings and not privacy_settings.is_profile_public:
            raise AccountNotFoundError(f"Profile for '{username}' is not public")

        profile_details = await self.profile_details_repository.get_by_account_id(account.id)
        media = await self.media_repository.get_by_account_id(account.id)
        social_counters = await self.social_counters_repository.get_by_account_id(account.id)

        return {
            "account": account,
            "profile_details": profile_details,
            "media": media,
            "social_counters": social_counters,
        }

    def _validate_username(self, username: str) -> None:
        """Validate username format."""
        if not username or len(username) < 3 or len(username) > 32:
            raise InvalidUsernameError("Username must be between 3 and 32 characters")

        if not all(c.isalnum() or c in "_-" for c in username):
            raise InvalidUsernameError("Username can only contain letters, numbers, _, and -")

    async def _create_default_profile_details(self, account_id: UUID, now: datetime) -> None:
        """Create default profile details."""
        profile_details = AccountProfileDetails(
            account_id=account_id,
            bio=None,
            location_text=None,
            website_url=None,
            youtube_url=None,
            twitch_url=None,
            twitter_url=None,
            other_link_url=None,
            favorite_players=None,
            favorite_openings=None,
            created_at=now,
            updated_at=now,
        )
        await self.profile_details_repository.create(profile_details)

    async def _create_default_media(self, account_id: UUID, now: datetime) -> None:
        """Create default media."""
        media = AccountMedia(
            account_id=account_id,
            avatar_file_id=None,
            banner_file_id=None,
            avatar_version=1,
            created_at=now,
            updated_at=now,
        )
        await self.media_repository.create(media)

    async def _create_default_preferences(self, account_id: UUID, now: datetime) -> None:
        """Create default preferences."""
        preferences = AccountPreferences(
            account_id=account_id,
            board_theme="classic",
            piece_set="classic",
            sound_enabled=True,
            animation_level=AnimationLevel.FULL,
            highlight_legal_moves=True,
            show_coordinates=True,
            confirm_moves=False,
            default_time_control=DefaultTimeControl.BLITZ,
            auto_queen_promotion=True,
            created_at=now,
            updated_at=now,
        )
        await self.preferences_repository.create(preferences)

    async def _create_default_privacy_settings(self, account_id: UUID, now: datetime) -> None:
        """Create default privacy settings."""
        privacy_settings = AccountPrivacySettings(
            account_id=account_id,
            show_ratings=True,
            show_online_status=True,
            show_game_archive=True,
            allow_friend_requests=PrivacyLevel.EVERYONE,
            allow_messages_from=PrivacyLevel.EVERYONE,
            allow_challenges_from=PrivacyLevel.EVERYONE,
            is_profile_public=True,
            created_at=now,
            updated_at=now,
        )
        await self.privacy_settings_repository.create(privacy_settings)

    async def _create_default_social_counters(self, account_id: UUID, now: datetime) -> None:
        """Create default social counters."""
        social_counters = AccountSocialCounters(
            account_id=account_id,
            followers_count=0,
            following_count=0,
            friends_count=0,
            clubs_count=0,
            total_games_played=0,
            total_puzzles_solved=0,
            last_game_at=None,
            last_puzzle_at=None,
            updated_at=now,
        )
        await self.social_counters_repository.create(social_counters)
