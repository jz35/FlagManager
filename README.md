# FlagManager

面向大学生的长期目标管理微信小程序。通过 **Flag → 阶段计划 → 打卡 → 统计** 的流程，帮助用户拆解并坚持完成长期目标。

当前为 **MVP 前端原型**：数据使用本地 Mock，未接入后端、云开发、微信登录与 AI 能力。

## 功能概览

| 模块 | 说明 |
|------|------|
| 首页 | 今日概览、待打卡、进行中 Flag、已暂停折叠区、新建 Flag |
| Flag 管理 | 创建 Flag、详情、全部列表（按状态筛选） |
| 阶段计划 | 为 Flag 添加阶段，设置目标、周期、打卡频率、奖惩 |
| 打卡 | 记录内容、图片、今日状态 |
| 统计 | 热力图、打卡数据、各 Flag 进度 |
| 我的 | 用户数据概览、Flag 列表入口 |

### Flag 状态

- **进行中**：正常打卡、可添加阶段
- **已暂停**：首页可恢复；详情页底部为「重启」
- **已完成 / 已放弃**：只读查看；统计页中已放弃 Flag 进度显示为 0%

## 技术栈

- [uni-app](https://uniapp.dcloud.net.cn/)（Vue 3）
- Vuex（`store/flag.js`）
- 目标平台：微信小程序（亦可编译 H5 / App）

## 目录结构

```text
FlagManager/
├── README.md                 # 项目说明
├── FlagManager/              # uni-app 工程根目录
│   ├── pages/                # 页面
│   │   ├── home/             # 首页
│   │   ├── stats/            # 统计
│   │   ├── mine/             # 我的
│   │   ├── flag/             # Flag 创建 / 详情 / 列表
│   │   ├── stage/            # 阶段创建 / 详情
│   │   └── checkin/          # 打卡
│   ├── components/           # fm-* 业务组件
│   ├── common/
│   │   ├── mock/             # Mock 数据
│   │   ├── styles/           # 主题样式
│   │   └── utils/            # 工具函数
│   ├── store/                # Vuex 状态
│   ├── static/               # 静态资源
│   ├── pages.json            # 路由与 TabBar
│   └── manifest.json         # 应用配置
└── .gitignore
```

## 本地运行

### 方式一：HBuilderX（推荐）

1. 安装 [HBuilderX](https://www.dcloud.io/hbuilderx.html)
2. 打开 `FlagManager/FlagManager` 目录
3. 菜单：**运行 → 运行到小程序模拟器 → 微信开发者工具**
4. 首次运行需安装并配置 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

### 方式二：CLI

若已配置 uni-app CLI 环境，可在 `FlagManager/` 目录下执行对应平台的 dev 命令，例如：

```bash
npm run dev:mp-weixin
```

> 本项目基于 hello-uniapp 模板改造，推荐使用 HBuilderX 导入运行。

### 微信开发者工具提示

- 开发阶段可勾选 **不校验合法域名**，以便 Mock 图片等资源加载
- TabBar 图标位于 `static/tabbar/`

## 主要页面路由

| 路径 | 说明 |
|------|------|
| `pages/home/home` | 首页（TabBar） |
| `pages/stats/stats` | 统计（TabBar） |
| `pages/mine/mine` | 我的（TabBar） |
| `pages/flag/create` | 新建 Flag |
| `pages/flag/detail` | Flag 详情 |
| `pages/flag/list` | 全部 Flag |
| `pages/stage/create` | 新建阶段 |
| `pages/stage/detail` | 阶段详情 |
| `pages/checkin/create` | 今日打卡 |

## MVP 范围与后续计划

**已实现**

- Flag / 阶段 / 打卡完整前端流程
- 热力图与基础统计
- Flag 多状态展示与筛选
- 打卡记录图片缩略图与全屏预览

**暂未实现**

- 微信登录与用户体系
- 云数据库与真实图片上传
- AI 打卡检测、阶段总结
- VIP、消息提醒等扩展能力

## 仓库说明

本仓库仅包含可运行的前端工程与 README。需求说明、低保真原型、前端设计文档等内部资料未纳入版本管理。

## License

MIT
