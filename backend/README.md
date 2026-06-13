# FlagManager Backend 1.0.0

FastAPI + DDD + PostgreSQL + Redis 后端 API。

## 快速启动

```bash
cd backend
cp .env.example .env
docker compose up --build
```

服务地址：
- API: http://localhost:8000
- OpenAPI: http://localhost:8000/docs
- 健康检查: http://localhost:8000/health

## 本地开发

```bash
pip install -e ".[dev]"
alembic upgrade head
uvicorn app.main:app --reload
```

## 测试

先启动 PostgreSQL（可用 docker compose 只启动 postgres/redis）：

```bash
docker compose up -d postgres redis
set TEST_DATABASE_URL=postgresql+asyncpg://flagmanager:flagmanager@localhost:5432/flagmanager_test
pytest
```

或在容器内：

```bash
docker compose exec api pytest
```

## API 前缀

所有业务接口前缀为 `/api/v1`，响应格式：

```json
{
  "data": {},
  "message": "ok"
}
```

## 主要模块

| 模块 | 路径 |
|------|------|
| 登录 | POST /api/v1/auth/wechat/login |
| Flag | /api/v1/flags |
| 阶段 | /api/v1/stages |
| 打卡 | /api/v1/checkins |
| 统计 | /api/v1/stats/* |

## 环境变量

见 `.env.example`。

- `WECHAT_AUTH_ENABLED=false` 时使用 mock-compatible 登录
- `JWT_SECRET_KEY` 生产环境必须修改
