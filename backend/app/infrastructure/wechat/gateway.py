import hashlib
import logging

import httpx

from app.core.config import get_settings
from app.core.errors import AppError, ErrorCode

logger = logging.getLogger(__name__)


class WechatAuthGateway:
    async def resolve_open_id(self, code: str) -> str:
        settings = get_settings()
        if not settings.wechat_auth_enabled:
            digest = hashlib.sha256(code.encode()).hexdigest()[:16]
            return f"mock:{digest}"

        if not settings.wechat_app_id or not settings.wechat_app_secret:
            raise AppError(ErrorCode.UNAUTHORIZED, "微信登录未配置", 401)

        url = "https://api.weixin.qq.com/sns/jscode2session"
        params = {
            "appid": settings.wechat_app_id,
            "secret": settings.wechat_app_secret,
            "js_code": code,
            "grant_type": "authorization_code",
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            data = response.json()

        if "errcode" in data and data["errcode"] != 0:
            logger.error("WeChat code2session failed: %s", data)
            raise AppError(ErrorCode.UNAUTHORIZED, "微信登录失败", 401)

        open_id = data.get("openid")
        if not open_id:
            raise AppError(ErrorCode.UNAUTHORIZED, "微信登录失败", 401)
        return open_id
