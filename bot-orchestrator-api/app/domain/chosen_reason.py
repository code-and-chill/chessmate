"""Chosen reason domain model."""
from typing import Optional

from pydantic import BaseModel


class ChosenReason(BaseModel):
    """Reason for move choice (debug info)."""

    style_bias: Optional[str] = None
    eval_loss: Optional[float] = None
