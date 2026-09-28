# 首页 hero 与模块区改版 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把首页 hero 改成「木牌招牌」方案（摇摆木牌标题 + 头像四角 KPI 挂件 + 写日常按钮），删除 KPI 统计条，模块区精简为 4 个直达真实页面的入口。

**Architecture:** 新增共用的 `HeroSign` 组件承载木牌标题，两个 hero 都用它；KPI 数值的类型抽成 `HomeStats`，由 `index.vue` 计算后传给 `HeroIsland` → `HeroAvatar` 渲染为 4 个徽章；模块数据收敛为一份带 `path` 的 4 项清单，点击由 `index.vue` 按登录状态跳转。动效全部是 CSS 动画。

**Tech Stack:** Vue 3.5（`<script setup>`）、TypeScript、Sass、vue-tsc、Vite 8。

**Spec:** `docs/specs/2026-09-28-home-hero-revamp-design.md`

## Global Constraints

- 标题文案「博客 / 小岛」，**无句号**；木牌摆动 ±2.2°、周期 3.6s；逐字弹入间隔 80ms、时长 0.7s、`cubic-bezier(.34, 1.56, .64, 1)`；木牌内字号 `clamp(52px, 7vw, 88px)`。
- 徽章浮动：上下 10px、左右 ±3°，周期 2.6–3.2s 且错开延迟。
- 4 个入口路径：`/develop/work-daily`、`/develop/work-doc`、`/develop/convert-path`、`/develop/platform-script`；「写今天的日常」跳 `/develop/work-daily`。
- 所有新动效在 `@media (prefers-reduced-motion: reduce)` 下关闭。
- 子组件夜间规则写 `.home-page--night .xxx`，禁止 `:global(...)`（lessons l72）。
- 新写与改动的代码不引入新的 prettier 问题；只对本计划新建的文件允许 `pnpm eslint --fix`；禁止 `pnpm run lint`。
- 不改范围外的东西：KPI 失败兜底数字、`.hero-name` 里既有的 `border: 2px.5 solid` 笔误、未登录 hero 的柜台 / 气泡 / 机票都保持原样。
- 分支 `feature/home-hero-revamp`；提交信息 `<类型>: <中文描述>`。
- 远端同步排除 `._*`、`node_modules`、`dist`、`.vite`、`.pnpm-store`、`.env*`；不执行 `docker compose up`；打开浏览器与登录登出前先征得用户同意，登录登出由用户操作。

## Review Focus

1. **375 宽已登录的横向溢出**：`main` 上布局宽 406。气球（`left: -80px`）与化石装饰是最可能的来源，本次删除它们后要实测 `scrollWidth === 375`；若仍溢出，定位来源，不在 hero 区则只报告。Task 4 Step 4。
2. **徽章遮挡**：徽章不得压住标题、副标题和两个按钮，900px 以下单列布局时尤其要看。Task 4 Step 3 截图。
3. **星夜下木牌与绳子可见性**：夜间描边色 `--ai-outline` 是 `#0f1731`，绳子若用它会融进夜空。绳子单独用 `--home-sign-rope` token。Task 4 Step 3 截图。
4. **未登录点击入口**：必须去 `/login`，不能直接进业务页（会被路由守卫拦回并报错）。Task 4 Step 5。
5. **鼠标移上重放弹入**：两个同内容不同名的 keyframes 切换；若两者同名则不会重播。Task 2 Step 1 的代码与 Task 4 Step 6 的计算值核对覆盖。

---

## 通用工具

```bash
cd /Volumes/AgentAPFS/Program/Personal/blog/blog-ui-vue3/app
pnpm run type-check && pnpm run build-only     # 每个任务的门禁
pnpm eslint <文件...>                            # 定向检查
```

eslint 对比法（改动已有文件时用）：改动前先记下该文件的问题数，改动后问题数不得增加，且新增行上不得出现问题：

```bash
pnpm eslint <文件> 2>&1 | grep -cE "^\s+[0-9]+:[0-9]+"
```

本项目无单元测试框架，行为验证集中在 Task 4 的远端实测。

---

### Task 1: KPI 并入头像区，删除 KPI 条

**Files:**
- Create: `app/src/views/home/home-stats.ts`
- Modify: `app/src/views/home/components/HeroAvatar.vue`
- Modify: `app/src/views/home/components/HeroIsland.vue`
- Modify: `app/src/views/home/index.vue`
- Delete: `app/src/views/home/components/HomeKpiStrip.vue`

**Interfaces:**
- Produces: `export interface HomeStats { words: string; logs: string; streak: string; peak: string }`；`<HeroIsland :avatar-src :nickname :stats>`；`<HeroAvatar :avatar-src :nickname :stats>`

- [ ] **Step 1: 记录改动前 eslint 基数**

```bash
cd /Volumes/AgentAPFS/Program/Personal/blog/blog-ui-vue3/app
for f in src/views/home/components/HeroAvatar.vue src/views/home/components/HeroIsland.vue src/views/home/index.vue; do printf "%s " $f; pnpm eslint $f 2>&1 | grep -cE "^\s+[0-9]+:[0-9]+"; done
```

记下三个数字，Step 7 对比。

- [ ] **Step 2: 新建 `home-stats.ts`**

```ts
/** 首页 KPI 的展示值（均已格式化为字符串） */
export interface HomeStats {
  /** 本年字数，如 17.5w */
  words: string;
  /** 累计日志条数 */
  logs: string;
  /** 最长连续天数 */
  streak: string;
  /** 高产时段，如 下午 */
  peak: string;
}
```

- [ ] **Step 3: 改 `HeroAvatar.vue` 模板**

把模板里从 `<!-- 动森经典红色漂浮气球礼包 (字数统计) -->` 到化石块结束的 `</div>`（即 `deco-balloon-present` 与 `deco-fossil-streak` 两个元素整体）删除；把 `<!-- 岛主圆形框头像 -->` 与 `<div class="hero-avatar">…</div>` 替换为：

```vue
    <!-- 头像框：徽章以它为定位基准，保证随头像尺寸一起缩放 -->
    <div class="hero-avatar-frame">
      <div class="hero-avatar">
        <img :src="avatarSrc" :alt="nickname" />
      </div>

      <!-- 四角 KPI 挂件 -->
      <div class="hero-badge hero-badge--tl">
        <span class="hero-badge__ico">🎈</span>
        <span class="hero-badge__body">{{ stats.words }}<small>本年字数</small></span>
      </div>
      <div class="hero-badge hero-badge--tr">
        <span class="hero-badge__ico">🦴</span>
        <span class="hero-badge__body">{{ stats.streak }} 天<small>最长连续</small></span>
      </div>
      <div class="hero-badge hero-badge--bl">
        <span class="hero-badge__ico">📝</span>
        <span class="hero-badge__body">{{ stats.logs }} 条<small>累计日志</small></span>
      </div>
      <div class="hero-badge hero-badge--br">
        <span class="hero-badge__ico">⏰</span>
        <span class="hero-badge__body">{{ stats.peak }}<small>高产时段</small></span>
      </div>
    </div>
```

首行注释改为 `<!-- 首页岛主头像区（头像、名牌、四角 KPI 挂件、叶子装饰） -->`。

- [ ] **Step 4: 改 `HeroAvatar.vue` 脚本与样式**

脚本整体替换为：

```ts
<script setup lang="ts">
import type { HomeStats } from "../home-stats";

defineOptions({ name: "HeroAvatar" });

defineProps<{ avatarSrc: string; nickname: string; stats: HomeStats }>();
</script>
```

样式：删除 `// 浮动的红色气球礼物` 起的 `.deco-balloon-present`、`.deco-fossil-streak` 两段及 `@keyframes ac-balloon-bob`、`@keyframes ac-fossil-sway`；`.hero-avatar` 的 `width: min(340px, 75vw);` 改为 `width: 100%;`；在 `.hero-name` 之前插入：

```scss
.hero-avatar-frame {
  position: relative;
  width: min(340px, 75vw);
}

// 四角 KPI 挂件：奶油底 + 棕描边，跟随昼夜 token
.hero-badge {
  position: absolute;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--ai-btn-face);
  border: 2px solid var(--ai-outline);
  border-radius: 14px;
  box-shadow: 0 3px 0 0 var(--ai-btn-shadow);
  color: var(--ai-text);
  font-weight: 900;
  font-size: 14px;
  white-space: nowrap;
  animation: hero-badge-bob 3s ease-in-out infinite;
}

.hero-badge__ico {
  font-size: 20px;
  line-height: 1;
}

.hero-badge__body {
  display: flex;
  flex-direction: column;
  line-height: 1.15;

  small {
    font-size: 10px;
    font-weight: 800;
    opacity: 0.7;
  }
}

.hero-badge--tl { top: 2%; left: -10%; animation-duration: 2.8s; }
.hero-badge--tr { top: 8%; right: -10%; animation-duration: 3.2s; animation-delay: 0.4s; }
.hero-badge--bl { bottom: 14%; left: -12%; animation-duration: 3s; animation-delay: 0.9s; }
.hero-badge--br { bottom: 10%; right: -12%; animation-duration: 2.6s; animation-delay: 1.3s; }

@keyframes hero-badge-bob {
  0%,
  100% {
    transform: translateY(0) rotate(-3deg);
  }
  50% {
    transform: translateY(-10px) rotate(3deg);
  }
}

// 窄屏：徽章收小，避免超出视口
@media (max-width: 480px) {
  .hero-badge {
    padding: 4px 8px;
    font-size: 12px;
  }

  .hero-badge__ico {
    font-size: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-badge {
    animation: none;
  }
}
```

说明：`.hero-avatar-frame` 保持原头像尺寸（`min(340px, 75vw)`），头像改为占满框，视觉尺寸不变。

- [ ] **Step 5: 改 `HeroIsland.vue`**

1. `<HeroAvatar … :stat-words … :stat-streak … />` 替换为：

```vue
      <HeroAvatar :avatar-src="avatarSrc" :nickname="nickname" :stats="stats" />
```

2. 脚本替换为：

```ts
<script setup lang="ts">
import HeroAvatar from "./HeroAvatar.vue";
import type { HomeStats } from "../home-stats";

defineOptions({ name: "HeroIsland" });

defineProps<{ avatarSrc: string; nickname: string; stats: HomeStats }>();
</script>
```

（「写今天的日常」按钮与木牌在 Task 2 做。）

- [ ] **Step 6: 改 `index.vue`，删除 KPI 条**

1. 模板删除这两行：

```vue
    <!-- 岛民广播属性统计面板 (仅在已登录状态展示) -->
    <HomeKpiStrip v-if="isLoggedIn" :stats="stats" />
```

   及其后的空行；`<HeroIsland>` 的 `:stat-words="statWords"`、`:stat-streak="statStreak"` 两行替换为 `:stats="stats"`。
2. 脚本删除 `import HomeKpiStrip from "./components/HomeKpiStrip.vue";`，新增 `import type { HomeStats } from "./home-stats";`，`const stats = computed(() => ({` 改为 `const stats = computed<HomeStats>(() => ({`。
3. 删除文件：

```bash
git rm app/src/views/home/components/HomeKpiStrip.vue
```

- [ ] **Step 7: 验证并提交**

```bash
cd /Volumes/AgentAPFS/Program/Personal/blog/blog-ui-vue3/app
pnpm run type-check && pnpm run build-only
pnpm eslint src/views/home/home-stats.ts
for f in src/views/home/components/HeroAvatar.vue src/views/home/components/HeroIsland.vue src/views/home/index.vue; do printf "%s " $f; pnpm eslint $f 2>&1 | grep -cE "^\s+[0-9]+:[0-9]+"; done
grep -rn "HomeKpiStrip\|statWords=\|stat-words\|deco-balloon\|deco-fossil" src/views/home
```

期望：构建通过；`home-stats.ts` 0 问题；三个文件问题数不高于 Step 1（`HeroAvatar` 因删掉气球 / 化石应明显下降）；grep 无输出。

```bash
cd .. && git add -A app/src/views/home && git commit -m "feat: 首页 KPI 并入头像四角挂件并删除统计条"
```

---

### Task 2: 木牌标题与写日常按钮

**Files:**
- Create: `app/src/views/home/components/HeroSign.vue`
- Modify: `app/src/views/home/components/HeroIsland.vue`
- Modify: `app/src/views/home/components/HeroCounter.vue`
- Modify: `app/src/views/home/styles/_hero.scss`
- Modify: `app/src/views/home/index.vue`

**Interfaces:**
- Consumes: 根上的 `--home-sign-wood-top`、`--home-sign-wood-bottom`、`--home-sign-wood-shadow`、`--home-sign-rope`（本任务 Step 4 定义）
- Produces: `<HeroSign />`（无 props）

- [ ] **Step 1: 新建 `HeroSign.vue`**

```vue
<!-- 首页木牌标题（已登录 / 未登录 hero 共用） -->
<template>
  <div class="hero-sign">
    <h1 class="hero-title">
      <span class="hero-sign__ch">博</span><span class="hero-sign__ch">客</span><br />
      <span class="hero-sign__ch">小</span><span class="hero-sign__ch">岛</span>
    </h1>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "HeroSign" });
</script>

<style scoped lang="scss">
// 木牌由两根绳子挂着，以绳子顶端为轴轻轻摆动
.hero-sign {
  position: relative;
  display: inline-block;
  margin: 44px 0 20px;
  padding: 16px 30px 12px;
  background: linear-gradient(180deg, var(--home-sign-wood-top) 0%, var(--home-sign-wood-bottom) 100%);
  border: 3px solid var(--ai-outline);
  border-radius: 20px;
  box-shadow: 0 6px 0 0 var(--home-sign-wood-shadow);
  transform-origin: 50% -34px;
  animation: hero-sign-swing 3.6s ease-in-out infinite;

  &::before,
  &::after {
    content: "";
    position: absolute;
    top: -34px;
    width: 3px;
    height: 34px;
    background: var(--home-sign-rope);
  }

  &::before {
    left: 34px;
  }

  &::after {
    right: 34px;
  }
}

.hero-title {
  margin: 0;
  font-size: clamp(52px, 7vw, 88px);
  font-weight: 900;
  line-height: 0.94;
  letter-spacing: -0.03em;
  color: #fffdec;
  text-shadow:
    0 2.5px 0 #eed09d,
    0 5px 0 var(--ai-outline),
    0 7.5px 0 var(--ai-outline),
    0 12px 24px rgba(90, 58, 24, 0.18);
}

// 进场逐字弹入；鼠标移上换成同内容的另一组 keyframes 以重播
.hero-sign__ch {
  display: inline-block;
  animation: hero-sign-pop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both;

  &:nth-of-type(2) {
    animation-delay: 0.08s;
  }

  &:nth-of-type(3) {
    animation-delay: 0.16s;
  }

  &:nth-of-type(4) {
    animation-delay: 0.24s;
  }
}

.hero-sign:hover .hero-sign__ch {
  animation-name: hero-sign-pop-again;
}

@keyframes hero-sign-swing {
  0%,
  100% {
    transform: rotate(-2.2deg);
  }
  50% {
    transform: rotate(2.2deg);
  }
}

@keyframes hero-sign-pop {
  0% {
    opacity: 0;
    transform: translateY(-40px) scale(0.4);
  }
  100% {
    opacity: 1;
    transform: none;
  }
}

@keyframes hero-sign-pop-again {
  0% {
    opacity: 0;
    transform: translateY(-40px) scale(0.4);
  }
  100% {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-sign,
  .hero-sign__ch {
    animation: none;
  }
}
</style>
```

- [ ] **Step 2: 两个 hero 换用 `HeroSign`**

`HeroIsland.vue` 与 `HeroCounter.vue` 中都把：

```vue
        <div class="hero-title-row">
          <h1 class="hero-title">
            博客<br/>小岛.
          </h1>
        </div>
```

替换为：

```vue
        <HeroSign />
```

并在两者 `<script setup>` 里加 `import HeroSign from "./HeroSign.vue";`。

- [ ] **Step 3: `HeroIsland.vue` 加「写今天的日常」**

在「进入工作台」的 `</router-link>` 之后、`</div>`（`hero-actions`）之前插入：

```vue
          <router-link class="btn-ai btn-ai-lg" to="/develop/work-daily">
            <span class="btn-ai-finger"></span>
            <span class="btn-ai-text">✏️ 写今天的日常</span>
          </router-link>
```

- [ ] **Step 4: `_hero.scss` 移出标题样式，`index.vue` 加木牌 token**

1. `_hero.scss` 删除 `.hero-title { … }` 与 `.hero-title-row { … }` 两段（已迁入 `HeroSign`）。
2. `index.vue` 的 `.home-page {` token 区，在 `--home-switch-knob` 那一行之后插入：

```scss
  --home-sign-wood-top: #c8905a;    // 木牌上半
  --home-sign-wood-bottom: #a86f3d; // 木牌下半
  --home-sign-wood-shadow: #6b4520; // 木牌投影
  --home-sign-rope: #794f27;        // 挂绳
```

   在 `.home-page--night {` 的 `--home-switch-knob` 那一行之后插入：

```scss
  --home-sign-wood-top: #6b4a2e;
  --home-sign-wood-bottom: #54381f;
  --home-sign-wood-shadow: #2c1c0e;
  --home-sign-rope: #a98a66;        // 夜空里挂绳要比描边亮，否则看不见
```

- [ ] **Step 5: 验证并提交**

```bash
cd /Volumes/AgentAPFS/Program/Personal/blog/blog-ui-vue3/app
pnpm run type-check && pnpm run build-only
pnpm eslint src/views/home/components/HeroSign.vue
grep -rn "hero-title-row\|小岛\.\|hero-title {" src/views/home
```

期望：构建通过；`HeroSign.vue` 0 问题（仅格式问题允许 `pnpm eslint --fix src/views/home/components/HeroSign.vue`）；grep 只命中 `HeroSign.vue` 里的 `.hero-title {`。`HeroIsland`、`HeroCounter`、`index.vue`、`_hero.scss` 按通用工具的对比法确认问题数不增加。

```bash
cd .. && git add app/src/views/home && git commit -m "feat: 首页标题改为摇摆木牌并新增写今天的日常按钮"
```

---

### Task 3: 模块区精简为 4 个直达入口

**Files:**
- Modify: `app/src/views/home/home-modules.ts`
- Modify: `app/src/views/home/components/HomeModules.vue`
- Modify: `app/src/views/home/index.vue`

**Interfaces:**
- Produces: `HomeModule` 增加 `path: string`；`export const homeModules: HomeModule[]`（4 项）；`<HomeModules :logged-in @select="(mod: HomeModule) => …">`

- [ ] **Step 1: 重写 `home-modules.ts`**

```ts
/** 首页模块区入口；path 取自后端菜单表（2026-09-28 核对） */
export interface HomeModule {
  key: string;
  color: string;
  tag: string;
  title: string;
  sub: string;
  icon: string;
  path: string;
}

export const homeModules: HomeModule[] = [
  {
    key: "daily",
    color: "pink",
    tag: "DAILY",
    title: "工作日常",
    sub: "日报 · 周报 · 月报",
    icon: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
    path: "/develop/work-daily",
  },
  {
    key: "docs",
    color: "yellow",
    tag: "DOCS",
    title: "工作文档",
    sub: "项目资料沉淀",
    icon: "M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z",
    path: "/develop/work-doc",
  },
  {
    key: "route",
    color: "teal",
    tag: "ROUTE",
    title: "路径转换",
    sub: "网址与服务器地址",
    icon: "M13 2L3 14h9l-1 8 10-12h-9z",
    path: "/develop/convert-path",
  },
  {
    key: "script",
    color: "orange",
    tag: "SCRIPT",
    title: "平台脚本",
    sub: "平台自动化脚本",
    icon: "M16 18l6-6-6-6M8 6l-6 6 6 6",
    path: "/develop/platform-script",
  },
];
```

- [ ] **Step 2: 改 `HomeModules.vue`**

1. 模板里 `v-for="mod in list"` 改为 `v-for="mod in homeModules"`，`@click="emit('select', mod.key)"` 改为 `@click="emit('select', mod)"`。
2. 脚本：`import { modules, unauthModules } from "../home-modules";` 改为 `import { homeModules, type HomeModule } from "../home-modules";`；`defineEmits<{ select: [key: string] }>()` 改为 `defineEmits<{ select: [mod: HomeModule] }>()`；删除 `const list = computed(…)` 一行（`head` 保留）。
3. 样式：删除 `.pocket-slot--blue`、`--purple`、`--green`、`--peach`、`--lime`、`--red`、`--brown`、`--mint` 八行，保留 `pink`、`yellow`、`teal`、`orange`；删除整个 `@media (max-width: 1200px) { … }` 块（4 张卡在 1200 宽以下改 3 列会剩一张孤卡，直接从 4 列到 900 以下 2 列）。

- [ ] **Step 3: 改 `index.vue` 跳转**

`handleModuleClick` 整体替换为：

```ts
// 未登录一律去登录；已登录直达入口对应的功能页
const handleModuleClick = (mod: HomeModule) => {
  router.push(isLoggedIn.value ? mod.path : "/login");
};
```

并新增 `import type { HomeModule } from "./home-modules";`。

- [ ] **Step 4: 验证并提交**

```bash
cd /Volumes/AgentAPFS/Program/Personal/blog/blog-ui-vue3/app
pnpm run type-check && pnpm run build-only
pnpm eslint src/views/home/home-modules.ts
grep -rn "unauthModules\|push(\"/dashboard\")\|pocket-slot--blue\|max-width: 1200px" src/views/home
```

期望：构建通过；`home-modules.ts` 0 问题；grep 无输出（旧的 `router.push("/dashboard")` 分支、`unauthModules`、蓝色格子、1200 断点都已不存在；导航与 hero 里「进入工作台」的 `to="/dashboard"` 不受影响）。`HomeModules.vue`、`index.vue` 按对比法确认问题数不增加。

```bash
cd .. && git add app/src/views/home && git commit -m "feat: 首页模块区精简为四个直达功能页的入口"
```

---

### Task 4: 远端实测

**Files:** 视结果修正 `app/src/views/home/**`。

- [ ] **Step 1: 同步**

```bash
cd /Volumes/AgentAPFS/Program/Personal/blog/blog-ui-vue3
find . -name '._*' -not -path './app/node_modules/*' -delete
rsync -az --exclude='._*' --exclude='node_modules' --exclude='dist' --exclude='.vite' --exclude='.pnpm-store' --exclude='.env*' --exclude='.git' \
  app/src/ ubuntu@10.10.9.184:/data/personal/projects/blog-ui-vue3/app/src/
ssh ubuntu@10.10.9.184 'cd /data/personal/projects/blog-ui-vue3 && git status --short'
```

期望：远端改动仅限 `app/src/views/home/**`（含已删除的 `HomeKpiStrip.vue` 仍残留在远端——rsync 不删文件；它已无引用，不影响运行，交付时 `reset --hard` 会清理）。

- [ ] **Step 2: 征得同意后打开浏览器**

`http://10.10.9.184:8083/#/`，`read_console_messages` 只看 error，期望无 Vue 编译或运行时错误。

- [ ] **Step 3: 截图复核**

已登录：桌面 1440 白天、桌面 1440 星夜（点昼夜开关钉住）、手机 375 白天；未登录：桌面 1440 白天。每张确认：木牌标题无句号且可见挂绳；徽章不压标题、副标题、按钮；星夜下木牌与绳子清晰；KPI 统计条已不存在；模块区 4 张卡。

- [ ] **Step 4: 手机溢出**

已登录、`resize_window` 375×812、刷新：

```js
JSON.stringify({ sw: document.documentElement.scrollWidth, iw: innerWidth });
```

期望 `sw === 375`。不等时定位来源：

```js
[...document.querySelectorAll(".home-page *")]
  .filter((e) => e.getBoundingClientRect().right > innerWidth + 1)
  .slice(0, 10)
  .map((e) => e.className.baseVal ?? e.className);
```

来源在 `HeroAvatar` / `HeroIsland` 内则修正并重测；在别处则记录并在交付时报告，不扩大改动。

- [ ] **Step 5: 跳转**

已登录：依次点击 4 张卡片，`location.hash` 分别为 `#/develop/work-daily`、`#/develop/work-doc`、`#/develop/convert-path`、`#/develop/platform-script`（每次点完 `navigate` 回 `#/`）；点击「写今天的日常」到 `#/develop/work-daily`。请用户登出后：点击任一卡片到 `#/login`。

- [ ] **Step 6: 动效计算值**

已登录桌面：

```js
const pick = (sel) => [...document.querySelectorAll(sel)].map((e) => {
  const cs = getComputedStyle(e);
  return [cs.animationName, cs.animationDuration, cs.animationDelay];
});
JSON.stringify({ sign: pick(".hero-sign"), ch: pick(".hero-sign__ch"), badges: pick(".hero-badge") });
```

期望：`.hero-sign` 为 `hero-sign-swing-<hash>`、`3.6s`；4 个 `.hero-sign__ch` 为 `hero-sign-pop-<hash>`、延迟 `0s / 0.08s / 0.16s / 0.24s`；4 个 `.hero-badge` 为 `hero-badge-bob-<hash>`，时长 `2.8s / 3.2s / 3s / 2.6s`。

- [ ] **Step 7: 减少动态效果（代码核对）**

```bash
cd /Volumes/AgentAPFS/Program/Personal/blog/blog-ui-vue3/app/src/views/home/components
grep -n "prefers-reduced-motion" -A4 HeroSign.vue HeroAvatar.vue
```

期望：`HeroSign` 覆盖 `.hero-sign`、`.hero-sign__ch`；`HeroAvatar` 覆盖 `.hero-badge`。

- [ ] **Step 8: 截图发给用户**

把 Step 3 的截图发给用户确认视觉。

---

### Task 5: 交付

- [ ] **Step 1: 自查整条分支**

```bash
cd /Volumes/AgentAPFS/Program/Personal/blog/blog-ui-vue3
git diff --stat main...feature/home-hero-revamp
```

期望：只涉及 `.gitignore`、`app/src/views/home/**`、`docs/specs/2026-09-28-home-hero-revamp-design.md`、`docs/plans/2026-09-28-home-hero-revamp.md`。

- [ ] **Step 2: 整分支审查**

派一个审查代理审整条分支（与首页拆分同样的做法），Critical / Important 修复后再交付。

- [ ] **Step 3: 确认后走默认交付流程**

向用户确认「是否按默认交付流程继续」，同意后：推送分支 → 中文 PR → 等 CI（type-check、build-only）通过 → 本地快进合并 `main` → 推送 `main` → 远端先核对「只存在于远端」的未跟踪文件，再 `git fetch origin && git reset --hard origin/main` → 复查首页无报错。
