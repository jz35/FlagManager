<p align="center">
  <img src="FlagManager/FlagManagerLOGO.png" alt="FlagManager Logo" width="160" />
</p>

<h1 align="center">FlagManager</h1>

<p align="center">
  把立下的 Flag，一步步兑现掉
</p>

<p align="center">
  <strong>面向大学生的长期目标管理微信小程序</strong>
</p>

<p align="center">
  uni-app · Vue 3 · Vuex · 微信小程序
</p>

---

## 项目简介

FlagManager 是一款帮助大学生管理长期目标的微信小程序。不同于普通待办清单，它围绕 **Flag → 阶段计划 → 打卡 → 统计** 构建完整闭环，让学习、健身、阅读、考证等长期目标可以被拆解、追踪和复盘。

Logo 中的旗帜代表目标，日历代表持续打卡，勾选代表兑现承诺——这也是 FlagManager 想传递的产品理念。

## 核心功能

| 模块 | 能力 |
|------|------|
| 首页 | 今日概览、待打卡提醒、进行中 Flag、已暂停折叠恢复 |
| Flag 管理 | 创建 / 编辑 / 详情 / 全部列表，支持多状态筛选 |
| 阶段计划 | 目标、周期、打卡频率、奖惩设置，AI 阶段建议（Mock） |
| 打卡 | 文字记录、图片上传与预览、预设与自定义今日状态 |
| 统计 | 热力图、近 4 周条形图、连续打卡与 Flag 进度 |
| 我的 | 微信登录、数据概览、Flag 列表入口 |

### Flag 生命周期

| 状态 | 行为 |
|------|------|
| 进行中 | 正常打卡、添加阶段、编辑信息 |
| 已暂停 | 首页或详情页可恢复；不可打卡 |
| 已完成 | 只读查看历史记录与统计 |
| 已放弃 | 归档查看；统计页进度显示为 0% |

### 业务规则亮点

- 暂停 / 完成 / 放弃的 Flag 全链路禁止打卡
- 未开始阶段在首次打卡后自动变为进行中
- 阶段结束后按打卡次数判定达标，弹出奖励或惩罚提示
- 放弃 Flag 需二次确认并展示惩罚文案
- 本地数据持久化，关闭小程序后数据不丢失

## 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | [uni-app](https://uniapp.dcloud.net.cn/)（Vue 3） |
| 状态管理 | Vuex + 本地 Storage 持久化 |
| 目标平台 | 微信小程序（可扩展 H5 / App） |
| 数据层 | 本地 Mock + `uni.setStorageSync` |

## 目录结构

```text
FlagManager/
├── README.md
├── FlagManager/                    # uni-app 工程根目录
│   ├── FlagManagerLOGO.png         # 小程序 Logo
│   ├── pages/
│   │   ├── home/                   # 首页
│   │   ├── stats/                  # 统计
│   │   ├── mine/                   # 我的
│   │   ├── flag/                   # Flag 创建 / 编辑 / 详情 / 列表
│   │   ├── stage/                  # 阶段创建 / 详情
│   │   └── checkin/                # 打卡
│   ├── components/                   # fm-* 业务组件
│   ├── common/
│   │   ├── mock/                   # Mock 数据与常量
│   │   ├── services/               # 登录、AI、提醒等服务
│   │   ├── styles/                 # 主题样式
│   │   └── utils/                  # 校验、统计等工具
│   ├── store/                      # Vuex 模块与持久化
│   ├── static/                     # 静态资源
│   ├── pages.json
│   └── manifest.json
└── .gitignore
```

## 快速开始

### 环境要求

- [HBuilderX](https://www.dcloud.io/hbuilderx.html)（推荐）
- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

### 运行步骤

1. 克隆本仓库到本地
2. 使用 HBuilderX 打开 `FlagManager/` 目录
3. 菜单选择 **运行 → 运行到小程序模拟器 → 微信开发者工具**
4. 在微信开发者工具中预览与调试

### 开发提示

- 开发阶段可勾选 **不校验合法域名**，以便 Mock 图片正常加载
- TabBar 图标位于 `static/tabbar/`
- 业务数据保存在本地 Storage，键名为 `flagmanager_state`

## 页面路由

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

## 开发进度

**已完成**

- Flag / 阶段 / 打卡完整前端流程
- Flag 编辑、多状态管理与筛选
- 表单校验、打卡拦截、阶段奖惩判定
- 热力图、周报条形图与基础统计
- 微信登录（MVP）、本地数据持久化
- AI 阶段建议（Mock）、每日待打卡提醒

**规划中**

- 云数据库与真实图片上传
- AI 打卡检测与阶段总结报告
- 微信订阅消息推送
- VIP 与社交监督等扩展能力

## 仓库说明

本仓库包含可运行的前端工程、Logo 与 README。需求文档、设计文档、低保真原型等内部资料不纳入版本管理。

## License

[MIT](FlagManager/LICENSE)
