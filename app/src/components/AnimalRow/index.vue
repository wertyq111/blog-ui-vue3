<template>
  <div class="aro" :style="rowStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, provide } from "vue";
import { ANIMAL_ROW_KEY } from "./context";

const props = withDefaults(defineProps<{ gutter?: number }>(), { gutter: 0 });

provide(ANIMAL_ROW_KEY, {
  get gutter() {
    return props.gutter;
  },
});

const rowStyle = computed(() =>
  props.gutter
    ? { marginRight: `-${props.gutter / 2}px`, marginLeft: `-${props.gutter / 2}px` }
    : {}
);
</script>

<style scoped lang="scss">
.aro {
  display: flex;
  flex-wrap: wrap;
}
</style>
