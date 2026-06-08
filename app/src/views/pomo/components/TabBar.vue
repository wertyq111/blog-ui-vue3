<script setup lang="ts">
type TabKey = "tasks" | "timer";
defineProps<{ active: TabKey }>();
defineEmits<{ change: [tab: TabKey] }>();

const tabs: { key: TabKey; icon: string; label: string }[] = [
  { key: "tasks", icon: "📋", label: "提醒清单" },
  { key: "timer", icon: "🍅", label: "番茄钟" },
];
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
      <span class="icon">{{ t.icon }}</span>
      <span class="label">{{ t.label }}</span>
    </button>
  </nav>
</template>

<style scoped lang="scss">
@use "../styles/vars" as *;
.tab-bar {
  display: flex;
  gap: $space-sm;
  padding: $space-sm;
  background: $bg-secondary;
  border-top: 2px solid $border-light;
}

.tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 8px;
  border: none;
  border-radius: $radius-pill;
  background: transparent;
  color: $text-secondary;
  font-family: $font;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all $motion-base $motion-ease;

  .icon {
    font-size: 18px;
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
</style>
