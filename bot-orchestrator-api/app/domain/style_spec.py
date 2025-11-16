"""Style specification domain model."""
from pydantic import BaseModel


class StyleSpec(BaseModel):
    """Playing style weights."""

    weight_attack: float
    weight_safety: float
    weight_simplify: float
    prefers_gambits: bool = False
