"""Privacy level enumeration."""
from enum import Enum


class PrivacyLevel(str, Enum):
    """Privacy level for settings."""

    EVERYONE = "everyone"
    FRIENDS_OF_FRIENDS = "friends_of_friends"
    FRIENDS = "friends"
    NO_ONE = "no_one"
