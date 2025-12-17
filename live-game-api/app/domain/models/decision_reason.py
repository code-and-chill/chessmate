"""Decision reason enum for rated/unrated game determination."""
from enum import Enum


class DecisionReason(str, Enum):
    """Reason for rated/unrated game decision."""

    MANUAL = "manual"  # User explicitly chose rated/unrated
    LOCAL_AUTO = "local_auto"  # Local play forced unrated
    RATING_GAP_AUTO = "rating_gap_auto"  # Rating difference too large
    CUSTOM_POSITION_AUTO = "custom_position_auto"  # Custom FEN forced unrated
    ODDS_AUTO = "odds_auto"  # Odds chess forced unrated
    BOT_GAME = "bot_game"  # Bot games are always unrated
