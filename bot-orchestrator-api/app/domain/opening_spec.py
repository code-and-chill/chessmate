"""Opening specification domain model."""
from typing import Optional

from pydantic import BaseModel


class OpeningSpec(BaseModel):
    """Opening book configuration."""

    use_book_until_ply: int = 0
    repertoire: Optional[str] = None
