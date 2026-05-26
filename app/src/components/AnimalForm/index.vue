<template>
  <form
    ref="formRef"
    class="afm"
    :class="[`afm--label-${labelPosition}`, { 'afm--inline': inline }]"
    @submit.prevent
  >
    <slot />
  </form>
</template>

<script setup lang="ts">
import { nextTick, onMounted, provide, ref, watch } from "vue";
import {
  ANIMAL_FORM_KEY,
  type AnimalFormContext,
  type FormItemContext,
  type FormRules,
} from "./context";

const props = withDefaults(
  defineProps<{
    model: Record<string, any>;
    rules?: FormRules;
    labelWidth?: string | number;
    labelPosition?: "right" | "left" | "top";
    inline?: boolean;
    disabled?: boolean;
    size?: string;
  }>(),
  {
    rules: undefined,
    labelWidth: "",
    labelPosition: "right",
    inline: false,
    disabled: false,
    size: undefined,
  }
);

const formRef = ref<HTMLElement>();
const fields: FormItemContext[] = [];
const fieldCount = ref(0);

function normalizeWidth(w: string | number): string {
  if (w === "" || w == null) return "";
  if (w === "auto") return "auto";
  return typeof w === "number" ? `${w}px` : w;
}

const resolvedLabelWidth = ref(normalizeWidth(props.labelWidth));

function recalcAutoWidth(): void {
  if (props.labelWidth !== "auto") {
    resolvedLabelWidth.value = normalizeWidth(props.labelWidth);
    return;
  }
  nextTick(() => {
    const labels = formRef.value?.querySelectorAll<HTMLElement>(".afi__label");
    let max = 0;
    labels?.forEach((l) => {
      // 临时去掉宽度限制测量真实内容宽度
      const prev = l.style.width;
      l.style.width = "auto";
      if (l.scrollWidth > max) max = l.scrollWidth;
      l.style.width = prev;
    });
    if (max > 0) resolvedLabelWidth.value = `${max + 4}px`;
  });
}

function addField(field: FormItemContext): void {
  fields.push(field);
  fieldCount.value++;
}
function removeField(field: FormItemContext): void {
  const idx = fields.indexOf(field);
  if (idx > -1) {
    fields.splice(idx, 1);
    fieldCount.value--;
  }
}

const context: AnimalFormContext = {
  get model() {
    return props.model;
  },
  get rules() {
    return props.rules;
  },
  get disabled() {
    return props.disabled;
  },
  get labelPosition() {
    return props.labelPosition;
  },
  get inline() {
    return props.inline;
  },
  get resolvedLabelWidth() {
    return resolvedLabelWidth.value;
  },
  addField,
  removeField,
};
provide(ANIMAL_FORM_KEY, context);

onMounted(recalcAutoWidth);
watch([fieldCount, () => props.labelWidth], recalcAutoWidth);

async function validate(
  callback?: (valid: boolean, invalidFields?: Record<string, unknown>) => void
): Promise<boolean> {
  const targets = fields.filter((f) => f.prop);
  const results = await Promise.all(targets.map((f) => f.validate("")));
  const valid = results.every(Boolean);
  if (callback) {
    callback(valid);
    return valid;
  }
  if (valid) return true;
  return Promise.reject(new Error("表单校验未通过"));
}

function validateField(
  propsArg?: string | string[],
  callback?: (valid: boolean) => void
): Promise<boolean> {
  const list = propsArg ? (Array.isArray(propsArg) ? propsArg : [propsArg]) : undefined;
  const targets = fields.filter((f) => f.prop && (!list || list.includes(f.prop)));
  return Promise.all(targets.map((f) => f.validate(""))).then((rs) => {
    const valid = rs.every(Boolean);
    callback?.(valid);
    return valid;
  });
}

function resetFields(): void {
  fields.forEach((f) => f.resetField());
}

function clearValidate(): void {
  fields.forEach((f) => f.clearValidate());
}

defineExpose({ validate, validateField, resetFields, clearValidate });
</script>

<style scoped lang="scss">
.afm--inline {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
}
.afm--inline :deep(.afi) {
  display: inline-flex;
  margin-right: 16px;
}
</style>
