<!-- 首页 3D 小岛导览 -->
<template>
  <section v-if="!failed" class="section island-tour">
    <div class="section-head">
      <div>
        <div class="section-eyebrow">TOUR · 小岛导览</div>
        <h2 class="section-title">小岛导览 (Island Tour)</h2>
      </div>
      <p class="section-sub">拖动小岛四处看看，点一下建筑走近它；按住 Ctrl 再滚动滚轮可以缩放。</p>
    </div>

    <!-- 未按 Ctrl 的滚轮在捕获阶段拦下，不让它到达画布，页面照常滚动 -->
    <div ref="stageEl" class="island-tour__stage" @wheel.capture.passive="onWheel">
      <div ref="canvasHost" class="island-tour__canvas"></div>
      <div v-if="!ready" class="island-tour__placeholder">小岛正在浮出水面…</div>

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
          <div class="island-tour__card-name">{{ activeZone.name }}</div>
          <p class="island-tour__card-intro">{{ activeZone.intro }}</p>
          <div class="island-tour__chips">
            <span v-for="f in activeZone.features" :key="f" class="island-tour__chip">{{ f }}</span>
          </div>
          <button
            type="button"
            class="btn-ai btn-ai-primary btn-ai-sm"
            @click="emit('go', activeZone.path)"
          >
            <span class="btn-ai-finger"></span>
            <span class="btn-ai-text">去看看 →</span>
          </button>
        </div>
      </Transition>

      <div class="island-tour__dots">
        <button
          v-for="z in zones"
          :key="z.key"
          type="button"
          class="island-tour__dot"
          :class="{ 'island-tour__dot--on': z.key === activeKey }"
          :title="z.name"
          :aria-label="'查看' + z.name"
          @click="scene?.focusZone(z.key)"
        ></button>
        <button
          v-if="!reducedMotion"
          type="button"
          class="island-tour__play"
          :aria-label="playing ? '暂停巡游' : '继续巡游'"
          @click="togglePlay"
        >
          {{ playing ? "❚❚" : "▶" }}
        </button>
      </div>
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
} from "vue";
import type { TimePeriod } from "../day-cycle";
import { zones, type ZoneKey } from "./island-tour/zones";
import type { IslandScene } from "./island-tour/scene";

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
const playing = ref(!reducedMotion);
const activeZone = computed(() => zones.find((z) => z.key === activeKey.value) ?? null);

let inView = false;
let tourStarted = false;
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
      reducedMotion,
      mobile: window.matchMedia("(max-width: 767px)").matches,
      onZoneChange: (key) => {
        activeKey.value = key;
      },
    });
    ready.value = true;
    if (tourStarted) scene.value.setAutoplay(playing.value);
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
  if (tourStarted) scene.value?.setAutoplay(playing.value);
};

watch(
  () => props.period,
  (p) => scene.value?.setPeriod(p)
);

onMounted(() => {
  const el = stageEl.value;
  if (!el) return;
  // 距视口约一屏时才加载 three
  preloadObserver = new IntersectionObserver(
    (entries) => {
      if (loading || !entries.some((e) => e.isIntersecting)) return;
      preloadObserver?.disconnect();
      void load();
    },
    { rootMargin: "100% 0px" }
  );
  // 进入视口一半以上才开始巡游；离开视口停止渲染
  viewObserver = new IntersectionObserver(
    (entries) => {
      const e = entries[entries.length - 1];
      inView = e.isIntersecting;
      if (e.intersectionRatio >= 0.5 && !tourStarted) {
        tourStarted = true;
        scene.value?.setAutoplay(playing.value);
      }
      syncRunning();
    },
    { threshold: [0, 0.5] }
  );
  preloadObserver.observe(el);
  viewObserver.observe(el);
  document.addEventListener("visibilitychange", syncRunning);
});

onActivated(syncRunning);
onDeactivated(() => scene.value?.pause());

onBeforeUnmount(() => {
  unmounted = true;
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
  height: 560px;
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

.island-tour__card {
  position: absolute;
  left: 24px;
  bottom: 64px;
  width: min(320px, calc(100% - 48px));
  padding: 16px 18px;
  background: var(--ai-btn-face);
  border: 3px solid var(--ai-outline);
  border-radius: 22px;
  box-shadow: 0 6px 0 0 var(--ai-btn-shadow);
  color: var(--ai-text);
}

.island-tour__card-name {
  font-size: 20px;
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

.island-tour__dots {
  position: absolute;
  left: 50%;
  bottom: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  transform: translateX(-50%);
}

.island-tour__dot {
  width: 12px;
  height: 12px;
  padding: 0;
  border: 2px solid var(--ai-outline);
  border-radius: 50%;
  background: var(--ai-btn-face);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.2s ease;
}

.island-tour__dot--on {
  background: var(--ai-primary);
  transform: scale(1.25);
}

.island-tour__play {
  width: 28px;
  height: 28px;
  padding: 0;
  border: 2px solid var(--ai-outline);
  border-radius: 50%;
  background: var(--ai-btn-face);
  color: var(--ai-text);
  font-size: 11px;
  font-weight: 900;
  cursor: pointer;
}

// 卡片进出：位移按卡片尺寸（约 320px）取 16px，参见 lessons l08
.island-tour-card-enter-active,
.island-tour-card-leave-active {
  transition:
    opacity 260ms ease,
    transform 260ms ease;
}

.island-tour-card-enter-from,
.island-tour-card-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.96);
}

@media (max-width: 767px) {
  .island-tour__stage {
    height: 420px;
  }

  .island-tour__card {
    left: 12px;
    right: 12px;
    bottom: 56px;
    width: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .island-tour-card-enter-active,
  .island-tour-card-leave-active,
  .island-tour__dot {
    transition: none;
  }
}
</style>
