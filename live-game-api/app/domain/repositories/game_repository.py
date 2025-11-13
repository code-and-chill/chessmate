"""Game repository interface."""

from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from app.domain.models.game import Game, GameStatus


class GameRepositoryInterface(ABC):
    """Game repository interface."""

    @abstractmethod
    async def create(self, game: Game) -> Game:
        """Create a new game."""
        pass

    @abstractmethod
    async def get_by_id(self, game_id: UUID) -> Optional[Game]:
        """Get game by ID."""
        pass

    @abstractmethod
    async def update(self, game: Game) -> Game:
        """Update a game."""
        pass

    @abstractmethod
    async def find_by_creator(self, creator_id: UUID) -> List[Game]:
        """Find games created by a user."""
        pass

    @abstractmethod
    async def find_by_player(self, player_id: UUID) -> List[Game]:
        """Find games where player is participant."""
        pass

    @abstractmethod
    async def find_active_games(self) -> List[Game]:
        """Find all active games."""
        pass

    @abstractmethod
    async def find_by_status(self, status: GameStatus) -> List[Game]:
        """Find games by status."""
        pass
