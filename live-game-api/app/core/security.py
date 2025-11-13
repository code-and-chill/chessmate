"""Security and authentication utilities."""

from typing import Dict, Optional
from uuid import UUID

from app.core.config import get_settings
from app.core.exceptions import UnauthorizedError


def verify_token(token: str) -> Dict[str, str]:
    """
    Verify JWT token and extract claims.

    In a real implementation, this would validate the token signature
    using the auth-api's public key.
    """
    settings = get_settings()

    if not token:
        raise UnauthorizedError("Missing authentication token")

    try:
        # TODO: Implement actual JWT verification with auth-api
        # For MVP, we'll accept the token and extract the user_id
        # This should be replaced with proper JWT validation
        parts = token.split(".")
        if len(parts) != 3:
            raise UnauthorizedError("Invalid token format")

        # In production, verify signature and expiration
        # For now, we'll trust the token format
        return {"sub": "user_id_from_token"}

    except Exception as e:
        raise UnauthorizedError(f"Invalid token: {str(e)}")


def extract_user_id_from_token(token: str) -> UUID:
    """Extract user ID from authentication token."""
    claims = verify_token(token)
    user_id_str = claims.get("sub")

    if not user_id_str:
        raise UnauthorizedError("Token missing user ID")

    try:
        return UUID(user_id_str)
    except ValueError:
        raise UnauthorizedError("Invalid user ID in token")
