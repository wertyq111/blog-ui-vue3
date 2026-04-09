/**
 * 应用配置
 */

import { LayoutMode, ComponentSize, SidebarColor, ThemeMode, LanguageEnum } from "@/enums";

const env = import.meta.env;
const { pkg } = __APP_INFO__;

// ============================================
// 应用配置
// ============================================
export const appConfig = {
  name: pkg.name as string,
  version: pkg.version as string,
  title: (env.VITE_APP_TITLE as string) || pkg.name,

  // 功能开关
  tenantEnabled: env.VITE_APP_TENANT_ENABLED === "true",
} as const;

// ============================================
// 用户偏好默认值
// ============================================
export const defaults = {
  theme: ThemeMode.LIGHT,
  themeColor: "#8fe521",
  sidebarColorScheme: SidebarColor.CLASSIC_BLUE,
  layout: LayoutMode.LEFT,
  size: ComponentSize.DEFAULT,
  language: LanguageEnum.ZH_CN,
  showTagsView: true,
  showAppLogo: true,
  showWatermark: false,
  pageSwitchingAnimation: "fade-slide",
  showSettings: true,
  watermarkContent: pkg.name,
} as const;

// ============================================
// 主题色预设
// ============================================
export const themeColorPresets = [
  "#8fe521",
  "#69c014",
  "#18a8ff",
  "#1668ff",
  "#5f80c7",
  "#faad14",
  "#f5686f",
  "#2bccce",
  "#6d47f4",
] as const;
