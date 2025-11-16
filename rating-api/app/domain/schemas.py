"""Domain schemas re-exports for backward compatibility."""
from .bulk_ratings_request import BulkRatingsRequest
from .bulk_ratings_response import BulkRatingsResponse
from .bulk_ratings_response_item import BulkRatingsResponseItem
from .game_result_in import GameResultIn
from .game_result_out import GameResultOut
from .rating_snapshot import RatingSnapshot
from .user_ratings_response import UserRatingsResponse

__all__ = [
    "RatingSnapshot",
    "UserRatingsResponse",
    "BulkRatingsRequest",
    "BulkRatingsResponseItem",
    "BulkRatingsResponse",
    "GameResultIn",
    "GameResultOut",
]
