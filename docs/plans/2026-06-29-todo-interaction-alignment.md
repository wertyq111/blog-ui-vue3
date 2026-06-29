# 待办#15 试点 todo 子模块交互对齐 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use /executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 work-daily/work-doc 已验证的「行内 hover 快览 + `?action=add`/`?id=` 深链」交互对齐到 develop/todo，并在工作台 Hero 加「新建待办」入口。

**Architecture:** 纯前端（blog-ui-vue3）。新增 `TodoAPI.getInfo`（对接后端已有 `GET /todo/{id}`）；在 `todo/index.vue` 加 hover popover 与深链处理（照搬 work-doc 的 `onActivated + watch + 去重` 写法、work-daily 的 `onDeactivated` 关预览）；在 `WorkbenchHero.vue` 加一个按钮。

**Tech Stack:** Vue 3.5 + TS + Vite + Element Plus（`el-popover` 全局自动注册）+ vue-router。

**验证门禁（与 writing-plans 默认 TDD 的偏离，已确认）：** blog-ui-vue3 前端无单测设施，CI 门禁为 `type-check + build`。本计划不写单元测试，以 `pnpm type-check`/`pnpm build` 通过 + 逐步逻辑核对为门禁；页面可视验证按项目规则在远端、需用户确认（受 `/#/login` 重定向阻挡）。

---

## File Structure

| 文件 | 责任 | 改动 |
|---|---|---|
| `app/src/api/develop/todo.ts` | todo API 封装 | 新增 `getInfo(id)` |
| `app/src/views/develop/todo/index.vue` | todo 列表页 | hover popover（A）+ 深链 action/id（B/C）+ onDeactivated |
| `app/src/views/dashboard/components/WorkbenchHero.vue` | 工作台 Hero | 新增「新建待办」按钮（D1） |

---

## Task 1: TodoAPI 新增 getInfo

**Files:**
- Modify: `app/src/api/develop/todo.ts`（在 `deleteById` 之后、对象闭合 `}` 之前插入）

- [ ] **Step 1: 新增 getInfo 方法**

在 `deleteById(...) { ... },` 之后插入：

```ts
  /** 获取待办详情 */
  getInfo(id: number) {
    return request<any, TodoItem>({
      url: `${BASE_URL}/${id}`,
      method: "get",
    });
  },
```

（`TodoItem` 已在文件顶部 `import type { ... TodoItem ... }` 中导入，无需新增导入。）

- [ ] **Step 2: type-check**

Run: `cd app && pnpm type-check`
Expected: 无新增报错（PASS）

- [ ] **Step 3: Commit**

```bash
git add app/src/api/develop/todo.ts
git commit -m "feat: TodoAPI 新增 getInfo 对接后端 todo/{id}"
```

---

## Task 2: todo 列表行加 hover 快览（A）

**Files:**
- Modify: `app/src/views/develop/todo/index.vue`（模板 `tbl-name-cell` 内、scoped style 末尾）

- [ ] **Step 1: 用 el-popover 包裹标题链接**

把现有这段（约 150–164 行）：

```vue
              <td class="tbl-name-cell">
                <div class="todo-title-cell">
                  <span
                    class="todo-title-link"
                    :class="{ 'todo-title--done': row.status === 2 }"
                    title="点击预览内容"
                    @click="openPreview(row)"
                    >{{ row.title }}</span
                  >
```

替换为：

```vue
              <td class="tbl-name-cell">
                <div class="todo-title-cell">
                  <el-popover trigger="hover" :width="520" placement="top">
                    <template #reference>
                      <span
                        class="todo-title-link"
                        :class="{ 'todo-title--done': row.status === 2 }"
                        title="点击预览内容"
                        @click="openPreview(row)"
                        >{{ row.title }}</span
                      >
                    </template>
                    <div class="todo-hover-preview">
                      <AnimalMarkdown
                        v-if="row.content"
                        :model-value="row.content"
                        preview-only
                        height="auto"
                      />
                      <div v-else class="todo-preview-empty">暂无内容</div>
                    </div>
                  </el-popover>
```

注意：原 `<div v-if="row.tags ...">` 标签块与 `</div>`（`todo-title-cell` 闭合）保持不动，仅在标题 `<span>` 外包了 popover。`el-popover` 是 Element Plus 全局自动注册，无需 import；`AnimalMarkdown` 已在脚本导入。

- [ ] **Step 2: 加 hover 浮层滚动样式**

在 `<style lang="scss" scoped>` 内（与现有 `.todo-preview-empty` 同级）追加：

```scss
.todo-hover-preview {
  max-height: 400px;
  overflow-y: auto;
}
```

- [ ] **Step 3: type-check**

Run: `cd app && pnpm type-check`
Expected: PASS（无新增报错）

- [ ] **Step 4: Commit**

```bash
git add app/src/views/develop/todo/index.vue
git commit -m "feat: todo 列表行加 hover 快览 popover"
```

---

## Task 3: todo 深链 action/id + onDeactivated（B/C）

**Files:**
- Modify: `app/src/views/develop/todo/index.vue`（脚本导入 + 函数 + onMounted）

- [ ] **Step 1: 扩充 vue 导入并新增 vue-router 导入**

把（约 274 行）：

```ts
import { computed, onMounted, reactive, ref } from "vue";
```

替换为：

```ts
import { computed, onActivated, onDeactivated, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
```

- [ ] **Step 2: 新增 route/router 与深链处理函数**

在 `openPreview` 函数（约 454–458 行）之后插入：

```ts
const route = useRoute();
const router = useRouter();

// 详情预览是 teleport 到 body 的弹窗，页面被 keep-alive 缓存，切到其它标签时
// 路由变化不会自动关它。失活时主动关闭，避免跳转后残留覆盖。
onDeactivated(() => {
  previewVisible.value = false;
});

// 通过 ?id= 深链打开待办预览。页面被 keep-alive 缓存：首次进入/从其它标签切回来由
// onActivated 触发，同一标签内再次点链接由 watch 触发；openingId 去重，避免两条路径
// 同时命中弹出两个预览。
let openingId: number | null = null;
async function openTodoFromQuery(): Promise<void> {
  if (!route.query.id) return;
  const id = Number(route.query.id);
  if (Number.isNaN(id) || openingId === id) return;
  openingId = id;
  try {
    const todo = await TodoAPI.getInfo(id);
    openPreview(todo);
  } finally {
    const { id: _omitId, ...rest } = route.query;
    void _omitId;
    router.replace({ path: route.path, query: rest });
    openingId = null;
  }
}

onActivated(() => {
  void openTodoFromQuery();
});
watch(
  () => route.query.id,
  (id) => {
    if (id) void openTodoFromQuery();
  }
);
```

- [ ] **Step 3: onMounted 内处理 ?action=add 与首次 ?id=**

把现有 onMounted（约 589–593 行）：

```ts
onMounted(async () => {
  await fetchPlatforms();
  await fetchStatistics();
  handleQuery();
});
```

替换为：

```ts
onMounted(async () => {
  await fetchPlatforms();
  await fetchStatistics();
  handleQuery();
  if (route.query.action === "add") {
    handleCreateClick();
    const { action, ...rest } = route.query;
    void action;
    router.replace({ path: route.path, query: rest });
  }
  void openTodoFromQuery();
});
```

- [ ] **Step 4: type-check**

Run: `cd app && pnpm type-check`
Expected: PASS（无新增报错）

- [ ] **Step 5: Commit**

```bash
git add app/src/views/develop/todo/index.vue
git commit -m "feat: todo 支持 ?action=add 与 ?id= 深链"
```

---

## Task 4: 工作台 Hero 加「新建待办」入口（D1）

**Files:**
- Modify: `app/src/views/dashboard/components/WorkbenchHero.vue`（在「新建文档」按钮 `</button>` 之后插入）

- [ ] **Step 1: 插入新建待办按钮**

在 `新建文档` 按钮闭合 `</button>`（约 168 行）之后、`路径转换` 按钮 `<button` 之前插入：

```vue
        <button
          class="btn-ai"
          @click="$router.push({ path: '/develop/todo', query: { action: 'add' } })"
        >
          <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M4 7h11M4 12h11M4 17h7" />
            <path d="M18 6l2 2 3-3" />
          </svg>
          新建待办
        </button>
```

- [ ] **Step 2: type-check**

Run: `cd app && pnpm type-check`
Expected: PASS（无新增报错）

- [ ] **Step 3: Commit**

```bash
git add app/src/views/dashboard/components/WorkbenchHero.vue
git commit -m "feat: 工作台 Hero 加新建待办入口"
```

---

## Task 5: 整体构建验证

- [ ] **Step 1: build**

Run: `cd app && pnpm build`
Expected: 构建成功（`vue-tsc --noEmit && vite build` 均通过）

- [ ] **Step 2: 逻辑核对清单**

逐条对照确认（静态/代码核对，页面可视验证留待远端 + 用户确认）：
- hover 标题 → 浮层渲染 `row.content` 的 markdown；content 空时显示「暂无内容」。
- 点击标题 → 仍打开原大弹窗预览（未被破坏）。
- `/develop/todo?action=add` → 自动打开新增弹窗，地址栏 query 被清。
- `/develop/todo?id=<存在的id>` → 调 getInfo 打开预览弹窗，query 被清；不存在 id 不崩。
- 切到其它标签 → 预览弹窗被 onDeactivated 关闭。
- Hero「新建待办」按钮 → 跳 `/develop/todo?action=add`。

---

## Self-Review（对照 spec）

- **Spec A 行内 hover 快览** → Task 2 ✓
- **Spec B `?action=add`** → Task 3 Step 3 ✓
- **Spec C `?id=` + getInfo + onDeactivated** → Task 1 + Task 3 Step 2 ✓
- **Spec D1 Hero 按钮** → Task 4 ✓
- **不做项**（work-doc/platform、QuickAccess 卡片、后端）→ 计划未涉及 ✓
- 类型一致性：`getInfo` 返回 `TodoItem`，`openPreview(row: TodoItem)` 入参匹配 ✓
- Placeholder 扫描：无 TBD/TODO，所有代码步骤含完整代码 ✓
