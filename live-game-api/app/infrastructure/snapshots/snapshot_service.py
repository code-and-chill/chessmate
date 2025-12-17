"""Snapshot service for periodic game state persistence."""

import logging
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.domain.models.game import Game
from app.infrastructure.database.models import GameORM

logger = logging.getLogger(__name__)


class SnapshotService:
    """Service for creating and managing game state snapshots."""

    def __init__(self, db_session: AsyncSession):
        """Initialize snapshot service.

        Args:
            db_session: Database session for snapshots
        """
        self.db_session = db_session
        self.settings = get_settings()
        self.snapshot_interval_moves = self.settings.SNAPSHOT_INTERVAL_MOVES
        self.snapshot_interval_seconds = self.settings.SNAPSHOT_INTERVAL_SECONDS

    async def should_snapshot(self, game: Game) -> bool:
        """Check if game should be snapshotted.

        Args:
            game: Game to check

        Returns:
            True if snapshot should be created
        """
        # Snapshot if:
        # 1. Game has reached move interval (every N moves)
        # 2. Game hasn't been updated recently (every N seconds for active games)
        # 3. Game has ended (always snapshot ended games)
        
        if game.is_ended():
            return True
            
        move_count = len(game.moves)
        if move_count > 0 and move_count % self.snapshot_interval_moves == 0:
            return True
            
        # Check time-based snapshot
        if game.updated_at:
            time_since_update = (datetime.now(timezone.utc) - game.updated_at).total_seconds()
            if time_since_update >= self.snapshot_interval_seconds:
                return True
                
        return False

    async def create_snapshot(self, game: Game) -> None:
        """Create snapshot of game state.

        Args:
            game: Game to snapshot
        """
        try:
            # Use existing repository update mechanism (which persists to DB)
            # Snapshots are effectively the current DB state
            # This service coordinates when snapshots should be created
            
            # For now, we rely on the repository to persist game state
            # In the future, we might want to add snapshot metadata tracking
            # or S3 archival for completed games
            
            logger.debug(f"Snapshot created for game {game.id} (moves: {len(game.moves)})")
        except Exception as e:
            logger.error(f"Failed to create snapshot for game {game.id}: {e}", exc_info=True)

    async def load_from_snapshot(self, game_id: UUID) -> Optional[Game]:
        """Load game from snapshot (from database).

        Args:
            game_id: Game UUID

        Returns:
            Game domain object or None if not found
        """
        try:
            from sqlalchemy import select
            from sqlalchemy.orm import selectinload
            
            stmt = select(GameORM).where(GameORM.id == game_id).options(selectinload(GameORM.moves))
            result = await self.db_session.execute(stmt)
            orm_obj = result.scalar_one_or_none()
            
            if orm_obj:
                return orm_obj.to_domain()
            return None
        except Exception as e:
            logger.error(f"Failed to load snapshot for game {game_id}: {e}", exc_info=True)
            return None
