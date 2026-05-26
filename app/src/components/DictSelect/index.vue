<template>
  <Select
    v-if="type === 'select'"
    v-model="selectModel"
    :placeholder="placeholder"
    :disabled="disabled"
    :options="selectOptions"
    :style="style"
  />

  <AnimalRadioGroup
    v-else-if="type === 'radio'"
    v-model="radioModel"
    :disabled="disabled"
    :style="style"
  >
    <AnimalRadio
      v-for="option in options"
      :key="option.value"
      :value="option.value"
      :label="option.label"
    />
  </AnimalRadioGroup>

  <Checkbox
    v-else-if="type === 'checkbox'"
    v-model="checkboxModel"
    :disabled="disabled"
    :options="checkboxOptions"
    :style="style"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { Checkbox, Select } from "animal-island-vue";
import AnimalRadioGroup from "@/components/AnimalRadioGroup/index.vue";
import AnimalRadio from "@/components/AnimalRadio/index.vue";
import { useDictStore } from "@/store";

const dictStore = useDictStore();

const props = withDefaults(
  defineProps<{
    code: string;
    modelValue?: string | number | Array<string | number>;
    type?: "select" | "radio" | "checkbox";
    placeholder?: string;
    disabled?: boolean;
    style?: Record<string, string>;
  }>(),
  {
    modelValue: undefined,
    type: "select",
    placeholder: "请选择",
    disabled: false,
    style: () => ({ width: "300px" }),
  }
);

const emit = defineEmits<{ "update:modelValue": [value: any] }>();

const options = ref<Array<{ label: string; value: string | number }>>([]);

// 单选下拉：animal Select 仅接受 string，做 string↔原值转换
const selectOptions = computed(() =>
  options.value.map((o) => ({ key: String(o.value), label: o.label }))
);
const selectModel = computed<string>({
  get: () => (props.modelValue == null ? "" : String(props.modelValue)),
  set: (key) => {
    const opt = options.value.find((o) => String(o.value) === key);
    emit("update:modelValue", opt ? opt.value : key);
  },
});

// 单选 radio
const radioModel = computed({
  get: () => props.modelValue as string | number,
  set: (v) => emit("update:modelValue", v),
});

// 多选 checkbox
const checkboxOptions = computed(() =>
  options.value.map((o) => ({ label: o.label, value: o.value }))
);
const checkboxModel = computed<Array<string | number>>({
  get: () => (Array.isArray(props.modelValue) ? props.modelValue : []),
  set: (v) => emit("update:modelValue", v),
});

onMounted(async () => {
  await dictStore.loadDictItems(props.code);
  options.value = dictStore.getDictItems(props.code);
});
</script>
