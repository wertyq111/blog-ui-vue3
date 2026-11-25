// 收藏级手办色板 + 24 小时连续太阳/月光轨迹与琉璃海生物荧光关键帧插值（纯数据，不得 import three）
import type { TimePeriod } from "../../day-cycle";

export const COLORS = {
  // 底座与地质切片
  walnutDark: 0x3b2618,
  walnutMid: 0x563824,
  brassGold: 0xe3b457,
  brassDeep: 0xa67c2e,
  grassLush: 0x7bc966,
  grassHighlight: 0xa5e07d,
  soilCocoa: 0x7c5032,
  clayTerracotta: 0xa86942,
  slateRock: 0x6f7480,
  slateLight: 0x9fa6b3,

  // 琉璃海与水下珊瑚生态
  seabedSand: 0xf0dcab,
  coralPink: 0xff7da8,
  coralTeal: 0x4ae0d2,
  coralViolet: 0xb68cff,
  coralGold: 0xffc857,
  kelpGreen: 0x3e9b74,
  fishOrange: 0xff7847,
  fishBlue: 0x4ca8ff,
  fishGold: 0xffd54f,

  // 建筑与道具
  creamWall: 0xfff7e6,
  cedarWood: 0xc58650,
  darkTimber: 0x5d3920,
  vermilionBridge: 0xe64d3d,
  coralRoof: 0xf06b57,
  terracottaRoof: 0xe27d4e,
  mintIron: 0x7ecdb5,
  glassTint: 0xdff7ff,
  tomatoRed: 0xeb4b3c,
  leafGreen: 0x64ba56,
  sakuraDeep: 0xff9ec2,
  sakuraSoft: 0xffd3e4,
  seaplaneYellow: 0xffcf56,
  cableCarRed: 0xef5b4c,
  windowWarm: 0xffd268,
  lanternWarm: 0xffe28a,
  haloCyan: 0x4de6d8,
} as const;

export const PERIOD_TO_HOUR: Record<TimePeriod, number> = {
  morning: 7.5,
  afternoon: 13.5,
  sunset: 18.2,
  night: 22.0,
};

export interface LightingKeyframe {
  hour: number;
  hemiSky: number;
  hemiGround: number;
  hemiIntensity: number;
  sunColor: number;
  sunIntensity: number;
  sunPos: [number, number, number];
  rimColor: number;
  rimIntensity: number;
  envIntensity: number;
  exposure: number;
  windowGlow: number;
  lampGlow: number;
  beamOpacity: number;
  reefGlow: number;
  fireflyOpacity: number;
  waterShallow: number;
  waterDeep: number;
  waterWall: number;
  waterFoam: number;
  cloudColor: number;
}

const KEYFRAMES: LightingKeyframe[] = [
  {
    hour: 0.0,
    hemiSky: 0x5e78cf,
    hemiGround: 0x223346,
    hemiIntensity: 0.72,
    sunColor: 0x9bbaff,
    sunIntensity: 0.95,
    sunPos: [-8, 16, -9],
    rimColor: 0x69b8ff,
    rimIntensity: 0.62,
    envIntensity: 0.25,
    exposure: 0.98,
    windowGlow: 1.5,
    lampGlow: 1.25,
    beamOpacity: 0.5,
    reefGlow: 1.15,
    fireflyOpacity: 1.0,
    waterShallow: 0x3596bd,
    waterDeep: 0x163869,
    waterWall: 0x22689c,
    waterFoam: 0xbfe2ff,
    cloudColor: 0x768cc7,
  },
  {
    hour: 5.5,
    hemiSky: 0xffd6c2,
    hemiGround: 0x688b68,
    hemiIntensity: 0.85,
    sunColor: 0xffad82,
    sunIntensity: 1.45,
    sunPos: [16, 6.5, 6],
    rimColor: 0xbca6f2,
    rimIntensity: 0.65,
    envIntensity: 0.32,
    exposure: 1.02,
    windowGlow: 0.55,
    lampGlow: 0.5,
    beamOpacity: 0.2,
    reefGlow: 0.45,
    fireflyOpacity: 0.4,
    waterShallow: 0x5ec6cb,
    waterDeep: 0x2f75a8,
    waterWall: 0x459bc2,
    waterFoam: 0xffeede,
    cloudColor: 0xffdfcf,
  },
  {
    hour: 7.5,
    hemiSky: 0xfff0d4,
    hemiGround: 0x8cc474,
    hemiIntensity: 1.0,
    sunColor: 0xffd699,
    sunIntensity: 1.95,
    sunPos: [15, 13, 9],
    rimColor: 0xffe4d8,
    rimIntensity: 0.65,
    envIntensity: 0.38,
    exposure: 1.06,
    windowGlow: 0.1,
    lampGlow: 0.12,
    beamOpacity: 0.08,
    reefGlow: 0.08,
    fireflyOpacity: 0.0,
    waterShallow: 0x65e4df,
    waterDeep: 0x2a94c9,
    waterWall: 0x3fbce0,
    waterFoam: 0xfff9ed,
    cloudColor: 0xfff5e9,
  },
  {
    hour: 13.5,
    hemiSky: 0xdff5ff,
    hemiGround: 0x86c76d,
    hemiIntensity: 1.08,
    sunColor: 0xfff7e2,
    sunIntensity: 2.3,
    sunPos: [8, 19, 11],
    rimColor: 0xbde6ff,
    rimIntensity: 0.62,
    envIntensity: 0.44,
    exposure: 1.08,
    windowGlow: 0.0,
    lampGlow: 0.0,
    beamOpacity: 0.03,
    reefGlow: 0.05,
    fireflyOpacity: 0.0,
    waterShallow: 0x5ee7e0,
    waterDeep: 0x258ec7,
    waterWall: 0x39bce3,
    waterFoam: 0xffffff,
    cloudColor: 0xffffff,
  },
  {
    hour: 18.2,
    hemiSky: 0xffba9b,
    hemiGround: 0x6d7762,
    hemiIntensity: 0.88,
    sunColor: 0xff8a56,
    sunIntensity: 2.0,
    sunPos: [-16, 7.5, 9],
    rimColor: 0xc292e0,
    rimIntensity: 0.74,
    envIntensity: 0.33,
    exposure: 1.04,
    windowGlow: 0.9,
    lampGlow: 0.92,
    beamOpacity: 0.28,
    reefGlow: 0.6,
    fireflyOpacity: 0.68,
    waterShallow: 0x6ac2c2,
    waterDeep: 0x3c629b,
    waterWall: 0x4c8bb5,
    waterFoam: 0xffe4cc,
    cloudColor: 0xffccb2,
  },
  {
    hour: 21.5,
    hemiSky: 0x627dd4,
    hemiGround: 0x24364a,
    hemiIntensity: 0.74,
    sunColor: 0xa2bfff,
    sunIntensity: 0.98,
    sunPos: [-9, 15.5, -10],
    rimColor: 0x70b8ff,
    rimIntensity: 0.62,
    envIntensity: 0.25,
    exposure: 0.99,
    windowGlow: 1.5,
    lampGlow: 1.25,
    beamOpacity: 0.5,
    reefGlow: 1.15,
    fireflyOpacity: 1.0,
    waterShallow: 0x3596bd,
    waterDeep: 0x163869,
    waterWall: 0x22689c,
    waterFoam: 0xbfe2ff,
    cloudColor: 0x768cc7,
  },
  {
    hour: 24.0,
    hemiSky: 0x5e78cf,
    hemiGround: 0x223346,
    hemiIntensity: 0.72,
    sunColor: 0x9bbaff,
    sunIntensity: 0.95,
    sunPos: [-8, 16, -9],
    rimColor: 0x69b8ff,
    rimIntensity: 0.62,
    envIntensity: 0.25,
    exposure: 0.98,
    windowGlow: 1.5,
    lampGlow: 1.25,
    beamOpacity: 0.5,
    reefGlow: 1.15,
    fireflyOpacity: 1.0,
    waterShallow: 0x3596bd,
    waterDeep: 0x163869,
    waterWall: 0x22689c,
    waterFoam: 0xbfe2ff,
    cloudColor: 0x768cc7,
  },
];

function lerpNum(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpHex(hexA: number, hexB: number, t: number): number {
  const ra = (hexA >> 16) & 255;
  const ga = (hexA >> 8) & 255;
  const ba = hexA & 255;
  const rb = (hexB >> 16) & 255;
  const gb = (hexB >> 8) & 255;
  const bb = hexB & 255;
  const r = Math.round(lerpNum(ra, rb, t));
  const g = Math.round(lerpNum(ga, gb, t));
  const b = Math.round(lerpNum(ba, bb, t));
  return (r << 16) | (g << 8) | b;
}

/** 连续采样一天中任意小时 (0 ~ 24) 的完整光照与水体配色 */
export function sampleLightingAtHour(rawHour: number): LightingKeyframe {
  const hour = ((rawHour % 24) + 24) % 24;
  let k0 = KEYFRAMES[0];
  let k1 = KEYFRAMES[KEYFRAMES.length - 1];
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    if (hour >= KEYFRAMES[i].hour && hour <= KEYFRAMES[i + 1].hour) {
      k0 = KEYFRAMES[i];
      k1 = KEYFRAMES[i + 1];
      break;
    }
  }
  const span = Math.max(0.001, k1.hour - k0.hour);
  const t = (hour - k0.hour) / span;

  return {
    hour,
    hemiSky: lerpHex(k0.hemiSky, k1.hemiSky, t),
    hemiGround: lerpHex(k0.hemiGround, k1.hemiGround, t),
    hemiIntensity: lerpNum(k0.hemiIntensity, k1.hemiIntensity, t),
    sunColor: lerpHex(k0.sunColor, k1.sunColor, t),
    sunIntensity: lerpNum(k0.sunIntensity, k1.sunIntensity, t),
    sunPos: [
      lerpNum(k0.sunPos[0], k1.sunPos[0], t),
      lerpNum(k0.sunPos[1], k1.sunPos[1], t),
      lerpNum(k0.sunPos[2], k1.sunPos[2], t),
    ],
    rimColor: lerpHex(k0.rimColor, k1.rimColor, t),
    rimIntensity: lerpNum(k0.rimIntensity, k1.rimIntensity, t),
    envIntensity: lerpNum(k0.envIntensity, k1.envIntensity, t),
    exposure: lerpNum(k0.exposure, k1.exposure, t),
    windowGlow: lerpNum(k0.windowGlow, k1.windowGlow, t),
    lampGlow: lerpNum(k0.lampGlow, k1.lampGlow, t),
    beamOpacity: lerpNum(k0.beamOpacity, k1.beamOpacity, t),
    reefGlow: lerpNum(k0.reefGlow, k1.reefGlow, t),
    fireflyOpacity: lerpNum(k0.fireflyOpacity, k1.fireflyOpacity, t),
    waterShallow: lerpHex(k0.waterShallow, k1.waterShallow, t),
    waterDeep: lerpHex(k0.waterDeep, k1.waterDeep, t),
    waterWall: lerpHex(k0.waterWall, k1.waterWall, t),
    waterFoam: lerpHex(k0.waterFoam, k1.waterFoam, t),
    cloudColor: lerpHex(k0.cloudColor, k1.cloudColor, t),
  };
}
