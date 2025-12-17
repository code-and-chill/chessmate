"""Kafka consumer for game events."""

import json
import logging
from typing import Callable, Optional

from confluent_kafka import Consumer, KafkaError, KafkaException

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class KafkaEventConsumer:
    """Kafka consumer for game events."""

    def __init__(
        self,
        bootstrap_servers: Optional[str] = None,
        topic: Optional[str] = None,
        group_id: Optional[str] = None,
        auto_commit: bool = True,
    ):
        """Initialize Kafka consumer.

        Args:
            bootstrap_servers: Kafka bootstrap servers (defaults to config)
            topic: Topic to consume from (defaults to config)
            group_id: Consumer group ID (defaults to config)
            auto_commit: Whether to auto-commit offsets (default True)
        """
        self.settings = get_settings()
        self.bootstrap_servers = bootstrap_servers or self.settings.KAFKA_BOOTSTRAP_SERVERS
        self.topic = topic or self.settings.KAFKA_GAME_EVENTS_TOPIC
        self.group_id = group_id or self.settings.KAFKA_CONSUMER_GROUP_ID
        self.auto_commit = auto_commit
        self.consumer: Optional[Consumer] = None
        self.running = False

    def _create_consumer(self) -> Consumer:
        """Create Kafka consumer instance."""
        config = {
            "bootstrap.servers": self.bootstrap_servers,
            "group.id": self.group_id,
            "auto.offset.reset": "earliest",  # Start from beginning if no offset
            "enable.auto.commit": self.auto_commit,
            "auto.commit.interval.ms": 5000,  # Commit every 5 seconds
        }
        return Consumer(config)

    def start(self, message_handler: Callable[[dict], None]) -> None:
        """Start consuming messages.

        Args:
            message_handler: Callback function to handle messages
        """
        if self.running:
            logger.warning("Consumer is already running")
            return

        self.consumer = self._create_consumer()
        self.consumer.subscribe([self.topic])
        self.running = True

        logger.info(f"Started Kafka consumer for topic: {self.topic}, group: {self.group_id}")

        try:
            while self.running:
                msg = self.consumer.poll(timeout=1.0)
                
                if msg is None:
                    continue

                if msg.error():
                    if msg.error().code() == KafkaError._PARTITION_EOF:
                        # End of partition - not an error, continue
                        logger.debug(f"Reached end of partition {msg.partition()}")
                        continue
                    else:
                        logger.error(f"Kafka error: {msg.error()}")
                        continue

                try:
                    # Parse message value
                    event_data = json.loads(msg.value().decode("utf-8"))
                    logger.debug(f"Received event: {event_data.get('event_type')}")
                    
                    # Call message handler
                    message_handler(event_data)
                    
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse message: {e}")
                except Exception as e:
                    logger.error(f"Error processing message: {e}", exc_info=True)
                    # Continue processing other messages

        except KeyboardInterrupt:
            logger.info("Consumer interrupted by user")
        except Exception as e:
            logger.error(f"Consumer error: {e}", exc_info=True)
        finally:
            self.stop()

    def stop(self) -> None:
        """Stop consuming messages."""
        self.running = False
        if self.consumer:
            self.consumer.close()
            self.consumer = None
            logger.info("Stopped Kafka consumer")

    def close(self) -> None:
        """Close consumer (alias for stop)."""
        self.stop()
