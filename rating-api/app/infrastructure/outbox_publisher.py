import asyncio
import json
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.domain.event_outbox import EventOutbox
from app.infrastructure.database import get_db_session


class OutboxPublisher:
    def __init__(self) -> None:
        self._task: Optional[asyncio.Task] = None
        self._stopping = asyncio.Event()

    async def start(self) -> None:
        if self._task is not None:
            return
        self._stopping.clear()
        self._task = asyncio.create_task(self._run(), name="outbox-publisher")

    async def stop(self) -> None:
        if self._task is None:
            return
        self._stopping.set()
        await self._task
        self._task = None

    async def _run(self) -> None:
        settings = get_settings()
        if not settings.OUTBOX_ENABLED:
            return

        # Lazy import to avoid dependency if disabled
        try:
            import nats
        except Exception:  # pragma: no cover - optional dependency
            return

        nats_url = getattr(settings, "OUTBOX_NATS_URL", None) or "nats://nats:4222"
        subject = "rating.updated"
        interval = float(getattr(settings, "OUTBOX_PUBLISH_INTERVAL_SEC", 0.5))

        nc = await nats.connect(nats_url)
        try:
            while not self._stopping.is_set():
                async for session in get_db_session():  # type: AsyncSession
                    await self._drain_once(session, nc, subject)
                    break
                try:
                    await asyncio.wait_for(self._stopping.wait(), timeout=interval)
                except asyncio.TimeoutError:
                    pass
        finally:
            await nc.drain()

    async def _drain_once(self, session: AsyncSession, nc, subject: str) -> None:
        rows = (
            await session.execute(select(EventOutbox).where(EventOutbox.published_at.is_(None)).limit(100))
        ).scalars().all()
        if not rows:
            return
        for row in rows:
            await nc.publish(subject, row.payload.encode("utf-8"))
            row.published_at = datetime.now(timezone.utc)
        await session.commit()


outbox_publisher = OutboxPublisher()
