/**
 * 动森风格加载遮罩 —— 替代 Element Plus 的 v-loading 指令与 ElLoading.service。
 *
 * @description
 * - `v-loading="bool"` 指令：在宿主元素上叠加加载遮罩。
 * - `loadingService(options)`：命令式全屏/指定容器加载，返回 { close }。
 * 遮罩内部复用 animal-island-vue 的 Loading 组件保证视觉一致。
 */
import { createApp, h, type App, type Directive } from "vue";

interface LoadingInstance {
  close: () => void;
}

const INSTANCE_KEY = "__animalLoading__";

function createOverlay(parent: HTMLElement, lock: boolean, text?: string): LoadingInstance {
  const mask = document.createElement("div");
  mask.className = "animal-loading-mask";
  if (lock) mask.classList.add("animal-loading-mask--lock");

  const app: App = createApp({
    render: () =>
      h("div", { class: "ac-loading-card" }, [
        h("div", { class: "ac-loading-spinner" }, [
          h(
            "svg",
            {
              class: "ac-loading-leaf",
              viewBox: "0 0 40 40",
              style: "width: 100%; height: 100%;"
            },
            [
              h("path", {
                d: "M5 35c10 0 20-5 28-13 5-5 7-12 7-22-10 0-17 2-22 7-8 8-13 18-13 28z",
                fill: "#8ac68a",
                stroke: "#794f27",
                "stroke-width": "2.5",
                "stroke-linejoin": "round"
              }),
              h("path", {
                d: "M5 35c8-8 16-14 26-20",
                stroke: "#794f27",
                "stroke-width": "1.5",
                fill: "none"
              })
            ]
          )
        ]),
        h("span", { class: "ac-loading-text" }, text || "努力加载中...")
      ]),
  });
  app.mount(mask);
  parent.appendChild(mask);

  return {
    close() {
      app.unmount();
      mask.remove();
    },
  };
}

interface LoadingEl extends HTMLElement {
  [INSTANCE_KEY]?: LoadingInstance;
  __prevPosition__?: string;
}

function toggle(el: LoadingEl, value: boolean, text?: string): void {
  if (value) {
    if (el[INSTANCE_KEY]) return;
    const computed = window.getComputedStyle(el).position;
    if (computed === "static" || !computed) {
      el.__prevPosition__ = el.style.position;
      el.style.position = "relative";
    }
    el[INSTANCE_KEY] = createOverlay(el, false, text);
  } else {
    el[INSTANCE_KEY]?.close();
    el[INSTANCE_KEY] = undefined;
    if (el.__prevPosition__ !== undefined) {
      el.style.position = el.__prevPosition__;
      el.__prevPosition__ = undefined;
    }
  }
}

export const loading: Directive<LoadingEl, boolean> = {
  mounted(el, binding) {
    toggle(el, !!binding.value, binding.arg);
  },
  updated(el, binding) {
    if (binding.value !== binding.oldValue) toggle(el, !!binding.value, binding.arg);
  },
  unmounted(el) {
    toggle(el, false);
  },
};

export function loadingService(
  options: { lock?: boolean; text?: string; target?: HTMLElement } = {}
): LoadingInstance {
  const parent = options.target ?? document.body;
  return createOverlay(parent, options.lock ?? true, options.text);
}
