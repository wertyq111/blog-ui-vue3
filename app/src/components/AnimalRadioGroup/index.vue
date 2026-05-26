<template>
  <div
    class="arg"
    :class="{ 'arg--vertical': direction === 'vertical', 'arg--disabled': disabled }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide } from "vue";
import { ANIMAL_RADIO_GROUP_KEY, type RadioValue } from "./context";

const props = withDefaults(
  defineProps<{
    direction?: "horizontal" | "vertical";
    disabled?: boolean;
  }>(),
  { direction: "horizontal", disabled: false }
);

const model = defineModel<RadioValue>();
const emit = defineEmits<{ change: [value: RadioValue] }>();

provide(ANIMAL_RADIO_GROUP_KEY, {
  get value() {
    return model.value;
  },
  get disabled() {
    return props.disabled;
  },
  change(v) {
    model.value = v;
    emit("change", v);
  },
});
</script>

<style scoped lang="scss">
.arg {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  align-items: center;
}
.arg--vertical {
  flex-direction: column;
  align-items: flex-start;
}
.arg--disabled {
  opacity: 0.6;
}
</style>
