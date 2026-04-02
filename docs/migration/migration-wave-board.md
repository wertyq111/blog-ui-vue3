# Migration Wave Board

## Status Snapshot

- Task 1: done
- Task 2: done
- Task 3: done
- Task 4 local implementation: done
- Task 4 remote sync: done
- Task 4 remote static verification: done
- Task 5 local implementation: done
- Task 5 remote sync: done
- Task 5 remote static verification: done
- Remote runtime is already user-managed on `10.10.9.184:8083`

## Wave Sequencing

为避免当前计划里“Task 4 已包含 dashboard，但 Task 6 又把 dashboard 放进 Wave 1”造成重复执行，这里把执行节奏固定为以下顺序：

1. Task 4 / Shell Wave
   - `login`
   - `dashboard/workplace`
   - auth store
   - current user bootstrap
   - menu loading
   - dynamic route registration
   - top-level layout
2. Task 5 / Shared CRUD Substrate Wave
   - 查询状态
   - 列表数据适配
   - 弹窗表单状态
   - 权限辅助
   - 统一反馈
3. Task 6A / Business Wave 1
   - `system/user`
4. Task 6B / Business Wave 2
   - `mini-program/photo-category`
5. Task 6C / Business Wave 3
   - `system/user/info`
6. Task 6D / Business Wave 4
   - `mini-program/notebook-category`
7. Task 6E / Business Wave 5
   - `mini-program/notebook-label`
8. Later waves
   - other `system`
   - other `mini-program`
   - `develop`
   - long-tail modules

## Wave Board

| Wave | Scope | Primary Inputs | Blocking Risks | Local Exit | Remote Exit | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Shell Wave | login + dashboard + auth/menu/layout | `vue2-route-map.md`, `vue2-api-map.md` | token续写、401 失效、动态菜单映射、`from/form` 不一致 | `test:run`, `lint`, `typecheck`, `build` green | sync + remote static verification green | done |
| Shared CRUD Substrate | table/search/dialog/permission/feedback | `vue2-component-inventory.md`, `dependency-replacement-matrix.md` | 权限口径统一、ele-admin table 模式拆分 | focused tests + local gates green | sync + remote static verification green | done |
| Business Wave 1 | `system/user` | route/api/component docs + shared substrate | `/users/edit` vs `/users/add`, `/user/delete` batch, info page单数路径, `gender` filter未在当前后端确认, 当前工作站未直连 `8083` | page tests + local gates green | remote static verification plus remote runtime query verification green | done |
| Business Wave 2 | `mini-program/photo-category` | route/api/component docs + shared substrate | `/photo-category/{id}` vs `/photo-categories/{category}`, remote `POST /photo-categories/add` currently returns 500 in `PhotoCategoryController::add` | page tests + local gates green | remote static verification green; runtime blocker deferred for later patch | done (deferred runtime) |
| Business Wave 3 | `system/user/info` | route/api/component docs + shared substrate | 当前后端仅稳定支持 `users/getUserInfo` 与 `index/updateUserInfo` 的基础字段，旧版角色/部门/岗位/职级编辑链路不直接固化 | page tests + local gates green | remote static verification and runtime profile fetch/update verification green | done |
| Business Wave 4 | `mini-program/notebook-category` | route/api/component docs + shared substrate | Vue2 历史页面保留多余状态字段，当前仅按 `categories/*` 的 `name/description/priority` 最小契约迁移 | page tests + local gates green | remote static verification plus runtime add/list/delete verification green | done |
| Business Wave 5 | `mini-program/notebook-label` | route/api/component docs + shared substrate | `labels/*` 依赖 `categories/list`，且当前后端会把空字符串转 `null`，`description` 需保证非空 | page tests + local gates green | remote static verification plus runtime add/list/delete verification green | done |
| Business Wave 6 | `system/role` | route/api/component docs + shared substrate | `role/index` 仅接受扁平 `name` 查询参数，`role/status/{id}` 当前后端契约要求布尔 `status` | page tests + local gates green | remote static verification plus runtime add/permission/status/delete verification green | done |
| Business Wave 7 | `mini-program/photo` | route/api/component docs + shared substrate | `photo-categories/list` 当前远端可能返回无 `data` 字段响应，需前端做空数组回退；`photo-category` 新增阻塞仍延续 | page tests + local gates green | remote static verification plus runtime add/list/edit/batch-delete verification green | done |
| Business Wave 8 | `mini-program/notebook` | route/api/component docs + shared substrate | `articles/add` 在当前远端环境实际要求可写 `labelId`（数据库字段无默认值）；分类/标签空字符串会被后端转 `null` 导致字符串校验失败 | page tests + local gates green | remote static verification plus runtime category+label+article add/list/edit/delete verification green | done |
| Business Wave 9 | `mini-program/wallpaper-classify` | route/api/component docs + shared substrate | 列表接口会返回带签名的 `picUrl`，编辑时回写需避免直接持久化临时签名 URL | page tests + local gates green | remote static verification plus runtime add/list/edit/delete verification green | done |
| Business Wave 10 | `mini-program/wallpaper` | route/api/component docs + shared substrate | `wallpaper/add` 实际受数据库字段约束影响，`description/nickname/classId/score` 需按全量写模型提交；`url/smallPicUrl` 列表响应为签名地址 | page tests + local gates green | remote static verification plus runtime add/list/edit/delete verification green | done |
| Business Wave 11 | `system/menu` | route/api/component docs + shared substrate | 后端菜单契约是平铺表模型（`pid/type/hide/target`），并非 Vue Router 结构；`target` 存在历史数值/字符串语义漂移 | page tests + local gates green | remote static verification plus runtime add/list/info/edit/delete verification green | done |
| Later System Waves | other `system` modules | updated docs and substrate | tree-select, hidden route, option API drift | local gates green | remote verified | pending |
| Later Mini Program Waves | other `mini-program` modules | updated docs and substrate | upload, qiniu, editor, category dependencies | local gates green | remote verified | pending |
| Develop Wave | `develop/*` | updated docs and substrate | mavon-editor, drag-and-drop, optional legacy tooling | local gates green | remote verified | pending |

## Current Execution Decision

- 当前按用户决策暂缓后续业务迁移 wave。
- 本阶段目标切换为系统范围收口，仅保留并维护：
  - `system/user`
  - `system/role`
  - `system/menu`
- `2026-04-01` 已完成一次系统范围联合回归（local + remote-first + runtime API），结果为通过。
- `2026-04-02` 已补做收口阶段的远端可达性检查：
  - `/system/user`
  - `/system/role`
  - `/system/menu`
  三个前端路由在远端运行态均返回 `200 OK`，前端壳层可正常接管。

## Deferred Backlog

- `mini-program/photo-category`
  - 原因：当前远端后端 `POST /api/photo-categories/add` 仍会在 `PhotoCategoryController::add` 因 `authorizeForMember()` 返回 `null` 触发 `500`
- `mini-program/*` 其余模块
  - 原因：本轮已完成迁移验证，但当前已按用户决策暂停继续扩展新范围
- `other system` 模块
  - 原因：当前阶段只维护 `system/user`、`system/role`、`system/menu`
- `develop/*`
  - 原因：不属于本轮系统范围收口目标
- `system/position`
  - 原因：当前远端后端未发现对应路由，不能作为下一优先迁移模块

## Resume Order

如果后续恢复业务迁移，建议严格按以下顺序重启：

1. 先确认是否继续只做已存在后端路由的模块
2. 优先处理 deferred 中“已知仅剩运行态阻塞”的模块：
   - `mini-program/photo-category`
3. 然后再选择新的业务 wave
4. 每次恢复都重复：
   - 本地闸门
   - `._*` 清理
   - remote sync
   - 远端容器内静态校验
   - 远端运行态联调

## Current Gate Rules

- Task 3 完成前，不进入 Task 4 代码实现。
- Task 4 完成本地验证后，必须先执行：
  - 本地 `._*` 清理
  - remote sync
  - remote static verification
- 不从当前线程重复执行 `docker compose up`；远端运行态由用户已启动实例承担。

## Immediate Execution Order

当前线程固定按以下顺序推进：

1. 写完 Task 3 的 5 份迁移文档
2. 为 Task 4 写失败测试
3. 实现 auth/menu/layout/login/dashboard 最小闭环
4. 跑本地质量闸门
5. 执行 remote sync 与 remote static verification
6. 进入 Task 5 / Shared CRUD Substrate
7. 进入 Task 6A / `system/user`
8. 进入 Task 6B / `mini-program/photo-category`
9. 进入 Task 6C / `system/user/info`
10. 进入 Task 6D / `mini-program/notebook-category`
11. 进入 Task 6E / `mini-program/notebook-label`
12. 进入 Task 6F / `system/role`
13. 进入 Task 6G / `mini-program/photo`
14. 进入 Task 6H / `mini-program/notebook`
15. 进入 Task 6I / `mini-program/wallpaper-classify`
16. 进入 Task 6J / `mini-program/wallpaper`
17. 进入 Task 6K / `system/menu`
18. 后续每个业务 wave 都重复 remote-first 校验，并附着到现有远端运行态做页面调试

## Risk Ledger To Carry Forward

- `system/user` 新增接口路径不一致
- `system/user/info` 仍使用单数旧路径
- `system/user` 批量删除路径未在当前路由文件中确认
- `system/user` Vue2 历史 `gender` 筛选未在当前 `UsersController@index` 过滤白名单中确认
- `photo-category` 删除路径单复数不一致
- `photo-category` 远端新增接口当前在 `PhotoCategoryController::add` 因 `authorizeForMember()` 返回 `null` 触发 `array_merge()` 500
- `categories/*` 与 `labels/*` 在当前后端环境对 `description` 的非空要求更严格；Vue3 侧已在序列化阶段补齐空描述回退
- `role/index` 当前后端环境不接受 `filter[name]`，仅接受扁平 `name` 查询参数
- `role/status/{id}` 当前后端环境要求布尔型 `status`；Vue3 侧已在 API 层做 `1/2` 与布尔值双向映射
- `photo-categories/list` 当前后端环境在空数据时可能仅返回 `code/msg`，不含 `data` 字段；Vue3 `photo` API 层已做空数组回退
- `articles/add` 在当前远端环境虽然请求校验未显式要求 `labelId`，但数据库层 `label_id` 无默认值，新增时需提交有效 `labelId`
- `articles/*`、`categories/*`、`labels/*` 在当前远端环境会把空字符串转 `null`，前端序列化需避免把 `cover` / `description` 发空字符串
- 当前远端后端路由中未发现 `system/position` 相关接口，不能作为下一优先迁移模块
- `wallpaper/index` 会返回签名后的 `url` / `smallPicUrl`，编辑提交流程需先做 URL 归一化，避免把临时签名参数持久化
- `wallpaper` 的 `smallPicUrl` 在列表读取阶段由后端按 `url + ?imageMogr2/thumbnail/!30p` 动态生成，前端不要假设它与库内原始值完全一致
- `menu/*` 当前后端编辑接口仍未走严格 `MenuRequest` 校验；新增/编辑需继续以前端字段约束为主，避免把无效数据透传入库
- `/forget` 白名单与真实路由不一致
- 401 登录回跳参数名不一致
- 权限数据来源存在 `authorities` 与 `permission` 双轨
- Vue3 shell 之前把浏览器 API 请求发往 `127.0.0.1:8000/api`；该问题已在本地修复，Task 6A 期间已在远端运行态确认验证码与登录恢复
