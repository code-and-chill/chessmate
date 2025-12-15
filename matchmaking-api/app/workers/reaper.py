"""Ticket reaper to expire stale tickets."""
import asyncio
import logging
from datetime import datetime, timezone

from app.core.config import get_settings
from app.infrastructure.database.match_ticket_model import MatchTicketStatus
from app.repositories.ticket_repository import TicketRepository

logger = logging.getLogger(__name__)


class TicketReaper:
    """Background worker that expires stale matchmaking tickets."""

    def __init__(self, ticket_repo: TicketRepository) -> None:
        self.ticket_repo = ticket_repo
        self.settings = get_settings()
        self.running = False

    async def start(self) -> None:
        """Begin the reaper loop."""

        self.running = True
        logger.info("Ticket reaper started")

        while self.running:
            try:
                await self.run_once()
            except Exception:
                logger.exception("Ticket reaper iteration failed")

            await asyncio.sleep(self.settings.HEARTBEAT_REAPER_INTERVAL_SECONDS)

    async def stop(self) -> None:
        """Stop the reaper loop."""

        self.running = False
        logger.info("Ticket reaper stopped")

    async def run_once(self) -> None:
        """Run a single reaping iteration."""

        cutoff = datetime.now(timezone.utc)
        stale_tickets = await self.ticket_repo.find_stale_tickets(cutoff)

        for ticket in stale_tickets:
            await self.ticket_repo.update_status(ticket.ticket_id, MatchTicketStatus.EXPIRED)
            logger.info("Expired ticket due to missed heartbeat", extra={"ticket_id": ticket.ticket_id})
