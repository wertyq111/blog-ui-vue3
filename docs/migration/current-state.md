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
- `src/components/admin-page/AdminPageCard.vue`
- `src/components/admin-page/AdminPageToolbar.vue`
- `src/components/admin-page/AdminSplitWorkspace.vue`
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
- `src/styles/admin-page.css`
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
- `src/api/init-model.ts`
- `src/api/server-path.ts`
- `src/api/work-platform.ts`
- `src/api/work-daily.ts`
- `src/api/__tests__/system-menu.test.ts`
- `src/api/__tests__/init-model.test.ts`
- `src/api/__tests__/server-path.test.ts`
- `src/api/__tests__/work-platform.test.ts`
- `src/api/__tests__/work-daily.test.ts`
- `src/api/__tests__/work-doc.test.ts`
- `src/types/init-model.ts`
- `src/types/system-menu.ts`
- `src/types/server-path.ts`
- `src/types/work-platform.ts`
- `src/types/work-daily.ts`
- `src/types/work-doc.ts`
- `src/views/system/user/info/index.vue`
- `src/views/system/user/info/use-user-info-page.ts`
- `src/views/system/user/info/__tests__/use-user-info-page.test.ts`
- `src/views/dashboard/workplace/index.vue`
- `src/views/develop/convert-path/index.vue`
- `src/views/develop/convert-path/use-convert-path-page.ts`
- `src/views/develop/convert-path/components/ConvertPathEditDialog.vue`
- `src/views/develop/convert-path/components/ConvertPathConvertDialog.vue`
- `src/views/develop/convert-path/__tests__/use-convert-path-page.test.ts`
- `src/views/develop/init-model/index.vue`
- `src/views/develop/init-model/use-init-model-page.ts`
- `src/views/develop/init-model/components/InitModelEditDialog.vue`
- `src/views/develop/init-model/components/InitModelConvertDialog.vue`
- `src/views/develop/init-model/__tests__/use-init-model-page.test.ts`
- `src/views/develop/work-platform/index.vue`
- `src/views/develop/work-platform/use-work-platform-page.ts`
- `src/views/develop/work-platform/components/WorkPlatformEditDialog.vue`
- `src/views/develop/work-platform/__tests__/use-work-platform-page.test.ts`
- `src/views/develop/work-daily/index.vue`
- `src/views/develop/work-daily/use-work-daily-page.ts`
- `src/views/develop/work-daily/components/WorkDailyEditDialog.vue`
- `src/views/develop/work-daily/__tests__/use-work-daily-page.test.ts`
- `src/views/develop/work-doc/index.vue`
- `src/views/develop/work-doc/use-work-doc-page.ts`
- `src/views/develop/work-doc/components/WorkDocEditDialog.vue`
- `src/views/develop/work-doc/components/WorkDocCategoryEditDialog.vue`
- `src/views/develop/work-doc/__tests__/use-work-doc-page.test.ts`
- `src/api/member-level.ts`
- `src/api/member.ts`
- `src/api/__tests__/member-level.test.ts`
- `src/api/__tests__/member.test.ts`
- `src/types/member-level.ts`
- `src/types/member.ts`
- `src/views/member/memberlevel/index.vue`
- `src/views/member/memberlevel/use-member-level-page.ts`
- `src/views/member/memberlevel/components/MemberLevelEditDialog.vue`
- `src/views/member/memberlevel/__tests__/use-member-level-page.test.ts`
- `src/views/member/member/index.vue`
- `src/views/member/member/use-member-page.ts`
- `src/views/member/member/components/MemberEditDialog.vue`
- `src/views/member/member/__tests__/use-member-page.test.ts`

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
- a shared Vue2-structure restoration layer now exists for high-frequency admin pages:
  - `src/components/admin-page/AdminPageCard.vue`
  - `src/components/admin-page/AdminPageToolbar.vue`
  - `src/components/admin-page/AdminSplitWorkspace.vue`
  - `src/styles/admin-page.css`

Develop-wave recovery on `2026-04-02` additionally confirmed:

- the synced remote worktree now includes the `develop/convert-path` implementation
- remote frontend route `/develop/convert-path` returns `200 OK`
- remote container verification passed for `docker compose exec -T web npm run typecheck`
- remote container verification passed for `docker compose exec -T web npm run build`
- remote runtime API smoke passed for `server-path`:
  - add
  - list
  - info
  - edit
  - convert
  - delete
- the synced remote worktree now includes the `develop/init-model` implementation
- remote frontend route `/develop/init-model` returns `200 OK`
- remote runtime API smoke passed for `init-model`:
  - add
  - list
  - info
  - edit
  - convert
  - delete
- the synced remote worktree now includes the `develop/work-platform` implementation
- remote frontend route `/develop/work-platform` returns `200 OK`
- remote runtime API smoke passed for `work-platform`:
  - add
  - list
  - info
  - edit
  - reorder
  - delete
- the synced remote worktree now includes the `develop/work-daily` implementation
- remote frontend route `/develop/work-daily` returns `200 OK`
- remote runtime API smoke passed for `work-daily`:
  - add
  - list
  - info
  - edit
  - report models
  - month report export
  - delete
- the synced remote worktree now includes the `develop/work-doc` implementation
- remote frontend route `/develop/work-doc` returns `200 OK`
- remote runtime API smoke passed for `work-doc-category`:
  - add
  - list
  - info
  - edit
  - reorder
  - delete
- remote runtime API smoke passed for `work-doc`:
  - add
  - list
  - info
  - edit
  - delete
- the synced remote worktree now includes the `member/memberlevel` implementation
- remote frontend route `/member/memberlevel` returns `200 OK`
- remote container verification passed for backend `docker compose exec -T blog php artisan test tests/Unit/MemberLevelMigrationTest.php`
- remote backend migration verification passed for `docker compose exec -T blog php artisan migrate --force`
- remote runtime API smoke passed for `member-level`:
  - add
  - list
  - edit
  - batchDelete
- the synced remote worktree now includes the `member/member` implementation
- remote frontend route `/member/member` returns `200 OK`
- remote runtime API smoke passed for `member`:
  - list
  - edit
  - status
  - delete
- the local worktree now also includes a first-pass Vue2-structure restoration for the current high-frequency pages:
  - `system/user`
  - `system/role`
  - `system/menu`
  - `member/member`
  - `develop/convert-path`
  - `develop/init-model`
  - `develop/work-daily`
  - `develop/work-doc`
- local restoration verification passed for:
  - `test:run`
  - `lint`
  - `typecheck`
  - `build`

## Scaffold Assessment

The current scaffold is useful as a starting point, but it is still provisional. It already contains:

- Node `>=22` engine declaration
- Vue 3 / TypeScript / Vite / Pinia / Vue Router / Element Plus dependency setup
- Vitest and ESLint baseline configuration
- Docker development compose mapping on port `8083`
- Minimal app bootstrap with `main.ts`
- Static router bootstrap with login and dashboard placeholder routes
- Environment normalization helper for `VITE_APP_TITLE` and `VITE_APP_API_URL`
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
- Remote runtime verification follow-up on `2026-04-02` closed the historical backend blocker for `photo-category`:
  - `PhotoCategoryController::add` no longer merges `null` from `authorizeForMember()`
  - the backend now writes `member_id` from the current authenticated member during category creation
  - authenticated `POST /api/photo-categories/add` -> `GET /api/photo-categories/index?name=...` -> `DELETE /api/photo-categories/{id}` now completes successfully on the remote environment
- Remote backend stabilization on `2026-04-02` also repaired a runtime file-permission regression in `/data/personal/projects/blog` so the existing container could continue serving `3925` without a fresh `docker compose up`.
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
- `member/memberlevel` has now completed local implementation on top of the shared CRUD substrate, and passed local `test:run`, `lint`, `typecheck`, and `build`.
- Remote runtime verification on `2026-04-02` confirmed Task `member/memberlevel` completes authenticated `POST /api/member-level/add` -> `GET /api/member-level/index` -> `POST /api/member-level/{id}` -> `DELETE /api/member-level/batchDelete` end-to-end.
- `member/memberlevel` runtime debugging also closed a backend schema blocker:
  - historical migration created `member_level.deleted_at` as `unsignedTinyInteger`
  - the shared soft-delete implementation writes Unix timestamps into `deleted_at`
  - remote migration `2026_04_02_113000_fix_member_level_deleted_at_column` now upgrades that column to `unsignedInteger`
  - batch delete no longer overflows `deleted_at` on the remote MySQL environment
- `member/member` has now completed local implementation on top of the shared CRUD substrate, and passed local focused tests, `lint`, `typecheck`, and `build`.
- Remote runtime verification on `2026-04-02` confirmed Task `member/member` completes authenticated `GET /api/members/index` -> `POST /api/members/{id}` -> `POST /api/members/status/{id}` -> `DELETE /api/members/{id}` end-to-end.
- `member/member` runtime debugging also closed the list-query contract mismatch:
  - current remote backend expects flat query params `username` / `nickname` / `gender`
  - it does not use the nested `filter[username]` shape on this endpoint
  - Vue3 `member` API serialization is now aligned to that flat query contract
- Backend middleware `FilterProcess` is now hardened for Symfony 6:
  - array-shaped `filter` query values are read via `InputBag::all('filter')`
  - flat request filters can still be merged into the normalized `filter` bag
- This wave intentionally keeps create out of scope for now:
  - backend `members/add` requires stable `user_id`
  - the legacy Vue2 page depends on a separate account-selection flow
  - current Vue3 closure therefore focuses on query, edit, status, delete, and member-level option loading
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
- The remote-first API base resolution now uses `VITE_APP_API_PROTOCOL`, `VITE_APP_API_HOST`, `VITE_APP_API_PORT`, and `VITE_APP_API_PREFIX` instead of hard-coded host URLs.
- For this remote runtime snapshot, `${BLOG_UI_VUE3_REMOTE_URL}` serves the frontend shell and backend API is exposed at `${BLOG_BACKEND_REMOTE_API_URL}`.
- The remote `docker compose up` lifecycle is now user-managed during this migration thread; future page debugging should attach to the existing remote runtime instead of trying to restart it from this thread.
- SSH access can be disrupted by Clash Verge TUN routing unless the private remote address is forced to `DIRECT`; this is an environment risk, not an application contract.
- The current backend `UsersController@index` only confirms `username`, `phone`, exact `status`, and exact `roles.id` filters. Vue2 historical `gender` filtering is therefore a risk item, not a frozen contract.
- The remote runtime currently answers `200 OK` on its loopback frontend port from inside the remote host and serves the Vue3 Vite shell, but this workstation still cannot directly reach `${BLOG_UI_VUE3_REMOTE_URL}`. That remains an environment-path risk, not a blocker for the now-closed Task 6A query fix.

## Immediate Next Step

Migration has now resumed beyond the earlier system-only freeze. The current active baseline is the already-closed system scope, the completed develop wave, and the first recovered member wave:

1. Keep `system/user`, `system/role`, `system/menu`, `develop/convert-path`, `develop/init-model`, `develop/work-platform`, `develop/work-daily`, `develop/work-doc`, `member/memberlevel`, and `member/member` as the current verified Vue3 baseline
2. Treat the current `develop/*` route-backed wave as closed for now, because every existing Vue2 `develop` page now has a verified Vue3 counterpart
3. Treat the current `member/*` wave as closed for now, because every existing Vue2 `member` page now has a verified Vue3 counterpart
4. Treat the shared `admin-page` layer and the restored high-frequency pages as the current Vue2-structure recovery baseline
5. Keep using the same remote-first loop for every resumed module:
   - local gates
   - `._*` cleanup
   - remote sync
   - remote container static verification
   - remote runtime smoke
