"""Debug info domain model."""
from typing import List, Optional

from pydantic import BaseModel

from .candidate import Candidate
from .chosen_reason import ChosenReason
from .engine_query import EngineQuery
from .types import MistakeType, Phase


class DebugInfo(BaseModel):
    """Debug information about move selection."""

    phase: Optional[Phase] = None
    mistake_type: Optional[MistakeType] = None
    engine_query: Optional[EngineQuery] = None
    candidates: Optional[List[Candidate]] = None
    chosen_reason: Optional[ChosenReason] = None
