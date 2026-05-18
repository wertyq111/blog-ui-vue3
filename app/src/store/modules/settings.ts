import { ThemeMode } from "@/enums";
import type { LayoutMode } from "@/enums";
import {
  applyTheme,
  generateThemeColors,
  syncThemeClass,
} from "@/utils/theme";
import { STORAGE_KEYS } from "@/constants";
import { defaults } from "@/settings";

export const useSettingsStore = defineStore("setting", () => {
  // 界面显示
  const settingsVisible = ref(false);
  const showTagsView = useStorage(STORAGE_KEYS.SHOW_TAGS_VIEW, defaults.showTagsView);
  const showAppLogo = useStorage(STORAGE_KEYS.SHOW_APP_LOGO, defaults.showAppLogo);
  const showWatermark = useStorage(STORAGE_KEYS.SHOW_WATERMARK, defaults.showWatermark);
  const pageSwitchingAnimation = useStorage(
    STORAGE_KEYS.PAGE_SWITCHING_ANIMATION,
    defaults.pageSwitchingAnimation
  );

  // 布局
  const layout = useStorage<LayoutMode>(STORAGE_KEYS.LAYOUT, defaults.layout as LayoutMode);
  const sidebarColorScheme = useStorage(
    STORAGE_KEYS.SIDEBAR_COLOR_SCHEME,
    defaults.sidebarColorScheme
  );

  // 主题（仅亮色模式，暗色相关属性保留为惰性值供兼容引用）
  const theme = useStorage<ThemeMode>(STORAGE_KEYS.THEME, defaults.theme);
  const themeColor = useStorage(STORAGE_KEYS.THEME_COLOR, defaults.themeColor);
  const resolvedTheme = computed(() => ThemeMode.LIGHT);
  const effectiveDarkMode = computed(() => false);
  const isDark = computed(() => false);
  const themeRefreshKey = ref(0);

  // 特殊模式
  const grayMode = useStorage(STORAGE_KEYS.GRAY_MODE, false);
  const colorWeak = useStorage(STORAGE_KEYS.COLOR_WEAK, false);

  // 主题变化监听
  watch(
    [resolvedTheme, themeColor],
    ([t, c]: [ThemeMode, string]) => {
      syncThemeClass(t);
      applyTheme(generateThemeColors(c, t));
    },
    { immediate: true }
  );

  // 灰色模式监听
  watch(
    grayMode,
    (v) => {
      document.documentElement.style.filter = v ? "grayscale(100%)" : "";
    },
    { immediate: true }
  );

  // 色弱模式监听
  watch(
    colorWeak,
    (v) => {
      document.documentElement.classList.toggle("color-weak", v);
    },
    { immediate: true }
  );

  function resetSettings() {
    showTagsView.value = defaults.showTagsView;
    showAppLogo.value = defaults.showAppLogo;
    showWatermark.value = defaults.showWatermark;
    pageSwitchingAnimation.value = defaults.pageSwitchingAnimation;
    grayMode.value = false;
    colorWeak.value = false;
    sidebarColorScheme.value = defaults.sidebarColorScheme;
    layout.value = defaults.layout as LayoutMode;
    themeColor.value = defaults.themeColor;
    theme.value = defaults.theme;
  }

  return {
    settingsVisible,
    showTagsView,
    showAppLogo,
    showWatermark,
    pageSwitchingAnimation,
    grayMode,
    colorWeak,
    sidebarColorScheme,
    layout,
    themeColor,
    theme,
    resolvedTheme,
    effectiveDarkMode,
    isDark,
    themeRefreshKey,
    resetSettings,
  };
});
