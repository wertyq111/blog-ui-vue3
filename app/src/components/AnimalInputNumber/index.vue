<template>
  <div class="ain" :class="{ 'ain--disabled': disabled, 'ain--no-controls': !controls }">
    <button
      v-if="controls"
      type="button"
      class="ain__btn ain__btn--minus"
      :disabled="disabled || atMin"
      @click="step(-1)"
    >
      −
    </button>
    <input
      ref="inputRef"
      class="ain__input"
      :value="display"
      :placeholder="placeholder"
      :disabled="disabled"
      inputmode="decimal"
      @input="onInput"
      @blur="onBlur"
    />
    <button
      v-if="controls"
      type="button"
      class="ain__btn ain__btn--plus"
      :disabled="disabled || atMax"
      @click="step(1)"
    >
      +
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

const props = withDefaults(
  defineProps<{
    min?: number;
    max?: number;
    step?: number;
    precision?: number;
    controls?: boolean;
    placeholder?: string;
    disabled?: boolean;
  }>(),
  {
    min: -Infinity,
    max: Infinity,
    step: 1,
    precision: undefined,
    controls: true,
    placeholder: "请输入",
    disabled: false,
  }
);

const model = defineModel<number | null>();
const emit = defineEmits<{ change: [value: number | null] }>();
const inputRef = ref<HTMLInputElement>();

const display = computed(() =>
  model.value === null || model.value === undefined ? "" : String(model.value)
);
const atMin = computed(() => model.value != null && model.value <= props.min);
const atMax = computed(() => model.value != null && model.value >= props.max);

function clamp(v: number): number {
  let n = Math.min(props.max, Math.max(props.min, v));
  if (props.precision != null) n = Number(n.toFixed(props.precision));
  return n;
}

function setValue(v: number | null): void {
  model.value = v;
  emit("change", v);
}

function onInput(e: Event): void {
  const raw = (e.target as HTMLInputElement).value.trim();
  if (raw === "" || raw === "-") {
    setValue(null);
    return;
  }
  const n = Number(raw);
  if (!Number.isNaN(n)) setValue(n);
}

function onBlur(): void {
  if (model.value === null || model.value === undefined) return;
  setValue(clamp(model.value));
}

function step(dir: number): void {
  if (props.disabled) return;
  const base = model.value ?? 0;
  setValue(clamp(base + dir * props.step));
}
</script>

<style scoped lang="scss">
.ain {
  display: inline-flex;
  align-items: stretch;
  width: 100%;
  overflow: hidden;
  background: #fdfbf7;
  border: 1.5px solid #e8e2d6;
  border-radius: 14px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.88);
  transition: all 0.2s;
}
.ain:hover {
  border-color: #f0d49a;
}
.ain:focus-within {
  border-color: #fca130;
}
.ain--disabled {
  cursor: not-allowed;
  background: #f5f5f0;
  opacity: 0.6;
}
.ain__input {
  flex: 1;
  width: 100%;
  min-width: 0;
  padding: 0 12px;
  font-size: 14px;
  font-weight: 600;
  line-height: 38px;
  color: #794f27;
  text-align: left;
  background: transparent;
  border: none;
  outline: none;
}
.ain__btn {
  flex-shrink: 0;
  width: 34px;
  font-size: 18px;
  font-weight: 700;
  color: #a0855c;
  cursor: pointer;
  background: #f4ecdd;
  border: none;
  transition: all 0.15s;
}
.ain__btn:hover:not(:disabled) {
  color: #fff;
  background: #fca130;
}
.ain__btn:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}
.ain__btn--minus {
  border-right: 1.5px solid #e8e2d6;
}
.ain__btn--plus {
  border-left: 1.5px solid #e8e2d6;
}
</style>
