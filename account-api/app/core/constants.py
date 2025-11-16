"""Application constants and default values."""

from app.domain.models.animation_level import AnimationLevel
from app.domain.models.default_time_control import DefaultTimeControl
from app.domain.models.privacy_level import PrivacyLevel


# Default account preferences
DEFAULT_BOARD_THEME = "classic"
DEFAULT_PIECE_SET = "classic"
DEFAULT_SOUND_ENABLED = True
DEFAULT_ANIMATION_LEVEL = AnimationLevel.FULL
DEFAULT_HIGHLIGHT_LEGAL_MOVES = True
DEFAULT_SHOW_COORDINATES = True
DEFAULT_CONFIRM_MOVES = False
DEFAULT_TIME_CONTROL = DefaultTimeControl.BLITZ
DEFAULT_AUTO_QUEEN_PROMOTION = True

# Default privacy settings
DEFAULT_SHOW_RATINGS = True
DEFAULT_SHOW_ONLINE_STATUS = True
DEFAULT_SHOW_GAME_ARCHIVE = True
DEFAULT_ALLOW_FRIEND_REQUESTS = PrivacyLevel.EVERYONE
DEFAULT_ALLOW_MESSAGES_FROM = PrivacyLevel.EVERYONE
DEFAULT_ALLOW_CHALLENGES_FROM = PrivacyLevel.EVERYONE
DEFAULT_IS_PROFILE_PUBLIC = True

# Default counters
DEFAULT_COUNTER_VALUE = 0
DEFAULT_AVATAR_VERSION = 1

# Username validation
MIN_USERNAME_LENGTH = 3
MAX_USERNAME_LENGTH = 32
USERNAME_ALLOWED_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-"

# Error messages
ERROR_ACCOUNT_NOT_FOUND = "Account not found: {identifier}"
ERROR_ACCOUNT_EXISTS = "Account already exists: {identifier}"
ERROR_INVALID_USERNAME = "Invalid username: {reason}"
ERROR_UNAUTHORIZED = "Unauthorized access"
ERROR_INVALID_CREDENTIALS = "Could not validate credentials"
ERROR_INVALID_TOKEN_USER_ID = "Invalid user ID in token"
