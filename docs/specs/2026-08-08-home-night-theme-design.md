# 首页夜间主题落地设计

- 日期：2026-08-08
- 范围：`blog-ui-vue3` 首页（`app/src/views/home/index.vue`）
- 设计来源：claude.ai/design 项目 `b5a3fdf1-7256-4388-916d-00d52002a324` 的 `夜晚模板.dc.html`
- 核心约束：**不影响当前（昼间）页面，不影响首页以外的任何页面**

## 1. 背景与现状核对

设计稿共 6 屏（首页 / 登录页 / 工作台 / 后台框架+列表 / 编辑弹窗 / Token 对照表），定义了 37 个 `--ai-*` token 的昼夜两套值。本次**只落地第 1 屏（首页）**，其余 5 屏不做。

核对 `blog-ui-vue3` 现状后确认三件事：

### 1.1 设计稿自带的「接入方式 A · 业务页零改动」不成立

该方式假设页面颜色都走 `--ai-*` token，加一个 `html[data-mode="night"]` 覆盖块即可全站切夜间。实测：

| 目录 | 颜色字面值 | `var(--ai-*)` |
|---|---|---|
| `views/home` | 298 | 0 |
| `views/login` | 160 | 0 |
| `views/dashboard` | 485 | 125 |

只加覆盖块的实际结果是半夜半昼的花脸。这与 `lessons.md`（2026-05-28 / 2026-06-10）记录的「scoped style 尚有约 1900 处颜色字面值未 token 化」一致。

### 1.2 设计稿自带的「接入方式 B · 恢复 ThemeMode.DARK」风险过大，不采用

`app/src/utils/theme.ts` 中暗色是被**刻意写死禁用**的：`resolveThemeMode()` 恒返回 `ThemeMode.LIGHT`，`syncThemeClass()` 强制 `classList.remove("dark")`。解开等于同时放开 Element Plus 全站暗色，直接违反本次约束。本设计**不修改 `theme.ts`**。

### 1.3 首页夜间态已存在，本次是「补完」而非「从零建」

`views/home/index.vue` 已有按小时的四段时域（`updateClock()`，`index.vue:588-596`）：

| 时段 | 小时区间 |
|---|---|
| morning | 05–08 |
| afternoon | 08–17 |
| sunset | 17–19 |
| night | 19–05 |

且已有 `.home-page--night` 覆盖块（`index.vue:753-845`，约 93 行），其天空渐变 `linear-gradient(180deg, #151e3f 0%, #213352 60%, #1e2836 100%)` 与设计稿 `--ai-sky` 的夜间值**完全一致**——设计稿即从首页现有夜间态派生。

**时段阈值保持现状不改。** 设计稿正文写的是「18:00–06:00 走夜间」，与现有 19–05 冲突；改阈值会缩短 sunset 段，属于改变现有行为，不在本次范围内。

### 1.4 设计稿的一半动效，首页已有对应实现

| 设计稿动效 | 首页现状 | 处理 |
|---|---|---|
| `twinkle` 星闪 ×7 | 已有 `.star--1..6` + `@keyframes ac-star-blink`，已是 `v-if="currentTimePeriod === 'night'"` 仅夜间渲染（`index.vue:6-13`, `856-880`） | 复用，不动 |
| `drift` 云飘 ×2 | 已有 `.cloud-1/2/3` + `ac-cloud-float`（50–60s 横穿全屏，全时段显示） | 复用，仅夜间调色 |
| 双层山丘 | 已有 `.grass-hills > .grass-hill--back/--front`（`index.vue:37-40`, `949-980`），且自带 `ac-hill-wave` 起伏动画 | 复用，仅夜间换色 |
| `moonrise` | 无 | 新增 |
| `firefly` ×4 | 无 | 新增 |
| `lamp` | 无 | 新增 |
| `shoot` | 无 | 新增 |

若照搬设计稿会做出双份云和双份星星。因此 `drift` / `twinkle` 落地为「夜间调色」，不新增动画。

## 2. 方案选型

| 方案 | 做法 | 取舍 | 结论 |
|---|---|---|---|
| A · `data-mode` 挂 `html` | 设计稿原推荐 | 首页试点阶段会让未 token 化的后台页变花脸，风险最大 | 否决 |
| B · `data-mode` 挂首页根元素 | 新增一层机制，作用域锁在首页 | 与已有 `currentTimePeriod` 语义重叠，属于为未来铺路的多余抽象 | 否决（决策原则 4：不过度设计） |
| **C · 复用现有 `.home-page--night`** | 夜间 token 写进首页已有的覆盖块 | 不新增任何机制、不碰 `theme.ts`；作用域由 CSS 物理锁死在首页子树 | **采用** |

同理，token 化策略取「只抽夜间真正要变的语义槽」，不做首页 298 处字面值的全量替换——与 `lessons.md` 2026-06-10 确立的「不开盲扫，改到哪页顺手换」渐进策略一致。

## 3. Token 层设计

昼间值在 `.home-page` 定义，**取值等于当前硬编码值**，因此该步骤是纯重构，昼间像素级不变。夜间值在 `.home-page--night` 覆盖。

### 3.1 复用全局 `--ai-*` 名（首页内局部覆盖，不动 `:root`）

`--ai-text` `--ai-text-2` `--ai-border` `--ai-bg-card` `--ai-shadow-color` `--ai-outline` `--ai-btn-face` `--ai-btn-shadow`

夜间取值来自设计稿 `[data-mode="night"]` 块，例如 `--ai-text: #fffdec`、`--ai-bg-card: #1c274c`、`--ai-outline: #0f1731`、`--ai-btn-face: #223058`、`--ai-btn-shadow: #0a1024`。

在 `.home-page` 上定义这些名字只影响该子树（CSS 变量继承特性），`_system-management.scss` 的全局 `:root` 一个字不改。

### 3.2 首页专有槽，用 `--home-` 前缀

| Token | 昼间值（= 现状） | 夜间值 | 用途 |
|---|---|---|---|
| `--home-hill-back` | `#6fba2c` | `#24406b` | 后层山丘色 |
| `--home-hill-back-op` | `0.45` | `1` | 后层山丘透明度 |
| `--home-hill-front` | `#8ac68a` | `#1a3054` | 前层山丘色 |
| `--home-hill-front-op` | `0.65` | `1` | 前层山丘透明度 |
| `--home-cloud-fill` | `#fff` | `rgba(200,210,240,.35)` | 云朵填充 |
| `--home-particle-op` | `1` | `0.35` | 飘落 🍃🌸 粒子透明度 |

两个透明度单独成槽的原因：山丘昼间靠 `opacity` 压淡饱和绿（`.45` / `.65`），夜间的 `#24406b` / `#1a3054` 本就是暗色，再压 `.45` 会糊成一片，须在夜间提到 `1`。

`--home-cloud-fill` 需配套改造：云的 `fill="#fff"` 现写在 SVG 属性上（`index.vue:17-25`），属性无法被 CSS 变量驱动，须改为 CSS `fill: var(--home-cloud-fill)`。

**天空底色不设 token。** 四个时段各自的 `background` / `.sky` radial 已经分别写在 `.home-page--morning/afternoon/sunset/night` 四个块里（`index.vue:726-760`），每个值只出现一次。再包一层 `--home-sky` 变量是纯粹的间接层，不增加任何能力——夜间天空沿用 `.home-page--night` 现有的那条渐变即可（其值已与设计稿 `--ai-sky` 一致）。

### 3.3 推翻设计稿的 `--ai-scene-op`

设计稿让夜景层常驻 DOM、用 `opacity: var(--ai-scene-op)`（昼 0 / 夜 1）显隐。该做法下昼间 4 只萤火虫和流星的动画仍在空跑。

首页现有 `starry-night-stars` 走的是 `v-if="currentTimePeriod === 'night'"`。新增夜景元素**统一沿用 `v-if`**：昼间零 DOM、零动画、零合成层。不引入 `--ai-scene-op`。

## 4. 动效层设计

新增 4 个动效，实施时用 `animate` skill 决定曲线与时长。

| 动效 | 类型 | 说明 |
|---|---|---|
| `moonrise` | 一次性 | 月亮自下升入，带月坑与暖黄光晕；进入夜间时播一次，无持续开销 |
| `firefly` ×4 | 循环 | 山丘前暖黄光点缓慢游走 |
| `lamp` | 循环 | 呼吸式明暗，挂在 `.ac-passport`（岛民护照）上 |
| `shoot` | 循环 | 流星划过 |

### 4.1 硬约束

1. **只用 `transform` 与 `opacity`**，不使用会触发 layout 的属性。
2. **必须新增 `@media (prefers-reduced-motion: reduce)` 块**：首页现无此处理，全站仅 `FeedbackHost.vue`、`WeatherAvatarFrame.vue` 两处有。加入 4 个新循环动画后缺此块即构成无障碍缺陷。reduce 时停掉 `firefly` / `shoot`，`moonrise` 直接落到终态。
3. **新增类名一律加 `night-` 前缀**，规避 `lessons.md` 2026-06-09 记录的 UnoCSS 工具类撞名坑（`ring` / `shadow` / `border` 等）。

### 4.2 对设计稿的调参

`shoot` 在设计稿中为 7s 周期，用 `0% → 8% → 26% → 100%` 把 74% 的时间停在终点透明来制造间隔。7s 过于频繁，会从「偶遇」退化为节拍器。落地时拉长到 18–25s。

## 5. 实施顺序

四步，每步可独立验证、可独立回退：

1. **Token 层 + 昼间等值替换** —— 纯重构，昼间行为不变
2. **`.home-page--night` 补 token 覆盖** —— 夜间整体变深，暂无新元素
3. **加夜景 DOM + 4 个动效**（`animate` skill）
4. **`prefers-reduced-motion` 兜底**

## 6. 验收标准

| # | 标准 | 验证方式 |
|---|---|---|
| 1 | 昼间三态（morning / afternoon / sunset）像素级不变 | 改动前后截图对比 |
| 2 | 首页以外页面零改动 | `git diff --stat` 只应出现 `views/home/index.vue` 与本文档 |
| 3 | 全局 `:root` 与 `theme.ts` 未被修改 | `git diff` 检查 `_system-management.scss`、`utils/theme.ts` 无变更 |
| 4 | 夜间态四个新动效正常，无双份云 / 双份星星 | 首页实跑（时段置为 night） |
| 5 | `prefers-reduced-motion: reduce` 下循环动画停止 | 浏览器模拟该媒体特性 |
| 6 | `pnpm type-check` 与 `pnpm build-only` 通过 | 命令输出 |

### 关于验证的两条既有约定

- `lessons.md` 2026-07-29：**构建通过 ≠ 页面能跑**。改了 `<script setup>` 顶层声明顺序的必须实跑页面。本次主要改样式，但新增夜景元素涉及 template 与 setup，仍须实跑首页。
- `lessons.md` 2026-05-28：浏览器页面验证（含本地/远端测试地址）**须先征得用户确认**。默认只做 type-check / build-only 级验证。

## 7. 明确不做

- 首页 DOM 结构与 section 顺序调整。设计稿首页那一屏是简化 mock（nav + hero 双栏 + 4 卡片），真实首页为 2353 行完整落地页。按 `lessons.md` 2026-05-06「首页视觉调整时保持原有 section 顺序，优先替换内容和图片」，本次只做配色与氛围动效。
- 设计稿其余 5 屏（登录页 / 工作台 / 后台框架+列表 / 编辑弹窗 / Token 对照表）。
- 修改 `utils/theme.ts`、恢复 `ThemeMode.DARK`、引入 `data-mode` 属性。
- 修改 `_system-management.scss` 的全局 `:root`。
- 调整时段阈值（保持 night = 19–05）。
- 首页 298 处颜色字面值的全量 token 化（只抽夜间需要变的约 14 个语义槽）。
