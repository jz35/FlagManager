from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "FlagManager API"
    app_env: str = "development"
    api_v1_prefix: str = "/api/v1"
    database_url: str = "postgresql+asyncpg://flagmanager:flagmanager@localhost:5432/flagmanager"
    redis_url: str = "redis://localhost:6379/0"
    jwt_secret_key: str = "change-me"
    jwt_expire_minutes: int = 10080
    wechat_auth_enabled: bool = False
    wechat_app_id: str = ""
    wechat_app_secret: str = ""
    cors_origins: str = "*"


@lru_cache
def get_settings() -> Settings:
    return Settings()
