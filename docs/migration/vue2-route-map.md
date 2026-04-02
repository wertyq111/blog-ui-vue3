# Vue2 Route Map

## Purpose

本文件用于固化 `blog-ui` Vue2 项目的路由、菜单和动态注册链路，作为 `blog-ui-vue3` Task 4 及后续页面迁移的事实输入。

说明：

- 这里只记录当前代码与种子数据里能确认的事实。
- `routes/api.php`、`MenuSeeder.php`、前端页面命名若存在不一致，只能记为风险，不直接当正式契约。

## Sources

- `blog-ui/app/src/router/index.js`
- `blog-ui/app/src/config/setting.js`
- `blog-ui/app/src/store/modules/user.js`
- `blog-ui/app/src/config/axios-config.js`
- `blog-ui/app/src/layout/index.vue`
- `blog-ui/app/src/views/login/login.vue`
- `blog-ui/app/src/views/dashboard/workplace.vue`
- `blog-ui/app/src/views/system/user/index.vue`
- `blog-ui/app/src/views/system/user/info/index.vue`
- `blog-ui/app/src/views/system/user/user-edit.vue`
- `blog-ui/app/src/views/mini-program/photo-category/index.vue`
- `blog-ui/app/src/views/mini-program/photo-category/photo-category-edit.vue`
- `blog-dev/app/Http/Controllers/Api/Admin/MenuController.php`
- `blog-dev/database/seeders/MenuSeeder.php`

## Runtime Model

### Static routes

- Vue2 静态路由只注册了 `/login` 与 `* -> 404`。
- 登录白名单配置在 `setting.whiteList`，当前是 `['/login', '/forget']`。
- `src/views/login` 目录下只存在 `login.vue`，未发现 `forget.vue`。

### Dynamic routes

- 动态菜单接口配置是 `/index/getMenuList`。
- `router.beforeEach` 在检测到 token 且 `store.state.user.menus` 为空时，调用 `store.dispatch('user/getMenus')`。
- `user/getMenus` 调用菜单接口并用 `formatMenus` 处理后返回 `{ menus, home }`。
- 路由守卫随后使用 `menuToRoutes(menus, (component) => import('@/views' + component))` 生成页面路由，并通过 `router.addRoute({ path: '/', component: EleLayout, redirect, children })` 注入。
- 动态路由注册完成后执行 `next({ ...to, replace: true })`。

### Auth and redirect behavior

- 无 token 且命中白名单时直接放行。
- 无 token 且未命中白名单时跳转 `/login`。
- 登录页完成登录后，优先跳回 `query.from`，否则进入 `/`。
- 响应拦截器里的 401 跳转逻辑会写入 `query.form`，与登录页读取的 `query.from` 不一致。

## First-Wave Route Matrix

| Area | Menu/Route Path | Route Type | Vue2 Source | Notes |
| --- | --- | --- | --- | --- |
| auth | `/login` | static | `blog-ui/app/src/views/login/login.vue` | 登录页；验证码与 token 写入逻辑都在这里 |
| dashboard | `/dashboard` | menu group | backend menu tree | 顶层分组，不是实际内容页 |
| dashboard | `/dashboard/workplace` | dynamic menu route | `blog-ui/app/src/views/dashboard/workplace.vue` | 当前真实首页内容页 |
| system | `/system` | menu group | backend menu tree | 顶层分组 |
| system/user | `/system/user` | dynamic menu route | `blog-ui/app/src/views/system/user/index.vue` | 首波 CRUD 页面 |
| system/user/info | `/system/user/info` | hidden dynamic menu route | `blog-ui/app/src/views/system/user/info/index.vue` | 隐藏页，可重复打开 tab |
| system/user | edit dialog | component only | `blog-ui/app/src/views/system/user/user-edit.vue` | 列表内弹窗，不是独立路由 |
| mini-program | `/mini-program` | menu group | backend menu tree | 顶层分组 |
| mini-program/photo-category | `/mini-program/photo-category` | dynamic menu route | `blog-ui/app/src/views/mini-program/photo-category/index.vue` | 首波 CRUD 页面 |
| mini-program/photo-category | edit dialog | component only | `blog-ui/app/src/views/mini-program/photo-category/photo-category-edit.vue` | 列表内弹窗，不是独立路由 |

## Menu Source Facts

- 菜单接口由 `MenuController@getMenuList` 提供。
- 非超级管理员按当前用户角色所关联的菜单 ID 聚合顶层菜单与子菜单。
- 超级管理员直接读取全部顶层菜单和子菜单。
- `MenuSeeder.php` 中模块菜单默认 `component = path`。
- 前端动态视图解析依赖 `import('@/views' + component)`，因此后端 `component/path` 与前端 `src/views` 的路径约定强耦合。

## Route and Naming Risks

- 白名单包含 `/forget`，但当前没有对应静态路由，也没有对应页面文件。
- 登录页读取 `query.from`，401 自动跳转写入的是 `query.form`，字段名不一致。
- `/dashboard/workplace` 的页面内容是开发工作台，主操作实际跳向 `/develop/*`，与“dashboard/workplace”语义不完全一致。
- `/system/user/info` 是隐藏菜单页，不应被误判为静态路由或普通局部组件。
- `/mini-program/photo-category` 的菜单标题是“相册分类”，但页面抬头和列表区文案写的是“相册管理 / 相册列表”。
- `src/views/mini-program/photo-category/._photo-category-edit.vue` 是垃圾文件，后续扫描与同步必须排除。
- 数据库菜单若来自旧 SQL 而非当前 `MenuSeeder.php`，权限码和菜单路径可能与源码不一致，必须在远端联调时复核。
