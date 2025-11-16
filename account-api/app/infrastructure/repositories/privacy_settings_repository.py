"""Privacy settings repository implementation."""

from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.models.account_privacy_settings import AccountPrivacySettings
from app.domain.models.privacy_level import PrivacyLevel
from app.domain.repositories.privacy_settings_repository_interface import PrivacySettingsRepositoryInterface
from app.infrastructure.database.models.account_privacy_settings_orm import AccountPrivacySettingsORM


class PrivacySettingsRepository(PrivacySettingsRepositoryInterface):
    """SQLAlchemy privacy settings repository implementation."""

    def __init__(self, session: AsyncSession):
        """
        Initialize privacy settings repository.
        
        Args:
            session: SQLAlchemy async database session
        """
        self.session = session

    async def create(
        self, privacy_settings: AccountPrivacySettings
    ) -> AccountPrivacySettings:
        """
        Create privacy settings.
        
        Args:
            privacy_settings: Privacy settings domain model to persist
            
        Returns:
            Created AccountPrivacySettings domain model
        """
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
        """
        Get privacy settings by account ID.
        
        Args:
            account_id: Account UUID
            
        Returns:
            AccountPrivacySettings if found, None otherwise
        """
        stmt = select(AccountPrivacySettingsORM).where(
            AccountPrivacySettingsORM.account_id == account_id
        )
        result = await self.session.execute(stmt)
        orm_obj = result.scalars().first()
        return self._orm_to_domain(orm_obj) if orm_obj else None

    async def update(
        self, privacy_settings: AccountPrivacySettings
    ) -> AccountPrivacySettings:
        """
        Update privacy settings.
        
        Args:
            privacy_settings: Privacy settings with updated values
            
        Returns:
            Updated AccountPrivacySettings domain model
        """
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
