import { onMounted, onUnmounted, ref, type Ref } from "vue";

/**
 * 滚动进度（0 ~ 1）。
 * 不传 target 时按文档滚动计算（公开整页路由）；
 * 后台布局在内部容器里滚动，传入该容器元素即可。
 */
export function useScrollProgress(target?: Ref<HTMLElement | null>) {
  const progress = ref(0);
  let source: EventTarget | null = null;

  const update = () => {
    const el = target?.value;
    const max = el
      ? el.scrollHeight - el.clientHeight
      : document.documentElement.scrollHeight - window.innerHeight;
    const pos = el ? el.scrollTop : window.scrollY;
    progress.value = max > 0 ? Math.min(1, Math.max(0, pos / max)) : 0;
  };

  onMounted(() => {
    source = target?.value ?? window;
    update();
    source.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
  });

  onUnmounted(() => {
    source?.removeEventListener("scroll", update);
    window.removeEventListener("resize", update);
  });

  return progress;
}
