# 首页夜间主题 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 claude.ai/design「夜晚模板」的首页那一屏落地到 `blog-ui-vue3` 首页，昼间外观零变化，首页以外零改动。

**Architecture:** 先把首页 `<style>` 块里参与昼夜的颜色字面值抽成 CSS 变量（昼间取值 = 现值，属可证明的等值重构），再在首页已有的 `.home-page--night` 块里覆盖这些变量，最后补 4 个夜景动效。不新增主题机制、不碰 `theme.ts`、不碰全局 `:root`——作用域由 `.home-page--night` 这棵 DOM 子树物理锁死。

**Tech Stack:** Vue 3.5 `<script setup>` + SCSS scoped style + Vite 8 + pnpm。设计源：`夜晚模板.dc.html`（claude.ai/design 项目 `b5a3fdf1-7256-4388-916d-00d52002a324`）。Spec：`docs/specs/2026-08-08-home-night-theme-design.md`。

## Global Constraints

- 唯一可改的源码文件是 `app/src/views/home/index.vue`。任何任务结束时 `git diff --name-only origin/main` 只允许出现该文件 + `docs/` 下本计划与 spec。
- **禁止修改** `app/src/styles/_system-management.scss` 的全局 `:root`、`app/src/utils/theme.ts`、`app/src/enums`。
- **禁止修改** `updateClock()` 的时段阈值（`index.vue:588-596`，night = 19–05）。
- **禁止修改** 首页 template 的 section 顺序与既有 DOM 结构；只允许在 `.sky` 容器内新增夜景元素。
- 只改 `<style lang="scss" scoped>` 块内（`index.vue:712` 之后）的颜色。**template 里 inline SVG 的 `fill=` / `stroke=` 属性一律不动**（那是装饰插画，且 `#794f27` 在 template 中另有 16 处，全部属于此类）。唯一例外是 Task 2 的云朵 `fill`。
- 新增 CSS 类名一律加 `night-` 前缀，规避 UnoCSS 工具类撞名（见 `lessons.md` 2026-06-09）。
- 新增动画只允许使用 `transform` 与 `opacity`。
- 本仓库**没有任何前端测试框架**（`package.json` 无 vitest/jest/playwright），本计划不引入——为一次视觉主题改动搭测试基建属于过度设计。验证手段见每个任务的「验证」步骤：`pnpm type-check`、`pnpm build-only`、`pnpm lint:stylelint`，加上机械的 `git diff` 值核对。
- 所有命令在 `blog-ui-vue3/app/` 下执行。
- 分支：`feature/home-night-theme`（已创建）。

---

### Task 1: 抽出 8 个通用 `--ai-*` token（昼间等值重构）

**Files:**
- Modify: `app/src/views/home/index.vue`（`<style>` 块，`:712` 之后）

**Interfaces:**
- Produces: `.home-page` 上定义的 8 个 CSS 变量，Task 3 会在 `.home-page--night` 覆盖它们。

**关键陷阱 —— 先读这段再动手。** `#794f27` 在 style 块内出现 59 次，但它同时承担**两种相反语义**：

| 属性 | 次数 | 应替换为 | 夜间走向 |
|---|---|---|---|
| `color:` | 23 | `var(--ai-text)` | 变浅（`#fffdec`） |
| `border:` `border-color:` `border-bottom:` `box-shadow:` `text-shadow:` | 36 | `var(--ai-outline)` | 变深（`#0f1731`） |

**一律不要对 `#794f27` 做全局 sed。** 盲替换成 `--ai-outline` 会让夜间文字变成近黑色、在深蓝底上完全不可见。必须按属性名逐条判断。

`text-shadow` 容易被漏掉：hero 主标题 `.hero-title`（`index.vue:1257-1260`）用四层 `text-shadow` 堆出动森的立体描边，其中 2 层是 `#794f27`，且写成多行。Step 5 的脚本按「整条声明」匹配，能一次覆盖同一声明里的多处。

- [ ] **Step 1: 确认起始状态**

```bash
cd blog-ui-vue3/app
git rev-parse --abbrev-ref HEAD   # 期望 feature/home-night-theme
git status --porcelain            # 期望 src/ 下无改动
```

- [ ] **Step 2: 在 `.home-page` 里加入 token 定义块**

把 `src/views/home/index.vue` 第 713-719 行的 `.home-page` 规则改成：

```scss
.home-page {
  // ── 昼夜 token（昼间值 = 抽取前的字面值，等值重构）────────────
  // 夜间覆盖见 .home-page--night
  --ai-text: #794f27;          // 正文/标题棕
  --ai-text-2: #9f927d;        // 次级文字
  --ai-primary: #19c8b9;       // 主题青
  --ai-primary-active: #11a89b;
  --ai-border: #e8e2d6;        // 浅描边
  --ai-outline: #794f27;       // 拟物粗描边（与 --ai-text 昼间同值、夜间相反）
  --ai-btn-face: #fffef6;      // 按钮/卡片面
  --ai-btn-shadow: #d4c9b4;    // 拟物投影
  --ai-shadow-color: #bdaea0;  // 柔和阴影

  position: relative;
  width: 100%;
  font-family: var(--el-font-family);
  user-select: none;
  transition: background 1.5s ease-in-out;
}
```

注意 `--ai-text` 与 `--ai-outline` 昼间同为 `#794f27` 是**故意**的——它们昼间不可区分，夜间才分岔。

- [ ] **Step 3: 替换 7 个无歧义的字面色**

这 7 个每个只有一种语义，可以在 `<style>` 块范围内直接全量替换。执行并核对次数：

```bash
cd blog-ui-vue3/app/src/views/home
# 只在 style 块（712 行之后）内替换
python3 - <<'PY'
import re
p = "index.vue"
src = open(p).read()
head, style = src[:src.index("<style lang=\"scss\" scoped>")], src[src.index("<style lang=\"scss\" scoped>"):]
pairs = [("#9f927d","var(--ai-text-2)"), ("#11a89b","var(--ai-primary-active)"),
         ("#19c8b9","var(--ai-primary)"), ("#e8e2d6","var(--ai-border)"),
         ("#fffef6","var(--ai-btn-face)"), ("#d4c9b4","var(--ai-btn-shadow)"),
         ("#bdaea0","var(--ai-shadow-color)")]
for lit, tok in pairs:
    n = style.count(lit)
    style = style.replace(lit, tok)
    print(f"{lit:10} -> {tok:28} {n} 处")
open(p,"w").write(head + style)
PY
```

期望输出（次数不符即说明文件已被改动过，停下来排查）：

```
#9f927d    -> var(--ai-text-2)              6 处
#11a89b    -> var(--ai-primary-active)      9 处
#19c8b9    -> var(--ai-primary)             8 处
#e8e2d6    -> var(--ai-border)              4 处
#fffef6    -> var(--ai-btn-face)            8 处
#d4c9b4    -> var(--ai-btn-shadow)          11 处
#bdaea0    -> var(--ai-shadow-color)        8 处
```

注意：Step 2 刚写进去的 token 定义块自身含这些字面值，会被一起替换成自引用（例如 `--ai-text-2: var(--ai-text-2)`）。**Step 4 修回来**。

- [ ] **Step 4: 修回 token 定义块的自引用**

Step 3 会把 `.home-page` 里 7 行 token 定义替换成自引用（`--ai-text-2: var(--ai-text-2);` 这种；`--ai-text` 与 `--ai-outline` 用的是 `#794f27`，不在 Step 3 的替换表里，不受影响）。把这 7 行改回字面值，内容与 Step 2 的代码块完全一致。改完执行下面这条，必须无输出：

```bash
grep -n -- "--ai-[a-z-]*: var(--ai-" src/views/home/index.vue
```

- [ ] **Step 5: 按属性替换 `#794f27`**

下面这段已在真实文件上干跑校验过，输出数字是实测值。它按**整条 CSS 声明**匹配（`^属性名 ... ;`），因此同一条 `text-shadow` 里的多处 `#794f27` 能一次替完。token 定义行以 `--ai-` 开头，不在属性白名单里，天然不会被误伤，无需额外保护。

```bash
cd blog-ui-vue3/app/src/views/home
python3 - <<'PY'
import re
p = "index.vue"
src = open(p).read()
i = src.index('<style lang="scss" scoped>')
head, style = src[:i], src[i:]
pat = re.compile(r"(?m)^(\s*)(color|border|border-color|border-bottom|box-shadow|text-shadow)(\s*:[^;]*;)")
n = {}
def repl(m):
    prop = m.group(2)
    tok = "var(--ai-text)" if prop == "color" else "var(--ai-outline)"
    body = m.group(3)
    c = body.count("#794f27")
    if c:
        n[tok] = n.get(tok, 0) + c
    return m.group(1) + prop + body.replace("#794f27", tok)
style = pat.sub(repl, style)
for k, v in sorted(n.items()):
    print(f"{k:22} {v} 处")
print("style 内剩余 #794f27:", style.count("#794f27"))
open(p, "w").write(head + style)
PY
grep -c "#794f27" index.vue   # 剩余应只有 template 里的 16 处 SVG 属性
```

期望输出：

```
var(--ai-outline)      36 处
var(--ai-text)         23 处
style 内剩余 #794f27: 0
```

最终 `grep -c` 为 `16`。若「style 内剩余」不是 0，`grep -n "#794f27" index.vue` 看剩下的落在哪——多半是某条声明用了白名单外的属性名，把它加进 `pat` 的属性列表再跑一次。

- [ ] **Step 6: 验证——昼间等值 + 构建通过**

```bash
cd blog-ui-vue3/app
pnpm type-check
pnpm build-only
pnpm exec stylelint "src/views/home/index.vue"
```

三条全过。然后做等值人工核对：

```bash
git diff -U0 src/views/home/index.vue | grep "^[-+]" | grep -v "^[-+][-+]" | head -80
```

逐条确认每个 `-` 行的字面值 == 对应 `+` 行所用 token 在 `.home-page` 里的昼间值。**只要有一条对不上就是回归。**

- [ ] **Step 7: 范围检查**

```bash
git status --porcelain   # 期望只有 M app/src/views/home/index.vue
git diff --stat app/src/styles/_system-management.scss app/src/utils/theme.ts   # 期望空输出
```

- [ ] **Step 8: 提交**

```bash
git add app/src/views/home/index.vue
git commit -m "refactor: 首页抽出 9 个昼夜 token，昼间取值不变"
```

---

### Task 2: 山丘 / 云朵 / 粒子的 token 化（含云朵 SVG 属性改造）

**Files:**
- Modify: `app/src/views/home/index.vue`（template `:17-25`、`:27-34`；style `.cloud` `:882-892`、`.particle` `:927-937`、`.grass-hill` `:960-980`）

**Interfaces:**
- Consumes: Task 1 在 `.home-page` 建立的 token 定义块（本任务往里追加 6 个 `--home-*`）。
- Produces: `--home-hill-back` `--home-hill-back-op` `--home-hill-front` `--home-hill-front-op` `--home-cloud-fill` `--home-particle-op`，Task 3 覆盖。

**为什么云朵要动 template：** 三片云的填充色 `fill="#fff"` 写在 SVG **presentation 属性**上（`index.vue:17,20,23`），不是 CSS 声明，CSS 变量驱动不了。必须删掉属性、改由 CSS `fill` 提供。CSS 的 `fill` 优先级高于 presentation 属性，但留着属性会让人误判来源，直接删干净。

- [ ] **Step 1: 往 Task 1 的 token 块追加 6 个 `--home-*`**

在 `.home-page` 的 `--ai-shadow-color` 那行之后插入：

```scss
  // ── 首页专有槽 ──────────────────────────────────────────
  --home-hill-back: #6fba2c;      // 后层山丘
  --home-hill-back-op: 0.45;
  --home-hill-front: #8ac68a;     // 前层山丘
  --home-hill-front-op: 0.65;
  --home-cloud-fill: #fff;        // 云朵填充
  --home-particle-op: 1;          // 飘落 🍃🌸 透明度
```

- [ ] **Step 2: 山丘改用 token**

把 `.grass-hill` 的 `&--back` / `&--front`（`index.vue:966-979`）改成：

```scss
  &--back {
    left: -10%;
    background: var(--home-hill-back);
    opacity: var(--home-hill-back-op);
    animation: ac-hill-wave 16s ease-in-out infinite alternate;
  }

  &--front {
    left: -8%;
    background: var(--home-hill-front);
    opacity: var(--home-hill-front-op);
    height: 170px;
    animation: ac-hill-wave-rev 12s ease-in-out infinite alternate;
  }
```

- [ ] **Step 3: 云朵——删 SVG 属性、改走 CSS**

template 中三处（`index.vue:17`、`:20`、`:23`）把 `fill="#fff"` 从 `<svg class="cloud ...">` 上删掉，其余属性不动。例如第 17 行：

```html
    <svg class="cloud cloud-1" viewBox="0 0 140 70">
```

再在 `.cloud` 规则（`index.vue:882`）里补一行 `fill`：

```scss
.cloud {
  position: fixed;
  z-index: -1;
  pointer-events: none;
  opacity: 0.8;
  fill: var(--home-cloud-fill);
  filter: drop-shadow(0 4px 0 rgba(0, 0, 0, 0.03));
}
```

- [ ] **Step 4: 粒子透明度改用 token**

`.particle`（`index.vue:927`）补一行 `opacity`：

```scss
.particle {
  position: absolute;
  font-size: 16px;
  opacity: var(--home-particle-op);
  animation: ac-particle-fall 14s linear infinite;
```

`--home-particle-op` 昼间为 `1`，等价于原来没写 `opacity`，昼间无变化。

- [ ] **Step 5: 验证**

```bash
cd blog-ui-vue3/app
pnpm type-check && pnpm build-only && pnpm exec stylelint "src/views/home/index.vue"
grep -c 'class="cloud[^"]*"[^>]*fill=' src/views/home/index.vue   # 期望 0
git status --porcelain -- app/src/                                 # 期望只有 M app/src/views/home/index.vue
```

`grep` 必须限定到 `class="cloud..."`。全文搜 `fill="#fff"` 会命中 template `:143` 那个装饰徽章 SVG 的星形路径——它按 Global Constraints 本就不该动，不是漏网。

stylelint 数量必须与基线**完全相等**（本仓库 `views/home/index.vue` 存量 201 个 `order/properties-order`，见 `lessons.md` 2026-06-10「CI 一律不挂 lint」）。基线测法：

```bash
git show HEAD:app/src/views/home/index.vue > src/views/home/_base_check.vue
pnpm exec stylelint "src/views/home/_base_check.vue" 2>&1 | tail -2
rm src/views/home/_base_check.vue
```

**不要跑 `--fix`**：它会重排整个文件的属性顺序，把 diff 炸开、掩盖真实改动。新增声明自己排对位置即可（本任务踩过一次：`fill` 必须写在 `filter` 之后）。

- [ ] **Step 6: 提交**

```bash
git add app/src/views/home/index.vue
git commit -m "refactor: 首页山丘/云朵/粒子改用 --home-* token"
```

---

### Task 3: `.home-page--night` 改写为 token 覆盖

**Files:**
- Modify: `app/src/views/home/index.vue`（`.home-page--night` 块，`:753-845`）

**Interfaces:**
- Consumes: Task 1 的 9 个 `--ai-*` + Task 2 的 6 个 `--home-*`。
- Produces: 完整的夜间配色，Task 4/5 的夜景元素在此基础上叠加。

**预期的夜间外观变化（这是本次要的，不是回归）：** 现有 `.home-page--night` 里 `.ac-passport { border-color: #794f27 }`、`.ac-passport__card { border-color: #794f27 }` 刻意在夜间保留了棕色描边。token 化后这两处跟随 `--ai-outline` 变成 `#0f1731`。spec 的约束是「昼间不变」，夜间本就在重设计范围内，此变化是预期的。

- [ ] **Step 1: 在 `.home-page--night` 顶部插入 token 覆盖**

把 `index.vue:753` 起的块头改成（保留其下所有既有规则，先不删）：

```scss
.home-page--night {
  // ── 夜间 token 覆盖（取值来自 夜晚模板.dc.html 的 [data-mode="night"]）──
  --ai-text: #fffdec;
  --ai-text-2: #a9b3d8;
  --ai-primary: #a5b4fc;
  --ai-primary-active: #8b9cf5;
  --ai-border: #2c3859;
  --ai-outline: #0f1731;
  --ai-btn-face: #223058;
  --ai-btn-shadow: #0a1024;
  --ai-shadow-color: #0b1123;

  --home-hill-back: #24406b;
  --home-hill-back-op: 1;      // 暗色山丘不能再压透明度，否则糊成一片
  --home-hill-front: #1a3054;
  --home-hill-front-op: 1;
  --home-cloud-fill: rgba(200, 210, 240, 0.35);
  --home-particle-op: 0.35;

  background: linear-gradient(180deg, #151e3f 0%, #213352 60%, #1e2836 100%);
  color: var(--ai-text);
```

- [ ] **Step 2: 删除已被 token 覆盖取代的冗余规则**

token 生效后，块内这些逐元素覆盖已经重复。**逐条删除并在删之前确认该元素的昼间规则确实已在 Task 1/2 里改成了 token**（`grep -n` 找到昼间规则看一眼）：

删除 `.stat`、`.nav-clock`、`.about-card`、`.pocket-slot`、`.ac-passport`、`.ac-passport__card`、`.island-inner` 这些块里**仅设置 `background` / `border-color` 且值等于对应夜间 token** 的声明。

**保留不动**的（它们不由本次 token 体系覆盖）：
- `.sky { background: radial-gradient(...) }` —— 时段专属光晕
- `.brand-text, .hero-sub, .section-title { color: #fffdec !important }` —— 带 `!important`，改动风险独立，本任务不碰
- `.hero-sub b { color: #3dd4c6 !important }` —— 同上
- `.ac-passport__details .label / .value`、`.foot`、`.about-list-row span:last-child` —— 用的是 `rgba(255,255,255,.x)` 语义，无对应 token
- `.island-inner` 的 `background: linear-gradient(...)` 与 `box-shadow` —— 渐变与投影不在 token 覆盖范围

删不准就保留。**冗余规则留着不会出错，删错会。**

- [ ] **Step 3: 验证**

```bash
cd blog-ui-vue3/app
pnpm type-check && pnpm build-only && pnpm exec stylelint "src/views/home/index.vue"
git status --porcelain
```

- [ ] **Step 4: 提交**

```bash
git add app/src/views/home/index.vue
git commit -m "feat: 首页夜间态改用 token 覆盖"
```

---

### Task 4: 夜景层 DOM + `moonrise` 月亮 + `firefly` 萤火虫

**Files:**
- Modify: `app/src/views/home/index.vue`（template `.sky` 容器内 `:3-14`；style 新增夜景规则）

**Interfaces:**
- Consumes: Task 3 的夜间 token。
- Produces: `.night-scene` 容器与 `.night-moon` / `.night-firefly` 类，Task 5 在同一容器内追加流星，Task 6 为其动画加 reduced-motion 兜底。

**开工前必做：** 调用 `animate` skill 决定 `moonrise` 与 `firefly` 的缓动曲线与时长。下面代码块里的参数是设计稿原值，属于**起点不是终点**——`animate` 的结论优先，若与下方不同，以 `animate` 的为准并在提交信息里说明改了什么。

**为什么用 `v-if` 不用 `opacity`：** 设计稿让夜景层常驻 DOM、用 `opacity: var(--ai-scene-op)`（昼 0 / 夜 1）显隐，那样昼间萤火虫动画仍在空跑。首页现有 `starry-night-stars` 用的是 `v-if="currentTimePeriod === 'night'"`（`index.vue:6`），新增元素沿用同一写法：昼间零 DOM、零动画、零合成层。

- [ ] **Step 1: 在 `.sky` 容器内、既有星星之后新增夜景层**

`index.vue:3-14` 的 `.sky` 容器改成：

```html
    <div class="sky">
      <!-- 繁星点缀仅在夜间展示 -->
      <div v-if="currentTimePeriod === 'night'" class="starry-night-stars">
        <span class="star star--1">✦</span>
        <span class="star star--2">✦</span>
        <span class="star star--3">✦</span>
        <span class="star star--4">✦</span>
        <span class="star star--5">✦</span>
        <span class="star star--6">✦</span>
      </div>

      <!-- 夜景层：月亮 + 萤火虫，仅夜间渲染 -->
      <div v-if="currentTimePeriod === 'night'" class="night-scene">
        <div class="night-moon">
          <span class="night-moon__crater night-moon__crater--1"></span>
          <span class="night-moon__crater night-moon__crater--2"></span>
          <span class="night-moon__crater night-moon__crater--3"></span>
        </div>
        <span class="night-firefly night-firefly--1"></span>
        <span class="night-firefly night-firefly--2"></span>
        <span class="night-firefly night-firefly--3"></span>
        <span class="night-firefly night-firefly--4"></span>
      </div>
    </div>
```

- [ ] **Step 2: 加夜景层样式**

在 `.starry-night-stars` 规则（`index.vue:856`）之前插入：

```scss
// ============================================
// 夜景层（月亮 / 萤火虫），仅 currentTimePeriod === "night" 时渲染
// ============================================
.night-scene {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.night-moon {
  position: absolute;
  top: 10%;
  right: 9%;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: radial-gradient(circle at 34% 32%, #fff8dc 0%, #ffe9a8 52%, #f4d489 100%);
  box-shadow:
    0 0 0 12px rgba(255, 233, 168, 0.1),
    0 0 70px 22px rgba(255, 233, 168, 0.22);
  animation: night-moonrise 2.4s cubic-bezier(0.22, 1, 0.36, 1) both;

  &__crater {
    position: absolute;
    border-radius: 50%;
    background: rgba(200, 170, 110, 0.32);

    &--1 { top: 26px; left: 22px; width: 16px; height: 16px; }
    &--2 { top: 54px; left: 46px; width: 11px; height: 11px; opacity: 0.85; }
    &--3 { top: 34px; left: 58px; width: 8px;  height: 8px;  opacity: 0.7; }
  }
}

.night-firefly {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ffe9a8;
  box-shadow: 0 0 12px 4px rgba(255, 233, 168, 0.5);
  animation: night-firefly-drift 10s ease-in-out infinite;

  &--1 { bottom: 22%; left: 14%; width: 7px; height: 7px; animation-duration: 9s; }
  &--2 { bottom: 16%; left: 34%; width: 5px; height: 5px; animation-duration: 11s; animation-delay: 1.5s; }
  &--3 { bottom: 28%; left: 58%; animation-duration: 10s; animation-delay: 0.8s; }
  &--4 { bottom: 19%; left: 74%; width: 5px; height: 5px; animation-duration: 12s; animation-delay: 2.2s; }
}

@keyframes night-moonrise {
  from { transform: translateY(34px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

// 关键帧名与 .night-firefly 类名刻意错开，避免读代码时把两者当成一个东西
@keyframes night-firefly-drift {
  0%   { transform: translate(0, 0);       opacity: 0.15; }
  25%  {                                   opacity: 1; }
  50%  { transform: translate(60px, -38px); opacity: 0.5; }
  75%  {                                   opacity: 1; }
  100% { transform: translate(0, 0);       opacity: 0.15; }
}
```

- [ ] **Step 3: 验证**

```bash
cd blog-ui-vue3/app
pnpm type-check && pnpm build-only && pnpm exec stylelint "src/views/home/index.vue"
```

再确认动画属性白名单——下面这条应该只匹配到 `transform` / `opacity`：

```bash
awk '/@keyframes night-/,/^}/' src/views/home/index.vue | grep -oE "^\s+[a-z-]+:" | sort -u
```

- [ ] **Step 4: 提交**

```bash
git add app/src/views/home/index.vue
git commit -m "feat: 首页夜景层新增月亮升起与萤火虫动效"
```

---

### Task 5: `shoot` 流星 + `lamp` 灯笼呼吸

**Files:**
- Modify: `app/src/views/home/index.vue`（template `.night-scene` 内追加流星；`.ac-passport` 相关 style）

**Interfaces:**
- Consumes: Task 4 的 `.night-scene` 容器。
- Produces: `.night-shooting-star` 与 `.night-lamp` 类，Task 6 为其加 reduced-motion 兜底。

**开工前必做：** 调用 `animate` skill 决定这两个动效的曲线与时长。

**对设计稿的既定调参：** 设计稿 `shoot` 是 7s 周期、用 `0% → 8% → 26% → 100%` 把 74% 的时间停在终点透明来制造间隔。7s 过于频繁，会从「偶遇」退化成节拍器。下方按 22s 写，`animate` 若给出别的结论以它为准。

- [ ] **Step 1: template 里给 `.night-scene` 追加流星**

在 Task 4 写的 `.night-firefly--4` 那行之后、`</div>` 之前插入：

```html
        <span class="night-shooting-star"></span>
```

- [ ] **Step 2: 加流星样式**

在 Task 4 的 `.night-firefly` 规则之后插入：

```scss
.night-shooting-star {
  position: absolute;
  top: 6%;
  right: 26%;
  width: 64px;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, transparent, #fffdec);
  opacity: 0;
  animation: night-shoot 22s ease-in 4s infinite;
}

@keyframes night-shoot {
  0%    { transform: translate(0, 0)         rotate(28deg); opacity: 0; }
  2%    {                                                   opacity: 1; }
  8%    { transform: translate(-360px, 220px) rotate(28deg); opacity: 0; }
  100%  { transform: translate(-360px, 220px) rotate(28deg); opacity: 0; }
}
```

- [x] **Step 3（执行时判定为不做）：lamp 灯笼呼吸**

执行时按 `animate` skill 的判定链走了一遍，结论是**不做**，三条理由：

1. 设计稿里 `lamp` 挂的是一枚纯装饰小牌子「灯亮着 🏮」，首页没有这个元素。
2. 本计划原定的替代载体 `.ac-passport` 是**岛民护照内容卡**（昵称、岛屿编号、label/value 明细），让用户正在阅读的内容为了样式而做透明度呼吸，是 `animate` skill 明令禁止的（"data the user is reading or acting on should not move for style"）。原计划只顾着调呼吸幅度，没意识到载体本身选错了。
3. 首页唯一真正的装饰光源——尾部露营区的篝火 `.camp-fire`（`index.vue:2093`）——**已经有自己的 `ac-fire-flicker` 闪烁动画**。

首页夜间此时已有星星闪烁、萤火虫脉动、篝火闪烁三处光呼吸，再加第四处只会变成噪音。`animate` skill 明确把「产出零行代码」列为成功结果之一。

可选的非动画替代（本次未做，属计划外）：夜间给 `.camp-fire` 加一层暖色 `filter: drop-shadow(...)` 强化辉光。那是静态配色，不是动效，需要时另开。

<details>
<summary>原 Step 3 内容（已作废，保留备查）</summary>

`.ac-passport` 在昼间不应有呼吸动画，所以动画挂在夜间块里。在 `.home-page--night` 内追加：

```scss
  .ac-passport {
    animation: night-lamp 3.6s ease-in-out infinite;
  }
```

若 Task 3 Step 2 已把 `.ac-passport` 块删空，就重新建这个块；若还留着 `box-shadow` 等声明，就在其中追加 `animation` 这一行。

在 `@keyframes night-shoot` 之后加：

```scss
@keyframes night-lamp {
  0%, 100% { opacity: 0.82; }
  50%      { opacity: 1; }
}
```

设计稿原值是 `.55 → 1`，那个幅度用在整张护照卡上会像闪烁故障（设计稿里它挂的是一枚小徽章）。`0.82 → 1` 是收敛后的幅度。

</details>

- [ ] **Step 4: 验证**

```bash
cd blog-ui-vue3/app
pnpm type-check && pnpm build-only && pnpm exec stylelint "src/views/home/index.vue"
awk '/@keyframes night-/,/^}/' src/views/home/index.vue | grep -oE "^\s+[a-z-]+:" | sort -u
```

最后一条仍应只有 `transform` / `opacity`。

- [ ] **Step 5: 提交**

```bash
git add app/src/views/home/index.vue
git commit -m "feat: 首页夜景层新增流星与灯笼呼吸动效"
```

---

### Task 6: `prefers-reduced-motion` 兜底 + 全量验收

**Files:**
- Modify: `app/src/views/home/index.vue`（style 块末尾）

**Interfaces:**
- Consumes: Task 4/5 的全部 `night-*` 动画类。

首页现在没有任何 `prefers-reduced-motion` 处理，全站只有 `components/feedback/FeedbackHost.vue:277` 和 `views/dashboard/components/WeatherAvatarFrame.vue:268` 两处有。加上 4 个新循环动画后缺这一块即构成无障碍缺陷。

- [ ] **Step 1: 在 style 块末尾（`</style>` 之前）加媒体查询**

```scss
// ============================================
// 无障碍：前庭敏感用户关闭持续动效
// 一次性的月亮升起改为直接落到终态，循环动效全停
// ============================================
@media (prefers-reduced-motion: reduce) {
  .night-moon {
    animation: none;
    transform: none;
    opacity: 1;
  }

  .night-firefly,
  .night-shooting-star {
    animation: none;
  }

  .night-shooting-star {
    opacity: 0;
  }

  .home-page--night .ac-passport {
    animation: none;
  }
}
```

`.night-shooting-star` 单独设 `opacity: 0`：它的静止态本就是不可见（靠动画的 2% 关键帧才闪现），停掉动画后必须显式压回 0，否则会留下一道静止的白杠。

- [ ] **Step 2: 验证**

```bash
cd blog-ui-vue3/app
pnpm type-check && pnpm build-only && pnpm exec stylelint "src/views/home/index.vue"
```

- [ ] **Step 3: 全量范围检查（对应 spec 验收标准 2、3）**

```bash
cd blog-ui-vue3
git diff --name-only main
```

期望**恰好**这三个：

```
app/src/views/home/index.vue
docs/plans/2026-08-08-home-night-theme.md
docs/specs/2026-08-08-home-night-theme-design.md
```

```bash
git diff main -- app/src/styles/_system-management.scss app/src/utils/theme.ts
```

期望空输出。

- [ ] **Step 4: 无双份检查（对应 spec 验收标准 4）**

```bash
cd blog-ui-vue3/app
grep -c 'class="cloud' src/views/home/index.vue    # 期望 3，不是 5
grep -c 'class="star star--' src/views/home/index.vue  # 期望 6，不是 13
```

- [ ] **Step 5: 提交**

```bash
git add app/src/views/home/index.vue
git commit -m "feat: 首页夜景动效补 prefers-reduced-motion 兜底"
```

- [ ] **Step 6: 浏览器实跑——先问用户**

按 `lessons.md` 2026-05-28：浏览器页面验证（含本地/远端地址）**必须先征得用户确认**，用户可能已自行验证。**不要自作主张打开浏览器。**

同时按 `lessons.md` 2026-07-29：**构建通过 ≠ 页面能跑**。本次改了 template 与 scoped style，最终必须有人实跑首页。

征得同意后要看的四件事：

1. 昼间三态外观与改动前一致（临时把 `updateClock()` 里的时段判断改成固定值分别看 morning / afternoon / sunset，**看完必须改回**）
2. 夜间态：月亮升起一次、4 只萤火虫游走、流星约 22s 一次、护照轻微呼吸
3. 云是 3 片不是 5 片，星星是 6 颗不是 13 颗
4. 浏览器 DevTools 里模拟 `prefers-reduced-motion: reduce`，确认循环动效停止且没有静止的流星白杠

---

## 交付

四步完成后按项目默认交付流程（`lessons.md` 2026-05-25）：建中文 PR → 本地 feature 快进合并到 `main` → `git push origin main` → 远端 `10.10.9.184:/data/personal/projects/blog-ui-vue3` 执行 `git fetch origin && git reset --hard origin/main`。收尾只确认「是否按默认交付流程继续」。
