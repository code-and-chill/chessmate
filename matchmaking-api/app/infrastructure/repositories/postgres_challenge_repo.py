"""PostgreSQL challenge repository implementation."""
import logging
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.models import Challenge, ChallengeStatus
from app.domain.repositories.challenge import ChallengeRepository
from app.infrastructure.database.models import ChallengeModel

logger = logging.getLogger(__name__)


class PostgresChallengeRepository(ChallengeRepository):
    """PostgreSQL implementation of challenge repository."""

    def __init__(self, session: AsyncSession) -> None:
        """Initialize repository.

        Args:
            session: SQLAlchemy async session
        """
        self.session = session

    async def create(self, challenge: Challenge) -> None:
        """Create challenge.

        Args:
            challenge: Challenge to create
        """
        model = ChallengeModel(
            challenge_id=challenge.challenge_id,
            tenant_id=challenge.tenant_id,
            challenger_user_id=challenge.challenger_user_id,
            opponent_user_id=challenge.opponent_user_id,
            time_control=challenge.time_control,
            mode=challenge.mode,
            variant=challenge.variant,
            preferred_color=challenge.preferred_color,
            status=challenge.status.value,
            game_id=challenge.game_id,
            created_at=challenge.created_at,
            expires_at=challenge.expires_at,
        )

        self.session.add(model)
        await self.session.flush()

        logger.info(
            f"Created challenge {challenge.challenge_id}",
            extra={"tenant_id": challenge.tenant_id},
        )

    async def get_by_id(self, challenge_id: str) -> Optional[Challenge]:
        """Get challenge by ID.

        Args:
            challenge_id: ID of challenge

        Returns:
            Challenge or None if not found
        """
        stmt = select(ChallengeModel).where(ChallengeModel.challenge_id == challenge_id)
        result = await self.session.execute(stmt)
        model = result.scalars().first()

        if not model:
            return None

        return Challenge(
            challenge_id=model.challenge_id,
            tenant_id=model.tenant_id,
            challenger_user_id=model.challenger_user_id,
            opponent_user_id=model.opponent_user_id,
            time_control=model.time_control,
            mode=model.mode,
            variant=model.variant,
            preferred_color=model.preferred_color,
            status=ChallengeStatus(model.status),
            created_at=model.created_at,
            expires_at=model.expires_at,
            game_id=model.game_id,
        )

    async def update(self, challenge: Challenge) -> None:
        """Update challenge.

        Args:
            challenge: Challenge to update
        """
        stmt = select(ChallengeModel).where(ChallengeModel.challenge_id == challenge.challenge_id)
        result = await self.session.execute(stmt)
        model = result.scalars().first()

        if not model:
            logger.warning(f"Challenge {challenge.challenge_id} not found for update")
            return

        model.status = challenge.status.value
        model.game_id = challenge.game_id

        await self.session.flush()

        logger.info(f"Updated challenge {challenge.challenge_id}")

    async def get_incoming_challenges(
        self, user_id: str, tenant_id: str
    ) -> list[Challenge]:
        """Get incoming challenges for user.

        Args:
            user_id: User ID
            tenant_id: Tenant ID

        Returns:
            List of incoming challenges
        """
        stmt = (
            select(ChallengeModel)
            .where(
                ChallengeModel.opponent_user_id == user_id,
                ChallengeModel.tenant_id == tenant_id,
                ChallengeModel.status == ChallengeStatus.PENDING.value,
            )
            .order_by(ChallengeModel.created_at.desc())
        )

        result = await self.session.execute(stmt)
        models = result.scalars().all()

        challenges = []
        for model in models:
            challenges.append(
                Challenge(
                    challenge_id=model.challenge_id,
                    tenant_id=model.tenant_id,
                    challenger_user_id=model.challenger_user_id,
                    opponent_user_id=model.opponent_user_id,
                    time_control=model.time_control,
                    mode=model.mode,
                    variant=model.variant,
                    preferred_color=model.preferred_color,
                    status=ChallengeStatus(model.status),
                    created_at=model.created_at,
                    expires_at=model.expires_at,
                    game_id=model.game_id,
                )
            )

        return challenges
