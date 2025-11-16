"""Domain type aliases."""
from typing import Literal


Color = Literal["white", "black"]
Phase = Literal["opening", "middlegame", "endgame"]
MistakeType = Literal["none", "inaccuracy", "mistake", "blunder"]
