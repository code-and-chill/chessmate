from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class RatingState:
    rating: float
    rd: float
    volatility: float


class RatingEngine(ABC):
    @abstractmethod
    def expected_score(self, player: RatingState, opponent: RatingState) -> float:  # pragma: no cover - interface
        raise NotImplementedError

    @abstractmethod
    def update(self, player: RatingState, opponents: list[RatingState], scores: list[float]) -> RatingState:  # pragma: no cover - interface
        raise NotImplementedError
