<script setup lang="ts">
import { computed } from "vue";

type Mode = "focus" | "shortBreak" | "longBreak";

const props = defineProps<{ remaining: number; total: number; mode: Mode }>();

const R = 86;
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
    <!-- 类名用 dial-ring，勿用 ring（撞 UnoCSS ring 工具类会注入蓝色阴影框） -->
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
      <span class="mini-tomato" />
      <div class="time">{{ mmss }}</div>
      <div class="label" :class="mode">{{ label }}</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "../styles/vars" as *;

.dial {
  position: relative;
  width: 210px;
  height: 210px;
}

.dial-ring {
  width: 100%;
  height: 100%;
}

.track {
  fill: none;
  stroke: rgba($tomato, 0.12);
  stroke-width: 13;
}

.progress {
  fill: none;
  stroke-width: 13;
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
  inset: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 50% 38%, rgba(255, 255, 255, 0.78), transparent 44%),
    rgba(255, 249, 233, 0.72);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.5);
}

.mini-tomato {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.7) 0 4px, transparent 5px),
    linear-gradient(145deg, #ff937c 0%, $tomato 54%, #d94b45 100%);
  box-shadow: inset -2px -3px 0 rgba(133, 46, 35, 0.14);
}

.time {
  font-size: 41px;
  font-weight: 900;
  color: $text;
  letter-spacing: 0;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.label {
  font-size: 15px;
  font-weight: 900;
  &.focus {
    color: $tomato;
  }
  &.shortBreak,
  &.longBreak {
    color: $rest-orange;
  }
}

@media (max-height: 780px) {
  .dial {
    width: 196px;
    height: 196px;
  }

  .time {
    font-size: 38px;
  }
}
</style>
