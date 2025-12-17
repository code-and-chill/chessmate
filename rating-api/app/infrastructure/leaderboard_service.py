"""Service for managing leaderboard materialization."""

import logging
from typing import Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.leaderboard import Leaderboard
from app.domain.rating_pool import RatingPool

logger = logging.getLogger(__name__)


class LeaderboardService:
    """Service for leaderboard materialization."""

    async def update_leaderboard(
        self,
        pool_id: int,
        user_id: str,
        rating: float,
        db: AsyncSession,
    ) -> None:
        """Update leaderboard entry for a user in a pool.

        Args:
            pool_id: Pool ID
            user_id: User ID
            rating: Current rating (will be stored as integer * 100)
            db: Database session
        """
        # Store rating as integer (multiply by 100 for precision)
        rating_int = int(rating * 100)

        # Get or create leaderboard entry
        leaderboard = (
            await db.execute(
                select(Leaderboard).where(
                    Leaderboard.pool_id == pool_id,
                    Leaderboard.user_id == user_id,
                )
            )
        ).scalar_one_or_none()

        if not leaderboard:
            leaderboard = Leaderboard(
                pool_id=pool_id,
                user_id=user_id,
                rating=rating_int,
                rank=0,  # Will be recomputed
            )
            db.add(leaderboard)
        else:
            leaderboard.rating = rating_int
            # Rank will be recomputed later

        await db.flush()

        # Recompute ranks for this pool
        await self._recompute_ranks(pool_id, db)

    async def _recompute_ranks(self, pool_id: int, db: AsyncSession) -> None:
        """Recompute ranks for all users in a pool.

        Args:
            pool_id: Pool ID
            db: Database session
        """
        # Get all leaderboard entries for this pool, ordered by rating descending
        entries = (
            await db.execute(
                select(Leaderboard)
                .where(Leaderboard.pool_id == pool_id)
                .order_by(Leaderboard.rating.desc())
            )
        ).scalars().all()

        # Assign ranks (1 = highest rating)
        rank = 1
        for entry in entries:
            entry.rank = rank
            rank += 1

        await db.flush()

    async def recompute_all_ranks(self, pool_id: int, db: AsyncSession) -> int:
        """Recompute all ranks for a pool (used by admin endpoint).

        Args:
            pool_id: Pool ID
            db: Database session

        Returns:
            Number of entries updated
        """
        await self._recompute_ranks(pool_id, db)
        
        # Count entries
        count = (
            await db.execute(
                select(func.count(Leaderboard.id)).where(Leaderboard.pool_id == pool_id)
            )
        ).scalar_one()

        return count


# Global leaderboard service instance
_leaderboard_service: Optional[LeaderboardService] = None


def get_leaderboard_service() -> LeaderboardService:
    """Get global leaderboard service instance."""
    global _leaderboard_service
    if _leaderboard_service is None:
        _leaderboard_service = LeaderboardService()
    return _leaderboard_service
