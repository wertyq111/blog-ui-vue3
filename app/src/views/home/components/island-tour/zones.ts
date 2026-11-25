// 小岛立体切片箱庭分区数据与四层垂直地形数学（纯数据，不得 import three）
import type { TimePeriod } from "../../day-cycle";

export type ZoneKey = "office" | "workshop" | "pomo" | "studio" | "tower";

export interface IslandZone {
  key: ZoneKey;
  /** 分区名 */
  name: string;
  /** 空间角标 */
  badge: string;
  /** 悬浮胶囊图标 */
  icon: string;
  /** 海拔高度展示标签 */
  elevationLabel: string;
  /** 说明卡一句话介绍 */
  intro: string;
  /** 说明卡列出的功能（与后端菜单一致） */
  features: string[];
  /** 说明卡按钮直达的主页面 */
  path: string;
  /** 互动机关按钮文案 */
  toyLabel: string;
  /** 建筑世界坐标 */
  x: number;
  z: number;
  groundY: number;
  facingAngle: number;
  /** 3D 悬浮标签相对地标原点的高度偏移 */
  pinOffsetY: number;
  /** 镜头特写瞄准高度 */
  focusY: number;
  /** 镜头特写偏置（相对正面与侧面） */
  cameraDist: number;
  cameraSideOffset: number;
  cameraHeightOffset: number;
}

export interface PinScreenPos {
  key: ZoneKey;
  x: number;
  y: number;
  visible: boolean;
}

export interface IslandSceneOptions {
  period: TimePeriod;
  hour?: number;
  reducedMotion: boolean;
  mobile: boolean;
  onZoneChange: (key: ZoneKey | null) => void;
  onProjectPins?: (pins: PinScreenPos[]) => void;
  onToyTriggered?: (label: string) => void;
}

export interface IslandScene {
  setPeriod(period: TimePeriod): void;
  setHour(hour: number): void;
  focusZone(key: ZoneKey): void;
  focusOverview(): void;
  setAutoplay(on: boolean): void;
  setIsoMode(iso: boolean): void;
  triggerToy(key: ZoneKey): void;
  holdTour(on: boolean): void;
  pause(): void;
  resume(): void;
  dispose(): void;
}

/** 立体切片箱庭方体半宽（总宽 11.2） */
export const BOX_HALF = 5.6;
/** 琉璃海水平面高度 */
export const WATER_TOP_Y = -0.05;
/** 海床深度 */
export const SEABED_Y = -1.78;
/** 四级高差海拔定义 */
export const TIER_LEVELS = {
  coast: 0.16,
  workshop: 1.15,
  office: 2.2,
  tower: 3.8,
} as const;

/** 圆角矩形台地平滑掩码（返回 0 ~ 1） */
export function boxPlateau(
  x: number,
  z: number,
  cx: number,
  cz: number,
  hx: number,
  hz: number,
  cornerRadius: number,
  slopeWidth: number
): number {
  const dx = Math.max(0, Math.abs(x - cx) - (hx - cornerRadius));
  const dz = Math.max(0, Math.abs(z - cz) - (hz - cornerRadius));
  const dist = Math.hypot(dx, dz) - cornerRadius;
  if (dist <= 0) return 1;
  if (dist >= slopeWidth) return 0;
  const t = dist / slopeWidth;
  return 1 - t * t * (3 - 2 * t);
}

/**
 * 精准采样四层垂直共生箱庭的任意坐标 (x, z) 地面高度：
 * - 西岸台地 (+0.16) & 北岸朱桥起点 (+0.16)
 * - Level 1 飞瀑水车崖台 (+1.15)
 * - Level 2 巨樱树屋高台 (+2.20)
 * - Level 3 云顶浑天仪高峰 (+3.80)
 * - 右前侧东南琉璃海盆 (-1.78)
 */
export function sampleDioramaTerrainY(x: number, z: number): number {
  const seabedUndulation =
    SEABED_Y +
    0.09 * Math.sin(x * 0.72 + 0.4) * Math.cos(z * 0.68 - 0.3) +
    0.04 * Math.cos(x * 1.3 - z * 0.9);

  const coastWest = boxPlateau(x, z, -2.95, 2.75, 2.35, 2.55, 1.0, 1.35);
  const coastNorth = boxPlateau(x, z, 2.85, -1.75, 2.25, 1.85, 0.95, 1.4);
  const coastBase = Math.max(coastWest, coastNorth);

  const tier1Mask = boxPlateau(x, z, -3.25, 0.45, 2.05, 1.9, 0.85, 1.15);
  const tier2Mask = boxPlateau(x, z, 2.25, -2.95, 2.85, 2.25, 0.95, 1.2);
  const tier3Mask = boxPlateau(x, z, -3.35, -3.35, 2.05, 2.05, 0.9, 1.15);
  const pomoShoal = boxPlateau(x, z, 3.2, 2.65, 1.4, 1.4, 0.9, 1.4);

  let y = seabedUndulation;
  if (pomoShoal > 0) {
    y = Math.max(y, seabedUndulation + pomoShoal * 0.48);
  }
  if (coastBase > 0) {
    const target = TIER_LEVELS.coast;
    y = seabedUndulation + (target - seabedUndulation) * coastBase;
  }
  if (tier1Mask > 0) {
    y = Math.max(y, seabedUndulation + (TIER_LEVELS.workshop - seabedUndulation) * tier1Mask);
  }
  if (tier2Mask > 0) {
    y = Math.max(y, seabedUndulation + (TIER_LEVELS.office - seabedUndulation) * tier2Mask);
  }
  if (tier3Mask > 0) {
    y = Math.max(y, seabedUndulation + (TIER_LEVELS.tower - seabedUndulation) * tier3Mask);
  }

  // 峡谷泉瀑凹槽
  const dCanyon = Math.hypot((x + 1.1) * 1.1, (z + 2.35) * 0.8);
  if (dCanyon < 0.85 && y > 1.25) {
    const dip = 1 - dCanyon / 0.85;
    y -= dip * dip * 0.65;
  }

  // 浮水茶亭中心浮台垫石
  const dPomo = Math.hypot(x - 3.2, z - 2.65);
  if (dPomo < 1.38) {
    const t = Math.max(0, 1 - Math.max(0, dPomo - 0.85) / 0.53);
    const s = t * t * (3 - 2 * t);
    y = Math.max(y, WATER_TOP_Y - 0.14 + s * 0.23);
  }

  return y;
}

export const zones: IslandZone[] = [
  {
    key: "office",
    name: "办公区 · 巨樱树屋",
    badge: "LEVEL 2 · 树屋书斋",
    icon: "🌸",
    elevationLabel: "+2.20m",
    intro: "盘根巨樱托起的原木书斋，每天的日报、项目文档和待办，都在树荫下整理。",
    features: ["工作日常", "工作文档", "待办列表"],
    path: "/develop/work-daily",
    toyLabel: "🌸 抖落漫天樱花雨",
    x: 2.25,
    z: -2.85,
    groundY: TIER_LEVELS.office,
    facingAngle: 0.35,
    pinOffsetY: 3.45,
    focusY: 1.85,
    cameraDist: 6.4,
    cameraSideOffset: 2.0,
    cameraHeightOffset: 2.4,
  },
  {
    key: "workshop",
    name: "工坊 · 飞瀑水车坊",
    badge: "LEVEL 1 · 崖壁机关",
    icon: "⚙️",
    elevationLabel: "+1.15m",
    intro: "叮叮当当的崖壁小铺，峡谷飞瀑驱动木水车与空中缆车，把重复的活交给机器。",
    features: ["路径转换", "模型初始化", "图片处理"],
    path: "/develop/convert-path",
    toyLabel: "⚙️ 加速水车与缆车",
    x: -3.15,
    z: 0.65,
    groundY: TIER_LEVELS.workshop,
    facingAngle: 0.95,
    pinOffsetY: 2.85,
    focusY: 1.35,
    cameraDist: 6.0,
    cameraSideOffset: 1.9,
    cameraHeightOffset: 2.2,
  },
  {
    key: "pomo",
    name: "番茄钟茶亭",
    badge: "LEVEL 0 · 琉璃水上",
    icon: "🍅",
    elevationLabel: "+0.04m",
    intro: "跨过朱红太鼓桥来到琉璃海中央的浮木茶亭，伴着睡莲与流沙专心做完一个番茄钟。",
    features: ["专注番茄"],
    path: "/profile-center/pomo",
    toyLabel: "⏳ 翻转沙漏荡开金波",
    x: 3.2,
    z: 2.65,
    groundY: 0.04,
    facingAngle: -0.45,
    pinOffsetY: 2.75,
    focusY: 1.15,
    cameraDist: 5.6,
    cameraSideOffset: -1.8,
    cameraHeightOffset: 2.1,
  },
  {
    key: "studio",
    name: "照相馆 · 玻璃暗房",
    badge: "LEVEL 0 · 海岸码头",
    icon: "📷",
    elevationLabel: "+0.16m",
    intro: "小程序里的壁纸、相册和笔记都从这座阳光暗房冲印出去，码头旁还停着水上小飞机。",
    features: ["壁纸管理", "相册管理", "笔记管理"],
    path: "/mini-program/wallpaper",
    toyLabel: "✈️ 启动水上小飞机",
    x: -2.65,
    z: 3.35,
    groundY: TIER_LEVELS.coast,
    facingAngle: 0.58,
    pinOffsetY: 2.65,
    focusY: 1.1,
    cameraDist: 6.2,
    cameraSideOffset: 2.1,
    cameraHeightOffset: 2.2,
  },
  {
    key: "tower",
    name: "塔台 · 云顶浑天仪",
    badge: "LEVEL 3 · 最高峰台",
    icon: "🔭",
    elevationLabel: "+3.80m",
    intro: "矗立在最高板岩峰顶的黄金浑天仪灯塔，照看整座小岛：谁能上岛、能去哪里。",
    features: ["用户管理", "角色管理", "菜单管理", "会员管理"],
    path: "/system/user",
    toyLabel: "✨ 旋转黄金浑天仪",
    x: -3.35,
    z: -3.35,
    groundY: TIER_LEVELS.tower,
    facingAngle: 0.72,
    pinOffsetY: 4.45,
    focusY: 2.1,
    cameraDist: 7.2,
    cameraSideOffset: 2.2,
    cameraHeightOffset: 2.6,
  },
];
