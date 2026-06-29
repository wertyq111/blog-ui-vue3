# 待办 #15 试点：todo 子模块交互对齐设计

- 日期：2026-06-29
- 范围：blog-ui-vue3
- 来源待办：#15 develop 子模块补齐页面内预览/深链交互（试点先做 todo）

## 背景

`work-daily` 已落地一套"页面内预览 + 编辑保存 + 删除 + 深链"的交互模式并经验证。
#15 要求把这套模式横向补齐到 develop 其它子模块、统一体验，先挑一个试点验证 OK 再铺开。

核对现状后确定：

- **work-doc 已对齐甚至超前**（已有 `?action=add`、`?id=` 深链预览、弹窗预览、编辑、删除），不需要动。
- **work-platform 不做**（无 markdown 正文，页面内预览不适用，代表性弱）。
- **试点 = todo**：已有"点击标题→大弹窗预览"、编辑、删除；缺 ① 行内 hover 快览 ② 深链。

## 目标（4 部分）

### A. 行内 hover 快览

todo 列表"待办标题"列的 `todo-title-link` 外包一层 `el-popover`（`trigger="hover"`、`placement="top"`），
浮层内嵌 `AnimalMarkdown :model-value="row.content" preview-only height="auto"`。

- 列表项已带 `content` 字段，hover 直接用 `row.content`，**无需额外请求**。
- 保留现有点击标题→大弹窗（`openPreview`）做细看，两层预览与 work-daily 一致。
- `content` 为空时浮层显示"暂无内容"（复用现有 `todo-preview-empty` 文案口径）。

### B. 深链 `?action=add`

`onMounted` 末尾检测 `route.query.action === "add"`：

- 调用现有新增入口（打开新增弹窗）。
- 随后 `router.replace({ path: route.path, query: {去掉 action 的其余 query} })` 清掉该参数，避免刷新/返回重复触发。

照搬 work-doc/work-daily 的写法。

### C. 深链 `?id=<id>`

`watch(() => route.query.id)`（含 `{ immediate: true }` 或在 onMounted 内首检）：

- 取 `id = Number(route.query.id)`，校验为正整数后调 `TodoAPI.getInfo(id)` 取详情。
- 成功后用返回详情打开预览弹窗（复用 `openPreview` 等价逻辑，传完整 item）。
- 处理完 `router.replace` 清掉 `id` query。
- 配合 `onDeactivated` 关闭预览弹窗（keep-alive 一致性，照搬 work-daily/work-doc）。

依赖：**新增 `TodoAPI.getInfo(id)`**，对应后端已存在的 `GET /todo/{id}`（`TodoItemController@info`）。
返回类型用现有 `TodoItem`。

### D. 接入口（D1）

工作台 `WorkbenchHero.vue` 现有两个按钮（记录日常 → work-daily?action=add、新建文档 → work-doc?action=add）。
新增第三个按钮「**新建待办**」→ `$router.push({ path: '/develop/todo', query: { action: 'add' } })`，
与现有按钮同构（沿用 `btn-ai` 样式 + 一个内联 svg 图标）。

- 这给 B 的 `?action=add` 一个真实消费方。
- `?id=` 深链作为模式对齐保留页面级支持（与 work-doc 一致，可被外链/书签使用），本次不强行新造 QuickAccess 待办卡片（YAGNI）。

## 改动文件

| 文件 | 改动 |
|---|---|
| `app/src/api/develop/todo.ts` | 新增 `getInfo(id)` → `GET /todo/{id}` |
| `app/src/views/develop/todo/index.vue` | A 行内 hover popover；B/C 深链处理 + onDeactivated；引入 `useRoute/useRouter` |
| `app/src/views/dashboard/components/WorkbenchHero.vue` | D1 新增「新建待办」按钮 |

## 不做（YAGNI / 范围外）

- 不动 work-doc、work-platform、convert-path（本次只试点 todo；铺开是 #15 后续）。
- 不新建 QuickAccess 待办卡片 / 工作台待办小组件。
- 不改后端（info 接口已存在）。

## 验证

- 远端同步后（rsync 排除 `._*`/`node_modules`/`dist`/`.vite`/`.pnpm-store`），用现有 8083 服务验证。
- 受登录态阻挡，浏览器页面验证需用户确认；默认以 `pnpm type-check` + `build` + 逻辑核对为门禁（参照 lessons：远端视觉核对受 `/#/login` 重定向阻挡）。
- 验证点：hover 浮层渲染 markdown；`/develop/todo?action=add` 自动开新增并清 query；`/develop/todo?id=<存在的id>` 自动开预览并清 query；Hero「新建待办」按钮跳转生效。
