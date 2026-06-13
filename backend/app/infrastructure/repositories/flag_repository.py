from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.db.models import FlagModel


class FlagRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_by_user(self, user_id: UUID, status: str | None = None) -> list[FlagModel]:
        query = select(FlagModel).where(FlagModel.user_id == user_id).order_by(FlagModel.created_at.desc())
        if status and status != "all":
            query = query.where(FlagModel.status == status)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_id(self, flag_id: UUID) -> FlagModel | None:
        result = await self.db.execute(select(FlagModel).where(FlagModel.id == flag_id))
        return result.scalar_one_or_none()

    async def create(self, flag: FlagModel) -> FlagModel:
        self.db.add(flag)
        await self.db.flush()
        return flag

    async def save(self, flag: FlagModel) -> FlagModel:
        await self.db.flush()
        return flag
