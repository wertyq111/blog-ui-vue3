/**
 * AnimalForm 上下文 —— 在 AnimalForm 与 AnimalFormItem 之间共享。
 */
import type { InjectionKey } from "vue";
import type { RuleItem } from "async-validator";

/** 单条校验规则，对齐 async-validator / Element Plus FormItemRule */
export type FormRule = RuleItem & { trigger?: string | string[] };
/** 表单规则集合：prop -> 规则 */
export type FormRules = Record<string, FormRule | FormRule[]>;

export interface FormItemContext {
  prop?: string;
  validate: (trigger?: string) => Promise<boolean>;
  resetField: () => void;
  clearValidate: () => void;
}

export interface AnimalFormContext {
  model: Record<string, any>;
  rules?: FormRules;
  disabled: boolean;
  labelPosition: "right" | "left" | "top";
  inline: boolean;
  /** 解析后的标签宽度（px 字符串或 'auto'） */
  resolvedLabelWidth: string;
  addField: (field: FormItemContext) => void;
  removeField: (field: FormItemContext) => void;
}

export const ANIMAL_FORM_KEY: InjectionKey<AnimalFormContext> = Symbol("AnimalForm");
