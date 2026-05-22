# Vue3 后台页面设计风格与规范（动森风）

适用于 blog-ui-vue3 所有后台「列表页 + 编辑表单页」。新增或改造任何后台栏目时按本说明执行，保持视觉、交互、目录拆分一致。参考实现：`app/src/views/system/{user,role,menu}`。设计来源：`design/blog-handoff/blog`（`system-pages.jsx` + `system.css`）。

---

## 一、通用约定（务必遵守）

1. **单根节点**：页面组件模板必须单一根节点（`<div class="page-card">` 作为根，弹窗/抽屉放在它内部）。后台路由 `keepAlive: true`，多根组件被缓存后切换页面会渲染空白。
2. **公共样式**：页面结构样式统一在 `app/src/styles/_system-management.scss`，页面组件里不要再复制 `.page-card`、`.filter-bar`、`.tbl` 这类大段样式。
3. **设计 token**：`--ai-*` 变量由公共样式挂在 `.page-card` 上，业务页只使用类名，不重新定义 token。
4. **字体**：列表/表单页 `font-family` 用 `"M PLUS Rounded 1c", ...`，大标题/数字用 `"Mochiy Pop One"`；字体由公共样式引入。
5. **表单/下拉控件用动森系组件**，不要用原生 `<select>`。下拉选择规则见 lessons.md 对应条目。
6. **权限码对齐后端**：`v-hasPerm` 用后端实际权限码（如 `sys:user:add/edit/delete/resetPwd`、`sys:role:permission`、`sys:menu:addz/edit/delete`），不要用 youlai 模板的 `create/update`。
7. **图标**：列表页内联线性图标用全局组件 `app/src/components/AdminPage/SystemIco.vue`；菜单/侧边栏图标用动森 `Icon`（见 `menuAnimalIcon`）。
8. **业务目录不放公共层**：不要在 `views/<module>/shared` 放通用方法/样式/图标。跨栏目复用放 `components`、`composables`、`utils`、`styles`。

### 设计 token 速查
```scss
--ai-primary: #19c8b9;       --ai-primary-active: #11a89b;
--ai-text: #794f27;          --ai-text-2: #9f927d;       --ai-text-3: #c4b89e;
--ai-border: #e8e2d6;        --ai-shadow-color: #bdaea0;
--ai-leaf: #7cba70;          --ai-leaf-d: #4a8a36;       --ai-leaf-l: #d8ecc6;
--ai-red: #fc736d;           --ai-info: #5b9eee;         --ai-success: #6fba2c;
```

---

## 二、列表页结构

```
.page-card（根，圆角 36/44/32/40 不规则 + 暖绿渐变 + 叶子角标 ::before/::after + overflow:hidden）
├─ .page-head        eyebrow(SYSTEM MANAGEMENT) + h1.page-title + p.page-desc
├─ .filter-bar       虚线圆角框 + 左上圆点角标；filter-field(label + 控件) + 查询/重置按钮
├─ .list-card        顶部高光条；.list-head(list-title + list-sub)
│   ├─ .toolbar      左：btn-primary/btn-danger 等操作；.toolbar-spacer；右：.tool-group 内若干 .btn-icon(刷新/密度/列设置/全屏)
│   └─ .tbl-wrap > table.tbl   自定义表格（非 el-table）
└─ pagination        Element Plus 分页（total>0 时显示）
```

要点：
- **表格用自定义 `<table class="tbl">`**（便于像素级还原），不是 el-table。表头浅绿渐变、行 hover 浅绿、单元格居中、名称列左对齐。
- 复选框 `.cbx`（选中打勾）、动作链接 `.action-link`（`act-edit` 蓝 / `act-del` 红 / `act-assign` 绿 / `act-add` 蓝）。
- **标签统一用动森组件 `AnimalTag`**（`app/src/components/AnimalTag/index.vue`），不要再用 `.pill` 系列类。`type` 取 `primary`(蓝，角色/等级/菜单类型) / `success`(绿) / `info`/`default`(灰，按钮/未分级) / `warning` / `danger`，可选 `dot`。
- **列表「状态」列用可切换的动森 `Switch`**（不要用只读的 `.swt`）：单向绑定 `:model-value="row.status === 1"`，`@update:model-value` 里调用对应 `xxx/status/{id}` 接口，成功才回写 `row.status`、失败自动回滚；切换中用 `:loading` 配合一个 `statusLoadingId`。无独立状态接口的（如菜单 `hide`）复用编辑接口做部分更新。状态切换按钮加 `v-hasPerm`（如 `sys:user:status`、`sys:member:status`、`sys:menu:edit`）。
- 数字/路径类单元格用 `.cell-num` / `.cell-mono`（Mochiy 字体）。
- 选择状态用 `app/src/composables/useTableSelection.ts`。自定义表格传入 `rows` 和 `getId`，不用 el-table 的 selection。
- **行内下拉的层级**：filter-bar 里若放动森下拉，要把 `.filter-bar { z-index }` 抬到 `.list-card` 之上，否则面板会被列表卡片遮挡（动森下拉面板是行内绝对定位、非 teleport）。

---

## 三、目录与组件拆分

列表页和编辑表单必须拆开，参考 Vue2 版结构：

```text
views/<module>/<page>/
├─ index.vue          列表、查询、删除、打开弹窗
├─ <page>-edit.vue    新增/编辑表单弹窗
└─ <page>-auth.vue    权限分配等复杂抽屉/弹窗（按需）
```

`index.vue` 不直接写大段 `el-dialog` / `el-drawer` 表单。弹窗组件通过 `v-model:visible` 控制显示，保存成功后 `emit("done")` 让列表刷新。

---

## 四、编辑表单页（弹窗）

- 用 `el-dialog`（`class="develop-dialog"`）承载表单，表单 `class="develop-dialog-form"`，footer `class="develop-dialog-footer"`（这些是全局动森样式）。
- 顶部一行 `.field-desc` 说明；主体用 `el-row :gutter="15"` + 两列 `el-col :sm="12"` 布局。
- **表单字段沿用 Vue2（blog-ui）对应编辑表单的结构与字段**，控件换成动森系：
  | 字段类型 | 用什么 |
  |---|---|
  | 文本/密码/数字 | 动森 `Input`（数字用 `type="number"`） |
  | 单选少量固定项 | 动森 `Select`（`options:{key,label}[]`，值字符串） |
  | 多选 | `AnimalMultiSelect`（`v-model:string[]`，可删 pill） |
  | 多级树形单选 | `AnimalTreeSelect`（如"上级菜单"） |
  | 开关/二选一 | 动森 `Switch`（布尔） |
  | 图标 | 动森 `IconSelect` |
  | 穿梭框 / 多行文本 | 暂用 `el-transfer` / `el-input type=textarea`（动森无等价物） |
- **取值适配**：动森 Select 用字符串、Switch 用布尔、Input 用字符串；与后端的 number/枚举字段之间用 `computed` get/set 代理转换（如 `typeModel`、`statusOn`、`sortModel`）。
- 校验在提交时跑（动森组件不接入 el-form 实时校验）；条件必填用 `validator`（如密码仅新增必填，编辑留空不提交）。

---

## 五、公共能力清单

| 类型 | 路径 | 用途 |
|---|---|---|
| 页面样式 | `app/src/styles/_system-management.scss` | 后台列表页/编辑页公共动森样式 |
| 线性图标 | `app/src/components/AdminPage/SystemIco.vue` | 查询、添加、删除、刷新等列表页图标 |
| 动森标签 | `app/src/components/AnimalTag/index.vue` | 动森风标签（角色/等级/类型/状态展示），替代 `.pill` |
| 表格勾选 | `app/src/composables/useTableSelection.ts` | 自定义 table 勾选、全选、清空 |
| 时间格式化 | `app/src/utils/format.ts` | `formatDateTime` 等格式化方法 |
| 后台工具 | `app/src/utils/systemManagement.ts` | URL 判断、平铺数据转 OptionTree |
| 多选下拉 | `app/src/components/AnimalMultiSelect/index.vue` | 动森风多选下拉（可删 pill） |
| 树形下拉 | `app/src/components/AnimalTreeSelect/index.vue` | 动森风多级树形单选下拉 |
| 图标选择 | `app/src/components/IconSelect/index.vue` | 动森图标选择器 |
| 菜单图标映射 | `app/src/utils/menuAnimalIcon.ts` | 菜单/侧边栏图标 → 动森 Icon 映射 |

Element Plus 弹层（el-select/el-dropdown/dialog 等）的动森风全局样式在 `app/src/styles/vendors/_element-plus.scss`。

---

## 六、新页面落地清单

| 步骤 | 要求 |
|---|---|
| 1 | 先参考 Vue2 版同名栏目，确定列表字段和编辑表单字段 |
| 2 | `index.vue` 只写列表、查询、删除、打开弹窗 |
| 3 | 新增 `<page>-edit.vue`，复杂授权/分配类弹窗继续拆独立组件 |
| 4 | 列表用 `.page-card`、`.filter-bar`、`.list-card`、`.tbl` 公共类 |
| 5 | 控件优先用 animal-island-vue 和项目动森组件 |
| 6 | 公共逻辑优先复用 `components/AdminPage`、`composables`、`utils`、`styles` |
| 7 | 完成后跑定向 ESLint，并同步远端页面验证 |
