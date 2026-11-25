<!-- 首页 3D 小岛导览：琉璃海立体切片箱庭 -->
<template>
  <section v-if="!failed" class="section island-tour">
    <div class="section-head">
      <div>
        <div class="section-eyebrow">TOUR · 立体切片箱庭</div>
        <h2 class="section-title">小岛导览 · 琉璃海箱庭</h2>
      </div>
      <p class="section-sub">
        拖动把玩四层共生箱庭，点建筑或标签拉近并触发机关，轻点琉璃海面激起涟漪喂小鱼；按住 Ctrl +
        滚轮缩放。
      </p>
    </div>

    <!-- 未按 Ctrl 的滚轮在捕获阶段拦下，不让它到达画布，页面照常滚动 -->
    <div ref="stageEl" class="island-tour__stage" @wheel.capture.passive="onWheel">
      <div ref="canvasHost" class="island-tour__canvas"></div>
      <div v-if="!ready" class="island-tour__placeholder">正在雕琢四层切片箱庭与琉璃海…</div>

      <!-- 左上角紧凑 24h 时光拨盘 -->
      <div
        v-if="ready"
        class="island-tour__clock-pill"
        title="拖动查看一日 24 小时日光轨迹与海底珊瑚夜光"
      >
        <span class="island-tour__clock-time">{{ formattedHour }}</span>
        <input
          v-model.number="sliderHour"
          type="range"
          min="0"
          max="24"
          step="0.1"
          class="island-tour__clock-slider"
          aria-label="调节箱庭时间"
          @input="onSliderInput"
        />
        <button
          v-if="manualHour !== null"
          type="button"
          class="island-tour__clock-reset"
          title="恢复跟随首页时段"
          aria-label="恢复跟随首页时段"
          @click="resetManualHour"
        >
          ↻
        </button>
      </div>

      <!-- 右上角把玩工具条 -->
      <div v-if="ready" class="island-tour__toolbar">
        <button
          type="button"
          class="island-tour__pill-btn"
          :class="{ 'island-tour__pill-btn--on': activeKey === null }"
          @click="scene?.focusOverview()"
        >
          🧭 全景
        </button>
        <button
          type="button"
          class="island-tour__pill-btn"
          :class="{ 'island-tour__pill-btn--on': isoMode }"
          @click="toggleIso"
        >
          {{ isoMode ? "📐 手办等轴" : "🎥 透视" }}
        </button>
        <button
          v-if="!reducedMotion"
          type="button"
          class="island-tour__pill-btn"
          :class="{ 'island-tour__pill-btn--on': playing }"
          @click="togglePlay"
        >
          {{ playing ? "⏸ 暂停" : "✈️ 巡航" }}
        </button>
        <button
          type="button"
          class="island-tour__pill-btn"
          :class="{ 'island-tour__pill-btn--on': showPins }"
          @click="showPins = !showPins"
        >
          🏷️ 标签
        </button>
      </div>

      <!-- 3D 空间锚点悬浮胶囊层 -->
      <div v-show="ready && showPins" class="island-tour__pins">
        <button
          v-for="z in zones"
          :key="z.key"
          :ref="(el) => setPinRef(z.key, el)"
          type="button"
          class="island-tour__pin"
          :class="{ 'island-tour__pin--on': z.key === activeKey }"
          @click="selectZoneAndToy(z.key)"
        >
          <span class="island-tour__pin-ico">{{ z.icon }}</span>
          <span>{{ z.name }}</span>
        </button>
      </div>

      <!-- 右侧滑入分区检视卡 -->
      <Transition name="island-tour-card">
        <div
          v-if="activeZone"
          :key="activeZone.key"
          class="island-tour__card"
          @pointerenter="scene?.holdTour(true)"
          @pointerleave="scene?.holdTour(false)"
          @focusin="scene?.holdTour(true)"
          @focusout="scene?.holdTour(false)"
        >
          <div class="island-tour__card-head">
            <span class="island-tour__card-badge">
              {{ activeZone.badge }} · {{ activeZone.elevationLabel }}
            </span>
            <button
              type="button"
              class="island-tour__card-close"
              aria-label="回到全岛俯视"
              @click="scene?.focusOverview()"
            >
              ✕
            </button>
          </div>
          <div class="island-tour__card-name">{{ activeZone.icon }} {{ activeZone.name }}</div>
          <p class="island-tour__card-intro">{{ activeZone.intro }}</p>
          <div class="island-tour__chips">
            <span v-for="f in activeZone.features" :key="f" class="island-tour__chip">{{ f }}</span>
          </div>
          <div class="island-tour__card-actions">
            <button
              type="button"
              class="btn-ai btn-ai-sm"
              @click="scene?.triggerToy(activeZone.key)"
            >
              <span class="btn-ai-text">{{ activeZone.toyLabel }}</span>
            </button>
            <button
              type="button"
              class="btn-ai btn-ai-primary btn-ai-sm"
              @click="emit('go', activeZone.path)"
            >
              <span class="btn-ai-finger"></span>
              <span class="btn-ai-text">去看看 →</span>
            </button>
          </div>
        </div>
      </Transition>

      <!-- 舞台底部轻提示 -->
      <Transition name="island-tour-toast">
        <div v-if="toastText" class="island-tour__toast">{{ toastText }}</div>
      </Transition>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  computed,
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  onMounted,
  ref,
  shallowRef,
  watch,
  type ComponentPublicInstance,
} from "vue";
import type { TimePeriod } from "../day-cycle";
import { PERIOD_TO_HOUR } from "./island-tour/palette";
import { zones, type IslandScene, type PinScreenPos, type ZoneKey } from "./island-tour/zones";

defineOptions({ name: "IslandTour" });

const props = defineProps<{ period: TimePeriod }>();
const emit = defineEmits<{ go: [path: string] }>();

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const stageEl = ref<HTMLElement | null>(null);
const canvasHost = ref<HTMLElement | null>(null);
const scene = shallowRef<IslandScene | null>(null);
const failed = ref(false);
const ready = ref(false);
const activeKey = ref<ZoneKey | null>(null);
const playing = ref(false);
const isoMode = ref(false);
const showPins = ref(true);
const manualHour = ref<number | null>(null);
const sliderHour = ref<number>(PERIOD_TO_HOUR[props.period]);
const toastText = ref("");

const activeZone = computed(() => zones.find((z) => z.key === activeKey.value) ?? null);

const formattedHour = computed(() => {
  const h = sliderHour.value;
  const hh = Math.floor(((h % 24) + 24) % 24);
  const mm = Math.round((h - Math.floor(h)) * 60) % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
});

const pinRefs = new Map<ZoneKey, HTMLButtonElement>();
const setPinRef = (key: ZoneKey, el: Element | ComponentPublicInstance | null) => {
  if (el instanceof HTMLButtonElement) pinRefs.set(key, el);
  else pinRefs.delete(key);
};

let toastTimer: number | null = null;
const showToast = (msg: string) => {
  toastText.value = msg;
  if (toastTimer !== null) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toastText.value = "";
  }, 2400);
};

const updatePins = (pins: PinScreenPos[]) => {
  for (const p of pins) {
    const el = pinRefs.get(p.key);
    if (!el) continue;
    el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) translate(-50%, -100%)`;
    el.style.opacity = p.visible ? "1" : "0";
    el.style.pointerEvents = p.visible ? "auto" : "none";
  }
};

let inView = false;
let loading = false;
let unmounted = false;
let preloadObserver: IntersectionObserver | null = null;
let viewObserver: IntersectionObserver | null = null;

// 只有在视口内且标签页可见时才跑渲染循环
const syncRunning = () => {
  if (!scene.value) return;
  if (inView && document.visibilityState === "visible") scene.value.resume();
  else scene.value.pause();
};

async function load() {
  loading = true;
  try {
    const { createIslandScene } = await import("./island-tour/scene");
    if (unmounted || !canvasHost.value) return;
    scene.value = createIslandScene(canvasHost.value, {
      period: props.period,
      hour: manualHour.value ?? PERIOD_TO_HOUR[props.period],
      reducedMotion,
      mobile: window.matchMedia("(max-width: 767px)").matches,
      onZoneChange: (key) => {
        activeKey.value = key;
      },
      onProjectPins: updatePins,
      onToyTriggered: showToast,
    });
    ready.value = true;
    scene.value.setIsoMode(isoMode.value);
    scene.value.setAutoplay(playing.value);
    syncRunning();
  } catch {
    // WebGL 不可用或场景模块加载失败：整个 section 不渲染
    failed.value = true;
  }
}

const onWheel = (e: WheelEvent) => {
  if (!e.ctrlKey) e.stopPropagation();
};

const togglePlay = () => {
  playing.value = !playing.value;
  scene.value?.setAutoplay(playing.value);
};

const toggleIso = () => {
  isoMode.value = !isoMode.value;
  scene.value?.setIsoMode(isoMode.value);
};

const selectZoneAndToy = (key: ZoneKey) => {
  scene.value?.focusZone(key);
  scene.value?.triggerToy(key);
};

const onSliderInput = () => {
  manualHour.value = sliderHour.value;
  scene.value?.setHour(sliderHour.value);
};

const resetManualHour = () => {
  manualHour.value = null;
  sliderHour.value = PERIOD_TO_HOUR[props.period];
  scene.value?.setPeriod(props.period);
};

watch(
  () => props.period,
  (p) => {
    manualHour.value = null;
    sliderHour.value = PERIOD_TO_HOUR[p];
    scene.value?.setPeriod(p);
  }
);

onMounted(() => {
  const el = stageEl.value;
  if (!el) return;
  preloadObserver = new IntersectionObserver(
    (entries) => {
      if (loading || !entries.some((e) => e.isIntersecting)) return;
      preloadObserver?.disconnect();
      void load();
    },
    { rootMargin: "100% 0px" }
  );
  viewObserver = new IntersectionObserver(
    (entries) => {
      const e = entries[entries.length - 1];
      inView = e.isIntersecting;
      syncRunning();
    },
    { threshold: [0, 0.25] }
  );
  preloadObserver.observe(el);
  viewObserver.observe(el);
  document.addEventListener("visibilitychange", syncRunning);
});

onActivated(syncRunning);
onDeactivated(() => scene.value?.pause());

onBeforeUnmount(() => {
  unmounted = true;
  if (toastTimer !== null) window.clearTimeout(toastTimer);
  preloadObserver?.disconnect();
  viewObserver?.disconnect();
  document.removeEventListener("visibilitychange", syncRunning);
  scene.value?.dispose();
  scene.value = null;
});
</script>

<style scoped lang="scss">
@use "../styles/shared";

.island-tour__stage {
  position: relative;
  height: 580px;
  border-radius: 28px;
  overflow: hidden;
}

.island-tour__canvas {
  position: absolute;
  inset: 0;
}

.island-tour__placeholder {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(255, 254, 246, 0.55);
  color: var(--ai-text);
  font-weight: 800;
}

.island-tour__clock-pill {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 5;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(255, 254, 246, 0.9);
  border: 2px solid var(--ai-outline);
  border-radius: 999px;
  box-shadow: 0 3px 0 0 var(--ai-btn-shadow);
  color: var(--ai-text);
}

.island-tour__clock-time {
  min-width: 40px;
  font-size: 12px;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
}

.island-tour__clock-slider {
  width: 96px;
  accent-color: var(--ai-primary);
  cursor: pointer;
}

.island-tour__clock-reset {
  width: 20px;
  height: 20px;
  padding: 0;
  border: 1.5px solid var(--ai-outline);
  border-radius: 50%;
  background: var(--ai-btn-face);
  color: var(--ai-text);
  font-size: 11px;
  font-weight: 900;
  line-height: 1;
  cursor: pointer;
}

.island-tour__toolbar {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 5;
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
}

.island-tour__pill-btn {
  padding: 6px 12px;
  border: 2px solid var(--ai-outline);
  border-radius: 999px;
  background: rgba(255, 254, 246, 0.9);
  box-shadow: 0 3px 0 0 var(--ai-btn-shadow);
  color: var(--ai-text);
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.1;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    border-color 0.15s ease,
    background 0.15s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: var(--ai-primary);
  }
}

.island-tour__pill-btn--on {
  background: #e6f9f6;
  border-color: var(--ai-primary);
  color: var(--ai-primary-active);
}

.island-tour__pins {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
}

.island-tour__pin {
  position: absolute;
  top: 0;
  left: 0;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border: 2px solid var(--ai-outline);
  border-radius: 999px;
  background: rgba(255, 254, 246, 0.92);
  box-shadow: 0 3px 0 0 var(--ai-btn-shadow);
  color: var(--ai-text);
  font-family: inherit;
  font-size: 12px;
  font-weight: 900;
  white-space: nowrap;
  cursor: pointer;
  transition:
    opacity 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease;

  &:hover {
    border-color: var(--ai-primary);
    background: #e9fbf8;
  }
}

.island-tour__pin--on {
  border-color: var(--ai-primary);
  background: #e6f9f6;
  color: var(--ai-primary-active);
}

.island-tour__pin-ico {
  font-size: 13px;
  line-height: 1;
}

.island-tour__card {
  position: absolute;
  right: 20px;
  bottom: 20px;
  z-index: 6;
  width: min(334px, calc(100% - 40px));
  padding: 16px 18px;
  background: var(--ai-btn-face);
  border: 3px solid var(--ai-outline);
  border-radius: 22px;
  box-shadow: 0 6px 0 0 var(--ai-btn-shadow);
  color: var(--ai-text);
}

.island-tour__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.island-tour__card-badge {
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.8px;
  color: var(--ai-primary-active);
}

.island-tour__card-close {
  width: 24px;
  height: 24px;
  padding: 0;
  border: 1.5px solid var(--ai-outline);
  border-radius: 50%;
  background: transparent;
  color: var(--ai-text-2);
  font-size: 11px;
  font-weight: 900;
  cursor: pointer;
}

.island-tour__card-name {
  font-size: 19px;
  font-weight: 900;
}

.island-tour__card-intro {
  margin: 6px 0 10px;
  color: var(--ai-text-2);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.6;
}

.island-tour__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.island-tour__chip {
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(25, 200, 185, 0.12);
  color: var(--ai-primary-active);
  font-size: 12px;
  font-weight: 800;
}

.island-tour__card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.island-tour__toast {
  position: absolute;
  bottom: 18px;
  left: 50%;
  z-index: 7;
  padding: 8px 16px;
  border: 2px solid var(--ai-outline);
  border-radius: 999px;
  background: var(--ai-btn-face);
  box-shadow: 0 4px 0 0 var(--ai-btn-shadow);
  color: var(--ai-text);
  font-size: 12px;
  font-weight: 900;
  white-space: nowrap;
  transform: translateX(-50%);
}

// 夜间模式适配：直接命中父级状态类（见 lessons l72）
.home-page--night .island-tour__clock-pill,
.home-page--night .island-tour__pill-btn,
.home-page--night .island-tour__pin {
  background: rgba(24, 35, 70, 0.9);
  color: var(--ai-text);
}

.home-page--night .island-tour__pill-btn--on,
.home-page--night .island-tour__pin--on {
  background: rgba(44, 64, 118, 0.95);
  color: var(--ai-primary);
}

.home-page--night .island-tour__placeholder {
  background: rgba(21, 30, 63, 0.55);
}

.island-tour-card-enter-active,
.island-tour-card-leave-active {
  transition:
    opacity 240ms ease,
    transform 240ms ease;
}

.island-tour-card-enter-from,
.island-tour-card-leave-to {
  opacity: 0;
  transform: translateX(20px) scale(0.96);
}

.island-tour-toast-enter-active,
.island-tour-toast-leave-active {
  transition:
    opacity 200ms ease,
    transform 200ms ease;
}

.island-tour-toast-enter-from,
.island-tour-toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px);
}

@media (max-width: 767px) {
  .island-tour__stage {
    height: 440px;
  }

  .island-tour__clock-pill {
    top: 10px;
    left: 10px;
    padding: 5px 10px;
  }

  .island-tour__clock-slider {
    width: 68px;
  }

  .island-tour__toolbar {
    top: 48px;
    right: 10px;
    left: 10px;
    justify-content: flex-start;
  }

  .island-tour__pill-btn {
    padding: 5px 9px;
    font-size: 11px;
  }

  .island-tour__card {
    right: 12px;
    bottom: 12px;
    left: 12px;
    width: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .island-tour-card-enter-active,
  .island-tour-card-leave-active,
  .island-tour-toast-enter-active,
  .island-tour-toast-leave-active,
  .island-tour__pin,
  .island-tour__pill-btn {
    transition: none;
  }
}
</style>
