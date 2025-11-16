"""Account repository implementation."""

from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.models.account_model import Account
from app.domain.models.title_code import TitleCode
from app.domain.repositories.account_repository_interface import AccountRepositoryInterface
from app.infrastructure.database.models.account_orm import AccountORM


class AccountRepository(AccountRepositoryInterface):
    """
    SQLAlchemy implementation of account repository.
    
    Provides data access methods for Account entities using SQLAlchemy ORM.
    Handles conversion between domain models and ORM objects.
    """

    def __init__(self, session: AsyncSession):
        """
        Initialize account repository.
        
        Args:
            session: SQLAlchemy async database session
        """
        self.session = session

    async def create(self, account: Account) -> Account:
        """
        Create new account in database.
        
        Args:
            account: Account domain model to persist
            
        Returns:
            Created Account domain model with database-generated values
        """
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
        """
        Retrieve account by ID.
        
        Args:
            account_id: UUID of the account to retrieve
            
        Returns:
            Account domain model if found, None otherwise
        """
        stmt = select(AccountORM).where(AccountORM.id == account_id)
        result = await self.session.execute(stmt)
        orm_obj = result.scalars().first()
        return self._orm_to_domain(orm_obj) if orm_obj else None

    async def get_by_username(self, username: str) -> Optional[Account]:
        """
        Retrieve account by username.
        
        Args:
            username: Username to search for
            
        Returns:
            Account domain model if found, None otherwise
        """
        stmt = select(AccountORM).where(AccountORM.username == username)
        result = await self.session.execute(stmt)
        orm_obj = result.scalars().first()
        return self._orm_to_domain(orm_obj) if orm_obj else None

    async def get_by_auth_user_id(self, auth_user_id: UUID) -> Optional[Account]:
        """
        Retrieve account by authentication user ID.
        
        Args:
            auth_user_id: Auth service user UUID
            
        Returns:
            Account domain model if found, None otherwise
        """
        stmt = select(AccountORM).where(AccountORM.auth_user_id == auth_user_id)
        result = await self.session.execute(stmt)
        orm_obj = result.scalars().first()
        return self._orm_to_domain(orm_obj) if orm_obj else None

    async def update(self, account: Account) -> Account:
        """
        Update existing account in database.
        
        Args:
            account: Account domain model with updated values
            
        Returns:
            Updated Account domain model
        """
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
        from datetime import datetime, timezone
        
        stmt = select(AccountORM).where(AccountORM.id == account_id)
        result = await self.session.execute(stmt)
        orm_obj = result.scalars().one()

        orm_obj.is_banned = True
        orm_obj.updated_at = datetime.now(timezone.utc)
        await self.session.flush()
        return self._orm_to_domain(orm_obj)

    async def unban(self, account_id: UUID) -> Account:
        """Unban account."""
        from datetime import datetime, timezone
        
        stmt = select(AccountORM).where(AccountORM.id == account_id)
        result = await self.session.execute(stmt)
        orm_obj = result.scalars().one()

        orm_obj.is_banned = False
        orm_obj.updated_at = datetime.now(timezone.utc)
        await self.session.flush()
        return self._orm_to_domain(orm_obj)

    async def deactivate(self, account_id: UUID) -> Account:
        """Deactivate account."""
        from datetime import datetime, timezone
        
        stmt = select(AccountORM).where(AccountORM.id == account_id)
        result = await self.session.execute(stmt)
        orm_obj = result.scalars().one()

        orm_obj.is_active = False
        orm_obj.updated_at = datetime.now(timezone.utc)
        await self.session.flush()
        return self._orm_to_domain(orm_obj)

    def _orm_to_domain(self, orm_obj: AccountORM) -> Account:
        """Convert ORM object to domain model."""
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
