<script setup lang="ts">
import { computed } from "vue";
import { Check, VideoPlay, Close } from "@element-plus/icons-vue";
import type { PomoTask } from "@/types/api/pomo";

const props = defineProps<{ task: PomoTask; active?: boolean }>();
defineEmits<{ toggle: []; remove: []; select: [] }>();

const dots = computed(() => {
  const total = Math.max(props.task.estimatedPomos, props.task.completedPomos);
  return Array.from({ length: total }, (_, i) => i < props.task.completedPomos);
});
</script>

<template>
  <div class="task-row" :class="{ done: task.done, active }">
    <button class="check" :class="{ on: task.done }" aria-label="完成任务" @click="$emit('toggle')">
      <Check v-if="task.done" class="ico" />
    </button>

    <button class="body" @click="$emit('select')">
      <span class="title">{{ task.title }}</span>
      <span class="pomos">
        <span v-for="(filled, i) in dots" :key="i" class="dot" :class="{ filled }" />
        <span class="count">{{ task.completedPomos }}/{{ task.estimatedPomos }}</span>
      </span>
    </button>

    <button
      v-if="!task.done"
      class="start"
      title="开始番茄"
      aria-label="开始番茄"
      @click="$emit('select')"
    >
      <VideoPlay class="ico" />
    </button>
    <button class="del" title="删除" aria-label="删除" @click="$emit('remove')">
      <Close class="ico" />
    </button>
  </div>
</template>

<style scoped lang="scss">
@use "../styles/vars" as *;

.task-row {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) 34px 28px;
  align-items: center;
  gap: $space-md;
  min-height: 82px;
  padding: 12px 14px;
  border-bottom: 1px solid rgba($shadow-soft, 0.78);
  transition: background $motion-base $motion-ease;

  &:last-child {
    border-bottom: none;
  }

  &.active {
    background: rgba($primary-bg, 0.68);
  }

  &.done {
    opacity: 0.56;
  }
}

.check,
.start,
.del,
.body {
  border: none;
  font: inherit;
  cursor: pointer;
}

.ico {
  width: 18px;
  height: 18px;
}

.check {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid $border-hover;
  border-radius: 50%;
  background: #fffdf3;
  color: #fff;
  transition: all $motion-fast $motion-ease;

  &.on {
    border-color: $success;
    background: $success;
  }
}

.body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 0;
  background: transparent;
  text-align: left;
}

.title {
  max-width: 100%;
  color: $text;
  font-size: 18px;
  font-weight: 900;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  .done & {
    text-decoration: line-through;
  }
}

.pomos {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 34% 30%, rgba(255, 255, 255, 0.68) 0 2px, transparent 3px),
    linear-gradient(145deg, #ffc6b6, #d9cec0);
  opacity: 0.66;

  &.filled {
    background:
      radial-gradient(circle at 34% 30%, rgba(255, 255, 255, 0.76) 0 2px, transparent 3px),
      linear-gradient(145deg, #ff8a76, $tomato 58%, #d94b45);
    opacity: 1;
  }
}

.count {
  margin-left: 4px;
  color: $text-secondary;
  font-size: 13px;
  font-weight: 800;
}

.start,
.del {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all $motion-fast $motion-ease;
}

.start {
  width: 34px;
  height: 34px;
  background: $primary;
  color: #fff;
  box-shadow: 0 3px 0 0 $primary-active;

  &:active {
    transform: translateY(2px);
    box-shadow: none;
  }
}

.del {
  width: 28px;
  height: 28px;
  background: transparent;
  color: $text-disabled;

  &:hover {
    color: $error;
  }
}

@media (max-width: 360px) {
  .task-row {
    grid-template-columns: 30px minmax(0, 1fr) 32px 26px;
    gap: $space-sm;
    padding-inline: 12px;
  }

  .title {
    font-size: 16px;
  }
}
</style>
