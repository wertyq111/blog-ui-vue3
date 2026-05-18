import { ThemeMode } from "@/enums";

function hexToRgb(hex: string): [number, number, number] {
  const bigint = parseInt(hex.slice(1), 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function getDarkColor(color: string, level: number): string {
  const rgb = hexToRgb(color);
  for (let i = 0; i < 3; i++) rgb[i] = Math.round(20.5 * level + rgb[i] * (1 - level));
  return rgbToHex(rgb[0], rgb[1], rgb[2]);
}

export const getLightColor = (color: string, level: number): string => {
  const rgb = hexToRgb(color);
  for (let i = 0; i < 3; i++) rgb[i] = Math.round(255 * level + rgb[i] * (1 - level));
  return rgbToHex(rgb[0], rgb[1], rgb[2]);
};

export function generateThemeColors(primary: string, _theme: ThemeMode) {
  const colors: Record<string, string> = { primary };

  for (let i = 1; i <= 9; i++) {
    colors[`primary-light-${i}`] = getLightColor(primary, i / 10);
  }

  colors["primary-dark-2"] = getLightColor(primary, 0.2);

  return colors;
}

export function resolveThemeMode(_theme: ThemeMode, _prefersDark: boolean): ThemeMode {
  return ThemeMode.LIGHT;
}

export function applyTheme(colors: Record<string, string>) {
  const el = document.documentElement;

  Object.entries(colors).forEach(([key, value]) => {
    el.style.setProperty(`--el-color-${key}`, value);
  });

  requestAnimationFrame(() => {
    el.style.setProperty("--theme-update-trigger", Date.now().toString());
  });
}

export function syncThemeClass(_resolvedTheme: ThemeMode) {
  document.documentElement.classList.remove("dark");
  document.documentElement.dataset.themeResolved = ThemeMode.LIGHT;

  document.body.classList.remove("cyber-theme-dark");
  document.body.classList.remove("cyber-theme");
  document.body.classList.remove("cyber-theme-light");
}

export function toggleSidebarColor(_isBlueSidebar: boolean) {
  document.documentElement.classList.remove("sidebar-color-blue");
}
