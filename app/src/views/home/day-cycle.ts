import { computed, onMounted, onUnmounted, ref } from "vue";
import { useScrollProgress } from "@/composables";

export type TimePeriod = "morning" | "afternoon" | "sunset" | "night";

// 视频是一条 19.63s 的连续镜头：清晨 → 正午 → 黄昏 → 星夜。
const VIDEO_DURATION = 19.63;
// 各时段在视频时间轴上的上界（秒），由逐帧取样定出
const PHASE_END = { morning: 4.5, afternoon: 12.6, sunset: 16.4 };
// 昼夜开关按下后，把擦洗范围钳在对应时段内，滚动仍能在区间里推进
const PINNED_RANGE = { day: [4.5, 9.0], night: [16.8, 19.5] } as const;

const periodFromVideoTime = (t: number): TimePeriod => {
  if (t < PHASE_END.morning) return "morning";
  if (t < PHASE_END.afternoon) return "afternoon";
  if (t < PHASE_END.sunset) return "sunset";
  return "night";
};

/** 首页一日推移：本机时钟、昼夜开关、视频画面三者合成当前时段 */
export function useDayCycle() {
  const scrollProgress = useScrollProgress();
  const videoActive = ref(false); // 视频是否已就绪并接管背景

  // 时钟推导出的时段
  const autoTimePeriod = ref<TimePeriod>("afternoon");
  // 昼夜开关的手动覆盖；null = 跟随本机时间。刷新页面即回到跟随。
  const manualDayNight = ref<"day" | "night" | null>(null);
  // 页面实际生效的时段：手动开关 > 视频画面 > 本机时钟。
  // 视频接管时必须由画面反推时段，否则滚到底会出现「夜景背景 + 昼间卡片」。
  const currentTimePeriod = computed<TimePeriod>(() => {
    if (manualDayNight.value === "day") return "afternoon";
    if (manualDayNight.value === "night") return "night";
    if (videoActive.value) return periodFromVideoTime(VIDEO_DURATION * scrollProgress.value);
    return autoTimePeriod.value;
  });
  const formattedTime = ref("");
  let clockTimer: ReturnType<typeof setInterval> | null = null;

  const timePeriodName = computed(() => {
    const map: Record<string, string> = {
      morning: "清晨",
      afternoon: "白天",
      sunset: "黄昏",
      night: "星夜",
    };
    return map[currentTimePeriod.value] || "白天";
  });

  const timePeriodIcon = computed(() => {
    const map: Record<string, string> = {
      morning: "🌅",
      afternoon: "☀️",
      sunset: "🌇",
      night: "🌌",
    };
    return map[currentTimePeriod.value] || "☀️";
  });

  const updateClock = () => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    formattedTime.value = `${hh}:${mm}`;

    const hour = d.getHours();
    if (hour >= 5 && hour < 8) {
      autoTimePeriod.value = "morning";
    } else if (hour >= 8 && hour < 17) {
      autoTimePeriod.value = "afternoon";
    } else if (hour >= 17 && hour < 19) {
      autoTimePeriod.value = "sunset";
    } else {
      autoTimePeriod.value = "night";
    }
  };

  /* ---- 昼夜开关 ---- */
  const isNightView = computed(() => currentTimePeriod.value === "night");

  const dayNightTitle = computed(() => {
    const source = manualDayNight.value === null ? "跟随本机时间" : "手动";
    return `昼夜切换：当前 ${timePeriodName.value}（${source}）`;
  });

  // 视频的重新擦洗由 ScrubVideoBackground 监听 time 变化触发
  const toggleDayNight = () => {
    manualDayNight.value = isNightView.value ? "day" : "night";
  };

  // 视频目标时间：钉住时在对应区间里按滚动推进，否则铺满整条时间轴
  const targetVideoTime = computed(() => {
    const p = scrollProgress.value;
    const pinned = manualDayNight.value ? PINNED_RANGE[manualDayNight.value] : null;
    if (pinned) return pinned[0] + (pinned[1] - pinned[0]) * p;
    return VIDEO_DURATION * p;
  });

  onMounted(() => {
    updateClock();
    clockTimer = setInterval(updateClock, 1000);
  });

  onUnmounted(() => {
    if (clockTimer) clearInterval(clockTimer);
  });

  return {
    videoActive,
    currentTimePeriod,
    timePeriodName,
    timePeriodIcon,
    formattedTime,
    isNightView,
    dayNightTitle,
    toggleDayNight,
    targetVideoTime,
  };
}
