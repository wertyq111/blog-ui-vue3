// 工作岛立体纸艺书分区元数据与正面舞台视角定义
import type { TimePeriod } from "../../day-cycle";

export type ZoneKey = "office" | "workshop" | "pomo" | "studio" | "tower";

export interface PapercraftZone {
  key: ZoneKey;
  name: string;
  badge: string;
  icon: string;
  elevationLabel: string;
  intro: string;
  features: string[];
  path: string;
  toyLabel: string;
  /** 世界坐标（x, y, z）：1 unit ≈ 1 cm 纸艺比例 */
  x: number;
  y: number;
  z: number;
  facingYaw: number;
  /** 3D 悬浮标签相对地标底座的垂直高度 */
  pinOffsetY: number;
  /** 镜头特写瞄准点相对底座偏移 */
  focusOffsetY: number;
  /** 特写相机在正面扇区中的位置 */
  cameraPos: [number, number, number];
  /** 立体书入场展开延迟（秒） */
  unfoldDelay: number;
}

export interface PinScreenPos {
  key: ZoneKey;
  x: number;
  y: number;
  visible: boolean;
}

export interface PapercraftSceneOptions {
  period: TimePeriod;
  reducedMotion: boolean;
  mobile: boolean;
  onZoneChange: (key: ZoneKey | null) => void;
  onProjectPins?: (pins: PinScreenPos[]) => void;
  onToyTriggered?: (label: string) => void;
  onReadyStats?: (stats: { buildMs: number }) => void;
}

export interface PapercraftScene {
  setPeriod(period: TimePeriod): void;
  focusZone(key: ZoneKey): void;
  focusOverview(): void;
  setAutoplay(on: boolean): void;
  replayUnfold(): void;
  triggerToy(key: ZoneKey): void;
  holdTour(on: boolean): void;
  pause(): void;
  resume(): void;
  dispose(): void;
}

export const OVERVIEW_CAMERA = {
  position: [1.4, 16.4, 36.2] as [number, number, number],
  target: [0, 2.7, -1.5] as [number, number, number],
};

export const PAPERCRAFT_ZONES: PapercraftZone[] = [
  {
    key: "office",
    name: "办公区 · 巨樱树屋",
    badge: "LEVEL 2 · 樱林书斋",
    icon: "🌸",
    elevationLabel: "+1.5m",
    intro: "叠纸巨樱托起的原木树屋，每天的日报、工作文档与待办都在暖阳樱影下整理。",
    features: ["工作日常", "工作文档", "待办列表"],
    path: "/develop/work-daily",
    toyLabel: "🌸 抖落漫天樱花纸瓣",
    x: 8.2,
    y: 1.5,
    z: -3.8,
    facingYaw: -0.32,
    pinOffsetY: 5.5,
    focusOffsetY: 2.9,
    cameraPos: [13.2, 8.8, 10.6],
    unfoldDelay: 0.24,
  },
  {
    key: "workshop",
    name: "工坊 · 飞瀑水车坊",
    badge: "LEVEL 1 · 崖壁机关",
    icon: "⚙️",
    elevationLabel: "+1.2m",
    intro: "层叠纸瀑驱动木水车与屋顶齿轮叮当运转，把重复脚本与工具处理都交给工坊。",
    features: ["路径转换", "模型初始化", "图片处理"],
    path: "/develop/convert-path",
    toyLabel: "⚙️ 加速水车与纸烟",
    x: -8.8,
    y: 1.2,
    z: -1.6,
    facingYaw: 0.34,
    pinOffsetY: 4.15,
    focusOffsetY: 2.3,
    cameraPos: [-13.4, 8.2, 12.2],
    unfoldDelay: 0.18,
  },
  {
    key: "pomo",
    name: "番茄钟茶亭",
    badge: "LEVEL 0 · 琉璃水上",
    icon: "🍅",
    elevationLabel: "+0.2m",
    intro: "跨过朱红拱桥来到前湾水上番茄茶亭，伴着剪纸睡莲与黄金沙漏专心做完一个番茄钟。",
    features: ["专注番茄"],
    path: "/profile-center/pomo",
    toyLabel: "⏳ 翻转沙漏荡开金波",
    x: 7.4,
    y: 0.2,
    z: 5.6,
    facingYaw: -0.26,
    pinOffsetY: 3.7,
    focusOffsetY: 1.8,
    cameraPos: [10.4, 7.0, 17.6],
    unfoldDelay: 0.42,
  },
  {
    key: "studio",
    name: "照相馆 · 玻璃暗房",
    badge: "LEVEL 0 · 海岸码头",
    icon: "📷",
    elevationLabel: "+0.3m",
    intro: "大镜头阳光暗房和停在海湾的水上小飞机，负责打理小程序里的壁纸、相册与笔记。",
    features: ["壁纸管理", "相册管理", "笔记管理"],
    path: "/mini-program/wallpaper",
    toyLabel: "✈️ 启动水上纸飞机",
    x: -7.4,
    y: 0.3,
    z: 5.5,
    facingYaw: 0.24,
    pinOffsetY: 3.15,
    focusOffsetY: 1.7,
    cameraPos: [-10.8, 7.2, 17.8],
    unfoldDelay: 0.36,
  },
  {
    key: "tower",
    name: "塔台 · 云顶浑天仪",
    badge: "LEVEL 3 · 最高峰台",
    icon: "🔭",
    elevationLabel: "+2.8m",
    intro: "矗立在岛心最高台地上的红白灯塔与黄金浑天仪，守护整座工作岛的账号与权限。",
    features: ["用户管理", "角色管理", "菜单管理", "会员管理"],
    path: "/system/user",
    toyLabel: "✨ 旋转黄金浑天仪",
    x: -0.4,
    y: 2.8,
    z: -9.4,
    facingYaw: 0.05,
    pinOffsetY: 7.45,
    focusOffsetY: 4.1,
    cameraPos: [2.2, 11.4, 9.2],
    unfoldDelay: 0.1,
  },
];
