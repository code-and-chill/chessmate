"""Bot specification envelope domain model."""
from pydantic import BaseModel

from .bot_spec_model import BotSpec


class BotSpecEnvelope(BaseModel):
    """Bot spec with metadata."""

    bot_id: str
    version: str
    spec: BotSpec
