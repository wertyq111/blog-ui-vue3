<template>
  <span
    ref="referenceRef"
    class="atip__trigger"
    @mouseenter="open"
    @mouseleave="close"
    @focusin="open"
    @focusout="close"
  >
    <slot />
  </span>
  <Teleport to="body">
    <transition name="atip-fade">
      <div
        v-if="visible && !disabled"
        ref="floatingRef"
        class="atip"
        :style="floatingStyles"
        role="tooltip"
        @mouseenter="open"
        @mouseleave="close"
      >
        <slot name="content">{{ content }}</slot>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { autoUpdate, flip, offset, shift, useFloating } from "@floating-ui/vue";

const props = withDefaults(
  defineProps<{
    content?: string;
    placement?: "top" | "bottom" | "left" | "right";
    disabled?: boolean;
  }>(),
  { content: "", placement: "top", disabled: false }
);

const referenceRef = ref<HTMLElement>();
const floatingRef = ref<HTMLElement>();
const visible = ref(false);
let timer: number | undefined;

const { floatingStyles } = useFloating(referenceRef, floatingRef, {
  placement: props.placement,
  middleware: [offset(8), flip(), shift({ padding: 8 })],
  whileElementsMounted: autoUpdate,
});

function open(): void {
  window.clearTimeout(timer);
  visible.value = true;
}
function close(): void {
  timer = window.setTimeout(() => (visible.value = false), 100);
}
</script>

<style scoped lang="scss">
.atip__trigger {
  display: inline-flex;
  align-items: center;
}
.atip {
  z-index: 3100;
  max-width: 260px;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.5;
  color: #794f27;
  background: #fdfbf7;
  border: 1.5px solid #e8e2d6;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(121, 79, 39, 0.12);
}
.atip-fade-enter-active,
.atip-fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.atip-fade-enter-from,
.atip-fade-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
