"""PostgreSQL match record repository implementation."""
import logging
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.models import MatchRecord, RatingSnapshot
from app.domain.repositories.match_record import MatchRecordRepository
from app.infrastructure.database.models import MatchRecordModel

logger = logging.getLogger(__name__)


class PostgresMatchRecordRepository(MatchRecordRepository):
    """PostgreSQL implementation of match record repository."""

    def __init__(self, session: AsyncSession) -> None:
        """Initialize repository.

        Args:
            session: SQLAlchemy async session
        """
        self.session = session

    async def create(self, match: MatchRecord) -> None:
        """Create match record.

        Args:
            match: Match record to create
        """
        model = MatchRecordModel(
            match_id=match.match_id,
            tenant_id=match.tenant_id,
            game_id=match.game_id,
            white_user_id=match.white_user_id,
            black_user_id=match.black_user_id,
            time_control=match.time_control,
            mode=match.mode,
            variant=match.variant,
            rating_snapshot=match.rating_snapshot.to_dict(),
            queue_entry_ids=match.queue_entry_ids,
        )

        self.session.add(model)
        await self.session.flush()

        logger.info(
            f"Created match record {match.match_id} with game_id {match.game_id}",
            extra={"tenant_id": match.tenant_id},
        )

    async def get_by_id(self, match_id: str) -> Optional[MatchRecord]:
        """Get match record by ID.

        Args:
            match_id: ID of match

        Returns:
            Match record or None if not found
        """
        stmt = select(MatchRecordModel).where(MatchRecordModel.match_id == match_id)
        result = await self.session.execute(stmt)
        model = result.scalars().first()

        if not model:
            return None

        rating_snapshot = RatingSnapshot(
            white=model.rating_snapshot.get("white", 1500),
            black=model.rating_snapshot.get("black", 1500),
        )

        return MatchRecord(
            match_id=model.match_id,
            tenant_id=model.tenant_id,
            game_id=model.game_id,
            white_user_id=model.white_user_id,
            black_user_id=model.black_user_id,
            time_control=model.time_control,
            mode=model.mode,
            variant=model.variant,
            created_at=model.created_at,
            queue_entry_ids=model.queue_entry_ids,
            rating_snapshot=rating_snapshot,
        )

    async def get_by_game_id(self, game_id: str) -> Optional[MatchRecord]:
        """Get match record by game ID.

        Args:
            game_id: ID of game

        Returns:
            Match record or None if not found
        """
        stmt = select(MatchRecordModel).where(MatchRecordModel.game_id == game_id)
        result = await self.session.execute(stmt)
        model = result.scalars().first()

        if not model:
            return None

        rating_snapshot = RatingSnapshot(
            white=model.rating_snapshot.get("white", 1500),
            black=model.rating_snapshot.get("black", 1500),
        )

        return MatchRecord(
            match_id=model.match_id,
            tenant_id=model.tenant_id,
            game_id=model.game_id,
            white_user_id=model.white_user_id,
            black_user_id=model.black_user_id,
            time_control=model.time_control,
            mode=model.mode,
            variant=model.variant,
            created_at=model.created_at,
            queue_entry_ids=model.queue_entry_ids,
            rating_snapshot=rating_snapshot,
        )
