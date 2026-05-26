<template>
  <div class="aco" :style="colStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from "vue";
import { ANIMAL_ROW_KEY } from "@/components/AnimalRow/context";

const props = withDefaults(
  defineProps<{
    span?: number;
    offset?: number;
  }>(),
  { span: 24, offset: 0 }
);

const row = inject(ANIMAL_ROW_KEY, null);

const colStyle = computed(() => {
  const gutter = row?.gutter ?? 0;
  const style: Record<string, string> = {
    width: `${(props.span / 24) * 100}%`,
    maxWidth: `${(props.span / 24) * 100}%`,
    flex: `0 0 ${(props.span / 24) * 100}%`,
  };
  if (gutter) {
    style.paddingRight = `${gutter / 2}px`;
    style.paddingLeft = `${gutter / 2}px`;
  }
  if (props.offset) {
    style.marginLeft = `${(props.offset / 24) * 100}%`;
  }
  return style;
});
</script>

<style scoped lang="scss">
.aco {
  box-sizing: border-box;
}
</style>
