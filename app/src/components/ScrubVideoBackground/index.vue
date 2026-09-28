<!-- 滚动擦洗视频背景 -->
<template>
  <video
    v-if="eligible"
    ref="videoEl"
    class="scrub-video"
    :class="{ 'scrub-video--ready': active }"
    :src="src"
    :poster="poster"
    muted
    playsinline
    preload="auto"
    @loadeddata="onReady"
    @error="onFail"
  ></video>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";

defineOptions({ name: "ScrubVideoBackground" });

// 视频从不 play，只在 rAF 里把 currentTime 追到 time（秒）。
// time 怎么从滚动进度换算由使用方决定，本组件不关心时段。
const props = defineProps<{ src: string; poster: string; time: number }>();
// 视频是否已就绪并接管画面
const active = defineModel<boolean>("active", { required: true });

const videoEl = ref<HTMLVideoElement | null>(null);
const eligible = ref(false); // 设备是否够格加载视频

let rafId = 0;
let seekedTime = 0; // 已写进 video 的时间，用来做插值和去重

// 滚动事件里只记目标值，真正写 currentTime 放到 rAF：
// 滚轮是离散跳变，直接写会让画面一格一格蹦。
const ensureTicking = () => {
  if (!rafId) rafId = requestAnimationFrame(tick);
};

// 追到目标就停，不做常驻空转——多数时间页面是静止的，
// 120fps 空跑一个 rAF 只是白耗电。time 变化会把它重新唤醒。
const tick = () => {
  rafId = 0;
  const v = videoEl.value;
  if (!v || v.readyState < 2) {
    ensureTicking();
    return;
  }
  const target = props.time;
  seekedTime += (target - seekedTime) * 0.12;
  const settled = Math.abs(target - seekedTime) < 0.004;
  if (settled) seekedTime = target;
  // 上一次 seek 没完成就不要再写：rAF 有 120fps，浏览器完不成那么多次 seek，
  // 每次写都会打断在途的那次，结果画面反而卡在几秒前。靠 v.seeking 自然限流。
  const drifted = Math.abs(v.currentTime - seekedTime) > 1 / 30;
  if (!v.seeking && drifted) v.currentTime = seekedTime;
  if (!settled || v.seeking || drifted) ensureTicking();
};

const onReady = () => {
  active.value = true;
  seekedTime = props.time;
  ensureTicking();
};

// 加载失败就让出画面，由使用方的替身背景接管，不做别的补救
const onFail = () => {
  eligible.value = false;
  active.value = false;
};

watch(() => props.time, ensureTicking);

onMounted(() => {
  // 窄屏 / 触摸设备 / 降低动态偏好一律不加载视频，省流量也省解码
  eligible.value =
    window.matchMedia("(min-width: 768px)").matches &&
    window.matchMedia("(hover: hover)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
});

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = 0;
});
</script>

<style scoped lang="scss">
// 定位上下文由使用方的容器提供
.scrub-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  opacity: 0;
  transition: opacity 600ms ease;
}

.scrub-video--ready {
  opacity: 1;
}
</style>
