import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
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

// 计时态本地持久化（仅同设备恢复，时间戳算法保证刷新后 remaining 自动算对）
const TIMER_KEY = "pomo:timer";
interface TimerSnapshot {
  mode: Mode;
  status: Status;
  startedAt: number | null;
  pausedRemaining: number | null;
  linkedTaskId: number | null;
  completedFocusInCycle: number;
}
function readTimerSnapshot(): Partial<TimerSnapshot> {
  try {
    return JSON.parse(localStorage.getItem(TIMER_KEY) || "null") || {};
  } catch {
    return {};
  }
}

export const usePomoStore = defineStore("pomo", () => {
  // settings/tasks/week 是否已从后端拉回，未就绪前不判定计时完成（防默认时长误判）
  const ready = ref(false);

  // ---------- 设置 ----------
  const settings = ref<PomoSettings>({ ...DEFAULT_SETTINGS });

  async function loadSettings() {
    const data = await PomoAPI.getSettings();
    if (data) settings.value = { ...DEFAULT_SETTINGS, ...data };
    ready.value = true;
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

  // ---------- 计时（本地时间戳算法，状态持久化到 localStorage） ----------
  const snap = readTimerSnapshot();
  const mode = ref<Mode>(snap.mode ?? "focus");
  const status = ref<Status>(snap.status ?? "idle");
  const startedAt = ref<number | null>(snap.startedAt ?? null);
  const pausedRemaining = ref<number | null>(snap.pausedRemaining ?? null);
  const linkedTaskId = ref<number | null>(snap.linkedTaskId ?? null);
  const completedFocusInCycle = ref<number>(snap.completedFocusInCycle ?? 0);
  const completionTick = ref(0); // 仅运行时信号，不持久化
  const lastCompletedMode = ref<Mode | null>(null);
  const now = ref(Date.now());

  // 计时态变化即落盘（不监听 now，避免每 250ms 写一次）
  watch(
    [mode, status, startedAt, pausedRemaining, linkedTaskId, completedFocusInCycle],
    () => {
      try {
        localStorage.setItem(
          TIMER_KEY,
          JSON.stringify({
            mode: mode.value,
            status: status.value,
            startedAt: startedAt.value,
            pausedRemaining: pausedRemaining.value,
            linkedTaskId: linkedTaskId.value,
            completedFocusInCycle: completedFocusInCycle.value,
          })
        );
      } catch {
        /* localStorage 不可用（隐私模式等）则忽略 */
      }
    }
  );

  function elapsed(): number {
    return startedAt.value == null ? 0 : Math.floor((now.value - startedAt.value) / 1000);
  }

  const remaining = computed(() => {
    if (status.value === "paused" && pausedRemaining.value != null) return pausedRemaining.value;
    return Math.max(0, durationSec(mode.value) - elapsed());
  });

  function tick() {
    now.value = Date.now();
    if (!ready.value) return; // 设置未拉回前不判定完成，避免用默认时长误判
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
