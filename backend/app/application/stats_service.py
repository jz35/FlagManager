from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.application.flag_service import FlagService
from app.domain.stats.calculator import (
    build_heatmap_days,
    get_current_streak,
    get_flag_progress,
    get_longest_streak,
    get_month_checkin_count,
    get_total_checkin_days,
    get_today_pending_stages,
)
from app.infrastructure.cache.redis_client import redis_client
from app.infrastructure.repositories.checkin_repository import CheckinRepository
from app.infrastructure.repositories.flag_repository import FlagRepository
from app.infrastructure.repositories.mappers import (
    checkin_to_dict,
    flag_to_dict_with_dates,
    stage_to_dict_with_dates,
)
from app.infrastructure.repositories.stage_repository import StageRepository
from app.schemas.common import (
    FlagOut,
    FlagProgressItem,
    HeatmapItem,
    StageOut,
    StatsOverviewData,
    TodayPendingItem,
)


class StatsService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.flags = FlagRepository(db)
        self.stages = StageRepository(db)
        self.checkins = CheckinRepository(db)
        self.flag_service = FlagService(db)

    async def _load_user_data(self, user_id: UUID, flag_id: UUID | None = None):
        if flag_id:
            await self.flag_service.get_flag(user_id, flag_id)
            flag_models = [await self.flag_service.get_flag(user_id, flag_id)]
        else:
            flag_models = await self.flags.list_by_user(user_id)

        flag_ids = [f.id for f in flag_models]
        stage_models = await self.stages.list_by_user_flags(flag_ids)
        checkin_models = await self.checkins.list_by_user(user_id, flag_id=flag_id)

        flags = [flag_to_dict_with_dates(f) for f in flag_models]
        stages = [stage_to_dict_with_dates(s) for s in stage_models]
        checkins = [checkin_to_dict(c) for c in checkin_models]
        return flags, stages, checkins

    async def overview(self, user_id: UUID, flag_id: UUID | None = None) -> StatsOverviewData:
        cache_key = f"stats:overview:{user_id}:{flag_id or 'all'}"
        cached = await redis_client.get_json(cache_key)
        if cached:
            return StatsOverviewData.model_validate(cached)

        _, _, checkins = await self._load_user_data(user_id, flag_id)
        data = StatsOverviewData(
            total_checkin_days=get_total_checkin_days(checkins),
            current_streak=get_current_streak(checkins),
            longest_streak=get_longest_streak(checkins),
            month_count=get_month_checkin_count(checkins),
        )
        await redis_client.set_json(cache_key, data.model_dump(by_alias=True))
        return data

    async def heatmap(self, user_id: UUID, flag_id: UUID | None = None, days: int = 84) -> list[HeatmapItem]:
        cache_key = f"stats:heatmap:{user_id}:{flag_id or 'all'}:{days}"
        cached = await redis_client.get_json(cache_key)
        if cached:
            return [HeatmapItem.model_validate(item) for item in cached["items"]]

        _, _, checkins = await self._load_user_data(user_id, flag_id)
        items = build_heatmap_days(checkins, days)
        await redis_client.set_json(cache_key, {"items": items})
        return [HeatmapItem.model_validate(item) for item in items]

    async def flag_progress(self, user_id: UUID) -> list[FlagProgressItem]:
        flags, stages, checkins = await self._load_user_data(user_id)
        items = []
        for flag in flags:
            percent = get_flag_progress(flag, stages, checkins)
            items.append(FlagProgressItem(flag_id=flag["id"], percent=percent))
        return items

    async def today_pending_stages(self, user_id: UUID) -> list[TodayPendingItem]:
        flags, stages, checkins = await self._load_user_data(user_id)
        pending_stages = get_today_pending_stages(stages, checkins, flags)
        flag_map = {f["id"]: f for f in flags}
        result = []
        for stage in pending_stages:
            flag = flag_map.get(stage["flag_id"])
            if not flag:
                continue
            result.append(
                TodayPendingItem(
                    stage=StageOut.model_validate(
                        {
                            "id": stage["id"],
                            "flagId": stage["flag_id"],
                            "title": stage["title"],
                            "goal": stage["goal"],
                            "startDate": stage["start_date"],
                            "endDate": stage["end_date"],
                            "checkinFrequency": stage["checkin_frequency"],
                            "reward": stage["reward"],
                            "punishment": stage["punishment"],
                            "status": stage["status"],
                        }
                    ),
                    flag=FlagOut.model_validate(
                        {
                            "id": flag["id"],
                            "userId": flag["user_id"],
                            "title": flag["title"],
                            "description": flag["description"],
                            "category": flag["category"],
                            "startDate": flag["start_date"],
                            "targetDate": flag["target_date"],
                            "status": flag["status"],
                            "cover": flag["cover"],
                        }
                    ),
                )
            )
        return result
