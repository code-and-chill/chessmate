"""Rating decision engine for automatic rated/unrated game determination."""
from typing import Optional, Tuple
from uuid import UUID

from ..models.decision_reason import DecisionReason


class RulesConfig:
    """Configuration for rating decision rules.
    
    These values can be overridden by environment variables or admin settings.
    """

    # Maximum rating difference allowed for rated games
    MAX_RATED_RATING_DIFFERENCE: int = 500

    # Whether to allow custom FEN in rated games (future feature)
    ALLOW_CUSTOM_FEN_RATED: bool = False

    # Whether to allow odds chess in rated games (future feature)
    ALLOW_ODDS_RATED: bool = False

    @classmethod
    def from_env(cls) -> "RulesConfig":
        """Load configuration from environment variables."""
        import os

        config = cls()
        config.MAX_RATED_RATING_DIFFERENCE = int(
            os.getenv("MAX_RATED_RATING_DIFFERENCE", 500)
        )
        config.ALLOW_CUSTOM_FEN_RATED = (
            os.getenv("ALLOW_CUSTOM_FEN_RATED", "false").lower() == "true"
        )
        config.ALLOW_ODDS_RATED = (
            os.getenv("ALLOW_ODDS_RATED", "false").lower() == "true"
        )
        return config


class RatingDecisionEngine:
    """Engine to determine if a game should be rated or unrated based on automatic rules."""

    def __init__(self, config: Optional[RulesConfig] = None):
        """Initialize the decision engine with configuration."""
        self.config = config or RulesConfig.from_env()

    def should_force_unrated(
        self,
        is_local_game: bool = False,
        player1_rating: Optional[int] = None,
        player2_rating: Optional[int] = None,
        has_custom_fen: bool = False,
        is_odds_game: bool = False,
    ) -> Tuple[bool, Optional[DecisionReason]]:
        """Determine if a game should be forced to unrated based on automatic rules.

        Args:
            is_local_game: Whether this is a local pass-and-play game
            player1_rating: Rating of first player (None if not available)
            player2_rating: Rating of second player (None if not available)
            has_custom_fen: Whether game uses custom starting position
            is_odds_game: Whether game uses odds/handicap (pieces removed)

        Returns:
            Tuple of (should_force_unrated: bool, reason: Optional[DecisionReason])
            - If should_force_unrated is True, game MUST be unrated
            - If should_force_unrated is False, game CAN be rated (but may still be unrated by user choice)
        """
        # Rule 1: Local games are always unrated
        if is_local_game:
            return True, DecisionReason.LOCAL_AUTO

        # Rule 2: Custom starting positions force unrated (unless explicitly allowed)
        if has_custom_fen and not self.config.ALLOW_CUSTOM_FEN_RATED:
            return True, DecisionReason.CUSTOM_POSITION_AUTO

        # Rule 3: Odds chess forces unrated (unless explicitly allowed)
        if is_odds_game and not self.config.ALLOW_ODDS_RATED:
            return True, DecisionReason.ODDS_AUTO

        # Rule 4: Rating gap too large forces unrated
        if player1_rating is not None and player2_rating is not None:
            rating_gap = abs(player1_rating - player2_rating)
            if rating_gap > self.config.MAX_RATED_RATING_DIFFERENCE:
                return True, DecisionReason.RATING_GAP_AUTO

        # No automatic rule triggered - game can be rated if users choose
        return False, None

    def calculate_decision_reason(
        self,
        requested_rated: bool,
        is_local_game: bool = False,
        player1_rating: Optional[int] = None,
        player2_rating: Optional[int] = None,
        has_custom_fen: bool = False,
        is_odds_game: bool = False,
    ) -> Tuple[bool, DecisionReason]:
        """Calculate final rated status and decision reason.

        Args:
            requested_rated: What the user/client requested
            is_local_game: Whether this is a local pass-and-play game
            player1_rating: Rating of first player
            player2_rating: Rating of second player
            has_custom_fen: Whether game uses custom starting position
            is_odds_game: Whether game uses odds/handicap

        Returns:
            Tuple of (final_rated: bool, decision_reason: DecisionReason)
        """
        # Check if any automatic rule forces unrated
        force_unrated, auto_reason = self.should_force_unrated(
            is_local_game=is_local_game,
            player1_rating=player1_rating,
            player2_rating=player2_rating,
            has_custom_fen=has_custom_fen,
            is_odds_game=is_odds_game,
        )

        if force_unrated:
            # Automatic rule overrides user preference
            return False, auto_reason  # type: ignore

        # No automatic rule triggered - respect user preference
        return requested_rated, DecisionReason.MANUAL

    def validate_rated_game_request(
        self,
        is_local_game: bool = False,
        player1_rating: Optional[int] = None,
        player2_rating: Optional[int] = None,
        has_custom_fen: bool = False,
        is_odds_game: bool = False,
    ) -> Tuple[bool, Optional[str]]:
        """Validate if a rated game request is allowed.

        Args:
            is_local_game: Whether this is a local pass-and-play game
            player1_rating: Rating of first player
            player2_rating: Rating of second player
            has_custom_fen: Whether game uses custom starting position
            is_odds_game: Whether game uses odds/handicap

        Returns:
            Tuple of (is_valid: bool, error_message: Optional[str])
        """
        force_unrated, reason = self.should_force_unrated(
            is_local_game=is_local_game,
            player1_rating=player1_rating,
            player2_rating=player2_rating,
            has_custom_fen=has_custom_fen,
            is_odds_game=is_odds_game,
        )

        if force_unrated:
            error_messages = {
                DecisionReason.LOCAL_AUTO: "Local games cannot be rated",
                DecisionReason.RATING_GAP_AUTO: (
                    f"Rating difference exceeds {self.config.MAX_RATED_RATING_DIFFERENCE} points"
                ),
                DecisionReason.CUSTOM_POSITION_AUTO: "Games with custom starting positions cannot be rated",
                DecisionReason.ODDS_AUTO: "Odds/handicap games cannot be rated",
            }
            return False, error_messages.get(reason, "Game cannot be rated")

        return True, None
