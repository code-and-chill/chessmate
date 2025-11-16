"""Rating engine abstract base class."""
from abc import ABC, abstractmethod

from .rating_state import RatingState


class RatingEngine(ABC):
    @abstractmethod
    def expected_score(self, player: RatingState, opponent: RatingState) -> float:  # pragma: no cover - interface
        raise NotImplementedError

    @abstractmethod
    def update(self, player: RatingState, opponents: list[RatingState], scores: list[float]) -> RatingState:  # pragma: no cover - interface
        raise NotImplementedError
