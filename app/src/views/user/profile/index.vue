<template>
  <div v-loading="loading" class="page-card profile-page">
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

        <div class="eyebrow">
          <span class="eyebrow__dot"></span>
          数字身份档案
        </div>
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
              <div class="persona__body">
                <div class="persona__legs">
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
            <span class="stage__caption">// persona offline · fallback view</span>
          </template>

          <div class="hud hud--tl">
            <div class="hud__ico">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.9"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21a8 8 0 0 1 16 0" />
              </svg>
            </div>
            <div class="hud__txt">
              <span class="hud__lbl">{{ heroMeta[0].label }}</span>
              <span class="hud__val">{{ heroMeta[0].value }}</span>
            </div>
          </div>
          <div class="hud hud--tr">
            <div class="hud__ico">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.9"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M4 21V5l8-2v18M12 9h8v12M4 21h16" />
              </svg>
            </div>
            <div class="hud__txt">
              <span class="hud__lbl">{{ heroMeta[1].label }}</span>
              <span class="hud__val">{{ heroMeta[1].value }}</span>
            </div>
          </div>
          <div class="hud hud--bl">
            <div class="hud__ico">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.9"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12 21s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13z" />
                <circle cx="12" cy="8" r="2.4" />
              </svg>
            </div>
            <div class="hud__txt">
              <span class="hud__lbl">{{ heroMeta[2].label }}</span>
              <span class="hud__val">{{ heroMeta[2].value }}</span>
            </div>
          </div>
          <div class="hud hud--br">
            <div class="hud__ico">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.9"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M2 12l10-5 10 5-10 5z" />
                <path d="M6 14v4c0 1 3 3 6 3s6-2 6-3v-4" />
              </svg>
            </div>
            <div class="hud__txt">
              <span class="hud__lbl">{{ heroMeta[3].label }}</span>
              <span class="hud__val">{{ heroMeta[3].value }}</span>
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
import { ref, reactive, computed, onMounted, watch } from "vue";
import UserAPI from "@/api/system/user";
import { useUserStore } from "@/store/modules/user";
import AnimalTextarea from "@/components/AnimalTextarea/index.vue";
import AnimalSelect from "@/components/AnimalSelect/index.vue";
import AvatarCropModal from "./AvatarCropModal.vue";
import { resolveAvatar } from "@/utils/avatar";
import type { UserProfileForm } from "@/types/api";

defineOptions({ name: "Profile" });

const userStore = useUserStore();
const loading = ref(false);
const saving = ref(false);
const active = ref<string>("info");
const fileInput = ref<HTMLInputElement | null>(null);
const videoError = ref(false);
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

const personaVideo = computed(() => {
  if (Number(form.gender) === 1) return "/persona/male.mp4";
  if (Number(form.gender) === 2) return "/persona/female.mp4";
  return "/persona/private.mp4";
});

const displayName = computed(() => form.nickname || form.realname || form.email || "数字分身档案");
const currentAvatar = computed(() => resolveAvatar(form.avatar, form.gender));
const heroSubtitle = computed(() => {
  const map: Record<number, string> = {
    1: "男性数字形象在线，轻交互模式已启用。",
    2: "女性数字形象在线，轻交互模式已启用。",
    3: "保密模式已启用，当前展示默认数字形象。",
  };
  return map[Number(form.gender)] || map[1];
});

const heroMeta = computed(() => [
  { label: "角色定位", value: "资深架构师" },
  { label: "组织信息", value: "浙江网盛生意宝股份有限公司" },
  { label: "所在地区", value: form.address || "中国 · 浙江省 · 杭州市" },
  { label: "技术栈", value: "Laravel · Vue · MySQL · AntDesign" },
]);

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
  margin-top: 20px;
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
  margin: 12px 0 0;
  max-width: 340px;
  color: var(--teal-mute);
  font-size: 13.5px;
  line-height: 1.7;
}

/* persona stage */
.stage {
  position: relative;
  margin-top: 18px;
  aspect-ratio: 9 / 16;
  min-height: 560px;
  border-radius: var(--radius-xl);
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 22%, rgba(255, 255, 255, 0.92), transparent 42%),
    linear-gradient(180deg, rgba(241, 250, 246, 0.92), rgba(227, 246, 238, 0.74));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.78);
  isolation: isolate;
}
.stage::after {
  content: "";
  position: absolute;
  inset: 14px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.55);
  pointer-events: none;
}
.stage__video {
  position: absolute;
  left: 14px;
  right: 14px;
  top: 14px;
  bottom: 14px;
  width: auto;
  height: auto;
  border-radius: var(--radius-lg);
  object-fit: cover;
  z-index: 3;
}

/* chibi fallback */
.stage__floor {
  position: absolute;
  left: 50%;
  bottom: 120px;
  transform: translateX(-50%);
  width: 240px;
  height: 26px;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(23, 50, 45, 0.22), transparent 70%);
  filter: blur(2px);
}
.persona {
  position: absolute;
  left: 50%;
  bottom: 124px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: persona-breath 4.2s ease-in-out infinite;
}
@keyframes persona-breath {
  0%,
  100% {
    transform: translateX(-50%) translateY(0) scale(1);
  }
  50% {
    transform: translateX(-50%) translateY(-6px) scale(1.012);
  }
}
.persona__head {
  position: relative;
  z-index: 2;
  width: 130px;
  height: 140px;
  margin-bottom: -22px;
  border-radius: 56% 56% 50% 50% / 60% 60% 44% 44%;
  background:
    radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.55), transparent 50%),
    linear-gradient(160deg, #ffd9b8 0%, #ffba7e 100%);
  box-shadow:
    inset -8px -10px 18px rgba(186, 116, 60, 0.3),
    inset 6px 8px 14px rgba(255, 255, 255, 0.5),
    0 8px 22px rgba(186, 116, 60, 0.18);
}
.persona__head::before,
.persona__head::after {
  content: "";
  position: absolute;
  top: 60px;
  width: 10px;
  height: 14px;
  border-radius: 50%;
  background: #2b1810;
  animation: persona-blink 5s ease-in-out infinite;
}
.persona__head::before {
  left: 36px;
}
.persona__head::after {
  right: 36px;
}
@keyframes persona-blink {
  0%,
  92%,
  100% {
    transform: scaleY(1);
  }
  94%,
  98% {
    transform: scaleY(0.1);
  }
}
.persona__body {
  position: relative;
  z-index: 1;
  width: 170px;
  height: 160px;
  border-radius: 50px 50px 18px 18px / 36px 36px 18px 18px;
  background:
    radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.7), transparent 60%),
    linear-gradient(170deg, #f0f5ee 0%, #c6d3c2 100%);
  box-shadow:
    inset -8px -10px 20px rgba(80, 110, 80, 0.22),
    inset 6px 8px 14px rgba(255, 255, 255, 0.7),
    0 12px 28px rgba(40, 80, 60, 0.18);
}
.persona__body::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 26px;
  transform: translateX(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--mint), var(--mint-deep));
  box-shadow:
    0 2px 6px rgba(17, 168, 155, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}
.persona__legs {
  position: absolute;
  bottom: -38px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 14px;
}
.persona__legs span {
  display: block;
  width: 32px;
  height: 50px;
  border-radius: 14px 14px 10px 10px / 10px 10px 8px 8px;
  background: linear-gradient(180deg, #f4ece1 0%, #ddd0bf 100%);
  box-shadow:
    inset -2px -4px 8px rgba(120, 90, 60, 0.25),
    0 6px 12px rgba(80, 50, 30, 0.15);
}

/* corners + caption */
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
.stage__caption {
  position: absolute;
  bottom: 96px;
  left: 50%;
  transform: translateX(-50%);
  font-family: "JetBrains Mono", monospace;
  font-size: 10.5px;
  color: rgba(23, 50, 45, 0.42);
  letter-spacing: 0.08em;
  white-space: nowrap;
  z-index: 4;
}

/* HUD floating labels */
.hud {
  position: absolute;
  z-index: 5;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 14px 10px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.42);
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow:
    0 10px 24px rgba(23, 50, 45, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(14px) saturate(140%);
  animation: hud-float 6s ease-in-out infinite;
}
.hud--tl {
  top: 70px;
  left: 22px;
  animation-delay: -0.6s;
}
.hud--tr {
  top: 130px;
  right: 22px;
  animation-delay: -2.4s;
}
.hud--bl {
  bottom: 180px;
  left: 22px;
  animation-delay: -1.8s;
}
.hud--br {
  bottom: 120px;
  right: 22px;
  animation-delay: -3.2s;
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
  max-width: 150px;
}

/* skill dock */
.dock {
  position: absolute;
  left: 22px;
  right: 22px;
  bottom: 22px;
  z-index: 5;
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

/* responsive */
@media (max-width: 992px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
  .stage {
    min-height: 440px;
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
