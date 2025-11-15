import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.security import require_auth
from app.domain.engine.glicko2 import Glicko2Engine
from app.domain.engine.base import RatingState
from app.domain.models import EventOutbox, RatingIngestion, RatingPool, RatingEvent, UserRating
from app.domain.schemas import GameResultIn, GameResultOut
from app.infrastructure.database import get_db_session


router = APIRouter(prefix="/v1", tags=["ingestion"])


@router.post("/game-results", response_model=GameResultOut)
async def ingest_game_result(
    body: GameResultIn,
    _: None = Depends(require_auth),
    db: AsyncSession = Depends(get_db_session),
):
    settings = get_settings()
    pool = (await db.execute(select(RatingPool).where(RatingPool.code == body.pool_id))).scalar_one_or_none()
    if not pool:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pool not found")

    # Try to insert ingestion record for idempotency
    ingestion = RatingIngestion(
        game_id=body.game_id,
        pool_code=body.pool_id,
        white_user_id=body.white_user_id,
        black_user_id=body.black_user_id,
        result=body.result,
        rated=body.rated,
        ended_at=body.ended_at,
    )
    db.add(ingestion)
    try:
        await db.flush()
    except IntegrityError:
        # Already processed: fetch and return stored results
        await db.rollback()
        existing = (
            await db.execute(
                select(RatingIngestion).where(
                    RatingIngestion.game_id == body.game_id, RatingIngestion.pool_code == body.pool_id
                )
            )
        ).scalar_one()
        if existing.white_rating_after is None or existing.black_rating_after is None:
            # In-flight or previous failure – treat as conflict
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Processing in progress")
        return GameResultOut(
            game_id=body.game_id,
            white_rating_after=existing.white_rating_after,
            black_rating_after=existing.black_rating_after,
        )

    # Load current ratings
    async def get_or_init(uid: str) -> UserRating:
        ur = (
            await db.execute(
                select(UserRating).where(UserRating.user_id == uid, UserRating.pool_id == pool.id)
            )
        ).scalar_one_or_none()
        if ur:
            return ur
        ur = UserRating(
            user_id=uid,
            pool_id=pool.id,
            rating=pool.initial_rating,
            rating_deviation=pool.glicko_default_rd,
            volatility=0.06,
            provisional=True,
            games_played=0,
        )
        db.add(ur)
        await db.flush()
        return ur

    white = await get_or_init(body.white_user_id)
    black = await get_or_init(body.black_user_id)

    engine = Glicko2Engine(tau=pool.glicko_tau or settings.GLICKO_TAU)

    if body.result == "white_win":
        s_w, s_b = 1.0, 0.0
    elif body.result == "black_win":
        s_w, s_b = 0.0, 1.0
    else:
        s_w, s_b = 0.5, 0.5

    w_before = RatingState(rating=white.rating, rd=white.rating_deviation, volatility=white.volatility)
    b_before = RatingState(rating=black.rating, rd=black.rating_deviation, volatility=black.volatility)

    w_after = engine.update(w_before, [b_before], [s_w])
    b_after = engine.update(b_before, [w_before], [s_b])

    # Apply updates
    now = datetime.utcnow()
    white.rating = w_after.rating
    white.rating_deviation = w_after.rd
    white.volatility = w_after.volatility
    white.games_played += 1
    white.provisional = white.games_played < 10
    white.last_updated_at = now

    black.rating = b_after.rating
    black.rating_deviation = b_after.rd
    black.volatility = b_after.volatility
    black.games_played += 1
    black.provisional = black.games_played < 10
    black.last_updated_at = now

    # Events
    db.add(
        RatingEvent(
            user_id=body.white_user_id,
            pool_id=pool.id,
            game_id=body.game_id,
            old_rating=w_before.rating,
            new_rating=w_after.rating,
            old_rd=w_before.rd,
            new_rd=w_after.rd,
            old_volatility=w_before.volatility,
            new_volatility=w_after.volatility,
            reason="game",
        )
    )
    db.add(
        RatingEvent(
            user_id=body.black_user_id,
            pool_id=pool.id,
            game_id=body.game_id,
            old_rating=b_before.rating,
            new_rating=b_after.rating,
            old_rd=b_before.rd,
            new_rd=b_after.rd,
            old_volatility=b_before.volatility,
            new_volatility=b_after.volatility,
            reason="game",
        )
    )

    ingestion.white_rating_after = w_after.rating
    ingestion.black_rating_after = b_after.rating

    if settings.OUTBOX_ENABLED:
        for uid, after in ((body.white_user_id, w_after), (body.black_user_id, b_after)):
            payload = json.dumps(
                {
                    "user_id": uid,
                    "pool_id": body.pool_id,
                    "rating": after.rating,
                    "rating_deviation": after.rd,
                    "volatility": after.volatility,
                    "games_played": (white.games_played if uid == body.white_user_id else black.games_played),
                    "source_game_id": body.game_id,
                }
            )
            db.add(
                EventOutbox(
                    event_type="rating.updated",
                    aggregate_id=f"{uid}:{body.pool_id}",
                    event_key=body.game_id,
                    payload=payload,
                )
            )

    await db.commit()

    return GameResultOut(
        game_id=body.game_id,
        white_rating_after=w_after.rating,
        black_rating_after=b_after.rating,
    )
