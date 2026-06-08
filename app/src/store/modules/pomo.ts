import { defineStore } from "pinia";
import { ref, computed } from "vue";
import PomoAPI from "@/api/develop/pomo";
import type { PomoTask, PomoSettings, PomoWeekItem } from "@/types/api/pomo";

type Mode = "focus" | "shortBreak" | "longBreak";
type Status = "idle" | "running" | "paused";

const DEFAULT_SETTINGS: PomoSettings = {
  focusMin: 25,
  shortBreakMin: 5,
  longBreakMin: 15,
  longBreakEvery: 4,
  autoStartNext: false,
  soundOn: true,
  whiteNoise: null,
  whiteNoiseVolume: 0.6,
};

export const usePomoStore = defineStore("pomo", () => {
  // ---------- 设置 ----------
  const settings = ref<PomoSettings>({ ...DEFAULT_SETTINGS });

  async function loadSettings() {
    const data = await PomoAPI.getSettings();
    if (data) settings.value = { ...DEFAULT_SETTINGS, ...data };
  }

  async function saveSettings() {
    await PomoAPI.saveSettings(settings.value);
  }

  function durationSec(m: Mode): number {
    const min =
      m === "focus"
        ? settings.value.focusMin
        : m === "shortBreak"
          ? settings.value.shortBreakMin
          : settings.value.longBreakMin;
    return min * 60;
  }

  // ---------- 任务 ----------
  const tasks = ref<PomoTask[]>([]);

  async function loadTasks() {
    tasks.value = await PomoAPI.getTasks();
  }

  async function addTask(title: string, estimatedPomos = 1) {
    const t = await PomoAPI.addTask({ title, estimatedPomos });
    if (t) tasks.value.unshift(t);
  }

  async function toggleDone(id: number) {
    const t = await PomoAPI.toggleDone(id);
    const idx = tasks.value.findIndex((x) => x.id === id);
    if (idx >= 0 && t) tasks.value[idx] = t;
  }

  async function removeTask(id: number) {
    await PomoAPI.deleteTask(id);
    tasks.value = tasks.value.filter((x) => x.id !== id);
    if (linkedTaskId.value === id) linkedTaskId.value = null;
  }

  // ---------- 统计 ----------
  const week = ref<PomoWeekItem[]>([]);

  async function loadWeek() {
    week.value = (await PomoAPI.getWeek()) ?? [];
  }

  // ---------- 计时（本地时间戳算法） ----------
  const mode = ref<Mode>("focus");
  const status = ref<Status>("idle");
  const startedAt = ref<number | null>(null);
  const pausedRemaining = ref<number | null>(null);
  const linkedTaskId = ref<number | null>(null);
  const completedFocusInCycle = ref(0);
  const completionTick = ref(0);
  const lastCompletedMode = ref<Mode | null>(null);
  const now = ref(Date.now());

  function elapsed(): number {
    return startedAt.value == null ? 0 : Math.floor((now.value - startedAt.value) / 1000);
  }

  const remaining = computed(() => {
    if (status.value === "paused" && pausedRemaining.value != null) return pausedRemaining.value;
    return Math.max(0, durationSec(mode.value) - elapsed());
  });

  function tick() {
    now.value = Date.now();
    if (status.value === "running" && elapsed() >= durationSec(mode.value)) complete();
  }

  function start() {
    status.value = "running";
    startedAt.value = Date.now();
    pausedRemaining.value = null;
    now.value = Date.now();
  }

  function pause() {
    if (status.value === "running") {
      pausedRemaining.value = remaining.value;
      status.value = "paused";
    }
  }

  function resume() {
    if (status.value === "paused" && pausedRemaining.value != null) {
      const total = durationSec(mode.value);
      startedAt.value = Date.now() - (total - pausedRemaining.value) * 1000;
      status.value = "running";
      pausedRemaining.value = null;
      now.value = Date.now();
    }
  }

  function nextMode(): Mode {
    if (mode.value !== "focus") return "focus";
    return completedFocusInCycle.value % settings.value.longBreakEvery === 0
      ? "longBreak"
      : "shortBreak";
  }

  function complete() {
    const finished = mode.value;
    if (finished === "focus") {
      completedFocusInCycle.value++;
      // 落库：写完成段 + 关联任务番茄+1（服务端一步完成），随后刷新
      const taskId = linkedTaskId.value ?? 0;
      PomoAPI.storeSession(taskId)
        .then(() => Promise.all([loadTasks(), loadWeek()]))
        .catch(() => {
          /* 失败静默，不阻塞计时切换 */
        });
    }
    lastCompletedMode.value = finished;
    completionTick.value++;
    mode.value = nextMode();
    status.value = "idle";
    startedAt.value = null;
    pausedRemaining.value = null;
    if (settings.value.autoStartNext) start();
  }

  function skip() {
    complete();
  }

  function reset() {
    status.value = "idle";
    startedAt.value = null;
    pausedRemaining.value = null;
  }

  function linkTask(id: number | null) {
    linkedTaskId.value = id;
  }

  const currentTask = computed(
    () => tasks.value.find((t) => t.id === linkedTaskId.value) ?? null
  );

  async function init() {
    await Promise.all([loadSettings(), loadTasks(), loadWeek()]);
  }

  return {
    settings,
    tasks,
    week,
    mode,
    status,
    startedAt,
    linkedTaskId,
    completedFocusInCycle,
    completionTick,
    lastCompletedMode,
    remaining,
    currentTask,
    durationSec,
    loadSettings,
    saveSettings,
    loadTasks,
    addTask,
    toggleDone,
    removeTask,
    loadWeek,
    tick,
    start,
    pause,
    resume,
    skip,
    reset,
    linkTask,
    init,
    complete,
  };
});
