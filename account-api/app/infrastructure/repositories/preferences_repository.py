"""Preferences repository implementation."""

from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.models.account_preferences import AccountPreferences
from app.domain.models.animation_level import AnimationLevel
from app.domain.models.default_time_control import DefaultTimeControl
from app.domain.repositories.preferences_repository_interface import PreferencesRepositoryInterface
from app.infrastructure.database.models.account_preferences_orm import AccountPreferencesORM


class PreferencesRepository(PreferencesRepositoryInterface):
    """SQLAlchemy preferences repository implementation."""

    def __init__(self, session: AsyncSession):
        """
        Initialize preferences repository.
        
        Args:
            session: SQLAlchemy async database session
        """
        self.session = session

    async def create(self, preferences: AccountPreferences) -> AccountPreferences:
        """
        Create preferences.
        
        Args:
            preferences: Preferences domain model to persist
            
        Returns:
            Created AccountPreferences domain model
        """
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
        """
        Get preferences by account ID.
        
        Args:
            account_id: Account UUID
            
        Returns:
            AccountPreferences if found, None otherwise
        """
        stmt = select(AccountPreferencesORM).where(
            AccountPreferencesORM.account_id == account_id
        )
        result = await self.session.execute(stmt)
        orm_obj = result.scalars().first()
        return self._orm_to_domain(orm_obj) if orm_obj else None

    async def update(self, preferences: AccountPreferences) -> AccountPreferences:
        """
        Update preferences.
        
        Args:
            preferences: Preferences with updated values
            
        Returns:
            Updated AccountPreferences domain model
        """
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
