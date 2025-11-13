"""SQLAlchemy game repository implementation."""

from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.models.game import Game, GameStatus
from app.domain.repositories.game_repository import GameRepositoryInterface
from app.infrastructure.database.models import GameORM


class GameRepository(GameRepositoryInterface):
    """SQLAlchemy-based game repository."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, game: Game) -> Game:
        """Create a new game."""
        orm_obj = GameORM.from_domain(game)
        self.session.add(orm_obj)
        await self.session.commit()
        await self.session.refresh(orm_obj)
        return orm_obj.to_domain()

    async def get_by_id(self, game_id: UUID) -> Optional[Game]:
        """Get game by ID."""
        stmt = select(GameORM).where(GameORM.id == game_id)
        result = await self.session.execute(stmt)
        orm_obj = result.scalar_one_or_none()
        return orm_obj.to_domain() if orm_obj else None

    async def update(self, game: Game) -> Game:
        """Update a game."""
        orm_obj = GameORM.from_domain(game)
        await self.session.merge(orm_obj)
        await self.session.commit()

        # Fetch fresh instance to ensure consistency
        return await self.get_by_id(game.id)

    async def find_by_creator(self, creator_id: UUID) -> List[Game]:
        """Find games created by a user."""
        stmt = select(GameORM).where(GameORM.creator_account_id == creator_id)
        result = await self.session.execute(stmt)
        orm_objects = result.scalars().all()
        return [obj.to_domain() for obj in orm_objects]

    async def find_by_player(self, player_id: UUID) -> List[Game]:
        """Find games where player is participant."""
        stmt = select(GameORM).where(
            (GameORM.white_account_id == player_id)
            | (GameORM.black_account_id == player_id)
        )
        result = await self.session.execute(stmt)
        orm_objects = result.scalars().all()
        return [obj.to_domain() for obj in orm_objects]

    async def find_active_games(self) -> List[Game]:
        """Find all active games."""
        stmt = select(GameORM).where(GameORM.status == GameStatus.IN_PROGRESS.value)
        result = await self.session.execute(stmt)
        orm_objects = result.scalars().all()
        return [obj.to_domain() for obj in orm_objects]

    async def find_by_status(self, status: GameStatus) -> List[Game]:
        """Find games by status."""
        stmt = select(GameORM).where(GameORM.status == status.value)
        result = await self.session.execute(stmt)
        orm_objects = result.scalars().all()
        return [obj.to_domain() for obj in orm_objects]
