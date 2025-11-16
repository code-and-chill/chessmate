"""Unit tests for challenge service."""
import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock

from app.domain.models import Challenge, ChallengeStatus
from app.domain.services.challenge_service import ChallengeService
from app.core.exceptions import (
    SelfChallengeException,
    ChallengeNotFoundException,
    NotChallengeRecipientException,
    ChallengeExpiredException,
)


@pytest.fixture
def mock_challenge_repo():
    """Create mock challenge repository."""
    return AsyncMock()


@pytest.fixture
def mock_live_game_api():
    """Create mock live game API client."""
    return AsyncMock()


@pytest.fixture
def challenge_service(mock_challenge_repo, mock_live_game_api):
    """Create challenge service instance."""
    return ChallengeService(mock_challenge_repo, mock_live_game_api)


@pytest.mark.asyncio
class TestChallengeService:
    """Test challenge service logic."""

    async def test_create_challenge_success(
        self, challenge_service, mock_challenge_repo
    ):
        """Test successfully creating a challenge."""
        challenge = await challenge_service.create_challenge(
            challenger_user_id="user_1",
            tenant_id="t_default",
            opponent_user_id="user_2",
            time_control="10+0",
            mode="rated",
        )

        assert challenge.challenger_user_id == "user_1"
        assert challenge.opponent_user_id == "user_2"
        assert challenge.status == ChallengeStatus.PENDING
        mock_challenge_repo.create.assert_called_once()

    async def test_create_challenge_to_self(
        self, challenge_service, mock_challenge_repo
    ):
        """Test creating challenge to oneself fails."""
        with pytest.raises(SelfChallengeException):
            await challenge_service.create_challenge(
                challenger_user_id="user_1",
                tenant_id="t_default",
                opponent_user_id="user_1",  # Same user
                time_control="10+0",
                mode="rated",
            )

        mock_challenge_repo.create.assert_not_called()

    async def test_accept_challenge_success(
        self, challenge_service, mock_challenge_repo, mock_live_game_api
    ):
        """Test successfully accepting a challenge."""
        now = datetime.now(timezone.utc)
        challenge = Challenge(
            challenge_id="c_123",
            tenant_id="t_default",
            challenger_user_id="user_1",
            opponent_user_id="user_2",
            time_control="10+0",
            mode="rated",
            variant="standard",
            preferred_color="random",
            status=ChallengeStatus.PENDING,
            created_at=now,
            expires_at=now + timedelta(minutes=5),
        )

        mock_challenge_repo.get_by_id.return_value = challenge
        mock_live_game_api.create_game.return_value = "game_123"

        result = await challenge_service.accept_challenge(
            challenge_id="c_123",
            user_id="user_2",
        )

        assert result.status == ChallengeStatus.ACCEPTED
        assert result.game_id == "game_123"
        mock_live_game_api.create_game.assert_called_once()
        mock_challenge_repo.update.assert_called_once()

    async def test_accept_challenge_not_recipient(
        self, challenge_service, mock_challenge_repo
    ):
        """Test accepting challenge as non-recipient fails."""
        now = datetime.now(timezone.utc)
        challenge = Challenge(
            challenge_id="c_123",
            tenant_id="t_default",
            challenger_user_id="user_1",
            opponent_user_id="user_2",
            time_control="10+0",
            mode="rated",
            variant="standard",
            preferred_color="random",
            status=ChallengeStatus.PENDING,
            created_at=now,
            expires_at=now + timedelta(minutes=5),
        )

        mock_challenge_repo.get_by_id.return_value = challenge

        with pytest.raises(NotChallengeRecipientException):
            await challenge_service.accept_challenge(
                challenge_id="c_123",
                user_id="user_3",  # Wrong user
            )

    async def test_accept_challenge_expired(
        self, challenge_service, mock_challenge_repo
    ):
        """Test accepting expired challenge fails."""
        now = datetime.now(timezone.utc)
        challenge = Challenge(
            challenge_id="c_123",
            tenant_id="t_default",
            challenger_user_id="user_1",
            opponent_user_id="user_2",
            time_control="10+0",
            mode="rated",
            variant="standard",
            preferred_color="random",
            status=ChallengeStatus.PENDING,
            created_at=now - timedelta(minutes=10),
            expires_at=now - timedelta(minutes=5),  # Already expired
        )

        mock_challenge_repo.get_by_id.return_value = challenge

        with pytest.raises(ChallengeExpiredException):
            await challenge_service.accept_challenge(
                challenge_id="c_123",
                user_id="user_2",
            )

    async def test_decline_challenge_success(
        self, challenge_service, mock_challenge_repo
    ):
        """Test successfully declining a challenge."""
        now = datetime.now(timezone.utc)
        challenge = Challenge(
            challenge_id="c_123",
            tenant_id="t_default",
            challenger_user_id="user_1",
            opponent_user_id="user_2",
            time_control="10+0",
            mode="rated",
            variant="standard",
            preferred_color="random",
            status=ChallengeStatus.PENDING,
            created_at=now,
            expires_at=now + timedelta(minutes=5),
        )

        mock_challenge_repo.get_by_id.return_value = challenge

        result = await challenge_service.decline_challenge(
            challenge_id="c_123",
            user_id="user_2",
        )

        assert result.status == ChallengeStatus.DECLINED
        mock_challenge_repo.update.assert_called_once()

    async def test_get_incoming_challenges(
        self, challenge_service, mock_challenge_repo
    ):
        """Test getting incoming challenges for user."""
        now = datetime.now(timezone.utc)
        challenge1 = Challenge(
            challenge_id="c_1",
            tenant_id="t_default",
            challenger_user_id="user_1",
            opponent_user_id="user_2",
            time_control="10+0",
            mode="rated",
            variant="standard",
            preferred_color="random",
            status=ChallengeStatus.PENDING,
            created_at=now,
            expires_at=now + timedelta(minutes=5),
        )
        challenge2 = Challenge(
            challenge_id="c_2",
            tenant_id="t_default",
            challenger_user_id="user_3",
            opponent_user_id="user_2",
            time_control="5+0",
            mode="casual",
            variant="standard",
            preferred_color="white",
            status=ChallengeStatus.PENDING,
            created_at=now,
            expires_at=now + timedelta(minutes=5),
        )

        mock_challenge_repo.get_incoming_challenges.return_value = [
            challenge1,
            challenge2,
        ]

        challenges = await challenge_service.get_incoming_challenges(
            user_id="user_2",
            tenant_id="t_default",
        )

        assert len(challenges) == 2
        assert all(c.opponent_user_id == "user_2" for c in challenges)
