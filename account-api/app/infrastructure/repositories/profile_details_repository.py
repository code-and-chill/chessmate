"""Profile details repository implementation."""

from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.models.account_profile_details import AccountProfileDetails
from app.domain.repositories.profile_details_repository_interface import ProfileDetailsRepositoryInterface
from app.infrastructure.database.models.account_profile_details_orm import AccountProfileDetailsORM


class ProfileDetailsRepository(ProfileDetailsRepositoryInterface):
    """SQLAlchemy profile details repository implementation."""

    def __init__(self, session: AsyncSession):
        """
        Initialize profile details repository.
        
        Args:
            session: SQLAlchemy async database session
        """
        self.session = session

    async def create(self, profile_details: AccountProfileDetails) -> AccountProfileDetails:
        """
        Create profile details.
        
        Args:
            profile_details: Profile details domain model to persist
            
        Returns:
            Created AccountProfileDetails domain model
        """
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
        """
        Get profile details by account ID.
        
        Args:
            account_id: Account UUID
            
        Returns:
            AccountProfileDetails if found, None otherwise
        """
        stmt = select(AccountProfileDetailsORM).where(
            AccountProfileDetailsORM.account_id == account_id
        )
        result = await self.session.execute(stmt)
        orm_obj = result.scalars().first()
        return self._orm_to_domain(orm_obj) if orm_obj else None

    async def update(self, profile_details: AccountProfileDetails) -> AccountProfileDetails:
        """
        Update profile details.
        
        Args:
            profile_details: Profile details with updated values
            
        Returns:
            Updated AccountProfileDetails domain model
        """
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
