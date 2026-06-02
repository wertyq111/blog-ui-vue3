# 动森语义菜单图标设计（试点 + 铺开规范）

- 日期：2026-06-02
- 范围：blog-ui-vue3 后台菜单图标
- 状态：设计已确认（预览 `menu-icons-preview.html` 验收通过，用户确认「按这个风格来」）

## 1. 背景与问题

当前菜单图标由 `AnimalIcon`（42 个动森「道具」图标：钓竿/网/斧头/蝴蝶/化石…）+ `menuAnimalIcon.ts`（关键词正则 + 哈希兜底）把菜单**硬凑**到道具上。问题：

1. **语义对不上**：用户管理→护照、菜单管理→操作台、角色管理→哈希随机，与菜单含义无关。
2. **几乎无动效**：仅 hover 放大。

## 2. 目标

为真实菜单设计一套**语义贴合 + 多动效**的动森风 SVG 图标，hover 触发 2–3 个复合动效，静止安静。先做 10 个试点，验收后铺开到其余 17 个。

## 3. 真实菜单/目录项（type=0，共 27；按钮 type=1 无图标不在范围）

- 顶级：面板主页、工作台
- 系统管理：用户管理、角色管理、菜单管理、职级管理、岗位管理、部门管理、登录日志、操作日志、用户信息
- 数据中心：字典管理、城市管理、配置管理、通知公告、友链管理
- 会员管理：会员等级、会员（列表）
- 个人中心：个人资料
- 其它：开发文档、系统设置、网站设置

**试点 10 个**：面板主页、工作台、用户管理、角色管理、菜单管理、职级管理、岗位管理、部门管理、登录日志、操作日志。

## 4. 架构（与现有体系隔离，最小侵入）

| 新增/改动 | 文件 | 说明 |
|---|---|---|
| 新增组件 | `app/src/components/AnimalMenuIcon/index.vue` | 语义图标 glyph 库；24×24；inline 填充复用动森色板；动效子部件带稳定类（`am-*`），通过 v-html 注入 `<g>` |
| 新增解析器 | `app/src/utils/menuSemanticIcon.ts` | **按 path 显式映射**（`/system/user → menu-user`）；命中返回语义名，未命中返回 `null` |
| 新增全局样式 | `app/src/styles/_animal-menu-icon.scss` | 全部 `@keyframes` + hover 触发规则（图标自身 hover / 侧边栏整行 hover / 表格行 hover）。`index.scss` 加 `@use` |
| 改动接入 | `app/src/layouts/MixLayout.vue`、`app/src/layouts/components/LayoutSidebarItem.vue` | `MenuIcon` 包装器：先 `resolveMenuIcon(icon,path,title)` 命中→渲染 `AnimalMenuIcon`，否则回退原 `AnimalIcon`。侧边栏需把 path/title 传入 |
| 改动接入 | `app/src/views/system/menu/index.vue` | 表格图标列同样「命中语义→新组件，否则旧道具」 |

**不动**：`AnimalIcon`、`menuAnimalIcon.ts`、`IconSelect` 选择器（仍用 42 道具）。未命中语义的菜单自动回退道具图标，铺开前线上无缺图。

## 5. 动效契约

- 纯 CSS `@keyframes`，集中在全局样式文件；**不用 SMIL**。
- 所有动效子部件统一 `transform-box: fill-box`，规避 lessons 记录的「带 inline transform 的 SVG 容器叠加 scale/translate 动画飞散」坑（见 lessons.md 2026-05-27）。
- 触发：hover。三个触发宿主——① 图标自身（表格/通用）；② 侧边栏 `.el-menu-item:hover` / `.el-sub-menu__title:hover`（整行 hover 播放，体验优于只 hover 图标）；③ 表格行 hover。
- 每图标 2–3 个复合动效（错峰 delay）。

## 6. 视觉规范

复用现有动森色板（与 `AnimalIcon` 一致）：

| token | 值 |
|---|---|
| 描边 stroke | `#543d2b`（round cap/join，宽 ~1.3） |
| wood | `#e8c39e` |
| blue | `#4ea5d9` |
| red | `#ff4d6d` |
| grey | `#b8c4cf` |
| teal | `#48a9a6` |
| yellow | `#ffcc3b` |
| leaf | `#7bd138` |
| orange | `#ff7b54` |
| green | `#45b649` |

## 7. 试点 10 图标：意象 + 复合动效

| 语义名 | 菜单 / path | 意象 | hover 多动效 |
|---|---|---|---|
| `menu-home` | 面板主页 `/dashboard` | 小木屋 | 弹跳 + 烟囱飘烟 + 窗口暖光闪 |
| `menu-workplace` | 工作台 `/dashboard/workplace` | 显示器/仪表盘 | 屏幕扫光 + 数据条跳动 + 角标闪 |
| `menu-user` | 用户管理 `/system/user` | 圆脸小动物 | 点头 + 眨眼 + 耳朵摆 + 星闪 |
| `menu-role` | 角色管理 `/system/role` | 勋章徽章+缎带 | 徽章摇摆 + 中心星闪 + 缎带飘 |
| `menu-menu` | 菜单管理 `/system/menu` | 木牌指示牌 | 木牌摇摆 + 钉子闪 + 木板逐条亮 |
| `menu-level` | 职级管理 `/system/level` | 星级阶梯 | 星逐级点亮 + 顶星闪 + 箭头跳 |
| `menu-position` | 岗位管理 `/system/position` | 桌牌+小旗 | 小旗飘 + 牌面扫光 + 底座弹 |
| `menu-dept` | 部门管理 `/system/dept` | 圆顶小楼 | 窗户逐个亮 + 楼身轻弹 + 屋顶旗飘 |
| `menu-loginlog` | 登录日志 `/system/loginlog` | 时钟+钥匙角标 | 指针转 + 钟摆滴答 + 钥匙闪 |
| `menu-operlog` | 操作日志 `/system/operlog` | 羽毛笔+纸卷 | 纸卷展开 + 羽毛笔书写 + 对勾闪 |

造型与动效以已验收的 `menu-icons-preview.html` 为准。

## 8. 铺开计划（验收后）

剩余 17 个按相同契约补 glyph + path 映射：用户信息、字典管理、城市管理、配置管理、通知公告、友链管理、会员等级、会员、个人资料、开发文档、系统设置、网站设置（数据中心/会员/个人中心/系统设置组）。每个仅追加 glyph 数据 + 一条 path 映射 + 一组 keyframes，无需改架构。

## 9. 验证

- 本地：`pnpm build` / 类型检查通过；预览页 hover 动效正常。
- 页面/浏览器验证按项目规范先确认或同步远端用现有服务看，不自动开浏览器（lessons.md 2026-05-28）。

## 10. 交付

按项目四步默认流程（中文 PR → 本地合并 main → push origin main → 远端 `git reset --hard origin/main`）。**不自动提交**，等用户发话。

## 11. 实施补记（2026-06-02 第二批）

- **远端真实菜单树与 seeder 不同**（线上从 DB 查得）：顶级为 面板主页/系统管理/会员管理/开发管理/设计管理/个人中心；pilot 中的 职级/岗位/部门/登录日志/操作日志 远端不存在（映射保留为预留，重新启用即生效）。
- **第二批已完成可见菜单 15 个**：父级 5（/system /member /develop /design /user）+ 子级 10（会员等级、会员、路径转换、模型初始化、工作平台、工作日常、工作文档、待办列表、图片处理、个人资料）。新增 `am-wiggle`/`am-spin4` 动效。
- **第三批已完成隐藏模块 17 个**：小程序管理(/mini-program + 7 子：壁纸分类/壁纸/笔记分类/笔记标签/笔记/相册分类/相册)、烟草管理(/tobacco + 7 子：客户/订货/定点/补供/云烟/供货/检查)、用户详情(/system/user/info)。至此**全部 42 个语义图标完成**（含 5 个远端预留）。
- **顺带修复侧边栏 bug**：`LeftLayout.vue` 滚动容器内 `.el-scrollbar__view`/`.sidebar-wrapper` 被钉死 `height:100%` + `overflow:hidden`，菜单全展开后底部被裁、无法滚动。改为内容 `height:auto` + `overflow:visible`，由 el-scrollbar 滚动。
- 预览模板 `menu-icons-preview.html` 已补齐至 25 个（保留作为后续图标生成模板）。
