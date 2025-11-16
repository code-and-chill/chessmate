from datetime import datetime, timezone
from uuid import uuid4

import pytest

from app.core.exceptions import (
    AccountAlreadyExistsError,
    AccountNotFoundError,
    InvalidUsernameError,
)
from app.domain.models.account_media import AccountMedia
from app.domain.models.account_model import Account
from app.domain.models.account_preferences import AccountPreferences
from app.domain.models.account_privacy_settings import AccountPrivacySettings
from app.domain.models.account_profile_details import AccountProfileDetails
from app.domain.models.account_social_counters import AccountSocialCounters
from app.domain.models.animation_level import AnimationLevel
from app.domain.models.default_time_control import DefaultTimeControl
from app.domain.models.privacy_level import PrivacyLevel
from app.domain.services.account_service import AccountService
from app.infrastructure.repositories import (
    AccountRepository,
    MediaRepository,
    PreferencesRepository,
    PrivacySettingsRepository,
    ProfileDetailsRepository,
    SocialCountersRepository,
)


class TestAccountService:
    """Test account service."""

    @pytest.mark.asyncio
    async def test_create_account(self, db_session):
        """Test creating an account."""
        account_repo = AccountRepository(db_session)
        profile_details_repo = ProfileDetailsRepository(db_session)
        media_repo = MediaRepository(db_session)
        preferences_repo = PreferencesRepository(db_session)
        privacy_settings_repo = PrivacySettingsRepository(db_session)
        social_counters_repo = SocialCountersRepository(db_session)

        service = AccountService(
            account_repository=account_repo,
            profile_details_repository=profile_details_repo,
            media_repository=media_repo,
            preferences_repository=preferences_repo,
            privacy_settings_repository=privacy_settings_repo,
            social_counters_repository=social_counters_repo,
        )

        auth_user_id = uuid4()
        account = await service.create_account(
            auth_user_id=auth_user_id,
            username="testuser",
            display_name="Test User",
            country_code="US",
            language_code="en",
        )

        assert account.username == "testuser"
        assert account.display_name == "Test User"
        assert account.auth_user_id == auth_user_id
        assert account.is_active
        assert not account.is_banned

    @pytest.mark.asyncio
    async def test_create_duplicate_username(self, db_session):
        """Test creating account with duplicate username."""
        account_repo = AccountRepository(db_session)
        profile_details_repo = ProfileDetailsRepository(db_session)
        media_repo = MediaRepository(db_session)
        preferences_repo = PreferencesRepository(db_session)
        privacy_settings_repo = PrivacySettingsRepository(db_session)
        social_counters_repo = SocialCountersRepository(db_session)

        service = AccountService(
            account_repository=account_repo,
            profile_details_repository=profile_details_repo,
            media_repository=media_repo,
            preferences_repository=preferences_repo,
            privacy_settings_repository=privacy_settings_repo,
            social_counters_repository=social_counters_repo,
        )

        auth_user_id_1 = uuid4()
        await service.create_account(
            auth_user_id=auth_user_id_1,
            username="testuser",
            display_name="Test User",
        )

        auth_user_id_2 = uuid4()
        with pytest.raises(AccountAlreadyExistsError):
            await service.create_account(
                auth_user_id=auth_user_id_2,
                username="testuser",
                display_name="Another User",
            )

    @pytest.mark.asyncio
    async def test_invalid_username(self, db_session):
        """Test invalid username validation."""
        account_repo = AccountRepository(db_session)
        profile_details_repo = ProfileDetailsRepository(db_session)
        media_repo = MediaRepository(db_session)
        preferences_repo = PreferencesRepository(db_session)
        privacy_settings_repo = PrivacySettingsRepository(db_session)
        social_counters_repo = SocialCountersRepository(db_session)

        service = AccountService(
            account_repository=account_repo,
            profile_details_repository=profile_details_repo,
            media_repository=media_repo,
            preferences_repository=preferences_repo,
            privacy_settings_repository=privacy_settings_repo,
            social_counters_repository=social_counters_repo,
        )

        auth_user_id = uuid4()
        with pytest.raises(InvalidUsernameError):
            await service.create_account(
                auth_user_id=auth_user_id,
                username="ab",  # Too short
                display_name="Test User",
            )

    @pytest.mark.asyncio
    async def test_get_account_by_id(self, db_session):
        """Test getting account by ID."""
        account_repo = AccountRepository(db_session)
        profile_details_repo = ProfileDetailsRepository(db_session)
        media_repo = MediaRepository(db_session)
        preferences_repo = PreferencesRepository(db_session)
        privacy_settings_repo = PrivacySettingsRepository(db_session)
        social_counters_repo = SocialCountersRepository(db_session)

        service = AccountService(
            account_repository=account_repo,
            profile_details_repository=profile_details_repo,
            media_repository=media_repo,
            preferences_repository=preferences_repo,
            privacy_settings_repository=privacy_settings_repo,
            social_counters_repository=social_counters_repo,
        )

        auth_user_id = uuid4()
        created_account = await service.create_account(
            auth_user_id=auth_user_id,
            username="testuser",
            display_name="Test User",
        )

        fetched_account = await service.get_account_by_id(created_account.id)
        assert fetched_account.id == created_account.id
        assert fetched_account.username == "testuser"

    @pytest.mark.asyncio
    async def test_get_nonexistent_account(self, db_session):
        """Test getting non-existent account."""
        account_repo = AccountRepository(db_session)
        profile_details_repo = ProfileDetailsRepository(db_session)
        media_repo = MediaRepository(db_session)
        preferences_repo = PreferencesRepository(db_session)
        privacy_settings_repo = PrivacySettingsRepository(db_session)
        social_counters_repo = SocialCountersRepository(db_session)

        service = AccountService(
            account_repository=account_repo,
            profile_details_repository=profile_details_repo,
            media_repository=media_repo,
            preferences_repository=preferences_repo,
            privacy_settings_repository=privacy_settings_repo,
            social_counters_repository=social_counters_repo,
        )

        with pytest.raises(AccountNotFoundError):
            await service.get_account_by_id(uuid4())

    @pytest.mark.asyncio
    async def test_ban_account(self, db_session):
        """Test banning an account."""
        account_repo = AccountRepository(db_session)
        profile_details_repo = ProfileDetailsRepository(db_session)
        media_repo = MediaRepository(db_session)
        preferences_repo = PreferencesRepository(db_session)
        privacy_settings_repo = PrivacySettingsRepository(db_session)
        social_counters_repo = SocialCountersRepository(db_session)

        service = AccountService(
            account_repository=account_repo,
            profile_details_repository=profile_details_repo,
            media_repository=media_repo,
            preferences_repository=preferences_repo,
            privacy_settings_repository=privacy_settings_repo,
            social_counters_repository=social_counters_repo,
        )

        auth_user_id = uuid4()
        created_account = await service.create_account(
            auth_user_id=auth_user_id,
            username="testuser",
            display_name="Test User",
        )

        banned_account = await service.ban_account(created_account.id)
        assert banned_account.is_banned

    @pytest.mark.asyncio
    async def test_unban_account(self, db_session):
        """Test unbanning an account."""
        account_repo = AccountRepository(db_session)
        profile_details_repo = ProfileDetailsRepository(db_session)
        media_repo = MediaRepository(db_session)
        preferences_repo = PreferencesRepository(db_session)
        privacy_settings_repo = PrivacySettingsRepository(db_session)
        social_counters_repo = SocialCountersRepository(db_session)

        service = AccountService(
            account_repository=account_repo,
            profile_details_repository=profile_details_repo,
            media_repository=media_repo,
            preferences_repository=preferences_repo,
            privacy_settings_repository=privacy_settings_repo,
            social_counters_repository=social_counters_repo,
        )

        auth_user_id = uuid4()
        created_account = await service.create_account(
            auth_user_id=auth_user_id,
            username="testuser",
            display_name="Test User",
        )

        await service.ban_account(created_account.id)
        unbanned_account = await service.unban_account(created_account.id)
        assert not unbanned_account.is_banned
