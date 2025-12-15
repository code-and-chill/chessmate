"""Backward-compatible re-export for matchmaking tickets."""
from .ticket import Ticket, TicketType
from .queue_entry_status import QueueEntryStatus

__all__ = ["Ticket", "TicketType", "QueueEntryStatus"]
