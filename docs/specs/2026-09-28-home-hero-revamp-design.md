# 首页 hero 与模块区改版设计

- 日期：2026-09-28
- 范围：`blog-ui-vue3` 首页（`app/src/views/home/`），基于首页拆分后的结构（`docs/specs/2026-09-28-home-split-design.md`，已合并）
- 所属系列：首页改造四个子项目中的第二个，顺序为 A 拆分（已完成）→ C hero 与模块区改版（本文）→ D 3D 小岛导览 → B 全局深色模式
- 效果图：`A · 木牌招牌` 方案（brainstorm 效果图 `hero-directions-v3.html`，用户选定）

## 1. 目标

- **减少代码量**：模块区从 12 个装饰性入口减到 4 个；删除 KPI 统计条；头像区两套 SVG 装饰换成统一徽章。
- **让首页真正有用**：保留的入口直达真实功能页（现状 12 个里 10 个都只跳 `/dashboard`）。
- **增强 hero 动效**：标题做成会摆动的木牌，头像四周的 KPI 挂件浮动。

## 2. 已确认的决定

| 项 | 结论 |
|---|---|
| 模块入口 | 保留 4 个开发工具入口，直达真实页面 |
| hero 方向 | A · 木牌招牌 |
| 未登录 hero | 只把标题换成木牌，柜台、豆狸气泡、机票不动 |
| 标题文案 | 「博客 / 小岛」，**去掉末尾句号** |
| KPI 条 | 整条删除，4 个数字并入头像区徽章 |
| KPI 徽章图标 | 用 emoji（🎈🦴📝⏰），与名牌上的 🌿 同一做法 |
| 数据失败兜底 | 现有静态兜底数字不在本次范围，保持原样 |

4 个入口的真实路径取自后端菜单表（2026-09-28 远端只读查询）：

| 入口 | 路径 |
|---|---|
| 工作日常 | `/develop/work-daily` |
| 工作文档 | `/develop/work-doc` |
| 路径转换 | `/develop/convert-path` |
| 平台脚本 | `/develop/platform-script` |

## 3. 视觉与交互

### 3.1 木牌标题（`HeroSign`，两个 hero 共用）

- 「博客 / 小岛」两行字放在一块木牌上，木牌由上方两根绳子挂着。
- 以绳子顶端为轴摆动：±2.2°，周期 3.6s，`ease-in-out` 无限循环。
- 进场时 4 个字依次从上方弹入，间隔 80ms，带回弹（`cubic-bezier(.34, 1.56, .64, 1)`，时长 0.7s）；鼠标移到木牌上时重放一次。
- 木牌内标题字号 `clamp(52px, 7vw, 88px)`（原标题最大 120px，放进木牌后过宽会挤压头像），保留原标题的奶油色字与棕色立体描边阴影。
- 木牌颜色走首页 token，与现有昼夜 token 同处 `index.vue` 根上：`--home-sign-wood-top`、`--home-sign-wood-bottom`、`--home-sign-wood-shadow`；`.home-page--night` 覆盖为深木色，标题字色不变。

### 3.2 头像区（已登录，`HeroAvatar`）

- 删除红气球（字数）与化石（连续天数）两套装饰及其样式。
- 头像四角各挂一个徽章，样式统一：奶油底、棕色 2px 描边、圆角、底部 3px 投影；图标 + 数字 + 小字说明。

| 位置 | 图标 | 数字 | 说明 |
|---|---|---|---|
| 左上 | 🎈 | 本年字数 | 本年字数 |
| 右上 | 🦴 | 最长连续天数 | 最长连续 |
| 左下 | 📝 | 累计日志 | 累计日志 |
| 右下 | ⏰ | 高产时段 | 高产时段 |

- 每个徽章独立浮动：上下 10px、左右摆 ±3°，周期 2.6–3.2s 且起始延迟错开，避免齐步。
- 两片叶子装饰与底部名牌（`🌿 昵称 · 岛民岛主`）保留。
- 徽章不得遮挡标题与按钮（首页视觉规范）。

### 3.3 按钮（已登录，`HeroIsland`）

- 主按钮「进入工作台」不变。
- 新增次按钮「✏️ 写今天的日常」，跳 `/develop/work-daily`，沿用现有 `btn-ai` 次级样式（非 primary）。

### 3.4 模块区（`HomeModules`）

- 卡片样式不变，只保留 4 张；桌面一行 4 张，900px 以下一行 2 张。
- 已登录：点击跳入口的 `path`；未登录：跳 `/login`（与现状一致）。
- 标题组文案按登录状态切换，沿用现有两套（「我的背包格子」/「小岛推荐指南」）。

| key | 标题 | 副标题 | 角标 | 颜色 | 图标 |
|---|---|---|---|---|---|
| `daily` | 工作日常 | 日报 · 周报 · 月报 | DAILY | pink | 沿用现有 daily 图标 |
| `docs` | 工作文档 | 项目资料沉淀 | DOCS | yellow | 沿用现有 docs 图标 |
| `route` | 路径转换 | 网址与服务器地址 | ROUTE | teal | 沿用现有 route 图标 |
| `script` | 平台脚本 | 平台自动化脚本 | SCRIPT | orange | 代码图标 `M16 18l6-6-6-6M8 6l-6 6 6 6` |

### 3.5 减少动态效果、手机尺寸、星夜

- `prefers-reduced-motion: reduce` 时：木牌不摆、字不弹、徽章不浮，全部静态显示。
- 手机尺寸：徽章位置随头像尺寸收缩；已登录、375 宽度下页面不得出现横向滚动。现状 `main` 已登录手机有横向溢出（实测布局宽度 406）：先定位来源，**来源在头像区则本次修复；在别处则只报告，不扩大改动范围**。
- 星夜：徽章、木牌、新按钮接入现有夜间 token，与导航、卡片的夜间风格一致。

## 4. 工程实现

| 文件 | 改动 |
|---|---|
| `components/HeroSign.vue` | 新建。木牌 + 绳子 + 摆动 + 逐字弹入，纯 CSS 动画。`.hero-title`、`.hero-title-row` 样式从 `_hero.scss` 迁入 |
| `components/HeroIsland.vue` | 标题块换 `<HeroSign />`；加「写今天的日常」按钮；props `statWords` / `statStreak` 改为 `stats` |
| `components/HeroCounter.vue` | 标题块换 `<HeroSign />`，其余不动 |
| `components/HeroAvatar.vue` | 删气球、化石装饰（模板与约 100 行样式），换 4 个徽章；props 改为 `stats` |
| `components/HomeKpiStrip.vue` | 删除 |
| `home-stats.ts` | 新建。导出 `HomeStats` 接口（4 个已格式化的字符串），供 `index.vue`、`HeroIsland`、`HeroAvatar` 共用 |
| `home-modules.ts` | 只导出一份 4 项清单 `homeModules`，`HomeModule` 增加 `path` 字段；删 `modules` / `unauthModules` |
| `components/HomeModules.vue` | 遍历 `homeModules`；`emit('select', mod)` 交出整个入口；删除不再使用的 8 种 `.pocket-slot--*` 颜色规则 |
| `index.vue` | 删 `HomeKpiStrip`；`stats` 传给 `HeroIsland`；`handleModuleClick(mod)`：未登录 `/login`，已登录 `router.push(mod.path)`；根上新增木牌昼夜 token |
| `styles/_hero.scss` | 移出 `.hero-title`、`.hero-title-row` |

- `stats` 类型：`{ words: string; logs: string; streak: string; peak: string }`，沿用拆分时 `index.vue` 的计算结果，即 `home-stats.ts` 的 `HomeStats`。
- 鼠标移上重放弹入：用两个内容相同、名字不同的 `@keyframes` 切换 `animation-name` 触发重播。
- 动效幅度按 lessons l08 与元素尺寸相称：木牌约 300px 宽摆 ±2.2°（边缘位移约 11px），徽章约 90px 宽浮动 10px。

## 5. 验证

| 检查 | 做法 |
|---|---|
| 类型与构建 | `pnpm run type-check`、`pnpm run build-only` |
| 代码风格 | 新写与改动的代码过 `pnpm eslint <文件>`，不引入新的格式问题 |
| 画面 | 远端 8083 截图供复核：已登录白天 / 星夜桌面、已登录手机 375、未登录桌面 |
| 手机溢出 | 已登录 375 宽：`document.documentElement.scrollWidth === 375` |
| 跳转 | 已登录点 4 个入口分别到对应路径；「写今天的日常」到 `/develop/work-daily`；未登录点入口到 `/login` |
| 动效 | 按 lessons l09 不以肉眼时序判定：读木牌、4 个字、4 个徽章的 `animation-name` 与 `animation-duration` 计算值 |
| 减少动态效果 | 浏览器无法模拟，代码核对 `prefers-reduced-motion` 块覆盖全部新动效 |

打开浏览器验证、登录登出前先征得用户同意，登录登出由用户操作。

## 6. 交付

- 仓库：`blog-ui-vue3`
- 分支：`feature/home-hero-revamp`（从 `ed66ecd` 切出），含 `.gitignore` 忽略 `.superpowers/` 的一行改动
- 一个 PR，走默认交付流程：中文 PR → 看 CI 结论 → 本地合并 `main` → 远端同步
