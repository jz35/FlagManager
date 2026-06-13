from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import AppError, ErrorCode
from app.domain.flags.enums import VALID_FLAG_STATUSES
from app.domain.flags.validation import validate_flag_payload
from app.infrastructure.cache.redis_client import redis_client
from app.infrastructure.db.models import FlagModel
from app.infrastructure.repositories.flag_repository import FlagRepository
from app.infrastructure.repositories.mappers import flag_to_dict
from app.schemas.common import FlagCreateRequest, FlagOut, FlagUpdateRequest


class FlagService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.flags = FlagRepository(db)

    async def _invalidate_stats_cache(self, user_id: UUID) -> None:
        await redis_client.delete_pattern(f"stats:*:{user_id}:*")

    def _to_out(self, flag: FlagModel) -> FlagOut:
        d = flag_to_dict(flag)
        return FlagOut.model_validate(
            {
                "id": d["id"],
                "userId": d["user_id"],
                "title": d["title"],
                "description": d["description"],
                "category": d["category"],
                "startDate": d["start_date"],
                "targetDate": d["target_date"],
                "status": d["status"],
                "cover": d["cover"],
            }
        )

    async def list_flags(self, user_id: UUID, status: str = "all") -> list[FlagOut]:
        flags = await self.flags.list_by_user(user_id, status)
        return [self._to_out(f) for f in flags]

    async def get_flag(self, user_id: UUID, flag_id: UUID) -> FlagModel:
        flag = await self.flags.get_by_id(flag_id)
        if flag is None:
            raise AppError(ErrorCode.NOT_FOUND, "Flag 不存在", 404)
        if flag.user_id != user_id:
            raise AppError(ErrorCode.FORBIDDEN, "无权访问该 Flag", 403)
        return flag

    async def create_flag(self, user_id: UUID, payload: FlagCreateRequest) -> FlagOut:
        error = validate_flag_payload(payload.title, payload.start_date, payload.target_date)
        if error:
            raise AppError(ErrorCode.VALIDATION_ERROR, error, 422)

        flag = FlagModel(
            user_id=user_id,
            title=payload.title.strip(),
            description=payload.description.strip(),
            category=payload.category.strip(),
            start_date=payload.start_date,
            target_date=payload.target_date,
            status="active",
            cover="",
        )
        flag = await self.flags.create(flag)
        await self._invalidate_stats_cache(user_id)
        return self._to_out(flag)

    async def update_flag(self, user_id: UUID, flag_id: UUID, payload: FlagUpdateRequest) -> FlagOut:
        flag = await self.get_flag(user_id, flag_id)
        data = payload.model_dump(exclude_unset=True, by_alias=False)

        title = data.get("title", flag.title)
        start_date = data.get("start_date", flag.start_date)
        target_date = data.get("target_date", flag.target_date)

        error = validate_flag_payload(title, start_date, target_date)
        if error:
            raise AppError(ErrorCode.VALIDATION_ERROR, error, 422)

        for key, value in data.items():
            if key == "title" and value is not None:
                setattr(flag, key, value.strip())
            elif value is not None:
                setattr(flag, key, value.strip() if isinstance(value, str) else value)

        flag.updated_at = datetime.now(UTC)
        await self.flags.save(flag)
        await self._invalidate_stats_cache(user_id)
        return self._to_out(flag)

    async def update_status(self, user_id: UUID, flag_id: UUID, status: str) -> FlagOut:
        if status not in VALID_FLAG_STATUSES:
            raise AppError(ErrorCode.VALIDATION_ERROR, "无效的 Flag 状态", 422)
        flag = await self.get_flag(user_id, flag_id)
        flag.status = status
        flag.updated_at = datetime.now(UTC)
        await self.flags.save(flag)
        await self._invalidate_stats_cache(user_id)
        return self._to_out(flag)
