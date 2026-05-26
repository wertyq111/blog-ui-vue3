<template>
  <label
    class="ard"
    :class="{ 'ard--checked': checked, 'ard--disabled': isDisabled }"
    @click="select"
  >
    <span class="ard__dot">
      <span v-if="checked" class="ard__inner" />
    </span>
    <span class="ard__label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed, inject } from "vue";
import { ANIMAL_RADIO_GROUP_KEY, type RadioValue } from "@/components/AnimalRadioGroup/context";

const props = withDefaults(
  defineProps<{
    value: RadioValue;
    label?: string;
    disabled?: boolean;
  }>(),
  { label: undefined, disabled: false }
);

// 独立使用（无 group）时支持 v-model
const model = defineModel<RadioValue>();
const group = inject(ANIMAL_RADIO_GROUP_KEY, null);

const checked = computed(() => (group ? group.value === props.value : model.value === props.value));
const isDisabled = computed(() => props.disabled || (group?.disabled ?? false));

function select(): void {
  if (isDisabled.value) return;
  if (group) group.change(props.value);
  else model.value = props.value;
}

defineExpose({ select });
</script>

<style scoped lang="scss">
.ard {
  display: inline-flex;
  gap: 7px;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: #794f27;
  cursor: pointer;
  user-select: none;
}
.ard__dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: #fdfbf7;
  border: 2px solid #e0d6c3;
  border-radius: 50%;
  transition: all 0.18s;
}
.ard:hover .ard__dot {
  border-color: #f0c068;
}
.ard--checked .ard__dot {
  border-color: #6fba2c;
}
.ard__inner {
  width: 8px;
  height: 8px;
  background: #6fba2c;
  border-radius: 50%;
  animation: ard-pop 0.18s ease-out;
}
.ard--disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
@keyframes ard-pop {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}
</style>
