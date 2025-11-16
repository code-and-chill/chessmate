"""Account preferences domain model."""
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.domain.models.animation_level import AnimationLevel
from app.domain.models.default_time_control import DefaultTimeControl


class AccountPreferences(BaseModel):
    """Account preferences domain model."""

    account_id: UUID
    board_theme: str = "classic"
    piece_set: str = "classic"
    sound_enabled: bool = True
    animation_level: AnimationLevel = AnimationLevel.FULL
    highlight_legal_moves: bool = True
    show_coordinates: bool = True
    confirm_moves: bool = False
    default_time_control: DefaultTimeControl = DefaultTimeControl.BLITZ
    auto_queen_promotion: bool = True
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
