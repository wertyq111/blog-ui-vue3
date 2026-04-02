# Dependency Replacement Matrix

## Purpose

本文件用于记录 Vue2 旧依赖在 Vue3 迁移中的处理方向、最早需要波次和主要风险。

说明：

- 这是迁移决策表，不是安装清单。
- 对于后续波次才会触发的能力，先给出“处理方向”，不提前把实现细节硬编码进 Task 4。

## Matrix

| Legacy Dependency | Current Role In Vue2 | Actual Usage Snapshot | Vue3 Direction | Earliest Wave | Risk |
| --- | --- | --- | --- | --- | --- |
| `vue@2` | 应用运行时 | 全局 | 已由 `vue@3` 替换 | done | none |
| `vue-router@3` | 静态路由 + 动态菜单注册 | 全局 | 使用 `vue-router@4` 重建静态/动态路由链路 | Task 4 | medium |
| `vuex@3` | 用户态、主题态、权限态 | 全局 | 使用 `pinia` 重建 store；不保留 Vuex 兼容层 | Task 4 | medium |
| `element-ui` | 基础 UI 组件与消息反馈 | 全局 | 使用 `element-plus` 对应能力重建 | Task 4 | medium |
| `ele-admin` | 布局、菜单、动态路由、表格、主题、工具方法 | 深度耦合 | 不直接迁移；拆成本地 Vue3 壳层、路由工具、共享 CRUD 底座 | Task 4 / Task 5 | high |
| `@tinymce/tinymce-vue@3` | 富文本封装底层 | 仅 3 页真实使用 | 保留“本地 wrapper 边界”，在真正需要的波次再接 Vue3 兼容实现 | later | medium |
| `@riophae/vue-treeselect` | 树选择 | 5 页真实使用 | 延后到菜单/部门/组织/用户详情相关波次再替换为 Vue3 兼容树选择方案 | later | medium |
| `vue-lazyload` | 图片懒加载 | 当前明确使用较少 | 默认不进入 Task 4；若后续页面仍需要，再以 Vue3 原生或轻量方案补入 | later | low |
| `vuedraggable` | 拖拽列表试验页 | 只见于 `develop/work-platform/index.draggable.vue` | 延后；非首波阻塞项 | later | low |
| `xgplayer-vue` | 视频播放 | 仅声明依赖，未见真实引用 | 先移出迁移阻塞清单；出现真实需求再评估 | later | low |
| `mavon-editor` | Markdown 编辑 | develop 模块使用 | 延后；在 develop 波次独立评估 Vue3 Markdown 编辑方案 | develop wave | medium |
| `@google/model-viewer` | 3D 预览 web component | 仅个人中心使用 | 保留 web component 方向，实际页面迁移时再接入 | later | low |
| `vue-clipboard2` | 复制能力 | 全局插件但首波未阻塞 | 首波不迁；出现真实页面需求时改为 Vue3 兼容复制方案 | later | low |
| `vue-i18n@8` | 多语言 | Vue2 全局 | 当前 Task 4 不阻塞；若保留多语言，再单独升级到 Vue3 兼容版本 | later | medium |

## Hidden / Indirect Dependencies

- `sortablejs`
  - 被 `ElTableDraggable.vue` 直接导入，但 Vue2 `package.json` 未显式声明。
  - 如果后续保留拖拽能力，必须显式补齐依赖来源并重新验证。

## Task 4 Required Decisions

- Task 4 只依赖以下已明确方向：
  - `vue-router@4`
  - `pinia`
  - `element-plus`
  - 本地自建 HTTP、auth、menu、layout 壳层
- Task 4 不提前引入以下能力：
  - 富文本
  - 树选择
  - 上传
  - 拖拽
  - Markdown 编辑
  - 视频播放器

## Follow-Up Rules

- 首波未使用到的旧依赖，不因为“未来可能会用”而提前装回 Vue3 项目。
- 需要保留的能力，优先保留“本地 wrapper 边界”，避免把第三方库直接散落进页面层。
- 每完成一个波次，需要回写本表：
  - 已替换
  - 延后
  - 删除
  - 待远端验证
