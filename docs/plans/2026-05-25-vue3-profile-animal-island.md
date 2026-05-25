# Vue3 动森风个人资料页 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use /executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用动森风重写 `app/src/views/profile/index.vue`，左侧为 gender-aware 人物视频舞台（参照 `design/blog-remix/project/profile.html`），右侧为头像上传 + Tabs + 表单的资料编辑区，全部用动森组件替换 Element Plus。

**Architecture:** 单根 `.page-card` 的 Vue3 `<script setup lang="ts">` 单文件组件。逻辑复用现有 `UserAPI.getProfile/updateProfile` 与 `FileAPI.uploadFile`；性别 number 经 computed 代理成动森 `Select` 的 string，并驱动人物视频源与副标题；校验在提交时手动跑。样式 scoped，从设计稿 `profile.html` 移植。

**Tech Stack:** Vue 3 + TypeScript + Vite；animal-island-vue（全局 `Input/Select/Tabs/Button/Divider/Icon`）；项目动森件 `AnimalTextarea`；Element Plus 仅保留 `ElMessage` 提示与图标。

**关键事实（实现前必读）：**
- 本仓库 host 无 `node_modules`（依赖在容器 `blog-ui-vue3-web-1` 的 docker volume 内），类型/lint/构建需在容器内跑或靠远端 8083 dev server 的 Vite HMR/overlay 验证。
- 远端 = 测试服 `ubuntu@10.10.9.184:/data/personal/projects/blog-ui-vue3`，dev server 端口 `8083`，已常驻运行（改源码 rsync 后 HMR 生效，无需重建容器）。
- `UserAPI.getProfile()` = GET `/users/getUserInfo?include=member`；返回 `{username, phone, email, createTime, avatar, member:{nickname,gender,avatar,realname,address,intro}, roles:[...]}`。
- `UserAPI.updateProfile(data)` = POST `/index/updateUserInfo`，接收 `UserProfileForm`：`{email?, mobile?, realname?, nickname?, gender?:number, avatar?, address?, intro?}`。
- `FileAPI.uploadFile(file)` → `Promise<FileInfo>`，取 `.url`。
- `useUserStore().userInfo` 有 `nickname`、`avatar` 字段，保存/换头像后同步。
- 性别映射：`1=男→/persona/male.mp4`、`2=女→/persona/female.mp4`、其他(含3保密/0)→`/persona/private.mp4`。
- 设计稿样式源：`design/blog-remix/project/profile.html`（`<style>` 段，第 11–985 行）。

---

### Task 1: 放置人物视频素材

**Files:**
- Create: `app/public/persona/male.mp4`（拷贝自 `design/blog-remix/project/assets/persona/male.mp4`）
- Create: `app/public/persona/female.mp4`
- Create: `app/public/persona/private.mp4`

- [ ] **Step 1: 拷贝三个视频到 public**

Run（在 `blog-ui-vue3/` 根）：
```bash
mkdir -p app/public/persona
cp design/blog-remix/project/assets/persona/male.mp4 app/public/persona/male.mp4
cp design/blog-remix/project/assets/persona/female.mp4 app/public/persona/female.mp4
cp design/blog-remix/project/assets/persona/private.mp4 app/public/persona/private.mp4
```

- [ ] **Step 2: 校验存在与大小**

Run: `ls -lh app/public/persona/`
Expected: 三个 mp4，各约 1.8–2.0M。

- [ ] **Step 3: 提交**

```bash
git add app/public/persona/male.mp4 app/public/persona/female.mp4 app/public/persona/private.mp4
git commit -m "feat(profile): 新增个人资料页人物形象视频素材"
```

---

### Task 2: 重写组件的 `<script setup>` 逻辑

**Files:**
- Modify: `app/src/views/profile/index.vue`（整体替换；本 Task 先落 `<script setup>`，Task 3/4 落 template，Task 5 落 style）

- [ ] **Step 1: 写入 `<script setup lang="ts">`**

把文件 `<script setup>` 段整体替换为下面内容（template/style 在后续 Task 写；本步可先把 template 留为最小占位 `<template><div class="page-card"></div></template>`，style 留空，保证可编译）：

```vue
<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import UserAPI from "@/api/system/user";
import FileAPI from "@/api/file";
import { useUserStore } from "@/store/modules/user";
import type { UserProfileForm } from "@/types/api";

defineOptions({ name: "Profile" });

const userStore = useUserStore();
const loading = ref(false);
const saving = ref(false);
const active = ref<"info" | "account">("info");
const fileInput = ref<HTMLInputElement | null>(null);

interface ProfileForm {
  realname: string;
  nickname: string;
  gender: number;
  mobile: string;
  email: string;
  address: string;
  intro: string;
  avatar: string;
}

const createDefaultForm = (): ProfileForm => ({
  realname: "",
  nickname: "",
  gender: 1,
  mobile: "",
  email: "",
  address: "",
  intro: "",
  avatar: "",
});

const form = reactive<ProfileForm>(createDefaultForm());
let lastLoaded: ProfileForm = createDefaultForm();

// 校验错误（提交时手动跑，非 el-form 实时校验）
const errors = reactive<{ realname: string; nickname: string; email: string }>({
  realname: "",
  nickname: "",
  email: "",
});

// 性别选项（动森 Select：值字符串）
const genderOptions = [
  { key: "1", label: "男" },
  { key: "2", label: "女" },
  { key: "3", label: "保密" },
];
const genderModel = computed<string>({
  get: () => String(form.gender ?? 1),
  set: (v) => {
    form.gender = Number(v) || 1;
  },
});

// 性别 → 人物视频
const personaVideo = computed(() => {
  if (Number(form.gender) === 1) return "/persona/male.mp4";
  if (Number(form.gender) === 2) return "/persona/female.mp4";
  return "/persona/private.mp4";
});

const displayName = computed(
  () => form.nickname || form.realname || form.email || "数字分身档案"
);
const heroSubtitle = computed(() => {
  const map: Record<number, string> = {
    1: "男性数字形象在线，轻交互模式已启用。",
    2: "女性数字形象在线，轻交互模式已启用。",
    3: "保密模式已启用，当前展示默认数字形象。",
  };
  return map[Number(form.gender)] || map[1];
});

// HUD 静态信息（沿用 vue2 文案；所在地区取地址兜底）
const heroMeta = computed(() => [
  { label: "角色定位", value: "资深架构师" },
  { label: "组织信息", value: "浙江网盛生意宝股份有限公司" },
  { label: "所在地区", value: form.address || "中国 · 浙江省 · 杭州市" },
  { label: "技术栈", value: "Laravel · Vue · MySQL · AntDesign" },
]);
const skillChips = ["Digital Persona", "Laravel", "Vue 3", "MySQL", "Element Plus", "AntDesign", "Mint Glow"];

// 账号绑定静态列表（vue2 同款，按钮不接真实逻辑）
const accountBindings = [
  { key: "phone", title: "密保手机", desc: "已绑定手机：180****2354", action: "去修改" },
  { key: "email", title: "密保邮箱", desc: "已绑定邮箱：vwms@netsun.com", action: "去修改" },
  { key: "question", title: "密保问题", desc: "未设置密保问题", action: "去设置" },
  { key: "qq", title: "绑定 QQ", desc: "当前未绑定 QQ 账号", action: "去绑定" },
  { key: "wechat", title: "绑定微信", desc: "当前未绑定微信账号", action: "去绑定" },
  { key: "alipay", title: "绑定支付宝", desc: "当前未绑定支付宝账号", action: "去绑定" },
];

const videoError = ref(false);
function handleVideoError() {
  videoError.value = true;
}

async function loadProfile() {
  loading.value = true;
  try {
    const data: any = await UserAPI.getProfile();
    const member = data.member || {};
    Object.assign(form, {
      realname: member.realname || "",
      nickname: member.nickname || data.nickname || "",
      gender: Number(member.gender || 1),
      mobile: data.phone || "",
      email: data.email || "",
      address: member.address || "",
      intro: member.intro || "",
      avatar: member.avatar || data.avatar || "",
    });
    lastLoaded = { ...form };
  } finally {
    loading.value = false;
  }
}

function validate(): boolean {
  errors.realname = form.realname.trim() ? "" : "请输入姓名";
  errors.nickname = form.nickname.trim() ? "" : "请输入昵称";
  if (!form.email.trim()) {
    errors.email = "请输入邮箱";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "邮箱格式不正确";
  } else {
    errors.email = "";
  }
  return !errors.realname && !errors.nickname && !errors.email;
}

async function handleSubmit() {
  if (!validate()) return;
  saving.value = true;
  try {
    const payload: UserProfileForm = {
      realname: form.realname,
      nickname: form.nickname,
      gender: form.gender,
      mobile: form.mobile,
      email: form.email,
      address: form.address,
      intro: form.intro,
    };
    await UserAPI.updateProfile(payload);
    ElMessage.success("保存成功");
    userStore.userInfo.nickname = form.nickname;
    lastLoaded = { ...form };
  } catch (e: any) {
    ElMessage.error(e?.message || "保存失败");
  } finally {
    saving.value = false;
  }
}

function handleReset() {
  Object.assign(form, lastLoaded);
  errors.realname = errors.nickname = errors.email = "";
}

function triggerUpload() {
  fileInput.value?.click();
}
async function handleAvatarChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  loading.value = true;
  try {
    const data = await FileAPI.uploadFile(file);
    await UserAPI.updateProfile({ avatar: data.url });
    form.avatar = data.url;
    lastLoaded.avatar = data.url;
    userStore.userInfo.avatar = data.url;
    ElMessage.success("头像更新成功");
  } catch (e: any) {
    ElMessage.error(e?.message || "头像上传失败");
  } finally {
    loading.value = false;
    target.value = "";
  }
}

onMounted(loadProfile);
</script>
```

- [ ] **Step 2: 类型检查通过**

Run（容器内）：
```bash
ssh ubuntu@10.10.9.184 'docker exec blog-ui-vue3-web-1 sh -c "cd /project && npx vue-tsc --noEmit 2>&1 | head -30"'
```
Expected: 无与 `profile/index.vue` 相关的报错（template 占位期间允许"未使用变量"类提示，Task 3/4 后清零）。

- [ ] **Step 3: 提交**

```bash
git add app/src/views/profile/index.vue
git commit -m "feat(profile): 重写个人资料页脚本逻辑(动森,gender-aware)"
```

---

### Task 3: 左侧人物视频舞台模板

**Files:**
- Modify: `app/src/views/profile/index.vue`（template 左半）

- [ ] **Step 1: 写入根 + page-head + 左侧 hero**

把 `<template>` 替换为如下骨架（右侧 panel 在 Task 4 补；先保证左侧完整）：

```vue
<template>
  <div class="page-card profile-page" v-loading="loading">
    <div class="page-head">
      <div class="page-eyebrow">PROFILE</div>
      <h1 class="page-title">个人资料</h1>
      <p class="page-desc">管理基础身份信息、头像素材与账号绑定状态。</p>
    </div>

    <div class="profile-grid">
      <!-- 左：数字身份档案 -->
      <section class="profile-hero">
        <div class="hero__decor hero__decor--mint"></div>
        <div class="hero__decor hero__decor--lime"></div>
        <div class="hero__orbit hero__orbit--1"></div>
        <div class="hero__orbit hero__orbit--2"></div>

        <div class="eyebrow"><span class="eyebrow__dot"></span>数字身份档案</div>
        <div class="hero__head">
          <h2>{{ displayName }}</h2>
          <p>{{ heroSubtitle }}</p>
        </div>

        <div class="stage" :class="{ 'has-video': !videoError }">
          <span class="stage__corner tl"></span>
          <span class="stage__corner tr"></span>
          <span class="stage__corner bl"></span>
          <span class="stage__corner br"></span>

          <video
            v-show="!videoError"
            class="stage__video"
            :src="personaVideo"
            autoplay
            muted
            loop
            playsinline
            preload="auto"
            @error="handleVideoError"
          ></video>

          <!-- chibi 占位（视频失败兜底） -->
          <template v-if="videoError">
            <div class="stage__floor"></div>
            <div class="persona">
              <div class="persona__head"></div>
              <div class="persona__body"><div class="persona__legs"><span></span><span></span></div></div>
            </div>
            <span class="stage__caption">// persona offline · fallback view</span>
          </template>

          <div class="hud hud--tl">
            <div class="hud__ico"><Icon name="user" /></div>
            <div class="hud__txt"><span class="hud__lbl">{{ heroMeta[0].label }}</span><span class="hud__val">{{ heroMeta[0].value }}</span></div>
          </div>
          <div class="hud hud--tr">
            <div class="hud__ico"><Icon name="building" /></div>
            <div class="hud__txt"><span class="hud__lbl">{{ heroMeta[1].label }}</span><span class="hud__val">{{ heroMeta[1].value }}</span></div>
          </div>
          <div class="hud hud--bl">
            <div class="hud__ico"><Icon name="location" /></div>
            <div class="hud__txt"><span class="hud__lbl">{{ heroMeta[2].label }}</span><span class="hud__val">{{ heroMeta[2].value }}</span></div>
          </div>
          <div class="hud hud--br">
            <div class="hud__ico"><Icon name="cap" /></div>
            <div class="hud__txt"><span class="hud__lbl">{{ heroMeta[3].label }}</span><span class="hud__val">{{ heroMeta[3].value }}</span></div>
          </div>

          <div class="dock">
            <span class="dock__label">SKILLS</span>
            <span class="dock__divider"></span>
            <div class="dock__chips">
              <span
                v-for="(c, i) in skillChips"
                :key="c"
                class="dock__chip"
                :class="{ 'dock__chip--accent': i === 0 }"
              >{{ c }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 右：资料编辑（Task 4 补全） -->
      <section class="profile-panel"></section>
    </div>
  </div>
</template>
```

> 注意：动森 `Icon` 的 `name` 取值需对照 animal-island-vue 实际图标名。实现时若某 `name` 不存在，回退用内联 `<svg>`（直接复用 `profile.html` 第 1177–1215 行对应 HUD 的 svg），保证四个 HUD 图标都能显示。

- [ ] **Step 2: HMR/类型检查无报错**

Run: `ssh ubuntu@10.10.9.184 'docker exec blog-ui-vue3-web-1 sh -c "cd /project && npx vue-tsc --noEmit 2>&1 | grep -i profile | head"'`
Expected: 无 profile 相关报错。

- [ ] **Step 3: 提交**

```bash
git add app/src/views/profile/index.vue
git commit -m "feat(profile): 左侧人物视频舞台与 HUD 模板"
```

---

### Task 4: 右侧编辑面板模板（头像/Tabs/表单/账号绑定）

**Files:**
- Modify: `app/src/views/profile/index.vue`（替换 `<section class="profile-panel"></section>`）

- [ ] **Step 1: 写入右侧面板**

把空的 `<section class="profile-panel"></section>` 替换为：

```vue
      <section class="profile-panel">
        <div class="panel__head">
          <div class="panel__lead">
            <span class="kicker">PROFILE EDITOR</span>
            <h3>个人资料</h3>
            <p>管理基础身份信息、头像素材与账号绑定状态。</p>
          </div>
          <div class="avatar-upload">
            <div class="avatar-upload__label">头像上传</div>
            <div class="avatar-upload__drop" title="上传头像" @click="triggerUpload">
              <img v-if="form.avatar" :src="form.avatar" alt="avatar" />
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </div>
            <input ref="fileInput" type="file" accept="image/*" style="display: none" @change="handleAvatarChange" />
          </div>
        </div>

        <Tabs
          v-model="active"
          :tabs="[
            { key: 'info', label: '基本信息' },
            { key: 'account', label: '账号绑定' },
          ]"
        />

        <!-- 基本信息 -->
        <form v-show="active === 'info'" class="profile-form" @submit.prevent>
          <div class="field">
            <label><span class="req">*</span>姓名</label>
            <Input v-model="form.realname" placeholder="请输入姓名" />
            <span v-if="errors.realname" class="field__err">{{ errors.realname }}</span>
          </div>
          <div class="field">
            <label><span class="req">*</span>昵称</label>
            <Input v-model="form.nickname" placeholder="请输入昵称" />
            <span v-if="errors.nickname" class="field__err">{{ errors.nickname }}</span>
          </div>
          <div class="field">
            <label><span class="req">*</span>性别</label>
            <Select v-model="genderModel" :options="genderOptions" placeholder="请选择性别" />
          </div>
          <div class="field">
            <label>联系方式</label>
            <Input v-model="form.mobile" placeholder="请输入联系方式" />
          </div>
          <div class="field field--span2">
            <label><span class="req">*</span>邮箱</label>
            <Input v-model="form.email" placeholder="请输入邮箱" />
            <span v-if="errors.email" class="field__err">{{ errors.email }}</span>
          </div>
          <div class="field field--span2">
            <label>详细地址</label>
            <Input v-model="form.address" placeholder="请输入详细地址（如：浙江省杭州市西湖区...）" />
          </div>
          <div class="field field--span2">
            <label>个人简介</label>
            <AnimalTextarea v-model="form.intro" :rows="4" :maxlength="200" placeholder="一句话描述自己 / 兴趣 / 当前在做的事..." />
          </div>
          <div class="actions">
            <Button type="primary" :loading="saving" @click="handleSubmit">保存更改</Button>
            <Button @click="handleReset">重置</Button>
          </div>
        </form>

        <!-- 账号绑定 -->
        <div v-show="active === 'account'" class="account-list">
          <div v-for="item in accountBindings" :key="item.key" class="account-item">
            <div class="account-item__icon"><Icon :name="item.key" /></div>
            <div class="account-item__content">
              <strong>{{ item.title }}</strong>
              <p>{{ item.desc }}</p>
            </div>
            <a class="account-item__action">{{ item.action }}</a>
          </div>
        </div>
      </section>
```

> 实现时核对：动森 `Tabs` 的 props 是否为 `:tabs` + `v-model`（若该库 Tabs API 不同，按其实际 props 调整，保持"基本信息/账号绑定"两页签 + 切换 `active`）。`AnimalTextarea` 引入：`import AnimalTextarea from "@/components/AnimalTextarea/index.vue";`（加到 script imports）。`Select`/`Input`/`Button`/`Tabs`/`Icon` 为全局注册，无需 import。

- [ ] **Step 2: 补 AnimalTextarea import**

在 `<script setup>` 顶部 imports 区加：
```ts
import AnimalTextarea from "@/components/AnimalTextarea/index.vue";
```

- [ ] **Step 3: 类型检查通过**

Run: `ssh ubuntu@10.10.9.184 'docker exec blog-ui-vue3-web-1 sh -c "cd /project && npx vue-tsc --noEmit 2>&1 | grep -i profile | head"'`
Expected: 无 profile 相关报错。

- [ ] **Step 4: 提交**

```bash
git add app/src/views/profile/index.vue
git commit -m "feat(profile): 右侧头像/Tabs/表单/账号绑定模板"
```

---

### Task 5: scoped 样式（移植设计稿）

**Files:**
- Modify: `app/src/views/profile/index.vue`（`<style lang="scss" scoped>`）

- [ ] **Step 1: 移植样式**

将 `design/blog-remix/project/profile.html` `<style>`（第 11–985 行）中以下选择器族移植到组件 scoped style，去掉 navbar/sidebar/body/amb 等布局壳样式（页面已在 admin 布局内），保留并改造：
- `:root` 色板变量 → 落到 `.profile-page` 作用域内（mint/teal/wood/grass/shell/radius 等）。
- `.profile-grid`（= 设计稿 `.grid`，`grid-template-columns: minmax(0,9fr) minmax(0,15fr); gap:22px`）。
- 左：`.profile-hero`（= `.hero` + `.card`）、`.hero__decor*`、`.hero__orbit*`、`.eyebrow`/`.eyebrow__dot`/`@keyframes pulse`、`.hero__head`、`.stage` 及 `.stage__corner/__chip/__caption/__floor/__video`、`.persona*` 及 `@keyframes persona-breath/blink`、`.hud*` 及连接线 `::before/::after` 与 `@keyframes hud-float`、`.dock*`。
- 右：`.profile-panel`（= `.panel` + `.card`）、`.panel__head`/`.kicker`、`.avatar-upload*`（drop 区 110px；补 `img{width:100%;height:100%;object-fit:cover;border-radius:20px}`）、`.profile-form`（= `.form`，两列 grid）、`.field`/`.field--span2`/`label`/`.req`、`.actions`、`.account-list`/`.account-item*`（= 设计稿无则参照 vue2 `.profile-account-*`：图标 46px 渐变方块、标题/说明、右侧链接）。
- 新增：`.field__err{color:#ef4444;font-size:12px;}`。
- 响应式：`@media (max-width:992px)` 时 `.profile-grid` 单列、`.stage` 降高；`@media (max-width:768px)` 表单单列（`.field--span2{grid-column:span 1}`）。

> `.field input/select` 等原生控件样式在设计稿用于裸 input；本页控件改为动森 `Input/Select`，这些规则改为只对 `.field label`/布局生效，输入框外观交给动森组件本身；如需微调动森控件外观用 `:deep()`。

- [ ] **Step 2: stylelint 通过**

Run: `ssh ubuntu@10.10.9.184 'docker exec blog-ui-vue3-web-1 sh -c "cd /project && npx stylelint \"src/views/profile/index.vue\" 2>&1 | head -30"'`
Expected: 无 error（warning 可接受）。

- [ ] **Step 3: 提交**

```bash
git add app/src/views/profile/index.vue
git commit -m "feat(profile): 移植动森风 scoped 样式还原设计稿"
```

---

### Task 6: 本地 lint + 类型校验

- [ ] **Step 1: ESLint（容器内，定向）**

Run: `ssh ubuntu@10.10.9.184 'docker exec blog-ui-vue3-web-1 sh -c "cd /project && npx eslint \"src/views/profile/index.vue\" 2>&1 | head -40"'`
Expected: 无 error。若有，修复后重跑。

- [ ] **Step 2: 全量类型检查**

Run: `ssh ubuntu@10.10.9.184 'docker exec blog-ui-vue3-web-1 sh -c "cd /project && npx vue-tsc --noEmit 2>&1 | tail -20"'`
Expected: 0 errors。

- [ ] **Step 3: 如有修复则提交**

```bash
git add app/src/views/profile/index.vue
git commit -m "fix(profile): 修复 lint/类型问题"
```

---

### Task 7: 同步远端并页面验证

- [ ] **Step 1: rsync 同步 app/（含视频）到远端**

Run（在 `blog-ui-vue3/`）：
```bash
rsync -avz \
  --exclude='._*' --exclude='node_modules' --exclude='vendor' \
  --exclude='dist' --exclude='.vite' --exclude='.pnpm-store' \
  ./app/ ubuntu@10.10.9.184:/data/personal/projects/blog-ui-vue3/app/
```
Expected: 传输包含 `src/views/profile/index.vue` 与 `public/persona/*.mp4`。

- [ ] **Step 2: 浏览器验证 8083**

打开 `http://10.10.9.184:8083` 登录后进入「个人中心 / 个人资料」，逐条核对：
- 整体两栏布局与设计稿一致；左侧人物视频自动播放、四角 HUD + 底部 SKILLS dock 显示正常。
- 切换「性别」下拉：1男→male、2女→female、3保密→private 视频随之切换；副标题随性别变化。
- 表单加载出当前用户数据；姓名/昵称/邮箱留空或邮箱格式错时点"保存更改"出现行内错误；正常保存出现"保存成功"。
- 头像投放区点击可选图片并上传成功、缩略显示。
- 「账号绑定」tab 显示 6 项静态列表。
- 窄屏（≤992px）两栏堆叠为单列、表单单列。

Expected: 全部符合；视频无 404（Network 面板 `/persona/*.mp4` 为 200）。

- [ ] **Step 3: 截图留档（可选）**

如需，浏览器截图保存，便于交付说明。

---

### Task 8: 收尾交付

- [ ] **Step 1: 确认分支提交完整**

Run: `git -C /Volumes/AgentAPFS/Program/Personal/blog/blog-ui-vue3 log --oneline main..feature/profile-animal-island`
Expected: 含 spec、视频、脚本、模板、样式、修复等提交。

- [ ] **Step 2: 按默认交付流程**

征得用户确认后：建中文 PR → 本地合并 `main` → push `origin main` → rsync 同步远端 `main`。（不主动开 GitHub 页面，用 `gh`/`git` 操作并文字汇报。）

---

## 自查

- **Spec 覆盖**：人物视频舞台(Task1/3) ✓；右侧头像/Tabs/表单/账号绑定(Task4) ✓；el-→动森替换(Task2/4) ✓；性别映射+视频切换(Task2/3) ✓；提交时校验(Task2/4) ✓；视频入 public 入库(Task1) ✓；样式还原(Task5) ✓；远端验证(Task7) ✓；交付(Task8) ✓。
- **占位符**：无 TBD/TODO；脚本逻辑给出完整代码；样式因源在仓库内（profile.html）以"移植 + 明确选择器清单 + 改造点"方式给出，非空泛占位。
- **类型一致**：`ProfileForm` 字段与 `loadProfile`/`handleSubmit`/`handleReset`/模板 `form.*` 一致；`UserProfileForm` 仅传后端已知字段；`genderModel` string↔number 代理与 `genderOptions.key` 一致。
- **风险点（实现时核对）**：动森 `Tabs` 与 `Icon` 的实际 props/图标名以库为准，模板中已标注回退方案（svg 内联）。
