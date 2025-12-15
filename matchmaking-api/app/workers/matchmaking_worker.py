"""Matchmaking worker process."""
import asyncio
import logging
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
        # TODO: Get list of active pool keys from Redis/config
        # For now, just demonstrate the workflow
        pool_keys = (
            list(self.pool_keys)
            if self.pool_keys
            else [
                "standard_5+0_rated_ASIA",
                "standard_5+0_casual_ASIA",
                "standard_3+2_rated_EUROPE",
            ]
        )

        for pool_key in pool_keys:
            await self._process_pool(pool_key)

    async def _process_pool(self, pool_key: str) -> None:
        """Process matchmaking for a single pool.

        Args:
            pool_key: Pool identifier
        """
        tenant_id = "t_default"  # TODO: Parameterize

        try:
            # Find potential matches
            matches = await self.matchmaking_service.find_matches_for_pool(
                tenant_id, pool_key
            )

            # Process matches in batches
            batch_size = self.settings.MATCH_PAIRS_PER_BATCH
            for i in range(0, len(matches), batch_size):
                batch = matches[i : i + batch_size]

                for entry1, entry2 in batch:
                    # TODO: Get ratings from rating service/cache
                    rating1 = 1500
                    rating2 = 1500

                    success = await self.matchmaking_service.match_players(
                        entry1, entry2, rating1, rating2
                    )

                    if success:
                        logger.info(
                            f"Successfully matched players",
                            extra={
                                "user1": entry1.user_id,
                                "user2": entry2.user_id,
                                "pool_key": pool_key,
                            },
                        )
                    else:
                        logger.warning(
                            f"Failed to match players",
                            extra={"user1": entry1.user_id, "user2": entry2.user_id},
                        )

            # Handle timeouts
            timed_out_count = await self.matchmaking_service.process_timed_out_entries(
                tenant_id, pool_key
            )

            if timed_out_count > 0:
                logger.info(
                    f"Timed out {timed_out_count} entries in pool {pool_key}",
                    extra={"pool_key": pool_key},
                )

        except Exception as e:
            logger.error(
                f"Error processing pool {pool_key}: {str(e)}",
                extra={"pool_key": pool_key},
                exc_info=True,
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
