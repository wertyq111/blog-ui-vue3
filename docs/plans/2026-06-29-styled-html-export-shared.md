# 待办#16 报表HTML导出下沉共用+接入work-doc 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use /executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把带样式 HTML 导出的「后端样式外壳」与「前端预览/打印编排」下沉为共用单元，并给 work-doc 接上同步 HTML 导出。

**Architecture:** 后端抽 `StyledHtmlExportService`（markdown→带样式 HTML），blade 重命名中性名，work-daily 复用、work-doc 新增同步导出端点；前端抽 `useStyledHtmlPreview` composable，work-daily-report 改用、work-doc-preview 接入下载/打印。

**Tech Stack:** Laravel 10 + Pest（后端，远端 sail）；Vue 3.5 + TS + Vite（前端）。

**验证门禁：** 后端用 Pest TDD（远端 `./vendor/bin/sail pest`）；前端无单测设施，按项目约定用 `pnpm build`（type-check + build）+ 逻辑核对（与 writing-plans 默认 TDD 的偏离，已确认）。

**跨仓库提交路由：** Task 1–2 改 blog-dev → 提交 blog-dev 仓库；Task 3–7 改 blog-ui-vue3 → 提交 blog-ui-vue3 仓库。两仓库各自分支：blog-dev 用 `feature/styled-html-export-shared`，blog-ui-vue3 已在 `feature/styled-html-export-shared`。

---

## File Structure

| 文件 | 责任 | 改动 |
|---|---|---|
| `blog-dev/app/Services/Api/Admin/StyledHtmlExportService.php` | markdown→带样式 HTML 共用渲染 | 新建 |
| `blog-dev/resources/views/exports/styled-document.blade.php` | 通用带样式 HTML 外壳 | 由 `work-daily-report.blade.php` 重命名 |
| `blog-dev/app/Services/Api/Admin/WorkDailyReportService.php` | 报表生成 | `renderHtml` 改调共用服务 |
| `blog-dev/app/Http/Controllers/Api/Admin/WorkDocController.php` | work-doc HTTP | 新增 `export` |
| `blog-dev/routes/api.php` | 路由 | 加 `work-doc/{workDoc}/export` |
| `blog-dev/tests/Feature/Api/Admin/WorkDocControllerTest.php` | work-doc 测试 | 新建（Pest） |
| `blog-ui-vue3/app/src/composables/useStyledHtmlPreview.ts` | 预览/打印编排 | 新建 |
| `blog-ui-vue3/app/src/views/develop/work-daily/work-daily-report.vue` | 报表页 | 改用 composable |
| `blog-ui-vue3/app/src/api/develop/work-doc.ts` | work-doc API | 新增 `exportHtml` |
| `blog-ui-vue3/app/src/views/develop/work-doc/work-doc-preview.vue` | 文档预览 | 加下载/打印 |

---

# 后端 blog-dev

## Task 1: 抽共用渲染服务 + blade 重命名 + 报表服务改调

**Files:**
- Create: `blog-dev/app/Services/Api/Admin/StyledHtmlExportService.php`
- Rename: `blog-dev/resources/views/exports/work-daily-report.blade.php` → `styled-document.blade.php`
- Modify: `blog-dev/app/Services/Api/Admin/WorkDailyReportService.php`（头部 use、新增构造函数、`renderHtml`）

- [ ] **Step 1: 新建共用渲染服务**

创建 `blog-dev/app/Services/Api/Admin/StyledHtmlExportService.php`：

```php
<?php

namespace App\Services\Api\Admin;

use Illuminate\Support\Str;

class StyledHtmlExportService
{
    /**
     * 把 Markdown 渲染为带样式的完整 HTML 文档。
     *
     * @param string $title 文档标题
     * @param string $markdown Markdown 源
     * @return string 完整 HTML 字符串
     * @author zhouxufeng <zxf@netsun.com>
     * @date 2026/6/29
     */
    public function render(string $title, string $markdown): string
    {
        $body = Str::markdown($markdown, [
            'html_input' => 'strip',
            'allow_unsafe_links' => false,
        ]);

        return view('exports.styled-document', ['title' => $title, 'body' => $body])->render();
    }
}
```

- [ ] **Step 2: 重命名 blade（内容不变）**

```bash
cd blog-dev
git mv resources/views/exports/work-daily-report.blade.php resources/views/exports/styled-document.blade.php
```

- [ ] **Step 3: 报表服务改调共用服务**

`blog-dev/app/Services/Api/Admin/WorkDailyReportService.php`：

3a. 在 `class WorkDailyReportService` 开头（首个方法 `createExport` 之前）加构造函数：

```php
    public function __construct(
        private readonly StyledHtmlExportService $styledHtmlExportService
    ) {
    }

```

3b. 把 `renderHtml` 方法体（现 89–95 行）改为：

```php
    public function renderHtml(WorkDailyReportExport $export): string
    {
        $title = preg_replace('/\.md$/u', '', (string)$export->file_name) ?: '工作报表';

        return $this->styledHtmlExportService->render($title, (string)$export->content);
    }
```

（`StyledHtmlExportService` 与 `WorkDailyReportService` 同命名空间 `App\Services\Api\Admin`，无需额外 `use`。原 `use Illuminate\Support\Str;` 若 `Str` 在该文件别处仍被使用则保留，否则可留着不影响。）

- [ ] **Step 4: 校验无残留旧 blade 引用**

Run: `cd blog-dev && grep -rn "exports.work-daily-report\|work-daily-report.blade" app resources routes`
Expected: 无任何输出（旧视图名已全部切换）

- [ ] **Step 5: Commit（blog-dev 仓库）**

```bash
cd blog-dev
git add app/Services/Api/Admin/StyledHtmlExportService.php resources/views/exports/styled-document.blade.php app/Services/Api/Admin/WorkDailyReportService.php
git commit -m "refactor: 抽 StyledHtmlExportService 共用带样式HTML渲染"
```

---

## Task 2: work-doc 同步导出端点（Pest TDD）

**Files:**
- Test: `blog-dev/tests/Feature/Api/Admin/WorkDocControllerTest.php`（新建）
- Modify: `blog-dev/app/Http/Controllers/Api/Admin/WorkDocController.php`、`blog-dev/routes/api.php`

- [ ] **Step 1: 写失败测试**

创建 `blog-dev/tests/Feature/Api/Admin/WorkDocControllerTest.php`：

```php
<?php

use App\Models\Admin\WorkDoc;
use App\Models\User\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

uses(TestCase::class);

beforeEach(function () {
    Config::set('database.default', 'sqlite');
    Config::set('database.connections.sqlite.database', ':memory:');
    DB::purge('sqlite');
    DB::setDefaultConnection('sqlite');

    Schema::dropAllTables();

    Schema::create('users', function (Blueprint $table) {
        $table->id();
        $table->string('username')->nullable();
        $table->string('email')->nullable()->unique();
        $table->string('phone')->nullable()->unique();
        $table->string('openid')->nullable()->unique();
        $table->string('unionid')->nullable()->unique();
        $table->string('password')->nullable();
        $table->timestamp('email_verified_at')->nullable();
        $table->integer('status')->default(0);
        $table->rememberToken();
        $table->unsignedInteger('created_at')->default(0);
        $table->integer('update_user')->default(0);
        $table->unsignedInteger('updated_at')->default(0);
        $table->unsignedInteger('deleted_at')->default(0);
    });

    Schema::create('roles', function (Blueprint $table) {
        $table->id();
        $table->string('name')->nullable();
        $table->string('code')->nullable();
        $table->unsignedInteger('deleted_at')->default(0);
    });

    Schema::create('user_role', function (Blueprint $table) {
        $table->unsignedBigInteger('user_id')->default(0);
        $table->unsignedBigInteger('role_id')->default(0);
    });

    Schema::create('work_docs', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('category_id')->default(0);
        $table->string('title', 255);
        $table->longText('content');
        $table->string('template_type', 50)->default('custom');
        $table->text('tags')->nullable();
        $table->unsignedTinyInteger('status')->default(1);
        $table->unsignedTinyInteger('priority')->default(0);
        $table->string('source', 255)->nullable();
        $table->unsignedTinyInteger('is_pin')->default(0);
        $table->unsignedInteger('create_user')->default(0);
        $table->unsignedInteger('created_at')->default(0);
        $table->integer('update_user')->default(0);
        $table->unsignedInteger('updated_at')->default(0);
        $table->unsignedInteger('deleted_at')->default(0);
    });
});

it('导出 work-doc 返回带样式 HTML', function () {
    $admin = workDocLoginAsSuperAdmin();
    $doc = WorkDoc::query()->create([
        'title' => '部署手册',
        'content' => "# 部署手册\n\n## 步骤\n\n- 第一步\n- 第二步",
        'create_user' => $admin->id,
    ]);

    $response = $this
        ->withHeader('Authorization', 'Bearer ' . auth('api')->login($admin))
        ->get("/api/work-doc/{$doc->id}/export");

    $response->assertOk();
    expect($response->headers->get('Content-Type'))->toContain('text/html');

    $html = $response->getContent();
    expect($html)->toContain('<!DOCTYPE html>');
    expect($html)->toContain('部署手册');
    expect($html)->toContain('<h1');
    expect($html)->toContain('第一步');
});

/**
 * 创建超级管理员。
 *
 * @return User
 * @author zhouxufeng <zxf@netsun.com>
 * @date 2026/6/29
 */
function workDocLoginAsSuperAdmin(): User
{
    $admin = User::query()->create([
        'username' => 'workdoc_admin',
        'email' => 'workdoc-admin@example.com',
        'phone' => '13800000001',
        'password' => bcrypt('password'),
        'status' => 1,
    ]);

    $roleId = DB::table('roles')->insertGetId([
        'name' => '超级管理员',
        'code' => 'super',
        'deleted_at' => 0,
    ]);

    DB::table('user_role')->insert([
        'user_id' => $admin->id,
        'role_id' => $roleId,
    ]);

    return $admin;
}
```

- [ ] **Step 2: 远端跑测试，确认失败**

Run（远端）：`cd /data/personal/projects/blog && ./vendor/bin/sail pest tests/Feature/Api/Admin/WorkDocControllerTest.php`
Expected: FAIL（路由 `work-doc/{id}/export` 不存在 → 404，`assertOk` 失败）

- [ ] **Step 3: 加路由**

`blog-dev/routes/api.php`，在 `work-doc/index` 路由（约 381–382 行）之后、`work-doc/{workDoc}`（info，约 384 行）之前插入：

```php
        Route::get('work-doc/{workDoc}/export', [WorkDocController::class, 'export'])->name('work-doc.export');
```

- [ ] **Step 4: 加 export 方法**

`blog-dev/app/Http/Controllers/Api/Admin/WorkDocController.php`：

4a. 头部加 use（在现有 `use App\Models\Admin\WorkDoc;` 之后）：

```php
use App\Services\Api\Admin\StyledHtmlExportService;
```

4b. 给 controller 加构造函数（在 `index` 方法之前）：

```php
    public function __construct(
        private readonly StyledHtmlExportService $styledHtmlExportService
    ) {
    }

```

4c. 在 `delete` 方法之后、类结束 `}` 之前加 `export`：

```php
    /**
     * 导出文档为带样式 HTML
     *
     * @param WorkDoc $workDoc
     * @return \Illuminate\Http\Response
     * @author zhouxufeng <zxf@netsun.com>
     * @date 2026/6/29
     */
    public function export(WorkDoc $workDoc)
    {
        $html = $this->styledHtmlExportService->render((string)$workDoc->title, (string)$workDoc->content);

        return response($html, 200, [
            'Content-Type' => 'text/html; charset=utf-8',
        ]);
    }
```

- [ ] **Step 5: 远端跑测试，确认通过**

Run（远端）：`cd /data/personal/projects/blog && ./vendor/bin/sail pest tests/Feature/Api/Admin/WorkDocControllerTest.php`
Expected: PASS（1 passed）

- [ ] **Step 6: Commit（blog-dev 仓库）**

```bash
cd blog-dev
git add tests/Feature/Api/Admin/WorkDocControllerTest.php app/Http/Controllers/Api/Admin/WorkDocController.php routes/api.php
git commit -m "feat: work-doc 新增同步带样式HTML导出端点"
```

---

# 前端 blog-ui-vue3

## Task 3: 共用 composable useStyledHtmlPreview

**Files:**
- Create: `blog-ui-vue3/app/src/composables/useStyledHtmlPreview.ts`

- [ ] **Step 1: 新建 composable**

```ts
import { ref } from "vue";

/**
 * 带样式 HTML 预览/打印编排：拉取 HTML blob → 用 object URL 在 iframe 内预览/打印。
 * 与具体业务（报表/文档）解耦，调用方传入「取 HTML blob」的函数。
 */
export function useStyledHtmlPreview() {
  const previewUrl = ref("");
  const previewLoading = ref(false);
  const previewFrameRef = ref<HTMLIFrameElement | null>(null);

  function revoke(): void {
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value);
      previewUrl.value = "";
    }
  }

  async function render(fetchHtml: () => Promise<Blob>): Promise<void> {
    previewLoading.value = true;
    revoke();
    try {
      previewUrl.value = URL.createObjectURL(await fetchHtml());
    } finally {
      previewLoading.value = false;
    }
  }

  /** 触发 iframe 自身文档打印（blob 与主页面同源）。未就绪返回 false。 */
  function print(): boolean {
    const win = previewFrameRef.value?.contentWindow;
    if (!win) return false;
    win.focus();
    win.print();
    return true;
  }

  return { previewUrl, previewLoading, previewFrameRef, render, print, revoke };
}
```

- [ ] **Step 2: type-check（合并到 Task 7 一并跑）**

本任务无独立运行；类型由 Task 7 的 `pnpm build` 统一校验。

- [ ] **Step 3: Commit（blog-ui-vue3 仓库）**

```bash
cd blog-ui-vue3
git add app/src/composables/useStyledHtmlPreview.ts
git commit -m "feat: 新增 useStyledHtmlPreview 共用预览打印编排"
```

---

## Task 4: work-daily-report.vue 改用 composable

**Files:**
- Modify: `blog-ui-vue3/app/src/views/develop/work-daily/work-daily-report.vue`

- [ ] **Step 1: 引入 composable，替换三个 ref**

把 ref 声明（约 543–546 行）中的这三行：

```ts
const previewLoading = ref(false);
const previewUrl = ref("");
```
```ts
const previewFrameRef = ref<HTMLIFrameElement | null>(null);
```

删除，并在 `<script setup>` 顶部 import 区加：

```ts
import { useStyledHtmlPreview } from "@/composables/useStyledHtmlPreview";
```

再在 `previewVisible` 声明之后加：

```ts
const { previewUrl, previewLoading, previewFrameRef, render: renderPreview, print: printFrame, revoke: revokePreviewUrl } =
  useStyledHtmlPreview();
```

（保留原有 `revokePreviewUrl` 调用点不变——名字一致。）

- [ ] **Step 2: 重写 renderPreviewHtml**

把现 `renderPreviewHtml`（约 889–899 行）整体替换为：

```ts
// 拉取带样式的 HTML（与下载/打印同一套渲染），用 blob 地址在 iframe 里预览，不触发下载
async function renderPreviewHtml(id: number): Promise<void> {
  await renderPreview(async () => {
    const response = await WorkDailyAPI.downloadReportExport(id, "html");
    return new Blob([response.data], { type: "text/html;charset=utf-8" });
  });
}
```

- [ ] **Step 3: 重写 printPreview，删除本地 revokePreviewUrl**

把现 `printPreview`（约 964–972 行）替换为：

```ts
// 直接触发 iframe 自身文档的打印（blob 与主页面同源），只打印报表内容、走报表的 A4 打印样式
function printPreview(): void {
  if (!printFrame()) {
    message.error("预览未就绪，请稍候");
  }
}
```

并删除现本地的 `revokePreviewUrl` 函数定义（约 974–979 行，整段 `function revokePreviewUrl() { ... }`）——其职责已由 composable 提供，调用点不变。

- [ ] **Step 4: type-check（合并到 Task 7）**

本任务类型由 Task 7 `pnpm build` 统一校验。

- [ ] **Step 5: Commit（blog-ui-vue3 仓库）**

```bash
cd blog-ui-vue3
git add app/src/views/develop/work-daily/work-daily-report.vue
git commit -m "refactor: work-daily 报表预览打印改用共用 composable"
```

---

## Task 5: WorkDocAPI.exportHtml

**Files:**
- Modify: `blog-ui-vue3/app/src/api/develop/work-doc.ts`

- [ ] **Step 1: 新增 exportHtml**

在 `getInfo` 方法（约 56–61 行）之后插入：

```ts
  /** 导出文档为带样式 HTML（返回完整响应，data 为 Blob） */
  exportHtml(id: number) {
    return request({
      url: `${BASE_URL}/${id}/export`,
      method: "get",
      responseType: "blob",
    });
  },
```

- [ ] **Step 2: Commit（blog-ui-vue3 仓库）**

```bash
cd blog-ui-vue3
git add app/src/api/develop/work-doc.ts
git commit -m "feat: WorkDocAPI 新增 exportHtml"
```

---

## Task 6: work-doc-preview.vue 接入下载/打印

**Files:**
- Modify: `blog-ui-vue3/app/src/views/develop/work-doc/work-doc-preview.vue`

- [ ] **Step 1: import composable 与 downloadFile**

在 import 区（约 95–97 行，`import AdminAnimalModal ...` 之后）加：

```ts
import { useStyledHtmlPreview } from "@/composables/useStyledHtmlPreview";
import { downloadFile } from "@/utils/download";
```

- [ ] **Step 2: 加 composable 与导出函数**

在 `copyMarkdownLink` 函数之后插入：

```ts
const { previewUrl, previewFrameRef, render: renderExport, print: printFrame, revoke: revokeExport } =
  useStyledHtmlPreview();
const exporting = ref(false);
let pendingPrint = false;

async function fetchExportBlob(): Promise<Blob> {
  const id = previewDoc.value?.id;
  if (!id) throw new Error("文档未保存");
  const response = await WorkDocAPI.exportHtml(id);
  return new Blob([response.data], { type: "text/html;charset=utf-8" });
}

async function handleDownloadHtml(): Promise<void> {
  if (!previewDoc.value?.id) {
    message.error("文档未保存");
    return;
  }
  exporting.value = true;
  try {
    const response = await WorkDocAPI.exportHtml(previewDoc.value.id);
    downloadFile(response, `${previewDoc.value.title || "文档"}.html`);
  } catch {
    message.error("导出失败");
  } finally {
    exporting.value = false;
  }
}

async function handlePrint(): Promise<void> {
  if (!previewDoc.value?.id) {
    message.error("文档未保存");
    return;
  }
  exporting.value = true;
  try {
    pendingPrint = true;
    await renderExport(fetchExportBlob);
  } catch {
    pendingPrint = false;
    message.error("打印准备失败");
  } finally {
    exporting.value = false;
  }
}

// 隐藏 iframe 加载完带样式 HTML 后再触发打印，避免内容未就绪
function onExportFrameLoad(): void {
  if (pendingPrint && previewUrl.value) {
    pendingPrint = false;
    printFrame();
  }
}
```

- [ ] **Step 3: 关闭弹窗时回收 object URL**

把现 `closePreview`（约 133–135 行）替换为：

```ts
function closePreview(): void {
  revokeExport();
  emit("update:visible", false);
}
```

- [ ] **Step 4: 模板加按钮与隐藏 iframe**

4a. 在 `doc-preview-actions` 里「复制引用链接」tooltip 之后、「关闭详情」tooltip 之前插入：

```vue
          <el-tooltip content="下载 HTML" placement="top">
            <Button
              class="doc-icon-button"
              type="default"
              size="small"
              :loading="exporting"
              @click="handleDownloadHtml"
            >
              <el-icon><Download /></el-icon>
            </Button>
          </el-tooltip>
          <el-tooltip content="打印 / 存 PDF" placement="top">
            <Button
              class="doc-icon-button"
              type="default"
              size="small"
              :loading="exporting"
              @click="handlePrint"
            >
              <el-icon><Printer /></el-icon>
            </Button>
          </el-tooltip>
```

4b. 在模板最外层 `AdminAnimalModal` 闭合标签 `</AdminAnimalModal>` 之前（弹窗内任意位置即可）加隐藏 iframe：

```vue
    <iframe
      ref="previewFrameRef"
      :src="previewUrl"
      style="position: absolute; width: 0; height: 0; border: 0; visibility: hidden"
      title="文档打印"
      @load="onExportFrameLoad"
    ></iframe>
```

4c. 确认 `Download`、`Printer` 图标可用：work-doc-preview 已从 `@element-plus/icons-vue` 用了 `Folder/Notebook/Grid/Clock/DocumentCopy/Close` 等。在其 import 处补 `Download, Printer`。

Run（定位现有图标 import）：`cd blog-ui-vue3 && grep -n "@element-plus/icons-vue" app/src/views/develop/work-doc/work-doc-preview.vue`
然后把 `Download, Printer` 加进该 import 列表。

- [ ] **Step 5: Commit（blog-ui-vue3 仓库）**

```bash
cd blog-ui-vue3
git add app/src/views/develop/work-doc/work-doc-preview.vue
git commit -m "feat: work-doc 预览弹窗加下载HTML与打印"
```

---

## Task 7: 前端整体验证

- [ ] **Step 1: build**

Run: `cd blog-ui-vue3/app && pnpm build`
Expected: 构建成功（`vue-tsc --noEmit && vite build` 均通过，无类型报错）

- [ ] **Step 2: 逻辑核对清单**

- work-daily 报表预览：打开预览仍渲染后端 HTML、打印仍走 iframe（行为不变）。
- work-doc 预览弹窗出现「下载 HTML」「打印」按钮。
- 「下载 HTML」→ 调 `work-doc/{id}/export` 取 blob → 下载 `${title}.html`。
- 「打印」→ render 后隐藏 iframe `@load` 触发 `printFrame()`，弹出打印。
- 关闭弹窗回收 object URL，无泄漏。

---

## Self-Review（对照 spec）

- **B1 共用渲染 + blade 重命名 + 报表改调** → Task 1 ✓
- **B2 work-doc 导出端点 + 路由** → Task 2 Step 3/4 ✓
- **B3 Pest 测试** → Task 2 Step 1/2/5 ✓
- **F1 composable** → Task 3 ✓
- **F2 work-daily 仅下沉预览/打印/revoke** → Task 4 ✓
- **F3 WorkDocAPI.exportHtml** → Task 5 ✓
- **F4 work-doc-preview 下载/打印 + 隐藏 iframe + @load 唯一触发** → Task 6 ✓
- 类型/签名一致：composable 返回 `{previewUrl, previewLoading, previewFrameRef, render, print, revoke}`，两处消费方解构一致；`render(fetchHtml: () => Promise<Blob>)` 入参在 work-daily(Step2)/work-doc(fetchExportBlob) 均为 `() => Promise<Blob>` ✓
- Placeholder 扫描：无 TBD/TODO，代码步骤均含完整代码 ✓
- 不做项（异步/历史/前端二份CSS/work-doc带样式预览面板）→ 计划未涉及 ✓
