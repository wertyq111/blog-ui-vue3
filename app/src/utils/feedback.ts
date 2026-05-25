/**
 * 动森风格全局反馈层
 *
 * @description
 * 替代 Element Plus 的 ElMessage / ElMessageBox / ElNotification。
 * 提供 message(轻提示) / notify(右上角通知) / confirm(确认弹窗) 三类命令式 API，
 * 由单例 FeedbackHost 统一渲染。API 签名对齐原 EP 用法以降低迁移成本。
 */
import { createApp, h, reactive } from "vue";

export type FeedbackType = "success" | "error" | "warning" | "info";

export interface MessageItem {
  id: number;
  type: FeedbackType;
  content: string;
}

export interface NotifyItem {
  id: number;
  type: FeedbackType;
  title: string;
  content: string;
}

export interface ConfirmItem {
  id: number;
  message: string;
  title: string;
  confirmText: string;
  cancelText: string;
  type: FeedbackType;
  resolve: () => void;
  reject: (reason?: unknown) => void;
}

export const feedbackStore = reactive<{
  messages: MessageItem[];
  notifications: NotifyItem[];
  confirms: ConfirmItem[];
}>({
  messages: [],
  notifications: [],
  confirms: [],
});

let seed = 0;
const nextId = () => ++seed;

let mounted = false;
function ensureHost(): void {
  if (mounted) return;
  mounted = true;
  // 延迟引入避免与本模块的循环依赖
  import("@/components/feedback/FeedbackHost.vue").then(({ default: FeedbackHost }) => {
    const el = document.createElement("div");
    el.className = "animal-feedback-root";
    document.body.appendChild(el);
    createApp({ render: () => h(FeedbackHost) }).mount(el);
  });
}

function pushMessage(content: string, type: FeedbackType, duration = 3000): void {
  ensureHost();
  const id = nextId();
  feedbackStore.messages.push({ id, type, content });
  if (duration > 0) {
    window.setTimeout(() => removeMessage(id), duration);
  }
}

export function removeMessage(id: number): void {
  const idx = feedbackStore.messages.findIndex((m) => m.id === id);
  if (idx > -1) feedbackStore.messages.splice(idx, 1);
}

type MessageArg = string | { message: string; type?: FeedbackType; duration?: number };

function normalize(arg: MessageArg, fallback: FeedbackType): {
  content: string;
  type: FeedbackType;
  duration: number;
} {
  if (typeof arg === "string") return { content: arg, type: fallback, duration: 3000 };
  return { content: arg.message, type: arg.type ?? fallback, duration: arg.duration ?? 3000 };
}

interface MessageFn {
  (arg: MessageArg): void;
  success: (arg: MessageArg) => void;
  error: (arg: MessageArg) => void;
  warning: (arg: MessageArg) => void;
  info: (arg: MessageArg) => void;
}

export const message = ((arg: MessageArg) => {
  const { content, type, duration } = normalize(arg, "info");
  pushMessage(content, type, duration);
}) as MessageFn;
(["success", "error", "warning", "info"] as const).forEach((t) => {
  message[t] = (arg: MessageArg) => {
    const { content, duration } = normalize(arg, t);
    pushMessage(content, t, duration);
  };
});

export function notify(options: {
  title?: string;
  message: string;
  type?: FeedbackType;
  duration?: number;
}): void {
  ensureHost();
  const id = nextId();
  feedbackStore.notifications.push({
    id,
    type: options.type ?? "info",
    title: options.title ?? "提示",
    content: options.message,
  });
  const duration = options.duration ?? 4500;
  if (duration > 0) {
    window.setTimeout(() => removeNotify(id), duration);
  }
}

export function removeNotify(id: number): void {
  const idx = feedbackStore.notifications.findIndex((n) => n.id === id);
  if (idx > -1) feedbackStore.notifications.splice(idx, 1);
}

export interface ConfirmOptions {
  confirmButtonText?: string;
  cancelButtonText?: string;
  type?: FeedbackType;
  // 兼容原 ElMessageBox 透传的其它选项（lockScroll、draggable 等），当前实现忽略
  [key: string]: unknown;
}

/**
 * 确认弹窗，对齐 ElMessageBox.confirm(message, title, options)。
 * 确认时 resolve，取消/关闭时 reject("cancel")。
 */
export function confirm(
  msg: string,
  title = "提示",
  options: ConfirmOptions = {}
): Promise<void> {
  ensureHost();
  return new Promise<void>((resolve, reject) => {
    feedbackStore.confirms.push({
      id: nextId(),
      message: msg,
      title,
      confirmText: options.confirmButtonText ?? "确定",
      cancelText: options.cancelButtonText ?? "取消",
      type: options.type ?? "warning",
      resolve,
      reject,
    });
  });
}

export function resolveConfirm(id: number): void {
  const idx = feedbackStore.confirms.findIndex((c) => c.id === id);
  if (idx > -1) {
    feedbackStore.confirms[idx].resolve();
    feedbackStore.confirms.splice(idx, 1);
  }
}

export function rejectConfirm(id: number): void {
  const idx = feedbackStore.confirms.findIndex((c) => c.id === id);
  if (idx > -1) {
    feedbackStore.confirms[idx].reject("cancel");
    feedbackStore.confirms.splice(idx, 1);
  }
}
