"""Matchmaking logic service."""
import logging
import time
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from app.clients.rating_client import PlayerRating, RatingAPIClient
from app.core.config import get_settings
from app.domain.models import (
    HardConstraints,
    MatchCreatedEvent,
    MatchRecord,
    Player,
    QueueEntryStatus,
    RatingSnapshot,
    SoftConstraints,
    Ticket,
    TicketType,
    WideningState,
)
from app.domain.repositories.match_record import MatchRecordRepository
from app.domain.repositories.queue_store import QueueStoreRepository
from app.domain.utils.time_control import rating_pool_id_from_constraints
from app.infrastructure.external.live_game_api import LiveGameAPIClient
from app.infrastructure.resilience.circuit_breaker import CircuitBreakerOpenError
from app.infrastructure.queues.failed_matches_queue import FailedMatchesQueue, FailedMatch
from app.core.metrics import (
    matchmaking_match_latency_seconds,
    matchmaking_matches_created_total,
)

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
        rating_api: RatingAPIClient,
        event_publisher = None,
    ) -> None:
        """Initialize matchmaking service.

        Args:
            queue_store: Queue storage repository
            match_repo: Match record repository
            live_game_api: Live game API client
            rating_api: Rating API client
            event_publisher: Event publisher for Kafka events
        """
        self.queue_store = queue_store
        self.match_repo = match_repo
        self.live_game_api = live_game_api
        self.rating_api = rating_api
        self.event_publisher = event_publisher
        self.settings = get_settings()

    async def enqueue_player(
        self,
        user_id: str,
        tenant_id: str,
        time_control: str,
        mode: str,
        variant: str = "standard",
        region: str = "DEFAULT",
        ticket_type: TicketType = TicketType.SOLO,
        players: Optional[list[Player]] = None,
        soft_constraints: Optional[SoftConstraints] = None,
        idempotency_key: Optional[str] = None,
        client_request_id: Optional[str] = None,
    ) -> Ticket:
        """Enqueue player for matchmaking.

        Per service-spec 4.1.1 POST /v1/matchmaking/queue

        Args:
            user_id: User identifier
            tenant_id: Tenant identifier
            time_control: Time control (e.g., "5+0")
            mode: Mode ("rated" or "casual")
            variant: Variant (default "standard")
            region: Region (default "DEFAULT")
            ticket_type: Solo or party ticket
            players: Optional explicit player roster
            soft_constraints: Optional soft preferences
            idempotency_key: Optional idempotency token
            client_request_id: Optional request correlation

        Returns:
            Ticket

        Raises:
            AlreadyInQueueException: If user already in queue
        """
        from app.core.exceptions import AlreadyInQueueException

        # Check if user already in queue
        existing = await self.queue_store.get_active_entry_for_user(user_id, tenant_id)
        if existing:
            raise AlreadyInQueueException(f"User {user_id} already in queue")

        ticket_id = f"t_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc)

        hard_constraints = HardConstraints(
            time_control=time_control, mode=mode, variant=variant, region=region
        )
        widening_state = WideningState(current_window=self.settings.INITIAL_RATING_WINDOW)
        pool_id = rating_pool_id_from_constraints(variant, time_control)

        ticket_players = players or [Player(user_id=user_id)]

        await self._hydrate_player_ratings(ticket_players, pool_id)

        ticket = Ticket(
            ticket_id=ticket_id,
            tenant_id=tenant_id,
            ticket_type=ticket_type,
            status=QueueEntryStatus.SEARCHING,
            players=ticket_players,
            hard_constraints=hard_constraints,
            soft_constraints=soft_constraints,
            widening_state=widening_state,
            enqueued_at=now,
            updated_at=now,
            idempotency_key=idempotency_key,
            client_request_id=client_request_id,
        )

        await self.queue_store.add_entry(ticket)

        logger.info(
            f"Enqueued player {user_id} for {time_control} {mode}",
            extra={"queue_entry_id": ticket_id, "tenant_id": tenant_id},
        )

        return ticket

    async def cancel_queue_entry(self, queue_entry_id: str, user_id: str) -> Ticket:
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
        if entry.players[0].user_id != user_id:
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

    async def get_queue_status(self, queue_entry_id: str) -> Ticket:
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
                    "time_control": entry.hard_constraints.time_control,
                    "mode": entry.hard_constraints.mode,
                    "variant": entry.hard_constraints.variant,
                    # opponent info would be fetched from match record
                },
            }

        return {"queue_entry": entry, "match": None}

    async def match_players(
        self, entry1: Ticket, entry2: Ticket, rating1: int, rating2: int, region: str
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
        start_time = time.time()
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
                white_user_id=white_entry.players[0].user_id,
                black_user_id=black_entry.players[0].user_id,
                time_control=entry1.hard_constraints.time_control,
                mode=entry1.hard_constraints.mode,
                variant=entry1.hard_constraints.variant,
                rating_snapshot={"white": white_rating, "black": black_rating},
                metadata={
                    "matchmaking_source": "auto",
                    "region": region,
                },
            )
        except CircuitBreakerOpenError as e:
            # Circuit breaker is open - queue for retry
            logger.warning(f"Circuit breaker open, queueing match for retry: {str(e)}")
            if self.failed_matches_queue:
                failed_match = FailedMatch(
                    tenant_id=entry1.tenant_id,
                    white_user_id=white_entry.players[0].user_id,
                    black_user_id=black_entry.players[0].user_id,
                    time_control=entry1.hard_constraints.time_control,
                    mode=entry1.hard_constraints.mode,
                    variant=entry1.hard_constraints.variant,
                    rating_snapshot={"white": white_rating, "black": black_rating},
                    metadata={"matchmaking_source": "auto", "region": region},
                    failure_reason=f"Circuit breaker open: {str(e)}",
                    match_id=match_id,
                )
                await self.failed_matches_queue.enqueue(failed_match)
            # Don't update queue entries as failed - they'll be retried
            return False
        except Exception as e:

            # Create match record
            rating_snapshot = RatingSnapshot(white=white_rating, black=black_rating)
            match_record = MatchRecord(
                match_id=match_id,
                tenant_id=entry1.tenant_id,
                game_id=game_id,
                white_user_id=white_entry.players[0].user_id,
                black_user_id=black_entry.players[0].user_id,
                time_control=entry1.hard_constraints.time_control,
                mode=entry1.hard_constraints.mode,
                variant=entry1.hard_constraints.variant,
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

            # Publish MatchCreated event
            if self.event_publisher:
                match_created_event = MatchCreatedEvent(
                    match_id=match_id,
                    white_player_id=white_entry.players[0].user_id,
                    black_player_id=black_entry.players[0].user_id,
                    game_id=game_id,
                    time_control=entry1.hard_constraints.time_control,
                )
                self.event_publisher.publish_match_created(match_created_event)

            # Record metrics
            latency = time.time() - start_time
            matchmaking_match_latency_seconds.observe(latency)
            matchmaking_matches_created_total.inc()

            logger.info(
                f"Created match {match_id} with game_id {game_id}",
                extra={
                    "white_user_id": white_entry.players[0].user_id,
                    "black_user_id": black_entry.players[0].user_id,
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

    def _is_entry_expired(self, entry: Ticket, now: datetime) -> bool:
        """Determine if an entry should be removed due to heartbeat timeout."""

        timeout_seconds = self.settings.HEARTBEAT_TIMEOUT_SECONDS
        if timeout_seconds <= 0 or not entry.last_heartbeat_at:
            return False

        delta = now - entry.last_heartbeat_at
        return delta.total_seconds() > timeout_seconds

    async def find_matches_for_pool(
        self, tenant_id: str, pool_key: str
    ) -> list[tuple[Ticket, Ticket, str]]:
        """Find matches for a pool.

        Per service-spec section 2.1.2 Matchmaking Logic

        Args:
            tenant_id: Tenant ID
            pool_key: Pool key (e.g., "mode:rated|variant:standard|tc:5+0|region:ASIA")

        Returns:
            List of (entry1, entry2) tuples for potential matches
        """
        entries = await self.queue_store.get_queue_by_pool(
            tenant_id, pool_key, QueueEntryStatus.SEARCHING
        )

        now = datetime.now(timezone.utc)
        entries = [
            entry for entry in entries if not self._is_entry_expired(entry, now)
        ]

        if len(entries) < 2:
            return []

        # Sort by time in queue (oldest first - higher priority)
        entries.sort(key=lambda e: e.time_in_queue_seconds(now), reverse=True)

        pool_id = rating_pool_id_from_constraints(
            entries[0].hard_constraints.variant, entries[0].hard_constraints.time_control
        )
        user_ids = [entry.players[0].user_id for entry in entries]
        ratings = await self.rating_api.get_bulk_ratings(user_ids, pool_id)

        def _get_rating(ticket: Ticket) -> PlayerRating:
            rating = ratings.get(ticket.players[0].user_id)
            if rating:
                ticket.players[0].rating = rating.rating
                ticket.players[0].rating_deviation = rating.rating_deviation
                return rating
            return PlayerRating(
                rating=self.settings.RATING_DEFAULT_MMR,
                rating_deviation=self.settings.RATING_DEFAULT_RD,
            )

        # Simple greedy matching with rating window widening
        matches: list[tuple[Ticket, Ticket, str]] = []
        used = set()

        for i, entry in enumerate(entries):
            if entry.queue_entry_id in used:
                continue

            wait_time = entry.time_in_queue_seconds(now)

            # Calculate rating window based on wait time
            initial_window = (
                entry.soft_constraints.rating_window
                if entry.soft_constraints and entry.soft_constraints.rating_window
                else entry.widening_state.current_window
                if entry.widening_state.current_window
                else self.settings.INITIAL_RATING_WINDOW
            )
            widening_interval = self.settings.RATING_WINDOW_WIDENING_INTERVAL
            widening_amount = self.settings.RATING_WINDOW_WIDENING_AMOUNT

            windows_widened = int(wait_time / widening_interval)
            new_stage = max(entry.widening_state.stage, windows_widened)
            current_window = initial_window + (new_stage * widening_amount)

            if new_stage > entry.widening_state.stage:
                entry.widening_state.last_widened_at = now

            entry.widening_state.stage = new_stage
            entry.widening_state.current_window = current_window
            entry.widening_state.widen_count = new_stage

            player_rating = _get_rating(entry).rating

            # Find best match candidate
            best_match = None
            best_diff = float("inf")

            for j, candidate in enumerate(entries):
                if i >= j or candidate.queue_entry_id in used:
                    continue

                candidate_rating = _get_rating(candidate).rating

                if not self._regions_compatible(entry, candidate):
                    continue

                match_region = self._select_match_region(entry, candidate)
                if not (
                    self._within_latency_budget(entry, match_region)
                    and self._within_latency_budget(candidate, match_region)
                ):
                    continue

                if self._rating_in_window(player_rating, candidate_rating, current_window):
                    diff = abs(player_rating - candidate_rating)
                    if diff < best_diff:
                        best_match = candidate
                        best_diff = diff

            if best_match:
                match_region = self._select_match_region(entry, best_match)
                matches.append((entry, best_match, match_region))
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
                    extra={"user_id": entry.players[0].user_id, "wait_seconds": wait_time},
                )

        return timed_out_count

    async def _hydrate_player_ratings(
        self, players: list[Player], pool_id: str
    ) -> None:
        """Fetch and attach rating + RD for the provided players."""

        user_ids = [player.user_id for player in players]
        ratings = await self.rating_api.get_bulk_ratings(user_ids, pool_id)

        for player in players:
            rating = ratings.get(player.user_id)
            if rating:
                player.rating = rating.rating
                player.rating_deviation = rating.rating_deviation
            else:
                player.rating = self.settings.RATING_DEFAULT_MMR
                player.rating_deviation = self.settings.RATING_DEFAULT_RD

    def _regions_compatible(self, entry: Ticket, candidate: Ticket) -> bool:
        preferred_entry = (
            entry.soft_constraints.preferred_region if entry.soft_constraints else None
        )
        preferred_candidate = (
            candidate.soft_constraints.preferred_region
            if candidate.soft_constraints
            else None
        )

        if preferred_entry and preferred_candidate and preferred_entry != preferred_candidate:
            return False
        return True

    def _within_latency_budget(self, entry: Ticket, region: str) -> bool:
        max_latency = entry.soft_constraints.max_latency_ms if entry.soft_constraints else None
        if not max_latency:
            return True

        metadata = entry.players[0].metadata or {}
        latency_map = metadata.get("latency_ms") or {}
        latency = latency_map.get(region)
        return latency is None or latency <= max_latency

    def _select_match_region(self, entry: Ticket, candidate: Ticket) -> str:
        preferred_entry = (
            entry.soft_constraints.preferred_region if entry.soft_constraints else None
        )
        preferred_candidate = (
            candidate.soft_constraints.preferred_region
            if candidate.soft_constraints
            else None
        )

        if preferred_entry and preferred_candidate and preferred_entry == preferred_candidate:
            return preferred_entry
        if preferred_entry:
            return preferred_entry
        if preferred_candidate:
            return preferred_candidate
        if entry.hard_constraints.region == candidate.hard_constraints.region:
            return entry.hard_constraints.region
        return entry.hard_constraints.region or candidate.hard_constraints.region
