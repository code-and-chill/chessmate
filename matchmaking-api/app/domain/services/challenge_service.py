"""Challenge service for direct player challenges."""
import logging
import random
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from app.core.config import get_settings
from app.domain.models import Challenge, ChallengeStatus
from app.domain.repositories.challenge import ChallengeRepository
from app.infrastructure.external.live_game_api import LiveGameAPIClient

logger = logging.getLogger(__name__)


class ChallengeService:
    """Service for managing direct player challenges.

    Implements challenge logic per service-spec section 4.2.
    """

    def __init__(
        self,
        challenge_repo: ChallengeRepository,
        live_game_api: LiveGameAPIClient,
    ) -> None:
        """Initialize challenge service.

        Args:
            challenge_repo: Challenge repository
            live_game_api: Live game API client
        """
        self.challenge_repo = challenge_repo
        self.live_game_api = live_game_api
        self.settings = get_settings()

    async def create_challenge(
        self,
        challenger_user_id: str,
        tenant_id: str,
        opponent_user_id: str,
        time_control: str,
        mode: str,
        variant: str = "standard",
        preferred_color: str = "random",
    ) -> Challenge:
        """Create a direct challenge between two players.

        Per service-spec 4.2.1 POST /v1/matchmaking/challenges

        Args:
            challenger_user_id: Challenger's user ID
            tenant_id: Tenant ID
            opponent_user_id: Opponent's user ID
            time_control: Time control (e.g., "5+0")
            mode: Mode ("rated" or "casual")
            variant: Chess variant (default "standard")
            preferred_color: Preferred color ("white", "black", "random")

        Returns:
            Created challenge

        Raises:
            SelfChallengeException: If user tries to challenge themselves
        """
        from app.core.exceptions import SelfChallengeException

        if challenger_user_id == opponent_user_id:
            raise SelfChallengeException("Cannot challenge yourself")

        challenge_id = f"c_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(seconds=300)  # 5 minutes to accept

        challenge = Challenge(
            challenge_id=challenge_id,
            tenant_id=tenant_id,
            challenger_user_id=challenger_user_id,
            opponent_user_id=opponent_user_id,
            time_control=time_control,
            mode=mode,
            variant=variant,
            preferred_color=preferred_color,
            status=ChallengeStatus.PENDING,
            created_at=now,
            expires_at=expires_at,
        )

        await self.challenge_repo.create(challenge)

        logger.info(
            f"Created challenge {challenge_id}",
            extra={
                "challenger_user_id": challenger_user_id,
                "opponent_user_id": opponent_user_id,
                "tenant_id": tenant_id,
            },
        )

        return challenge

    async def accept_challenge(
        self,
        challenge_id: str,
        user_id: str,
        challenger_rating: int = 1500,
        opponent_rating: int = 1500,
    ) -> Challenge:
        """Accept a challenge and create game.

        Per service-spec 4.2.2 POST /v1/matchmaking/challenges/{challenge_id}/accept

        Args:
            challenge_id: Challenge ID
            user_id: User ID accepting (must be opponent)
            challenger_rating: Challenger's rating
            opponent_rating: Opponent's rating

        Returns:
            Updated challenge with game_id

        Raises:
            ChallengeNotFoundException: If challenge not found
            NotChallengeRecipientException: If user is not the challenge recipient
            ChallengeExpiredException: If challenge has expired
            ChallengeNotPendingException: If challenge is not pending
        """
        from app.core.exceptions import (
            ChallengeExpiredException,
            ChallengeNotFoundException,
            ChallengeNotPendingException,
            NotChallengeRecipientException,
        )

        challenge = await self.challenge_repo.get_by_id(challenge_id)
        if not challenge:
            raise ChallengeNotFoundException()

        # Verify user is the opponent
        if challenge.opponent_user_id != user_id:
            raise NotChallengeRecipientException()

        # Check if expired
        now = datetime.now(timezone.utc)
        if challenge.is_expired(now):
            challenge.status = ChallengeStatus.EXPIRED
            await self.challenge_repo.update(challenge)
            raise ChallengeExpiredException()

        # Check if pending
        if not challenge.is_pending():
            raise ChallengeNotPendingException(
                f"Challenge is in state {challenge.status.value}"
            )

        # Determine colors based on preference
        white_user_id, black_user_id, white_rating, black_rating = self._assign_colors(
            challenge, challenger_rating, opponent_rating
        )

        try:
            # Create game via live-game-api
            game_id = await self.live_game_api.create_game(
                tenant_id=challenge.tenant_id,
                white_user_id=white_user_id,
                black_user_id=black_user_id,
                time_control=challenge.time_control,
                mode=challenge.mode,
                variant=challenge.variant,
                rating_snapshot={"white": white_rating, "black": black_rating},
                metadata={
                    "matchmaking_source": "challenge",
                    "challenge_id": challenge_id,
                },
            )

            # Update challenge
            challenge.status = ChallengeStatus.ACCEPTED
            challenge.game_id = game_id
            await self.challenge_repo.update(challenge)

            logger.info(
                f"Accepted challenge {challenge_id} with game {game_id}",
                extra={
                    "challenger_user_id": challenge.challenger_user_id,
                    "opponent_user_id": challenge.opponent_user_id,
                    "tenant_id": challenge.tenant_id,
                },
            )

            return challenge

        except Exception as e:
            logger.error(f"Failed to create game for challenge {challenge_id}: {str(e)}")
            raise

    def _assign_colors(
        self,
        challenge: Challenge,
        challenger_rating: int,
        opponent_rating: int,
    ) -> tuple[str, str, int, int]:
        """Assign colors based on preferred_color.

        Returns:
            (white_user_id, black_user_id, white_rating, black_rating)
        """
        if challenge.preferred_color == "white":
            return (
                challenge.challenger_user_id,
                challenge.opponent_user_id,
                challenger_rating,
                opponent_rating,
            )
        elif challenge.preferred_color == "black":
            return (
                challenge.opponent_user_id,
                challenge.challenger_user_id,
                opponent_rating,
                challenger_rating,
            )
        else:  # random
            if random.random() < 0.5:
                return (
                    challenge.challenger_user_id,
                    challenge.opponent_user_id,
                    challenger_rating,
                    opponent_rating,
                )
            else:
                return (
                    challenge.opponent_user_id,
                    challenge.challenger_user_id,
                    opponent_rating,
                    challenger_rating,
                )

    async def decline_challenge(self, challenge_id: str, user_id: str) -> Challenge:
        """Decline a challenge.

        Per service-spec 4.2.3 POST /v1/matchmaking/challenges/{challenge_id}/decline

        Args:
            challenge_id: Challenge ID
            user_id: User ID declining (must be opponent)

        Returns:
            Updated challenge

        Raises:
            ChallengeNotFoundException: If challenge not found
            NotChallengeRecipientException: If user is not the challenge recipient
            ChallengeNotPendingException: If challenge is not pending
        """
        from app.core.exceptions import (
            ChallengeNotFoundException,
            ChallengeNotPendingException,
            NotChallengeRecipientException,
        )

        challenge = await self.challenge_repo.get_by_id(challenge_id)
        if not challenge:
            raise ChallengeNotFoundException()

        # Verify user is the opponent
        if challenge.opponent_user_id != user_id:
            raise NotChallengeRecipientException()

        # Check if pending
        if not challenge.is_pending():
            raise ChallengeNotPendingException(
                f"Challenge is in state {challenge.status.value}"
            )

        # Update challenge
        challenge.status = ChallengeStatus.DECLINED
        await self.challenge_repo.update(challenge)

        logger.info(
            f"Declined challenge {challenge_id}",
            extra={
                "challenger_user_id": challenge.challenger_user_id,
                "opponent_user_id": challenge.opponent_user_id,
                "tenant_id": challenge.tenant_id,
            },
        )

        return challenge

    async def get_incoming_challenges(
        self, user_id: str, tenant_id: str
    ) -> list[Challenge]:
        """Get incoming challenges for user.

        Per service-spec 4.2.4 GET /v1/matchmaking/challenges/incoming

        Args:
            user_id: User ID
            tenant_id: Tenant ID

        Returns:
            List of incoming challenges
        """
        challenges = await self.challenge_repo.get_incoming_challenges(user_id, tenant_id)

        # Filter out expired challenges
        now = datetime.now(timezone.utc)
        active_challenges = [
            c for c in challenges if c.is_pending() and not c.is_expired(now)
        ]

        return active_challenges

    async def expire_old_challenges(self) -> int:
        """Mark expired challenges as expired.

        Background task to clean up expired challenges.

        Returns:
            Number of challenges expired
        """
        # TODO: Implement if needed
        return 0
