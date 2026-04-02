# Vue2 Component Inventory

## Purpose

本文件整理 Vue2 项目中与后台壳层、首波 CRUD 页面、后续共享能力相关的公共组件、指令和复用模式，作为 Task 4 到 Task 6 的迁移输入。

## Sources

- `blog-ui/app/src/main.js`
- `blog-ui/app/src/layout/index.vue`
- `blog-ui/app/src/components/**/*`
- `blog-ui/app/src/utils/permission.js`
- `blog-ui/app/src/views/system/user/**/*`
- `blog-ui/app/src/views/mini-program/photo-category/**/*`
- `blog-ui/app/src/views/user/profile.vue`
- `blog-ui/app/src/views/config/website/index.vue`
- `blog-ui/app/src/views/mini-program/**/*`
- `blog-ui/app/src/views/develop/**/*`
- `blog-ui/app/package.json`

## Core Shared Substrate

### ele-admin / ele-pro-table

- `ele-admin` 是 Vue2 后台的主干依赖，覆盖布局、菜单格式化、动态路由转换、主题能力、表格样式和部分工具方法。
- `ele-pro-table` 是最稳定的 CRUD 复用模式，广泛出现于列表页。
- 典型结构是：
  - 搜索表单
  - `ele-pro-table`
  - `toolbar` slot
  - `action` slot
  - 列表页内编辑弹窗
- `system/user` 和 `mini-program/photo-category` 都属于这一模式。

### AppDialog

- `AppDialog.vue` 是 `el-dialog` 的薄封装。
- 全局注册后，编辑弹窗普遍采用 `<app-dialog :visible @update:visible>` 这一协议。
- 这是 Wave 1 CRUD 弹窗最直接的行为参考。

### Permission model

- 权限插件定义在 `src/utils/permission.js`，不是独立 `directive` 目录。
- 注册了 `v-role`、`v-any-role`、`v-permission`、`v-any-permission` 以及 `$has*` 系列方法。
- 但业务页的主流写法并不是指令，而是 `mapGetters(['permission']) + permission.includes(...)`。
- Vue2 内部存在两套权限数据：
  - 插件读 `store.state.user.authorities`
  - 页面普遍读 `store.state.user.permission`
- Task 4 / Task 5 需要统一成一套 Vue3 权限来源，不能照搬双轨制。

## First-Wave Relevant Components

| Capability | Vue2 Source | Current Usage | Migration Relevance |
| --- | --- | --- | --- |
| login form | `views/login/login.vue` | 登录、验证码、remember、回跳 | Task 4 必需 |
| layout shell | `layout/index.vue` | 顶层布局、获取用户信息、主题入口 | Task 4 必需 |
| dashboard landing | `views/dashboard/workplace.vue` | 登录后首个实际内容页 | Task 4 必需 |
| CRUD table pattern | `views/system/user/index.vue`, `views/mini-program/photo-category/index.vue` | 首波列表页模式 | Task 5 / Task 6 必需 |
| dialog pattern | `components/AppDialog.vue`, `views/system/user/user-edit.vue`, `views/mini-program/photo-category/photo-category-edit.vue` | 首波编辑弹窗 | Task 5 / Task 6 必需 |
| loading / message feedback | 页面普遍依赖 `$loading / $message / $confirm` | 成功/失败反馈 | Task 4 起即必需 |

## Deferred Shared Capabilities

这些能力不是 Task 4 的前置项，保留到后续波次再落地：

- `uploadImage.vue`
  - 依赖七牛 token、上传域名、下载域名与 `v-lazy`
- `uploadQiniuPicture.vue`
  - 依赖七牛，且现有协议不是标准 `v-model` 单向输入输出
- `TinymceEditor/index.vue`
  - 只在 3 个页面真实使用
- `@riophae/vue-treeselect`
  - 主要出现在菜单、部门、组织、用户详情等后续页面
- `VueLazyload`
  - 当前明确使用点较少，不是 Task 4 / 首波 CRUD 阻塞项
- `model-viewer`
  - 当前仅见于个人中心页
- `ElTableDraggable.vue`
  - 只在 develop/work-platform 接入
- `mavon-editor`
  - 只在 develop 模块使用
- `xgplayer-vue`
  - 当前仅声明依赖，未检到实际使用

## High-Risk Items

- `ele-admin` 不是单点组件替换问题，而是“布局 + 菜单 + 路由 + 表格 + 主题 + 工具方法”的耦合中心。
- `ElTableDraggable.vue` 直接 `import Sortable from 'sortablejs'`，但 `package.json` 没有显式声明 `sortablejs`。
- `uploadQiniuPicture.vue` 现有交互依赖 `v-model + @addPicture` 双写回，不是标准组件协议。
- `TinymceEditor` 内部直接操作 `document.head` 和 TinyMCE iframe 样式，迁移到 Vue3 时需要重新确认生命周期和主题切换方式。
- `permission` 指令体系与 `permission.includes(...)` 页面写法并存，若直接照搬会继续放大权限口径不一致问题。

## Execution Notes For Later Tasks

- Task 4 只迁移 auth/menu/layout/login/dashboard 最小闭环，不提前引入上传、富文本、树选择、拖拽。
- Task 5 先抽出首波真正需要的共享底座：
  - 列表查询状态
  - 分页/表格数据适配
  - 弹窗表单状态
  - 权限判断
  - 统一反馈
- Task 6 迁移 `system/user` 和 `mini-program/photo-category` 时，优先使用 Task 5 抽出的共享能力，避免继续复制 Vue2 页面里的零散实现。
