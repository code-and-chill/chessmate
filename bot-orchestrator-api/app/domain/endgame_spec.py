"""Endgame specification domain model."""
from pydantic import BaseModel


class EndgameSpec(BaseModel):
    """Endgame configuration."""

    allow_tablebases: bool = True
    reduce_mistakes_in_simple_endgames: bool = True
