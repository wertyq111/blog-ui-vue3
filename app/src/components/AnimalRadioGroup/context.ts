import type { InjectionKey } from "vue";

export type RadioValue = string | number | boolean;

export interface RadioGroupContext {
  value: RadioValue | undefined;
  disabled: boolean;
  change: (v: RadioValue) => void;
}

export const ANIMAL_RADIO_GROUP_KEY: InjectionKey<RadioGroupContext> = Symbol("AnimalRadioGroup");
