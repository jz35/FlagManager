from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.application.flag_service import FlagService
from app.core.errors import AppError, ErrorCode
from app.domain.stages.enums import VALID_STAGE_STATUSES
from app.domain.stages.validation import validate_stage_payload
from app.domain.stats.calculator import evaluate_stage_result, is_stage_ended
from app.infrastructure.cache.redis_client import redis_client
from app.infrastructure.db.models import StageModel
from app.infrastructure.repositories.checkin_repository import CheckinRepository
from app.infrastructure.repositories.mappers import (
    checkin_to_dict,
    flag_to_dict,
    stage_to_dict,
    stage_to_dict_with_dates,
)
from app.infrastructure.repositories.stage_repository import StageRepository
from app.schemas.common import (
    StageCreateRequest,
    StageDetailData,
    StageDetailStats,
    StageEvaluateData,
    StageOut,
    StageUpdateRequest,
    CheckinOut,
    FlagOut,
)


class StageService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.stages = StageRepository(db)
        self.checkins = CheckinRepository(db)
        self.flag_service = FlagService(db)

    async def _invalidate_stats_cache(self, user_id: UUID) -> None:
        await redis_client.delete_pattern(f"stats:*:{user_id}:*")

    def _to_out(self, stage: StageModel) -> StageOut:
        d = stage_to_dict(stage)
        return StageOut.model_validate(
            {
                "id": d["id"],
                "flagId": d["flag_id"],
                "title": d["title"],
                "goal": d["goal"],
                "startDate": d["start_date"],
                "endDate": d["end_date"],
                "checkinFrequency": d["checkin_frequency"],
                "reward": d["reward"],
                "punishment": d["punishment"],
                "status": d["status"],
            }
        )

    async def _get_stage_owned(self, user_id: UUID, stage_id: UUID) -> StageModel:
        stage = await self.stages.get_by_id(stage_id)
        if stage is None:
            raise AppError(ErrorCode.NOT_FOUND, "阶段不存在", 404)
        await self.flag_service.get_flag(user_id, stage.flag_id)
        return stage

    async def list_by_flag(self, user_id: UUID, flag_id: UUID) -> list[StageOut]:
        await self.flag_service.get_flag(user_id, flag_id)
        stages = await self.stages.list_by_flag(flag_id)
        return [self._to_out(s) for s in stages]

    async def get_detail(self, user_id: UUID, stage_id: UUID) -> StageDetailData:
        stage = await self._get_stage_owned(user_id, stage_id)
        flag = await self.flag_service.get_flag(user_id, stage.flag_id)
        checkin_models = await self.checkins.list_by_stage(stage_id)
        checkin_dicts = [checkin_to_dict(c) for c in checkin_models]
        stage_dict = stage_to_dict_with_dates(stage)
        result = evaluate_stage_result(stage_dict, checkin_dicts)

        from app.domain.stats.calculator import get_current_streak, get_stage_miss_count, get_stage_progress

        return StageDetailData(
            stage=self._to_out(stage),
            flag=FlagOut.model_validate(
                {
                    "id": str(flag.id),
                    "userId": str(flag.user_id),
                    "title": flag.title,
                    "description": flag.description,
                    "category": flag.category,
                    "startDate": flag.start_date,
                    "targetDate": flag.target_date,
                    "status": flag.status,
                    "cover": flag.cover,
                }
            ),
            checkins=[
                CheckinOut.model_validate(
                    {
                        "id": c["id"],
                        "userId": c["user_id"],
                        "flagId": c["flag_id"],
                        "stageId": c["stage_id"],
                        "content": c["content"],
                        "images": c["images"],
                        "mood": c["mood"],
                        "checkinDate": c["checkin_date"],
                        "createdAt": c["created_at"],
                    }
                )
                for c in checkin_dicts
            ],
            stats=StageDetailStats(
                progress=get_stage_progress(stage_dict, checkin_dicts),
                expected=result["expected"],
                actual=result["actual"],
                passed=result["passed"],
                miss_count=get_stage_miss_count(stage_dict, checkin_dicts),
                current_streak=get_current_streak(checkin_dicts),
            ),
        )

    async def create_stage(self, user_id: UUID, payload: StageCreateRequest) -> StageOut:
        flag_id = UUID(payload.flag_id)
        flag = await self.flag_service.get_flag(user_id, flag_id)
        if flag.status != "active":
            raise AppError(ErrorCode.BUSINESS_RULE_VIOLATION, "当前 Flag 不可添加阶段", 400)

        error = validate_stage_payload(
            payload.title,
            payload.goal,
            payload.start_date,
            payload.end_date,
            payload.checkin_frequency,
        )
        if error:
            raise AppError(ErrorCode.VALIDATION_ERROR, error, 422)

        stage = StageModel(
            flag_id=flag_id,
            title=payload.title.strip(),
            goal=payload.goal.strip(),
            start_date=payload.start_date,
            end_date=payload.end_date,
            checkin_frequency=payload.checkin_frequency,
            reward=payload.reward.strip(),
            punishment=payload.punishment.strip(),
            status="pending",
        )
        stage = await self.stages.create(stage)
        await self._invalidate_stats_cache(user_id)
        return self._to_out(stage)

    async def update_stage(self, user_id: UUID, stage_id: UUID, payload: StageUpdateRequest) -> StageOut:
        stage = await self._get_stage_owned(user_id, stage_id)
        data = payload.model_dump(exclude_unset=True, by_alias=False)

        if "status" in data and data["status"] not in VALID_STAGE_STATUSES:
            raise AppError(ErrorCode.VALIDATION_ERROR, "无效的阶段状态", 422)

        title = data.get("title", stage.title)
        goal = data.get("goal", stage.goal)
        start_date = data.get("start_date", stage.start_date)
        end_date = data.get("end_date", stage.end_date)
        freq = data.get("checkin_frequency", stage.checkin_frequency)

        error = validate_stage_payload(title, goal, start_date, end_date, freq)
        if error:
            raise AppError(ErrorCode.VALIDATION_ERROR, error, 422)

        for key, value in data.items():
            if value is not None:
                setattr(stage, key, value.strip() if isinstance(value, str) else value)

        stage.updated_at = datetime.now(UTC)
        await self.stages.save(stage)
        await self._invalidate_stats_cache(user_id)
        return self._to_out(stage)

    async def evaluate_stage(self, user_id: UUID, stage_id: UUID) -> StageEvaluateData:
        stage = await self._get_stage_owned(user_id, stage_id)
        if stage.status not in ("pending", "active"):
            raise AppError(ErrorCode.BUSINESS_RULE_VIOLATION, "当前阶段不可评估", 400)
        if not is_stage_ended(stage_to_dict_with_dates(stage)):
            raise AppError(ErrorCode.BUSINESS_RULE_VIOLATION, "阶段尚未结束", 400)

        checkin_models = await self.checkins.list_by_stage(stage_id)
        checkin_dicts = [checkin_to_dict(c) for c in checkin_models]
        stage_dict = stage_to_dict_with_dates(stage)
        result = evaluate_stage_result(stage_dict, checkin_dicts)

        stage.status = "completed" if result["passed"] else "failed"
        stage.updated_at = datetime.now(UTC)
        await self.stages.save(stage)
        await self._invalidate_stats_cache(user_id)

        return StageEvaluateData(
            stage=self._to_out(stage),
            expected=result["expected"],
            actual=result["actual"],
            passed=result["passed"],
        )
