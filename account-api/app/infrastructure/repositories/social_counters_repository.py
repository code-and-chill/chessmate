"""Social counters repository implementation."""

from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.models.account_social_counters import AccountSocialCounters
from app.domain.repositories.social_counters_repository_interface import SocialCountersRepositoryInterface
from app.infrastructure.database.models.account_social_counters_orm import AccountSocialCountersORM


class SocialCountersRepository(SocialCountersRepositoryInterface):
    """SQLAlchemy social counters repository implementation."""

    def __init__(self, session: AsyncSession):
        """
        Initialize social counters repository.
        
        Args:
            session: SQLAlchemy async database session
        """
        self.session = session

    async def create(self, counters: AccountSocialCounters) -> AccountSocialCounters:
        """
        Create social counters.
        
        Args:
            counters: Social counters domain model to persist
            
        Returns:
            Created AccountSocialCounters domain model
        """
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
        """
        Get social counters by account ID.
        
        Args:
            account_id: Account UUID
            
        Returns:
            AccountSocialCounters if found, None otherwise
        """
        stmt = select(AccountSocialCountersORM).where(
            AccountSocialCountersORM.account_id == account_id
        )
        result = await self.session.execute(stmt)
        orm_obj = result.scalars().first()
        return self._orm_to_domain(orm_obj) if orm_obj else None

    async def update(self, counters: AccountSocialCounters) -> AccountSocialCounters:
        """
        Update social counters.
        
        Args:
            counters: Social counters with updated values
            
        Returns:
            Updated AccountSocialCounters domain model
        """
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
