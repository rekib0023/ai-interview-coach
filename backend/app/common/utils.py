"""Common utility functions."""

from typing import Any


def safe_int(value: Any, default: int = 0) -> int:
    """Safely convert value to int, returning default if conversion fails."""
    try:
        return int(value)
    except (ValueError, TypeError):
        return default


def truncate_string(value: str, max_length: int = 100, suffix: str = "...") -> str:
    """Truncate string to max_length, adding suffix if truncated."""
    if len(value) <= max_length:
        return value
    return value[: max_length - len(suffix)] + suffix
