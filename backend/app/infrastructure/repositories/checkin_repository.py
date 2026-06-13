from datetime import date
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.db.models import CheckinModel


class CheckinRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_by_user(
        self,
        user_id: UUID,
        flag_id: UUID | None = None,
        stage_id: UUID | None = None,
        from_date: date | None = None,
        to_date: date | None = None,
    ) -> list[CheckinModel]:
        query = select(CheckinModel).where(CheckinModel.user_id == user_id)
        if flag_id:
            query = query.where(CheckinModel.flag_id == flag_id)
        if stage_id:
            query = query.where(CheckinModel.stage_id == stage_id)
        if from_date:
            query = query.where(CheckinModel.checkin_date >= from_date)
        if to_date:
            query = query.where(CheckinModel.checkin_date <= to_date)
        query = query.order_by(CheckinModel.checkin_date.desc(), CheckinModel.created_at.desc())
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def list_by_flag(self, flag_id: UUID, limit: int | None = None) -> list[CheckinModel]:
        query = (
            select(CheckinModel)
            .where(CheckinModel.flag_id == flag_id)
            .order_by(CheckinModel.checkin_date.desc(), CheckinModel.created_at.desc())
        )
        if limit:
            query = query.limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def list_by_stage(self, stage_id: UUID) -> list[CheckinModel]:
        result = await self.db.execute(
            select(CheckinModel)
            .where(CheckinModel.stage_id == stage_id)
            .order_by(CheckinModel.checkin_date.desc(), CheckinModel.created_at.desc())
        )
        return list(result.scalars().all())

    async def create(self, checkin: CheckinModel) -> CheckinModel:
        self.db.add(checkin)
        await self.db.flush()
        return checkin
