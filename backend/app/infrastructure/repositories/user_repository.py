from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.db.models import UserModel


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: UUID) -> UserModel | None:
        result = await self.db.execute(select(UserModel).where(UserModel.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_open_id(self, open_id: str) -> UserModel | None:
        result = await self.db.execute(select(UserModel).where(UserModel.open_id == open_id))
        return result.scalar_one_or_none()

    async def upsert(self, open_id: str, nickname: str, avatar_url: str) -> UserModel:
        user = await self.get_by_open_id(open_id)
        if user:
            user.nickname = nickname or user.nickname
            user.avatar_url = avatar_url or user.avatar_url
            user.updated_at = datetime.now(UTC)
            return user

        user = UserModel(
            open_id=open_id,
            nickname=nickname or "微信用户",
            avatar_url=avatar_url or "",
        )
        self.db.add(user)
        await self.db.flush()
        return user
