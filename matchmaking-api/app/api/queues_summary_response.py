"""Queues summary response model."""
from datetime import datetime

from pydantic import BaseModel

from .queue_summary import QueueSummary


class QueuesSummaryResponse(BaseModel):
    """Queues summary response."""

    timestamp: datetime
    queues: list[QueueSummary]
