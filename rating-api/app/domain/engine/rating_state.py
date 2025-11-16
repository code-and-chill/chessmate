"""Rating state dataclass."""
from dataclasses import dataclass


@dataclass
class RatingState:
    rating: float
    rd: float
    volatility: float
