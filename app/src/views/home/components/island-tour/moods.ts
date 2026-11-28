// 工作岛绘本风四档纸艺光影预设（清晨 / 午后 / 黄昏 / 星夜）
import * as THREE from "three";
import type { TimePeriod } from "../../day-cycle";
import {
  LENS_DEFAULTS,
  PAPER_LIGHT,
  type LifeHandle,
  type PaperLightsRig,
  type PaperPostInstance,
} from "./vendor/typed";

export interface PapercraftMood {
  key: TimePeriod;
  label: string;
  icon: string;
  skyBg: string;
  keyColor: string;
  keyIntensity: number;
  keyDir: [number, number, number];
  fillColor: string;
  fillIntensity: number;
  fillDir: [number, number, number];
  skyColor: string;
  groundColor: string;
  skyIntensity: number;
  leak: string;
  wrap: number;
  trans: number;
  glow: number;
  lampIntensity: number;
  beamOpacity: number;
  nightFactor: number;
  post: {
    exposure: number;
    tint: [number, number, number];
    saturation: number;
    contrast: number;
    greenDesat: number;
    shadowTint: string;
    shadowLift: number;
    haze: string;
    hazeStart: number;
    hazeEnd: number;
    hazeAmount: number;
    vignette: number;
    vignetteColor: string;
    edgeLine: number;
    edgeLineColor: string;
    ao: number;
    aoTint: string;
  };
}

export const MOODS: Record<TimePeriod, PapercraftMood> = {
  morning: {
    key: "morning",
    label: "清晨",
    icon: "🌅",
    skyBg: "#f9e8d2",
    keyColor: "#ffdcb2",
    keyIntensity: 3.15,
    keyDir: [-0.88, 0.56, 0.48],
    fillColor: "#dff1e6",
    fillIntensity: 0.96,
    fillDir: [0.45, 0.52, 1.0],
    skyColor: "#fff1dc",
    groundColor: "#a4bc92",
    skyIntensity: 0.48,
    leak: "#a96b45",
    wrap: 0.3,
    trans: 0.14,
    glow: 0.25,
    lampIntensity: 0.25,
    beamOpacity: 0.08,
    nightFactor: 0.15,
    post: {
      exposure: 0.92,
      tint: [1.03, 0.99, 0.96],
      saturation: 1.02,
      contrast: 1.06,
      greenDesat: 0.14,
      shadowTint: "#4a2c16",
      shadowLift: 0.032,
      haze: "#f5dec0",
      hazeStart: 30,
      hazeEnd: 88,
      hazeAmount: 0.36,
      vignette: 0.05,
      vignetteColor: "#4a2c16",
      edgeLine: 0.28,
      edgeLineColor: "#a88d74",
      ao: 1.1,
      aoTint: "#6b3e1f",
    },
  },
  afternoon: {
    key: "afternoon",
    label: "午后",
    icon: "☀️",
    skyBg: "#d8f2f7",
    keyColor: "#fff2d6",
    keyIntensity: 3.25,
    keyDir: [-0.72, 0.92, 0.55],
    fillColor: "#d6f0fb",
    fillIntensity: 1.05,
    fillDir: [0.48, 0.54, 1.0],
    skyColor: "#e6f8ff",
    groundColor: "#9ac284",
    skyIntensity: 0.52,
    leak: "#926444",
    wrap: 0.3,
    trans: 0.12,
    glow: 0.08,
    lampIntensity: 0,
    beamOpacity: 0.02,
    nightFactor: 0,
    post: {
      exposure: 0.9,
      tint: [1.02, 1.0, 0.98],
      saturation: 1.05,
      contrast: 1.06,
      greenDesat: 0.1,
      shadowTint: "#3e2612",
      shadowLift: 0.032,
      haze: "#d2eff4",
      hazeStart: 32,
      hazeEnd: 92,
      hazeAmount: 0.3,
      vignette: 0.04,
      vignetteColor: "#2e2418",
      edgeLine: 0.28,
      edgeLineColor: "#9c856e",
      ao: 1.1,
      aoTint: "#5c3b1e",
    },
  },
  sunset: {
    key: "sunset",
    label: "黄昏",
    icon: "🌇",
    skyBg: "#f2beab",
    keyColor: "#ffad7c",
    keyIntensity: 3.2,
    keyDir: [-0.9, 0.42, 0.48],
    fillColor: "#a88ac8",
    fillIntensity: 1.25,
    fillDir: [0.5, 0.45, 0.95],
    skyColor: "#f7c2aa",
    groundColor: "#74607e",
    skyIntensity: 0.88,
    leak: "#784d7e",
    wrap: 0.34,
    trans: 0.18,
    glow: 1.2,
    lampIntensity: 3.2,
    beamOpacity: 0.32,
    nightFactor: 0.58,
    post: {
      exposure: 0.98,
      tint: [1.03, 0.97, 0.99],
      saturation: 1.04,
      contrast: 1.08,
      greenDesat: 0.16,
      shadowTint: "#2d204a",
      shadowLift: 0.035,
      haze: "#ebb09d",
      hazeStart: 24,
      hazeEnd: 80,
      hazeAmount: 0.42,
      vignette: 0.11,
      vignetteColor: "#261638",
      edgeLine: 0.3,
      edgeLineColor: "#8a6874",
      ao: 1.15,
      aoTint: "#4a2b4f",
    },
  },
  night: {
    key: "night",
    label: "星夜",
    icon: "🌌",
    skyBg: "#172554",
    keyColor: "#c8d8ff",
    keyIntensity: 1.65,
    keyDir: [-0.65, 0.85, 0.45],
    fillColor: "#6e86ce",
    fillIntensity: 0.8,
    fillDir: [0.45, 0.48, 0.95],
    skyColor: "#3e5ab0",
    groundColor: "#202744",
    skyIntensity: 0.85,
    leak: "#263886",
    wrap: 0.4,
    trans: 0.1,
    glow: 1.85,
    lampIntensity: 4.8,
    beamOpacity: 0.58,
    nightFactor: 1,
    post: {
      exposure: 0.98,
      tint: [0.98, 0.99, 1.04],
      saturation: 1.12,
      contrast: 1.08,
      greenDesat: 0.1,
      shadowTint: "#16204c",
      shadowLift: 0.045,
      haze: "#152452",
      hazeStart: 18,
      hazeEnd: 62,
      hazeAmount: 0.72,
      vignette: 0.14,
      vignetteColor: "#0c122e",
      edgeLine: 0.28,
      edgeLineColor: "#2c3d78",
      ao: 1.05,
      aoTint: "#162358",
    },
  },
};

export const MOOD_OPTIONS: PapercraftMood[] = [
  MOODS.morning,
  MOODS.afternoon,
  MOODS.sunset,
  MOODS.night,
];

export interface MoodApplyTarget {
  scene: THREE.Scene;
  lights: PaperLightsRig;
  post: PaperPostInstance;
  shadowTarget: THREE.Vector3;
  glowSetters: Array<(v: number) => void>;
  lampLights: THREE.PointLight[];
  beaconMat: THREE.MeshBasicMaterial;
  extraEmissives: Array<{ mat: THREE.MeshLambertMaterial | THREE.MeshBasicMaterial; base: number }>;
  life?: LifeHandle | null;
}

const LIGHT_DIST = 64;

export function applyMoodToScene(period: TimePeriod, target: MoodApplyTarget): PapercraftMood {
  const m = MOODS[period] || MOODS.afternoon;

  target.scene.background = new THREE.Color(m.skyBg);

  target.lights.key.color.set(m.keyColor);
  target.lights.key.intensity = m.keyIntensity;
  const kDir = new THREE.Vector3(...m.keyDir).normalize();
  target.lights.key.position.copy(target.shadowTarget).addScaledVector(kDir, LIGHT_DIST);
  target.lights.key.target.position.copy(target.shadowTarget);

  target.lights.fill.color.set(m.fillColor);
  target.lights.fill.intensity = m.fillIntensity;
  const fDir = new THREE.Vector3(...m.fillDir).normalize();
  target.lights.fill.position.copy(target.shadowTarget).addScaledVector(fDir, LIGHT_DIST);
  target.lights.fill.target.position.copy(target.shadowTarget);

  target.lights.sky.color.set(m.skyColor);
  target.lights.sky.groundColor.set(m.groundColor);
  target.lights.sky.intensity = m.skyIntensity;

  PAPER_LIGHT.leak.value.set(m.leak);
  PAPER_LIGHT.wrap.value = m.wrap;
  PAPER_LIGHT.trans.value = m.trans;

  for (const fn of target.glowSetters) fn(m.glow);
  for (const pLight of target.lampLights) {
    pLight.intensity = m.lampIntensity;
  }
  for (const item of target.extraEmissives) {
    if ("emissiveIntensity" in item.mat) {
      item.mat.emissiveIntensity = item.base + m.glow * 0.9;
    }
  }
  target.beaconMat.opacity = m.beamOpacity;
  target.life?.setNight(m.nightFactor);

  Object.assign(target.post.o, LENS_DEFAULTS, m.post);
  target.post.apply();

  return m;
}
