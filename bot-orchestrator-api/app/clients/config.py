from __future__ import annotations
from datetime import datetime, timezone
import httpx
from typing import Optional

from app.core.config import get_settings
from app.domain.bot_spec import (
    BotSpec,
    BotSpecEnvelope,
    EndgameSpec,
    MistakeModel,
    OpeningSpec,
    SearchSpec,
    StyleSpec,
)


DEFAULT_SPEC = BotSpec(
    target_rating=1200,
    search=SearchSpec(
        depth_min=4,
        depth_max=12,
        multi_pv=4,
        think_time_ms_min=150,
        think_time_ms_max=800,
    ),
    mistake_model=MistakeModel(
        inaccuracy_prob=0.25,
        mistake_prob=0.10,
        blunder_prob=0.03,
        eval_noise_sigma=0.05,
    ),
    style=StyleSpec(
        weight_attack=0.4,
        weight_safety=0.4,
        weight_simplify=0.2,
        prefers_gambits=False,
    ),
    opening=OpeningSpec(use_book_until_ply=14, repertoire="aggro_mainline"),
    endgame=EndgameSpec(allow_tablebases=True, reduce_mistakes_in_simple_endgames=True),
)


async def fetch_spec(bot_id: str) -> BotSpecEnvelope:
    settings = get_settings()
    if not settings.BOT_CONFIG_URL:
        return BotSpecEnvelope(
            bot_id=bot_id,
            version=datetime.now(timezone.utc).replace(microsecond=0).isoformat() + "Z",
            spec=DEFAULT_SPEC,
        )

    async with httpx.AsyncClient(timeout=settings.HTTP_CLIENT_TIMEOUT_MS / 1000.0) as client:
        resp = await client.get(f"{settings.BOT_CONFIG_URL.rstrip('/')}/v1/bots/{bot_id}")
        resp.raise_for_status()
        data = resp.json()
        return BotSpecEnvelope(**data)
