<template>
  <div
    class="afi"
    :class="{
      'afi--error': !!error,
      'afi--required': isRequired,
      'afi--top': labelPosition === 'top',
      'afi--left': labelPosition === 'left',
    }"
  >
    <label v-if="hasLabel" class="afi__label" :style="labelStyle">
      <slot name="label">{{ label }}</slot>
    </label>
    <div class="afi__content">
      <slot />
      <transition name="afi-err">
        <div v-if="error" class="afi__error">{{ error }}</div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, useSlots, watch } from "vue";
import cloneDeep from "lodash-es/cloneDeep";
import Schema from "async-validator";
import {
  ANIMAL_FORM_KEY,
  type FormItemContext,
  type FormRule,
} from "@/components/AnimalForm/context";

const props = withDefaults(
  defineProps<{
    prop?: string;
    label?: string;
    labelWidth?: string | number;
    required?: boolean;
    rules?: FormRule | FormRule[];
  }>(),
  {
    prop: undefined,
    label: undefined,
    labelWidth: undefined,
    required: undefined,
    rules: undefined,
  }
);

const slots = useSlots();
const form = inject(ANIMAL_FORM_KEY, null);
const error = ref("");
const validated = ref(false);
let initialValue: unknown;

const labelPosition = computed(() => form?.labelPosition ?? "right");
const hasLabel = computed(() => !!props.label || !!slots.label);

function normalizeWidth(w: string | number): string {
  return typeof w === "number" ? `${w}px` : w;
}
const labelStyle = computed(() => {
  if (labelPosition.value === "top") return {};
  const w =
    props.labelWidth != null && props.labelWidth !== ""
      ? normalizeWidth(props.labelWidth)
      : (form?.resolvedLabelWidth ?? "");
  return w && w !== "" ? { width: w } : {};
});

// 取/设嵌套属性（支持 a.b.c 路径，主要为扁平 prop）
function getByPath(obj: Record<string, any>, path: string): unknown {
  return path.split(".").reduce<any>((o, k) => (o == null ? o : o[k]), obj);
}
function setByPath(obj: Record<string, any>, path: string, value: unknown): void {
  const keys = path.split(".");
  const last = keys.pop()!;
  const target = keys.reduce<any>((o, k) => (o[k] ??= {}), obj);
  target[last] = value;
}

function getValue(): unknown {
  if (!form || !props.prop) return undefined;
  return getByPath(form.model, props.prop);
}

function collectRules(): FormRule[] {
  const list: FormRule[] = [];
  const own = props.rules;
  if (own) list.push(...(Array.isArray(own) ? own : [own]));
  if (form?.rules && props.prop) {
    const r = form.rules[props.prop];
    if (r) list.push(...(Array.isArray(r) ? r : [r]));
  }
  if (props.required && !list.some((r) => r.required)) {
    list.unshift({ required: true, message: `${props.label ?? ""}不能为空` });
  }
  return list;
}

const isRequired = computed(() => props.required || collectRules().some((r) => r.required));

function filterByTrigger(rules: FormRule[], trigger: string): FormRule[] {
  if (!trigger) return rules;
  return rules.filter((r) => {
    if (!r.trigger) return true;
    return Array.isArray(r.trigger) ? r.trigger.includes(trigger) : r.trigger === trigger;
  });
}

async function validate(trigger = ""): Promise<boolean> {
  if (!props.prop) return true;
  const rules = filterByTrigger(collectRules(), trigger);
  if (!rules.length) {
    error.value = "";
    return true;
  }
  const validator = new Schema({ [props.prop]: rules as any });
  try {
    await validator.validate({ [props.prop]: getValue() }, { firstFields: true });
    error.value = "";
    validated.value = true;
    return true;
  } catch (err: any) {
    error.value = err?.errors?.[0]?.message ?? "校验未通过";
    validated.value = true;
    return false;
  }
}

function resetField(): void {
  if (form && props.prop) setByPath(form.model, props.prop, cloneDeep(initialValue));
  error.value = "";
  validated.value = false;
}

function clearValidate(): void {
  error.value = "";
  validated.value = false;
}

// 值变化后（已校验过）实时复验
watch(getValue, () => {
  if (validated.value) validate("change");
});

const context: FormItemContext = {
  get prop() {
    return props.prop;
  },
  validate,
  resetField,
  clearValidate,
};

onMounted(() => {
  initialValue = cloneDeep(getValue());
  form?.addField(context);
});
onBeforeUnmount(() => form?.removeField(context));

defineExpose({ validate, resetField, clearValidate });
</script>

<style scoped lang="scss">
.afi {
  display: flex;
  margin-bottom: 18px;
}
.afi--top {
  flex-direction: column;
}
.afi__label {
  flex-shrink: 0;
  padding-right: 12px;
  font-size: 14px;
  font-weight: 700;
  line-height: 40px;
  color: #794f27;
  text-align: right;
  white-space: nowrap;
}
.afi--top .afi__label,
.afi--left .afi__label {
  padding-right: 0;
  text-align: left;
}
.afi--top .afi__label {
  line-height: 1.6;
  margin-bottom: 6px;
}
.afi--required .afi__label::before {
  margin-right: 4px;
  color: #fc736d;
  content: "*";
}
.afi__content {
  position: relative;
  flex: 1;
  min-width: 0;
}
.afi__error {
  padding-top: 2px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
  color: #fc736d;
}
.afi-err-enter-active,
.afi-err-leave-active {
  transition: all 0.18s ease;
}
.afi-err-enter-from,
.afi-err-leave-to {
  opacity: 0;
  transform: translateY(-3px);
}
</style>
