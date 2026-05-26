/**
 * 全局注册自建的动森风格组件（替代 Element Plus 中原本全局可用的组件）。
 *
 * @description
 * animal-island-vue 自带组件在 main.ts 注册；这里集中注册项目自建的 Animal* 补齐组件，
 * 使它们像原 el-form / el-form-item 一样在模板中全局可用，降低逐文件 import 成本。
 */
import type { App, Component } from "vue";
import AnimalForm from "@/components/AnimalForm/index.vue";
import AnimalFormItem from "@/components/AnimalFormItem/index.vue";

const globalComponents: Record<string, Component> = {
  AnimalForm,
  AnimalFormItem,
};

export function setupAnimalGlobals(app: App): void {
  Object.entries(globalComponents).forEach(([name, comp]) => {
    app.component(name, comp);
  });
}
