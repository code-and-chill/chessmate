"""Rating snapshot at match time."""


class RatingSnapshot:
    """Rating snapshot at match time."""

    def __init__(self, white: int, black: int) -> None:
        self.white = white
        self.black = black

    def to_dict(self) -> dict:
        """Convert to dictionary."""
        return {"white": self.white, "black": self.black}
