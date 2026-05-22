<template>
  <span class="ai-tag" :class="`ai-tag--${type}`">
    <span v-if="dot" class="ai-tag__dot" />
    <slot />
  </span>
</template>

<script setup lang="ts">
export type AnimalTagType = "primary" | "success" | "info" | "warning" | "danger" | "default";

withDefaults(
  defineProps<{
    type?: AnimalTagType;
    dot?: boolean;
  }>(),
  {
    type: "default",
    dot: false,
  }
);
</script>

<style lang="scss" scoped>
.ai-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 12px;
  border: 1.5px solid;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.5;
  white-space: nowrap;
}

.ai-tag__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.ai-tag--primary {
  color: #3a78d4;
  background: #e9efff;
  border-color: #b4c8ee;
}

.ai-tag--success {
  color: var(--ai-success, #6fba2c);
  background: rgba(111, 186, 44, 0.12);
  border-color: rgba(111, 186, 44, 0.4);
}

.ai-tag--warning {
  color: #e3a008;
  background: rgba(227, 160, 8, 0.12);
  border-color: rgba(227, 160, 8, 0.4);
}

.ai-tag--danger {
  color: var(--ai-red, #fc736d);
  background: rgba(252, 115, 109, 0.12);
  border-color: rgba(252, 115, 109, 0.4);
}

.ai-tag--info,
.ai-tag--default {
  color: var(--ai-text-2, #9f927d);
  background: rgba(0, 0, 0, 0.03);
  border-color: var(--ai-border, #e8e2d6);
}
</style>
