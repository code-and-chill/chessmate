"""Base models re-exports for backward compatibility."""
from .base_domain_event import BaseDomainEvent
from .base_entity import BaseEntity

__all__ = ["BaseEntity", "BaseDomainEvent"]
