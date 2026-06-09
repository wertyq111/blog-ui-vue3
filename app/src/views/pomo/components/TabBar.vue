<script setup lang="ts">
import { Memo, Timer } from "@element-plus/icons-vue";

type TabKey = "tasks" | "timer";
defineProps<{ active: TabKey }>();
defineEmits<{ change: [tab: TabKey] }>();

const tabs = [
  { key: "tasks", icon: Memo, label: "提醒清单" },
  { key: "timer", icon: Timer, label: "番茄钟" },
] as const;
</script>

<template>
  <nav class="tab-bar">
    <button
      v-for="t in tabs"
      :key="t.key"
      class="tab"
      :class="{ active: active === t.key }"
      @click="$emit('change', t.key)"
    >
      <component :is="t.icon" class="tab-ico" />
      <span class="label">{{ t.label }}</span>
    </button>
  </nav>
</template>

<style scoped lang="scss">
@use "../styles/vars" as *;

.tab-bar {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $space-sm;
  padding: $space-sm;
  border-top: 2px solid rgba($border-light, 0.86);
  background: rgba($bg-secondary, 0.86);
}

.tab {
  min-width: 0;
  min-height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 8px;
  border: none;
  border-radius: $radius-pill;
  background: transparent;
  color: $text-secondary;
  font-family: $font;
  font-size: 16px;
  font-weight: 900;
  cursor: pointer;
  transition: all $motion-base $motion-ease;

  .tab-ico {
    width: 21px;
    height: 21px;
  }

  &:hover:not(.active) {
    background: rgba($primary, 0.12);
    color: $text;
  }

  &.active {
    background: $primary;
    color: #fff;
    box-shadow: 0 4px 0 0 $primary-active;
    transform: translateY(-1px);
  }
}

@media (max-height: 780px) {
  .tab {
    min-height: 48px;
    font-size: 14px;
  }
}
</style>
