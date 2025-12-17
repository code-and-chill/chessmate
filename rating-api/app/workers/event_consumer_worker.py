"""Background worker for consuming Kafka game events."""

import asyncio
import logging
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.infrastructure.database import get_db_session
from app.infrastructure.events.event_processor import EventProcessor
from app.infrastructure.events.kafka_consumer import KafkaEventConsumer

logger = logging.getLogger(__name__)


class EventConsumerWorker:
    """Background worker for consuming game.ended events from Kafka."""

    def __init__(self):
        """Initialize event consumer worker."""
        self.settings = get_settings()
        self.consumer: Optional[KafkaEventConsumer] = None
        self.processor = EventProcessor()
        self.running = False

    async def _process_message(self, event_data: dict) -> None:
        """Process a single event message.

        Args:
            event_data: Event data dictionary from Kafka
        """
        # Create database session for this message
        async for db in get_db_session():
            try:
                await self.processor.process_game_ended_event(event_data, db)
                # Session will be committed/closed by context manager
            except Exception as e:
                logger.error(f"Failed to process event: {e}", exc_info=True)
                # Session will be rolled back by context manager
                raise

    def _sync_message_handler(self, event_data: dict) -> None:
        """Synchronous message handler wrapper for Kafka consumer.

        Args:
            event_data: Event data dictionary from Kafka
        """
        # Run async handler in event loop
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # If loop is running, schedule as task
                asyncio.create_task(self._process_message(event_data))
            else:
                # If loop is not running, run it
                loop.run_until_complete(self._process_message(event_data))
        except RuntimeError:
            # No event loop, create new one
            asyncio.run(self._process_message(event_data))

    def start(self) -> None:
        """Start the consumer worker."""
        if self.running:
            logger.warning("Worker is already running")
            return

        if not self.settings.KAFKA_CONSUMER_ENABLED:
            logger.info("Kafka consumer is disabled in configuration")
            return

        self.consumer = KafkaEventConsumer()
        self.running = True

        logger.info("Starting Kafka event consumer worker...")
        # Start consumer in a separate thread (Kafka consumer is synchronous)
        import threading

        def run_consumer():
            self.consumer.start(self._sync_message_handler)

        thread = threading.Thread(target=run_consumer, daemon=True)
        thread.start()
        logger.info("Kafka event consumer worker started")

    def stop(self) -> None:
        """Stop the consumer worker."""
        self.running = False
        if self.consumer:
            self.consumer.stop()
        logger.info("Kafka event consumer worker stopped")


# Global worker instance
_worker: Optional[EventConsumerWorker] = None


def get_event_consumer_worker() -> EventConsumerWorker:
    """Get global event consumer worker instance."""
    global _worker
    if _worker is None:
        _worker = EventConsumerWorker()
    return _worker
