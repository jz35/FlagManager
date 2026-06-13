from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.application.flag_service import FlagService
from app.application.stage_service import StageService
from app.core.errors import AppError, ErrorCode
from app.domain.checkins.validation import validate_checkin_payload
from app.domain.flags.validation import can_flag_checkin
from app.domain.stages.validation import can_stage_checkin
from app.infrastructure.cache.redis_client import redis_client
from app.infrastructure.db.models import CheckinModel
from app.infrastructure.repositories.checkin_repository import CheckinRepository
from app.infrastructure.repositories.mappers import checkin_to_dict
from app.infrastructure.repositories.stage_repository import StageRepository
from app.schemas.common import CheckinCreateRequest, CheckinOut


class CheckinService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.checkins = CheckinRepository(db)
        self.stages = StageRepository(db)
        self.flag_service = FlagService(db)
        self.stage_service = StageService(db)

    def _to_out(self, checkin: CheckinModel) -> CheckinOut:
        d = checkin_to_dict(checkin)
        return CheckinOut.model_validate(
            {
                "id": d["id"],
                "userId": d["user_id"],
                "flagId": d["flag_id"],
                "stageId": d["stage_id"],
                "content": d["content"],
                "images": d["images"],
                "mood": d["mood"],
                "checkinDate": d["checkin_date"],
                "createdAt": d["created_at"],
            }
        )

    async def _invalidate_stats_cache(self, user_id: UUID) -> None:
        await redis_client.delete_pattern(f"stats:*:{user_id}:*")

    async def list_checkins(
        self,
        user_id: UUID,
        flag_id: UUID | None = None,
        stage_id: UUID | None = None,
        from_date=None,
        to_date=None,
    ) -> list[CheckinOut]:
        if flag_id:
            await self.flag_service.get_flag(user_id, flag_id)
        if stage_id:
            await self.stage_service._get_stage_owned(user_id, stage_id)

        checkins = await self.checkins.list_by_user(user_id, flag_id, stage_id, from_date, to_date)
        return [self._to_out(c) for c in checkins]

    async def create_checkin(self, user_id: UUID, payload: CheckinCreateRequest) -> CheckinOut:
        flag_id = UUID(payload.flag_id)
        stage_id = UUID(payload.stage_id)

        flag = await self.flag_service.get_flag(user_id, flag_id)
        stage = await self.stage_service._get_stage_owned(user_id, stage_id)

        if stage.flag_id != flag.id:
            raise AppError(ErrorCode.VALIDATION_ERROR, "阶段与 Flag 不匹配", 422)

        if not can_flag_checkin(flag.status):
            raise AppError(ErrorCode.BUSINESS_RULE_VIOLATION, "当前 Flag 不可打卡", 400)
        if not can_stage_checkin(stage.status):
            raise AppError(ErrorCode.BUSINESS_RULE_VIOLATION, "当前阶段不可打卡", 400)

        error = validate_checkin_payload(payload.content, payload.mood)
        if error:
            raise AppError(ErrorCode.VALIDATION_ERROR, error, 422)

        checkin = CheckinModel(
            user_id=user_id,
            flag_id=flag_id,
            stage_id=stage_id,
            content=payload.content.strip(),
            mood=payload.mood.strip(),
            images=payload.images or [],
            checkin_date=payload.checkin_date,
            created_at=datetime.now(UTC),
        )
        checkin = await self.checkins.create(checkin)

        if stage.status == "pending":
            stage.status = "active"
            stage.updated_at = datetime.now(UTC)
            await self.stages.save(stage)

        await self._invalidate_stats_cache(user_id)
        return self._to_out(checkin)
