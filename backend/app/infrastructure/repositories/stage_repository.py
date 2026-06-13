from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.db.models import StageModel


class StageRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_by_flag(self, flag_id: UUID) -> list[StageModel]:
        result = await self.db.execute(
            select(StageModel).where(StageModel.flag_id == flag_id).order_by(StageModel.start_date)
        )
        return list(result.scalars().all())

    async def get_by_id(self, stage_id: UUID) -> StageModel | None:
        result = await self.db.execute(select(StageModel).where(StageModel.id == stage_id))
        return result.scalar_one_or_none()

    async def create(self, stage: StageModel) -> StageModel:
        self.db.add(stage)
        await self.db.flush()
        return stage

    async def save(self, stage: StageModel) -> StageModel:
        await self.db.flush()
        return stage

    async def list_by_user_flags(self, flag_ids: list[UUID]) -> list[StageModel]:
        if not flag_ids:
            return []
        result = await self.db.execute(select(StageModel).where(StageModel.flag_id.in_(flag_ids)))
        return list(result.scalars().all())
