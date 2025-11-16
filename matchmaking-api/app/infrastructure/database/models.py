"""SQLAlchemy ORM models re-exports for backward compatibility."""
from .challenge_model import ChallengeModel
from .match_record_model import MatchRecordModel

__all__ = ["MatchRecordModel", "ChallengeModel"]
