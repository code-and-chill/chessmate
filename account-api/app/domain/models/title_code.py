"""Chess title codes enumeration."""
from enum import Enum


class TitleCode(str, Enum):
    """Chess titles."""

    GM = "GM"  # Grandmaster
    IM = "IM"  # International Master
    FM = "FM"  # FIDE Master
    NM = "NM"  # National Master
    WGM = "WGM"  # Woman Grandmaster
    WIM = "WIM"  # Woman International Master
    WFM = "WFM"  # Woman FIDE Master
    WNM = "WNM"  # Woman National Master
