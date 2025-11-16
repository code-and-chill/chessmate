"""Preferences response DTO."""
from pydantic import BaseModel, ConfigDict

from app.domain.models.animation_level import AnimationLevel
from app.domain.models.default_time_control import DefaultTimeControl


class PreferencesResponse(BaseModel):
    """Preferences response model."""

    model_config = ConfigDict(from_attributes=True)

    board_theme: str
    piece_set: str
    sound_enabled: bool
    animation_level: AnimationLevel
    highlight_legal_moves: bool
    show_coordinates: bool
    confirm_moves: bool
    default_time_control: DefaultTimeControl
    auto_queen_promotion: bool
