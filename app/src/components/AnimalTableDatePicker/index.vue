<template>
  <div
    class="animal-table-date-picker"
    :class="{
      'is-overdue': isOverdue,
      'is-empty': !modelValue,
      'is-active': isOpened,
    }"
  >
    <!-- 动森风格的展示层 -->
    <div class="animal-date-display">
      <svg
        class="calendar-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
      >
        <rect x="3" y="4" width="18" height="18" rx="4" ry="4" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
      <span class="date-text">{{ modelValue || placeholder }}</span>
    </div>

    <!-- 顶层覆盖透明的真实 Element 日期选择器 -->
    <el-date-picker
      v-model="model"
      type="date"
      :value-format="valueFormat"
      :clearable="clearable"
      class="real-picker-overlay"
      placeholder="选择日期"
      popper-class="animal-datepicker-popper"
      v-bind="$attrs"
      @visible-change="handleVisibleChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

defineOptions({
  name: "AnimalTableDatePicker",
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    modelValue: string | null | undefined;
    placeholder?: string;
    valueFormat?: string;
    clearable?: boolean;
    isOverdue?: boolean;
  }>(),
  {
    placeholder: "选择日期",
    valueFormat: "YYYY-MM-DD",
    clearable: true,
    isOverdue: false,
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: string | null];
  change: [value: string | null];
}>();

const isOpened = ref(false);

const model = computed({
  get: () => props.modelValue || "",
  set: (val) => {
    const res = val || null;
    emit("update:modelValue", res);
    emit("change", res);
  },
});

function handleVisibleChange(visible: boolean): void {
  isOpened.value = visible;
}
</script>

<style lang="scss" scoped>
.animal-table-date-picker {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 130px;
  height: 28px;
  border-radius: 8px;
  background-color: rgba(25, 200, 185, 0.04);
  border: 1.5px solid var(--ai-border, var(--ai-border));
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
  overflow: hidden;

  &.is-active,
  &:focus-within,
  &:hover {
    border-color: var(--ai-primary, var(--ai-primary));
    background-color: rgba(25, 200, 185, 0.08);
    box-shadow: 0 0 0 2px rgba(25, 200, 185, 0.08);
  }

  &.is-empty {
    color: var(--ai-text-3, var(--ai-text-3));
    background-color: rgba(0, 0, 0, 0.01);
  }

  &.is-overdue {
    border-color: rgba(252, 115, 109, 0.35);
    background-color: rgba(252, 115, 109, 0.06);

    .date-text,
    .calendar-icon {
      color: var(--ai-red, var(--ai-red));
      font-weight: 700;
    }

    &.is-active,
    &:focus-within,
    &:hover {
      border-color: var(--ai-red, var(--ai-red));
      background-color: rgba(252, 115, 109, 0.1);
      box-shadow: 0 0 0 2px rgba(252, 115, 109, 0.1);
    }
  }
}

.animal-date-display {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0 10px;
  pointer-events: none; // 让点击直接穿透到下层的 el-date-picker
  z-index: 1;

  .calendar-icon {
    width: 13px;
    height: 13px;
    margin-right: 6px;
    color: var(--ai-text-2, var(--ai-text-2));
  }

  .date-text {
    flex: 1;
    font-size: 12px;
    font-weight: 700;
    color: var(--ai-text, var(--ai-text));
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

/* 将底层的日期选择框完全透明化并置于最顶层以拦截交互 */
:deep(.real-picker-overlay) {
  position: absolute !important;
  left: 0 !important;
  top: 0 !important;
  width: 100% !important;
  height: 100% !important;
  opacity: 0 !important;
  z-index: 2 !important;
  cursor: pointer !important;

  .el-input__wrapper {
    width: 100% !important;
    height: 100% !important;
    padding: 0 !important;
    cursor: pointer !important;
  }

  .el-input__inner {
    cursor: pointer !important;
  }
}
</style>
