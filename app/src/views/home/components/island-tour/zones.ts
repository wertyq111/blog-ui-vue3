// 小岛分区数据：纯数据，不得 import three（Vue 组件会直接引用本文件）

export type ZoneKey = "office" | "workshop" | "pomo" | "studio" | "tower";

export interface IslandZone {
  key: ZoneKey;
  /** 分区名 */
  name: string;
  /** 说明卡上的一句话介绍 */
  intro: string;
  /** 说明卡上列出的功能（名称与后端菜单一致） */
  features: string[];
  /** 说明卡按钮直达的主页面（取自后端菜单表，2026-09-28 核对） */
  path: string;
  /** 地标在岛上的方位角（弧度）；方向向量见 zoneDirection */
  angle: number;
}

/** 岛屿草地半径 */
export const ISLAND_RADIUS = 10;
/** 地标离岛心的距离 */
export const ZONE_RING = 6.6;

// 第一个分区朝向俯视镜头（+z 方向），其余按 72° 均分
const at = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / 5;

export const zones: IslandZone[] = [
  {
    key: "office",
    name: "办公区",
    intro: "每天的日报、项目文档和待办，都在这栋小楼里整理。",
    features: ["工作日常", "工作文档", "待办列表"],
    path: "/develop/work-daily",
    angle: at(0),
  },
  {
    key: "workshop",
    name: "工坊",
    intro: "叮叮当当的小工具铺子，把重复的活交给机器。",
    features: ["路径转换", "模型初始化", "图片处理"],
    path: "/develop/convert-path",
    angle: at(1),
  },
  {
    key: "pomo",
    name: "番茄钟小屋",
    intro: "关上门，专心做完一个番茄钟。",
    features: ["专注番茄"],
    path: "/profile-center/pomo",
    angle: at(2),
  },
  {
    key: "studio",
    name: "照相馆",
    intro: "小程序里的壁纸、相册和笔记，都从这里冲印出去。",
    features: ["壁纸管理", "相册管理", "笔记管理"],
    path: "/mini-program/wallpaper",
    angle: at(3),
  },
  {
    key: "tower",
    name: "塔台",
    intro: "灯塔照看整座小岛：谁能上岛、能去哪里。",
    features: ["用户管理", "角色管理", "菜单管理", "会员管理"],
    path: "/system/user",
    angle: at(4),
  },
];

/** 方位角对应的水平方向（单位向量，y 轴向上，angle 按俯视逆时针） */
export function zoneDirection(angle: number): { x: number; z: number } {
  return { x: Math.cos(angle), z: -Math.sin(angle) };
}
