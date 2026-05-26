<!-- 表格内紧凑日期选择：复用 AnimalDatePicker(纯自建),仅做紧凑样式与逾期态 -->
<template>
  <div class="atdp" :class="{ 'atdp--overdue': isOverdue }">
    <AnimalDatePicker
      :model-value="modelValue || ''"
      type="date"
      :value-format="valueFormat"
      :clearable="clearable"
      :placeholder="placeholder"
      @update:model-value="onUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import AnimalDatePicker from "@/components/AnimalDatePicker/index.vue";

defineOptions({ name: "AnimalTableDatePicker", inheritAttrs: false });

withDefaults(
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

function onUpdate(val: string | string[] | null): void {
  const res = (typeof val === "string" ? val : null) || null;
  emit("update:modelValue", res);
  emit("change", res);
}
</script>

<style scoped lang="scss">
.atdp {
  display: inline-flex;
  width: 130px;
}
.atdp :deep(.adp__trigger) {
  min-height: 28px;
  padding: 0 8px;
  background-color: rgba(25, 200, 185, 0.04);
}
.atdp :deep(.adp__text) {
  font-size: 12px;
  font-weight: 700;
}
.atdp :deep(.adp__icon) {
  width: 13px;
  height: 13px;
}
.atdp--overdue :deep(.adp__trigger) {
  border-color: rgba(252, 115, 109, 0.35);
  background-color: rgba(252, 115, 109, 0.06);
}
.atdp--overdue :deep(.adp__text),
.atdp--overdue :deep(.adp__icon) {
  color: #fc736d;
}
.atdp--overdue :deep(.adp__trigger:hover) {
  border-color: #fc736d;
  background-color: rgba(252, 115, 109, 0.1);
}
</style>
