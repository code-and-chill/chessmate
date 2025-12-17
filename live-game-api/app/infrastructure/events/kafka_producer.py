"""Kafka producer for domain events."""

import json
import logging
from typing import Dict, Any, Optional
from uuid import UUID

from confluent_kafka import Producer
from confluent_kafka.admin import AdminClient, NewTopic
from confluent_kafka.cimpl import KafkaException

logger = logging.getLogger(__name__)


class KafkaProducer:
    """Kafka producer for publishing domain events."""

    def __init__(
        self,
        bootstrap_servers: str,
        topic: str,
        acks: str = "all",
        retries: int = 3,
        max_in_flight_requests_per_connection: int = 1,
    ):
        """Initialize Kafka producer.

        Args:
            bootstrap_servers: Kafka broker addresses (comma-separated)
            topic: Topic name for events
            acks: Producer acknowledgment mode ("all", "1", "0")
            retries: Number of retries for failed sends
            max_in_flight_requests_per_connection: Max in-flight requests (1 ensures ordering)
        """
        self.bootstrap_servers = bootstrap_servers
        self.topic = topic
        self.config = {
            "bootstrap.servers": bootstrap_servers,
            "acks": acks,
            "retries": retries,
            "max.in.flight.requests.per.connection": max_in_flight_requests_per_connection,
            "enable.idempotence": True,  # Enable idempotent producer
            "compression.type": "snappy",  # Compress messages
        }
        self.producer: Optional[Producer] = None

    def _get_producer(self) -> Producer:
        """Get or create Kafka producer instance."""
        if self.producer is None:
            self.producer = Producer(self.config)
        return self.producer

    def _delivery_callback(self, err, msg):
        """Handle delivery callback."""
        if err is not None:
            logger.error(f"Failed to deliver message: {err}", exc_info=True)
        else:
            logger.debug(f"Message delivered to {msg.topic()} [{msg.partition()}] @ {msg.offset()}")

    def publish(
        self,
        event_data: Dict[str, Any],
        partition_key: Optional[str] = None,
    ) -> None:
        """Publish event to Kafka.

        Args:
            event_data: Event data dictionary (will be JSON serialized)
            partition_key: Partition key for routing (typically game_id for ordering)
        """
        try:
            producer = self._get_producer()
            value = json.dumps(event_data, default=str).encode("utf-8")
            
            # Use partition key if provided (ensures ordering per game)
            key = partition_key.encode("utf-8") if partition_key else None
            
            producer.produce(
                topic=self.topic,
                value=value,
                key=key,
                callback=self._delivery_callback,
            )
            
            # Poll to trigger delivery callbacks
            producer.poll(0)
            
        except Exception as e:
            logger.error(f"Error publishing event to Kafka: {e}", exc_info=True)
            # Don't raise - we want to fail gracefully if Kafka is unavailable

    def flush(self, timeout: float = 10.0) -> None:
        """Flush pending messages.

        Args:
            timeout: Maximum time to wait for flush (seconds)
        """
        if self.producer:
            try:
                self.producer.flush(timeout)
            except Exception as e:
                logger.error(f"Error flushing Kafka producer: {e}", exc_info=True)

    def ensure_topic_exists(self, num_partitions: int = 64, replication_factor: int = 1) -> None:
        """Ensure topic exists (create if it doesn't).

        Args:
            num_partitions: Number of partitions for the topic
            replication_factor: Replication factor
        """
        admin_client = AdminClient({"bootstrap.servers": self.bootstrap_servers})
        
        topic_list = [NewTopic(self.topic, num_partitions=num_partitions, replication_factor=replication_factor)]
        
        try:
            futures = admin_client.create_topics(topic_list)
            for topic, future in futures.items():
                try:
                    future.result()  # Wait for topic creation
                    logger.info(f"Topic {topic} created successfully")
                except KafkaException as e:
                    if e.args[0].code() == KafkaException.TOPIC_ALREADY_EXISTS:
                        logger.debug(f"Topic {topic} already exists")
                    else:
                        logger.error(f"Failed to create topic {topic}: {e}", exc_info=True)
        except Exception as e:
            logger.error(f"Error ensuring topic exists: {e}", exc_info=True)

    def close(self) -> None:
        """Close producer connection."""
        if self.producer:
            try:
                self.flush()
                self.producer = None
            except Exception as e:
                logger.error(f"Error closing Kafka producer: {e}", exc_info=True)
