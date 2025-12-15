"""Utilities for formatting matchmaking pool keys."""


def format_pool_key(*, mode: str, variant: str, time_control: str, region: str) -> str:
    """Create a stable pool key string shared by services.

    Args:
        mode: Rated/casual/etc.
        variant: Game variant identifier.
        time_control: Blitz/rapid control string.
        region: Region slug.

    Returns:
        Normalized pool key string such as ``"mode:rated|variant:std|tc:3+0|region:ap-sg"``.
    """

    return f"mode:{mode}|variant:{variant}|tc:{time_control}|region:{region}"

