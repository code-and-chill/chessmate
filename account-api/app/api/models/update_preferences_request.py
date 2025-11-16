"""Update preferences request DTO."""
from typing import Optional

from pydantic import BaseModel

from app.domain.models.animation_level import AnimationLevel
from app.domain.models.default_time_control import DefaultTimeControl


class UpdatePreferencesRequest(BaseModel):
    """Update preferences request."""

    board_theme: Optional[str] = None
    piece_set: Optional[str] = None
    sound_enabled: Optional[bool] = None
    animation_level: Optional[AnimationLevel] = None
    highlight_legal_moves: Optional[bool] = None
    show_coordinates: Optional[bool] = None
    confirm_moves: Optional[bool] = None
    default_time_control: Optional[DefaultTimeControl] = None
    auto_queen_promotion: Optional[bool] = None
