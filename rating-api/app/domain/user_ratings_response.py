"""User ratings response model."""
from typing import List

from pydantic import BaseModel

from .rating_snapshot import RatingSnapshot


class UserRatingsResponse(BaseModel):
    user_id: str
    ratings: List[RatingSnapshot]
