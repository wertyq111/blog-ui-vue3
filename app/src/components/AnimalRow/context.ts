import type { InjectionKey } from "vue";

export interface RowContext {
  gutter: number;
}

export const ANIMAL_ROW_KEY: InjectionKey<RowContext> = Symbol("AnimalRow");
