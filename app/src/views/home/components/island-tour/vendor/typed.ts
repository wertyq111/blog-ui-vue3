// 为 xikhar/papercraft (MIT) 纯 JS 模块提供准确 TypeScript 类型桥接，避免修改上游源码
import * as THREE from "three";
import { createLife as rawCreateLife } from "./paper-life.js";
import {
  mix as rawMix,
  rng as rawRng,
  shade as rawShade,
  shape as rawShape,
} from "./paperkit-2d.js";
import {
  boxFold as rawBoxFold,
  crossCard as rawCrossCard,
  enableSoftShadows as rawEnableSoftShadows,
  extrudedLayerStack as rawExtrudedLayerStack,
  fitShadow as rawFitShadow,
  hinge as rawHinge,
  LENS_DEFAULTS as RAW_LENS_DEFAULTS,
  makeCard as rawMakeCard,
  PAPER_LIGHT as RAW_PAPER_LIGHT,
  paperLights as rawPaperLights,
  paperMaterial as rawPaperMaterial,
  PaperPost as RawPaperPost,
  paperTextures as rawPaperTextures,
  platform as rawPlatform,
  prismFold as rawPrismFold,
  windSway as rawWindSway,
} from "./paperkit-3d.js";

export type Point2D = [number, number];
export type PaintFn = (P: any) => void;

export interface PaperTextures {
  sheet: HTMLCanvasElement;
  map: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
  unitsPerTile: number;
}

export interface PaperLightsRig {
  key: THREE.DirectionalLight;
  fill: THREE.DirectionalLight;
  sky: THREE.HemisphereLight;
}

export interface HingeHandle {
  group: THREE.Group;
  pivot: THREE.Group;
  spring: {
    x: number;
    v: number;
    target: number;
    step: (dt: number) => number;
    reset?: (p?: number) => void;
  };
  delay: number;
  open: number;
  sway: number;
  readonly p: number;
  set: (o: number, d?: number) => void;
  reset: (p?: number) => void;
  update: (dt: number) => number;
}

export interface LifeHandle {
  group: THREE.Group;
  fallers: (opts?: Record<string, any>) => any;
  motes: (opts?: Record<string, any>) => any;
  flyers: (opts?: Record<string, any>) => any;
  flock: (opts?: Record<string, any>) => any;
  puffs: (opts?: Record<string, any>) => any;
  update: (dt: number, at?: THREE.Vector3 | null) => void;
  reset: (at?: THREE.Vector3 | null) => void;
  setNight: (k: number) => void;
}

export interface PaperPostInstance {
  o: Record<string, any>;
  focus: THREE.Vector3;
  apply: () => void;
  setSize: (w: number, h: number) => void;
  render: (time?: number) => void;
  dispose: () => void;
}

export const PAPER_LIGHT = RAW_PAPER_LIGHT as {
  wrap: { value: number };
  leak: { value: THREE.Color };
  trans: { value: number };
  transTint: { value: THREE.Color };
};

export const LENS_DEFAULTS = RAW_LENS_DEFAULTS as Record<string, any>;

export const rng = rawRng as (seed?: number) => () => number;
export const mix = rawMix as (a: string, b: string, t: number) => string;
export const shade = rawShade as (c: string, k: number) => string;

export const P2shape = rawShape as unknown as {
  rect: (w: number, h: number) => Point2D[];
  mound: (
    r: () => number,
    opts?: { w?: number; h?: number; lobes?: number; depth?: number; n?: number }
  ) => Point2D[];
  radial: (
    r: () => number,
    opts?: {
      cx?: number;
      cy?: number;
      rx?: number;
      ry?: number;
      lobes?: number;
      depth?: number;
      spiky?: boolean;
      wobble?: number;
      n?: number;
      stalk?: { w: number; base: number } | null;
    }
  ) => Point2D[];
  hill: (
    r: () => number,
    opts?: { w?: number; h?: number; bumps?: number; n?: number }
  ) => Point2D[];
  waves: (
    r: () => number,
    opts?: { w?: number; h?: number; crests?: number; n?: number }
  ) => Point2D[];
  ngon: (n?: number, r?: number, opts?: { phase?: number }) => Point2D[];
  roundedRect: (w: number, h: number, r?: number, segs?: number) => Point2D[];
  cloud: (
    rOrOpts: (() => number) | number | Record<string, any>,
    opts?: { w?: number; h?: number; puffs?: number; n?: number }
  ) => Point2D[];
};

export const paperTextures = rawPaperTextures as (
  renderer: THREE.WebGLRenderer,
  opts?: {
    color?: string;
    seed?: number;
    size?: number;
    unitsPerTile?: number;
    normalStrength?: number;
    fibres?: number;
    mottle?: number;
  }
) => PaperTextures;

export const paperMaterial = rawPaperMaterial as (opts?: {
  color?: string | number;
  map?: THREE.Texture | null;
  normalMap?: THREE.Texture | null;
  normalScale?: number;
  side?: THREE.Side;
  emissive?: THREE.Color | string | number | null;
  emissiveIntensity?: number;
  vertexColors?: boolean;
  alphaTest?: number;
}) => THREE.MeshLambertMaterial;

export const makeCard = rawMakeCard as (pts: Point2D[], opts?: Record<string, any>) => THREE.Mesh;
export const crossCard = rawCrossCard as (
  pts: Point2D[],
  opts?: Record<string, any>
) => THREE.Group;
export const boxFold = rawBoxFold as (opts?: Record<string, any>) => THREE.Group;
export const prismFold = rawPrismFold as (
  footprint: Point2D[],
  opts?: Record<string, any>
) => THREE.Group;
export const platform = rawPlatform as (opts?: Record<string, any>) => THREE.Group;
export const extrudedLayerStack = rawExtrudedLayerStack as (
  shape2d: Point2D[] | THREE.Shape,
  opts?: Record<string, any>
) => THREE.Group;
export const hinge = rawHinge as (
  child: THREE.Object3D,
  opts?: {
    at?: THREE.Vector3;
    yaw?: number;
    open?: number;
    size?: number;
    flat?: number;
    rest?: number;
    delay?: number;
    spring?: any;
  }
) => HingeHandle;
export const windSway = rawWindSway as (
  t: number,
  x: number,
  z: number,
  opts?: { amp?: number; hz?: number; phase?: number; dir?: number; heroHeight?: number }
) => number;

export const enableSoftShadows = rawEnableSoftShadows as (
  light: THREE.DirectionalLight,
  opts?: {
    softness?: number;
    maxPenumbra?: number;
    minPenumbra?: number;
    sheet?: number;
    blockerSamples?: number;
    filterSamples?: number;
  }
) => boolean;

export const paperLights = rawPaperLights as (
  scene: THREE.Scene,
  opts?: {
    key?: string;
    keyIntensity?: number;
    keyDir?: [number, number, number];
    fill?: string;
    fillIntensity?: number;
    fillDir?: [number, number, number];
    sky?: string;
    ground?: string;
    skyIntensity?: number;
    target?: THREE.Vector3;
    shadowExtent?: number;
    mapSize?: number;
    distance?: number;
  }
) => PaperLightsRig;

export const fitShadow = rawFitShadow as (lights: PaperLightsRig, center: THREE.Vector3) => void;

export const createLife = rawCreateLife as (opts: {
  scene: THREE.Scene;
  camera: THREE.Camera;
  heroHeight?: number;
  seed?: number;
  wind?: [number, number];
  box?: { w: number; d: number; h: number };
  groundY?: ((x: number, z: number) => number) | null;
}) => LifeHandle;

export const PaperPost = RawPaperPost as unknown as new (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  opts?: Record<string, any>
) => PaperPostInstance;
