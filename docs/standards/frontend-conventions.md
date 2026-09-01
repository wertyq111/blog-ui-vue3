# 前端代码规范总览（blog-ui-vue3 / Vue 3 + TS + Vite）

本文件规定**目录、命名、模块写法**这类工程约定。
页面视觉与结构（动森风列表页 / 编辑弹窗）见 [admin-page-style.md](../admin-page-style.md)；
矢量图标见 [animal-vector-icon-specification.md](./animal-vector-icon-specification.md)。
三份文件不重复，页面结构冲突时以 `admin-page-style.md` 为准。

写新页面前先读这三份；老页面（`views/mini-program/*`）用的是被淘汰的旧体系，**不要照它写**。

---

## 一、目录职责

| 目录 | 放什么 | 不放什么 |
|---|---|---|
| `src/api/` | 接口调用对象，一个后端资源一个文件 | 业务逻辑、数据加工 |
| `src/types/api/` | 接口出入参类型，与 `src/api/` **同名一一对应** | UI 类型 |
| `src/types/ui/` | 组件/布局/设置类类型 | 接口类型 |
| `src/components/` | 跨模块复用组件 | 只有一个页面用的组件 |
| `src/composables/` | 跨模块复用的有状态逻辑（`useXxx`） | 纯函数工具 |
| `src/utils/` | 纯函数工具、请求封装、反馈封装 | 带 Vue 响应式状态的逻辑 |
| `src/store/modules/` | 全局状态（Pinia） | 单页面的局部状态 |
| `src/styles/` | 公共样式与 token | 单页面私有样式 |
| `src/views/<模块>/<页面>/` | 页面与页面私有子组件 | 通用方法/样式/图标 |

- **业务目录不放公共层**：不要建 `views/<模块>/shared/`。跨栏目复用一律上移到 `components` / `composables` / `utils` / `styles`。
- 页面私有子组件放同目录的 `components/`（如 `views/pomo/components/`）。

## 二、命名

| 对象 | 规则 | 示例 |
|---|---|---|
| 通用组件 | `components/<PascalName>/index.vue` | `components/AnimalTag/index.vue` |
| 组件族内的子组件 | 同目录 `PascalName.vue` | `components/Upload/FileUpload.vue` |
| 页面目录 | kebab-case | `views/develop/work-doc/` |
| 页面主文件 | `index.vue` | `views/system/user/index.vue` |
| 页面弹窗/子页 | `<页面名>-<用途>.vue`，kebab | `user-edit.vue`、`role-auth.vue` |
| 页面级展示组件 | `components/PascalName.vue` | `views/dashboard/components/WorkbenchKpi.vue` |
| `api/`、`types/api/` 文件 | kebab-case，与后端资源名一致 | `api/develop/server-path.ts` ↔ `types/api/server-path.ts` |
| `composables/` 文件 | `useXxx.ts` 小驼峰 | `useTableSelection.ts` |
| `utils/` 文件 | 小驼峰 | `menuAnimalIcon.ts`、`systemManagement.ts` |
| `store/modules/` 文件 | kebab-case，store id 用小驼峰 | `tags-view.ts` → `defineStore("tagsView", ...)` |
| 样式 partial | `_xxx.scss` | `_system-management.scss` |

命名冲突时的取舍：**面向后端资源的（api/types）跟随后端 kebab 资源名；面向前端模块的（utils/composables）用小驼峰**。

## 三、SFC 写法

```vue
<!-- 用户管理 -->
<template>
  <div class="page-card">...</div>
</template>

<script setup lang="ts">
defineOptions({ name: "SystemUser" });   // 需要 keepAlive 时必须写，与路由 name 一致
</script>

<style scoped lang="scss">
</style>
```

- 一律 `<script setup lang="ts">`，属性顺序固定为 `setup` 在前（不要写成 `<script lang="ts" setup>`）。
- 块顺序固定 `template` → `script` → `style`；文件首行用 HTML 注释写页面中文名。
- **单根节点**：后台路由 `keepAlive: true`，多根组件缓存后切页会白屏。弹窗放根节点内部。
- 页面被 keepAlive 时必须 `defineOptions({ name })`，与路由 `name` 严格一致，否则缓存失效。
- `<style scoped lang="scss">`；页面结构类样式写进 `styles/_system-management.scss` 复用，不在页面里重抄 `.page-card`、`.filter-bar`、`.tbl`。
- 设计 token（`--ai-*`、`--am-*`）只在公共样式里定义，业务页只消费类名。

## 四、API 层

一个后端资源一个文件，导出一个 `XxxAPI` 对象，默认导出：

```ts
import request from "@/utils/request";
import { adaptPagination } from "@/utils/pagination";
import type { ServerPathQueryParams, ServerPathItem, ServerPathForm } from "@/types/api/server-path";

const BASE_URL = "/server-path";

const ServerPathAPI = {
  /** 获取路径转换分页列表 */
  async getPage(params: ServerPathQueryParams) {
    const { pageNum = 1, pageSize = 10, ...filters } = params;
    const res = await request<any, any>({
      url: `${BASE_URL}/index`,
      method: "get",
      params: { page: pageNum, per_page: pageSize, ...filters },
      __returnEnvelope: true,
    } as any);
    return adaptPagination<ServerPathItem>(res);
  },

  /** 新增路径转换 */
  create(data: ServerPathForm) {
    return request({ url: `${BASE_URL}/add`, method: "post", data });
  },
  ...
};

export default ServerPathAPI;
```

固定约定：

- 路径全部由 `BASE_URL` 模板拼接，不散写字符串。
- 方法名固定：`getPage` / `getAll` / `create` / `update` / `deleteById` / `batchDelete`，业务动作用动词命名（`convert`、`reorder`）。
- 每个方法一行 `/** 中文说明 */`。
- **分页参数转换只在 API 层做**：前端统一 `pageNum/pageSize`，在这里转成后端的 `page/per_page`；页面组件不碰后端字段名。
- 拿分页信封必须 `__returnEnvelope: true` + `adaptPagination<T>()`，不要自己解 `res.data.data`。
- 出入参类型写在 `types/api/<同名>.ts`，不在 api 文件里就地定义 interface。

## 五、状态与逻辑

- Pinia 一律 **setup 写法**：`export const useXxxStore = defineStore("xxx", () => { ... })`，不用 options 写法。
- 跨页面复用的有状态逻辑做成 `composables/useXxx.ts`，返回 ref/computed/方法的对象。
- 表格勾选统一用 `composables/useTableSelection.ts`，不要各页面自己维护选中数组。

## 六、用户反馈

**全部走 `@/utils/feedback`，禁止直接用 `ElMessage` / `ElMessageBox` / `ElNotification`。**（当前 54 个文件全部合规，0 例外，这条要守住。）

```ts
import { message, notify, confirm } from "@/utils/feedback";

message.success("保存成功");
await confirm({ title: "确认删除？", content: "删除后不可恢复" });
```

## 七、页面结构

后台列表页 / 编辑弹窗的完整规范在 `admin-page-style.md`。这里只强调三条硬约束：

1. 列表页根节点 `.page-card`，结构为 `.page-head` → `.filter-bar` → `.list-card`（含 `.toolbar` + `table.tbl`）→ 分页。
2. **表格用自定义 `<table class="tbl">`，不用 `el-table`**；弹窗用 `AdminAnimalModal`，不用 `el-dialog`。
3. 表单控件优先用 `animal-island-vue` 与项目动森组件（`AnimalSelect` / `AnimalMultiSelect` / `AnimalTreeSelect` / `AnimalTag` / `SystemIco`），Element Plus 只在动森无等价物时兜底（如 `el-transfer`）。

## 八、国际化

现状：i18n 只用在**框架层**（`LangSelect`、`LayoutSettings`、`LayoutToolbar`、登录/注册/重置密码）。
**业务页面直接写中文，不接 `t()`**——133 个业务组件里没有一个用 i18n，不要只给新页面单独接，那只会让口径更乱。
真要全站国际化，作为独立任务统一改造，不夹带在业务需求里。

## 九、格式化与提交

- 提交前跑定向检查：`pnpm eslint <改动文件>`；全量用 `pnpm lint`（eslint + prettier + stylelint 三件套）。
- 格式化配置 `.prettierrc.yaml`（`printWidth: 100`、双引号），样式检查走 stylelint，二者都由 husky + lint-staged 在提交时兜底。
- 包管理器强制 pnpm（`preinstall` 里 `only-allow pnpm`）。
- 提交信息受 `commitlint.config.cjs` 约束，格式 `<类型>: <中文描述>`。

## 十、新页面落地清单

| 步 | 动作 |
|---|---|
| 1 | `types/api/<资源>.ts` 定义出入参类型 |
| 2 | `api/<模块>/<资源>.ts` 写 `XxxAPI`，分页转换在这里做 |
| 3 | `views/<模块>/<页面>/index.vue` 只写列表、查询、删除、开弹窗 |
| 4 | `views/<模块>/<页面>/<页面>-edit.vue` 写编辑表单，`AdminAnimalModal` 承载，保存后 `emit("done")` |
| 5 | 结构类名用公共样式，控件用动森组件，反馈走 `utils/feedback` |
| 6 | `defineOptions({ name })` 与路由 name 对齐 |
| 7 | 跑定向 ESLint，同步远端 `http://10.10.9.184:8083/` 验证 |
