import os
import time
from typing import Dict, Any, Optional

import redis

REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')

# key namespace
KEY_PREFIX = 'rate:puzzle:'

class RedisRateLimiter:
    def __init__(self, redis_url: Optional[str] = None, window_seconds: int = 60, limit: int = 10):
        self.redis_url = redis_url or REDIS_URL
        self.window = window_seconds
        self.limit = limit
        try:
            self.client = redis.from_url(self.redis_url)
        except Exception:
            self.client = None

    def _key(self, user_id: str) -> str:
        return f"{KEY_PREFIX}{user_id}"

    def check(self, user_id: str) -> Dict[str, Any]:
        """
        Return dict with remaining, reset_seconds, limit.
        If Redis is unavailable, return permissive values (no limiting).
        """
        now = int(time.time())
        if not self.client:
            return {"remaining": self.limit, "reset_seconds": self.window, "limit": self.limit}

        key = self._key(user_id)
        pipe = self.client.pipeline()
        window_start = now - self.window
        try:
            # remove old entries
            pipe.zremrangebyscore(key, 0, window_start)
            pipe.zcard(key)
            pipe.zrange(key, 0, 0, withscores=True)
            pipe.expire(key, self.window + 5)
            removed, count, oldest, _ = pipe.execute()
        except Exception:
            # On Redis error, be permissive
            return {"remaining": self.limit, "reset_seconds": self.window, "limit": self.limit}

        current = int(count or 0)
        remaining = max(0, self.limit - current)
        reset_seconds = self.window
        if oldest and len(oldest) > 0:
            # oldest is list like [(member, score)] when withscores True
            # but zrange withscores returns list of (member, score) pairs as bytes; handle accordingly
            try:
                first_score = int(oldest[0][1])
                reset_seconds = max(0, self.window - (now - first_score))
            except Exception:
                reset_seconds = self.window

        return {"remaining": remaining, "reset_seconds": int(reset_seconds), "limit": self.limit}

    def record(self, user_id: str) -> None:
        """Record an attempt timestamp for user_id."""
        if not self.client:
            return
        now = int(time.time())
        key = self._key(user_id)
        try:
            # member can be the score string to ensure uniqueness
            member = str(now) + ':' + str(time.time_ns())
            pipe = self.client.pipeline()
            pipe.zadd(key, {member: now})
            pipe.expire(key, self.window + 5)
            pipe.execute()
        except Exception:
            # swallow redis errors in dev
            return

# convenience default instance
_default_limiter: Optional[RedisRateLimiter] = None

def get_default_limiter() -> RedisRateLimiter:
    global _default_limiter
    if _default_limiter is None:
        _default_limiter = RedisRateLimiter()
    return _default_limiter

