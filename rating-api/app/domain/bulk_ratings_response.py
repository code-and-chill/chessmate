"""Bulk ratings response model."""
from typing import List

from pydantic import BaseModel

from .bulk_ratings_response_item import BulkRatingsResponseItem


class BulkRatingsResponse(BaseModel):
    pool_id: str
    results: List[BulkRatingsResponseItem]
