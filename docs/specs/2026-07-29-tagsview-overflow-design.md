# 标签栏溢出折叠设计

日期：2026-07-29
范围：`app/src/layouts/components/LayoutTagsView.vue`、新增 `app/src/composables/useTagsOverflow.ts`

## 背景

后台标签栏当前用 `el-scrollbar` 做横向滚动，标签变多时底部出现横向滚动条。同时标签行只占了容器约一半宽度，右侧留出大片空白。

### 宽度未撑满的根因

`.scroll-container`（`LayoutTagsView.vue:441`）与 `.tabbar-spacer`（`:516`）在同一个 flex 行里都写了 `flex: 1`，两者平分剩余空间，因此标签区在容器中点附近就断掉。父容器 `.layout__main` 是 `flex: 1; min-width: 0`，并未限制宽度。

`.tabbar-spacer` 在折叠方案中本就要删除，宽度问题随之消失——两者是同一处改动，不是两件事。

## 目标

1. 标签行撑满容器可用宽度，右端贴合容器。
2. 取消横向滚动，页面底部不再出现横向滚动条。
3. 放不下的标签折叠进右侧图标按钮的下拉面板。
4. 当前激活的标签任何情况下都可见。

## 非目标

- 不引入单元测试框架（项目未装 vitest，CI 门禁为 `type-check` + `build-only`）。
- 不改动右键菜单既有功能与 `tagsViewStore` 逻辑。
- 不对本文件已有的颜色字面值做批量 token 化，仅新增样式使用 `--ai-*` token。
- 不改动 `.contextmenu` 使用 `position: absolute` 配合 `clientX/clientY` 这一既有写法。

## 已确认的产品决策

| 决策点 | 结论 |
|---|---|
| chevron 按钮语义 | 改为纯溢出标签列表，仅在有溢出时出现；刷新/关闭系操作全部回归右键菜单 |
| active 落入溢出区 | 溢出计算时保底保留主页 + affix + active，顺序不变，active 永远可见 |
| 下拉条目可否关闭 | 可以，条目右侧带 `×`（affix 标签不显示） |

## 架构

### 职责边界

`useTagsOverflow.ts` 只回答「哪些该折叠」，不认识路由、不认识 `TagView`、不发起跳转。

```
入参：rowRef（标签行 DOM）、itemRefs（各标签 DOM）、tagCount、mustKeep（索引集合）、reserveWidth（chevron 占位宽）
出参：collapsedIndexes（Set<number>）、hasOverflow（boolean）
```

`LayoutTagsView.vue` 负责把 `affix` 与 `isActive` 翻译成 `mustKeep` 索引集合，并依据 `collapsedIndexes` 决定标签是否加 `.is-collapsed`、chevron 是否渲染、下拉列出哪些条目。两者只通过「索引」这一个概念交接。

### 溢出算法

chevron 仅在溢出时出现，但它自身占宽，构成循环依赖。解法是两遍计算：

1. 第一遍按不留按钮位计算；若无溢出，结束。
2. 若有溢出，减去按钮宽度重算一遍。

两遍必然收敛，不会震荡。

单遍内部：

1. 可用宽 = 标签行 `clientWidth` −（主页链接宽 + gap）
2. 扣除 `mustKeep`（affix + active）的总宽
3. 剩余预算按从左到右顺序分配给非保底标签；第一个装不下的以及其后全部折叠——不跳着挑选，避免出现「显示 1、3、6」的视觉噪声
4. 极端窄屏下连 `mustKeep` 都装不下：只保留 active，其余全折叠；仍装不下则允许被容器裁切，不做额外处理

**已知视觉后果**：当 active 原本排在靠后位置时，标签行会呈现「左侧连续若干个 + 最右一个 active」，中间断开。这是「active 永远可见」与「不改变顺序」两条约束的必然结果，已确认接受。

### 隐藏机制

折叠的标签使用 `position: absolute; visibility: hidden; pointer-events: none`，而非 `display: none`。它们脱离文档流不占宽度，但 `offsetWidth` 始终可读，避免「隐藏后量不到宽度 → 下次计算错误 → 反复抖动」。

## DOM 与样式改动

均位于 `LayoutTagsView.vue`：

- `<el-scrollbar>` 替换为 `<div class="tags-row" ref="rowRef">`；删除 `scrollbarRef` 与 `handleScroll`。滚轮关闭右键菜单的副作用一并去掉——不再滚动后 wheel 无意义，右键菜单已有 document click 兜底。
- **删除 `.tabbar-spacer` 元素及其样式**（宽度 bug 根因）。
- `.tags-row`：`flex: 1; min-width: 0; position: relative; overflow: hidden; display: flex; align-items: center; gap: 6px`。`overflow: hidden` 作为保险丝，防止测量完成前的一帧闪出溢出内容，并彻底杜绝横向滚动条。
- 主页 `<a>` 留在行首、`flex-shrink: 0`，恒定可见，算法单独扣其宽度，不参与折叠。
- chevron 移出 `.tags-row`，在 `.tags-container` 内以 `position: absolute; right: 14px`（对齐容器 padding）定位，**不参与 flex 流**，`v-if="hasOverflow"`。

  这一点是刻意的：若 chevron 作为 `.tags-row` 的 flex 兄弟参与布局，它的显隐会改变 `.tags-row` 的宽度，而宽度又决定它是否显示，在 `ResizeObserver` 回调里改 DOM 又触发 `ResizeObserver`，会产生 loop 警告。绝对定位让 `.tags-row` 宽度恒定，循环由上面的两遍计算显式解决，而不是靠观察器反复收敛。

## 溢出下拉面板

新增独立状态 `overflowMenu = { visible, x, y }`，与既有 `contextMenu` 互斥（开一个关另一个）。

- `Teleport to body`，按 chevron 的 `getBoundingClientRect()` 右对齐，用 `right: innerWidth - rect.right` 定位，避免面板宽度未知时 `left` 算不准。
- 条目 = 标题 + 非 affix 时的 `×`。
- 点击条目：`router.push({ path: tag.fullPath, query: tag.query })` 并关闭面板。
- 点击 `×`：调用既有 `closeSelectedTag`，`@click.stop` 防止误触发跳转；若关到折叠列表为空则自动收起面板。
- 路由变化、点击面板外均关闭。
- 样式：`.contextmenu` 与 `.overflow-menu` 并列在同一段 SCSS 中共享外观（16px 圆角、半透明白 + blur），保持动森风一致，不各写一套。

## 边界情况

| 场景 | 处理 |
|---|---|
| 无溢出 | chevron 不渲染 |
| 侧栏折叠/展开、窗口缩放 | `useResizeObserver` 监听 `.tags-row`（`@vueuse/core` 已在依赖中） |
| 新增/关闭标签 | `watch(visitedViews)` + `nextTick` 后重算 |
| 中英文切换 | 标题宽度变化，`watch(locale)` 重算 |
| 切到被折叠的标签 | 它成为 active → 进入 `mustKeep` → 自动可见 |
| 极端窄屏 | 只留 active，被裁切可接受 |
| Top / Left / Mix 三套布局 | 共用同一组件，改动自动覆盖，无需分别处理 |

## 验证

本地：

```bash
pnpm type-check && pnpm build-only
```

（与 CI 门禁一致；项目 CI 不挂 lint。）

远端：rsync 同步到 `/data/personal/projects/blog-ui-vue3`，排除 `._*`、`node_modules`、`.env`，用现有 8083 服务验证。本次不碰配置、Dockerfile、compose、环境变量与构建链路，**不执行 `docker compose up`**。

页面实测项：

1. 打开 10 个以上标签，确认 chevron 出现
2. 拖窄窗口，确认折叠数量随之变化
3. 从下拉里切到被折叠的标签，确认它变为可见
4. 在下拉里关闭标签，确认列表清空后面板自动收起
5. affix 标签在下拉中无 `×`
6. 页面底部无横向滚动条
7. 标签行右端贴合容器右侧

按项目规则，开浏览器做页面验证前先与用户确认（用户可能已手动验证）。

## 交付

分支 `feature/tagsview-overflow` → 中文 PR → 本地合并 `main` → 远端同步 `main`。改动仅提交至 `blog-ui-vue3` 仓库。
