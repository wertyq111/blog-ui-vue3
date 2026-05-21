/**
 * 应用启动入口
 *
 * @description
 * Vue3 应用初始化，包括样式、插件、配置的加载
 */

import { createApp, type Component } from "vue";
import App from "./App.vue";

// ===== 样式导入 =====
import "element-plus/dist/index.css";
import "vxe-table/lib/style.css";
import "animal-island-vue/style";
import "@/styles/index.scss";
import "uno.css";
import "animate.css";

// ===== 核心配置 =====
import { setupDirective } from "@/directives";
import { setupI18n } from "@/lang";
import { setupRouter } from "@/router";
import { setupStore } from "@/store";

// ===== 全局组件 =====
import * as ElementPlusIcons from "@element-plus/icons-vue";

// ===== 第三方插件 =====
import {
  Button,
  Card,
  Checkbox,
  CodeBlock,
  Collapse,
  Cursor,
  Divider,
  Footer,
  Icon,
  Input,
  Loading,
  Modal,
  Phone,
  Select,
  Switch,
  Table,
  Tabs,
  Time,
  Typewriter,
} from "animal-island-vue";
import VXETable from "vxe-table";
import { InstallCodeMirror } from "codemirror-editor-vue3";
import { configureVxeTable } from "@/plugins/vxe-table";

// ===== 路由守卫 =====
import { setupPermissionGuard } from "@/router/guards/permission";

// 创建 Vue 应用实例
const app = createApp(App);
const animalIslandComponents: Array<[string, Component]> = [
  ["Button", Button as Component],
  ["Card", Card as Component],
  ["Checkbox", Checkbox as Component],
  ["CodeBlock", CodeBlock as Component],
  ["Collapse", Collapse as Component],
  ["Cursor", Cursor as Component],
  ["Divider", Divider as Component],
  ["Footer", Footer as Component],
  ["Icon", Icon as Component],
  ["Input", Input as Component],
  ["Loading", Loading as Component],
  ["Modal", Modal as Component],
  ["Phone", Phone as Component],
  ["Select", Select as Component],
  ["Switch", Switch as Component],
  ["Table", Table as Component],
  ["Tabs", Tabs as Component],
  ["Time", Time as Component],
  ["Typewriter", Typewriter as Component],
];

// 1️⃣ 核心配置
setupDirective(app);
setupRouter(app);
setupStore(app);
setupI18n(app);

// 2️⃣ 全局组件（Element Plus 图标）
Object.entries(ElementPlusIcons).forEach(([name, comp]) => app.component(name, comp));

// 3️⃣ 第三方插件
configureVxeTable();
animalIslandComponents.forEach(([name, component]) => {
  app.component(name, component as Component);
});
app.use(VXETable);
app.use(InstallCodeMirror);

// 4️⃣ 路由守卫
setupPermissionGuard();

// 5️⃣ 挂载应用
app.mount("#app");
