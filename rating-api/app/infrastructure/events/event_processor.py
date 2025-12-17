"""Event processor for game.ended events."""

import logging
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.schemas import GameResultIn

logger = logging.getLogger(__name__)


class EventProcessor:
    """Processes game.ended events from Kafka."""

    async def process_game_ended_event(self, event_data: dict, db: AsyncSession) -> None:
        """Process a game.ended event.

        Args:
            event_data: Event data dictionary from Kafka
            db: Database session
        """
        try:
            # Extract event fields
            event_type = event_data.get("event_type")
            if event_type != "game.ended":
                logger.debug(f"Ignoring event type: {event_type}")
                return

            aggregate_id = event_data.get("aggregate_id")  # This is the game_id
            if not aggregate_id:
                logger.error("Missing aggregate_id (game_id) in event")
                return

            white_account_id = event_data.get("white_account_id")
            black_account_id = event_data.get("black_account_id")
            result = event_data.get("result")
            end_reason = event_data.get("end_reason")
            rated = event_data.get("rated", False)
            time_control = event_data.get("time_control", {})

            # Parse ended_at timestamp (default to current time if missing)
            ended_at_str = event_data.get("ended_at")
            if ended_at_str:
                try:
                    if isinstance(ended_at_str, str):
                        ended_at = datetime.fromisoformat(ended_at_str.replace("Z", "+00:00"))
                    else:
                        ended_at = datetime.now(timezone.utc)
                except (ValueError, AttributeError):
                    ended_at = datetime.now(timezone.utc)
            else:
                ended_at = datetime.now(timezone.utc)

            # Validate required fields
            if not white_account_id or not black_account_id:
                logger.error(f"Missing player IDs in event: white={white_account_id}, black={black_account_id}")
                return

            if not result:
                logger.error(f"Missing result in event for game {aggregate_id}")
                return

            # Map result format (e.g., "white_win" or "1-0")
            result_mapped = self._map_result(result)

            # Determine pool_id from time_control
            pool_id = self._determine_pool_id(time_control)

            # Create GameResultIn payload
            game_result = GameResultIn(
                game_id=str(aggregate_id),
                pool_id=pool_id,
                white_user_id=str(white_account_id),
                black_user_id=str(black_account_id),
                result=result_mapped,
                rated=rated,
                ended_at=ended_at,
            )

            # Process via existing ingestion logic
            # Import here to avoid circular dependencies
            from app.api.routes.v1.game_results import ingest_game_result_internal
            await ingest_game_result_internal(game_result, db)
            
            logger.info(f"Processed game.ended event for game {aggregate_id}")

        except Exception as e:
            logger.error(f"Error processing game.ended event: {e}", exc_info=True)
            raise

    def _map_result(self, result: str) -> str:
        """Map game result to rating API format.

        Args:
            result: Result from event (e.g., "white_win", "1-0", "draw")

        Returns:
            Mapped result string
        """
        # Handle various result formats
        result_lower = result.lower() if isinstance(result, str) else str(result).lower()
        
        if result_lower in ("white_win", "1-0", "1_0"):
            return "white_win"
        elif result_lower in ("black_win", "0-1", "0_1"):
            return "black_win"
        elif result_lower in ("draw", "1/2-1/2", "1/2_1/2", "0.5"):
            return "draw"
        else:
            logger.warning(f"Unknown result format: {result}, defaulting to draw")
            return "draw"

    def _determine_pool_id(self, time_control: dict) -> str:
        """Determine pool ID from time control.

        Args:
            time_control: Time control dictionary

        Returns:
            Pool ID string
        """
        # Extract time control values
        initial_seconds = time_control.get("initial_seconds", 0) if isinstance(time_control, dict) else 0
        increment_seconds = time_control.get("increment_seconds", 0) if isinstance(time_control, dict) else 0

        # Map to pool IDs (matching rating-api conventions)
        total_minutes = initial_seconds / 60

        if total_minutes <= 1:
            return "bullet_standard"
        elif total_minutes <= 5:
            return "blitz_standard"
        elif total_minutes <= 15:
            return "rapid_standard"
        else:
            return "classical_standard"
