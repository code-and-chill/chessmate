"""Event publisher for domain events."""

import logging
from typing import Optional

from app.core.config import get_settings
from app.domain.models.match_created_event import MatchCreatedEvent
from app.infrastructure.events.kafka_producer import KafkaProducer

logger = logging.getLogger(__name__)


class EventPublisher:
    """Publishes domain events to Kafka."""

    def __init__(self, kafka_producer: Optional[KafkaProducer] = None):
        """Initialize event publisher.

        Args:
            kafka_producer: Optional Kafka producer instance (for testing)
        """
        settings = get_settings()
        if kafka_producer is None:
            if settings.KAFKA_ENABLED:
                self.kafka_producer = KafkaProducer(
                    bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
                    topic=settings.KAFKA_MATCHMAKING_MATCHES_TOPIC,
                    acks=settings.KAFKA_PRODUCER_ACKS,
                    retries=settings.KAFKA_PRODUCER_RETRIES,
                    max_in_flight_requests_per_connection=settings.KAFKA_PRODUCER_MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION,
                )
            else:
                self.kafka_producer = None
                logger.warning("Kafka event publishing is disabled")
        else:
            self.kafka_producer = kafka_producer

    def _serialize_event(self, event: MatchCreatedEvent) -> dict:
        """Serialize domain event to dictionary.

        Args:
            event: Domain event to serialize

        Returns:
            Dictionary representation of event
        """
        # Convert event to dict using Pydantic's dict method
        event_dict = event.model_dump(mode="json")
        return event_dict

    def publish_match_created(self, event: MatchCreatedEvent) -> None:
        """Publish MatchCreated event.

        Args:
            event: MatchCreatedEvent to publish
        """
        if not self.kafka_producer:
            logger.debug("Kafka producer not available, skipping event publish")
            return

        try:
            event_data = self._serialize_event(event)
            # Use match_id as partition key for ordering
            partition_key = event.match_id
            
            self.kafka_producer.publish(
                event_data=event_data,
                partition_key=partition_key,
            )
            logger.info(f"Published MatchCreated event for match {event.match_id}, game {event.game_id}")
        except Exception as e:
            logger.error(f"Failed to publish MatchCreated event: {e}", exc_info=True)
            # Don't raise - we want to fail gracefully

    def flush(self) -> None:
        """Flush pending events."""
        if self.kafka_producer:
            self.kafka_producer.flush()

    def close(self) -> None:
        """Close publisher connection."""
        if self.kafka_producer:
            self.kafka_producer.close()
