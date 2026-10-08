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
            <p :key="sceneAsset">{{ heroSubtitle }}</p>
          </Transition>
        </div>

        <div
          class="stage"
          :class="`stage--${activeScene}`"
          @pointermove="handleStagePointer"
          @pointerleave="resetStagePointer"
        >
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
            <!-- 与视频等大的定位框：星光按视频尺寸定位，又不会被视频的裁切框裁掉 -->
            <div ref="viewportRef" class="stage__viewport">
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

              <!-- 四颗星光像卫星一样绕着视频运行：悬停暂停，点击展开对应标签，再点标签碎裂消散 -->
              <div
                v-for="(item, i) in heroMeta"
                :key="item.slot"
                ref="hudRefs"
                class="hud"
                :class="{ 'is-open': openHuds[item.slot] }"
                :style="{ '--hud-i': i }"
                @pointerenter="satellitePaused[i] = true"
                @pointerleave="satellitePaused[i] = false"
              >
                <el-tooltip
                  :content="item.label"
                  placement="top"
                  :show-after="200"
                  :disabled="!!openHuds[item.slot]"
                >
                  <button
                    type="button"
                    class="hud__star"
                    :aria-label="`展开${item.label}`"
                    :aria-expanded="!!openHuds[item.slot]"
                    @click="openHud(item.slot, i)"
                  >
                    <!-- 远近缩放写在这一层，不和按钮自身的收起、悬停样式抢属性 -->
                    <span class="hud__star-body">
                      <svg class="hud__star-main" viewBox="0 0 24 24" aria-hidden="true">
                        <path :d="STAR_PATH" />
                      </svg>
                      <svg class="hud__star-mini" viewBox="0 0 24 24" aria-hidden="true">
                        <path :d="STAR_PATH" />
                      </svg>
                    </span>
                  </button>
                </el-tooltip>
                <div
                  v-if="openHuds[item.slot]"
                  class="hud__card"
                  :class="`hud__card--${openHuds[item.slot]!.side}`"
                  :style="hudCardStyle(openHuds[item.slot]!)"
                  role="button"
                  tabindex="0"
                  title="点击收起"
                  @click="closeHud(item.slot, i)"
                  @keydown.enter="closeHud(item.slot, i)"
                >
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
                    <span class="hud__val" :class="{ 'is-empty': !item.value }">
                      {{ item.value || "未填写" }}
                    </span>
                  </div>
                </div>
                <!-- 碎片层：收起时的碎片挂在这里，飘散完自行清理 -->
                <div class="hud__fx"></div>
              </div>
            </div>
          </div>

          <!-- 技能条：指针移到舞台下方才出现，由拼图块依次拼合 -->
          <Transition name="dock">
            <div v-if="dockOpen" class="dock">
              <span class="dock__piece dock__piece--label" :style="pieceStyle(0)">SKILLS</span>
              <span
                v-for="(chip, i) in skillChips"
                :key="chip"
                class="dock__piece"
                :style="pieceStyle(i + 1)"
              >
                {{ chip }}
              </span>
              <button
                v-if="!skillChips.length"
                type="button"
                class="dock__piece dock__piece--empty"
                :style="pieceStyle(1)"
                @click="active = 'ability'"
              >
                还没有技能标签，去「个人档案」添加
              </button>
            </div>
          </Transition>
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

          <!-- 个人档案：左侧舞台的标签与技能条读取这里 -->
          <template #ability>
            <form class="profile-form" @submit.prevent>
              <div class="field">
                <label>角色定位</label>
                <AnimalSelect
                  v-model="abilityForm.position"
                  :options="positionOptions"
                  placeholder="请选择角色定位"
                  clearable
                  filterable
                />
              </div>
              <div class="field">
                <label>组织信息</label>
                <Input
                  v-model="abilityForm.organization"
                  placeholder="所在公司或团队"
                  :maxlength="100"
                  allow-clear
                />
              </div>
              <div class="field">
                <label>所在地区</label>
                <div class="region-picker">
                  <AnimalSelect
                    v-model="regionProvince"
                    :options="provinceOptions"
                    placeholder="省份"
                    clearable
                    filterable
                  />
                  <AnimalSelect
                    v-model="regionCity"
                    :options="cityOptions"
                    :placeholder="cityOptions.length ? '城市' : '无需选择'"
                    :disabled="!cityOptions.length"
                    clearable
                    filterable
                  />
                </div>
              </div>
              <div class="field">
                <label>技术栈</label>
                <Input
                  v-model="abilityForm.techStack"
                  placeholder="如：Laravel · Vue · MySQL"
                  :maxlength="200"
                  allow-clear
                />
              </div>
              <div class="field field--span2">
                <label>技能标签</label>
                <Input
                  v-model="skillsText"
                  placeholder="用逗号或顿号分隔，如：Laravel、Vue 3、MySQL（最多 20 个）"
                  allow-clear
                />
                <span v-if="abilityError" class="field__err">{{ abilityError }}</span>
                <div v-if="skillChips.length" class="skill-preview">
                  <AnimalTag v-for="chip in skillChips" :key="chip" type="success">
                    {{ chip }}
                  </AnimalTag>
                </div>
              </div>
              <div class="actions">
                <Button type="primary" :loading="abilitySaving" @click="handleAbilitySubmit">
                  保存更改
                </Button>
                <Button @click="resetAbilityForm">重置</Button>
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
import { ref, reactive, computed, onMounted, onActivated, onDeactivated, watch } from "vue";
import {
  useElementSize,
  useMediaQuery,
  useNow,
  usePreferredReducedMotion,
  useRafFn,
  useResizeObserver,
} from "@vueuse/core";
import UserAPI from "@/api/system/user";
import { useUserStore } from "@/store/modules/user";
import AnimalTextarea from "@/components/AnimalTextarea/index.vue";
import AnimalSelect from "@/components/AnimalSelect/index.vue";
import AnimalMenuIcon from "@/components/AnimalMenuIcon/index.vue";
import AnimalTag from "@/components/AnimalTag/index.vue";
import AvatarCropModal from "./AvatarCropModal.vue";
import { CHINA_REGIONS } from "@/constants/china-regions";
import { resolveAvatar } from "@/utils/avatar";
import { disintegrate } from "@/utils/disintegrate";
import type { UserProfileForm, UserPasswordForm, UserAbilities } from "@/types/api";

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

const MAX_SKILLS = 20;
const MAX_SKILL_LENGTH = 30;
const createAbilityForm = (): Omit<UserAbilities, "skills"> => ({
  position: "",
  organization: "",
  region: "",
  techStack: "",
});

const abilityForm = reactive(createAbilityForm());

const positionOptions = [
  "架构师",
  "资深架构师",
  "技术负责人",
  "全栈工程师",
  "后端工程师",
  "前端工程师",
  "移动端工程师",
  "测试工程师",
  "运维工程师",
  "数据工程师",
  "算法工程师",
  "产品经理",
  "设计师",
  "项目经理",
  "学生",
  "自由职业",
].map((name) => ({ key: name, label: name }));

/** 所在地区存成「中国 · 省 · 市」一段文本，编辑时拆成省、市两个下拉；海外不带「中国」前缀 */
const REGION_SEPARATOR = " · ";
const REGION_OVERSEAS = "海外";
const provinceOptions = [...CHINA_REGIONS.map((region) => region.name), REGION_OVERSEAS].map(
  (name) => ({ key: name, label: name })
);
const regionParts = computed(() => abilityForm.region.split(REGION_SEPARATOR).filter(Boolean));
const regionProvince = computed<string>({
  get: () =>
    regionParts.value[0] === "中国" ? regionParts.value[1] || "" : regionParts.value[0] || "",
  set: (province) => {
    // 换省份后原来的城市不再成立，一并清掉
    abilityForm.region = formatRegion(province, "");
  },
});
const regionCity = computed<string>({
  get: () => (regionParts.value[0] === "中国" ? regionParts.value[2] || "" : ""),
  set: (city) => {
    abilityForm.region = formatRegion(regionProvince.value, city);
  },
});
const cityOptions = computed(() =>
  (CHINA_REGIONS.find((region) => region.name === regionProvince.value)?.cities || []).map(
    (name) => ({ key: name, label: name })
  )
);

function formatRegion(province: string, city: string): string {
  if (!province || province === REGION_OVERSEAS) return province;
  return ["中国", province, city].filter(Boolean).join(REGION_SEPARATOR);
}
/** 技能标签以一段文本编辑，保存和展示时再拆成列表 */
const skillsText = ref("");
let lastLoadedAbility = { ...createAbilityForm(), skillsText: "" };
const abilitySaving = ref(false);
const abilityError = ref("");

const skillChips = computed(() => [
  ...new Set(
    skillsText.value
      .split(/[,，、\n]+/)
      .map((skill) => skill.trim())
      .filter(Boolean)
  ),
]);

const errors = reactive<{ realname: string; nickname: string; email: string }>({
  realname: "",
  nickname: "",
  email: "",
});

const tabItems = [
  { key: "info", label: "基本信息" },
  { key: "ability", label: "个人档案" },
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
}[] = [
  {
    key: "morning",
    label: "清晨",
    from: 5,
    angle: 270,
    placement: "left",
  },
  {
    key: "day",
    label: "白天",
    from: 10,
    angle: 0,
    placement: "top",
  },
  {
    key: "dusk",
    label: "黄昏",
    from: 17,
    angle: 90,
    placement: "right",
  },
  {
    key: "night",
    label: "夜晚",
    from: 20,
    angle: 180,
    placement: "bottom",
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

type PersonaGender = "male" | "female" | "private";

/** 三个人物各有自己的四个场景，副标题按「人物 × 时段」取 */
const SCENE_COPY: Record<PersonaGender, Record<SceneKey, string>> = {
  male: {
    morning: "清晨的栈桥很安静，适合等第一条鱼上钩。",
    day: "阳光正好，带上捕虫网去草地转一圈。",
    dusk: "夕阳落进海里，顺手捡了只海螺。",
    night: "篝火噼啪作响，提着灯数今晚的流星。",
  },
  female: {
    morning: "花园里的露水还没干，先把花浇一遍。",
    day: "广场上彩旗飘飘，手里的气球总想飞走。",
    dusk: "趁灯塔刚亮，把今天的落日拍下来。",
    night: "山顶的风很轻，望远镜里全是星星。",
  },
  private: {
    morning: "菜园的胡萝卜熟了，先拔一根最大的。",
    day: "沿着小溪走进森林，篮子里装满了蘑菇。",
    dusk: "麦田染成金色，手里的风车跟着远处的一起转。",
    night: "祭典的灯笼都亮了，点一支仙女棒。",
  },
};

const personaGender = computed<PersonaGender>(() => {
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
const heroSubtitle = computed(() => SCENE_COPY[personaGender.value][activeScene.value]);

const heroMeta = computed(() => [
  {
    slot: "tl",
    label: "角色定位",
    value: abilityForm.position,
    icon: '<circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" />',
  },
  {
    slot: "tr",
    label: "组织信息",
    value: abilityForm.organization,
    icon: '<path d="M4 21V5l8-2v18M12 9h8v12M4 21h16" />',
  },
  {
    slot: "bl",
    label: "所在地区",
    value: abilityForm.region,
    icon: '<path d="M12 21s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13z" /><circle cx="12" cy="8" r="2.4" />',
  },
  {
    slot: "br",
    label: "技术栈",
    value: abilityForm.techStack,
    icon: '<path d="M2 12l10-5 10 5-10 5z" /><path d="M6 14v4c0 1 3 3 6 3s6-2 6-3v-4" />',
  },
]);

/** 四角星的轮廓，主星和伴星共用 */
const STAR_PATH =
  "M12 1.5c.7 6.3 4.2 9.8 10.5 10.5-6.3.7-9.8 4.2-10.5 10.5-.7-6.3-4.2-9.8-10.5-10.5 6.3-.7 9.8-4.2 10.5-10.5z";

/** 已展开的标签及其展开方向；默认全部收起，只显示星光 */
interface OpenHud {
  side: "left" | "right";
  /** 外侧放不下整张卡片时往里挪的像素 */
  shift: number;
}
const openHuds = reactive<Record<string, OpenHud | undefined>>({});
/** 星光与标签随指针做视差：各自位移幅度不同，形成前后层次 */
const HUD_DEPTH = [16, 24, 20, 28];
const HUD_CARD_WIDTH = 200;
/** 卡片图标中心到卡片近侧边缘的距离，展开时图标正好落在星光上 */
const HUD_ICON_OFFSET = 27;
const HUD_EDGE_GAP = 10;
/** 星光盒子（.hud）边长的一半 */
const HUD_STAR_RADIUS = 17;
const hudRefs = ref<HTMLElement[]>([]);
const viewportRef = ref<HTMLElement | null>(null);
const reducedMotion = usePreferredReducedMotion();
let pointerFrame = 0;

/**
 * 四颗星光像卫星一样绕视频运行。
 * 每条轨道是一个斜放的椭圆，绕到后半圈时从视频背后穿过；
 * 椭圆的半径、倾角和高度各自按不同周期缓慢摆动，所以轨迹不会重复。
 */
const SATELLITES = [
  { period: 34, direction: 1, phase: 0, height: 0.21, tilt: 0.08, sway: 0.08 },
  { period: 41, direction: -1, phase: 1.7, height: 0.32, tilt: -0.2, sway: 0.25 },
  { period: 29, direction: 1, phase: 3.3, height: 0.46, tilt: 0.16, sway: 0.3 },
  { period: 47, direction: -1, phase: 4.9, height: 0.55, tilt: -0.1, sway: 0.12 },
];
/** 星光的活动范围：上方留出边距，下方不进入技能条出现的区域（舞台底部约四分之一） */
const SATELLITE_TOP = 24;
const SATELLITE_BOTTOM_RATIO = 0.74;
/** 每颗星各走各的时钟，悬停或展开时停表，恢复后从原地接着走 */
const satelliteClock = SATELLITES.map(() => 0);
const satellitePaused = SATELLITES.map(() => false);
const { width: viewportWidth, height: viewportHeight } = useElementSize(viewportRef);

function placeSatellite(index: number, slot: string) {
  const el = hudRefs.value[index];
  const width = viewportWidth.value;
  const height = viewportHeight.value;
  if (!el || !width || !height) return;

  const satellite = SATELLITES[index];
  const time = satelliteClock[index];
  const angle = satellite.phase + satellite.direction * (time / satellite.period) * Math.PI * 2;
  const radiusX = width / 2 + 34 + 22 * Math.sin(time / (11 + index * 2.3));
  const radiusY = height * 0.06;
  // 最上和最下两条轨道摆幅收小，本身就不会越界；下面的夹取只是兜住极端窗口尺寸
  const tilt = satellite.tilt + satellite.sway * Math.sin(time / (27 + index * 5.1) + index);
  const centerY = height * (satellite.height + 0.05 * Math.sin(time / (17 + index * 3.7)));

  const alongX = radiusX * Math.cos(angle);
  const alongY = radiusY * Math.sin(angle);
  const x = alongX * Math.cos(tilt) - alongY * Math.sin(tilt);
  const y = Math.min(
    Math.max(centerY + alongX * Math.sin(tilt) + alongY * Math.cos(tilt), SATELLITE_TOP),
    height * SATELLITE_BOTTOM_RATIO
  );
  // 0 在视频正后方，1 在正前方
  const nearness = (Math.sin(angle) + 1) / 2;

  el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  // 后半圈压到视频下面，两侧模糊区里仍然看得见
  el.style.zIndex = nearness >= 0.5 || openHuds[slot] ? "5" : "-1";
  const body = el.querySelector<HTMLElement>(".hud__star-body");
  if (body) {
    body.style.scale = (0.7 + 0.3 * nearness).toFixed(3);
    body.style.opacity = (0.5 + 0.5 * nearness).toFixed(3);
  }
}

const { pause: pauseSatellites, resume: resumeSatellites } = useRafFn(({ delta }) => {
  // 切回页面时 delta 可能很大，封顶避免星光瞬移
  const seconds = reducedMotion.value === "reduce" ? 0 : Math.min(delta, 100) / 1000;
  heroMeta.value.forEach((item, index) => {
    if (!satellitePaused[index] && !openHuds[item.slot]) satelliteClock[index] += seconds;
    placeSatellite(index, item.slot);
  });
});
onDeactivated(pauseSatellites);
onActivated(resumeSatellites);

/** 展开标签：朝远离人物的一侧展开；那一侧放不下就往里挪，免得被舞台边缘裁掉 */
function openHud(slot: string, index: number) {
  const el = hudRefs.value[index];
  const scene = viewportRef.value?.parentElement;
  if (!el || !scene) return;
  const sceneRect = scene.getBoundingClientRect();
  const rect = el.getBoundingClientRect();
  const center = rect.left + rect.width / 2 - sceneRect.left;
  const side = center < sceneRect.width / 2 ? "left" : "right";
  const room =
    side === "left"
      ? center + HUD_ICON_OFFSET - HUD_EDGE_GAP
      : sceneRect.width - HUD_EDGE_GAP - (center - HUD_ICON_OFFSET);
  openHuds[slot] = { side, shift: Math.max(0, Math.round(HUD_CARD_WIDTH - room)) };
}

function hudCardStyle(state: OpenHud) {
  // 卡片近侧边缘要落在星光中心外 HUD_ICON_OFFSET 处，换算成相对星光盒子边缘的偏移
  const offset = `${HUD_STAR_RADIUS - HUD_ICON_OFFSET - state.shift}px`;
  const originX = HUD_ICON_OFFSET + state.shift;
  return state.side === "left"
    ? { right: offset, "--hud-origin": `calc(100% - ${originX}px) 25px` }
    : { left: offset, "--hud-origin": `${originX}px 25px` };
}

/** 收起标签：先把它碎成粒子飘散，再移除本体；碎片朝展开的那一侧飘 */
function closeHud(slot: string, index: number) {
  const state = openHuds[slot];
  const root = hudRefs.value[index];
  const card = root?.querySelector<HTMLElement>(".hud__card");
  const host = root?.querySelector<HTMLElement>(".hud__fx");
  if (state && card && host && reducedMotion.value !== "reduce") {
    disintegrate(card, host, {
      shardClass: "hud__card--shard",
      direction: state.side === "left" ? -1 : 1,
    });
  }
  openHuds[slot] = undefined;
}

function applyParallax(x: number, y: number) {
  hudRefs.value.forEach((el, i) => {
    el.style.translate = `${(x * HUD_DEPTH[i]).toFixed(1)}px ${(y * HUD_DEPTH[i]).toFixed(1)}px`;
  });
}

/** 技能条只在指针靠近舞台底部时出现；进出阈值错开，避免在边界上来回闪 */
const canHover = useMediaQuery("(hover: hover) and (pointer: fine)");
const pointerNearBottom = ref(false);
const dockOpen = computed(() => !canHover.value || pointerNearBottom.value);

function handleStagePointer(event: PointerEvent) {
  if (event.pointerType !== "mouse") return;
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  if (y > 0.28) pointerNearBottom.value = true;
  else if (y < 0.18) pointerNearBottom.value = false;

  if (reducedMotion.value === "reduce") return;
  cancelAnimationFrame(pointerFrame);
  pointerFrame = requestAnimationFrame(() => applyParallax(x, y));
}

function resetStagePointer() {
  pointerNearBottom.value = false;
  cancelAnimationFrame(pointerFrame);
  applyParallax(0, 0);
}

/** 拼图块的散落起点：按序号取伪随机，保证每次出现的轨迹一致 */
function pieceStyle(index: number) {
  const noise = (salt: number) => {
    const value = Math.sin((index + 1) * salt) * 43758.5453;
    return value - Math.floor(value);
  };
  return {
    "--piece-i": index,
    "--piece-x": `${Math.round((noise(12.9898) - 0.5) * 140)}px`,
    "--piece-y": `${-36 - Math.round(noise(78.233) * 56)}px`,
    "--piece-rot": `${Math.round((noise(37.719) - 0.5) * 80)}deg`,
  };
}

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

    const abilities: Partial<UserAbilities> = member.abilities || {};
    Object.assign(abilityForm, {
      position: abilities.position || "",
      organization: abilities.organization || "",
      region: abilities.region || "",
      techStack: abilities.techStack || "",
    });
    skillsText.value = (abilities.skills || []).join("、");
    lastLoadedAbility = { ...abilityForm, skillsText: skillsText.value };
  } finally {
    loading.value = false;
  }
}

function validateAbility(): boolean {
  if (skillChips.value.length > MAX_SKILLS) {
    abilityError.value = `技能标签最多 ${MAX_SKILLS} 个，当前 ${skillChips.value.length} 个`;
  } else if (skillChips.value.some((skill) => skill.length > MAX_SKILL_LENGTH)) {
    abilityError.value = `单个技能标签不能超过 ${MAX_SKILL_LENGTH} 个字符`;
  } else {
    abilityError.value = "";
  }
  return !abilityError.value;
}

async function handleAbilitySubmit() {
  if (!validateAbility()) return;
  abilitySaving.value = true;
  try {
    await UserAPI.updateProfile({ abilities: { ...abilityForm, skills: skillChips.value } });
    message.success("保存成功");
    lastLoadedAbility = { ...abilityForm, skillsText: skillsText.value };
  } catch {
    // 失败提示由请求层统一弹出
  } finally {
    abilitySaving.value = false;
  }
}

function resetAbilityForm() {
  const { skillsText: text, ...fields } = lastLoadedAbility;
  Object.assign(abilityForm, fields);
  skillsText.value = text;
  abilityError.value = "";
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
}
/* 竖版视频保持原比例、撑满舞台高度，宽度由 9:16 推出 */
.stage__viewport {
  position: relative;
  height: 100%;
  max-width: 100%;
  aspect-ratio: 9 / 16;
}
.stage__frame {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 44px rgba(23, 50, 45, 0.28);
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
/* 档案标签：平时是绕着视频运行的星光，点击后从星光处展开成卡片 */
.hud {
  position: absolute;
  /* 以视频顶边中点为原点，轨道位置由脚本写 transform */
  top: 0;
  left: 50%;
  z-index: 5;
  width: 34px;
  height: 34px;
  margin: -17px 0 0 -17px;
  /* 指针视差由脚本直接写 translate，这里只负责缓动 */
  transition: translate 0.5s var(--ease-out);
  will-change: transform;
}
.hud__star {
  position: absolute;
  inset: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: #fff;
  cursor: pointer;
  transition:
    opacity 0.2s ease,
    scale 0.2s ease;
}
.hud__star-body {
  position: absolute;
  inset: 0;
}
.hud__star svg {
  position: absolute;
  fill: currentColor;
  filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.95))
    drop-shadow(0 0 9px rgba(255, 236, 150, 0.9));
}
/* 主星和伴星周期不同，闪烁不同步 */
.hud__star-main {
  top: 5px;
  left: 5px;
  width: 24px;
  height: 24px;
  animation: star-twinkle 2.4s ease-in-out calc(var(--hud-i) * 0.5s) infinite;
}
.hud__star-mini {
  top: 0;
  right: 0;
  width: 10px;
  height: 10px;
  animation: star-twinkle 1.7s ease-in-out calc(var(--hud-i) * 0.3s + 0.6s) infinite;
}
@keyframes star-twinkle {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(0.5) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.1) rotate(18deg);
  }
}
.hud.is-open .hud__star {
  opacity: 0;
  scale: 0.6;
  pointer-events: none;
}
/* macOS 风格的通透玻璃：底色很淡，靠强模糊加提饱和托住文字，边缘一圈高光 */
.hud__card {
  position: absolute;
  /* 卡片图标的中心对准星光的中心 */
  top: -8px;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  /* 宽度固定，展开前就能算出往哪边放、要不要往里挪 */
  width: 200px;
  padding: 10px 14px 10px 12px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.12));
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow:
    0 14px 34px rgba(15, 35, 30, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.75),
    inset 0 -1px 0 rgba(255, 255, 255, 0.14),
    inset 0 0 14px rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(22px) saturate(190%) brightness(1.1);
  cursor: pointer;
  transition:
    scale 0.2s ease,
    box-shadow 0.2s ease;
  /* 从星光处圆形展开，展开后轻微漂浮 */
  animation:
    hud-open 0.42s var(--ease-out) both,
    hud-float 6s ease-in-out 0.5s infinite;
}
/* 向左展开的卡片左右镜像：图标靠右、文字右对齐，图标仍然压在星光上 */
.hud__card--left {
  flex-direction: row-reverse;
  padding: 10px 12px 10px 14px;
  text-align: right;
}
@keyframes hud-open {
  from {
    clip-path: circle(0 at var(--hud-origin));
  }
  to {
    clip-path: circle(150% at var(--hud-origin));
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
  animation: hud-sheen 7s var(--ease-in-out) 1.2s infinite;
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
.hud__ico {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.2));
  display: grid;
  place-items: center;
  color: var(--mint-deep);
  flex-shrink: 0;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
  transition: transform 0.2s ease;
  /* 只做 backwards 填充，结束后把 transform 还给 hover */
  animation: hud-pop 0.32s var(--ease-out) 0.06s backwards;
}
.hud__ico svg {
  width: 16px;
  height: 16px;
}
.hud__txt {
  flex: 1;
  min-width: 0;
  line-height: 1.35;
}
.hud__lbl {
  display: block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(23, 50, 45, 0.66);
  animation: hud-rise 0.3s var(--ease-out) 0.14s backwards;
}
.hud__val {
  display: block;
  margin-top: 3px;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--teal-ink);
  animation: hud-rise 0.3s var(--ease-out) 0.2s backwards;
}
.hud__val.is-empty {
  color: rgba(23, 50, 45, 0.6);
  font-weight: 500;
}
/* 夜晚场景背景偏暗，换成深色玻璃配浅色字 */
.stage--night .hud__card {
  background: linear-gradient(135deg, rgba(60, 80, 110, 0.34), rgba(20, 30, 50, 0.2));
  border-color: rgba(255, 255, 255, 0.28);
}
.stage--night .hud__ico {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.28), rgba(255, 255, 255, 0.1));
  color: #d6ff72;
}
.stage--night .hud__lbl,
.stage--night .hud__val.is-empty {
  color: rgba(255, 255, 255, 0.7);
}
.stage--night .hud__val {
  color: #fff;
}
@keyframes hud-pop {
  from {
    opacity: 0;
    transform: scale(0.6);
  }
}
@keyframes hud-rise {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
}
/* 碎片层与碎片：碎片是卡片的克隆，关掉动画和毛玻璃，只留外形和内容 */
.hud__fx {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.hud__card--shard {
  background: rgba(255, 255, 255, 0.6);
  box-shadow: none;
  backdrop-filter: none;
  animation: none;
}
.stage--night .hud__card--shard {
  background: rgba(50, 68, 96, 0.72);
}
.hud__card--shard .hud__sheen {
  display: none;
}
.hud__card--shard .hud__ico,
.hud__card--shard .hud__lbl,
.hud__card--shard .hud__val {
  animation: none;
}
@media (hover: hover) and (pointer: fine) {
  .hud__star:hover {
    scale: 1.25;
  }
  .hud__card:hover {
    scale: 1.04;
    box-shadow:
      0 16px 32px rgba(23, 50, 45, 0.16),
      inset 0 1px 0 rgba(255, 255, 255, 0.55);
  }
  .hud__card:hover .hud__ico {
    transform: rotate(-8deg) scale(1.08);
  }
}

/* 技能条：一排互相咬合的拼图块，出现时从散落处飞来拼合 */
.dock {
  --knob: 6px;
  position: absolute;
  right: 22px;
  bottom: 22px;
  left: 22px;
  z-index: 6;
  display: flex;
  flex-wrap: wrap;
  row-gap: 6px;
  justify-content: center;
  /* 左侧多留一个凸点的宽度，抵消拼图块的负边距 */
  padding: 10px 14px 10px calc(14px + var(--knob) + 1px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(23, 50, 45, 0.45);
  box-shadow:
    0 12px 26px rgba(23, 50, 45, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(14px) saturate(140%);
}
.dock-enter-active {
  transition: opacity 0.2s ease;
}
.dock-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}
.dock-enter-from {
  opacity: 0;
}
.dock-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
/* 每块右侧一个圆凸点、左侧一个圆凹口；相邻两块重叠一个凸点的宽度，凸点正好嵌进凹口 */
.dock__piece {
  margin-left: calc(-1 * var(--knob) - 1px);
  padding: 7px calc(11px + var(--knob)) 7px calc(10px + var(--knob));
  background: rgba(255, 255, 255, 0.14);
  color: #e6f7f0;
  font-size: 11.5px;
  font-weight: 700;
  white-space: nowrap;
  mask:
    radial-gradient(circle var(--knob) at 0 50%, #000 calc(100% - 0.5px), transparent),
    radial-gradient(
      circle var(--knob) at calc(100% - var(--knob) - 1px) 50%,
      #000 calc(100% - 0.5px),
      transparent
    ),
    linear-gradient(#000 0 0) left / calc(100% - var(--knob) - 1px) 100% no-repeat;
  mask-composite: exclude, add;
  animation: piece-in 0.56s var(--ease-out) calc(var(--piece-i) * 55ms + 0.08s) both;
}
.dock__piece:nth-child(odd) {
  background: rgba(255, 255, 255, 0.24);
}
/* 第一块左边没有邻居，不开凹口 */
.dock__piece.dock__piece--label {
  mask:
    radial-gradient(
      circle var(--knob) at calc(100% - var(--knob) - 1px) 50%,
      #000 calc(100% - 0.5px),
      transparent
    ),
    linear-gradient(#000 0 0) left / calc(100% - var(--knob) - 1px) 100% no-repeat;
  mask-composite: add;
  background: linear-gradient(135deg, rgba(214, 255, 114, 0.95), rgba(196, 240, 136, 0.95));
  color: #1a3508;
  font-family: "JetBrains Mono", monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  line-height: 17px;
}
/* 没有技能时的提示块，点击跳到「个人档案」页签 */
.dock__piece--empty {
  border: 0;
  font-family: inherit;
  cursor: pointer;
}
@keyframes piece-in {
  from {
    opacity: 0;
    transform: translate(var(--piece-x), var(--piece-y)) rotate(var(--piece-rot)) scale(0.9);
  }
  60% {
    opacity: 1;
  }
  to {
    opacity: 1;
    transform: none;
  }
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

/* 个人档案：所在地区的省、市两个下拉并排 */
.region-picker {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

/* 个人档案：技能标签预览 */
.skill-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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
  .hud__card,
  .dock__piece {
    animation: hud-fade 0.2s ease both;
  }
  .hud__star svg,
  .hud__sheen::before,
  .hud__ico,
  .hud__lbl,
  .hud__val,
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
