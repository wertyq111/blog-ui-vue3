# 待办 #16：报表 HTML 导出下沉共用 + 接入 work-doc 设计

- 日期：2026-06-29
- 范围：blog-dev（后端）+ blog-ui-vue3（前端），跨两仓库
- 来源待办：#16 工作日常报表 HTML 导出下沉共用并接入 work-doc
- 方向：方案1（后端共用样式外壳 + work-doc 同步导出端点 + 前端共用预览编排）

## 背景与现状校正

待办原描述「逻辑内聚在 work-daily-report.vue」与真实代码不符，核对后：

- work-daily「带样式 HTML」的**样式在后端** blade `resources/views/exports/work-daily-report.blade.php`（通用「title + body」样式壳）；
  渲染在 `WorkDailyReportService::renderHtml()`：`Str::markdown(content, ['html_input'=>'strip','allow_unsafe_links'=>false])` + `view('exports.work-daily-report', ['title','body'])`。
- work-daily-report.vue 里**前端**只是：拉后端 HTML blob → iframe 预览 / 下载 / 打印 / 编辑回写。
- work-doc 当前**无任何导出**，后端**也无 work-doc 导出端点**。
- work-daily 报表导出是重量级异步系统（AI 汇总→建任务→轮询→历史→下载），**不复制给 work-doc**。

真正的"重复源" = ①后端带样式 blade 外壳 ②前端预览/打印编排。本设计下沉这两处，并给 work-doc 接同步导出。

## 后端 blog-dev

### B1. 抽共用渲染 + blade 重命名

- 新增 `App\Services\Api\Admin\StyledHtmlExportService`，方法：
  ```php
  public function render(string $title, string $markdown): string
  {
      $body = \Illuminate\Support\Str::markdown($markdown, [
          'html_input' => 'strip',
          'allow_unsafe_links' => false,
      ]);
      return view('exports.styled-document', ['title' => $title, 'body' => $body])->render();
  }
  ```
- blade `resources/views/exports/work-daily-report.blade.php` → 重命名 `resources/views/exports/styled-document.blade.php`，**内容不变**（已是通用样式壳）。
- `WorkDailyReportService::renderHtml()` 改为：构造函数注入 `StyledHtmlExportService`，body/title 逻辑不变，渲染改调 `$this->styledHtmlExportService->render($title, (string)$export->content)`。**对外行为零变化**。

### B2. work-doc 同步导出端点

- `WorkDocController`：构造函数注入 `StyledHtmlExportService`；新增方法：
  ```php
  public function export(WorkDoc $workDoc)
  {
      $title = (string) $workDoc->title;
      $html = $this->styledHtmlExportService->render($title, (string) $workDoc->content);
      return response($html, 200, [
          'Content-Type' => 'text/html; charset=utf-8',
      ]);
  }
  ```
  （inline 返回，前端用 blob 自行下载/打印；不落盘、不建历史。导出类接口按语义返回，符合规范 line 44。注释补 `@param/@return/@author/@date`。）
- 路由 `routes/api.php` work-doc 组加：`Route::get('work-doc/{workDoc}/export', [WorkDocController::class, 'export'])->name('work-doc.export');`
  放在 `work-doc/{workDoc}`（info）等通配路由**之前**，避免被 `{workDoc}` 吞掉。
- **不需要 Request**（route-model binding、无入参）。

### B3. 后端测试（Pest）

- 新建 `tests/Feature/Api/Admin/WorkDocControllerTest.php`（参照 `TodoItemControllerTest` 的 Pest 形态与登录/JWT 准备）。
- 覆盖：创建一条 work-doc → 调 `GET work-doc/{id}/export` → 断言 200、`Content-Type` 含 `text/html`、响应体含文档标题与正文 markdown 渲染后的片段（如 `<h1`、正文关键字）。
- 远端执行：`./vendor/bin/sail pest tests/Feature/Api/Admin/WorkDocControllerTest.php`。

## 前端 blog-ui-vue3

### F1. 共用 composable `useStyledHtmlPreview`

- 新建 `app/src/composables/useStyledHtmlPreview.ts`：
  ```ts
  import { ref } from "vue";
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

### F2. work-daily-report.vue 重构（仅下沉预览/打印/revoke）

- 用 `useStyledHtmlPreview()` 替换本地 `previewUrl/previewLoading/previewFrameRef` 三个 ref 与 `renderPreviewHtml/printPreview/revokePreviewUrl` 三个函数体。
- `renderPreviewHtml(id)` 改为：`await render(async () => { const r = await WorkDailyAPI.downloadReportExport(id, "html"); return new Blob([r.data], { type: "text/html;charset=utf-8" }); })`。
- `printPreview()` 改为：`if (!print()) message.error("预览未就绪，请稍候");`。
- 编辑/保存/下载/历史/轮询等**保持本地不变**。行为零变化。

### F3. WorkDocAPI.exportHtml

- `app/src/api/develop/work-doc.ts` 新增：
  ```ts
  exportHtml(id: number) {
    return request<any, Blob>({
      url: `${BASE_URL}/${id}/export`,
      method: "get",
      responseType: "blob",
    });
  },
  ```

### F4. work-doc-preview.vue 接入导出

- 头部 `doc-preview-actions` 内（复制引用按钮旁）加两个按钮：「下载 HTML」「打印」。
- 用 `useStyledHtmlPreview()` + `WorkDocAPI.exportHtml(previewDoc.id)`：
  - 下载：fetch blob → 复用 `@/utils/download` 的 `downloadFile`（文件名 `${title}.html`）。
  - 打印：在组件内放一个**隐藏 iframe**（`ref=previewFrameRef`、`:src="previewUrl"`、0 尺寸不可见）。点「打印」时：置 `pendingPrint=true` → `await render(fetchExportBlob)`（设 previewUrl，iframe 开始加载）；iframe 绑 `@load="onFrameLoad"`，`onFrameLoad` 内若 `pendingPrint` 则调 `print()` 并复位标志。**以 `@load` 为唯一触发点**，避免 blob 未加载完就 print。
- 不新增带样式预览面板（preview 已有 markdown 预览，避免双重预览）。

## 不做（YAGNI / 范围外）

- 不给 work-doc 引入异步导出任务、历史、AI 汇总（仅同步 HTML）。
- 不抽 work-daily 的 edit-save/download/history（报表专属）。
- work-doc 不做带样式 iframe 预览面板（仅下载 + 打印）。
- 前端不再维护第二份样式 CSS（样式只在后端 blade，单一来源）。

## 验证

- 后端：远端 `./vendor/bin/sail pest tests/Feature/Api/Admin/WorkDocControllerTest.php` 通过。
- 前端：`pnpm build`（`vue-tsc --noEmit` + `vite build`）通过；逻辑核对 work-daily 预览/打印行为不变、work-doc 下载/打印生效。
- 页面可视验证按项目规则在远端、需用户确认（受 `/#/login` 阻挡）。
- 交付：后端改动进 blog-dev 仓库、前端进 blog-ui-vue3 仓库，分别走中文 PR → 合并 main → 远端同步。
