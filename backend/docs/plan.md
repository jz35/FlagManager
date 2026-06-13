---
name: backend-1.0.0
overview: 为 FlagManager 新建 FastAPI 后端 1.0.0，按当前前端 Vuex 行为反推 REST 接口，使用 DDD 分层、PostgreSQL 持久化、Redis 缓存和 Docker 编排。计划只覆盖当前前端已完成流程：登录、Flag、阶段、打卡、统计，以及图片字段的兼容占位。
todos:
  - id: init-backend
    content: 初始化 backend FastAPI 工程、依赖、Docker Compose 和 /health
    status: pending
  - id: db-models
    content: 建立 PostgreSQL 模型、Alembic 迁移、数据库连接和 Redis 客户端
    status: pending
  - id: domain-rules
    content: 实现 DDD 领域枚举、校验、频率解析和统计纯函数
    status: pending
  - id: auth-api
    content: 实现 mock-compatible 微信登录、JWT 和认证依赖
    status: pending
  - id: flag-stage-checkin-api
    content: 实现 Flag、Stage、Checkin REST 接口和业务规则
    status: pending
  - id: stats-api
    content: 实现 overview、heatmap、flag-progress、today-pending-stages 统计接口和缓存
    status: pending
  - id: tests-docs
    content: 补齐单元测试、集成测试、OpenAPI 描述和 backend README
    status: pending
  - id: verify
    content: 运行 Docker、迁移、pytest 和核心链路验收
    status: pending
isProject: false
---

# FlagManager Backend 1.0.0 开发计划

## 已确认范围

- 后端目录新建在 `[backend](backend)`，不改动现有前端业务代码，除非进入实现阶段后你明确要求前后端联调改造。
- 1.0.0 只覆盖当前前端已完成流程：登录、Flag、阶段、打卡、统计。
- 不纳入 1.0.0：删除接口、真实对象存储上传、AI 打卡检测、AI 总结报告、订阅消息、VIP、社交监督。
- 登录采用开发兼容方案：接受前端当前 `mock_code` / 微信 `code`，后端返回 JWT；真实微信 `code2session` 以接口适配器预留，默认配置未开启时走 mock-compatible 分支。
- 当前前端没有 HTTP 接口层。后端 REST 契约从 `[FlagManager/store/flag.js](FlagManager/store/flag.js)`、`[FlagManager/common/mock/flag-data.js](FlagManager/common/mock/flag-data.js)`、`[FlagManager/common/utils/validate.js](FlagManager/common/utils/validate.js)`、`[FlagManager/common/utils/stats.js](FlagManager/common/utils/stats.js)` 反推。
- 同一阶段同一天允许多次打卡，保持当前 `createCheckin` 行为；“今日待打卡”只要当天已有任意一条打卡就不再显示。
- 图片在 1.0.0 中按 `images: string[]` 存储 URL 或前端临时路径，不实现文件上传接口。

## 推荐架构方案

推荐方案：`FastAPI + DDD 分层单体 + SQLAlchemy 2.0 async + Alembic + PostgreSQL + Redis + Docker Compose`。

理由：
- 当前业务边界清晰，核心领域是 `User -> Flag -> Stage -> Checkin`，DDD 分层足够表达规则，但不需要微服务。
- FastAPI 原生 OpenAPI 方便前端按契约对接。
- PostgreSQL 负责关系数据和约束；Redis 只做读取缓存、JWT blocklist 预留和统计结果缓存，避免过早复杂化。
- Docker Compose 统一启动 `api`、`postgres`、`redis`，便于本地和部署迁移。

备选方案 1：传统 CRUD 分层，不强调 DDD。实现更快，但业务规则会散在路由和 service，后续阶段判定、统计、AI 扩展会变难维护。

备选方案 2：按模块拆微服务。扩展性强，但 1.0.0 规模不需要，会增加部署、鉴权和事务复杂度。

## 后端目录结构

新建以下结构：

```text
FM-backend-1.0.0/
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   ├── errors.py
│   │   └── response.py
│   ├── api/
│   │   └── v1/
│   │       ├── router.py
│   │       ├── auth.py
│   │       ├── flags.py
│   │       ├── stages.py
│   │       ├── checkins.py
│   │       └── stats.py
│   ├── domain/
│   │   ├── users/
│   │   ├── flags/
│   │   ├── stages/
│   │   ├── checkins/
│   │   └── stats/
│   ├── application/
│   │   ├── auth_service.py
│   │   ├── flag_service.py
│   │   ├── stage_service.py
│   │   ├── checkin_service.py
│   │   └── stats_service.py
│   ├── infrastructure/
│   │   ├── db/
│   │   │   ├── session.py
│   │   │   ├── base.py
│   │   │   └── models.py
│   │   ├── repositories/
│   │   ├── cache/
│   │   └── wechat/
│   └── schemas/
├── alembic/
├── tests/
├── docker-compose.yml
├── Dockerfile
├── pyproject.toml
├── alembic.ini
├── .env.example
└── README.md
```

职责固定如下：
- `api/v1/*`：只处理 HTTP 参数、认证依赖、状态码和响应。
- `schemas/*`：Pydantic 请求/响应模型，字段名严格使用前端 camelCase：`userId`、`startDate`、`targetDate`、`checkinFrequency`、`checkinDate`、`createdAt`。
- `application/*`：用例编排、事务边界、缓存读写。
- `domain/*`：枚举、领域规则、统计纯函数，不依赖 FastAPI、SQLAlchemy、Redis。
- `infrastructure/*`：数据库模型、仓储实现、Redis、微信登录适配器。

## 统一 API 规范

基础前缀：`/api/v1`。

认证：
- 除 `POST /api/v1/auth/wechat/login` 和 `GET /health` 外，所有接口都需要 `Authorization: Bearer <accessToken>`。
- JWT payload 至少包含 `sub=user.id`、`openId`、`exp`。

响应格式固定为：

```json
{
  "data": {},
  "message": "ok"
}
```

列表响应固定为：

```json
{
  "data": {
    "items": []
  },
  "message": "ok"
}
```

错误响应固定为：

```json
{
  "detail": {
    "code": "VALIDATION_ERROR",
    "message": "请填写 Flag 名称"
  }
}
```

错误码：
- `UNAUTHORIZED`：未登录或 token 无效。
- `FORBIDDEN`：访问非本人资源。
- `NOT_FOUND`：资源不存在。
- `VALIDATION_ERROR`：字段校验失败。
- `BUSINESS_RULE_VIOLATION`：Flag 不可打卡、阶段不可打卡等业务规则失败。

## 数据库设计

使用 PostgreSQL，主键使用 UUID，API 返回字符串。前端只把 `id` 当字符串比较，不依赖 `flag_101` 这种前缀。

表：`users`
- `id UUID PRIMARY KEY`
- `open_id TEXT UNIQUE NOT NULL`
- `nickname TEXT NOT NULL DEFAULT '微信用户'`
- `avatar_url TEXT NOT NULL DEFAULT ''`
- `bio TEXT NOT NULL DEFAULT ''`
- `created_at TIMESTAMPTZ NOT NULL`
- `updated_at TIMESTAMPTZ NOT NULL`

表：`flags`
- `id UUID PRIMARY KEY`
- `user_id UUID NOT NULL REFERENCES users(id)`
- `title TEXT NOT NULL`
- `description TEXT NOT NULL DEFAULT ''`
- `category TEXT NOT NULL`
- `start_date DATE NOT NULL`
- `target_date DATE NOT NULL`
- `status TEXT NOT NULL CHECK status in ('active','paused','completed','abandoned')`
- `cover TEXT NOT NULL DEFAULT ''`
- `created_at TIMESTAMPTZ NOT NULL`
- `updated_at TIMESTAMPTZ NOT NULL`
- `CHECK (target_date >= start_date)`

表：`stages`
- `id UUID PRIMARY KEY`
- `flag_id UUID NOT NULL REFERENCES flags(id) ON DELETE CASCADE`
- `title TEXT NOT NULL`
- `goal TEXT NOT NULL`
- `start_date DATE NOT NULL`
- `end_date DATE NOT NULL`
- `checkin_frequency TEXT NOT NULL`
- `reward TEXT NOT NULL DEFAULT ''`
- `punishment TEXT NOT NULL DEFAULT ''`
- `status TEXT NOT NULL CHECK status in ('pending','active','completed','failed')`
- `created_at TIMESTAMPTZ NOT NULL`
- `updated_at TIMESTAMPTZ NOT NULL`
- `CHECK (end_date >= start_date)`

表：`checkins`
- `id UUID PRIMARY KEY`
- `user_id UUID NOT NULL REFERENCES users(id)`
- `flag_id UUID NOT NULL REFERENCES flags(id) ON DELETE CASCADE`
- `stage_id UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE`
- `content TEXT NOT NULL`
- `images JSONB NOT NULL DEFAULT '[]'`
- `mood TEXT NOT NULL`
- `checkin_date DATE NOT NULL`
- `created_at TIMESTAMPTZ NOT NULL`

索引：
- `flags(user_id, status)`
- `stages(flag_id, status)`
- `checkins(user_id, checkin_date)`
- `checkins(flag_id, checkin_date)`
- `checkins(stage_id, checkin_date)`

不添加 `UNIQUE(stage_id, checkin_date)`，因为当前前端 `createCheckin` 没有限制重复提交。

## 领域规则

Flag：
- 新建默认 `status='active'`、`cover=''`。
- `title` 必填。
- `targetDate` 必填且不能早于 `startDate`。
- `category` 是自由文本，前端传 `学习/健身/阅读/项目/自定义文本` 都接受。
- 状态只允许 `active`、`paused`、`completed`、`abandoned`。

Stage：
- 新建默认 `status='pending'`、`reward=''`、`punishment=''`。
- `title`、`goal`、`endDate` 必填。
- `endDate` 不能早于 `startDate`。
- `checkinFrequency` 只接受 `daily`、`weekly3`、`custom:day:1-7`、`custom:week:1-7`、`custom:month:1-7`。
- 只有所属 Flag 为 `active` 时允许新增阶段。

Checkin：
- 只有所属 Flag 为 `active` 时允许打卡。
- 只有所属 Stage 为 `pending` 或 `active` 时允许打卡。
- `content` 必填。
- `mood` 必填，长度不强制限制预设值；如果前端传自定义值，建议不超过 6 字，后端统一限制 `1 <= len(mood) <= 6`，对齐当前校验。
- `images` 是字符串数组，1.0.0 不验证 URL 是否可访问。
- 对 `pending` 阶段首次打卡后，阶段自动更新为 `active`。

Stage 结束判定：
- 后端提供 `POST /api/v1/stages/{id}/evaluate`。
- 当 `today > endDate` 且状态为 `pending` 或 `active` 时，计算 `actual >= expected`。
- `passed=true` 时更新为 `completed`；否则更新为 `failed`。
- `expected` 算法完全对齐前端 `getExpectedCheckinCount`：
  - `daily`：总天数乘 1。
  - `weekly3`：`ceil(totalDays / 7) * 3`。
  - `custom:day:n`：总天数乘 `n`。
  - `custom:week:n`：`ceil(totalDays / 7) * n`。
  - `custom:month:n`：`ceil(totalDays / 30) * n`。

统计：
- `totalCheckinDays`：按 `checkinDate` 去重后的天数。
- `currentStreak`：如果今天没有打卡，从昨天开始向前算连续天。
- `longestStreak`：按去重日期计算最长连续天数。
- `monthCount`：本月打卡条数，不去重。
- `heatmap`：默认最近 84 天，每天返回 `{ date, count }`。
- `flagProgress`：有阶段时取所有阶段进度平均值；无阶段时按 `startDate` 到 `targetDate` 的时间进度计算。
- `abandoned` Flag 的统计页进度返回 0。

## REST 接口契约

### 健康检查

`GET /health`

响应：

```json
{
  "data": {
    "status": "ok"
  },
  "message": "ok"
}
```

### 登录

`POST /api/v1/auth/wechat/login`

请求：

```json
{
  "code": "mock_code",
  "nickname": "微信用户",
  "avatarUrl": ""
}
```

响应：

```json
{
  "data": {
    "accessToken": "jwt-string",
    "tokenType": "bearer",
    "user": {
      "id": "uuid-string",
      "nickname": "微信用户",
      "avatarUrl": "",
      "bio": "",
      "openId": "mock_xxx",
      "loggedIn": true
    }
  },
  "message": "ok"
}
```

实现规则：
- 当 `WECHAT_AUTH_ENABLED=false` 时，`openId` 用 `mock:{code}` 或 `mock:{hash(code)}` 生成，保证同一个 code 幂等对应同一个用户。
- 当 `WECHAT_AUTH_ENABLED=true` 时，调用微信 `code2session`，失败返回 `UNAUTHORIZED`。

`POST /api/v1/auth/logout`

响应：

```json
{
  "data": {
    "loggedOut": true
  },
  "message": "ok"
}
```

1.0.0 不强制服务端 token 失效；Redis blocklist 只预留结构。

### Flag

`GET /api/v1/flags?status=all|active|paused|completed|abandoned`

响应：

```json
{
  "data": {
    "items": [
      {
        "id": "uuid-string",
        "userId": "uuid-string",
        "title": "完成考研英语",
        "description": "6个月内完成英语基础学习",
        "category": "学习",
        "startDate": "2026-02-01",
        "targetDate": "2026-08-31",
        "status": "active",
        "cover": ""
      }
    ]
  },
  "message": "ok"
}
```

`GET /api/v1/flags/{flagId}`

响应包含 `flag`、`stages`、`recentCheckins`：

```json
{
  "data": {
    "flag": {},
    "stages": [],
    "recentCheckins": []
  },
  "message": "ok"
}
```

`POST /api/v1/flags`

请求：

```json
{
  "title": "完成考研英语",
  "description": "6个月内完成英语基础学习",
  "category": "学习",
  "startDate": "2026-02-01",
  "targetDate": "2026-08-31"
}
```

响应：完整 Flag。

`PATCH /api/v1/flags/{flagId}`

请求字段可选：`title`、`description`、`category`、`startDate`、`targetDate`、`cover`。

响应：更新后完整 Flag。

`PATCH /api/v1/flags/{flagId}/status`

请求：

```json
{
  "status": "paused"
}
```

响应：更新后完整 Flag。

### Stage

`GET /api/v1/flags/{flagId}/stages`

响应：`{ data: { items: Stage[] }, message: 'ok' }`。

`GET /api/v1/stages/{stageId}`

响应包含 `stage`、`flag`、`checkins`、`stats`。

`POST /api/v1/stages`

请求：

```json
{
  "flagId": "uuid-string",
  "title": "单词强化",
  "goal": "每天背50个单词，坚持30天",
  "startDate": "2026-06-01",
  "endDate": "2026-07-01",
  "checkinFrequency": "daily",
  "reward": "看一场电影",
  "punishment": "周末少玩1小时游戏"
}
```

响应：完整 Stage。

`PATCH /api/v1/stages/{stageId}`

请求字段可选：`title`、`goal`、`startDate`、`endDate`、`checkinFrequency`、`reward`、`punishment`、`status`。

响应：更新后完整 Stage。

`POST /api/v1/stages/{stageId}/evaluate`

响应：

```json
{
  "data": {
    "stage": {},
    "expected": 31,
    "actual": 28,
    "passed": false
  },
  "message": "ok"
}
```

### Checkin

`GET /api/v1/checkins?flagId=&stageId=&from=&to=`

参数都可选，返回当前用户可访问的打卡记录，默认按 `checkinDate desc, createdAt desc` 排序。

`POST /api/v1/checkins`

请求：

```json
{
  "flagId": "uuid-string",
  "stageId": "uuid-string",
  "content": "背了50个单词",
  "mood": "轻松",
  "images": [],
  "checkinDate": "2026-06-13"
}
```

响应：完整 Checkin。

### Stats

`GET /api/v1/stats/overview?flagId=`

响应：

```json
{
  "data": {
    "totalCheckinDays": 12,
    "currentStreak": 3,
    "longestStreak": 8,
    "monthCount": 9
  },
  "message": "ok"
}
```

`GET /api/v1/stats/heatmap?flagId=&days=84`

响应：

```json
{
  "data": {
    "items": [
      { "date": "2026-06-13", "count": 1 }
    ]
  },
  "message": "ok"
}
```

`GET /api/v1/stats/flag-progress`

响应：

```json
{
  "data": {
    "items": [
      { "flagId": "uuid-string", "percent": 66 }
    ]
  },
  "message": "ok"
}
```

`GET /api/v1/stats/today-pending-stages`

响应：

```json
{
  "data": {
    "items": [
      {
        "stage": {},
        "flag": {}
      }
    ]
  },
  "message": "ok"
}
```

## Redis 使用计划

Redis 只用于非核心持久化：
- 缓存 `stats:overview:{userId}:{flagId|all}`，TTL 60 秒。
- 缓存 `stats:heatmap:{userId}:{flagId|all}:{days}`，TTL 60 秒。
- 创建、更新 Flag/Stage/Checkin 后清理当前用户统计缓存。
- 预留 `jwt:blocklist:{jti}`，1.0.0 logout 不强依赖。

如果 Redis 不可用：
- API 不失败。
- 记录 warning。
- 直接从 PostgreSQL 计算统计。

## Docker 与配置

`docker-compose.yml` 服务：
- `api`：FastAPI + Uvicorn。
- `postgres`：PostgreSQL 16。
- `redis`：Redis 7。

`.env.example` 必须包含：

```env
APP_NAME=FlagManager API
APP_ENV=development
API_V1_PREFIX=/api/v1
DATABASE_URL=postgresql+asyncpg://flagmanager:flagmanager@postgres:5432/flagmanager
REDIS_URL=redis://redis:6379/0
JWT_SECRET_KEY=change-me
JWT_EXPIRE_MINUTES=10080
WECHAT_AUTH_ENABLED=false
WECHAT_APP_ID=
WECHAT_APP_SECRET=
CORS_ORIGINS=*
```

本地命令：
- `docker compose up --build`
- `docker compose exec api alembic upgrade head`
- `docker compose exec api pytest`

## 测试计划

测试框架：`pytest`、`pytest-asyncio`、`httpx.AsyncClient`。

单元测试：
- `parse_checkin_frequency` 覆盖 `daily`、`weekly3`、`custom:day:n`、`custom:week:n`、`custom:month:n`、非法输入。
- `expected_checkin_count` 覆盖日、周、月频率和跨日期范围。
- `current_streak` 覆盖今天已打、今天未打但昨天已打、断签。
- `flag_progress` 覆盖无阶段、有阶段、abandoned 返回 0。

集成测试：
- 登录 mock code 返回用户和 JWT。
- 未登录访问 `/flags` 返回 401。
- 创建 Flag 后列表可查。
- 编辑 Flag 后字段保持 camelCase 响应。
- 更新 Flag 为 `paused` 后创建打卡失败。
- 创建 Stage 默认 `pending`。
- pending Stage 第一次打卡后自动变 `active`。
- 同一 Stage 同一天可创建多条 Checkin。
- 阶段结束 evaluate 后按 expected/actual 更新 `completed` 或 `failed`。
- 统计 overview、heatmap、flag-progress 与前端算法一致。

契约测试：
- 所有响应字段用 camelCase。
- 所有日期字段是 `YYYY-MM-DD`。
- 列表响应统一 `{ data: { items: [] }, message: 'ok' }`。

## 实施顺序

1. 初始化后端工程
- 创建 `backend/pyproject.toml`。
- 添加 FastAPI、Uvicorn、Pydantic Settings、SQLAlchemy async、asyncpg、Alembic、Redis、PyJWT/passlib 或 python-jose、pytest 依赖。
- 创建 `app/main.py` 和 `/health`。
- 验证：`docker compose up --build` 后访问 `/health` 返回 `ok`。

2. 配置与基础设施
- 实现 `core/config.py` 读取 `.env`。
- 实现数据库 async session。
- 实现 Redis client，失败降级。
- 实现统一响应和错误处理。
- 验证：数据库、Redis 连接测试通过。

3. 数据模型和迁移
- 建立 `users`、`flags`、`stages`、`checkins` SQLAlchemy 模型。
- 生成 Alembic 初始迁移。
- 添加索引和 check 约束。
- 验证：`alembic upgrade head` 成功，测试库可建表。

4. 领域层
- 实现 Flag、Stage、Checkin 状态枚举。
- 实现日期校验、频率解析、期望打卡次数、统计纯函数。
- 写领域单元测试。
- 验证：领域测试全部通过。

5. Auth 模块
- 实现 `WechatAuthGateway`：mock-compatible 和真实 code2session 两个分支。
- 实现用户 upsert。
- 实现 JWT 签发和认证依赖。
- 实现 login/logout 路由。
- 验证：mock code 登录返回稳定用户和可用 token。

6. Flag 模块
- 实现仓储、service、schemas、routes。
- 路由覆盖列表、详情、创建、编辑、状态更新。
- 保证响应字段对齐前端。
- 验证：Flag 集成测试通过。

7. Stage 模块
- 实现仓储、service、schemas、routes。
- 路由覆盖按 Flag 列表、详情、创建、编辑、evaluate。
- 创建阶段前校验 Flag 属于当前用户且为 `active`。
- 验证：Stage 集成测试通过。

8. Checkin 模块
- 实现仓储、service、schemas、routes。
- 创建打卡时校验 Flag/Stage 归属、状态和日期。
- 创建成功后，如果 Stage 是 `pending`，同事务更新为 `active`。
- 验证：Checkin 集成测试通过。

9. Stats 模块
- 实现 overview、heatmap、flag-progress、today-pending-stages。
- 统计函数复用 domain 纯函数。
- Redis 缓存只包裹读取，不改变结果。
- 验证：统计集成测试与前端算法样例一致。

10. OpenAPI 与开发文档
- 给每个路由补 summary、response model。
- 在 `backend/README.md` 写启动、迁移、测试、接口说明。
- 验证：`/docs` 可打开，主要接口 schema 清晰。

11. 全量验收
- 执行 `pytest`。
- 执行 `docker compose up --build`。
- 执行 `alembic upgrade head`。
- 手动调用 login -> create flag -> create stage -> create checkin -> stats 链路。
- 确认没有修改 `README.md` 和现有前端文件，除非你后续明确要求联调。

## 验收标准

后端 1.0.0 完成时必须满足：
- Docker 一条命令能启动 API、PostgreSQL、Redis。
- `/health` 正常。
- `/docs` 能看到完整 OpenAPI。
- mock-compatible 登录可用，返回 JWT。
- Flag、Stage、Checkin 的 CRUD 子集覆盖当前前端所有 Vuex actions。
- 统计结果与前端 `stats.js` 规则一致。
- 所有 API 响应字段使用前端期望的 camelCase。
- 所有测试通过。
- 不实现 1.0.0 范围外功能，不留下半成品路由。