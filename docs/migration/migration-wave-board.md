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
| Business Wave 2 | `mini-program/photo-category` | route/api/component docs + shared substrate | `/photo-category/{id}` vs `/photo-categories/{category}`, 历史后端 `member_id` / `authorizeForMember()` 写入逻辑曾导致新增阻塞 | page tests + local gates green | remote static verification plus runtime add/list/delete verification green | done |
| Business Wave 3 | `system/user/info` | route/api/component docs + shared substrate | 当前后端仅稳定支持 `users/getUserInfo` 与 `index/updateUserInfo` 的基础字段，旧版角色/部门/岗位/职级编辑链路不直接固化 | page tests + local gates green | remote static verification and runtime profile fetch/update verification green | done |
| Business Wave 4 | `mini-program/notebook-category` | route/api/component docs + shared substrate | Vue2 历史页面保留多余状态字段，当前仅按 `categories/*` 的 `name/description/priority` 最小契约迁移 | page tests + local gates green | remote static verification plus runtime add/list/delete verification green | done |
| Business Wave 5 | `mini-program/notebook-label` | route/api/component docs + shared substrate | `labels/*` 依赖 `categories/list`，且当前后端会把空字符串转 `null`，`description` 需保证非空 | page tests + local gates green | remote static verification plus runtime add/list/delete verification green | done |
| Business Wave 6 | `system/role` | route/api/component docs + shared substrate | `role/index` 仅接受扁平 `name` 查询参数，`role/status/{id}` 当前后端契约要求布尔 `status` | page tests + local gates green | remote static verification plus runtime add/permission/status/delete verification green | done |
| Business Wave 7 | `mini-program/photo` | route/api/component docs + shared substrate | `photo-categories/list` 当前远端可能返回无 `data` 字段响应，需前端做空数组回退 | page tests + local gates green | remote static verification plus runtime add/list/edit/batch-delete verification green | done |
| Business Wave 8 | `mini-program/notebook` | route/api/component docs + shared substrate | `articles/add` 在当前远端环境实际要求可写 `labelId`（数据库字段无默认值）；分类/标签空字符串会被后端转 `null` 导致字符串校验失败 | page tests + local gates green | remote static verification plus runtime category+label+article add/list/edit/delete verification green | done |
| Business Wave 9 | `mini-program/wallpaper-classify` | route/api/component docs + shared substrate | 列表接口会返回带签名的 `picUrl`，编辑时回写需避免直接持久化临时签名 URL | page tests + local gates green | remote static verification plus runtime add/list/edit/delete verification green | done |
| Business Wave 10 | `mini-program/wallpaper` | route/api/component docs + shared substrate | `wallpaper/add` 实际受数据库字段约束影响，`description/nickname/classId/score` 需按全量写模型提交；`url/smallPicUrl` 列表响应为签名地址 | page tests + local gates green | remote static verification plus runtime add/list/edit/delete verification green | done |
| Business Wave 11 | `system/menu` | route/api/component docs + shared substrate | 后端菜单契约是平铺表模型（`pid/type/hide/target`），并非 Vue Router 结构；`target` 存在历史数值/字符串语义漂移 | page tests + local gates green | remote static verification plus runtime add/list/info/edit/delete verification green | done |
| Business Wave 12 | `member/memberlevel` | route/api/component docs + shared substrate | 历史后端 `member_level.deleted_at` 被建成 `unsignedTinyInteger`，软删除写入 Unix 时间戳时会导致批删 500 | page tests + local gates green | remote static verification plus runtime add/list/edit/batchDelete verification green | done |
| Business Wave 13 | `member/member` | route/api/component docs + shared substrate | `members/add` 依赖稳定 `user_id` 选择链路；首轮仅收口查询、编辑、状态切换、删除与会员等级选项加载 | page tests + local gates green | remote static verification plus runtime list/edit/status/delete verification green | done |
| Later System Waves | other `system` modules | updated docs and substrate | tree-select, hidden route, option API drift | local gates green | remote verified | pending |
| Later Mini Program Waves | other `mini-program` modules | updated docs and substrate | upload, qiniu, editor, category dependencies | local gates green | remote verified | pending |
| Develop Wave | `develop/*` | updated docs and substrate | mavon-editor, drag-and-drop, optional legacy tooling | local gates green | remote verified | done (`develop/convert-path`, `develop/init-model`, `develop/work-platform`, `develop/work-daily`, `develop/work-doc`) |

## Current Execution Decision

- 系统范围收口已完成，并作为当前稳定基线保留：
  - `system/user`
  - `system/role`
  - `system/menu`
- `2026-04-01` 已完成一次系统范围联合回归（local + remote-first + runtime API），结果为通过。
- `2026-04-02` 已补做系统范围远端可达性检查：
  - `/system/user`
  - `/system/role`
  - `/system/menu`
  三个前端路由在远端运行态均返回 `200 OK`。
- 同日已按 wave 顺序恢复迁移，并完成 `develop/convert-path`、`develop/init-model`、`develop/work-platform`、`develop/work-daily` 与 `develop/work-doc`：
  - 本地 `lint`、`typecheck`、`build`、目标测试通过
  - remote sync 完成且无 `._*`
  - 远端容器内 `npm run typecheck`、`npm run build` 通过
  - 远端运行态闭环通过：
    - `/develop/convert-path` 路由 `200 OK`
    - `server-path` add -> list -> info -> edit -> convert -> delete 通过
    - `/develop/init-model` 路由 `200 OK`
    - `init-model` add -> list -> info -> edit -> convert -> delete 通过
    - `/develop/work-platform` 路由 `200 OK`
    - `work-platform` add -> list -> info -> edit -> reorder -> delete 通过
    - `/develop/work-daily` 路由 `200 OK`
    - `work-daily` add -> list -> info -> edit -> report-models -> month-report -> delete 通过
    - `/develop/work-doc` 路由 `200 OK`
    - `work-doc-category` add -> list -> info -> edit -> reorder -> delete 通过
    - `work-doc` add -> list -> info -> edit -> delete 通过
- 同日已继续进入 `member/*` wave，并完成 `member/memberlevel`：
  - 本地 `test:run`、`lint`、`typecheck`、`build` 通过
  - remote sync 完成且无 `._*`
  - 远端前端容器内 `npm run typecheck`、`npm run build` 通过
  - 远端前端路由 `/member/memberlevel` 返回 `200 OK`
  - 远端后端迁移 `2026_04_02_113000_fix_member_level_deleted_at_column` 已执行
  - 远端运行态闭环通过：
    - `member-level` add -> list -> edit -> batchDelete 通过
- 同日已继续完成 `member/member`：
  - 本地目标测试、`lint`、`typecheck`、`build` 通过
  - remote sync 完成且无 `._*`
  - 远端前端容器内 `npm run typecheck`、`npm run build` 通过
  - 远端前端路由 `/member/member` 返回 `200 OK`
  - 远端运行态闭环通过：
    - `member` list -> edit -> status -> delete 通过
  - 当前仍未把 create 纳入闭环：
    - `members/add` 依赖单独的 `user_id` 选择链路
    - 本轮先不实现未验证的创建入口
- 同日已完成一轮 Vue2 页面结构复原收口：
  - 引入共享后台页骨架：
    - `AdminPageCard`
    - `AdminPageToolbar`
    - `AdminSplitWorkspace`
    - `admin-page.css`
  - 已完成结构复原的高频页面：
    - `system/user`
    - `system/role`
    - `system/menu`
    - `member/member`
    - `develop/convert-path`
    - `develop/init-model`
    - `develop/work-daily`
    - `develop/work-doc`
  - 本地闸门通过：
    - `test:run`
    - `lint`
    - `typecheck`
    - `build`

## Deferred Backlog

- `mini-program/*` 其余模块
  - 原因：本轮已完成迁移验证，但当前已按用户决策暂停继续扩展新范围
- `other system` 模块
  - 原因：当前阶段只维护 `system/user`、`system/role`、`system/menu`
- `system/position`
  - 原因：当前远端后端未发现对应路由，不能作为下一优先迁移模块

## Resume Order

业务迁移现已恢复，后续建议按以下顺序继续：

1. 当前 `develop/*` wave 已全部完成，`member/*` wave 也已全部完成
2. 当前可继续沿着 Vue2 结构复原策略把同类已迁移页继续收拢，或者回到 long-tail backlog 重新选择下一条业务线
3. 每次继续新模块都重复：
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

当前线程已恢复按 wave 顺序推进，执行顺序更新为：

1. 维持 `system/user`、`system/role`、`system/menu` 作为已验证稳定基线
2. 维持 `develop/convert-path`、`develop/init-model`、`develop/work-platform`、`develop/work-daily`、`develop/work-doc`、`member/memberlevel` 与 `member/member` 作为当前已完成基线
3. 当前 `member/*` wave 已收口；后续如继续迁移，需要先从剩余 long-tail 模块里明确下一条业务线
4. 每次继续新模块都重复既有 remote-first 顺序：
   - 本地闸门
   - `._*` 清理
   - remote sync
   - 远端容器内静态校验
   - 远端运行态联调

## Risk Ledger To Carry Forward

- `system/user` 新增接口路径不一致
- `system/user/info` 仍使用单数旧路径
- `system/user` 批量删除路径未在当前路由文件中确认
- `system/user` Vue2 历史 `gender` 筛选未在当前 `UsersController@index` 过滤白名单中确认
- `photo-category` 删除路径单复数不一致
- `photo-category` 当前后端真实写模型要求创建时稳定写入 `member_id`；控制器已在 `2026-04-02` 改为取当前登录会员，后续不要再把查询作用域 `authorizeForMember()` 复用于写入归属
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
- `server-path/*` 当前后端列表/详情会把 `sources` 作为 JSON 字符串返回，Vue3 侧已在 API 层做数组化归一
- `init-model/convert/*` 当前后端会把生成结果直接作为字符串 `data` 返回，Vue3 侧需按字符串结果展示而不是数组
- `work-platform/reorder` 已通过远端契约验证；Vue3 当前用上移/下移加保存排序实现，不额外引入拖拽依赖
- `work-daily/report/models` 在当前远端环境返回 `currentModel` 驼峰字段；Vue3 API 层已同时兼容 `currentModel/current_model`
- `work-doc/index` 当前远端契约使用 `pageSize` 分页参数，且分类排序接口要求 `order[{id,parent_id,sort}]`；Vue3 API 层已按该写模型发送
- `work-doc` 当前 Vue3 页面先以 textarea + 纯文本预览替代 Vue2 `mavon-editor`，后续如需恢复富文本体验再单独评估依赖
- `work-daily/report/*` 当前已验证月报导出链路；Markdown 导入能力已完成本地测试与前端接线，但本轮远端 smoke 尚未补做文件上传验证
- `member-level` 的历史建表迁移曾把 `deleted_at` 定成 `unsignedTinyInteger`；当前远端已通过 `2026_04_02_113000_fix_member_level_deleted_at_column` 修正为 `unsignedInteger`，后续新环境也要保留这个 schema 口径
- `members/index` 当前远端真实查询契约使用扁平 `username` / `nickname` / `gender` 参数；Vue3 `member` API 层不要发送 `filter[username]` 这类嵌套查询
- `members/status/{id}` 当前远端会成功更新状态，但响应体仍可能返回修改前的其他字段快照；列表开关链路应以状态值成功提交为准，并在需要完整数据时重新拉取列表
- `/forget` 白名单与真实路由不一致
- 401 登录回跳参数名不一致
- 权限数据来源存在 `authorities` 与 `permission` 双轨
- Vue3 shell 之前把浏览器 API 请求发往 `127.0.0.1:8000/api`；该问题已在本地修复，Task 6A 期间已在远端运行态确认验证码与登录恢复
