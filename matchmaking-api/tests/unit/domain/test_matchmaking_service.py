"""Unit tests for matchmaking service."""
import pytest
import pytest
from datetime import datetime, timezone
from unittest.mock import AsyncMock

from app.clients.rating_client import PlayerRating
from app.domain.models import QueueEntry, QueueEntryStatus
from app.domain.services.matchmaking_service import MatchmakingService
from app.core.exceptions import AlreadyInQueueException, QueueEntryNotFoundException


@pytest.fixture
def mock_queue_store():
    """Create mock queue store."""
    return AsyncMock()


@pytest.fixture
def mock_match_repo():
    """Create mock match record repository."""
    return AsyncMock()


@pytest.fixture
def mock_live_game_api():
    """Create mock live game API client."""
    return AsyncMock()


@pytest.fixture
def mock_rating_api():
    """Create mock rating API client."""

    client = AsyncMock()
    client.get_bulk_ratings.return_value = {
        "user_1": PlayerRating(rating=1500, rating_deviation=40.0),
        "user_2": PlayerRating(rating=1525, rating_deviation=38.0),
    }
    return client


@pytest.fixture
def matchmaking_service(mock_queue_store, mock_match_repo, mock_live_game_api, mock_rating_api):
    """Create matchmaking service instance."""
    return MatchmakingService(
        mock_queue_store, mock_match_repo, mock_live_game_api, mock_rating_api
    )


@pytest.mark.asyncio
class TestMatchmakingService:
    """Test matchmaking service logic."""

    async def test_enqueue_player_success(
        self, matchmaking_service, mock_queue_store
    ):
        """Test successfully enqueueing a player."""
        mock_queue_store.get_active_entry_for_user.return_value = None

        entry = await matchmaking_service.enqueue_player(
            user_id="user_123",
            tenant_id="t_default",
            time_control="5+0",
            mode="rated",
        )

        assert entry.user_id == "user_123"
        assert entry.time_control == "5+0"
        assert entry.status == QueueEntryStatus.SEARCHING
        mock_queue_store.add_entry.assert_called_once()

    async def test_enqueue_player_already_in_queue(
        self, matchmaking_service, mock_queue_store
    ):
        """Test enqueueing when user already in queue."""
        existing_entry = QueueEntry(
            queue_entry_id="q_existing",
            tenant_id="t_default",
            user_id="user_123",
            time_control="5+0",
            mode="rated",
            variant="standard",
            region="DEFAULT",
            status=QueueEntryStatus.SEARCHING,
            enqueued_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        mock_queue_store.get_active_entry_for_user.return_value = existing_entry

        with pytest.raises(AlreadyInQueueException):
            await matchmaking_service.enqueue_player(
                user_id="user_123",
                tenant_id="t_default",
                time_control="5+0",
                mode="rated",
            )

    async def test_cancel_queue_entry_success(
        self, matchmaking_service, mock_queue_store
    ):
        """Test successfully canceling queue entry."""
        entry = QueueEntry(
            queue_entry_id="q_123",
            tenant_id="t_default",
            user_id="user_123",
            time_control="5+0",
            mode="rated",
            variant="standard",
            region="DEFAULT",
            status=QueueEntryStatus.SEARCHING,
            enqueued_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        cancelled_entry = QueueEntry(
            queue_entry_id="q_123",
            tenant_id="t_default",
            user_id="user_123",
            time_control="5+0",
            mode="rated",
            variant="standard",
            region="DEFAULT",
            status=QueueEntryStatus.CANCELLED,
            enqueued_at=entry.enqueued_at,
            updated_at=datetime.now(timezone.utc),
        )

        mock_queue_store.get_entry.side_effect = [entry, cancelled_entry]

        result = await matchmaking_service.cancel_queue_entry("q_123", "user_123")

        assert result.status == QueueEntryStatus.CANCELLED
        mock_queue_store.update_entry_status.assert_called_once_with(
            "q_123", QueueEntryStatus.CANCELLED
        )

    async def test_cancel_queue_entry_not_found(
        self, matchmaking_service, mock_queue_store
    ):
        """Test canceling non-existent queue entry."""
        mock_queue_store.get_entry.return_value = None

        with pytest.raises(QueueEntryNotFoundException):
            await matchmaking_service.cancel_queue_entry("q_nonexistent", "user_123")

    async def test_match_players_success(
        self, matchmaking_service, mock_queue_store, mock_match_repo, mock_live_game_api
    ):
        """Test successfully matching two players."""
        entry1 = QueueEntry(
            queue_entry_id="q_1",
            tenant_id="t_default",
            user_id="user_1",
            time_control="5+0",
            mode="rated",
            variant="standard",
            region="DEFAULT",
            status=QueueEntryStatus.SEARCHING,
            enqueued_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        entry2 = QueueEntry(
            queue_entry_id="q_2",
            tenant_id="t_default",
            user_id="user_2",
            time_control="5+0",
            mode="rated",
            variant="standard",
            region="DEFAULT",
            status=QueueEntryStatus.SEARCHING,
            enqueued_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

        mock_live_game_api.create_game.return_value = "game_123"

        success = await matchmaking_service.match_players(
            entry1, entry2, 1500, 1500, "DEFAULT"
        )

        assert success is True
        mock_live_game_api.create_game.assert_called_once()
        mock_match_repo.create.assert_called_once()
        assert mock_queue_store.update_entry_status.call_count == 2

    async def test_find_matches_for_pool(
        self, matchmaking_service, mock_queue_store
    ):
        """Test finding matches in a pool."""
        now = datetime.now(timezone.utc)
        entry1 = QueueEntry(
            queue_entry_id="q_1",
            tenant_id="t_default",
            user_id="user_1",
            time_control="5+0",
            mode="rated",
            variant="standard",
            region="DEFAULT",
            status=QueueEntryStatus.SEARCHING,
            enqueued_at=now,
            updated_at=now,
        )
        entry2 = QueueEntry(
            queue_entry_id="q_2",
            tenant_id="t_default",
            user_id="user_2",
            time_control="5+0",
            mode="rated",
            variant="standard",
            region="DEFAULT",
            status=QueueEntryStatus.SEARCHING,
            enqueued_at=now,
            updated_at=now,
        )

        mock_queue_store.get_queue_by_pool.return_value = [entry1, entry2]

        matches = await matchmaking_service.find_matches_for_pool(
            "t_default", "standard_5+0_rated_DEFAULT"
        )

        assert len(matches) == 1
        entries = {(matches[0][0], matches[0][1]), (matches[0][1], matches[0][0])}
        assert (entry1, entry2) in entries
        assert matches[0][2] == "DEFAULT"

    async def test_find_matches_empty_pool(
        self, matchmaking_service, mock_queue_store
    ):
        """Test finding matches in empty pool."""
        mock_queue_store.get_queue_by_pool.return_value = []

        matches = await matchmaking_service.find_matches_for_pool(
            "t_default", "standard_5+0_rated_DEFAULT"
        )

        assert len(matches) == 0

    async def test_get_active_matchmaking_no_entry(
        self, matchmaking_service, mock_queue_store
    ):
        """Test getting active matchmaking when user has no entry."""
        mock_queue_store.get_active_entry_for_user.return_value = None

        result = await matchmaking_service.get_active_matchmaking(
            "user_123", "t_default"
        )

        assert result["queue_entry"] is None
        assert result["match"] is None
