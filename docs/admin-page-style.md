# Vue3 后台页面风格说明（动森风）

适用于 blog-ui-vue3 后台「列表页 + 编辑表单页」。新增或改造后台页面时按本说明执行，保持视觉与交互一致。参考实现：`app/src/views/system/{user,role,menu}/index.vue`。设计来源：`design/blog-handoff/blog`（`system-pages.jsx` + `system.css`）。

---

## 一、通用约定（务必遵守）

1. **单根节点**：页面组件模板必须单一根节点（`<div class="page-card">` 作为根，弹窗/抽屉放在它内部）。后台路由 `keepAlive: true`，多根组件被缓存后切换页面会渲染空白。
2. **设计 token**：在根 `.page-card` 上定义 `--ai-*` 变量并用 `var(--ai-*)` 引用，不要散落硬编码 hex。
3. **字体**：列表/表单页 `font-family` 用 `"M PLUS Rounded 1c", ...`，大标题/数字用 `"Mochiy Pop One"`；通过 `@import` Google Fonts 引入（离线回退系统圆体）。
4. **表单/下拉控件用动森系组件**，不要用原生 `<select>`。下拉选择规则见 lessons.md 对应条目。
5. **权限码对齐后端**：`v-hasPerm` 用后端实际权限码（如 `sys:user:add/edit/delete/resetPwd`、`sys:role:permission`、`sys:menu:addz/edit/delete`），不要用 youlai 模板的 `create/update`。
6. **图标**：列表页内联线性图标用一个本地 `Ico` 渲染组件（`defineComponent` + `h('svg',{innerHTML})`），路径取自设计稿 Ico 集；菜单/侧边栏图标用动森 `Icon`（见 `menuAnimalIcon`）。

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
├─ .filter-bar       虚线圆角框 + 左上 🌾 角标；filter-field(label + 控件) + 查询/重置按钮
├─ .list-card        顶部高光条；.list-head(📜 list-title + list-sub)
│   ├─ .toolbar      左：btn-primary/btn-danger 等操作；.toolbar-spacer；右：.tool-group 内若干 .btn-icon(刷新/密度/列设置/全屏)
│   └─ .tbl-wrap > table.tbl   自定义表格（非 el-table）
└─ pagination        Element Plus 分页（total>0 时显示）
```

要点：
- **表格用自定义 `<table class="tbl">`**（便于像素级还原），不是 el-table。表头浅绿渐变、行 hover 浅绿、单元格居中、名称列左对齐。
- 复选框 `.cbx`（选中打勾）、状态开关展示用 `.swt`、标签 `.pill`（`pill-menu`/`pill-button`/`pill-role`/`pill-status-on`）、动作链接 `.action-link`（`act-edit` 蓝 / `act-del` 红 / `act-assign` 绿 / `act-add` 蓝）。
- 数字/路径类单元格用 `.cell-num` / `.cell-mono`（Mochiy 字体）。
- 选择状态用本地 `checkedIds`（按行 id 类型，注意 RoleItem.id 是字符串），不用 el-table 的 selection。
- **行内下拉的层级**：filter-bar 里若放动森下拉，要把 `.filter-bar { z-index }` 抬到 `.list-card` 之上，否则面板会被列表卡片遮挡（动森下拉面板是行内绝对定位、非 teleport）。

---

## 三、编辑表单页（弹窗）

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

## 四、复用组件清单

| 组件 | 路径 | 用途 |
|---|---|---|
| `AnimalMultiSelect` | `app/src/components/AnimalMultiSelect/index.vue` | 动森风多选下拉（可删 pill） |
| `AnimalTreeSelect` | `app/src/components/AnimalTreeSelect/index.vue` | 动森风多级树形单选下拉 |
| `IconSelect` | `app/src/components/IconSelect/index.vue` | 动森图标选择器 |
| `menuAnimalIcon` | `app/src/utils/menuAnimalIcon.ts` | 菜单/侧边栏图标 → 动森 Icon 映射 |

Element Plus 弹层（el-select/el-dropdown/dialog 等）的动森风全局样式在 `app/src/styles/vendors/_element-plus.scss`。
