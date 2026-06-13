# FlagManager 前端设计文档

## 1. 文档目标

本文档基于 `FlagManager-低保真原型.md` 和当前 `FlagManager` uni-app 工程，说明 MVP 阶段前端需要创建或修改哪些文件，以及每个页面、组件、样式和数据模块的职责。

当前目标是先完成可运行的前端原型，数据以本地 mock 为主，暂不接入后端、云开发、AI 和 VIP。

## 2. 当前工程判断

当前 `FlagManager` 是 uni-app Vue3 工程。

已有关键文件：

- `App.vue`：全局应用入口。
- `main.js`：Vue3 创建入口。
- `pages.json`：页面路由、导航栏、TabBar 配置。
- `uni.scss`：全局 SCSS 变量。
- `store/`：已有状态管理目录。
- `static/`：静态资源目录。
- `uni_modules/`：uni-app 插件依赖目录。

当前工程仍保留大量 uni-app 示例页面。后续开发建议新建业务页面目录，不直接在示例页面上改。

## 3. 推荐目录结构

建议在 `FlagManager` 工程下新增以下业务结构：

```text
FlagManager/
├─ pages/
│  ├─ home/
│  │  └─ home.vue
│  ├─ stats/
│  │  └─ stats.vue
│  ├─ mine/
│  │  └─ mine.vue
│  ├─ flag/
│  │  ├─ create.vue
│  │  ├─ detail.vue
│  │  └─ list.vue
│  ├─ stage/
│  │  ├─ create.vue
│  │  └─ detail.vue
│  └─ checkin/
│     └─ create.vue
├─ components/
│  ├─ fm-section/
│  │  └─ fm-section.vue
│  ├─ fm-stat-card/
│  │  └─ fm-stat-card.vue
│  ├─ fm-flag-card/
│  │  └─ fm-flag-card.vue
│  ├─ fm-stage-card/
│  │  └─ fm-stage-card.vue
│  ├─ fm-checkin-card/
│  │  └─ fm-checkin-card.vue
│  ├─ fm-heatmap/
│  │  └─ fm-heatmap.vue
│  ├─ fm-progress-bar/
│  │  └─ fm-progress-bar.vue
│  └─ fm-empty/
│     └─ fm-empty.vue
├─ common/
│  ├─ mock/
│  │  └─ flag-data.js
│  ├─ styles/
│  │  └─ theme.scss
│  └─ utils/
│     ├─ date.js
│     └─ stats.js
├─ store/
│  └─ flag.js
├─ static/
│  └─ tabbar/
└─ pages.json
```

## 4. 页面文件设计

### 4.1 `pages/home/home.vue`

首页是用户进入小程序后的首屏，重点展示「当前需要推进的目标」，避免变成历史清单。

页面位置：

- 顶部：产品名标题（居中）。
- 中部：今日概览、今日待打卡。
- 下部：进行中的 Flag 列表。
- 下部：已暂停 Flag 折叠区（有数据时显示）。
- 底部：查看全部 Flag 入口、固定新建 Flag 按钮。

页面内容：

- `FlagManager` 标题。
- 连续打卡天数。
- 本月打卡次数。
- 今日待打卡卡片。
- 进行中的 Flag 卡片列表（完整样式，可进详情）。
- 已暂停 Flag 折叠区：标题显示数量，默认收起，展开后为弱化卡片 +「恢复」操作。
- `查看全部 Flag >` 文字入口。
- `[ + 新建 Flag ]` 固定底部按钮。

主要交互：

- 点击 `[ + 新建 Flag ]`，跳转到 `pages/flag/create`。
- 点击 Flag 卡片，跳转到 `pages/flag/detail?id=xxx`。
- 点击 `去打卡`，跳转到 `pages/checkin/create?flagId=xxx&stageId=xxx`。
- 点击已暂停区标题，展开/收起列表。
- 点击已暂停卡片上的「恢复」，将 Flag 状态改回 `active`。
- 点击 `查看全部 Flag`，跳转到 `pages/flag/list`。

展示规则：

- 首页只直接展示 `active` 和 `paused` 两类 Flag。
- `completed`、`abandoned` 不在首页展开，统一在全部 Flag 页查看。
- 已暂停卡片使用弱化样式，不显示「当前阶段」，不提供打卡入口。

建议组件：

- `fm-stat-card`
- `fm-section`
- `fm-flag-card`
- `fm-empty`

### 4.2 `pages/flag/create.vue`

新建 Flag 页用于创建长期目标。

页面位置：

- 顶部：系统导航栏标题 `新建 Flag`。
- 主体：表单。
- 底部：固定提交按钮。

表单字段：

- Flag 名称。
- Flag 描述。
- 分类。
- 开始日期。
- 目标完成日期。

交互规则：

- Flag 名称必填。
- 目标完成日期不能早于开始日期。
- 创建成功后跳转到 `pages/flag/detail?id=xxx`。
- MVP 阶段可使用 mock id。

建议组件：

- 可直接使用 uni-app 表单组件。
- 分类可先用自定义标签按钮实现。

### 4.3 `pages/flag/detail.vue`

Flag 详情页是长期目标的核心页面。

页面位置：

- 顶部：Flag 标题和更多按钮。
- 第一屏：目标说明、状态、时间、总进度。
- 中部：打卡热力图。
- 中部：阶段计划列表。
- 下部：最近打卡记录。
- 底部：固定打卡按钮。

页面内容：

- Flag 名称。
- Flag 描述。
- 状态。
- 时间范围。
- 总进度。
- 打卡热力图。
- 阶段计划列表。
- 最近打卡记录。

主要交互：

- 点击更多按钮，弹出编辑、暂停、完成、放弃操作。
- 点击阶段卡片，跳转到 `pages/stage/detail?id=xxx`。
- 点击添加阶段，跳转到 `pages/stage/create?flagId=xxx`。
- 点击打卡，跳转到 `pages/checkin/create?flagId=xxx`。

建议组件：

- `fm-progress-bar`
- `fm-heatmap`
- `fm-stage-card`
- `fm-checkin-card`
- `fm-section`

### 4.3.1 `pages/flag/list.vue`

全部 Flag 列表页，用于查看和管理所有状态的 Flag。

页面位置：

- 顶部：系统导航栏标题 `我的 Flag`。
- 顶部：状态筛选 Tab。
- 主体：Flag 卡片列表。

筛选 Tab：

- 全部
- 进行中
- 已暂停
- 已完成
- 已放弃

页面内容：

- 按当前 Tab 过滤后的 Flag 卡片列表。
- 空状态提示。

主要交互：

- 切换 Tab 刷新列表。
- 点击 Flag 卡片，跳转到 `pages/flag/detail?id=xxx`。
- 从首页 `查看全部 Flag` 或我的页 `我的 Flag` 进入。

卡片展示规则：

- 进行中：默认卡片样式，显示进度和当前阶段。
- 已暂停：弱化样式 + 状态标签「已暂停」。
- 已完成：归档样式 + 状态标签「已完成」，显示最终进度。
- 已放弃：归档样式 + 状态标签「已放弃」，仅保留标题、分类、时间范围。

建议组件：

- `fm-flag-card`
- `fm-empty`

入口：

- 首页底部 `查看全部 Flag`。
- 我的页 `我的 Flag` 菜单项。

### 4.4 `pages/stage/create.vue`

新建阶段页用于给某个 Flag 添加阶段计划。

页面位置：

- 顶部：系统导航栏标题 `新建阶段`。
- 主体：阶段表单。
- 底部：固定提交按钮。

表单字段：

- 所属 Flag。
- 阶段名称。
- 阶段目标。
- 阶段开始日期。
- 阶段结束日期。
- 打卡频率。
- 完成奖励。
- 未完成惩罚。

交互规则：

- 阶段名称必填。
- 阶段结束日期不能早于开始日期。
- 创建成功后返回 Flag 详情页。

建议组件：

- 日期选择器。
- 打卡频率标签组。
- 普通输入框和文本域。

### 4.5 `pages/stage/detail.vue`

阶段详情页展示某个阶段的执行情况。

页面位置：

- 顶部：阶段名称。
- 上部：阶段目标、时间、状态、阶段进度。
- 中部：奖惩信息。
- 中部：阶段统计。
- 下部：打卡记录列表。
- 底部：固定打卡按钮。

页面内容：

- 阶段目标。
- 时间范围。
- 状态。
- 阶段进度。
- 完成奖励。
- 未完成惩罚。
- 已打卡次数。
- 当前连续天数。
- 缺卡次数。
- 打卡记录列表。

主要交互：

- 点击打卡，跳转到 `pages/checkin/create?stageId=xxx`。
- 点击打卡记录，可后续扩展为查看详情。

建议组件：

- `fm-progress-bar`
- `fm-stat-card`
- `fm-checkin-card`
- `fm-section`

### 4.6 `pages/checkin/create.vue`

打卡页用于记录用户今日执行情况。

页面位置：

- 顶部：系统导航栏标题 `今日打卡`。
- 上部：当前 Flag 和阶段。
- 中部：打卡内容输入、图片上传、今日状态。
- 下部：AI 检测占位提示。
- 底部：固定提交按钮。

表单字段：

- Flag。
- 阶段。
- 打卡文字内容。
- 图片。
- 今日状态。

交互规则：

- 打卡文字内容必填。
- 图片 MVP 阶段可以先只做选择 UI，不做真实上传。
- AI 检测区域显示 `暂未开启，后续支持`。
- 提交成功后返回来源页。

建议组件：

- 状态标签组。
- 图片占位上传块。

### 4.7 `pages/stats/stats.vue`

统计页集中展示坚持情况。

页面位置：

- 顶部：标题 `统计`。
- 上部：Flag 筛选器。
- 中部：打卡热力图。
- 中部：数据概览。
- 下部：Flag 进度列表。

页面内容：

- 全部 Flag 或单个 Flag 筛选。
- 热力图。
- 累计打卡天数。
- 当前连续打卡天数。
- 最长连续打卡天数。
- 本月打卡次数。
- Flag 进度列表。

主要交互：

- 点击筛选器，切换统计范围。
- 点击热力图日期，弹出当天打卡记录。

建议组件：

- `fm-heatmap`
- `fm-stat-card`
- `fm-progress-bar`

### 4.8 `pages/mine/mine.vue`

我的页用于展示用户基础信息和低优先级入口。

页面位置：

- 顶部：用户头像、昵称、身份描述。
- 中部：我的数据。
- 下部：功能入口。

页面内容：

- 头像。
- 用户昵称。
- 用户描述。
- Flag 总数。
- 已完成 Flag 数。
- 累计打卡天数。
- 我的 Flag。
- AI 阶段总结，显示规划中。
- VIP 功能，显示规划中。
- 关于项目。

主要交互：

- AI 和 VIP 入口 MVP 阶段只展示规划中，不进入复杂页面。
- 点击「我的 Flag」，跳转到 `pages/flag/list`。

建议组件：

- `fm-stat-card`
- `fm-section`

## 5. 组件设计

### 5.1 `components/fm-section/fm-section.vue`

通用区块标题组件。

职责：

- 展示区块标题。
- 可选右侧操作按钮。

使用位置：

- 首页。
- Flag 详情页。
- 阶段详情页。
- 统计页。
- 我的页。

Props：

- `title`
- `actionText`

事件：

- `action`

### 5.2 `components/fm-stat-card/fm-stat-card.vue`

统计卡片组件。

职责：

- 展示一个或多个统计数字。

使用位置：

- 首页今日概览。
- 阶段详情统计。
- 统计页数据概览。
- 我的页数据。

Props：

- `items`

数据示例：

```js
[
  { label: '连续打卡', value: '12 天' },
  { label: '本月打卡', value: '18 次' }
]
```

### 5.3 `components/fm-flag-card/fm-flag-card.vue`

Flag 卡片组件。

职责：

- 展示 Flag 名称、分类、时间范围、进度。
- 根据 Flag 状态展示不同视觉样式和状态标签。
- 进行中状态可展示当前阶段。

使用位置：

- 首页进行中的 Flag。
- 首页已暂停 Flag（弱化样式）。
- 全部 Flag 列表页。

Props：

- `flag`：Flag 对象。
- `progress`：进度百分比。
- `currentStage`：当前阶段名称，可选。
- `variant`：卡片样式，`default` | `muted` | `archived`。
- `showStatus`：是否显示状态标签，默认 `false`。
- `showProgress`：是否显示进度条，默认 `true`。

样式说明：

- `default`：白底卡片，用于进行中 Flag。
- `muted`：弱化背景，用于已暂停 Flag。
- `archived`：更低对比度，用于已完成/已放弃 Flag。

事件：

- `click`

### 5.4 `components/fm-stage-card/fm-stage-card.vue`

阶段卡片组件。

职责：

- 展示阶段名称、状态、进度、奖励。

使用位置：

- Flag 详情页阶段计划列表。

Props：

- `stage`

事件：

- `click`

### 5.5 `components/fm-checkin-card/fm-checkin-card.vue`

打卡记录卡片组件。

职责：

- 展示打卡日期、内容摘要、状态。

使用位置：

- Flag 详情页最近打卡。
- 阶段详情页打卡记录。

Props：

- `checkin`

### 5.6 `components/fm-heatmap/fm-heatmap.vue`

打卡热力图组件。

职责：

- 以 GitHub Contributions 风格展示打卡情况。
- 支持不同颜色深浅。
- 支持点击某一天。

使用位置：

- Flag 详情页。
- 统计页。

Props：

- `days`
- `mode`

事件：

- `dayClick`

数据示例：

```js
[
  { date: '2026-06-01', count: 0 },
  { date: '2026-06-02', count: 1 },
  { date: '2026-06-03', count: 2 }
]
```

### 5.7 `components/fm-progress-bar/fm-progress-bar.vue`

进度条组件。

职责：

- 展示 Flag 或阶段完成比例。

Props：

- `percent`
- `label`

### 5.8 `components/fm-empty/fm-empty.vue`

空状态组件。

职责：

- 无 Flag、无阶段、无打卡记录时显示引导文案。

Props：

- `text`
- `buttonText`

事件：

- `action`

## 6. 配置文件设计

### 6.1 `pages.json`

需要将当前示例工程路由替换为业务路由。

建议 pages：

```json
[
  {
    "path": "pages/home/home",
    "style": {
      "navigationStyle": "custom"
    }
  },
  {
    "path": "pages/stats/stats",
    "style": {
      "navigationBarTitleText": "统计"
    }
  },
  {
    "path": "pages/mine/mine",
    "style": {
      "navigationBarTitleText": "我的"
    }
  },
  {
    "path": "pages/flag/create",
    "style": {
      "navigationBarTitleText": "新建 Flag"
    }
  },
  {
    "path": "pages/flag/detail",
    "style": {
      "navigationBarTitleText": "Flag 详情"
    }
  },
  {
    "path": "pages/flag/list",
    "style": {
      "navigationBarTitleText": "我的 Flag"
    }
  },
  {
    "path": "pages/stage/create",
    "style": {
      "navigationBarTitleText": "新建阶段"
    }
  },
  {
    "path": "pages/stage/detail",
    "style": {
      "navigationBarTitleText": "阶段详情"
    }
  },
  {
    "path": "pages/checkin/create",
    "style": {
      "navigationBarTitleText": "今日打卡"
    }
  }
]
```

建议 TabBar：

```json
{
  "color": "#8A8F98",
  "selectedColor": "#1F8A5B",
  "backgroundColor": "#FFFFFF",
  "borderStyle": "black",
  "list": [
    {
      "pagePath": "pages/home/home",
      "text": "首页"
    },
    {
      "pagePath": "pages/stats/stats",
      "text": "统计"
    },
    {
      "pagePath": "pages/mine/mine",
      "text": "我的"
    }
  ]
}
```

MVP 阶段如果暂时没有图标，可以先不配置 `iconPath`，或后续补充 `static/tabbar/` 图标。

### 6.2 `App.vue`

建议保留生命周期逻辑，但清理 hello uni-app 示例样式。

应包含：

- 全局背景色。
- 页面默认字体。
- 通用布局样式。

不建议继续保留：

- 示例页面专用样式。
- 示例日志。
- 与当前小程序无关的升级、一键登录逻辑。

### 6.3 `uni.scss`

建议改为 FlagManager 主题变量。

建议变量：

```scss
$fm-color-primary: #1f8a5b;
$fm-color-primary-light: #e9f7ef;
$fm-color-warning: #f5a623;
$fm-color-danger: #d9534f;
$fm-color-text: #1f2933;
$fm-color-text-secondary: #6b7280;
$fm-color-bg: #f6f7f5;
$fm-color-card: #ffffff;
$fm-color-border: #e5e7eb;

$fm-radius-card: 24rpx;
$fm-radius-button: 999rpx;
$fm-page-padding: 32rpx;
```

## 7. 数据与状态设计

### 7.1 `common/mock/flag-data.js`

MVP 原型阶段先使用 mock 数据。

应包含：

- 用户信息。
- Flag 列表。
- 阶段列表。
- 打卡记录。
- 热力图数据。

导出内容：

```js
export const mockUser = {}
export const mockFlags = []
export const mockStages = []
export const mockCheckins = []
```

### 7.2 `store/flag.js`

用于管理 Flag 相关状态。

状态：

- `flags`
- `stages`
- `checkins`
- `currentFlagId`

方法：

- `getFlagById`
- `getStagesByFlagId`
- `getCheckinsByFlagId`
- `createFlag`
- `createStage`
- `createCheckin`

MVP 阶段可只在内存中维护，不做持久化。后续再替换为云数据库。

### 7.3 `common/utils/date.js`

日期工具。

应包含：

- 格式化日期。
- 判断是否今天。
- 获取月份范围。
- 计算两个日期间隔。

### 7.4 `common/utils/stats.js`

统计工具。

应包含：

- 累计打卡天数。
- 当前连续打卡天数。
- 最长连续打卡天数。
- 本月打卡次数。
- 阶段进度。
- Flag 总进度。
- 热力图数据生成。

## 8. 样式布局规范

### 8.1 整体风格

建议风格：清爽、克制、有成长感。

关键词：

- 长期坚持。
- 记录感。
- 阶段推进。
- 轻量但不随意。

建议主色：

- 主色：绿色 `#1F8A5B`，表达成长和兑现。
- 背景：浅灰绿 `#F6F7F5`。
- 卡片：白色。
- 强调色：橙色 `#F5A623`，用于奖励和提醒。

### 8.2 页面间距

建议：

- 页面左右 padding：`32rpx`。
- 卡片内边距：`28rpx`。
- 区块上下间距：`32rpx`。
- 卡片圆角：`24rpx`。

### 8.3 首页布局

首页应突出新建和继续打卡，历史 Flag 不抢占首屏。

布局顺序：

1. 自定义头部（居中标题）。
2. 今日概览。
3. 今日待打卡。
4. 进行中的 Flag。
5. 已暂停 Flag（折叠区，有数据时显示）。
6. 查看全部 Flag 入口。
7. 底部固定新建 Flag 按钮。

### 8.3.1 全部 Flag 页布局

1. 状态筛选 Tab（横向滚动）。
2. Flag 卡片列表。
3. 空状态。

### 8.4 详情页布局

详情页应突出目标进展。

布局顺序：

1. 目标信息卡片。
2. 进度条。
3. 热力图。
4. 阶段计划。
5. 最近打卡。
6. 底部固定打卡按钮。

### 8.5 表单页布局

表单页应简洁。

布局规则：

- 一个字段一行。
- 输入框高度不宜太矮。
- 分类和状态使用标签按钮。
- 提交按钮固定在底部。

## 9. 页面导航设计

### 9.1 TabBar 页面

- `pages/home/home`
- `pages/stats/stats`
- `pages/mine/mine`

TabBar 只保留主要浏览入口。

### 9.2 非 TabBar 页面

- `pages/flag/create`
- `pages/flag/detail`
- `pages/flag/list`
- `pages/stage/create`
- `pages/stage/detail`
- `pages/checkin/create`

这些页面通过 `uni.navigateTo` 进入。

### 9.3 推荐跳转方法

```js
uni.navigateTo({
  url: '/pages/flag/detail?id=' + flag.id
})
```

TabBar 切换使用：

```js
uni.switchTab({
  url: '/pages/stats/stats'
})
```

## 10. 开发顺序

建议按以下顺序开发：

1. 清理并重写 `pages.json`。
2. 新建 `common/mock/flag-data.js`。
3. 新建首页、统计页、我的页。
4. 新建通用组件：`fm-section`、`fm-stat-card`、`fm-progress-bar`。
5. 新建业务组件：`fm-flag-card`、`fm-stage-card`、`fm-checkin-card`。
6. 新建 `fm-heatmap`。
7. 新建 Flag 创建页、详情页和全部 Flag 列表页。
8. 新建阶段创建页和详情页。
9. 新建打卡页。
10. 补充空状态、表单校验和页面跳转。

## 11. MVP 验收标准

完成后应满足：

- 打开小程序进入首页。
- 首页能看到今日概览、今日待打卡和进行中的 Flag。
- 有已暂停 Flag 时，首页可展开查看并恢复。
- 首页可进入全部 Flag 列表页。
- 全部 Flag 页可按状态筛选查看已完成、已放弃等 Flag。
- 可以点击新增入口进入新建 Flag 页。
- 可以进入 Flag 详情页。
- 可以添加阶段计划。
- 可以进入阶段详情页。
- 可以提交一条打卡记录。
- 可以在统计页看到热力图和统计数据。
- 我的页能展示基础用户数据。

## 12. 暂不处理内容

以下内容不进入第一版前端实现：

- AI 打卡检测真实逻辑。
- AI 阶段总结报告。
- VIP 支付和会员体系。
- 真实图片上传。
- 云数据库。
- 登录授权完整流程。
- 社交、好友监督、排行榜。

这些能力应在 MVP 页面跑通后再设计。
