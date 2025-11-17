from app.core.rating import RatingCalculator
from app.infrastructure.repository import UserPuzzleStatsRepository, UserPuzzleAttemptRepository
from sqlalchemy.orm import Session

class PuzzleService:
    @staticmethod
    def process_attempt(
        db: Session,
        user_id: str,
        puzzle_id: str,
        attempt_data: dict,
        puzzle_rating: int,
        is_daily: bool = False
    ) -> dict:
        """
        Process a puzzle attempt and calculate rating change.
        """
        # Get current user stats
        stats_repo = UserPuzzleStatsRepository()
        stats = stats_repo.get_or_create_stats(db, user_id)
        
        # Determine success
        success = attempt_data.get("status") == "SUCCESS"
        
        # Calculate time bonus
        time_spent_ms = attempt_data.get("time_spent_ms", 0)
        time_bonus = 1.0
        if time_spent_ms > 0:
            # Adjust bonus based on time spent (faster = higher bonus)
            time_bonus = max(0.5, min(1.5, 2.0 - (time_spent_ms / 120000)))
        
        # Calculate rating change
        rating_calculator = RatingCalculator()
        rating_change = rating_calculator.calculate_rating_change(
            stats.tactics_rating,
            puzzle_rating,
            success,
            time_bonus
        )
        
        # Update stats
        updated_stats_dict = {
            "total_attempts": stats.total_attempts + 1,
            "total_success": stats.total_success + (1 if success else 0),
            "tactics_rating": stats.tactics_rating + rating_change
        }
        
        if is_daily:
            if success:
                updated_stats_dict["current_daily_streak"] = stats.current_daily_streak + 1
                updated_stats_dict["longest_daily_streak"] = max(
                    stats.longest_daily_streak,
                    updated_stats_dict["current_daily_streak"]
                )
                updated_stats_dict["last_daily_solved_date"] = None  # Set to today in caller
            else:
                updated_stats_dict["current_daily_streak"] = 0
        
        # Update in database
        for key, value in updated_stats_dict.items():
            setattr(stats, key, value)
        db.commit()
        db.refresh(stats)
        
        return {
            "attempt_id": str(__import__('uuid').uuid4()),
            "status": "SUCCESS" if success else "FAILED",
            "correct": success,
            "rating_before": stats.tactics_rating - rating_change,
            "rating_after": stats.tactics_rating,
            "rating_change": rating_change,
            "updated_stats": {
                "user_id": user_id,
                "tactics_rating": stats.tactics_rating,
                "tactics_rd": stats.tactics_rd,
                "total_attempts": stats.total_attempts,
                "total_success": stats.total_success,
                "current_daily_streak": stats.current_daily_streak,
                "longest_daily_streak": stats.longest_daily_streak,
                "last_daily_solved_date": stats.last_daily_solved_date
            }
        }
