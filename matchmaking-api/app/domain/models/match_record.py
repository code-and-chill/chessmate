"""Match record domain models re-exports for backward compatibility."""
from .match_record_model import MatchRecord
from .rating_snapshot import RatingSnapshot

__all__ = ["RatingSnapshot", "MatchRecord"]
