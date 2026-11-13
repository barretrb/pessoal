import hashlib
import hmac
import time
from fastapi import Depends, Header, HTTPException, Request, status

from app.config import Settings, get_settings

SESSION_COOKIE_NAME = "expense_tracker_session"
SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60


def verify_api_key(
    x_api_key: str | None = Header(default=None, alias="X-API-Key"),
    settings: Settings = Depends(get_settings),
) -> str:
    """Validate X-API-Key header using constant-time comparison."""
    if not x_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing X-API-Key header",
        )
    if not hmac.compare_digest(x_api_key, settings.API_SECRET_KEY):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid X-API-Key",
        )
    return x_api_key


def verify_dashboard_password(password: str, settings: Settings) -> bool:
    return hmac.compare_digest(password, settings.DASHBOARD_PASSWORD)


def create_session_token(settings: Settings) -> str:
    ts = str(int(time.time()))
    sig = hmac.new(
        settings.API_SECRET_KEY.encode("utf-8"),
        ts.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return f"{ts}.{sig}"


def is_valid_session_token(token: str | None, settings: Settings) -> bool:
    if not token or "." not in token:
        return False
    ts_str, sig = token.split(".", 1)
    if not ts_str.isdigit():
        return False
    if int(time.time()) - int(ts_str) > SESSION_MAX_AGE_SECONDS:
        return False
    expected_sig = hmac.new(
        settings.API_SECRET_KEY.encode("utf-8"),
        ts_str.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(sig, expected_sig)


def get_dashboard_session(
    request: Request,
    settings: Settings = Depends(get_settings),
) -> bool:
    token = request.cookies.get(SESSION_COOKIE_NAME)
    return is_valid_session_token(token, settings)
