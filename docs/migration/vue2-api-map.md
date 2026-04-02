# Vue2 API Map

## Purpose

本文件记录首波迁移相关的 Vue2 前端调用、后端当前可见路由声明，以及已经暴露出来的前后端不一致风险。

重要原则：

- 这里只整理“当前代码可见事实”。
- 前端历史调用与 `routes/api.php` 的当前声明若不一致，只能进入风险清单并等待远端验证。
- 不把历史偶然可用路径直接当成 Vue3 正式契约。

## Sources

- `blog-ui/app/src/config/axios-config.js`
- `blog-ui/app/src/config/setting.js`
- `blog-ui/app/src/store/modules/user.js`
- `blog-ui/app/src/layout/index.vue`
- `blog-ui/app/src/views/login/login.vue`
- `blog-ui/app/src/views/system/user/index.vue`
- `blog-ui/app/src/views/system/user/user-edit.vue`
- `blog-ui/app/src/views/system/user/info/index.vue`
- `blog-ui/app/src/views/mini-program/photo-category/index.vue`
- `blog-ui/app/src/views/mini-program/photo-category/photo-category-edit.vue`
- `blog-ui/app/src/views/mini-program/photo/index.vue`
- `blog-dev/routes/api.php`
- `blog-dev/app/Http/Controllers/Api/AuthorizationsController.php`
- `blog-dev/app/Http/Controllers/Api/User/UsersController.php`
- `blog-dev/app/Http/Controllers/Api/Admin/MenuController.php`
- `blog-dev/app/Http/Controllers/Api/MiniProgram/PhotoCategoryController.php`
- `blog-dev/app/Http/Middleware/After.php`

## Shared Request / Response Behavior

- Vue2 通过 `axios-config.js` 统一设置 `baseURL=VUE_APP_API_BASE_URL`。
- 请求拦截器会把 `Authorization` header 写入当前 token。
- 响应拦截器会在响应头存在 `Authorization` 时自动续写 token。
- 登录态接口若返回 `code === 401`，前端会清 token 并跳转登录页。
- `After` 中间件会把后端 JSON 整理成当前前端依赖的 `{ code, msg, data, count }` 结构。

## Auth Bootstrap APIs

| Concern | Frontend Call | Vue2 Source | Backend Declaration | Notes |
| --- | --- | --- | --- | --- |
| login | `POST /user/login` | `views/login/login.vue` | declared | 提交字段包含 `username/password/captcha/captcha_key/remember` |
| captcha | `GET /captcha` | `views/login/login.vue` | declared | 消费 `captcha_image_content` 与 `captcha_key` |
| current user | `GET /users/getUserInfo?include[]=member` | `layout/index.vue`, `views/user/profile.vue` | declared | 用于填充用户、角色、authorities、permissions |
| menu tree | `GET /index/getMenuList` | `store/modules/user.js` | declared | 用于动态菜单与动态路由注册 |

## System/User API Matrix

| Concern | Frontend Call | Vue2 Source | Backend Declaration | Status |
| --- | --- | --- | --- | --- |
| list | `GET /users/list` | `views/system/user/index.vue` | declared | matched |
| list include roles | `where.include=['roles']` | `views/system/user/index.vue` | backend filter route exists | matched |
| username check | `GET /users/checkUser?username=...` | `views/system/user/user-edit.vue` | declared | matched |
| role options | `GET /role/getRoleList` | `views/system/user/user-edit.vue`, `views/system/user/info/index.vue` | declared | matched |
| edit | `POST /users/{id}` | `views/system/user/user-edit.vue` | declared | matched |
| delete | `DELETE /users/{id}` | `views/system/user/index.vue` | declared | matched |
| status | `POST /users/status/{id}` | `views/system/user/index.vue` | declared | matched |
| reset password | `POST /users/resetPwd/{id}` | `views/system/user/index.vue` | declared | matched |
| add | `POST /users/edit` | `views/system/user/user-edit.vue` | backend is `POST /users/add` | risk |
| batch delete | `POST /user/delete` | `views/system/user/index.vue` | no current route found | risk |
| info page read | `GET /user/info?id=...` | `views/system/user/info/index.vue` | no current route found | risk |
| info page update | `POST /user/edit` | `views/system/user/info/index.vue` | no current route found | risk |
| info page delete | `POST /user/delete` | `views/system/user/info/index.vue` | no current route found | risk |
| level options | `GET /level/getLevelList` | `views/system/user/info/index.vue` | no current route found | risk |
| position options | `GET /position/getPositionList` | `views/system/user/info/index.vue` | no current route found | risk |
| dept options | `GET /dept/getDeptList` | `views/system/user/info/index.vue` | no current route found | risk |

## Photo-Category API Matrix

| Concern | Frontend Call | Vue2 Source | Backend Declaration | Status |
| --- | --- | --- | --- | --- |
| list | `GET /photo-categories/index` | `views/mini-program/photo-category/index.vue` | declared | matched |
| list options | `GET /photo-categories/list` | `views/mini-program/photo/index.vue` | declared | matched |
| add | `POST /photo-categories/add` | `views/mini-program/photo-category/photo-category-edit.vue` | declared | matched |
| edit | `POST /photo-categories/{id}` | `views/mini-program/photo-category/photo-category-edit.vue` | declared | matched |
| detail | `GET /photo-categories/{category}` | no direct Vue2 use found in first wave | declared | unused in first wave |
| delete | `DELETE /photo-category/{id}` | `views/mini-program/photo-category/index.vue` | backend is `DELETE /photo-categories/{category}` | risk |
| newest | `GET /photo-categories/new` | no direct Vue2 use found in first wave | declared | unused in first wave |
| duplicate/name check | `GET /photo-categories/check` | no direct Vue2 use found in first wave | declared | unused in first wave |

## API Risk List

- `system/user` 新增弹窗当前前端使用 `POST /users/edit`，但 `routes/api.php` 当前声明新增为 `POST /users/add`。这不是可直接接受的正式契约，必须远端验证。
- `mini-program/photo-category` 删除当前前端使用 `DELETE /photo-category/{id}`，但 `routes/api.php` 当前声明为 `DELETE /photo-categories/{category}`。必须远端验证。
- `system/user/info` 页仍依赖 `/user/info`、`/user/edit`、`/user/delete` 这组单数路径，当前路由文件未见声明。必须远端验证。
- `system/user` 批量删除调用 `POST /user/delete`，当前路由文件未见声明。必须远端验证。
- `system/user/info` 页依赖的 `/level/getLevelList`、`/position/getPositionList`、`/dept/getDeptList` 当前路由文件未见声明。必须远端验证。
- 401 跳转与登录回跳参数名不一致，属于认证链路风险，但不是后端路由契约；Task 4 需要在 Vue3 里统一。

## Task 4 / Wave 1 Contract Notes

- Task 4 只应把登录、验证码、当前用户、菜单加载四条主链路视为首要正式接口。
- `system/user` 与 `photo-category` 页面迁移前，需要把上述风险项列为待远端验证，不直接照抄 Vue2 历史调用。
- Vue3 请求层必须保留“响应头 token 自动续写”能力，否则远端登录态会偏离当前后端行为。
