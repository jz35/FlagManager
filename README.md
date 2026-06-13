<p align="center">
  <img src="FlagManager/FlagManagerLOGO.png" alt="FlagManager Logo" width="140" />
</p>

<h1 align="center">FlagManager</h1>

<p align="center"><strong>把立下的 Flag，一步步兑现掉</strong></p>

<p align="center">
  面向大学生的长期目标管理产品 · 微信小程序 + 后端 API
</p>

<p align="center">
  <a href="#快速开始">快速开始</a>
  ·
  <a href="#项目结构">项目结构</a>
  ·
  <a href="#技术栈">技术栈</a>
  ·
  <a href="#开发进度">开发进度</a>
</p>

---

## 项目简介

FlagManager 帮助大学生管理长期目标。产品围绕 **Flag → 阶段计划 → 打卡 → 统计** 形成闭环，适用于学习、健身、阅读、考证等需要持续投入的目标。

与待办清单不同，FlagManager 强调：

- 目标有生命周期（进行中 / 暂停 / 完成 / 放弃）
- 大目标可拆成带周期的阶段
- 打卡记录与统计可视化，便于复盘

当前仓库包含：

| 部分 | 说明 | 状态 |
|------|------|------|
| `FlagManager/` | uni-app 微信小程序前端 | 核心流程已完成 |
| `backend/` | FastAPI 1.0.0 后端 API | 已实现，待前后端联调 |

---

## 核心功能

| 模块 | 能力 |
|------|------|
| 首页 | 今日概览、待打卡提醒、进行中 Flag、暂停 Flag 恢复 |
| Flag | 创建 / 编辑 / 详情 / 列表，多状态筛选 |
| 阶段 | 目标、周期、打卡频率、奖惩设置 |
| 打卡 | 文字记录、图片、今日状态（预设 / 自定义） |
| 统计 | 热力图、连续打卡、Flag 进度 |
| 我的 | 微信登录、数据概览 |

### Flag 生命周期

| 状态 | 行为 |
|------|------|
| 进行中 | 可打卡、添加阶段、编辑 |
| 已暂停 | 可恢复；不可打卡 |
| 已完成 | 只读查看历史与统计 |
| 已放弃 | 归档；统计进度为 0% |

---

## 技术栈

### 前端

| 类别 | 选型 |
|------|------|
| 框架 | [uni-app](https://uniapp.dcloud.net.cn/)（Vue 3） |
| 状态 | Vuex + 本地 Storage |
| 平台 | 微信小程序 |

### 后端

| 类别 | 选型 |
|------|------|
| 框架 | FastAPI |
| 架构 | DDD 分层单体 |
| 数据库 | PostgreSQL 16 |
| 缓存 | Redis 7 |
| ORM / 迁移 | SQLAlchemy 2.0 async + Alembic |
| 部署 | Docker Compose |

---

## 项目结构

```text
FlagManager/
├── README.md                 # 本文件
├── .gitignore
├── FlagManager/              # uni-app 前端工程
│   ├── pages/                # 页面（home / stats / mine / flag / stage / checkin）
│   ├── components/           # fm-* 业务组件
│   ├── common/               # mock、services、utils、styles
│   ├── store/                # Vuex 与持久化
│   └── static/               # 静态资源
└── backend/                  # FastAPI 后端 1.0.0
    ├── app/                  # api / application / domain / infrastructure
    ├── alembic/              # 数据库迁移
    ├── tests/                # 单元与集成测试
    ├── docker-compose.yml
    └── pyproject.toml
```

---

## 快速开始

### 前端（微信小程序）

**环境**

- [HBuilderX](https://www.dcloud.io/hbuilderx.html)
- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

**步骤**

1. 克隆仓库
2. 用 HBuilderX 打开 `FlagManager/` 目录
3. 运行 → 运行到小程序模拟器 → 微信开发者工具

**提示**

- 开发时可勾选「不校验合法域名」
- 本地数据键名：`flagmanager_state`
- 前端当前使用 Vuex + Mock，尚未接入后端 HTTP

### 后端（API）

**Docker 一键启动（推荐）**

```bash
cd backend
cp .env.example .env
docker compose up --build
```

| 地址 | 说明 |
|------|------|
| http://localhost:8000/health | 健康检查 |
| http://localhost:8000/docs | OpenAPI 文档 |

**本地开发**

```bash
cd backend
pip install -e ".[dev]"
docker compose up -d postgres redis
alembic upgrade head
uvicorn app.main:app --reload
```

**运行测试**

```bash
cd backend
docker compose up -d postgres redis
pytest
```

API 前缀：`/api/v1`。响应格式：`{ "data": {}, "message": "ok" }`。

更多接口说明见 [backend/README.md](backend/README.md)。

---

## 页面路由（前端）

| 路径 | 说明 |
|------|------|
| `pages/home/home` | 首页（TabBar） |
| `pages/stats/stats` | 统计（TabBar） |
| `pages/mine/mine` | 我的（TabBar） |
| `pages/flag/create` | 新建 / 编辑 Flag |
| `pages/flag/detail` | Flag 详情 |
| `pages/flag/list` | 全部 Flag |
| `pages/stage/create` | 新建阶段 |
| `pages/stage/detail` | 阶段详情 |
| `pages/checkin/create` | 今日打卡 |

---

## 开发进度

**已完成**

- 前端：Flag / 阶段 / 打卡完整流程、校验、统计、本地持久化
- 后端 1.0.0：登录、Flag、阶段、打卡、统计 REST API
- 后端：PostgreSQL 模型、Alembic 迁移、Redis 缓存、Docker 编排
- 后端：20 项 pytest 测试通过

**规划中**

- 前后端联调，替换前端 Mock 层
- 真实图片上传与对象存储
- AI 阶段建议 / 打卡检测、订阅消息等扩展能力

---

## 仓库说明

- 可运行前端工程、后端 API、Logo 与文档纳入版本管理
- 需求文档、设计文档等内部资料默认不提交（见 `.gitignore`）
- 请勿将 `.env`、密钥等敏感文件提交到仓库

---

## License

[MIT](FlagManager/LICENSE)
