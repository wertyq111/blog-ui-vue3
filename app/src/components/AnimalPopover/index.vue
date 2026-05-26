<template>
  <span
    ref="referenceRef"
    class="apop__trigger"
    @click="onTriggerClick"
    @mouseenter="onHoverEnter"
    @mouseleave="onHoverLeave"
  >
    <slot name="reference" />
  </span>
  <Teleport to="body">
    <transition name="apop-fade">
      <div
        v-if="visible"
        ref="floatingRef"
        class="apop"
        :style="[
          floatingStyles,
          width ? { width: typeof width === 'number' ? `${width}px` : width } : {},
        ]"
        @mouseenter="onHoverEnter"
        @mouseleave="onHoverLeave"
      >
        <slot />
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onClickOutside } from "@vueuse/core";
import { autoUpdate, flip, offset, shift, useFloating } from "@floating-ui/vue";

const props = withDefaults(
  defineProps<{
    trigger?: "click" | "hover";
    placement?: "top" | "bottom" | "left" | "right";
    width?: string | number;
  }>(),
  { trigger: "click", placement: "bottom", width: undefined }
);

const visible = defineModel<boolean>("visible", { default: false });
const referenceRef = ref<HTMLElement>();
const floatingRef = ref<HTMLElement>();
let hoverTimer: number | undefined;

const { floatingStyles } = useFloating(referenceRef, floatingRef, {
  placement: props.placement,
  middleware: [offset(8), flip(), shift({ padding: 8 })],
  whileElementsMounted: autoUpdate,
});

function onTriggerClick(): void {
  if (props.trigger === "click") visible.value = !visible.value;
}
function onHoverEnter(): void {
  if (props.trigger !== "hover") return;
  window.clearTimeout(hoverTimer);
  visible.value = true;
}
function onHoverLeave(): void {
  if (props.trigger !== "hover") return;
  hoverTimer = window.setTimeout(() => (visible.value = false), 120);
}

onClickOutside(
  floatingRef,
  () => {
    if (props.trigger === "click") visible.value = false;
  },
  { ignore: [referenceRef] }
);
</script>

<style scoped lang="scss">
.apop__trigger {
  display: inline-flex;
}
.apop {
  z-index: 3000;
  min-width: 150px;
  padding: 10px 12px;
  background: #fdfbf7;
  border: 2px solid #e8e2d6;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(121, 79, 39, 0.12);
}
.apop-fade-enter-active,
.apop-fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.apop-fade-enter-from,
.apop-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
