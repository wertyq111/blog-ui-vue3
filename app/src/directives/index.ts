import type { App } from "vue";

import { hasPerm } from "./permission";
import { loading } from "./loading";

// 全局注册 directive
export function setupDirective(app: App<Element>) {
  // 使 v-hasPerm 在所有组件中都可用
  app.directive("hasPerm", hasPerm);
  // 动森风格 v-loading（替代 Element Plus 的 v-loading）
  app.directive("loading", loading);
}
