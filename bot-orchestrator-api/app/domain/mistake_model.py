"""Mistake model domain model."""
from pydantic import BaseModel


class MistakeModel(BaseModel):
    """Mistake probabilities configuration."""

    inaccuracy_prob: float
    mistake_prob: float
    blunder_prob: float
    eval_noise_sigma: float = 0.0
