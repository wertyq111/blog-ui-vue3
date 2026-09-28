// 小岛色板与四个时段的光照参数：纯数据，不得 import three
import type { TimePeriod } from "../../day-cycle";

/** 取自首页既有颜色字面值（描边棕、帐篷橙、篝火红、木牌木色等） */
export const COLORS = {
  grass: 0x8ac68a,
  sand: 0xf1dfae,
  cliff: 0xa47449,
  sea: 0x7fd3e6,
  outline: 0x794f27,
  wall: 0xfffdec,
  wood: 0xc8905a,
  roofOrange: 0xe59266,
  roofRed: 0xfc736d,
  tomato: 0xf05a4f,
  leaf: 0x5fa35a,
  trunk: 0x8a5a33,
  stone: 0xb9b2a4,
  lens: 0x6f86d6,
  mailbox: 0x4f8fd8,
  window: 0x9fd6e8,
  windowLit: 0xffd66b,
  beam: 0xfff2a8,
  flowerPink: 0xffb3c7,
  flowerYellow: 0xffe16b,
} as const;

export interface Lighting {
  ambient: number;
  ambientIntensity: number;
  sun: number;
  sunIntensity: number;
  /** 窗户与灯室自发光强度 0 ~ 1 */
  glow: number;
  /** 灯塔光束不透明度 */
  beam: number;
}

export const LIGHTING: Record<TimePeriod, Lighting> = {
  morning: {
    ambient: 0xffe6c8,
    ambientIntensity: 1.1,
    sun: 0xffd2a0,
    sunIntensity: 1.6,
    glow: 0,
    beam: 0.06,
  },
  afternoon: {
    ambient: 0xffffff,
    ambientIntensity: 1.2,
    sun: 0xfff6e0,
    sunIntensity: 2.0,
    glow: 0,
    beam: 0.04,
  },
  sunset: {
    ambient: 0xffc2a8,
    ambientIntensity: 0.9,
    sun: 0xff9a6b,
    sunIntensity: 1.4,
    glow: 0.6,
    beam: 0.16,
  },
  night: {
    ambient: 0x7f8fd6,
    ambientIntensity: 0.55,
    sun: 0x9fb2ff,
    sunIntensity: 0.5,
    glow: 1,
    beam: 0.35,
  },
};
