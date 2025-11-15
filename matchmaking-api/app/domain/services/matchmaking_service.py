"""Matchmaking logic service."""
import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from app.core.config import get_settings
from app.domain.models import MatchRecord, QueueEntry, QueueEntryStatus, RatingSnapshot
from app.domain.repositories.match_record import MatchRecordRepository
from app.domain.repositories.queue_store import QueueStoreRepository
from app.infrastructure.external.live_game_api import LiveGameAPIClient

logger = logging.getLogger(__name__)


class MatchmakingService:
    """Orchestrates matchmaking logic.

    Implements matching algorithm per service-spec section 2.1 and 7.1.
    """

    def __init__(
        self,
        queue_store: QueueStoreRepository,
        match_repo: MatchRecordRepository,
        live_game_api: LiveGameAPIClient,
    ) -> None:
        """Initialize matchmaking service.

        Args:
            queue_store: Queue storage repository
            match_repo: Match record repository
            live_game_api: Live game API client
        """
        self.queue_store = queue_store
        self.match_repo = match_repo
        self.live_game_api = live_game_api
        self.settings = get_settings()

    async def enqueue_player(
        self,
        user_id: str,
        tenant_id: str,
        time_control: str,
        mode: str,
        variant: str = "standard",
        region: str = "DEFAULT",
    ) -> QueueEntry:
        """Enqueue player for matchmaking.

        Per service-spec 4.1.1 POST /v1/matchmaking/queue

        Args:
            user_id: User identifier
            tenant_id: Tenant identifier
            time_control: Time control (e.g., "5+0")
            mode: Mode ("rated" or "casual")
            variant: Variant (default "standard")
            region: Region (default "DEFAULT")

        Returns:
            Queue entry

        Raises:
            AlreadyInQueueException: If user already in queue
        """
        from app.core.exceptions import AlreadyInQueueException

        # Check if user already in queue
        existing = await self.queue_store.get_active_entry_for_user(user_id, tenant_id)
        if existing:
            raise AlreadyInQueueException(f"User {user_id} already in queue")

        queue_entry_id = f"q_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc)

        entry = QueueEntry(
            queue_entry_id=queue_entry_id,
            tenant_id=tenant_id,
            user_id=user_id,
            time_control=time_control,
            mode=mode,
            variant=variant,
            region=region,
            status=QueueEntryStatus.SEARCHING,
            enqueued_at=now,
            updated_at=now,
        )

        await self.queue_store.add_entry(entry)

        logger.info(
            f"Enqueued player {user_id} for {time_control} {mode}",
            extra={"queue_entry_id": queue_entry_id, "tenant_id": tenant_id},
        )

        return entry

    async def cancel_queue_entry(self, queue_entry_id: str, user_id: str) -> QueueEntry:
        """Cancel queue entry.

        Per service-spec 4.1.2 DELETE /v1/matchmaking/queue/{queue_entry_id}

        Args:
            queue_entry_id: Queue entry ID
            user_id: User ID (for validation)

        Returns:
            Updated queue entry

        Raises:
            QueueEntryNotFoundException: If entry not found
            CannotCancelException: If entry is finalized or invalid
        """
        from app.core.exceptions import CannotCancelException, QueueEntryNotFoundException

        entry = await self.queue_store.get_entry(queue_entry_id)
        if not entry:
            raise QueueEntryNotFoundException()

        # Validate user owns entry
        if entry.user_id != user_id:
            raise QueueEntryNotFoundException()

        # Check if already matched or finalized
        if not entry.is_searching():
            raise CannotCancelException(
                f"Cannot cancel entry in state {entry.status.value}"
            )

        await self.queue_store.update_entry_status(queue_entry_id, QueueEntryStatus.CANCELLED)

        updated_entry = await self.queue_store.get_entry(queue_entry_id)
        if not updated_entry:
            raise QueueEntryNotFoundException()

        logger.info(
            f"Cancelled queue entry {queue_entry_id}",
            extra={"user_id": user_id},
        )

        return updated_entry

    async def get_queue_status(self, queue_entry_id: str) -> QueueEntry:
        """Get queue entry status.

        Per service-spec 4.1.3 GET /v1/matchmaking/queue/{queue_entry_id}

        Args:
            queue_entry_id: Queue entry ID

        Returns:
            Queue entry

        Raises:
            QueueEntryNotFoundException: If entry not found
        """
        from app.core.exceptions import QueueEntryNotFoundException

        entry = await self.queue_store.get_entry(queue_entry_id)
        if not entry:
            raise QueueEntryNotFoundException()

        return entry

    async def get_active_matchmaking(self, user_id: str, tenant_id: str) -> dict:
        """Get active matchmaking state for user.

        Per service-spec 4.1.4 GET /v1/matchmaking/active

        Args:
            user_id: User ID
            tenant_id: Tenant ID

        Returns:
            Dict with queue_entry and match fields
        """
        entry = await self.queue_store.get_active_entry_for_user(user_id, tenant_id)

        if not entry:
            return {"queue_entry": None, "match": None}

        if entry.is_matched() and entry.match_id:
            # TODO: Get opponent info from match record or cache
            return {
                "queue_entry": None,
                "match": {
                    "game_id": entry.match_id,
                    "time_control": entry.time_control,
                    "mode": entry.mode,
                    "variant": entry.variant,
                    # opponent info would be fetched from match record
                },
            }

        return {
            "queue_entry": {
                "queue_entry_id": entry.queue_entry_id,
                "status": entry.status.value,
                "time_control": entry.time_control,
                "mode": entry.mode,
                "variant": entry.variant,
                "region": entry.region,
                "enqueued_at": entry.enqueued_at.isoformat(),
            },
            "match": None,
        }

    async def match_players(
        self, entry1: QueueEntry, entry2: QueueEntry, rating1: int, rating2: int
    ) -> bool:
        """Match two players and create game.

        Per service-spec section 2.1.3 Game Creation

        Args:
            entry1: First queue entry
            entry2: Second queue entry
            rating1: Rating for player 1
            rating2: Rating for player 2

        Returns:
            True if game created successfully
        """
        match_id = f"m_{uuid.uuid4().hex[:12]}"

        # Randomly assign white/black
        import random

        white_entry = entry1 if random.random() < 0.5 else entry2
        black_entry = entry2 if white_entry == entry1 else entry1
        white_rating = rating1 if white_entry == entry1 else rating2
        black_rating = rating2 if white_entry == entry1 else rating1

        try:
            # Call live-game-api to create game
            game_id = await self.live_game_api.create_game(
                tenant_id=entry1.tenant_id,
                white_user_id=white_entry.user_id,
                black_user_id=black_entry.user_id,
                time_control=entry1.time_control,
                mode=entry1.mode,
                variant=entry1.variant,
                rating_snapshot={"white": white_rating, "black": black_rating},
                metadata={
                    "matchmaking_source": "auto",
                    "region": entry1.region,
                },
            )

            # Create match record
            rating_snapshot = RatingSnapshot(white=white_rating, black=black_rating)
            match_record = MatchRecord(
                match_id=match_id,
                tenant_id=entry1.tenant_id,
                game_id=game_id,
                white_user_id=white_entry.user_id,
                black_user_id=black_entry.user_id,
                time_control=entry1.time_control,
                mode=entry1.mode,
                variant=entry1.variant,
                created_at=datetime.now(timezone.utc),
                queue_entry_ids=[entry1.queue_entry_id, entry2.queue_entry_id],
                rating_snapshot=rating_snapshot,
            )

            await self.match_repo.create(match_record)

            # Update queue entries with match_id
            await self.queue_store.update_entry_status(
                entry1.queue_entry_id, QueueEntryStatus.MATCHED, game_id
            )
            await self.queue_store.update_entry_status(
                entry2.queue_entry_id, QueueEntryStatus.MATCHED, game_id
            )

            logger.info(
                f"Created match {match_id} with game_id {game_id}",
                extra={
                    "white_user_id": white_entry.user_id,
                    "black_user_id": black_entry.user_id,
                    "tenant_id": entry1.tenant_id,
                },
            )

            return True

        except Exception as e:
            logger.error(
                f"Failed to create match: {str(e)}",
                extra={"match_id": match_id},
            )
            return False

    def _rating_in_window(
        self, player_rating: int, candidate_rating: int, window: int
    ) -> bool:
        """Check if candidate rating is within window of player rating."""
        return abs(player_rating - candidate_rating) <= window

    async def find_matches_for_pool(self, tenant_id: str, pool_key: str) -> list[tuple]:
        """Find matches for a pool.

        Per service-spec section 2.1.2 Matchmaking Logic

        Args:
            tenant_id: Tenant ID
            pool_key: Pool key (e.g., "standard_5+0_rated_ASIA")

        Returns:
            List of (entry1, entry2) tuples for potential matches
        """
        entries = await self.queue_store.get_queue_by_pool(
            tenant_id, pool_key, QueueEntryStatus.SEARCHING
        )

        if len(entries) < 2:
            return []

        # Sort by time in queue (oldest first - higher priority)
        now = datetime.now(timezone.utc)
        entries.sort(key=lambda e: e.time_in_queue_seconds(now), reverse=True)

        # Simple greedy matching with rating window widening
        matches = []
        used = set()

        for i, entry in enumerate(entries):
            if entry.queue_entry_id in used:
                continue

            wait_time = entry.time_in_queue_seconds(now)

            # Calculate rating window based on wait time
            initial_window = self.settings.INITIAL_RATING_WINDOW
            widening_interval = self.settings.RATING_WINDOW_WIDENING_INTERVAL
            widening_amount = self.settings.RATING_WINDOW_WIDENING_AMOUNT

            windows_widened = int(wait_time / widening_interval)
            current_window = initial_window + (windows_widened * widening_amount)

            # TODO: Get rating for player (from cache or external service)
            player_rating = 1500  # Placeholder

            # Find best match candidate
            best_match = None
            best_diff = float("inf")

            for j, candidate in enumerate(entries):
                if i >= j or candidate.queue_entry_id in used:
                    continue

                # TODO: Get rating for candidate
                candidate_rating = 1500  # Placeholder

                if self._rating_in_window(player_rating, candidate_rating, current_window):
                    diff = abs(player_rating - candidate_rating)
                    if diff < best_diff:
                        best_match = candidate
                        best_diff = diff

            if best_match:
                matches.append((entry, best_match))
                used.add(entry.queue_entry_id)
                used.add(best_match.queue_entry_id)

        return matches

    async def process_timed_out_entries(self, tenant_id: str, pool_key: str) -> int:
        """Process timed out queue entries.

        Args:
            tenant_id: Tenant ID
            pool_key: Pool key

        Returns:
            Number of entries timed out
        """
        entries = await self.queue_store.get_queue_by_pool(
            tenant_id, pool_key, QueueEntryStatus.SEARCHING
        )

        now = datetime.now(timezone.utc)
        max_wait = self.settings.MAX_QUEUE_TIME_SECONDS
        timed_out_count = 0

        for entry in entries:
            wait_time = entry.time_in_queue_seconds(now)
            if wait_time > max_wait:
                await self.queue_store.update_entry_status(
                    entry.queue_entry_id, QueueEntryStatus.TIMED_OUT
                )
                timed_out_count += 1
                logger.info(
                    f"Timed out queue entry {entry.queue_entry_id}",
                    extra={"user_id": entry.user_id, "wait_seconds": wait_time},
                )

        return timed_out_count
