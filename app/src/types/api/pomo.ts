/** 番茄钟任务（后端 camelCase 输出） */
export interface PomoTask {
  id: number;
  title: string;
  estimatedPomos: number;
  completedPomos: number;
  done: number; // 0/1
  sort: number;
}

/** 新增/编辑任务表单 */
export interface PomoTaskForm {
  title: string;
  estimatedPomos: number;
}

/** 番茄钟设置（后端 camelCase 输出） */
export interface PomoSettings {
  focusMin: number;
  shortBreakMin: number;
  longBreakMin: number;
  longBreakEvery: number;
  autoStartNext: boolean;
  soundOn: boolean;
  whiteNoise: string | null;
  whiteNoiseVolume: number;
}

/** 近 7 天统计项 */
export interface PomoWeekItem {
  day: string; // YYYY-MM-DD
  count: number;
}
