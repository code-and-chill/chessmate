"""Clock state domain model."""
from pydantic import BaseModel


class Clocks(BaseModel):
    """Clock state for both players."""

    white_ms: int
    black_ms: int
    increment_ms: int = 0
