"""Event publisher for domain events."""

import logging
from typing import Optional
from uuid import UUID

from app.core.config import get_settings
from app.domain.models.base_domain_event import BaseDomainEvent
from app.domain.models.game import (
    GameCreatedEvent,
    GameEndedEvent,
    MovePlayedEvent,
)
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
                    topic=settings.KAFKA_GAME_EVENTS_TOPIC,
                    acks=settings.KAFKA_PRODUCER_ACKS,
                    retries=settings.KAFKA_PRODUCER_RETRIES,
                    max_in_flight_requests_per_connection=settings.KAFKA_PRODUCER_MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION,
                )
            else:
                self.kafka_producer = None
                logger.warning("Kafka event publishing is disabled")
        else:
            self.kafka_producer = kafka_producer

    def _serialize_event(self, event: BaseDomainEvent) -> dict:
        """Serialize domain event to dictionary.

        Args:
            event: Domain event to serialize

        Returns:
            Dictionary representation of event
        """
        # Convert event to dict using Pydantic's dict method
        event_dict = event.model_dump(mode="json")
        return event_dict

    def _get_partition_key(self, event: BaseDomainEvent) -> Optional[str]:
        """Get partition key for event (game_id for ordering).

        Args:
            event: Domain event

        Returns:
            Partition key (game_id as string) or None
        """
        # Use aggregate_id (game_id) as partition key to ensure ordering per game
        return str(event.aggregate_id)

    def publish_game_created(self, event: GameCreatedEvent) -> None:
        """Publish GameCreated event.

        Args:
            event: GameCreatedEvent to publish
        """
        if not self.kafka_producer:
            logger.debug("Kafka producer not available, skipping event publish")
            return

        try:
            event_data = self._serialize_event(event)
            partition_key = self._get_partition_key(event)
            
            self.kafka_producer.publish(
                event_data=event_data,
                partition_key=partition_key,
            )
            logger.info(f"Published GameCreated event for game {event.aggregate_id}")
        except Exception as e:
            logger.error(f"Failed to publish GameCreated event: {e}", exc_info=True)
            # Don't raise - we want to fail gracefully

    def publish_move_played(self, event: MovePlayedEvent) -> None:
        """Publish MovePlayed event.

        Args:
            event: MovePlayedEvent to publish
        """
        if not self.kafka_producer:
            logger.debug("Kafka producer not available, skipping event publish")
            return

        try:
            event_data = self._serialize_event(event)
            partition_key = self._get_partition_key(event)
            
            self.kafka_producer.publish(
                event_data=event_data,
                partition_key=partition_key,
            )
            logger.debug(f"Published MovePlayed event for game {event.aggregate_id}, move {event.move.ply}")
        except Exception as e:
            logger.error(f"Failed to publish MovePlayed event: {e}", exc_info=True)
            # Don't raise - we want to fail gracefully

    def publish_game_ended(self, event: GameEndedEvent) -> None:
        """Publish GameEnded event.

        Args:
            event: GameEndedEvent to publish
        """
        if not self.kafka_producer:
            logger.debug("Kafka producer not available, skipping event publish")
            return

        try:
            event_data = self._serialize_event(event)
            partition_key = self._get_partition_key(event)
            
            self.kafka_producer.publish(
                event_data=event_data,
                partition_key=partition_key,
            )
            logger.info(f"Published GameEnded event for game {event.aggregate_id}, result: {event.result}")
        except Exception as e:
            logger.error(f"Failed to publish GameEnded event: {e}", exc_info=True)
            # Don't raise - we want to fail gracefully

    def flush(self) -> None:
        """Flush pending events."""
        if self.kafka_producer:
            self.kafka_producer.flush()

    def close(self) -> None:
        """Close publisher connection."""
        if self.kafka_producer:
            self.kafka_producer.close()
