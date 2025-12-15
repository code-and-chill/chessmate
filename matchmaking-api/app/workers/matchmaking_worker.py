"""Matchmaking worker process."""
import asyncio
import logging
import uuid
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Optional

from app.core.config import get_settings
from app.domain.services.matchmaking_service import MatchmakingService
from app.infrastructure.database.match_ticket_model import MatchTicketStatus
from app.repositories.postgres_ticket_repository import PostgresTicketRepository

logger = logging.getLogger(__name__)


_MATCHMAKING_STATUSES = {MatchTicketStatus.QUEUED, MatchTicketStatus.SEARCHING}


class MatchmakingWorker:
    """Background worker for matchmaking.

    Per service-spec section 3.1 Matchmaking Workers

    Runs periodically to:
    - Find matching players in queues
    - Create games via live-game-api
    - Handle queue timeouts
    """

    def __init__(
        self,
        matchmaking_service: MatchmakingService,
        ticket_repo: Optional[PostgresTicketRepository] = None,
    ) -> None:
        """Initialize worker.

        Args:
            matchmaking_service: Matchmaking service instance
        """
        self.matchmaking_service = matchmaking_service
        self.settings = get_settings()
        self.running = False
        self.ticket_repo = ticket_repo
        self.pool_keys: set[str] = set()

    async def start(self) -> None:
        """Start worker loop."""
        self.running = True
        logger.info("Matchmaking worker started")

        await self._refresh_active_pool_keys()

        while self.running:
            try:
                await self._process_matching_cycle()
            except Exception as e:
                logger.error(f"Error in matching cycle: {str(e)}", exc_info=True)

            await asyncio.sleep(self.settings.WORKER_INTERVAL_SECONDS)

    async def stop(self) -> None:
        """Stop worker loop."""
        self.running = False
        logger.info("Matchmaking worker stopped")

    async def _process_matching_cycle(self) -> None:
        """Process one matching cycle.

        Finds matches for all pools and creates games.
        """
        await self._refresh_active_pool_keys()
        await self._process_proposals()

    async def _process_proposals(self) -> None:
        """Create ready-check proposals for eligible tickets."""

        if not self.ticket_repo:
            return

        active_tickets = await self.ticket_repo.list_active_tickets()
        tickets_by_pool: dict[str, list] = defaultdict(list)

        for ticket in active_tickets:
            if ticket.status in _MATCHMAKING_STATUSES:
                tickets_by_pool[ticket.pool_key].append(ticket)

        for pool_key, tickets in tickets_by_pool.items():
            tickets.sort(key=lambda t: t.created_at)

            while len(tickets) >= 2:
                ticket_batch = [tickets.pop(0), tickets.pop(0)]
                proposal_id = f"prop_{uuid.uuid4().hex[:12]}"
                proposal_timeout_at = datetime.now(timezone.utc) + timedelta(
                    seconds=self.settings.PROPOSING_TIMEOUT_SECONDS
                )

                created = await self.ticket_repo.create_proposal(
                    [t.ticket_id for t in ticket_batch],
                    proposal_id=proposal_id,
                    proposal_timeout_at=proposal_timeout_at,
                )

                if created:
                    logger.info(
                        "Created proposal",
                        extra={
                            "proposal_id": proposal_id,
                            "pool_key": pool_key,
                            "tickets": [t.ticket_id for t in created],
                        },
                    )
                else:
                    logger.debug(
                        "Skipped proposal creation due to race",
                        extra={
                            "proposal_id": proposal_id,
                            "pool_key": pool_key,
                            "tickets": [t.ticket_id for t in ticket_batch],
                        },
                    )

    async def _refresh_active_pool_keys(self) -> None:
        if not self.ticket_repo:
            return

        tickets = await self.ticket_repo.list_active_tickets()
        self.pool_keys = {
            ticket.pool_key for ticket in tickets if ticket.status in _MATCHMAKING_STATUSES
        }


async def run_worker(
    matchmaking_service: MatchmakingService,
    ticket_repo: Optional[PostgresTicketRepository] = None,
) -> None:
    """Run matchmaking worker.

    Args:
        matchmaking_service: Matchmaking service instance
    """
    worker = MatchmakingWorker(matchmaking_service, ticket_repo)

    try:
        await worker.start()
    except KeyboardInterrupt:
        logger.info("Received shutdown signal")
        await worker.stop()
    except Exception as e:
        logger.error(f"Worker crashed: {str(e)}", exc_info=True)
        await worker.stop()
