<script setup lang="ts">
import { computed } from "vue";

type Mode = "focus" | "shortBreak" | "longBreak";

const props = defineProps<{ remaining: number; total: number; mode: Mode }>();

const R = 88;
const C = 2 * Math.PI * R;

// 剩余越少环越空（倒计时耗尽）
const offset = computed(() => {
  const frac = props.total > 0 ? Math.min(1, Math.max(0, props.remaining / props.total)) : 0;
  return C * (1 - frac);
});

const mmss = computed(() => {
  const safe = Math.max(0, props.remaining);
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
});

const label = computed(() =>
  props.mode === "focus" ? "专注中" : props.mode === "shortBreak" ? "短休息" : "长休息"
);
</script>

<template>
  <div class="dial">
    <svg viewBox="0 0 200 200" class="dial-ring">
      <circle class="track" cx="100" cy="100" :r="R" />
      <circle
        class="progress"
        :class="mode"
        cx="100"
        cy="100"
        :r="R"
        :stroke-dasharray="C"
        :stroke-dashoffset="offset"
        transform="rotate(-90 100 100)"
      />
    </svg>
    <div class="center">
      <div class="time">{{ mmss }}</div>
      <div class="label" :class="mode">{{ label }}</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "../styles/vars" as *;
.dial {
  position: relative;
  width: 200px;
  height: 200px;
}

// 注意：类名不要用 "ring"——会撞 UnoCSS 的 ring 工具类（生成蓝色环形 box-shadow）
.dial-ring {
  width: 100%;
  height: 100%;
}

.track {
  fill: none;
  stroke: $border-light;
  stroke-width: 14;
}

.progress {
  fill: none;
  stroke-width: 14;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s linear;

  &.focus {
    stroke: $tomato;
  }
  &.shortBreak,
  &.longBreak {
    stroke: $rest-orange;
  }
}

.center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.time {
  font-size: 40px;
  font-weight: 900;
  color: $text;
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
}

.label {
  font-size: 15px;
  font-weight: 700;
  &.focus {
    color: $tomato;
  }
  &.shortBreak,
  &.longBreak {
    color: $rest-orange;
  }
}
</style>
