"""Helpers for interpreting time controls into rating pools."""

from __future__ import annotations


def classify_time_control(time_control: str) -> str:
    """Classify a time control string into rating speed buckets.

    The heuristic mirrors common chess buckets:
    - ``bullet``: <= 3 minutes estimated
    - ``blitz``: <= 8 minutes estimated
    - ``rapid``: <= 25 minutes estimated
    - ``classical``: everything else
    """

    try:
        base, increment = time_control.split("+")
        base_seconds = int(base) * 60
        increment_seconds = int(increment)
    except Exception:
        return "blitz"

    # Approximate total using 40 moves of increment
    estimated_total = base_seconds + (increment_seconds * 40)

    if estimated_total <= 180:
        return "bullet"
    if estimated_total <= 480:
        return "blitz"
    if estimated_total <= 1500:
        return "rapid"
    return "classical"


def rating_pool_id_from_constraints(variant: str, time_control: str) -> str:
    """Generate a rating pool identifier from variant and time control."""

    speed = classify_time_control(time_control)
    return f"{speed}_{variant}"
