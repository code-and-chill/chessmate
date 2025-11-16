"""Bot specification domain model."""
from pydantic import BaseModel

from .endgame_spec import EndgameSpec
from .mistake_model import MistakeModel
from .opening_spec import OpeningSpec
from .search_spec import SearchSpec
from .style_spec import StyleSpec


class BotSpec(BaseModel):
    """Complete bot specification."""

    target_rating: int
    search: SearchSpec
    mistake_model: MistakeModel
    style: StyleSpec
    opening: OpeningSpec = OpeningSpec()
    endgame: EndgameSpec = EndgameSpec()
