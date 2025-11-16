"""Queue summary for metrics model."""
from pydantic import BaseModel


class QueueSummary(BaseModel):
    """Queue summary for metrics."""

    tenant_id: str
    pool_key: str
    waiting_count: int
    avg_wait_seconds: float
    p95_wait_seconds: float
