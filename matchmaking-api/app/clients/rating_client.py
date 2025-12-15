"""HTTP client for rating-api lookups."""
from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Any

import httpx

from app.core.config import get_settings


@dataclass
class PlayerRating:
    """Rating snapshot for a player in a pool."""

    rating: int
    rating_deviation: float


class RatingAPIClient:
    """Lightweight wrapper around rating-api endpoints with TTL caching."""

    def __init__(self, http_client: httpx.AsyncClient) -> None:
        self.http_client = http_client
        self.settings = get_settings()
        self._cache: dict[tuple[str, str], tuple[PlayerRating, float]] = {}

    async def get_player_rating(self, user_id: str, pool_id: str) -> PlayerRating:
        """Fetch the latest rating for a player from rating-api.

        Args:
            user_id: Player identifier.
            pool_id: Rating pool identifier (e.g., ``"blitz_standard"``).
        """

        cached = self._get_cached(user_id, pool_id)
        if cached:
            return cached

        url = f"{self.settings.RATING_API_URL}/v1/ratings/{user_id}/pools/{pool_id}"
        try:
            response = await self.http_client.get(url)
            response.raise_for_status()
            data: dict[str, Any] = response.json()
            rating = PlayerRating(
                rating=int(data.get("rating", self.settings.RATING_DEFAULT_MMR)),
                rating_deviation=float(data.get("rating_deviation", self.settings.RATING_DEFAULT_RD)),
            )
        except Exception:
            rating = PlayerRating(
                rating=self.settings.RATING_DEFAULT_MMR,
                rating_deviation=self.settings.RATING_DEFAULT_RD,
            )

        self._set_cache(user_id, pool_id, rating)
        return rating

    async def get_bulk_ratings(
        self, user_ids: list[str], pool_id: str
    ) -> dict[str, PlayerRating]:
        """Fetch multiple player ratings using the bulk endpoint when needed."""

        result: dict[str, PlayerRating] = {}
        missing_ids: list[str] = []

        for uid in user_ids:
            cached = self._get_cached(uid, pool_id)
            if cached:
                result[uid] = cached
            else:
                missing_ids.append(uid)

        if missing_ids:
            url = f"{self.settings.RATING_API_URL}/v1/ratings/bulk"
            try:
                resp = await self.http_client.post(
                    url, json={"pool_id": pool_id, "user_ids": missing_ids}
                )
                resp.raise_for_status()
                data: dict[str, Any] = resp.json()
                for item in data.get("results", []):
                    rating = PlayerRating(
                        rating=int(item.get("rating", self.settings.RATING_DEFAULT_MMR)),
                        rating_deviation=float(
                            item.get("rating_deviation", self.settings.RATING_DEFAULT_RD)
                        ),
                    )
                    result[item["user_id"]] = rating
                    self._set_cache(item["user_id"], pool_id, rating)
            except Exception:
                for uid in missing_ids:
                    rating = PlayerRating(
                        rating=self.settings.RATING_DEFAULT_MMR,
                        rating_deviation=self.settings.RATING_DEFAULT_RD,
                    )
                    result[uid] = rating
                    self._set_cache(uid, pool_id, rating)

        return result

    def _get_cached(self, user_id: str, pool_id: str) -> PlayerRating | None:
        key = (user_id, pool_id)
        cached = self._cache.get(key)
        if not cached:
            return None

        rating, expires_at = cached
        if time.time() > expires_at:
            self._cache.pop(key, None)
            return None
        return rating

    def _set_cache(self, user_id: str, pool_id: str, rating: PlayerRating) -> None:
        ttl = max(self.settings.RATING_CACHE_TTL_SECONDS, 1)
        self._cache[(user_id, pool_id)] = (rating, time.time() + ttl)
