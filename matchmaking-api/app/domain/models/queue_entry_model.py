"""Queue entry aggregate root."""
from datetime import datetime
from typing import Optional

from .queue_entry_status import QueueEntryStatus


class QueueEntry:
    """Queue entry aggregate root.

    Represents a player's entry in the matchmaking queue.
    Per service-spec section 5.1.
    """

    def __init__(
        self,
        queue_entry_id: str,
        tenant_id: str,
        user_id: str,
        time_control: str,
        mode: str,
        variant: str,
        region: str,
        status: QueueEntryStatus,
        enqueued_at: datetime,
        updated_at: datetime,
        match_id: Optional[str] = None,
    ) -> None:
        self.queue_entry_id = queue_entry_id
        self.tenant_id = tenant_id
        self.user_id = user_id
        self.time_control = time_control
        self.mode = mode
        self.variant = variant
        self.region = region
        self.status = status
        self.enqueued_at = enqueued_at
        self.updated_at = updated_at
        self.match_id = match_id

    def is_searching(self) -> bool:
        """Check if entry is actively searching."""
        return self.status == QueueEntryStatus.SEARCHING

    def is_matched(self) -> bool:
        """Check if entry has been matched."""
        return self.status == QueueEntryStatus.MATCHED

    def is_finalized(self) -> bool:
        """Check if entry is in a terminal state."""
        return self.status in (
            QueueEntryStatus.MATCHED,
            QueueEntryStatus.CANCELLED,
            QueueEntryStatus.TIMED_OUT,
        )

    def time_in_queue_seconds(self, now: datetime) -> float:
        """Get seconds this entry has been in queue."""
        delta = now - self.enqueued_at
        return delta.total_seconds()

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, QueueEntry):
            return NotImplemented
        return self.queue_entry_id == other.queue_entry_id

    def __hash__(self) -> int:
        return hash(self.queue_entry_id)
