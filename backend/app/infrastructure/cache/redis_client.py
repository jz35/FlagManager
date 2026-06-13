import logging
from typing import Any

import redis.asyncio as redis

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class RedisClient:
    def __init__(self) -> None:
        self._client: redis.Redis | None = None
        self._available = True

    async def connect(self) -> None:
        settings = get_settings()
        try:
            self._client = redis.from_url(settings.redis_url, decode_responses=True)
            await self._client.ping()
            self._available = True
        except Exception as exc:
            logger.warning("Redis unavailable, falling back to direct DB: %s", exc)
            self._client = None
            self._available = False

    async def close(self) -> None:
        if self._client:
            await self._client.close()

    @property
    def available(self) -> bool:
        return self._available and self._client is not None

    async def get_json(self, key: str) -> Any | None:
        if not self.available:
            return None
        import json

        value = await self._client.get(key)
        if value is None:
            return None
        return json.loads(value)

    async def set_json(self, key: str, value: Any, ttl: int = 60) -> None:
        if not self.available:
            return
        import json

        await self._client.set(key, json.dumps(value, default=str), ex=ttl)

    async def delete_pattern(self, pattern: str) -> None:
        if not self.available:
            return
        keys = [key async for key in self._client.scan_iter(match=pattern)]
        if keys:
            await self._client.delete(*keys)


redis_client = RedisClient()
