# Vue3 动森风个人资料页设计（spec）

- 日期：2026-05-25
- 范围：blog-ui-vue3
- 目标：重写 `app/src/views/profile/index.vue`，以动森风替换现有 Element Plus 实现；左侧人物形象区参照设计模板 `design/blog-remix/project/profile.html`，右侧编辑区沿用 vue2 版（`blog-ui/app/src/views/user/profile.vue`）的字段与交互。

## 1. 背景与依据

- 设计模板：`design/blog-remix/project/profile.html`（动森风 island 主题：左侧 gender-aware 人物视频舞台 + 浮动 HUD + 技能 dock；右侧 头像上传 + tabs + 表单）。
- vue2 参照：`blog-ui/app/src/views/user/profile.vue`（字段：姓名/昵称/性别/联系方式/邮箱/详细地址/个人简介；账号绑定静态列表；性别感知人物形象）。
- 现状（待替换）：`blog-ui-vue3/app/src/views/profile/index.vue` 全量使用 Element Plus（el-card/row/col/avatar/form/input/radio/tag/descriptions），非动森风。
- 风格规范：`docs/admin-page-style.md`（单根 `.page-card`、动森 token `--ai-*`、字体 M PLUS Rounded 1c / Mochiy Pop One、控件用动森系组件、校验在提交时手动跑）。
- 约定：必须逐条对照设计稿还原，不做"能跑的简化版"。

## 2. 已确认决策

1. 右侧保留「账号绑定」tab，按 vue2 做动森风**静态展示**（密保手机/邮箱/密保问题/QQ/微信/支付宝；按钮不接真实绑定逻辑）。
2. 人物视频素材放 `app/public/persona/{male,female,private}.mp4` 并随仓库提交（约 6MB）。
3. 性别→视频映射：`1=男→male.mp4`、`2=女→female.mp4`、`3/其他=保密→private.mp4`；性别变更即切换视频源。
4. 头像上传做成内联 110px 投放区（复用 `FileAPI.uploadFile`），不沿用按钮式 `AnimalUpload`。

## 3. 页面结构

单根 `.page-card`（满足后台路由 keepAlive 缓存要求）：

```
.page-card（根，动森 token）
├─ .page-head            eyebrow "PROFILE" + h1「个人资料」+ desc
└─ .profile-grid         两列 9fr/15fr，≤992px 堆叠为单列
   ├─ 左 .profile-hero 卡（数字身份档案）
   │   ├─ eyebrow（脉冲点）+ 「数字身份档案」
   │   ├─ headline：displayName + 性别感知副标题
   │   └─ .profile-stage
   │       ├─ <video>（gender-aware，autoplay muted loop playsinline）
   │       ├─ CSS chibi 占位（视频加载前 / @error 兜底）
   │       ├─ 四角浮动 HUD：角色定位 / 组织信息 / 所在地区 / 技术栈
   │       ├─ 底部 SKILLS 技能 dock（chips）
   │       └─ 四角 chrome + caption
   └─ 右 .profile-panel 卡（资料编辑）
       ├─ 头部：kicker「PROFILE EDITOR」+ h3「个人资料」+ desc + 头像上传(110px 投放区)
       ├─ 动森 Tabs：基本信息 / 账号绑定
       ├─ [基本信息] 两列表单 grid：
       │     姓名*  | 昵称*
       │     性别(Select) | 联系方式
       │     邮箱*(span2)
       │     详细地址(span2)
       │     个人简介 AnimalTextarea(span2)
       │     操作区：保存更改 / 重置
       └─ [账号绑定] 动森风静态列表（图标 + 标题 + 说明 + 操作链接）
```

## 4. 组件与替换映射

| 原 Element Plus | 动森替换 |
|---|---|
| el-input | 动森 `Input`（全局注册） |
| el-select / el-radio(性别) | 动森 `Select`（options:{key,label}[]，值字符串） |
| el-input type=textarea | `AnimalTextarea`（个人简介，maxlength 计数） |
| el-tabs / el-tab-pane | 动森 `Tabs` |
| el-button | 动森 `Button` |
| el-card / el-row / el-col | `.page-card` + CSS grid |
| el-divider | 动森 `Divider`（如需） |
| el-avatar + 上传 | 内联 110px 头像投放区 + `FileAPI.uploadFile` |
| el-tag | `AnimalTag`（账号绑定/角色展示如需） |

- 不新增可复用公共组件：核心动森控件已齐；**人物视频舞台**与**头像投放区**为本页局部实现（页面专属，不放公共层）。
- 性别 number ↔ Select string：用 `computed` get/set 代理。
- 校验：提交时手动校验（姓名必填、昵称必填、邮箱必填且格式正确），行内错误提示，不接 el-form 实时校验。

## 5. 数据流

- `onMounted → UserAPI.getProfile()`（= getUserInfo，include member）→ 映射到 `form`（realname/nickname/gender/mobile/email/address/intro/avatar）与展示用 `userProfile`。
- 性别 `form.gender` 经 computed 决定：当前 video src、headline 副标题文案。
- 保存：手动校验通过 → `UserAPI.updateProfile(form)`（POST `/index/updateUserInfo`）→ 成功 `ElMessage.success` + 重新拉取 + 同步 `userStore`。
- 头像：选文件 → `FileAPI.uploadFile` → `UserAPI.updateProfile({ avatar })` → 回写本地与 store。
- 重置：将表单恢复为最近一次加载的数据。

## 6. 错误处理

- 视频：加载前展示 chibi 占位；`@error` 保持 chibi 占位（不阻塞编辑）。
- 接口异常：沿用现有 `ElMessage` 错误提示与 try/finally loading 模式。

## 7. 样式

- scoped 样式写在组件内，按 `profile.html` 还原（色板：mint `#20c9b2` / teal-ink `#17322d` / wood 系；圆角、玻璃拟态、装饰光斑、orbit、HUD 连接线、dock 等）。
- 字体遵循约定（M PLUS Rounded 1c 正文 / Mochiy Pop One 大标题），由公共样式引入。
- 仅使用动森 token 类，不重复定义 token。

## 8. 验证

1. 本地：定向 ESLint + 类型/构建检查。
2. rsync 同步 `app/`（排除 `._*`、`node_modules`、`vendor`、`dist`、`.vite`、`.pnpm-store`）到远端 `10.10.9.184:/data/personal/projects/blog-ui-vue3/app/`，含 `public/persona/` 视频。
3. 打开 8083 页面核对：整体视觉对齐设计稿、性别切换视频切换、表单加载/校验/保存、头像上传、账号绑定 tab 静态展示、响应式堆叠。

## 9. 不在本次范围

- 账号绑定的真实后端逻辑（保持静态）。
- 后端接口变更（沿用现有 `/index/updateUserInfo` 与 getUserInfo）。
- 其他个人中心子页面。
