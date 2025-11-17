from app.core.schemas import StatusEnum

class RatingCalculator:
    """
    Simple Elo-based rating calculator for tactics puzzles.
    """
    
    @staticmethod
    def calculate_rating_change(
        user_rating: int,
        puzzle_rating: int,
        success: bool,
        time_bonus: float = 1.0
    ) -> int:
        """
        Calculate rating change based on puzzle difficulty and outcome.
        
        Args:
            user_rating: Current user tactics rating
            puzzle_rating: Puzzle difficulty rating
            success: Whether the puzzle was solved successfully
            time_bonus: Bonus/penalty based on solving time (0.5 to 1.5)
        
        Returns:
            Rating change (positive or negative)
        """
        # Base K-factor (affects rating volatility)
        k_factor = 32
        
        # Expected score based on rating difference
        rating_diff = puzzle_rating - user_rating
        expected_score = 1 / (1 + 10 ** (rating_diff / 400))
        
        # Actual score
        actual_score = 1.0 if success else 0.0
        
        # Rating change
        rating_change = k_factor * (actual_score - expected_score) * time_bonus
        
        return int(round(rating_change))
    
    @staticmethod
    def update_stats(
        current_stats: dict,
        success: bool,
        rating_change: int,
        is_daily: bool
    ) -> dict:
        """
        Update user puzzle stats based on attempt outcome.
        """
        stats = current_stats.copy()
        
        # Update basic stats
        stats["total_attempts"] += 1
        if success:
            stats["total_success"] += 1
        
        # Update tactics rating
        stats["tactics_rating"] += rating_change
        
        # Update daily streak (if daily puzzle)
        if is_daily:
            if success:
                stats["current_daily_streak"] += 1
                if stats["current_daily_streak"] > stats["longest_daily_streak"]:
                    stats["longest_daily_streak"] = stats["current_daily_streak"]
                stats["last_daily_solved_date"] = None  # Will be set to today
            else:
                stats["current_daily_streak"] = 0
        
        return stats
