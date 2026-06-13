from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import AppError, ErrorCode
from app.core.security import create_access_token
from app.infrastructure.repositories.mappers import user_to_dict
from app.infrastructure.repositories.user_repository import UserRepository
from app.infrastructure.wechat.gateway import WechatAuthGateway
from app.schemas.common import LoginData, UserOut


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.users = UserRepository(db)
        self.wechat = WechatAuthGateway()

    async def login(self, code: str, nickname: str, avatar_url: str) -> LoginData:
        open_id = await self.wechat.resolve_open_id(code)
        user = await self.users.upsert(open_id, nickname, avatar_url)
        token = create_access_token(user.id, user.open_id)
        user_dict = user_to_dict(user)
        return LoginData(
            access_token=token,
            user=UserOut(
                id=user_dict["id"],
                nickname=user_dict["nickname"],
                avatar_url=user_dict["avatar_url"],
                bio=user_dict["bio"],
                open_id=user_dict["open_id"],
                logged_in=True,
            ),
        )

    async def logout(self, user_id: UUID) -> dict:
        return {"logged_out": True}
