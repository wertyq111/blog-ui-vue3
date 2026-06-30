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
