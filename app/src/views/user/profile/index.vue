<template>
  <div v-loading="loading" class="page-card profile-page">
    <div class="page-head">
      <div class="page-eyebrow">PROFILE</div>
      <h1 class="page-title">个人资料</h1>
      <p class="page-desc">管理基础身份信息、头像素材与账号绑定状态。</p>
    </div>

    <div class="profile-grid">
      <!-- 左：数字身份档案 -->
      <section ref="heroRef" class="profile-hero" :style="{ height: heroHeight }">
        <div class="hero__decor hero__decor--mint"></div>
        <div class="hero__decor hero__decor--lime"></div>
        <div class="hero__orbit hero__orbit--1"></div>
        <div class="hero__orbit hero__orbit--2"></div>

        <div class="eyebrow">
          <span class="eyebrow__dot"></span>
          数字身份档案
        </div>
        <div class="hero__head">
          <h2>{{ displayName }}</h2>
          <Transition name="copy-fade" mode="out-in">
            <p :key="activeScene">{{ heroSubtitle }}</p>
          </Transition>
        </div>

        <div class="stage" @pointermove="handleStagePointer" @pointerleave="resetStagePointer">
          <!-- 当前场景的模糊铺底，填满竖版视频两侧 -->
          <Transition name="scene-fade">
            <img :key="sceneAsset" class="stage__ambient" :src="`${sceneAsset}.jpg`" alt="" />
          </Transition>
          <span class="stage__corner tl"></span>
          <span class="stage__corner tr"></span>
          <span class="stage__corner bl"></span>
          <span class="stage__corner br"></span>

          <!-- 场景切换：四个时段沿圆环顺时针排成一天的循环，中间是跟随时间的自动模式 -->
          <div
            class="scene-dial"
            :class="{ 'is-auto': sceneMode === 'auto' }"
            role="group"
            aria-label="场景切换"
          >
            <span class="scene-dial__track"></span>
            <span class="scene-dial__orbit" :style="{ transform: `rotate(${dialAngle}deg)` }">
              <span class="scene-dial__knob"></span>
            </span>
            <el-tooltip
              v-for="scene in SCENES"
              :key="scene.key"
              :content="scene.label"
              :placement="scene.placement"
              :show-after="200"
            >
              <button
                type="button"
                class="scene-dial__btn"
                :class="[
                  `scene-dial__btn--${scene.key}`,
                  { 'is-active': activeScene === scene.key },
                ]"
                :aria-label="scene.label"
                :aria-pressed="activeScene === scene.key"
                @click="sceneMode = scene.key"
              >
                <AnimalMenuIcon :name="`scene-${scene.key}`" :size="20" />
              </button>
            </el-tooltip>
            <el-tooltip
              content="自动 · 跟随当前时间"
              placement="bottom"
              :offset="46"
              :show-after="200"
            >
              <button
                type="button"
                class="scene-dial__btn scene-dial__btn--auto"
                :class="{ 'is-active': sceneMode === 'auto' }"
                aria-label="自动，跟随当前时间"
                :aria-pressed="sceneMode === 'auto'"
                @click="sceneMode = 'auto'"
              >
                <AnimalMenuIcon name="scene-auto" :size="20" />
              </button>
            </el-tooltip>
          </div>

          <div class="stage__scene">
            <div class="stage__frame">
              <!-- 首帧图作 poster，视频缺失或加载前显示首帧 -->
              <Transition name="scene-wipe">
                <video
                  :key="sceneAsset"
                  class="stage__video"
                  :src="`${sceneAsset}.mp4`"
                  :poster="`${sceneAsset}.jpg`"
                  autoplay
                  muted
                  loop
                  playsinline
                  preload="auto"
                ></video>
              </Transition>
            </div>

            <!-- 换场景时整层重建，标签重新入场 -->
            <div :key="sceneAsset" class="hud-layer">
              <div
                v-for="(item, i) in heroMeta"
                :key="item.label"
                ref="hudRefs"
                class="hud"
                :class="`hud--${item.slot}`"
                :style="{ '--hud-i': i }"
              >
                <div class="hud__card">
                  <span class="hud__sheen"></span>
                  <div class="hud__ico">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.9"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      v-html="item.icon"
                    ></svg>
                  </div>
                  <div class="hud__txt">
                    <span class="hud__lbl">{{ item.label }}</span>
                    <span class="hud__val">{{ item.value }}</span>
                  </div>
                </div>
              </div>
            </div>
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
                :style="{ '--chip-i': i }"
              >
                {{ c }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- 右：资料编辑 -->
      <section class="profile-panel">
        <div class="panel__head">
          <div class="panel__lead">
            <span class="kicker">PROFILE EDITOR</span>
            <h3>个人资料</h3>
            <p>管理基础身份信息、头像素材与账号绑定状态。</p>
          </div>
          <div class="avatar-upload">
            <div class="avatar-upload__preview" title="当前头像">
              <img :src="currentAvatar" alt="当前头像" />
              <span class="avatar-upload__status">当前头像</span>
            </div>
            <div class="avatar-upload__meta">
              <strong>头像素材</strong>
              <span>支持 JPG、PNG、GIF、WebP，最大 5MB</span>
              <Button size="small" type="primary" @click="triggerUpload">更换头像</Button>
            </div>
            <input
              ref="fileInput"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              style="display: none"
              @change="handleAvatarChange"
            />
          </div>
        </div>

        <Tabs v-model="active" :items="tabItems" class="profile-tabs">
          <!-- 基本信息 -->
          <template #info>
            <form class="profile-form" @submit.prevent>
              <div class="field">
                <label>
                  <span class="req">*</span>
                  姓名
                </label>
                <Input v-model="form.realname" placeholder="请输入姓名" allow-clear />
                <span v-if="errors.realname" class="field__err">{{ errors.realname }}</span>
              </div>
              <div class="field">
                <label>
                  <span class="req">*</span>
                  昵称
                </label>
                <Input v-model="form.nickname" placeholder="请输入昵称" allow-clear />
                <span v-if="errors.nickname" class="field__err">{{ errors.nickname }}</span>
              </div>
              <div class="field">
                <label>
                  <span class="req">*</span>
                  性别
                </label>
                <AnimalSelect
                  v-model="genderModel"
                  :options="genderOptions"
                  placeholder="请选择性别"
                />
              </div>
              <div class="field">
                <label>联系方式</label>
                <Input v-model="form.mobile" placeholder="请输入联系方式" allow-clear />
              </div>
              <div class="field field--span2">
                <label>
                  <span class="req">*</span>
                  邮箱
                </label>
                <Input v-model="form.email" placeholder="请输入邮箱" allow-clear />
                <span v-if="errors.email" class="field__err">{{ errors.email }}</span>
              </div>
              <div class="field field--span2">
                <label>详细地址</label>
                <Input
                  v-model="form.address"
                  placeholder="请输入详细地址（如：浙江省杭州市西湖区...）"
                  allow-clear
                />
              </div>
              <div class="field field--span2">
                <label>个人简介</label>
                <AnimalTextarea
                  v-model="form.intro"
                  :rows="4"
                  :maxlength="200"
                  placeholder="一句话描述自己 / 兴趣 / 当前在做的事..."
                />
              </div>
              <div class="actions">
                <Button type="primary" :loading="saving" @click="handleSubmit">保存更改</Button>
                <Button @click="handleReset">重置</Button>
              </div>
            </form>
          </template>

          <!-- 账号绑定 -->
          <template #account>
            <div class="account-list">
              <div v-for="item in accountBindings" :key="item.key" class="account-item">
                <div class="account-item__icon" v-html="item.icon"></div>
                <div class="account-item__content">
                  <strong>{{ item.title }}</strong>
                  <p>{{ item.desc }}</p>
                </div>
                <a class="account-item__action">{{ item.action }}</a>
              </div>
            </div>
          </template>

          <!-- 修改密码 -->
          <template #password>
            <form class="profile-form" @submit.prevent>
              <div class="field field--span2">
                <label>
                  <span class="req">*</span>
                  当前密码
                </label>
                <Input
                  v-model="passwordForm.oldPassword"
                  type="password"
                  placeholder="请输入当前登录密码"
                  :maxlength="32"
                />
                <span v-if="passwordErrors.oldPassword" class="field__err">
                  {{ passwordErrors.oldPassword }}
                </span>
              </div>
              <div class="field">
                <label>
                  <span class="req">*</span>
                  新密码
                </label>
                <Input
                  v-model="passwordForm.password"
                  type="password"
                  placeholder="6-32 位"
                  :maxlength="32"
                />
                <span v-if="passwordErrors.password" class="field__err">
                  {{ passwordErrors.password }}
                </span>
              </div>
              <div class="field">
                <label>
                  <span class="req">*</span>
                  确认新密码
                </label>
                <Input
                  v-model="passwordForm.passwordConfirmation"
                  type="password"
                  placeholder="请再次输入新密码"
                  :maxlength="32"
                />
                <span v-if="passwordErrors.passwordConfirmation" class="field__err">
                  {{ passwordErrors.passwordConfirmation }}
                </span>
              </div>
              <div class="actions">
                <Button type="primary" :loading="passwordSaving" @click="handlePasswordSubmit">
                  修改密码
                </Button>
                <Button @click="resetPasswordForm">重置</Button>
              </div>
            </form>
          </template>
        </Tabs>
      </section>
    </div>

    <AvatarCropModal
      v-model:visible="cropVisible"
      :file="cropFile"
      :loading="avatarSaving"
      @reselect="triggerUpload"
      @confirm="handleAvatarConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { message } from "@/utils/feedback";
import { ref, reactive, computed, onMounted, onActivated, watch } from "vue";
import { useMediaQuery, useNow, usePreferredReducedMotion, useResizeObserver } from "@vueuse/core";
import UserAPI from "@/api/system/user";
import { useUserStore } from "@/store/modules/user";
import AnimalTextarea from "@/components/AnimalTextarea/index.vue";
import AnimalSelect from "@/components/AnimalSelect/index.vue";
import AnimalMenuIcon from "@/components/AnimalMenuIcon/index.vue";
import AvatarCropModal from "./AvatarCropModal.vue";
import { resolveAvatar } from "@/utils/avatar";
import type { UserProfileForm, UserPasswordForm } from "@/types/api";

defineOptions({ name: "Profile" });

const userStore = useUserStore();
const loading = ref(false);
const saving = ref(false);
const active = ref<string>("info");
const fileInput = ref<HTMLInputElement | null>(null);
const cropVisible = ref(false);
const cropFile = ref<File | null>(null);
const avatarSaving = ref(false);

watch(cropVisible, (visible) => {
  if (!visible && !avatarSaving.value) {
    cropFile.value = null;
  }
});

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

const errors = reactive<{ realname: string; nickname: string; email: string }>({
  realname: "",
  nickname: "",
  email: "",
});

const tabItems = [
  { key: "info", label: "基本信息" },
  { key: "account", label: "账号绑定" },
  { key: "password", label: "修改密码" },
];

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

type SceneKey = "morning" | "day" | "dusk" | "night";

/** 场景及其起始小时；夜晚跨零点，覆盖 20 点到次日 5 点。angle 是圆环上的位置，顺时针为一天 */
const SCENES: {
  key: SceneKey;
  label: string;
  from: number;
  angle: number;
  placement: "top" | "right" | "bottom" | "left";
  copy: string;
}[] = [
  {
    key: "morning",
    label: "清晨",
    from: 5,
    angle: 270,
    placement: "left",
    copy: "清晨的栈桥很安静，适合等第一条鱼上钩。",
  },
  {
    key: "day",
    label: "白天",
    from: 10,
    angle: 0,
    placement: "top",
    copy: "阳光正好，带上捕虫网去草地转一圈。",
  },
  {
    key: "dusk",
    label: "黄昏",
    from: 17,
    angle: 90,
    placement: "right",
    copy: "夕阳落进海里，顺手捡了只海螺。",
  },
  {
    key: "night",
    label: "夜晚",
    from: 20,
    angle: 180,
    placement: "bottom",
    copy: "篝火噼啪作响，提着灯数今晚的流星。",
  },
];
const sceneOf = (key: SceneKey) => SCENES.find((scene) => scene.key === key)!;

const sceneMode = ref<SceneKey | "auto">("auto");
const now = useNow({ interval: 60_000 });
const activeScene = computed<SceneKey>(() => {
  if (sceneMode.value !== "auto") return sceneMode.value;
  const hour = now.value.getHours();
  return SCENES.findLast((scene) => hour >= scene.from)?.key ?? "night";
});

const personaGender = computed(() => {
  if (Number(form.gender) === 1) return "male";
  if (Number(form.gender) === 2) return "female";
  return "private";
});
const sceneAsset = computed(() => `/persona/${personaGender.value}-${activeScene.value}`);

/** 圆环上的指示钮角度：累加而不是直接取目标值，保证每次都走最短弧 */
const dialAngle = ref(sceneOf(activeScene.value).angle);
watch(activeScene, (scene) => {
  const delta = ((((sceneOf(scene).angle - dialAngle.value) % 360) + 540) % 360) - 180;
  dialAngle.value += delta;
});

const displayName = computed(() => form.nickname || form.realname || form.email || "数字分身档案");
const currentAvatar = computed(() => resolveAvatar(form.avatar, form.gender));
const heroSubtitle = computed(() => sceneOf(activeScene.value).copy);

const heroMeta = computed(() => [
  {
    slot: "tl",
    label: "角色定位",
    value: "资深架构师",
    icon: '<circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" />',
  },
  {
    slot: "tr",
    label: "组织信息",
    value: "浙江网盛生意宝股份有限公司",
    icon: '<path d="M4 21V5l8-2v18M12 9h8v12M4 21h16" />',
  },
  {
    slot: "bl",
    label: "所在地区",
    value: form.address || "中国 · 浙江省 · 杭州市",
    icon: '<path d="M12 21s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13z" /><circle cx="12" cy="8" r="2.4" />',
  },
  {
    slot: "br",
    label: "技术栈",
    value: "Laravel · Vue · MySQL · AntDesign",
    icon: '<path d="M2 12l10-5 10 5-10 5z" /><path d="M6 14v4c0 1 3 3 6 3s6-2 6-3v-4" />',
  },
]);

/** 标签随指针做视差：各标签位移幅度不同，形成前后层次 */
const HUD_DEPTH = [16, 24, 20, 28];
const hudRefs = ref<HTMLElement[]>([]);
const reducedMotion = usePreferredReducedMotion();
let pointerFrame = 0;

function applyParallax(x: number, y: number) {
  hudRefs.value.forEach((el, i) => {
    el.style.translate = `${(x * HUD_DEPTH[i]).toFixed(1)}px ${(y * HUD_DEPTH[i]).toFixed(1)}px`;
  });
}

function handleStagePointer(event: PointerEvent) {
  if (event.pointerType !== "mouse" || reducedMotion.value === "reduce") return;
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  cancelAnimationFrame(pointerFrame);
  pointerFrame = requestAnimationFrame(() => applyParallax(x, y));
}

function resetStagePointer() {
  cancelAnimationFrame(pointerFrame);
  applyParallax(0, 0);
}

const skillChips = [
  "Digital Persona",
  "Laravel",
  "Vue 3",
  "MySQL",
  "Element Plus",
  "AntDesign",
  "Mint Glow",
];

const ICON_PHONE =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="2" width="10" height="20" rx="2.5"/><line x1="11" y1="18" x2="13" y2="18"/></svg>';
const ICON_MAIL =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>';
const ICON_KEY =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="15" r="4"/><path d="M11 12l8-8 2 2-2 2 2 2-2 2-2-2-2 2"/></svg>';
const ICON_LINK =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M15 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/></svg>';

const accountBindings = [
  {
    key: "phone",
    title: "密保手机",
    desc: "已绑定手机：180****2354",
    action: "去修改",
    icon: ICON_PHONE,
  },
  {
    key: "email",
    title: "密保邮箱",
    desc: "已绑定邮箱：vwms@netsun.com",
    action: "去修改",
    icon: ICON_MAIL,
  },
  { key: "question", title: "密保问题", desc: "未设置密保问题", action: "去设置", icon: ICON_KEY },
  { key: "qq", title: "绑定 QQ", desc: "当前未绑定 QQ 账号", action: "去绑定", icon: ICON_LINK },
  {
    key: "wechat",
    title: "绑定微信",
    desc: "当前未绑定微信账号",
    action: "去绑定",
    icon: ICON_LINK,
  },
  {
    key: "alipay",
    title: "绑定支付宝",
    desc: "当前未绑定支付宝账号",
    action: "去绑定",
    icon: ICON_LINK,
  },
];

/** 左侧卡片底边贴齐可视区，舞台随之填满剩余高度 */
const HERO_BOTTOM_GAP = 44;
const HERO_MIN_HEIGHT = 560;
const heroRef = ref<HTMLElement | null>(null);
const heroHeight = ref<string>();
const isStacked = useMediaQuery("(max-width: 992px)");

function fitHero() {
  const hero = heroRef.value;
  const scroller = hero?.closest<HTMLElement>(".app-main");
  // keepAlive 失活时容器高度为 0，不能据此计算
  if (!hero || !scroller || !scroller.clientHeight || isStacked.value) {
    heroHeight.value = undefined;
    return;
  }
  // 用 offsetTop 累加而不是 getBoundingClientRect，避免页面切换动画的 transform 干扰
  let offsetTop = 0;
  for (let el: HTMLElement | null = hero; el && el !== scroller; ) {
    offsetTop += el.offsetTop;
    el = el.offsetParent as HTMLElement | null;
  }
  const available = scroller.clientHeight - offsetTop - HERO_BOTTOM_GAP;
  heroHeight.value = `${Math.max(available, HERO_MIN_HEIGHT)}px`;
}

useResizeObserver(() => heroRef.value?.closest<HTMLElement>(".app-main"), fitHero);
watch(isStacked, fitHero);
onActivated(fitHero);

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
    message.success("保存成功");
    userStore.userInfo.nickname = form.nickname;
    lastLoaded = { ...form };
  } catch (e: any) {
    message.error(e?.message || "保存失败");
  } finally {
    saving.value = false;
  }
}

function handleReset() {
  Object.assign(form, lastLoaded);
  errors.realname = "";
  errors.nickname = "";
  errors.email = "";
}

const createPasswordForm = (): UserPasswordForm => ({
  oldPassword: "",
  password: "",
  passwordConfirmation: "",
});

const passwordForm = reactive<UserPasswordForm>(createPasswordForm());
const passwordErrors = reactive<UserPasswordForm>(createPasswordForm());
const passwordSaving = ref(false);

function validatePassword(): boolean {
  passwordErrors.oldPassword = passwordForm.oldPassword ? "" : "请输入当前密码";
  if (passwordForm.password.length < 6) {
    passwordErrors.password = "新密码至少 6 位";
  } else if (passwordForm.password === passwordForm.oldPassword) {
    passwordErrors.password = "新密码不能与当前密码相同";
  } else {
    passwordErrors.password = "";
  }
  passwordErrors.passwordConfirmation =
    passwordForm.passwordConfirmation === passwordForm.password ? "" : "两次输入的新密码不一致";
  return (
    !passwordErrors.oldPassword && !passwordErrors.password && !passwordErrors.passwordConfirmation
  );
}

async function handlePasswordSubmit() {
  if (!validatePassword()) return;
  passwordSaving.value = true;
  try {
    await UserAPI.updatePassword({ ...passwordForm });
    message.success("密码修改成功");
    resetPasswordForm();
  } catch (e: any) {
    message.error(e?.message || "密码修改失败");
  } finally {
    passwordSaving.value = false;
  }
}

function resetPasswordForm() {
  Object.assign(passwordForm, createPasswordForm());
  Object.assign(passwordErrors, createPasswordForm());
}

function triggerUpload() {
  fileInput.value?.click();
}

function handleAvatarChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    message.error("请选择 JPG、PNG、GIF 或 WebP 图片");
    target.value = "";
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    message.error("头像文件不能超过 5MB");
    target.value = "";
    return;
  }

  cropFile.value = file;
  cropVisible.value = true;
  target.value = "";
}

async function handleAvatarConfirm(payload: {
  file: File;
  cropX: number;
  cropY: number;
  cropSize: number;
}) {
  avatarSaving.value = true;
  try {
    const data = await UserAPI.uploadAvatar(payload);
    const avatar = data.member?.avatar || "";
    form.avatar = avatar;
    lastLoaded.avatar = avatar;
    userStore.userInfo.avatar = avatar;
    cropVisible.value = false;
    cropFile.value = null;
    message.success("头像更新成功");
  } catch (e: any) {
    message.error(e?.message || "头像上传失败");
  } finally {
    avatarSaving.value = false;
  }
}

onMounted(loadProfile);
</script>

<style lang="scss" scoped>
.profile-page {
  --mint: #20c9b2;
  --mint-deep: var(--ai-primary-active);
  --mint-glow: #d6ff72;
  --teal-ink: #17322d;
  --teal-mute: #648079;
  --teal-line: rgba(33, 95, 83, 0.1);
  --shell-bg: rgba(255, 255, 255, 0.85);
  --shell-line: rgba(255, 255, 255, 0.65);
  --shell-shadow: 0 30px 90px rgba(25, 58, 50, 0.1);
  --radius-xl: 28px;
  --radius-lg: 22px;
  --radius-md: 16px;
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
}

/* two-column grid */
.profile-grid {
  display: grid;
  grid-template-columns: minmax(0, 9fr) minmax(0, 15fr);
  gap: 22px;
  padding: 4px 0 8px;
}

/* shared card base */
.profile-hero,
.profile-panel {
  position: relative;
  border: 1px solid var(--shell-line);
  border-radius: var(--radius-xl);
  background: var(--shell-bg);
  backdrop-filter: blur(16px);
  box-shadow: var(--shell-shadow);
  overflow: hidden;
}

/* ─── LEFT — persona hero ─── */
.profile-hero {
  display: flex;
  flex-direction: column;
  align-self: start;
  padding: 28px 28px 24px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.86), rgba(243, 250, 246, 0.94)),
    linear-gradient(135deg, rgba(255, 255, 255, 0.82), rgba(230, 255, 244, 0.55));
}
.hero__decor {
  position: absolute;
  pointer-events: none;
  filter: blur(10px);
  opacity: 0.9;
}
.hero__decor--mint {
  top: 80px;
  right: -40px;
  width: 220px;
  height: 220px;
  background: radial-gradient(circle, rgba(32, 201, 178, 0.3), transparent 70%);
}
.hero__decor--lime {
  bottom: 60px;
  left: -30px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(214, 255, 114, 0.22), transparent 72%);
}
.hero__orbit {
  position: absolute;
  border: 1px solid rgba(129, 219, 201, 0.3);
  border-radius: 999px;
  pointer-events: none;
}
.hero__orbit--1 {
  top: 142px;
  left: 50%;
  width: 280px;
  height: 280px;
  transform: translateX(-50%);
}
.hero__orbit--2 {
  top: 192px;
  left: 50%;
  width: 340px;
  height: 180px;
  transform: translateX(-50%) rotate(-12deg);
}

.eyebrow {
  position: relative;
  z-index: 1;
  display: inline-flex;
  /* 左卡片是纵向 flex，不收住会被拉成整行宽 */
  align-self: flex-start;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: #188a77;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.eyebrow__dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--mint);
  box-shadow: 0 0 0 6px rgba(32, 201, 178, 0.14);
  animation: profile-pulse 2s ease-in-out infinite;
}
@keyframes profile-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 6px rgba(32, 201, 178, 0.14);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(32, 201, 178, 0.06);
  }
}

.hero__head {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px 14px;
  margin-top: 14px;
}
.hero__head h2 {
  margin: 0;
  font-size: 34px;
  line-height: 1.08;
  color: var(--teal-ink);
  font-weight: 800;
  letter-spacing: 0.5px;
}
.hero__head p {
  margin: 0;
  color: var(--teal-mute);
  font-size: 13.5px;
  line-height: 1.7;
}

/* persona stage */
.stage {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  margin-top: 14px;
  border-radius: var(--radius-xl);
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 22%, rgba(255, 255, 255, 0.92), transparent 42%),
    linear-gradient(180deg, rgba(241, 250, 246, 0.92), rgba(227, 246, 238, 0.74));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.78);
  isolation: isolate;
}
.stage__ambient {
  position: absolute;
  top: -8%;
  left: -8%;
  width: 116%;
  height: 116%;
  object-fit: cover;
  filter: blur(26px) saturate(1.15);
  opacity: 0.82;
  pointer-events: none;
}
.stage__scene {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
  justify-content: center;
  min-height: 0;
  padding: 22px 22px 12px;
}
/* 竖版视频按可用高度完整显示，宽度由 9:16 推出 */
.stage__frame {
  position: relative;
  height: 100%;
  max-width: 100%;
  aspect-ratio: 9 / 16;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: rgba(255, 255, 255, 0.3);
  box-shadow:
    0 18px 40px rgba(23, 50, 45, 0.22),
    0 0 0 1px rgba(255, 255, 255, 0.55);
}
.stage__video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
/* 新场景插在旧场景之后、叠在上面淡入；旧场景保持不透明直到被移除 */
.scene-fade-enter-active {
  transition: opacity 0.6s ease;
}
.scene-fade-leave-active {
  transition: opacity 0.6s;
}
.scene-fade-enter-from {
  opacity: 0;
}
/* 视频换场：新画面从右上角（圆环所在方向）圆形展开 */
.scene-wipe-enter-active {
  transition: clip-path 0.7s var(--ease-in-out);
}
.scene-wipe-leave-active {
  transition: opacity 0.7s;
}
.scene-wipe-enter-from {
  clip-path: circle(0% at 100% 0%);
}
.scene-wipe-enter-to {
  clip-path: circle(150% at 100% 0%);
}
/* 副标题随场景切换 */
.copy-fade-enter-active,
.copy-fade-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}
.copy-fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}
.copy-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* 场景圆环 */
.scene-dial {
  position: absolute;
  top: 34px;
  right: 34px;
  z-index: 6;
  width: 112px;
  height: 112px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.42);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow:
    0 10px 24px rgba(23, 50, 45, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(14px) saturate(140%);
}
/* 虚线轨道穿过四个时段；自动模式下缓慢转动，表示时间在走 */
.scene-dial__track {
  position: absolute;
  inset: 18px;
  border: 1.5px dashed rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  animation: dial-cycle 24s linear infinite;
  animation-play-state: paused;
}
.scene-dial.is-auto .scene-dial__track {
  animation-play-state: running;
}
@keyframes dial-cycle {
  to {
    transform: rotate(360deg);
  }
}
.scene-dial__orbit {
  position: absolute;
  inset: 0;
  pointer-events: none;
  transition: transform 0.6s var(--ease-in-out);
}
.scene-dial__knob {
  position: absolute;
  top: 3px;
  left: 50%;
  width: 30px;
  height: 30px;
  margin-left: -15px;
  border-radius: 50%;
  background: #fff;
  box-shadow:
    0 0 0 2px var(--mint),
    0 4px 10px rgba(23, 50, 45, 0.18);
}
.scene-dial__btn {
  position: absolute;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  transition:
    scale 0.16s ease,
    background-color 0.2s ease;
}
.scene-dial__btn:active {
  scale: 0.94;
}
.scene-dial__btn--day {
  top: 3px;
  left: 50%;
  margin-left: -15px;
}
.scene-dial__btn--dusk {
  top: 50%;
  right: 3px;
  margin-top: -15px;
}
.scene-dial__btn--night {
  bottom: 3px;
  left: 50%;
  margin-left: -15px;
}
.scene-dial__btn--morning {
  top: 50%;
  left: 3px;
  margin-top: -15px;
}
.scene-dial__btn--auto {
  top: 50%;
  left: 50%;
  width: 34px;
  height: 34px;
  margin: -17px 0 0 -17px;
  background: rgba(255, 255, 255, 0.6);
  box-shadow: 0 0 0 0 var(--mint);
  transition:
    scale 0.16s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}
.scene-dial__btn--auto.is-active {
  background: #fff;
  box-shadow:
    0 0 0 2px var(--mint),
    0 4px 10px rgba(23, 50, 45, 0.18);
}
@media (hover: hover) and (pointer: fine) {
  .scene-dial__btn:hover {
    scale: 1.1;
    background: rgba(255, 255, 255, 0.55);
  }
  .scene-dial__btn--auto.is-active:hover {
    background: #fff;
  }
}

/* corners */
.stage__corner {
  position: absolute;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(32, 201, 178, 0.55);
  z-index: 4;
}
.stage__corner.tl {
  top: 22px;
  left: 22px;
  border-right: 0;
  border-bottom: 0;
  border-top-left-radius: 6px;
}
.stage__corner.tr {
  top: 22px;
  right: 22px;
  border-left: 0;
  border-bottom: 0;
  border-top-right-radius: 6px;
}
.stage__corner.bl {
  bottom: 22px;
  left: 22px;
  border-right: 0;
  border-top: 0;
  border-bottom-left-radius: 6px;
}
.stage__corner.br {
  bottom: 22px;
  right: 22px;
  border-left: 0;
  border-top: 0;
  border-bottom-right-radius: 6px;
}
/* HUD floating labels */
.hud {
  position: absolute;
  z-index: 5;
  /* 指针视差由脚本直接写 translate，这里只负责缓动 */
  transition: translate 0.5s var(--ease-out);
}
.hud--tl,
.hud--bl {
  left: 18px;
  --hud-from: -28px;
}
.hud--tr,
.hud--br {
  right: 18px;
  --hud-from: 28px;
}
.hud--tl {
  top: 8%;
}
/* 右上角让给场景圆环 */
.hud--tr {
  top: 32%;
}
.hud--bl {
  top: 56%;
}
.hud--br {
  top: 74%;
}
.hud__card {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 14px 10px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow:
    0 10px 24px rgba(23, 50, 45, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(14px) saturate(140%);
  transition:
    scale 0.2s ease,
    box-shadow 0.2s ease;
  /* 入场结束后由漂浮接管 transform */
  animation:
    hud-in 0.52s var(--ease-out) calc(var(--hud-i) * 70ms + 0.12s) both,
    hud-float 6s ease-in-out calc(var(--hud-i) * 0.9s + 0.7s) infinite;
}
@keyframes hud-in {
  from {
    opacity: 0;
    transform: translateX(var(--hud-from)) scale(0.95);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes hud-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}
/* 指向人物的引线与呼吸圆点 */
.hud__card::before,
.hud__card::after {
  content: "";
  position: absolute;
  top: 50%;
  pointer-events: none;
}
.hud__card::before {
  width: 18px;
  height: 1px;
}
.hud__card::after {
  width: 7px;
  height: 7px;
  margin-top: -3.5px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.28);
  animation: hud-pin 2.4s ease-in-out calc(var(--hud-i) * 0.4s) infinite;
}
.hud--tl .hud__card::before,
.hud--bl .hud__card::before {
  left: 100%;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.35));
}
.hud--tl .hud__card::after,
.hud--bl .hud__card::after {
  left: calc(100% + 18px);
}
.hud--tr .hud__card::before,
.hud--br .hud__card::before {
  right: 100%;
  background: linear-gradient(270deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.35));
}
.hud--tr .hud__card::after,
.hud--br .hud__card::after {
  right: calc(100% + 18px);
}
@keyframes hud-pin {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.55;
    transform: scale(0.7);
  }
}
/* 玻璃高光：一道斜向光带间歇扫过 */
.hud__sheen {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  overflow: hidden;
  pointer-events: none;
}
.hud__sheen::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 45%;
  background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  transform: translateX(-120%);
  animation: hud-sheen 7s var(--ease-in-out) calc(var(--hud-i) * 1.3s + 1.2s) infinite;
}
@keyframes hud-sheen {
  0%,
  72% {
    transform: translateX(-120%);
  }
  100% {
    transform: translateX(340%);
  }
}
@media (hover: hover) and (pointer: fine) {
  .hud:hover .hud__card {
    scale: 1.04;
    box-shadow:
      0 16px 32px rgba(23, 50, 45, 0.16),
      inset 0 1px 0 rgba(255, 255, 255, 0.55);
  }
  .hud:hover .hud__ico {
    transform: rotate(-8deg) scale(1.08);
  }
}
.hud__ico {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: linear-gradient(135deg, rgba(32, 201, 178, 0.3), rgba(214, 255, 114, 0.42));
  display: grid;
  place-items: center;
  color: var(--mint-deep);
  flex-shrink: 0;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
  transition: transform 0.2s ease;
}
.hud__ico svg {
  width: 16px;
  height: 16px;
}
.hud__txt {
  line-height: 1.35;
}
.hud__lbl {
  display: block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #8aa39c;
}
.hud__val {
  display: block;
  margin-top: 3px;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--teal-ink);
  max-width: 132px;
}

/* skill dock */
.dock {
  position: relative;
  z-index: 5;
  margin: 0 22px 22px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: rgba(23, 50, 45, 0.45);
  border-radius: 16px;
  backdrop-filter: blur(14px) saturate(140%);
  box-shadow:
    0 12px 26px rgba(23, 50, 45, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.12);
  overflow: hidden;
}
.dock__label {
  flex-shrink: 0;
  font-family: "JetBrains Mono", monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #d6ff72;
}
.dock__divider {
  width: 1px;
  height: 22px;
  background: rgba(214, 255, 114, 0.18);
  flex-shrink: 0;
}
.dock__chips {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  flex: 1;
  min-width: 0;
}
.dock__chips::-webkit-scrollbar {
  display: none;
}
.dock__chip {
  flex-shrink: 0;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #e6f7f0;
  font-size: 11.5px;
  font-weight: 700;
  white-space: nowrap;
  animation: chip-in 0.4s var(--ease-out) calc(var(--chip-i) * 40ms + 0.3s) both;
}
@keyframes chip-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.dock__chip--accent {
  background: linear-gradient(135deg, rgba(214, 255, 114, 0.95), rgba(196, 240, 136, 0.95));
  color: #1a3508;
  border-color: transparent;
}

/* ─── RIGHT — editor panel ─── */
.profile-panel {
  padding: 28px 32px 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(244, 250, 247, 0.92));
}
.panel__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 14px;
}
.panel__lead {
  flex: 1;
  min-width: 0;
}
.kicker {
  display: inline-block;
  margin-bottom: 10px;
  color: #20a892;
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.panel__head h3 {
  margin: 0;
  font-size: 30px;
  color: var(--teal-ink);
  font-weight: 800;
}
.panel__head p {
  margin: 10px 0 0;
  color: #6d8881;
  font-size: 13.5px;
  line-height: 1.7;
}
.avatar-upload {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 310px;
  padding: 14px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.78);
}
.avatar-upload__preview {
  position: relative;
  flex: 0 0 auto;
  width: 92px;
  height: 92px;
  overflow: hidden;
  border: 5px solid rgba(255, 255, 255, 0.96);
  border-radius: 50%;
  background: rgba(237, 246, 242, 0.92);
  box-shadow:
    0 0 0 2px rgba(32, 201, 178, 0.48),
    0 6px 16px rgba(61, 52, 40, 0.13);
}
.avatar-upload__preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-upload__status {
  position: absolute;
  right: 4px;
  bottom: 3px;
  left: 4px;
  padding: 3px 6px;
  border-radius: 50px;
  background: rgba(23, 50, 45, 0.72);
  color: white;
  font-size: 9px;
  font-weight: 700;
  text-align: center;
}
.avatar-upload__meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 7px;
}
.avatar-upload__meta strong {
  color: var(--teal-ink);
  font-size: 14px;
}
.avatar-upload__meta span {
  max-width: 170px;
  color: #6f8681;
  font-size: 11px;
  line-height: 1.5;
}

.profile-tabs {
  margin-top: 14px;
}

/* form */
.profile-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px 24px;
  padding-top: 22px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.field--span2 {
  grid-column: span 2;
}
.field label {
  font-size: 13px;
  font-weight: 700;
  color: #5c746e;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.field label .req {
  color: #ef4444;
}
.field__err {
  color: #ef4444;
  font-size: 12px;
}

.actions {
  grid-column: span 2;
  margin-top: 6px;
  display: flex;
  gap: 12px;
}

/* account bindings */
.account-list {
  display: grid;
  gap: 14px;
  padding: 22px 0 18px;
}
.account-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.6);
}
.account-item__icon {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 16px;
  background: linear-gradient(135deg, #20c9b2, #8cefd4);
  color: #fff;
  flex-shrink: 0;
}
.account-item__icon :deep(svg) {
  width: 22px;
  height: 22px;
}
.account-item__content {
  flex: 1;
  min-width: 0;
}
.account-item__content strong {
  color: var(--teal-ink);
  font-size: 15px;
}
.account-item__content p {
  margin: 6px 0 0;
  color: #708884;
  font-size: 13px;
}
.account-item__action {
  color: var(--mint-deep);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

/* 减少动态效果：保留淡入，去掉位移与循环动画 */
@media (prefers-reduced-motion: reduce) {
  .hud {
    transition: none;
  }
  .hud__card {
    animation: hud-fade 0.2s ease both;
  }
  .hud__card::after,
  .hud__sheen::before,
  .scene-dial__track {
    animation: none;
  }
  .scene-dial__orbit {
    transition: none;
  }
  .scene-wipe-enter-active {
    transition: opacity 0.2s ease;
  }
  .scene-wipe-enter-from {
    clip-path: none;
    opacity: 0;
  }
  .scene-wipe-enter-to {
    clip-path: none;
  }
  .dock__chip {
    animation: hud-fade 0.2s ease both;
  }
}
@keyframes hud-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* responsive */
@media (max-width: 992px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
  .stage {
    flex: none;
    height: min(72vh, 640px);
  }
}
@media (max-width: 768px) {
  .profile-hero,
  .profile-panel {
    padding: 20px;
  }
  .panel__head {
    flex-direction: column;
  }
  .avatar-upload {
    width: 100%;
    min-width: 0;
  }
  .profile-form {
    grid-template-columns: 1fr;
  }
  .field--span2 {
    grid-column: span 1;
  }
}
</style>
