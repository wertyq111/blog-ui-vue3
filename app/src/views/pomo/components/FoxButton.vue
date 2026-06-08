<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: "primary" | "default";
    size?: "sm" | "md";
    disabled?: boolean;
  }>(),
  { type: "default", size: "md", disabled: false }
);
defineEmits<{ click: [e: MouseEvent] }>();
</script>

<template>
  <button
    class="fox-btn"
    :class="[`type-${type}`, `size-${size}`]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<style scoped lang="scss">
@use "../styles/vars" as *;
.fox-btn {
  font-family: $font;
  font-weight: 700;
  letter-spacing: 0.02em;
  border: none;
  border-radius: $radius-pill;
  cursor: pointer;
  transition: all $motion-fast $motion-ease;
  color: #fff;

  &.size-md {
    padding: 12px 28px;
    font-size: 16px;
  }
  &.size-sm {
    padding: 8px 18px;
    font-size: 14px;
  }

  &.type-default {
    background: $bg-input;
    color: $text;
    box-shadow: 0 5px 0 0 $shadow-soft;
  }
  &.type-primary {
    background: $primary;
    box-shadow: 0 5px 0 0 $primary-active;
  }

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }
  &.type-default:hover:not(:disabled) {
    box-shadow: 0 6px 0 0 $shadow-soft;
  }
  &.type-primary:hover:not(:disabled) {
    background: $primary-hover;
    box-shadow: 0 6px 0 0 $primary-active;
  }

  &:active:not(:disabled) {
    transform: translateY(4px);
  }
  &.type-default:active:not(:disabled) {
    box-shadow: 0 1px 0 0 $shadow-soft;
  }
  &.type-primary:active:not(:disabled) {
    box-shadow: 0 1px 0 0 $primary-active;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
