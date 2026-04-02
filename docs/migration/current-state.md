# blog-ui-vue3 Current State

## Snapshot

- Snapshot date: `2026-04-02`
- Local project path: `/Volumes/T7/Program/Personal/blog/blog-ui-vue3`
- Remote project path: `/data/personal/projects/blog-ui-vue3`
- Remote origin: `git@github.com:wertyq111/blog-ui-vue3.git`
- Local baseline branch: `main`
- Remote baseline branch: `main`

## Repo Alignment Result

`blog-ui-vue3` was originally created as an untracked directory inside the overview workspace. On `2026-03-31`, it was realigned into an independent git repository by:

1. Backing up the provisional local scaffold to `/Volumes/T7/Program/Personal/blog/blog-ui-vue3.local-backup-20260331`
2. Cloning the true remote repo into `/Volumes/T7/Program/Personal/blog/blog-ui-vue3`
3. Overlaying the provisional scaffold back into the cloned repo while excluding `.git`, `node_modules`, and `._*`

This means future commits for the Vue3 frontend must happen inside the `blog-ui-vue3` repo only, not in the overview repo and not in the old `blog-ui` repo.

## Local File Tree Summary

Current top-level working tree:

- `README.md`
- `compose.yaml`
- `app/`
- `docs/migration/`

Current `app/` scaffold includes:

- `Dockerfile`
- `package.json`
- `package-lock.json`
- `vite.config.ts`
- `vitest.config.ts`
- `tsconfig.json`
- `tsconfig.node.json`
- `.env.example`
- `.eslintrc.cjs`
- `index.html`
- `src/main.ts`
- `src/api/auth.ts`
- `src/api/client.ts`
- `src/api/notebook-category.ts`
- `src/api/notebook-label.ts`
- `src/api/system-role.ts`
- `src/api/system-user.ts`
- `src/api/photo.ts`
- `src/api/notebook-article.ts`
- `src/api/wallpaper-classify.ts`
- `src/api/wallpaper.ts`
- `src/components/AppDialog.vue`
- `src/composables/use-crud-list.ts`
- `src/composables/use-dialog-form.ts`
- `src/composables/use-permission-access.ts`
- `src/config/env.ts`
- `src/directives/permission.ts`
- `src/layouts/AdminLayout.vue`
- `src/router/index.ts`
- `src/router/dynamic.ts`
- `src/router/guards.ts`
- `src/router/static.ts`
- `src/stores/auth-storage.ts`
- `src/stores/auth.ts`
- `src/env.d.ts`
- `src/test/setup.ts`
- `src/types/api.ts`
- `src/types/auth.ts`
- `src/types/menu.ts`
- `src/types/photo-category.ts`
- `src/types/notebook-label.ts`
- `src/types/system-user.ts`
- `src/types/wallpaper-classify.ts`
- `src/types/wallpaper.ts`
- `src/api/__tests__/client.test.ts`
- `src/api/__tests__/notebook-category.test.ts`
- `src/api/__tests__/notebook-label.test.ts`
- `src/api/__tests__/photo-category.test.ts`
- `src/api/__tests__/system-role.test.ts`
- `src/api/__tests__/system-user.test.ts`
- `src/api/__tests__/photo.test.ts`
- `src/api/__tests__/notebook-article.test.ts`
- `src/api/__tests__/wallpaper-classify.test.ts`
- `src/api/__tests__/wallpaper.test.ts`
- `src/config/__tests__/env.test.ts`
- `src/router/__tests__/guards.test.ts`
- `src/router/__tests__/static.test.ts`
- `src/stores/__tests__/auth.test.ts`
- `src/utils/__tests__/access.test.ts`
- `src/utils/__tests__/http.test.ts`
- `src/utils/__tests__/menu.test.ts`
- `src/utils/access.ts`
- `src/utils/feedback.ts`
- `src/utils/http.ts`
- `src/utils/menu.ts`
- `src/composables/__tests__/use-crud-list.test.ts`
- `src/composables/__tests__/use-dialog-form.test.ts`
- `src/directives/__tests__/permission.test.ts`
- `src/views/login/index.vue`
- `src/views/mini-program/photo-category/index.vue`
- `src/views/mini-program/photo-category/use-photo-category-page.ts`
- `src/views/mini-program/photo-category/components/PhotoCategoryEditDialog.vue`
- `src/views/mini-program/photo-category/__tests__/use-photo-category-page.test.ts`
- `src/views/mini-program/photo/index.vue`
- `src/views/mini-program/photo/use-photo-page.ts`
- `src/views/mini-program/photo/components/PhotoEditDialog.vue`
- `src/views/mini-program/photo/__tests__/use-photo-page.test.ts`
- `src/views/mini-program/notebook-category/index.vue`
- `src/views/mini-program/notebook-category/use-notebook-category-page.ts`
- `src/views/mini-program/notebook-category/components/NotebookCategoryEditDialog.vue`
- `src/views/mini-program/notebook-category/__tests__/use-notebook-category-page.test.ts`
- `src/views/mini-program/notebook-label/index.vue`
- `src/views/mini-program/notebook-label/use-notebook-label-page.ts`
- `src/views/mini-program/notebook-label/components/NotebookLabelEditDialog.vue`
- `src/views/mini-program/notebook-label/__tests__/use-notebook-label-page.test.ts`
- `src/views/mini-program/notebook/index.vue`
- `src/views/mini-program/notebook/use-notebook-page.ts`
- `src/views/mini-program/notebook/components/NotebookEditDialog.vue`
- `src/views/mini-program/notebook/__tests__/use-notebook-page.test.ts`
- `src/views/mini-program/wallpaper-classify/index.vue`
- `src/views/mini-program/wallpaper-classify/use-wallpaper-classify-page.ts`
- `src/views/mini-program/wallpaper-classify/components/WallpaperClassifyEditDialog.vue`
- `src/views/mini-program/wallpaper-classify/__tests__/use-wallpaper-classify-page.test.ts`
- `src/views/mini-program/wallpaper/index.vue`
- `src/views/mini-program/wallpaper/use-wallpaper-page.ts`
- `src/views/mini-program/wallpaper/components/WallpaperEditDialog.vue`
- `src/views/mini-program/wallpaper/__tests__/use-wallpaper-page.test.ts`
- `src/views/system/user/index.vue`
- `src/views/system/user/use-user-page.ts`
- `src/views/system/user/components/UserEditDialog.vue`
- `src/views/system/user/__tests__/use-user-page.test.ts`
- `src/views/system/role/index.vue`
- `src/views/system/role/use-role-page.ts`
- `src/views/system/role/components/RoleEditDialog.vue`
- `src/views/system/role/components/RolePermissionDialog.vue`
- `src/views/system/role/__tests__/use-role-page.test.ts`
- `src/views/system/menu/index.vue`
- `src/views/system/menu/use-menu-page.ts`
- `src/views/system/menu/components/MenuEditDialog.vue`
- `src/views/system/menu/__tests__/use-menu-page.test.ts`
- `src/api/system-menu.ts`
- `src/api/__tests__/system-menu.test.ts`
- `src/types/system-menu.ts`
- `src/views/system/user/info/index.vue`
- `src/views/system/user/info/use-user-info-page.ts`
- `src/views/system/user/info/__tests__/use-user-info-page.test.ts`
- `src/views/dashboard/workplace/index.vue`

## Remote File Tree Summary

Current remote host worktree at `/data/personal/projects/blog-ui-vue3` has now been refreshed from the local Vue3 repo-aligned state via `rsync` with `.git` preserved on the remote side.

Remote static verification on `2026-04-01` confirmed for Task 4, Task 5, Task 6A, Task 6B, Task 6C, Task 6D, Task 6E, Task 6F, Task 6G, Task 6H, Task 6I, and Task 6J worktrees:

- `origin` points to `git@github.com:wertyq111/blog-ui-vue3.git`
- remote branch is `main`
- no remote `._*` files remained after cleanup
- `docker compose config` resolves successfully for the current `compose.yaml`
- the synced remote worktree now includes the `system/user` implementation from Task 6A
- the synced remote worktree now includes the `mini-program/photo-category` implementation from Task 6B, including the Chinese function comments added for this wave
- the synced remote worktree now includes the `system/user/info` implementation from Task 6C
- the synced remote worktree now includes the `mini-program/notebook-category` implementation from Task 6D
- the synced remote worktree now includes the `mini-program/notebook-label` implementation from Task 6E
- the synced remote worktree now includes the `system/role` implementation from Task 6F
- the synced remote worktree now includes the `mini-program/photo` implementation from Task 6G
- the synced remote worktree now includes the `mini-program/notebook` implementation from Task 6H
- the synced remote worktree now includes the `mini-program/wallpaper-classify` implementation from Task 6I
- the synced remote worktree now includes the `mini-program/wallpaper` implementation from Task 6J
- the synced remote worktree now includes the `system/menu` implementation for current system-scope closure

Remote closure follow-up on `2026-04-02` additionally confirmed:

- `/system/user`, `/system/role`, and `/system/menu` all return `200 OK` from the remote frontend runtime on port `8083`
- the current system-scope freeze remains:
  - `system/user`
  - `system/role`
  - `system/menu`
- later business waves are now treated as deferred backlog rather than active execution scope

## Scaffold Assessment

The current scaffold is useful as a starting point, but it is still provisional. It already contains:

- Node `>=22` engine declaration
- Vue 3 / TypeScript / Vite / Pinia / Vue Router / Element Plus dependency setup
- Vitest and ESLint baseline configuration
- Docker development compose mapping on port `8083`
- Minimal app bootstrap with `main.ts`
- Static router bootstrap with login and dashboard placeholder routes
- Environment normalization helper for `VITE_APP_TITLE` and `VITE_API_BASE_URL`
- Initial domain type definitions
- Pure-logic test coverage for access, HTTP, menu, env, and static routes
- Local quality-gate pass on `test:run`, `lint`, `typecheck`, and `build`

The scaffold is not yet a fully runtime-verified admin application. At the time of this snapshot, it still lacks:

- a closed remote runtime verification for `mini-program/photo-category`
- remote runtime verification for later business waves
- a browser-level automated smoke pass in this Codex session, because the local Playwright tool environment currently cannot create its required `/.playwright-mcp` working directory

## Keep / Rebuild Guidance For Task 2

Strong candidates to keep and refine:

- `app/package.json`
- `app/package-lock.json`
- `app/Dockerfile`
- `compose.yaml`
- `app/vite.config.ts`
- `app/vitest.config.ts`
- `app/tsconfig*.json`
- `app/src/config/env.ts`
- `app/src/router/index.ts`
- `app/src/router/static.ts`
- `app/src/main.ts`
- `app/src/types/*`
- `app/src/utils/access.ts`
- `app/src/utils/http.ts`
- `app/src/utils/menu.ts`
- `app/src/config/__tests__/*`
- `app/src/router/__tests__/*`
- `app/src/utils/__tests__/*`

Strong candidates to create or rebuild in Task 2:

- `app/src/components/**/*`
- later shared CRUD abstractions for Wave 1+
- business views beyond login and dashboard

## Known Risks And Incomplete Areas

- The filesystem can generate `._*` AppleDouble files during clone or copy operations on this workspace path.
- The app scripts now clean `src/**/._*` before `test`, `lint`, `typecheck`, and `build`, but remote sync still requires explicit cleanup before transfer.
- Task 3 audit docs now exist, but API mismatches remain open and must not be treated as settled contracts before remote verification.
- Task 5 shared CRUD substrate is now implemented locally and has been synced plus statically verified on the remote repo path.
- Task 6A `system/user` is now implemented locally on top of the Task 5 substrate, has passed local quality gates, and has been synced plus statically verified on the remote repo path.
- Task 6A page-level debugging has now closed the confirmed user-list query mismatch: the Vue3 page emits QueryBuilder-compatible `filter[...]` params instead of flat `username` / `phone` / `status` params.
- Remote container verification on `2026-04-01` confirmed `docker exec blog-ui-vue3-web-1` can run `npm run typecheck` and `npm run build` successfully against the synced Vue3 worktree.
- Remote runtime verification on `2026-04-01` confirmed `/api/users/list` now filters correctly for both matching and non-matching `filter[username]` queries against the current backend data set.
- Task 6B `mini-program/photo-category` is now implemented locally on top of the Task 5 substrate, has passed local `test:run`, `lint`, `typecheck`, and `build`, and has been synced plus statically verified inside the running remote frontend container.
- Remote runtime verification on `2026-04-01` confirmed the Vue3 `photo-category` API layer serializes the current backend contract as flat `name` query params, for example `/photo-categories/index?name=codex-photo-check&page=1`.
- Remote runtime verification on `2026-04-01` confirmed authenticated `GET /api/photo-categories/index?page=1` currently returns `200 OK` with an empty collection for the seeded account.
- Task 6B runtime verification still has a known backend blocker: authenticated `POST /api/photo-categories/add` returns `500` from `App\Http\Controllers\Api\MiniProgram\PhotoCategoryController::add` because `array_merge()` receives `null` from `authorizeForMember()` at line `109`.
- This blocker is now explicitly deferred by migration decision so the frontend wave sequence can continue; add/delete runtime closure for `photo-category` will be patched in a later stabilization pass.
- Task 6C `system/user/info` has completed local implementation and local quality gates with Chinese function comments, and has now passed remote static verification in the running frontend container.
- Remote runtime verification on `2026-04-01` confirmed authenticated `GET /api/users/getUserInfo?include=member` and `POST /api/index/updateUserInfo` both return `200` on the current remote backend.
- Task 6D `mini-program/notebook-category` has completed local implementation with Chinese function comments on top of the shared CRUD substrate, and has passed local `test:run`, `lint`, `typecheck`, and `build`.
- Remote runtime verification on `2026-04-01` confirmed Task 6D now sends the expected list query `/categories/index?name=...&page=...` and completes authenticated `POST /api/categories/add` -> `GET /api/categories/index` -> `DELETE /api/categories/{id}` end-to-end.
- Task 6E `mini-program/notebook-label` has completed local implementation with Chinese function comments on top of the shared CRUD substrate, and has passed local `test:run`, `lint`, `typecheck`, and `build`.
- Remote runtime verification on `2026-04-01` confirmed Task 6E now sends the expected list query `/labels/index?include=category&name=...&page=...` and completes authenticated `POST /api/labels/add` -> `GET /api/labels/index` -> `DELETE /api/labels/{id}` end-to-end.
- During Task 6E runtime debugging, the current backend environment showed stricter `description` behavior (`ConvertEmptyStringsToNull` + table non-null). Vue3 API serialization now falls back blank `description` to trimmed `name` for both `notebook-category` and `notebook-label`.
- Task 6F `system/role` has completed local implementation on top of the shared CRUD substrate, and has passed local `test:run`, `lint`, `typecheck`, and `build`.
- Remote runtime verification on `2026-04-01` confirmed Task 6F completes authenticated `POST /api/role/add` -> `GET /api/role/permission/{id}` -> `POST /api/role/permission/{id}` -> `POST /api/role/status/{id}` -> `DELETE /api/role/{id}` end-to-end.
- Task 6F runtime debugging confirmed current backend contract details: `/api/role/index` filtering must use flat `name` query params (not `filter[name]`), and `/api/role/status/{id}` requires boolean `status`; Vue3 `system-role` API now keeps UI `1/2` status while serializing boolean outbound and normalizing inbound.
- Task 6G `mini-program/photo` has completed local implementation on top of the shared CRUD substrate, and has passed local `test:run`, `lint`, `typecheck`, and `build`.
- Remote runtime verification on `2026-04-01` confirmed Task 6G completes authenticated `POST /api/photo/add` -> `GET /api/photo/index` -> `POST /api/photo/{id}` -> `DELETE /api/photo/batch-delete` end-to-end.
- Task 6G runtime debugging confirmed `/api/photo-categories/list` can return only `code/msg` without `data` when category list is empty in current environment; Vue3 `photo` API now safely falls back to `[]` for category options.
- Task 6H `mini-program/notebook` has completed local implementation on top of the shared CRUD substrate, and has passed local `test:run`, `lint`, `typecheck`, and `build`.
- Remote runtime verification on `2026-04-01` confirmed Task 6H completes authenticated `POST /api/categories/add` -> `POST /api/labels/add` -> `POST /api/articles/add` -> `GET /api/articles/index` -> `POST /api/articles/{id}` -> `DELETE /api/articles/{id}` (then cleanup `DELETE /api/labels/{id}` and `DELETE /api/categories/{id}`) end-to-end.
- Task 6H runtime debugging confirmed current backend data contract gaps: `articles/add` currently needs a persisted `labelId` due database-level `label_id` non-null requirement, and empty strings for `cover`/`description` are converted to `null` and can fail `string` validation.
- Task 6I `mini-program/wallpaper-classify` has completed local implementation on top of the shared CRUD substrate, and has passed local `test:run`, `lint`, `typecheck`, and `build`.
- Remote static verification on `2026-04-01` confirmed Task 6I passes `docker compose exec -T web npm run typecheck` and `docker compose exec -T web npm run build` inside the running frontend container.
- Remote runtime verification on `2026-04-01` confirmed Task 6I completes authenticated `POST /api/wallpaper-classify/add` -> `GET /api/wallpaper-classify/index` -> `POST /api/wallpaper-classify/{id}` -> `DELETE /api/wallpaper-classify/{id}` end-to-end.
- Task 6I runtime debugging confirmed `wallpaper-classify/index` returns signed `picUrl`; page-level editing should avoid persisting a temporary signed URL directly as long-term cover data.
- Task 6J `mini-program/wallpaper` has completed local implementation on top of the shared CRUD substrate, and has passed local `test:run`, `lint`, `typecheck`, and `build`.
- Remote static verification on `2026-04-01` confirmed Task 6J passes `docker compose exec -T web npm run typecheck` and `docker compose exec -T web npm run build` inside the running frontend container.
- Remote runtime verification on `2026-04-01` confirmed Task 6J completes authenticated `POST /api/wallpaper/add` -> `GET /api/wallpaper/index` -> `POST /api/wallpaper/{id}` -> `DELETE /api/wallpaper/{id}` end-to-end.
- Task 6J runtime debugging confirmed the current backend requires `wallpaper` add/edit requests to follow the full write-model (`classId/nickname/url/smallPicUrl/description/score`) for stable success; Vue3 API serialization now keeps these fields explicit and normalizes signed URLs before submit.
- Task 6J runtime debugging also confirmed `wallpaper/index` responds with signed `url/smallPicUrl` and array `tags`; Vue3 list + edit mapping now treats signed URLs as read-model values and sanitizes them before persistence.
- `system/menu` has now completed local implementation on top of the Task 5 substrate, and passed local `test:run`, `lint`, `typecheck`, and `build`.
- Remote static verification on `2026-04-01` confirmed `system/menu` passes `docker compose exec -T web npm run typecheck` and `docker compose exec -T web npm run build` inside the running frontend container.
- Remote runtime verification on `2026-04-01` confirmed `system/menu` completes authenticated `POST /api/menu/add` -> `GET /api/menu/index?title=...` -> `GET /api/menu/info/{id}` -> `POST /api/menu/{id}` -> `DELETE /api/menu/{id}` end-to-end.
- `system/menu` runtime debugging reconfirmed the current backend write contract uses `pid` and `target` (`_self`/`_blank`) directly; Vue3 API serialization now fixes this mapping explicitly.
- System-scope closure run on `2026-04-01` confirmed `system/menu` + `system/role` + `system/user` all pass one combined remote-first cycle:
  - local gates: focused tests + `lint` + `typecheck` + `build`
  - remote sync with pre/post `._*` cleanup
  - remote container static checks: `docker compose exec -T web npm run typecheck` and `docker compose exec -T web npm run build`
  - remote runtime API regression:
    - `role`: add -> list -> permission get/save -> status -> delete
    - `user`: add -> list(filter) -> edit -> status -> resetPwd -> delete
    - `menu`: add -> list(filter) -> info -> edit -> delete
- System-scope closure also captured current backend data constraints that affect runtime debugging:
  - `role/add` enforces `name` length `3-25`
  - `users/add` enforces unique `phone`
- Remote closure follow-up on `2026-04-02` confirmed the frontend shell still serves the three in-scope system routes correctly from the current user-managed runtime:
  - `/system/user`
  - `/system/role`
  - `/system/menu`
- Runtime debugging also reconfirmed current remote backend has no `system/position` routes, so this module cannot be selected as the next migration wave until backend routes are introduced.
- The remote-first API base resolution has now been corrected locally: when `VITE_API_BASE_URL` is blank, or still carries the old loopback default while the browser is already on a remote host, the frontend derives `http://<current-host>:3925/api` instead of sending browser traffic to local `127.0.0.1`.
- For this remote runtime snapshot, `http://10.10.9.184:8083/` serves the frontend shell and backend API is exposed at `http://10.10.9.184:3925/api`.
- The remote `docker compose up` lifecycle is now user-managed during this migration thread; future page debugging should attach to the existing remote runtime instead of trying to restart it from this thread.
- SSH access can be disrupted by Clash Verge TUN routing unless the private remote address is forced to `DIRECT`; this is an environment risk, not an application contract.
- The current backend `UsersController@index` only confirms `username`, `phone`, exact `status`, and exact `roles.id` filters. Vue2 historical `gender` filtering is therefore a risk item, not a frozen contract.
- The remote runtime currently answers `200 OK` on `127.0.0.1:8083` from inside the remote host and serves the Vue3 Vite shell, but this workstation still cannot directly reach `http://10.10.9.184:8083/`. That remains an environment-path risk, not a blocker for the now-closed Task 6A query fix.

## Immediate Next Step

Do not continue into new business waves from this thread. The current execution baseline is now frozen to the closed system scope, while later waves stay in deferred backlog until the user explicitly resumes migration:

1. Maintain `system/user`, `system/role`, and `system/menu` as the only active in-scope system modules for this phase
2. Keep `mini-program/photo-category` unchanged unless a frontend-specific bug is reproduced, and carry the backend `POST /api/photo-categories/add` `500` issue as a deferred runtime blocker
3. Treat later `mini-program`, other `system`, and `develop/*` waves as deferred backlog instead of active execution scope
4. If migration resumes later, first reconcile the deferred `photo-category` runtime blocker, then decide whether to reopen later route-backed waves under the same remote-first verification loop
