"""Backfill service for replaying events from Kafka."""

import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from confluent_kafka import Consumer, KafkaError, TopicPartition
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.domain.schemas import GameResultIn
from app.infrastructure.database import get_db_session
from app.infrastructure.events.event_processor import EventProcessor

logger = logging.getLogger(__name__)


def _determine_pool_id_from_time_control(time_control: dict) -> str:
    """Determine pool ID from time control (shared logic with event processor).

    Args:
        time_control: Time control dictionary

    Returns:
        Pool ID string
    """
    initial_seconds = time_control.get("initial_seconds", 0) if isinstance(time_control, dict) else 0
    total_minutes = initial_seconds / 60

    if total_minutes <= 1:
        return "bullet_standard"
    elif total_minutes <= 5:
        return "blitz_standard"
    elif total_minutes <= 15:
        return "rapid_standard"
    else:
        return "classical_standard"


class BackfillService:
    """Service for backfilling events from Kafka."""

    def __init__(self):
        """Initialize backfill service."""
        self.settings = get_settings()
        self.processor = EventProcessor()
        self.running = False
        self.current_job: Optional[dict] = None

    async def start_backfill(
        self,
        start_timestamp: datetime,
        end_timestamp: Optional[datetime] = None,
        pool_id: Optional[str] = None,
    ) -> dict:
        """Start a backfill job.

        Args:
            start_timestamp: Start timestamp for event replay
            end_timestamp: End timestamp (defaults to now if not provided)
            pool_id: Optional pool ID filter

        Returns:
            Job status dictionary
        """
        if self.running:
            raise ValueError("Backfill job is already running")

        if end_timestamp is None:
            end_timestamp = datetime.now(timezone.utc)

        job_id = str(UUID.uuid4())
        self.current_job = {
            "job_id": job_id,
            "status": "running",
            "start_timestamp": start_timestamp.isoformat(),
            "end_timestamp": end_timestamp.isoformat(),
            "pool_id": pool_id,
            "events_processed": 0,
            "events_skipped": 0,
            "errors": 0,
            "started_at": datetime.now(timezone.utc).isoformat(),
        }

        self.running = True

        # Run backfill in background
        asyncio.create_task(self._run_backfill(start_timestamp, end_timestamp, pool_id))

        return self.current_job.copy()

    async def get_backfill_status(self, job_id: str) -> Optional[dict]:
        """Get status of a backfill job.

        Args:
            job_id: Job ID

        Returns:
            Job status dictionary or None if not found
        """
        if self.current_job and self.current_job["job_id"] == job_id:
            return self.current_job.copy()
        return None

    async def cancel_backfill(self, job_id: str) -> bool:
        """Cancel a running backfill job.

        Args:
            job_id: Job ID

        Returns:
            True if job was cancelled, False if not found
        """
        if self.current_job and self.current_job["job_id"] == job_id:
            self.running = False
            if self.current_job:
                self.current_job["status"] = "cancelled"
                self.current_job["cancelled_at"] = datetime.now(timezone.utc).isoformat()
            return True
        return False

    async def _run_backfill(
        self,
        start_timestamp: datetime,
        end_timestamp: datetime,
        pool_id: Optional[str],
    ) -> None:
        """Run the backfill job.

        Args:
            start_timestamp: Start timestamp
            end_timestamp: End timestamp
            pool_id: Optional pool ID filter
        """
        try:
            consumer = self._create_backfill_consumer()

            # Seek to start timestamp
            # Note: This is a simplified implementation
            # In production, you'd need to query Kafka for offsets by timestamp
            # For now, we'll start from earliest and filter by timestamp
            topic = self.settings.KAFKA_GAME_EVENTS_TOPIC
            partitions = consumer.list_topics(topic, timeout=10).topics[topic].partitions.keys()

            # Subscribe to topic
            consumer.subscribe([topic])

            events_processed = 0
            events_skipped = 0
            errors = 0

            logger.info(f"Starting backfill: {start_timestamp} to {end_timestamp}")

            try:
                while self.running:
                    msg = consumer.poll(timeout=1.0)

                    if msg is None:
                        continue

                    if msg.error():
                        if msg.error().code() == KafkaError._PARTITION_EOF:
                            # End of partition, check if we've reached end_timestamp
                            if self._should_stop(end_timestamp):
                                break
                            continue
                        else:
                            logger.error(f"Kafka error: {msg.error()}")
                            errors += 1
                            continue

                    try:
                        # Parse event
                        event_data = json.loads(msg.value().decode("utf-8"))

                        # Filter by event type
                        if event_data.get("event_type") != "game.ended":
                            continue

                        # Extract timestamp from event
                        event_timestamp = self._extract_event_timestamp(event_data)

                        # Filter by timestamp range
                        if event_timestamp < start_timestamp:
                            continue

                        if event_timestamp > end_timestamp:
                            # We've reached the end timestamp
                            break

                        # Filter by pool_id if provided
                        if pool_id:
                            # Determine pool from time_control
                            time_control = event_data.get("time_control", {})
                            event_pool_id = _determine_pool_id_from_time_control(time_control)
                            if event_pool_id != pool_id:
                                continue

                        # Process event
                        async for db in get_db_session():
                            try:
                                await self.processor.process_game_ended_event(event_data, db)
                                events_processed += 1
                                if self.current_job:
                                    self.current_job["events_processed"] = events_processed
                            except Exception as e:
                                # Check if it's an idempotency skip (already processed)
                                if "already processed" in str(e).lower() or "integrity" in str(e).lower():
                                    events_skipped += 1
                                    if self.current_job:
                                        self.current_job["events_skipped"] = events_skipped
                                else:
                                    errors += 1
                                    logger.error(f"Error processing event: {e}")
                                    if self.current_job:
                                        self.current_job["errors"] = errors

                    except json.JSONDecodeError as e:
                        logger.error(f"Failed to parse message: {e}")
                        errors += 1
                    except Exception as e:
                        logger.error(f"Error in backfill loop: {e}", exc_info=True)
                        errors += 1

            finally:
                consumer.close()

            # Update job status
            if self.current_job:
                self.current_job["status"] = "completed"
                self.current_job["completed_at"] = datetime.now(timezone.utc).isoformat()

            logger.info(
                f"Backfill completed: processed={events_processed}, skipped={events_skipped}, errors={errors}"
            )

        except Exception as e:
            logger.error(f"Backfill job failed: {e}", exc_info=True)
            if self.current_job:
                self.current_job["status"] = "failed"
                self.current_job["failed_at"] = datetime.now(timezone.utc).isoformat()
                self.current_job["error_message"] = str(e)
        finally:
            self.running = False

    def _create_backfill_consumer(self) -> Consumer:
        """Create Kafka consumer for backfill."""
        config = {
            "bootstrap.servers": self.settings.KAFKA_BOOTSTRAP_SERVERS,
            "group.id": f"{self.settings.KAFKA_CONSUMER_GROUP_ID}-backfill",
            "auto.offset.reset": "earliest",  # Start from beginning
            "enable.auto.commit": False,  # Manual offset management for backfill
        }
        return Consumer(config)

    def _extract_event_timestamp(self, event_data: dict) -> datetime:
        """Extract timestamp from event data.

        Args:
            event_data: Event data dictionary

        Returns:
            Event timestamp
        """
        # Try to get timestamp from event
        if "ended_at" in event_data:
            ended_at = event_data["ended_at"]
            if isinstance(ended_at, str):
                return datetime.fromisoformat(ended_at.replace("Z", "+00:00"))
            elif isinstance(ended_at, datetime):
                return ended_at

        # Fallback to created_at or current time
        if "created_at" in event_data:
            created_at = event_data["created_at"]
            if isinstance(created_at, str):
                return datetime.fromisoformat(created_at.replace("Z", "+00:00"))
            elif isinstance(created_at, datetime):
                return created_at

        return datetime.now(timezone.utc)


    def _should_stop(self, end_timestamp: datetime) -> bool:
        """Check if backfill should stop (simplified - in production, track last processed timestamp).

        Args:
            end_timestamp: End timestamp

        Returns:
            True if should stop
        """
        # In a real implementation, we'd track the last processed timestamp
        # For now, this is a placeholder
        return False


# Global backfill service instance
_backfill_service: Optional[BackfillService] = None


def get_backfill_service() -> BackfillService:
    """Get global backfill service instance."""
    global _backfill_service
    if _backfill_service is None:
        _backfill_service = BackfillService()
    return _backfill_service
