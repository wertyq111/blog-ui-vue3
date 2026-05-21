import type { IconName } from "animal-island-vue";

/**
 * animal-island-vue 提供的全部图标名（10 个）
 */
export const ANIMAL_ICON_NAMES: IconName[] = [
  "icon-miles",
  "icon-camera",
  "icon-chat",
  "icon-critterpedia",
  "icon-design",
  "icon-diy",
  "icon-helicopter",
  "icon-map",
  "icon-shopping",
  "icon-variant",
];

const ANIMAL_ICON_SET = new Set<string>(ANIMAL_ICON_NAMES);

/**
 * 关键词 → 动森图标 的主题映射。
 * 命中规则：把菜单原图标名 / 路由路径 / 标题转小写后做子串匹配。
 */
const KEYWORD_RULES: Array<[RegExp, IconName]> = [
  [/(user|member|people|person|group|account)/, "icon-chat"],
  [/(role|permission|auth|lock|key|secure)/, "icon-miles"],
  [/(menu|grid|nav|list|tree|structure)/, "icon-map"],
  [/(setting|manage|operation|system|config|gear|tool|develop|code|terminal|init|convert)/, "icon-diy"],
  [/(work|doc|platform|note|book|todo|daily)/, "icon-design"],
  [/(photo|picture|image|camera|wallpaper|gallery|album)/, "icon-camera"],
  [/(mini|mobile|phone|program|app|applet)/, "icon-variant"],
  [/(shop|order|cart|goods|mall|store|pay)/, "icon-shopping"],
  [/(dashboard|home|house|index|weather|travel|trip|fly)/, "icon-helicopter"],
  [/(map|location|survey|position|place|region)/, "icon-map"],
  [/(bug|fish|critter|animal|pet|nature|leaf)/, "icon-critterpedia"],
];

/**
 * 将任意字符串稳定散列到 10 个动森图标之一，保证“全部替换”时无图标也有兜底。
 */
function hashToAnimalIcon(seed: string): IconName {
  let sum = 0;
  for (let i = 0; i < seed.length; i++) {
    sum = (sum + seed.charCodeAt(i)) % 1000;
  }
  return ANIMAL_ICON_NAMES[sum % ANIMAL_ICON_NAMES.length];
}

/**
 * 把菜单图标解析为动森图标名。
 *
 * @param icon 菜单原始图标值（如 `el-icon-s-operation` / `user` / `icon-camera`）
 * @param seed 备用散列种子（建议传路由路径或标题），用于无主题命中时的稳定分配
 * @returns animal-island-vue 的 IconName
 */
export function resolveAnimalIcon(icon?: string | null, seed?: string | null): IconName {
  const raw = (icon ?? "").trim();

  // 已经是动森图标，原样返回
  if (ANIMAL_ICON_SET.has(raw)) {
    return raw as IconName;
  }

  const normalized = raw
    .replace(/^el-icon-?/, "")
    .replace(/^i-svg:?/, "")
    .toLowerCase();
  const haystack = `${normalized} ${(seed ?? "").toLowerCase()}`;

  for (const [pattern, name] of KEYWORD_RULES) {
    if (pattern.test(haystack)) {
      return name;
    }
  }

  return hashToAnimalIcon(haystack.trim() || "menu");
}
