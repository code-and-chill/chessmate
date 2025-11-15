from fastapi import Depends, Header, HTTPException, status

from app.core.config import get_settings


async def require_auth(authorization: str | None = Header(default=None)) -> None:
    settings = get_settings()
    if not settings.REQUIRE_AUTH:
        return None
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    token = authorization.split(" ", 1)[1]
    if not settings.INTERNAL_BEARER_TOKEN or token != settings.INTERNAL_BEARER_TOKEN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid token")
    return None
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import get_settings


auth_scheme = HTTPBearer(auto_error=False)


def require_auth(creds: HTTPAuthorizationCredentials | None = Depends(auth_scheme)) -> None:
    settings = get_settings()
    if not settings.REQUIRE_AUTH:
        return
    if creds is None or creds.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    if settings.INTERNAL_BEARER_TOKEN and creds.credentials != settings.INTERNAL_BEARER_TOKEN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid token")
