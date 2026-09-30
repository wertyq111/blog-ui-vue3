import type { AnimalTagType } from "@/components/AnimalTag/index.vue";
import type { WorkPlatformCategory } from "@/types/api/work-platform";

/** 平台大类：工作进工作报表，学习在工作报表里单独成块，个人进个人成长记录 */
export const WORK_PLATFORM_CATEGORY_OPTIONS: Array<{ key: WorkPlatformCategory; label: string }> = [
  { key: "work", label: "工作" },
  { key: "study", label: "学习" },
  { key: "personal", label: "个人" },
];

const CATEGORY_TAG_TYPES: Record<WorkPlatformCategory, AnimalTagType> = {
  work: "primary",
  study: "success",
  personal: "warning",
};

/** 平台大类展示名 */
export function workPlatformCategoryLabel(category: WorkPlatformCategory): string {
  return WORK_PLATFORM_CATEGORY_OPTIONS.find((item) => item.key === category)?.label ?? category;
}

/** 平台大类标签颜色 */
export function workPlatformCategoryTagType(category: WorkPlatformCategory): AnimalTagType {
  return CATEGORY_TAG_TYPES[category];
}
