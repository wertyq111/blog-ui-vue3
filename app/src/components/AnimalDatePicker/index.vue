<!-- 动森风日期选择：薄封装 el-date-picker，皮肤在 styles/vendors/_element-plus.scss -->
<template>
  <el-date-picker
    v-model="model"
    class="animal-date"
    :type="type"
    :placeholder="placeholder"
    start-placeholder="开始日期"
    end-placeholder="结束日期"
    range-separator="至"
    :value-format="valueFormat"
    :clearable="clearable"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";

defineOptions({ name: "AnimalDatePicker", inheritAttrs: false });

// el-date-picker 的 model 类型随 type 变化（单值/数组），统一用 any 透传
const props = withDefaults(
  defineProps<{
    modelValue?: any;
    type?: "date" | "daterange" | "month" | "year" | "datetime" | "week";
    placeholder?: string;
    valueFormat?: string;
    clearable?: boolean;
  }>(),
  {
    modelValue: null,
    type: "date",
    placeholder: "请选择",
    valueFormat: undefined,
    clearable: true,
  }
);

const emit = defineEmits<{ "update:modelValue": [value: any] }>();

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});
</script>
