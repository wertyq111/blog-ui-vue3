<script setup lang="ts">
import { computed } from "vue";
import type { PomoTask } from "@/types/api/pomo";

const props = defineProps<{ task: PomoTask; active?: boolean }>();
defineEmits<{ toggle: []; remove: []; select: [] }>();

// 番茄进度点：已完成实心 + 预估空心，至少显示预估个数
const dots = computed(() => {
  const total = Math.max(props.task.estimatedPomos, props.task.completedPomos);
  return Array.from({ length: total }, (_, i) => i < props.task.completedPomos);
});
</script>

<template>
  <div class="card" :class="{ done: task.done, active }">
    <button class="check" :class="{ on: task.done }" @click="$emit('toggle')">
      <span v-if="task.done">✓</span>
    </button>

    <div class="body" @click="$emit('select')">
      <div class="title">{{ task.title }}</div>
      <div class="dots">
        <span v-for="(filled, i) in dots" :key="i" class="dot" :class="{ filled }">🍅</span>
        <span class="count">{{ task.completedPomos }}/{{ task.estimatedPomos }}</span>
      </div>
    </div>

    <button v-if="!task.done" class="start" title="开始番茄" @click="$emit('select')">▶</button>
    <button class="del" title="删除" @click="$emit('remove')">✕</button>
  </div>
</template>

<style scoped lang="scss">
@use "../styles/vars" as *;
.card {
  display: flex;
  align-items: center;
  gap: $space-md;
  padding: $space-md;
  background: $bg-input;
  border: 2px solid $border-light;
  border-radius: $radius-base;
  box-shadow: 0 3px 0 0 $shadow-soft;
  transition: all $motion-base $motion-ease;

  &.active {
    border-color: $primary;
    box-shadow: 0 3px 0 0 $primary-active;
  }
  &.done {
    opacity: 0.55;
  }
}

.check {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid $border-hover;
  background: #fff;
  color: #fff;
  font-weight: 900;
  cursor: pointer;
  transition: all $motion-fast $motion-ease;
  &.on {
    background: $success;
    border-color: $success;
  }
}

.body {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}
.title {
  font-weight: 700;
  font-size: 15px;
  color: $text;
  .done & {
    text-decoration: line-through;
  }
}
.dots {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-top: 4px;
  flex-wrap: wrap;
}
.dot {
  font-size: 12px;
  filter: grayscale(1);
  opacity: 0.4;
  &.filled {
    filter: none;
    opacity: 1;
  }
}
.count {
  margin-left: 6px;
  font-size: 12px;
  font-weight: 700;
  color: $text-secondary;
}

.start,
.del {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  font-weight: 900;
  transition: all $motion-fast $motion-ease;
}
.start {
  background: $primary;
  color: #fff;
  box-shadow: 0 2px 0 0 $primary-active;
  &:active {
    transform: translateY(2px);
    box-shadow: none;
  }
}
.del {
  background: transparent;
  color: $text-disabled;
  font-size: 13px;
  &:hover {
    color: $error;
  }
}
</style>
