<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: "primary" | "default";
    size?: "sm" | "md";
    tone?: "mint" | "tomato";
    disabled?: boolean;
  }>(),
  { type: "default", size: "md", tone: "mint", disabled: false }
);
defineEmits<{ click: [e: MouseEvent] }>();
</script>

<template>
  <button
    class="fox-btn"
    :class="[`type-${type}`, `size-${size}`, `tone-${tone}`]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<style scoped lang="scss">
@use "sass:color";
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
    min-width: 128px;
    min-height: 52px;
    padding: 12px 28px;
    font-size: 18px;
    font-weight: 900;
  }
  &.size-sm {
    min-height: 40px;
    padding: 8px 18px;
    font-size: 14px;
  }

  // 游戏按键 3D 立体感
  &.type-default {
    background: $bg-input;
    color: $text;
    box-shadow: 0 5px 0 0 $shadow-soft;
  }
  &.type-primary {
    background: $primary;
    box-shadow: 0 5px 0 0 $primary-active;
  }
  &.type-primary.tone-tomato {
    background: $tomato;
    box-shadow: 0 5px 0 0 color.adjust($tomato, $lightness: -10%);
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
  &.type-primary.tone-tomato:hover:not(:disabled) {
    background: color.adjust($tomato, $lightness: 4%);
    box-shadow: 0 6px 0 0 color.adjust($tomato, $lightness: -10%);
  }

  // 按下下沉
  &:active:not(:disabled) {
    transform: translateY(4px);
  }
  &.type-default:active:not(:disabled) {
    box-shadow: 0 1px 0 0 $shadow-soft;
  }
  &.type-primary:active:not(:disabled) {
    box-shadow: 0 1px 0 0 $primary-active;
  }
  &.type-primary.tone-tomato:active:not(:disabled) {
    box-shadow: 0 1px 0 0 color.adjust($tomato, $lightness: -10%);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
