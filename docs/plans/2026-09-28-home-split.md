# 首页拆分与视频背景组件化 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 3064 行的 `views/home/index.vue` 按 section 拆成页面私有组件，并把滚动擦洗视频背景提到公共层，重构前后每个元素的计算样式一致。

**Architecture:** 模板与样式按原文件的行号区间原样搬进各组件；夜间逐元素规则随元素迁入子组件；昼夜 token 留在页面根上靠 CSS 变量继承。时段与视频擦洗逻辑抽成 `useDayCycle()`，视频本体抽成只认「目标时间」的公共组件 `ScrubVideoBackground`，滚动进度抽成公共 `useScrollProgress()`。

**Tech Stack:** Vue 3.5（`<script setup>`、`defineModel`）、TypeScript、Vite 8、Sass（`@use`）、vue-tsc。

**Spec:** `docs/specs/2026-09-28-home-split-design.md`

## Global Constraints

- 等值重构：不改任何色值、尺寸、动画、文案、section 顺序；允许的差异只有第 7 节列出的死代码删除和两段模板合并。
- 原文件基准：**所有「ORIG 行号」都指提交 `af8bf5b` 中的 `app/src/views/home/index.vue`**，一律用下面的 `orig` 函数取，不要按当前工作区文件的行号取（每个任务都会改动它）。
- 子组件夜间规则写 `.home-page--night .xxx`，**禁止** `:global(.home-page--night) .xxx`（Vue 3 会把整条选择器替换成 `.home-page--night`）。
- 每个 SFC：首行 HTML 注释写中文名；块顺序 `template` → `script` → `style`；`<script setup lang="ts">`；`<style scoped lang="scss">`；单根节点（多个兄弟节点时用 `display: contents` 的包裹 div）。
- 代码检查只用 `pnpm eslint <文件>` 定向执行；**禁止** `pnpm run lint`（会就地改写整个仓库）。
- 包管理只用 pnpm；不新增任何依赖。
- 提交信息 `<类型>: <中文描述>`，本计划全部用 `refactor:`（文档用 `docs:`），分支 `refactor/home-split`。
- 同步远端时排除 `._*`、`node_modules`、`dist`、`.vite`、`.pnpm-store`；不同步 `.env`；不执行 `docker compose up`。
- 打开浏览器验证前先征得用户同意；登录、登出由用户本人操作，不代填密码、不替用户登出。

## Review Focus

1. **视频加载失败**：`/home/day-cycle.mp4` 报错时，应退回 CSS 天空（云、草坡、粒子重新出现），根节点去掉 `home-page--video`。Task 7 Step 6 手动派发 `error` 事件验证。
2. **视频接管时切昼夜**：点开关后视频应擦洗进钉住区间（夜 16.8–19.5s、昼 4.5–9.0s），而不是停在原位。原实现靠 `toggleDayNight` 里手动 `ensureTicking()`，新实现靠 `watch(time)`，漏了就会不动。Task 7 Step 6 验证。
3. **离开首页再回来**：滚动监听、时钟定时器、rAF 都必须在卸载时清掉，回来后只有一套在跑，控制台无报错。Task 7 Step 6 验证。
4. **已登录 / 未登录切换**：两套 hero、KPI 条、岛民证 / 告示板、页脚文案都要跟着切，合并后的模块格子标题与列表跟着切。由 Task 7 指纹矩阵的登录维度覆盖。
5. **窄屏 / 触屏 / 减少动态效果**：三者任一不满足时不渲染 `<video>`，页面按 CSS 天空展示。手机宽度组合覆盖前两者；减少动态效果无法在内置浏览器模拟，由代码审查核对 `ScrubVideoBackground` 的门槛表达式与原文一致。

---

## 通用工具

每个任务的终端都先定义：

```bash
cd /Volumes/AgentAPFS/Program/Personal/blog/blog-ui-vue3
orig() { git show af8bf5b:app/src/views/home/index.vue | sed -n "$1p"; }
```

`orig 179,235` 输出 ORIG 第 179–235 行；`orig '1122,1127p;1174,1422'` 这类多段写法不支持，多段就多次调用。

每个任务的验证命令（在 `app/` 下）：

```bash
cd /Volumes/AgentAPFS/Program/Personal/blog/blog-ui-vue3/app
pnpm run type-check
pnpm run build-only
pnpm eslint <本任务新建或修改的 .vue / .ts 文件>
```

期望：type-check 与 build-only 退出码 0；eslint 无 error。eslint 若只报新文件的缩进 / 格式问题，允许对**本任务新建的文件**执行 `pnpm eslint --fix <新文件>`，不对其他文件 `--fix`。

本项目没有单元测试框架，等值性由 Task 1 / Task 7 的计算样式指纹比对保证，不为本次重构引入测试框架。

---

### Task 1: 采集重构前基线指纹

远端 8083 当前运行的就是 `main`（`af8bf5b`）。必须在同步任何分支代码之前完成本任务。

**Files:** 无代码改动。

**Interfaces:**
- Produces: 浏览器 `http://10.10.9.184:8083` 源下的 `localStorage` 键 `home-fp:<组合>`，共 9 个，Task 7 读取。

- [ ] **Step 1: 征得同意**

向用户说明：要用内置浏览器打开 `http://10.10.9.184:8083/` 采集首页基线；需要用户在未登录、已登录两种状态之间自己切换。得到同意再继续。

- [ ] **Step 2: 确认远端是 main**

```bash
ssh ubuntu@10.10.9.184 'cd /data/personal/projects/blog-ui-vue3 && git log --oneline -1 && git status --short | head'
```

期望：首行是 `af8bf5b`，工作区无 `app/src/views/home` 相关改动。不是则停下报告。

- [ ] **Step 3: 准备指纹函数**

以下函数在每次 `javascript_exec` 调用里都要完整带上（每次调用是独立环境，函数不跨调用保留）：

```js
async function homeFingerprint() {
  const root = document.querySelector(".home-page");
  const fnv = (s) => {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(36);
  };
  const els = [];
  const walk = (el) => {
    if (getComputedStyle(el).display !== "contents") els.push(el);
    for (const c of el.children) walk(c);
  };
  walk(root);
  const isAnim = (p) => /^(animation|transition)/.test(p);
  const styleOf = (el, pseudo, pick) => {
    const cs = getComputedStyle(el, pseudo);
    if (pseudo && (cs.content === "none" || cs.content === "normal")) return "";
    let out = "";
    for (let i = 0; i < cs.length; i++) {
      const p = cs[i];
      if (pick(p)) out += p + ":" + cs.getPropertyValue(p) + ";";
    }
    return out;
  };
  const kf = new Set();
  const collect = (rules) => {
    for (const r of rules) {
      if (r instanceof CSSKeyframesRule) kf.add(r.name);
      else if (r.cssRules && r.cssRules.length) collect(r.cssRules);
    }
  };
  for (const sh of document.styleSheets) { try { collect(sh.cssRules); } catch (e) {} }
  const stripHash = (v) => v.replace(/-[0-9a-f]{8}\b/g, "");
  const anim = els.map((el) => {
    const names = getComputedStyle(el).animationName.split(",").map((s) => s.trim()).filter((n) => n && n !== "none");
    const missing = names.filter((n) => !kf.has(n));
    return stripHash(styleOf(el, null, isAnim)) + (missing.length ? "MISSING:" + missing.join("|") : "");
  });
  const freeze = document.createElement("style");
  freeze.textContent = "*,*::before,*::after{animation:none!important;transition:none!important}";
  document.head.appendChild(freeze);
  const rest = (p) => !isAnim(p);
  const out = els.map((el, i) => {
    const text = el.closest(".clock-text") ? "" :
      [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join("");
    const h = fnv([styleOf(el, null, rest), styleOf(el, "::before", rest), styleOf(el, "::after", rest), anim[i], text].join("|"));
    return el.tagName.toLowerCase() + "." + (el.classList[0] || "") + "\t" + h + (anim[i].includes("MISSING:") ? "\tMISSING" : "");
  });
  freeze.remove();
  return out;
}
```

说明：`display: contents` 的包裹层会被跳过，所以重构后新增的包裹 div 不影响对齐；动画名去掉 scoped 的 8 位哈希后缀再比，同时核对 `@keyframes` 真实存在；时钟文本不参与。

- [ ] **Step 4: 钉住时段的辅助片段**

`PERIOD` 为 `"day"` 或 `"night"`：

```js
const btn = document.querySelector(".nav-daynight");
const want = PERIOD === "night";
if ((btn.getAttribute("aria-pressed") === "true") !== want) btn.click();
await new Promise((r) => setTimeout(r, 400));
if ((btn.getAttribute("aria-pressed") === "true") !== want) throw new Error("时段未钉住");
```

- [ ] **Step 5: 采集 8 个钉住组合**

组合键格式 `home-fp:<auth|guest>-<day|night>-<desktop|mobile>`。对每个组合：

1. 视口：`desktop` 用 `resize_window` 宽 1440、高 900；`mobile` 用 `preset: "mobile"`。切换后导航到 `http://10.10.9.184:8083/` 重新加载。
2. 登录状态：先在当前状态下采完该状态的 4 组，再请用户本人登录或登出，采另外 4 组。
3. 执行 Step 4 的片段钉住时段，然后：

```js
localStorage.setItem("home-fp:" + COMBO, JSON.stringify(await homeFingerprint()));
JSON.parse(localStorage.getItem("home-fp:" + COMBO)).length;
```

期望：每组返回元素数（数百到一千多），且与同登录状态、同视口的另一时段数量相近。

- [ ] **Step 6: 采集视频擦洗组合**

已登录、`desktop`。重新加载页面（清掉手动时段），然后：

```js
for (let i = 0; i < 40 && !document.querySelector(".home-page--video"); i++) await new Promise((r) => setTimeout(r, 250));
if (!document.querySelector(".home-page--video")) throw new Error("视频未就绪");
window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * 0.7);
await new Promise((r) => setTimeout(r, 600));
localStorage.setItem("home-fp:auth-video70-desktop", JSON.stringify(await homeFingerprint()));
document.querySelector(".home-page").className;
```

期望：返回的类名里含 `home-page--sunset` 或 `home-page--night` 以及 `home-page--video`。把实际时段记下，Task 7 对照。

- [ ] **Step 7: 核对 9 个键都在**

```js
Object.keys(localStorage).filter((k) => k.startsWith("home-fp:")).sort();
```

期望：9 个键。本任务不提交任何东西。

---

### Task 2: 公共层 + 时段逻辑 + 天空层组件

**Files:**
- Create: `app/src/composables/useScrollProgress.ts`
- Modify: `app/src/composables/index.ts`
- Create: `app/src/components/ScrubVideoBackground/index.vue`
- Create: `app/src/views/home/day-cycle.ts`
- Create: `app/src/views/home/components/HomeSky.vue`
- Modify: `app/src/views/home/index.vue`

**Interfaces:**
- Produces:
  - `useScrollProgress(target?: Ref<HTMLElement | null>): Ref<number>`
  - `<ScrubVideoBackground v-model:active :src :poster :time>`：props `src: string`、`poster: string`、`time: number`，model `active: boolean`
  - `type TimePeriod = "morning" | "afternoon" | "sunset" | "night"`（从 `views/home/day-cycle.ts` 导出）
  - `useDayCycle()` 返回 `{ videoActive, currentTimePeriod, timePeriodName, timePeriodIcon, formattedTime, isNightView, dayNightTitle, toggleDayNight, targetVideoTime }`，除 `toggleDayNight` 为函数外都是 ref / computed
  - `<HomeSky v-model:video-active :period :video-time>`

- [ ] **Step 1: 建 `useScrollProgress`**

`app/src/composables/useScrollProgress.ts`：

```ts
import { onMounted, onUnmounted, ref, type Ref } from "vue";

/**
 * 滚动进度（0 ~ 1）。
 * 不传 target 时按文档滚动计算（公开整页路由）；
 * 后台布局在内部容器里滚动，传入该容器元素即可。
 */
export function useScrollProgress(target?: Ref<HTMLElement | null>) {
  const progress = ref(0);
  let source: EventTarget | null = null;

  const update = () => {
    const el = target?.value;
    const max = el
      ? el.scrollHeight - el.clientHeight
      : document.documentElement.scrollHeight - window.innerHeight;
    const pos = el ? el.scrollTop : window.scrollY;
    progress.value = max > 0 ? Math.min(1, Math.max(0, pos / max)) : 0;
  };

  onMounted(() => {
    source = target?.value ?? window;
    update();
    source.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
  });

  onUnmounted(() => {
    source?.removeEventListener("scroll", update);
    window.removeEventListener("resize", update);
  });

  return progress;
}
```

在 `app/src/composables/index.ts` 的「公开整页路由的文档滚动解锁」那一行之后追加：

```ts

// 滚动进度（0 ~ 1）
export { useScrollProgress } from "./useScrollProgress";
```

- [ ] **Step 2: 建 `ScrubVideoBackground`**

`app/src/components/ScrubVideoBackground/index.vue`：

```vue
<!-- 滚动擦洗视频背景 -->
<template>
  <video
    v-if="eligible"
    ref="videoEl"
    class="scrub-video"
    :class="{ 'scrub-video--ready': active }"
    :src="src"
    :poster="poster"
    muted
    playsinline
    preload="auto"
    @loadeddata="onReady"
    @error="onFail"
  ></video>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";

defineOptions({ name: "ScrubVideoBackground" });

// 视频从不 play，只在 rAF 里把 currentTime 追到 time（秒）。
// time 怎么从滚动进度换算由使用方决定，本组件不关心时段。
const props = defineProps<{ src: string; poster: string; time: number }>();
// 视频是否已就绪并接管画面
const active = defineModel<boolean>("active", { required: true });

const videoEl = ref<HTMLVideoElement | null>(null);
const eligible = ref(false); // 设备是否够格加载视频

let rafId = 0;
let seekedTime = 0; // 已写进 video 的时间，用来做插值和去重

// 滚动事件里只记目标值，真正写 currentTime 放到 rAF：
// 滚轮是离散跳变，直接写会让画面一格一格蹦。
const ensureTicking = () => {
  if (!rafId) rafId = requestAnimationFrame(tick);
};

// 追到目标就停，不做常驻空转——多数时间页面是静止的，
// 120fps 空跑一个 rAF 只是白耗电。time 变化会把它重新唤醒。
const tick = () => {
  rafId = 0;
  const v = videoEl.value;
  if (!v || v.readyState < 2) {
    ensureTicking();
    return;
  }
  const target = props.time;
  seekedTime += (target - seekedTime) * 0.12;
  const settled = Math.abs(target - seekedTime) < 0.004;
  if (settled) seekedTime = target;
  // 上一次 seek 没完成就不要再写：rAF 有 120fps，浏览器完不成那么多次 seek，
  // 每次写都会打断在途的那次，结果画面反而卡在几秒前。靠 v.seeking 自然限流。
  const drifted = Math.abs(v.currentTime - seekedTime) > 1 / 30;
  if (!v.seeking && drifted) v.currentTime = seekedTime;
  if (!settled || v.seeking || drifted) ensureTicking();
};

const onReady = () => {
  active.value = true;
  seekedTime = props.time;
  ensureTicking();
};

// 加载失败就让出画面，由使用方的替身背景接管，不做别的补救
const onFail = () => {
  eligible.value = false;
  active.value = false;
};

watch(() => props.time, ensureTicking);

onMounted(() => {
  // 窄屏 / 触摸设备 / 降低动态偏好一律不加载视频，省流量也省解码
  eligible.value =
    window.matchMedia("(min-width: 768px)").matches &&
    window.matchMedia("(hover: hover)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
});

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = 0;
});
</script>

<style scoped lang="scss">
// 定位上下文由使用方的容器提供
.scrub-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  opacity: 0;
  transition: opacity 600ms ease;
}

.scrub-video--ready {
  opacity: 1;
}
</style>
```

对照 ORIG 712–766 与 810–832，确认擦洗算法、门槛表达式逐字一致。

- [ ] **Step 3: 建 `day-cycle.ts`**

`app/src/views/home/day-cycle.ts`：

```ts
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useScrollProgress } from "@/composables";

export type TimePeriod = "morning" | "afternoon" | "sunset" | "night";

// 视频是一条 19.63s 的连续镜头：清晨 → 正午 → 黄昏 → 星夜。
const VIDEO_DURATION = 19.63;
// 各时段在视频时间轴上的上界（秒），由逐帧取样定出
const PHASE_END = { morning: 4.5, afternoon: 12.6, sunset: 16.4 };
// 昼夜开关按下后，把擦洗范围钳在对应时段内，滚动仍能在区间里推进
const PINNED_RANGE = { day: [4.5, 9.0], night: [16.8, 19.5] } as const;

const periodFromVideoTime = (t: number): TimePeriod => {
  if (t < PHASE_END.morning) return "morning";
  if (t < PHASE_END.afternoon) return "afternoon";
  if (t < PHASE_END.sunset) return "sunset";
  return "night";
};

/** 首页一日推移：本机时钟、昼夜开关、视频画面三者合成当前时段 */
export function useDayCycle() {
  const scrollProgress = useScrollProgress();
  const videoActive = ref(false); // 视频是否已就绪并接管背景

  // 时钟推导出的时段
  const autoTimePeriod = ref<TimePeriod>("afternoon");
  // 昼夜开关的手动覆盖；null = 跟随本机时间。刷新页面即回到跟随。
  const manualDayNight = ref<"day" | "night" | null>(null);
  // 页面实际生效的时段：手动开关 > 视频画面 > 本机时钟。
  // 视频接管时必须由画面反推时段，否则滚到底会出现「夜景背景 + 昼间卡片」。
  const currentTimePeriod = computed<TimePeriod>(() => {
    if (manualDayNight.value === "day") return "afternoon";
    if (manualDayNight.value === "night") return "night";
    if (videoActive.value) return periodFromVideoTime(VIDEO_DURATION * scrollProgress.value);
    return autoTimePeriod.value;
  });
  const formattedTime = ref("");
  let clockTimer: ReturnType<typeof setInterval> | null = null;

  const timePeriodName = computed(() => {
    const map: Record<string, string> = {
      morning: "清晨",
      afternoon: "白天",
      sunset: "黄昏",
      night: "星夜",
    };
    return map[currentTimePeriod.value] || "白天";
  });

  const timePeriodIcon = computed(() => {
    const map: Record<string, string> = {
      morning: "🌅",
      afternoon: "☀️",
      sunset: "🌇",
      night: "🌌",
    };
    return map[currentTimePeriod.value] || "☀️";
  });

  const updateClock = () => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    formattedTime.value = `${hh}:${mm}`;

    const hour = d.getHours();
    if (hour >= 5 && hour < 8) {
      autoTimePeriod.value = "morning";
    } else if (hour >= 8 && hour < 17) {
      autoTimePeriod.value = "afternoon";
    } else if (hour >= 17 && hour < 19) {
      autoTimePeriod.value = "sunset";
    } else {
      autoTimePeriod.value = "night";
    }
  };

  /* ---- 昼夜开关 ---- */
  const isNightView = computed(() => currentTimePeriod.value === "night");

  const dayNightTitle = computed(() => {
    const source = manualDayNight.value === null ? "跟随本机时间" : "手动";
    return `昼夜切换：当前 ${timePeriodName.value}（${source}）`;
  });

  // 视频的重新擦洗由 ScrubVideoBackground 监听 time 变化触发
  const toggleDayNight = () => {
    manualDayNight.value = isNightView.value ? "day" : "night";
  };

  // 视频目标时间：钉住时在对应区间里按滚动推进，否则铺满整条时间轴
  const targetVideoTime = computed(() => {
    const p = scrollProgress.value;
    const pinned = manualDayNight.value ? PINNED_RANGE[manualDayNight.value] : null;
    if (pinned) return pinned[0] + (pinned[1] - pinned[0]) * p;
    return VIDEO_DURATION * p;
  });

  onMounted(() => {
    updateClock();
    clockTimer = setInterval(updateClock, 1000);
  });

  onUnmounted(() => {
    if (clockTimer) clearInterval(clockTimer);
  });

  return {
    videoActive,
    currentTimePeriod,
    timePeriodName,
    timePeriodIcon,
    formattedTime,
    isNightView,
    dayNightTitle,
    toggleDayNight,
    targetVideoTime,
  };
}
```

对照 ORIG 624–766：常量、时段优先级、时钟分段、标题文案逐字一致。

- [ ] **Step 4: 建 `HomeSky.vue` 骨架**

```bash
mkdir -p app/src/views/home/components
F=app/src/views/home/components/HomeSky.vue
{
  echo '<!-- 首页天空层 -->'
  echo '<template>'
  echo '  <div class="home-sky" :class="{ '"'"'home-sky--video'"'"': videoActive }">'
  orig 4,5
  cat <<'EOF'
      <ScrubVideoBackground
        v-model:active="videoActive"
        src="/home/day-cycle.mp4"
        poster="/home/day-cycle-poster.jpg"
        :time="videoTime"
      />
EOF
  orig 19,69 | sed 's/currentTimePeriod/period/g'
  echo '  </div>'
  echo '</template>'
} > $F
grep -n "currentTimePeriod\|<video" $F
```

期望：grep 无输出。ORIG 6–18 的 `<video>` 已被组件替代，ORIG 19–69 是星点、夜景、云、粒子、草坡。

- [ ] **Step 5: 补 `HomeSky.vue` 的 script 与 style**

追加 script：

```bash
cat >> app/src/views/home/components/HomeSky.vue <<'EOF'

<script setup lang="ts">
import ScrubVideoBackground from "@/components/ScrubVideoBackground/index.vue";
import type { TimePeriod } from "../day-cycle";

defineOptions({ name: "HomeSky" });

defineProps<{ period: TimePeriod; videoTime: number }>();
const videoActive = defineModel<boolean>("videoActive", { required: true });
</script>

<style scoped lang="scss">
// 包裹层不产生盒子，天空、云、粒子、草坡的定位与层叠和拆分前一致
.home-sky {
  display: contents;
}

.home-page--night .sky {
  background: radial-gradient(1000px 500px at 20% 0%, rgba(136, 157, 240, 0.15) 0%, transparent 60%);
}

EOF
```

再追加样式正文：

```bash
F=app/src/views/home/components/HomeSky.vue
{
  orig 1121,1127
  echo
  echo '// ::after 不加 position 会当行内内容绘制、排在 absolute 的视频下面，必须显式定位。'
  echo '.home-sky--video .sky::after {'
  orig 1147,1152
  echo
  orig 1162,1163
  echo '.home-sky--video {'
  orig 1165,1172
  echo
  orig 1174,1422
  orig 1435,1514
  echo '</style>'
} >> $F
```

说明：ORIG 1128–1143（`.sky-video`）已由 `ScrubVideoBackground` 接管；1153–1160（`.home-page.home-page--video`）留在 `index.vue`；1423–1433 `.ac404__sky` 是死代码不搬。

- [ ] **Step 6: 改 `index.vue` 接入**

在 `index.vue` 中：

1. 模板：把 `<!-- 天空背景容器 -->` 到草坡 `<div class="grass-hills">…</div>` 结束（ORIG 3–69）整段替换为：

```vue
    <!-- 天空层：一日推移视频 + CSS 替身背景 -->
    <HomeSky v-model:video-active="videoActive" :period="currentTimePeriod" :video-time="targetVideoTime" />
```

2. script：删除 `/* ---- 一日推移背景视频（滚动擦洗）---- */` 到 `onVideoFail` 结束（ORIG 624–766）；`onMounted` 里删除 `updateClock(); clockTimer = setInterval(...)` 和整个 `showVideo` 判定与 `addEventListener` 块（ORIG 811–823）；删除 `onUnmounted` 整段（ORIG 834–840）；从 `vue` 的 import 里去掉 `onUnmounted`。在 `brandName` 之后加：

```ts
const {
  videoActive,
  currentTimePeriod,
  timePeriodName,
  timePeriodIcon,
  formattedTime,
  isNightView,
  dayNightTitle,
  toggleDayNight,
  targetVideoTime,
} = useDayCycle();
```

并在 import 区追加：

```ts
import { useDayCycle } from "./day-cycle";
import HomeSky from "./components/HomeSky.vue";
```

3. style：删除 `.home-page--night` 块内的 `.sky { … }`（ORIG 1001–1003）；删除 `// 慢动天空层` 到 `.home-page--video .sky::after {…}`（ORIG 1121–1152）；删除 `// 视频接管后…` 到 `// 2. 裸眼 3D` 分块的草坡 keyframes 结束（ORIG 1161–1514），**保留** `.home-page.home-page--video { background: none; }` 及其上方 4 行注释（ORIG 1154–1160）。

- [ ] **Step 7: 验证并提交**

```bash
cd app && pnpm run type-check && pnpm run build-only && pnpm eslint src/composables/useScrollProgress.ts src/composables/index.ts src/components/ScrubVideoBackground/index.vue src/views/home/day-cycle.ts src/views/home/components/HomeSky.vue src/views/home/index.vue
grep -n "showVideo\|videoEl\|onVideoReady\|onVideoFail\|tickVideo" src/views/home/index.vue
```

期望：前三条通过；grep 无输出。

```bash
cd .. && git add app/src/composables app/src/components/ScrubVideoBackground app/src/views/home
git commit -m "refactor: 抽出首页天空层与可复用的滚动擦洗视频背景"
```

---

### Task 3: 共用样式 + 导航

**Files:**
- Create: `app/src/views/home/styles/_shared.scss`
- Create: `app/src/views/home/styles/_hero.scss`
- Create: `app/src/views/home/scroll-to-section.ts`
- Create: `app/src/views/home/components/HomeNav.vue`
- Modify: `app/src/views/home/index.vue`

**Interfaces:**
- Consumes: Task 2 的 `useDayCycle()` 返回值
- Produces:
  - `@use "../styles/shared";`（按钮 `.btn-ai*`、标题组 `.section*`）
  - `@use "../styles/hero";`（两套 hero 共用布局）
  - `scrollToSection(id: string): void`
  - `<HomeNav :brand-name :logged-in :period-name :period-icon :clock :is-night :day-night-title @toggle-day-night>`

- [ ] **Step 1: `_shared.scss`**

```bash
F=app/src/views/home/styles/_shared.scss
mkdir -p app/src/views/home/styles
{
  echo '// 首页共用：拟物按钮、section 标题组。需要的组件各自 @use。'
  echo
  echo '.home-page--night .section-title {'
  echo '  color: #fffdec !important;'
  echo '}'
  echo
  orig 1822,1918
  orig 2198,2220
  cat <<'EOF'
.section-title {
  margin: 6px 0 0;
  font-size: 34px;
  font-weight: 900;
  color: var(--ai-text);
  letter-spacing: -0.02em;
}

EOF
  orig 2243,2243
} > $F
```

说明：ORIG 2227–2240 嵌在 `.section-title` 里的 `&--pink {…}` 一组是死代码，不搬。

- [ ] **Step 2: `_hero.scss`**

```bash
F=app/src/views/home/styles/_hero.scss
{
  echo '// 已登录 / 未登录两套 hero 共用的布局'
  echo
  cat <<'EOF'
.home-page--night .hero-sub {
  color: #fffdec !important;
}

.home-page--night .hero-sub b {
  color: #3dd4c6 !important;
}

.home-page--night .hero-tag {
  background: #1c274c;
  color: var(--ai-primary);
}

EOF
  orig 1919,1991
  cat <<'EOF'
@media (max-width: 900px) {
  .hero-grid { grid-template-columns: 1fr; gap: 40px; }
}
EOF
} > $F
```

- [ ] **Step 3: `scroll-to-section.ts`**

```bash
F=app/src/views/home/scroll-to-section.ts
{
  echo '/** 平滑滚到首页某个 section，并同步导航栏高亮 */'
  orig 855,871 | sed 's/^const scrollToSection = /export const scrollToSection = /' | sed 's/(id: string) =>/(id: string): void =>/'
} > $F
cat $F
```

期望：文件以 `export const scrollToSection = (id: string): void => {` 开头，函数体与 ORIG 855–871 一致。

- [ ] **Step 4: `HomeNav.vue`**

```bash
F=app/src/views/home/components/HomeNav.vue
{
  echo '<!-- 首页导航栏 -->'
  echo '<template>'
  orig 72,150 | sed 's/^  //' \
    | sed 's/timePeriodName/periodName/g; s/timePeriodIcon/periodIcon/g; s/formattedTime/clock/g; s/isNightView/isNight/g; s/isLoggedIn/loggedIn/g' \
    | sed "s/@click=\"toggleDayNight\"/@click=\"emit('toggle-day-night')\"/"
  echo '</template>'
  cat <<'EOF'

<script setup lang="ts">
import { scrollToSection } from "../scroll-to-section";

defineOptions({ name: "HomeNav" });

defineProps<{
  brandName: string;
  loggedIn: boolean;
  periodName: string;
  periodIcon: string;
  clock: string;
  isNight: boolean;
  dayNightTitle: string;
}>();
const emit = defineEmits<{ "toggle-day-night": [] }>();
</script>

<style scoped lang="scss">
@use "../styles/shared";

.home-page--night .nav {
  background: rgba(21, 30, 63, 0.85);
  border-bottom-color: #2c3859;
}

.home-page--night .brand-text {
  color: #fffdec !important;
}

.home-page--night .nav-clock {
  background: #1c274c;
  border-color: #2c3859;
  color: #fffdec;
}

.home-page--night .nav-daynight {
  border-color: #2c3859;
}

// 这两个 chip 的底是硬编码 #ffffff，夜间文字跟着 --ai-text 翻成近白就没了。
// 按 .nav-clock 的既有夜间做法改成深色 chip。
.home-page--night .nav-link-active {
  background: #1c274c;
  border-color: #2c3859;
  color: #fffdec;
}

EOF
  orig 1515,1821
  cat <<'EOF'
@media (max-width: 900px) {
  .nav { padding: 12px 20px; gap: 12px; }
  .nav-links { display: none; }
}
</style>
EOF
} > $F
grep -nE "timePeriod|formattedTime|isNightView|isLoggedIn|toggleDayNight" $F
```

期望：grep 无输出。

- [ ] **Step 5: 改 `index.vue`**

1. 模板：`<!-- 导航栏 -->` 下的 `<nav class="nav">…</nav>`（ORIG 72–150）替换为：

```vue
    <HomeNav
      :brand-name="brandName"
      :logged-in="isLoggedIn"
      :period-name="timePeriodName"
      :period-icon="timePeriodIcon"
      :clock="formattedTime"
      :is-night="isNightView"
      :day-night-title="dayNightTitle"
      @toggle-day-night="toggleDayNight"
    />
```

2. 模板：未登录 hero 里的 `@click="scrollToSection('modules')"` 暂时保留（Task 4 搬走）。script：删除 `const scrollToSection = …`（ORIG 855–871），改为 `import { scrollToSection } from "./scroll-to-section";`；追加 `import HomeNav from "./components/HomeNav.vue";`。
3. style：在 `<style>` 首行加 `@use "./styles/shared";` 和 `@use "./styles/hero";`；`.home-page--night` 块内删除 `.nav`、`.brand-text, .hero-sub, .section-title` 组、`.hero-sub b`、`.nav-clock`、`.nav-daynight`、`.nav-link-active`（含其上两行注释）、`.hero-tag` 七条；删除 `// 3. 顶栏导航` 分块头到 `.nav-spacer { flex: 1; }`（ORIG 1515–1821）；删除 `// 4. 按钮样式` 分块（ORIG 1822–1918）；删除 `// 5. 主体视觉 Hero 模块` 分块头到 `.hero-actions {…}`（ORIG 1919–1991）；删除 `// 7.` 分块头到 `.section-sub` 行（ORIG 2195–2243）；在 `@media (max-width: 900px)` 里删除 `.hero-grid`、`.nav`、`.nav-links` 三行。

- [ ] **Step 6: 验证并提交**

```bash
cd app && pnpm run type-check && pnpm run build-only && pnpm eslint src/views/home/scroll-to-section.ts src/views/home/components/HomeNav.vue src/views/home/index.vue
cd .. && git add app/src/views/home
git commit -m "refactor: 抽出首页导航与共用样式"
```

---

### Task 4: hero 组（HeroIsland / HeroAvatar / HeroCounter / HomeKpiStrip）

**Files:**
- Create: `app/src/views/home/components/HeroAvatar.vue`
- Create: `app/src/views/home/components/HeroIsland.vue`
- Create: `app/src/views/home/components/HeroCounter.vue`
- Create: `app/src/views/home/components/HomeKpiStrip.vue`
- Modify: `app/src/views/home/index.vue`

**Interfaces:**
- Consumes: `_shared.scss`、`_hero.scss`、`scrollToSection`
- Produces:
  - `<HeroAvatar :avatar-src :nickname :stat-words :stat-streak>`
  - `<HeroIsland :avatar-src :nickname :stat-words :stat-streak>`
  - `<HeroCounter>`（无 props）
  - `<HomeKpiStrip :stats>`，`stats: { words: string; logs: string; streak: string; peak: string }`

- [ ] **Step 1: `HeroAvatar.vue`**

```bash
F=app/src/views/home/components/HeroAvatar.vue
{
  echo '<!-- 首页岛主头像区（头像、名牌、气球、化石徽章、叶子装饰） -->'
  echo '<template>'
  orig 179,235 | sed 's/^      //'
  echo '</template>'
  cat <<'EOF'

<script setup lang="ts">
defineOptions({ name: "HeroAvatar" });

defineProps<{ avatarSrc: string; nickname: string; statWords: string; statStreak: string }>();
</script>

<style scoped lang="scss">
EOF
  orig 1992,1996
  echo
  orig 1998,2135
  echo '</style>'
} > $F
```

- [ ] **Step 2: `HeroIsland.vue`**

```bash
F=app/src/views/home/components/HeroIsland.vue
{
  echo '<!-- 首页已登录 hero -->'
  echo '<template>'
  orig 153,177 | sed 's/^  //' | sed 's/<section v-if="isLoggedIn" id="hero"/<section id="hero"/'
  echo '      <HeroAvatar :avatar-src="avatarSrc" :nickname="nickname" :stat-words="statWords" :stat-streak="statStreak" />'
  orig 236,237 | sed 's/^  //'
  echo '</template>'
  cat <<'EOF'

<script setup lang="ts">
import HeroAvatar from "./HeroAvatar.vue";

defineOptions({ name: "HeroIsland" });

defineProps<{ avatarSrc: string; nickname: string; statWords: string; statStreak: string }>();
</script>

<style scoped lang="scss">
@use "../styles/shared";
@use "../styles/hero";
</style>
EOF
} > $F
head -4 $F
```

期望：第 3 行为 `  <section id="hero" class="hero">`。

- [ ] **Step 3: `HeroCounter.vue`**

```bash
F=app/src/views/home/components/HeroCounter.vue
{
  echo '<!-- 首页未登录 hero（移居柜台） -->'
  echo '<template>'
  orig 240,313 | sed 's/^  //' | sed 's/<section v-else id="hero"/<section id="hero"/'
  echo '</template>'
  cat <<'EOF'

<script setup lang="ts">
import { scrollToSection } from "../scroll-to-section";

defineOptions({ name: "HeroCounter" });
</script>

<style scoped lang="scss">
@use "../styles/shared";
@use "../styles/hero";

EOF
  orig 1992,1996
  echo
  orig 2666,2923
  cat <<'EOF'

@media (max-width: 768px) {
  .nook-bubble--tommy {
    display: none;
  }
}
</style>
EOF
} > $F
```

- [ ] **Step 4: `HomeKpiStrip.vue`**

```bash
F=app/src/views/home/components/HomeKpiStrip.vue
{
  echo '<!-- 首页岛民广播 KPI 条 -->'
  echo '<template>'
  orig 316,353 | sed 's/^  //' | sed 's/<div v-if="isLoggedIn" class="hero-stats">/<div class="hero-stats">/' \
    | sed 's/{{ statWords }}/{{ stats.words }}/; s/{{ statLogs }}/{{ stats.logs }}/; s/{{ statStreak }}/{{ stats.streak }}/; s/{{ statPeak }}/{{ stats.peak }}/'
  echo '</template>'
  cat <<'EOF'

<script setup lang="ts">
defineOptions({ name: "HomeKpiStrip" });

defineProps<{ stats: { words: string; logs: string; streak: string; peak: string } }>();
</script>

<style scoped lang="scss">
.home-page--night .stat {
  background: #1c274c;
  border-color: #2c3859;
}

.home-page--night .stat-num {
  color: #fffdec;
}

EOF
  orig 2137,2193
  cat <<'EOF'

@media (max-width: 1200px) {
  .hero-stats { grid-template-columns: repeat(2, 1fr); }
}
</style>
EOF
} > $F
grep -n "stat[A-Z]" $F
```

期望：grep 无输出。

- [ ] **Step 5: 改 `index.vue`**

1. 模板：两个 hero `<section>`（ORIG 152–313，含注释）替换为：

```vue
    <!-- 主视觉 Hero：已登录展示个人小岛概览，未登录展示移居办理柜台 -->
    <HeroIsland
      v-if="isLoggedIn"
      :avatar-src="avatarSrc"
      :nickname="nickname"
      :stat-words="statWords"
      :stat-streak="statStreak"
    />
    <HeroCounter v-else />
```

   KPI 条（ORIG 315–353，含注释）替换为：

```vue
    <!-- 岛民广播属性统计面板 (仅在已登录状态展示) -->
    <HomeKpiStrip v-if="isLoggedIn" :stats="stats" />
```

2. script：在 `statPeak` 之后加：

```ts
const stats = computed(() => ({
  words: statWords.value,
  logs: statLogs.value,
  streak: statStreak.value,
  peak: statPeak.value,
}));
```

   删除 `import { scrollToSection } …`（首页根已不再使用）；追加三个组件的 import：

```ts
import HeroIsland from "./components/HeroIsland.vue";
import HeroCounter from "./components/HeroCounter.vue";
import HomeKpiStrip from "./components/HomeKpiStrip.vue";
```

3. style：删除首行 `@use "./styles/hero";`；`.home-page--night` 块内删除 `.stat`、`.stat-num` 两条；删除 `.hero-avatar-wrap` 到 `.deco-leaf-2`（ORIG 1992–2135）；删除 `// 6.` 分块（ORIG 2137–2193）；删除 `// 11.` 分块（ORIG 2666–2923）；`@media (max-width: 1200px)` 里删除 `.hero-stats` 行；`@media (max-width: 768px)` 里删除 `.nook-bubble--tommy` 规则。

- [ ] **Step 6: 验证并提交**

```bash
cd app && pnpm run type-check && pnpm run build-only && pnpm eslint src/views/home/components/HeroAvatar.vue src/views/home/components/HeroIsland.vue src/views/home/components/HeroCounter.vue src/views/home/components/HomeKpiStrip.vue src/views/home/index.vue
cd .. && git add app/src/views/home
git commit -m "refactor: 抽出首页 hero、头像区与 KPI 条"
```

---

### Task 5: 模块格子（合并两套模板）

**Files:**
- Create: `app/src/views/home/home-modules.ts`
- Create: `app/src/views/home/components/HomeModules.vue`
- Modify: `app/src/views/home/index.vue`

**Interfaces:**
- Produces:
  - `export interface HomeModule { key: string; color: string; tag: string; title: string; sub: string; icon: string }`
  - `export const modules: HomeModule[]`、`export const unauthModules: HomeModule[]`
  - `<HomeModules :logged-in @select="(key: string) => …">`

- [ ] **Step 1: `home-modules.ts`**

```bash
F=app/src/views/home/home-modules.ts
{
  cat <<'EOF'
/** 首页背包格子的入口 */
export interface HomeModule {
  key: string;
  color: string;
  tag: string;
  title: string;
  sub: string;
  icon: string;
}

EOF
  orig 873,893 | sed 's/^const unauthModules = \[/export const unauthModules: HomeModule[] = [/; s/^const modules = \[/export const modules: HomeModule[] = [/'
} > $F
grep -n "^export const" $F
```

期望：两行 `export const`。

- [ ] **Step 2: `HomeModules.vue`**

```bash
F=app/src/views/home/components/HomeModules.vue
{
  cat <<'EOF'
<!-- 首页模块格子：已登录为背包格子，未登录为生态推荐手册 -->
<template>
  <section id="modules" class="section">
    <div>
      <div class="section-head">
        <div>
          <div class="section-eyebrow">{{ head.eyebrow }}</div>
          <h2 class="section-title">{{ head.title }}</h2>
        </div>
        <p class="section-sub">{{ head.sub }}</p>
      </div>

      <div class="modules-pocket">
        <div v-for="mod in list" :key="mod.key" class="pocket-slot" :class="'pocket-slot--' + mod.color" @click="emit('select', mod.key)">
          <!-- 背包格子的圆圈标记角标 -->
          <span class="pocket-slot-tag">{{ mod.tag }}</span>

          <div class="pocket-slot-ico-wrap">
            <div class="pocket-slot-ico">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path :d="mod.icon" />
              </svg>
            </div>
          </div>
          <div class="pocket-slot-title">{{ mod.title }}</div>
          <div class="pocket-slot-sub">{{ mod.sub }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { modules, unauthModules } from "../home-modules";

defineOptions({ name: "HomeModules" });

const props = defineProps<{ loggedIn: boolean }>();
const emit = defineEmits<{ select: [key: string] }>();

const head = computed(() =>
  props.loggedIn
    ? {
        eyebrow: "MODULES · 岛屿口袋",
        title: "我的背包格子 (Pocket Slots)",
        sub: "小岛里的常用入口，化为随身背包里的各种神奇道具，点击即可掏出使用。",
      }
    : {
        eyebrow: "HIGHLIGHTS · 岛屿生态手册",
        title: "小岛推荐指南 (Getaway Highlights)",
        sub: "Nook 移居计划官方倾情推荐，为您全方位展示博客小岛的悠闲生活与核心建设生态。",
      }
);
const list = computed(() => (props.loggedIn ? modules : unauthModules));
</script>

<style scoped lang="scss">
@use "../styles/shared";

.home-page--night .pocket-slot {
  background: rgba(28, 39, 76, 0.85);
  border-color: #2c3859;

  &:hover {
    background: #1c274c;
  }
}

EOF
  orig 2245,2372
  cat <<'EOF'

@media (max-width: 1200px) {
  .modules-pocket { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 900px) {
  .modules-pocket { grid-template-columns: repeat(2, 1fr); }
}
</style>
EOF
} > $F
```

对照 ORIG 358–363、385–390 核对两套标题组文案逐字一致（含全角标点）。

- [ ] **Step 3: 改 `index.vue`**

1. 模板：`<!-- 模块区 … -->` 注释与 `<section id="modules">…</section>`（ORIG 355–410）替换为：

```vue
    <!-- 模块区：已登录展示“玩家背包栏 Grid”，未登录展示“小岛生态推荐手册 Highlights” -->
    <HomeModules :logged-in="isLoggedIn" @select="handleModuleClick" />
```

2. script：删除 `unauthModules`、`modules` 两个数组（ORIG 873–893）；追加 `import HomeModules from "./components/HomeModules.vue";`。
3. style：`.home-page--night` 块内删除 `.pocket-slot` 规则；删除 `.modules-pocket` 到 `.pocket-slot--mint` 行（ORIG 2245–2372）；两个 `@media` 里删除 `.modules-pocket` 行。

- [ ] **Step 4: 验证并提交**

```bash
cd app && pnpm run type-check && pnpm run build-only && pnpm eslint src/views/home/home-modules.ts src/views/home/components/HomeModules.vue src/views/home/index.vue
cd .. && git add app/src/views/home
git commit -m "refactor: 抽出首页模块格子并合并登录前后两套模板"
```

---

### Task 6: 岛民证、告示板、帐篷页脚，收尾 index.vue

**Files:**
- Create: `app/src/views/home/components/IslandPassport.vue`
- Create: `app/src/views/home/components/BulletinBoard.vue`
- Create: `app/src/views/home/components/HomeCampFooter.vue`
- Modify: `app/src/views/home/index.vue`

**Interfaces:**
- Produces:
  - `<IslandPassport :brand-name :nickname :avatar-src>`
  - `<BulletinBoard>`（无 props）
  - `<HomeCampFooter :logged-in :nickname>`

- [ ] **Step 1: `IslandPassport.vue`**

```bash
F=app/src/views/home/components/IslandPassport.vue
{
  echo '<!-- 首页岛民证（已登录） -->'
  echo '<template>'
  orig 424,492 | sed 's/^        //'
  echo '</template>'
  echo
  echo '<script setup lang="ts">'
  echo 'import { computed } from "vue";'
  echo
  echo 'defineOptions({ name: "IslandPassport" });'
  echo
  echo 'const props = defineProps<{ brandName: string; nickname: string; avatarSrc: string }>();'
  echo
  orig 768,794 | sed 's/nickname\.value/props.nickname/g'
  cat <<'EOF'
</script>

<style scoped lang="scss">
.home-page--night .ac-passport {
  background: #1c274c;
  border-color: var(--ai-outline);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.home-page--night .ac-passport__header {
  background: linear-gradient(180deg, #24355a 0%, #1c274c 100%);
  border-bottom-color: rgba(255, 255, 255, 0.1);

  .ac-passport__stamp-dodo {
    border-color: rgba(61, 212, 198, 0.7);
    color: #3dd4c6;
  }
}

.home-page--night .ac-passport__card {
  background: #1e2836;
  border-color: var(--ai-outline);
}

.home-page--night .ac-passport__details .label {
  color: rgba(255, 255, 255, 0.35);
}

.home-page--night .ac-passport__details .value {
  color: #fffdec;
}

EOF
  orig 2383,2555
  cat <<'EOF'

@media (max-width: 900px) {
  .ac-passport {
    border-radius: 24px;
  }

  .ac-passport__card {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .ac-passport__photo {
    width: 150px;
    height: 150px;
  }

  .ac-passport__header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .ac-passport__stamp-dodo {
    align-self: flex-end;
  }
}
</style>
EOF
} > $F
grep -n "nickname\.value\|isLoggedIn" $F
```

期望：grep 无输出。对照 ORIG 1077–1104 核对夜间五条规则逐字一致，对照 ORIG 2641–2663 核对响应式块逐字一致。

- [ ] **Step 2: `BulletinBoard.vue`**

```bash
F=app/src/views/home/components/BulletinBoard.vue
{
  echo '<!-- 首页大头针告示板（未登录） -->'
  echo '<template>'
  orig 507,540 | sed 's/^        //'
  echo '</template>'
  cat <<'EOF'

<script setup lang="ts">
defineOptions({ name: "BulletinBoard" });
</script>

<style scoped lang="scss">
EOF
  orig 2925,3050
  cat <<'EOF'

// 针对移动端的适配
@media (max-width: 768px) {
  .board-body {
    grid-template-columns: 1fr;
  }
  .sticky-tech, .sticky-recruit {
    transform: none;
  }
}
</style>
EOF
} > $F
```

- [ ] **Step 3: `HomeCampFooter.vue`**

```bash
F=app/src/views/home/components/HomeCampFooter.vue
{
  echo '<!-- 首页帐篷小山丘与页脚 -->'
  echo '<template>'
  echo '  <div class="home-camp-footer">'
  orig 545,592 | sed 's/isLoggedIn/loggedIn/g'
  echo '  </div>'
  echo '</template>'
  cat <<'EOF'

<script setup lang="ts">
defineOptions({ name: "HomeCampFooter" });

defineProps<{ loggedIn: boolean; nickname: string }>();
</script>

<style scoped lang="scss">
@use "../styles/shared";

// 包裹层不产生盒子，帐篷区与页脚仍是页面根的直接布局子项
.home-camp-footer {
  display: contents;
}

.home-page--night .island-inner {
  background: linear-gradient(180deg, #1c274c 0%, #151e3f 100%);
  border-color: #2c3859;
  box-shadow: 0 8px 0 0 #151d38;
}

.home-page--night .island-title {
  color: #fffdec;
}

.home-page--night .foot {
  color: rgba(255, 255, 255, 0.4);
}

EOF
  orig 2557,2624
  echo '</style>'
} > $F
grep -n "isLoggedIn" $F
```

期望：grep 无输出。

- [ ] **Step 4: 改 `index.vue` 并收尾**

1. 模板：`#about` 两个分支里的 `<div class="passport-container">` 内部内容分别替换为 `<IslandPassport :brand-name="brandName" :nickname="nickname" :avatar-src="avatarSrc" />` 与 `<BulletinBoard />`（外层 `section#about`、两个分支 div、标题组、`.passport-container` 保留）；`<!-- 尾部露营帐篷小山丘交互条 -->` 到 `</footer>`（ORIG 545–592）替换为：

```vue
    <!-- 尾部露营帐篷小山丘与页脚 -->
    <HomeCampFooter :logged-in="isLoggedIn" :nickname="nickname" />
```

2. script：删除 `/* ---- 动态哈希特产水果与胶囊称号生成 ---- */` 整段（ORIG 768–794）；追加三个组件 import。
3. style：`.home-page--night` 块内删除剩下的 `.about-card`、`.about-list-row span:last-child`（死代码）、`.ac-passport`、`.ac-passport__header`、`.ac-passport__card`、`.ac-passport__details .label`、`.ac-passport__details .value`、`.island-inner`、`.island-title`、`.foot`；删除 `.ac-passport` 到 `.title-pill`（ORIG 2383–2555）；删除 `// 9.` 分块（ORIG 2557–2624）；删除 `// 10. 响应式适配` 分块剩余内容；删除 `// 12.` 分块与末尾 `@media (max-width: 768px)`。

- [ ] **Step 5: 核对 `index.vue` 的最终形态**

`index.vue` 的 `<style>` 此时应只剩：

```text
@use "./styles/shared";
ORIG 897–998（.home-page token、四个时段根类、夜间 token 与根背景）
}                              ← .home-page--night 块的闭合，块内已无逐元素规则
ORIG 1154–1160（.home-page.home-page--video）
ORIG 2377–2381（.passport-container）
```

逐项核对：

```bash
cd app/src/views/home
wc -l index.vue
awk '/<style/,/<\/style>/' index.vue | grep -nE "^\s{2}\.[a-z]" | head
grep -nE "components/" index.vue
```

期望：`wc` 约 300–400 行；第二条无输出（`.home-page--night` 块内不再有逐元素规则）；第三条列出 9 行组件 import：HomeSky、HomeNav、HeroIsland、HeroCounter、HomeKpiStrip、HomeModules、IslandPassport、BulletinBoard、HomeCampFooter（HeroAvatar 由 HeroIsland 引入，不在此列）。

- [ ] **Step 6: 验证并提交**

```bash
cd /Volumes/AgentAPFS/Program/Personal/blog/blog-ui-vue3/app && pnpm run type-check && pnpm run build-only && pnpm eslint src/views/home
cd .. && git add app/src/views/home
git commit -m "refactor: 抽出首页岛民证、告示板与帐篷页脚"
```

---

### Task 7: 远端同步与等值校验

**Files:** 视校验结果修正 `app/src/views/home/**`、`app/src/components/ScrubVideoBackground/index.vue`。

- [ ] **Step 1: 清理 `._*` 并同步**

```bash
cd /Volumes/AgentAPFS/Program/Personal/blog/blog-ui-vue3
find . -name '._*' -not -path './app/node_modules/*' -delete
rsync -avz --exclude='._*' --exclude='node_modules' --exclude='dist' --exclude='.vite' --exclude='.pnpm-store' --exclude='.env*' --exclude='.git' \
  app/src/ ubuntu@10.10.9.184:/data/personal/projects/blog-ui-vue3/app/src/
```

期望：只传输 `src/` 下的改动文件。远端 Vite 开发服务会热更新，无需重启容器。

- [ ] **Step 2: 确认页面正常加载**

用内置浏览器打开 `http://10.10.9.184:8083/`，`read_console_messages` 只看 error。期望：无 Vue 编译或运行时报错。

- [ ] **Step 3: 逐组合比对**

对 Task 1 的 9 个组合，按相同视口、登录状态、时段钉住方式复现（本次先采已登录 5 组，再请用户登出采未登录 4 组），每组执行（`homeFingerprint` 函数同 Task 1 Step 3，完整带上）：

```js
const base = JSON.parse(localStorage.getItem("home-fp:" + COMBO));
const now = await homeFingerprint();
const diffs = [];
for (let i = 0; i < Math.max(base.length, now.length); i++) {
  const b = base[i], n = now[i];
  if (!b || !n || b.split("\t")[1] !== n.split("\t")[1] || n.includes("MISSING")) diffs.push([i, b, n]);
}
JSON.stringify({ base: base.length, now: now.length, diffs: diffs.slice(0, 20) });
```

期望：`base === now` 且 `diffs` 为空。视频组合需先按 Task 1 Step 6 等视频就绪、滚到 70%。

已知可接受的差异：已登录组合里 KPI 数值若在两次采集之间被新日志改变，`.stat-num` / 气球 / 化石徽章的文本哈希会不同；逐条核对只是数字变化即可放行。

- [ ] **Step 4: 处理差异**

`diffs` 不为空时，按下标在页面里定位元素：

```js
const els = []; const walk = (el) => { if (getComputedStyle(el).display !== "contents") els.push(el); for (const c of el.children) walk(c); };
walk(document.querySelector(".home-page"));
els[INDEX].outerHTML.slice(0, 300);
```

对照原规则找原因（常见：某条规则没搬、夜间规则漏搬、同特异性规则的先后顺序变了、`@keyframes` 缺失），修正后回到 Step 1 重新同步、重新比对该组合。每修一类问题单独提交：

```bash
git add app/src && git commit -m "refactor: 修正首页拆分后<具体元素>的样式差异"
```

同一类差异修两轮仍不能消除，停下向用户报告已查明的事实与下一步方案。

- [ ] **Step 5: 截图复核**

已登录白天桌面、已登录星夜桌面、未登录白天手机三张截图，发给用户肉眼复核。

- [ ] **Step 6: Review Focus 行为核对**

已登录、桌面、刷新页面、等视频就绪：

1. 点昼夜开关切到星夜，等 3 秒：

```js
document.querySelector("video").currentTime;
```

   期望：落在 16.8–19.5 之间。
2. 离开再回来：导航到 `/login` 再回到 `/`，`read_console_messages` 无 error；滚动页面，视频仍随滚动擦洗。
3. 视频失败回退：

```js
document.querySelector("video").dispatchEvent(new Event("error"));
await new Promise((r) => setTimeout(r, 300));
[!!document.querySelector("video"), document.querySelector(".home-page").classList.contains("home-page--video"), getComputedStyle(document.querySelector(".cloud")).display];
```

   期望：`[false, false, "block"]` 或云的非 `none` 显示值。

- [ ] **Step 7: 清理基线**

```js
Object.keys(localStorage).filter((k) => k.startsWith("home-fp:")).forEach((k) => localStorage.removeItem(k));
```

---

### Task 8: 交付

- [ ] **Step 1: 自查整条分支的改动**

```bash
cd /Volumes/AgentAPFS/Program/Personal/blog/blog-ui-vue3
git diff --stat main...refactor/home-split
```

期望：只涉及 `app/src/views/home/**`、`app/src/components/ScrubVideoBackground/`、`app/src/composables/useScrollProgress.ts`、`app/src/composables/index.ts`、`docs/specs/2026-09-28-home-split-design.md`、`docs/plans/2026-09-28-home-split.md`。

- [ ] **Step 2: 确认后走默认交付流程**

向用户确认「是否按默认交付流程继续」，同意后：推送分支 → 创建中文 PR（标题 `refactor: 首页拆分与视频背景组件化`，正文写拆分结构、清理的死代码、等值校验结果）→ 等 CI（type-check、build-only）通过 → 本地合并到 `main` → 推送 `main` → 远端 `blog-ui-vue3` 同步到最新 `main` 并再次确认首页无报错。
