# 首页拆分与视频背景组件化设计

- 日期：2026-09-28
- 范围：`blog-ui-vue3` 首页（`app/src/views/home/index.vue`）
- 核心约束：**等值重构**。不改视觉、不改交互、不改 section 顺序，重构前后每个元素的计算样式一致
- 所属系列：首页改造四个子项目中的第一个，顺序为 A 拆分（本文）→ C hero 与模块区改版 → D 3D 小岛导览 → B 全局深色模式

## 1. 背景

`views/home/index.vue` 共 3064 行，单文件难以维护，后续 C、D 两个子项目都要在首页上继续加东西。本次先把它按 section 拆成页面私有组件，并把滚动擦洗视频背景提到公共层，供以后其他页面复用。

## 2. 现状核对

| 部分 | 行号 | 行数 | 内容 |
|---|---|---|---|
| template | 1–594 | 约 595 | 天空层、导航、两套 hero、KPI 条、模块格子、岛民证 / 告示板、帐篷区、页脚 |
| script | 596–894 | 约 300 | 时段计算、滚动擦洗视频、KPI 请求、称号与水果生成、模块数据、跳转 |
| style | 896–3064 | 约 2170 | 13 个分块（见下） |

样式分块（按 `// ====` 注释）：天空时段 236、夜景层 290、草坡 48、导航 306、按钮 96、hero 217、KPI 条 57、背包格子 178、岛民证 182、帐篷与页脚 68、响应式 39、未登录柜台 258、告示板 137。

决定拆法的三个事实：

1. **昼夜 token 挂在根节点**：`.home-page` 定义昼间值，`.home-page--night` 覆盖夜间值，全页约 120 处样式引用。CSS 变量沿 DOM 继承，拆成子组件后这部分不用改。
2. **21 条夜间逐元素规则**嵌在 `.home-page--night { ... }` 里（`.sky`、`.nav`、`.section-title`、`.stat`、`.pocket-slot`、`.ac-passport__header`、`.island-inner`、`.foot` 等）。父组件的 scoped 样式够不到子组件内部，这些规则必须随元素迁入子组件。
3. **视频接管时的隐藏规则** `.home-page--video { .cloud, .grass-hills, .falling-particles, .starry-night-stars, .night-scene { display: none } }` 作用于天空层内部元素。

另有两处重复与死代码，本次一并清理（见第 7 节）。

## 3. 目标结构

```
src/
├── components/ScrubVideoBackground/index.vue   ← 新增，公共：按目标时间擦洗视频
└── composables/useScrollProgress.ts            ← 新增，公共：滚动进度 0~1

src/views/home/
├── index.vue              ← 页面根：昼夜 token、各组件排列、调用 useDayCycle、KPI 请求
├── day-cycle.ts           ← useDayCycle()：时钟、昼夜开关、时段推导、视频目标时间
├── home-modules.ts        ← modules / unauthModules 数据
├── scroll-to-section.ts   ← 锚点平滑滚动 + 导航高亮（HomeNav 与 HeroCounter 共用）
├── styles/
│   ├── _shared.scss       ← .section / .section-head 标题组、.btn-ai 按钮
│   └── _hero.scss         ← 两套 hero 共用的布局（.hero / .hero-grid / .hero-title / .hero-sub / .hero-tag / .hero-actions）
└── components/
    ├── HomeSky.vue        ← 天空层：视频背景、星星、夜景、云、飘落粒子、草坡
    ├── HomeNav.vue        ← 导航、时钟、昼夜开关、锚点跳转
    ├── HeroIsland.vue     ← 已登录 hero（文字区 + 按钮）
    ├── HeroAvatar.vue     ← 已登录 hero 的头像区（头像、名牌、气球、化石徽章、叶子装饰）
    ├── HeroCounter.vue    ← 未登录 hero（移居柜台）
    ├── HomeKpiStrip.vue   ← 已登录 KPI 条
    ├── HomeModules.vue    ← 模块格子
    ├── IslandPassport.vue ← 已登录岛民证
    ├── BulletinBoard.vue  ← 未登录告示板
    └── HomeCampFooter.vue ← 帐篷小山丘 + 页脚
```

目录位置依据：`styles/`、`day-cycle.ts` 只有首页用，按 `frontend-conventions.md`「业务目录不放公共层、页面私有放页面目录」处理，有 `views/pomo/styles`、`views/pomo/deer.ts` 先例。视频背景和滚动进度是明确要跨页面复用的，放公共层。

预估：`index.vue` 约 350 行（大头是昼夜 token 定义，全页共享，应当留在根上），各子组件 100–500 行。

## 4. 公共层

### 4.1 `useScrollProgress(target?)`

```ts
export function useScrollProgress(target?: Ref<HTMLElement | null>): Ref<number>
```

- 不传 `target`：按文档滚动计算 `scrollY / (scrollHeight - innerHeight)`，钳到 0~1。这是首页现有 `onScroll` 的原样搬迁。
- 传 `target`：按该元素的 `scrollTop / (scrollHeight - clientHeight)` 计算。后台布局在内部容器里滚动，不走文档滚动，以后接入后台页面时用这个参数。
- 监听 `scroll` 与 `resize`（`passive`），在 `onMounted` 挂、`onUnmounted` 卸。
- 与现状的差别：现状只在视频启用时才监听滚动；搬迁后始终监听。视频未启用时时段不读滚动进度，所以没有可见差别；但 `time` 仍会随滚动变化，因此 `ScrubVideoBackground` 的擦洗循环在没有 `<video>` 时必须直接停下，不能逐帧重排（否则窄屏 / 触屏 / 减少动态效果设备上会 rAF 空转）。

### 4.2 `ScrubVideoBackground`

```vue
<ScrubVideoBackground v-model:active="videoActive" :src="..." :poster="..." :time="targetTime" />
```

| 接口 | 说明 |
|---|---|
| `src` / `poster` | 视频与封面地址 |
| `time` | 目标播放时间（秒）。由使用方决定怎么从滚动进度换算，组件不关心时段 |
| `v-model:active` | 视频是否已就绪并接管画面。`loadeddata` 置真，`error` 置假 |

内部行为全部从首页原样搬迁：

- **设备门槛**：`(min-width: 768px)`、`(hover: hover)`、非 `prefers-reduced-motion` 三者同时满足才渲染 `<video>`，否则什么都不渲染，`active` 保持假。
- **擦洗循环**：`time` 变化时唤醒 rAF；没有 `<video>`（设备不达标或已加载失败）时立即停止；每帧 `seekedTime += (target - seekedTime) * 0.12`，差值小于 0.004 视为到位；`v.seeking` 期间不写 `currentTime`，漂移超过 1/30 秒才写；到位后停止 rAF。
- **就绪瞬间**：`seekedTime` 直接对齐当前 `time`，不从 0 插值过去。
- **卸载**：取消 rAF。
- 样式：`position: absolute; inset: 0; object-fit: cover; pointer-events: none`，就绪前 `opacity: 0`，就绪后 600ms 淡入。定位上下文由使用方的容器提供（首页是 `position: fixed` 的 `.sky`）。

首页专属的部分不进组件：视频遮罩 `--home-video-veil`、视频接管后隐藏 CSS 替身，都留在 `HomeSky`。

## 5. 首页私有逻辑

### 5.1 `useDayCycle()`（`day-cycle.ts`）

从 `index.vue` 原样搬出：`VIDEO_DURATION`、`PHASE_END`、`PINNED_RANGE`、`periodFromVideoTime`、时钟 `updateClock`（含定时器生命周期）、`manualDayNight`、`currentTimePeriod`、`timePeriodName`、`timePeriodIcon`、`isNightView`、`dayNightTitle`、`toggleDayNight`、`targetVideoTime`。

- 内部调用 `useScrollProgress()` 取进度。
- 视频就绪状态 `videoActive` 由它持有并返回，供 `HomeSky` 用 `v-model:active` 绑定，也供时段推导用。
- 时段优先级不变：手动开关 > 视频画面 > 本机时钟。

### 5.2 `home-modules.ts`

导出 `modules`、`unauthModules` 两个数组，内容不变。

## 6. 组件划分

| 组件 | 模板来源（原行号） | 样式来源 | 输入 / 输出 |
|---|---|---|---|
| `HomeSky` | 3–70 | 天空时段、夜景层、草坡；视频接管隐藏规则 | props `period`；`v-model:video-active` |
| `HomeNav` | 72–151 | 导航 | props `brandName`、`loggedIn`、`periodIcon`、`time`、`isNight`、`dayNightTitle`；emit `toggle-day-night`。锚点跳转调用 `scroll-to-section.ts` |
| `HeroIsland` | 153–237 除头像区 | hero 分块中已登录部分，`@use _hero` | props `nickname`、`avatarSrc`、`statWords`、`statStreak` |
| `HeroAvatar` | 头像区（`hero-avatar-wrap` 及其内的气球、化石徽章、叶子、名牌） | hero 分块中头像与装饰部分 | props `avatarSrc`、`nickname`、`statWords`、`statStreak` |
| `HeroCounter` | 240–313 | 未登录柜台，`@use _hero` | 无 props；次按钮（跳到模块区）调用 `scroll-to-section.ts` |
| `HomeKpiStrip` | 315–354 | KPI 条 | props `stats`（`words` / `logs` / `streak` / `peak` 四个已格式化的字符串） |
| `HomeModules` | 356–410 | 背包格子 | props `loggedIn`；emit `select(key)` |
| `IslandPassport` | 413–543 已登录分支 | 岛民证 | props `brandName`、`nickname`、`avatarSrc`；称号、水果的哈希生成（`getHash` / `userFruit` / `userTitle1` / `userTitle2`）随组件迁入 |
| `BulletinBoard` | 413–543 未登录分支 | 告示板 | 无 |
| `HomeCampFooter` | 546–592 | 帐篷与页脚 | props `loggedIn`、`nickname` |

- `#about` 这层 `<section>` 外壳和标题组在两个分支里文案不同，外壳留在 `index.vue`，两个组件只负责卡片本体。
- KPI 请求和 `statWords` / `statLogs` / `statStreak` / `statPeak` 四个格式化值留在 `index.vue`：字数和连续天数传给 `HeroIsland`（再转给 `HeroAvatar` 的气球和徽章），四个值一起传给 `HomeKpiStrip`。C 阶段会删掉 KPI 条、把数据并入头像区，届时整组件删除即可。
- 已登录与未登录的切换仍由 `index.vue` 用 `v-if` 决定渲染哪个组件，DOM 顺序与现在完全一致。

## 7. 样式迁移规则

1. **token 不动**：`.home-page` / `.home-page--night` 上的 `--ai-*`、`--home-*` 定义，以及时段背景渐变，留在 `index.vue`。
2. **夜间逐元素规则随元素走**：在子组件的 scoped 样式里直接写 `.home-page--night .xxx`。scoped 只给最后一段选择器加属性，编译后是 `.home-page--night .xxx[data-v-子组件]`，祖先类照常匹配根节点，特异性与原来的 `.home-page--night .xxx[data-v-首页]` 相同。**不要用 `:global(.home-page--night) .xxx`**：Vue 3 会把整个选择器替换成 `:global()` 的内容，结果变成 `.home-page--night`，规则会刷到页面根上。
3. **视频接管隐藏规则**：`HomeSky` 自己知道 `videoActive`，改用组件内的修饰类控制，不再依赖根节点的 `.home-page--video`。根节点的 `.home-page--video` 仍保留，用于让出根背景（`.home-page.home-page--video { background: none }`）。
4. **响应式分块按元素拆散**：`.modules-pocket` 进 `HomeModules`，`.hero-stats` 进 `HomeKpiStrip`，`.hero-grid` 进 `_hero.scss`，`.nav` 进 `HomeNav`，`.ac-passport*` 进 `IslandPassport`。
5. **共用 partial**：`_shared.scss`、`_hero.scss` 由需要的组件各自 `@use`。scoped 编译后每个组件会各有一份，体积增加很小，换来的是每个组件样式自足。
6. **清理**（均为零视觉影响）：
   - 模块格子的已登录、未登录两段模板合成一段 `v-for`，标题组文案按 `loggedIn` 切换。
   - 删除嵌在 `.section-title` 里的 `&--pink { .pocket-slot-ico-wrap {...} }` 一整组（编译为 `.section-title--pink ...`，永远匹配不到）。正确的 `.pocket-slot--*` 规则保留。
   - 删除夜间块里的 `.about-card`、`.about-list-row span:last-child` 两条规则，以及 `.ac404__sky` 规则：三个类名在首页模板里都不存在（`.ac404__sky` 属于 404 页，scoped 样式在首页永远匹配不到）。
7. **不做的事**：不改任何色值、尺寸、动画；不做 token 化治理；不动 KPI 请求失败时的静态兜底数字。

## 8. 风险

- **源码顺序变化**：拆分后各组件样式的注入顺序与原来单文件里的先后顺序不同。两条特异性相同、作用于同一元素的规则，谁在后谁生效，结果可能改变。靠第 9 节的指纹比对兜住，发现差异逐条定位修正。
- **多根组件**：各子组件均为单根。`index.vue` 本身保持单根（路由缓存要求）。

## 9. 验证

| 检查 | 做法 |
|---|---|
| 类型与构建 | `pnpm run type-check`、`pnpm run build-only`，与 CI 一致 |
| 代码风格 | `pnpm eslint <改动文件>` 定向检查，不跑会就地改写全仓库的 `pnpm run lint` |
| 计算样式指纹比对 | 远端 8083 上，重构前（`main`）与重构后（分支）各采一次，逐元素比对 |
| 截图 | 重构后各组合截图，供肉眼复核 |

**为什么不做像素比对**：内置浏览器的截图只回到对话里、不落文件，无法逐像素相减；飘落粒子、云、萤火虫的动画相位每次不同，像素必然有噪声。计算样式指纹更严格：

- 按文档顺序遍历 `.home-page` 下的元素（跳过 `display: contents` 的包裹层），对每个元素及其 `::before` / `::after` 取 `getComputedStyle` 全部属性做哈希。
- 采集时注入 `animation: none; transition: none` 排除时间相关的值；动画声明（时长、次数、缓动等）另行采集，动画名去掉 scoped 哈希后缀再比，并逐个核对对应的 `@keyframes` 在页面样式表里真实存在。
- 元素的直接文本也纳入哈希（时钟文本除外）。
- 重构前的指纹存进该页面源的 `localStorage`，重构后在页面内直接比对，只返回不一致的元素。

比对矩阵：已登录 / 未登录 × 白天 / 星夜（手动开关钉住）× 桌面 1440 宽 / 手机 375 宽，共 8 组；另加桌面宽度下不钉住时段、滚动到 70% 处（视频擦洗到黄昏）的已登录一组，共 9 组。

已登录态需要你在浏览器里登录，我不代填密码。打开浏览器验证前会先征得你同意。

## 10. 交付

- 仓库：`blog-ui-vue3`
- 分支：`refactor/home-split`
- 一个 PR，走默认交付流程：中文 PR → 看 CI 结论 → 本地合并 `main` → 远端同步
