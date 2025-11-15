"""Dependencies for request handlers."""
from typing import Annotated

from fastapi import Depends, Header

from app.core.security import JWTTokenData, decode_token
from app.core.exceptions import UnauthorizedException


async def get_token_data(
    authorization: Annotated[str, Header()] = "",
) -> JWTTokenData:
    """Extract and validate JWT token from Authorization header.

    Args:
        authorization: Authorization header value

    Returns:
        Decoded JWT token data

    Raises:
        UnauthorizedException: If token is invalid
    """
    if not authorization.startswith("Bearer "):
        raise UnauthorizedException("Invalid authorization header format")

    token = authorization[7:]  # Remove "Bearer " prefix
    return decode_token(token)
