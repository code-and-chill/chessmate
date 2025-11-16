"""Bulk ratings request model."""
from typing import List

from pydantic import BaseModel


class BulkRatingsRequest(BaseModel):
    pool_id: str
    user_ids: List[str]
