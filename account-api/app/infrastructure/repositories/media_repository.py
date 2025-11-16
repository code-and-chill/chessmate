"""Media repository implementation."""

from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.models.account_media import AccountMedia
from app.domain.repositories.media_repository_interface import MediaRepositoryInterface
from app.infrastructure.database.models.account_media_orm import AccountMediaORM


class MediaRepository(MediaRepositoryInterface):
    """SQLAlchemy media repository implementation."""

    def __init__(self, session: AsyncSession):
        """
        Initialize media repository.
        
        Args:
            session: SQLAlchemy async database session
        """
        self.session = session

    async def create(self, media: AccountMedia) -> AccountMedia:
        """
        Create media record.
        
        Args:
            media: Media domain model to persist
            
        Returns:
            Created AccountMedia domain model
        """
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
        """
        Get media by account ID.
        
        Args:
            account_id: Account UUID
            
        Returns:
            AccountMedia if found, None otherwise
        """
        stmt = select(AccountMediaORM).where(AccountMediaORM.account_id == account_id)
        result = await self.session.execute(stmt)
        orm_obj = result.scalars().first()
        return self._orm_to_domain(orm_obj) if orm_obj else None

    async def update(self, media: AccountMedia) -> AccountMedia:
        """
        Update media.
        
        Args:
            media: Media with updated values
            
        Returns:
            Updated AccountMedia domain model
        """
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
