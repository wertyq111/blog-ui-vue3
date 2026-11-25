// 胡桃木黄铜底座、四层地质切面地形、跨谷吊桥、朱红拱桥、双级飞瀑、琉璃海切面与海底珊瑚鱼群
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { COLORS, sampleLightingAtHour } from "./palette";
import type { IslandTextures } from "./textures";
import { BOX_HALF, SEABED_Y, TIER_LEVELS, WATER_TOP_Y, sampleDioramaTerrainY } from "./zones";

export interface FishActor {
  group: THREE.Group;
  tail: THREE.Object3D;
  centerX: number;
  centerZ: number;
  radiusX: number;
  radiusZ: number;
  baseY: number;
  speed: number;
  phase: number;
}

export interface TerrainParts {
  group: THREE.Group;
  waterMesh: THREE.Mesh;
  waterUniforms: {
    uTime: { value: number };
    uShallowColor: { value: THREE.Color };
    uDeepColor: { value: THREE.Color };
    uFoamColor: { value: THREE.Color };
    uSunColor: { value: THREE.Color };
    uSunDir: { value: THREE.Vector3 };
    uRippleCenter: { value: THREE.Vector2 };
    uRippleAge: { value: number };
    uFocusWaveAge: { value: number };
    uFocusWaveCenter: { value: THREE.Vector2 };
  };
  waterWallMat: THREE.MeshStandardMaterial;
  waterfallMat: THREE.MeshStandardMaterial;
  waterfallSplashPos: THREE.Vector3;
  reefGlowMats: THREE.MeshStandardMaterial[];
  kelpBlades: THREE.Mesh[];
  fishActors: FishActor[];
  dockLampMat: THREE.MeshStandardMaterial;
  dockLampHalo: THREE.Sprite;
  chestGlowMat: THREE.MeshStandardMaterial;
}

/** 胡桃木博物馆展台底座 + 拉丝黄铜饰条 + 正面铭牌 */
function buildMuseumPedestal(tex: IslandTextures, shadows: boolean): THREE.Group {
  const g = new THREE.Group();
  const outer = BOX_HALF * 2 + 0.56;

  const walnutMat = new THREE.MeshStandardMaterial({
    map: tex.walnutTex,
    roughness: 0.52,
    metalness: 0.05,
  });
  const brassMat = new THREE.MeshStandardMaterial({
    color: COLORS.brassGold,
    roughness: 0.3,
    metalness: 0.82,
  });

  const topTrim = new THREE.Mesh(
    new RoundedBoxGeometry(outer - 0.16, 0.14, outer - 0.16, 3, 0.04),
    brassMat
  );
  topTrim.position.y = -1.92;
  topTrim.receiveShadow = shadows;
  g.add(topTrim);

  const walnutBody = new THREE.Mesh(new RoundedBoxGeometry(outer, 0.72, outer, 4, 0.08), walnutMat);
  walnutBody.position.y = -2.32;
  walnutBody.receiveShadow = shadows;
  g.add(walnutBody);

  const footTrim = new THREE.Mesh(
    new RoundedBoxGeometry(outer + 0.24, 0.14, outer + 0.24, 3, 0.04),
    brassMat
  );
  footTrim.position.y = -2.72;
  g.add(footTrim);

  const plaqueBack = new THREE.Mesh(new RoundedBoxGeometry(3.45, 0.52, 0.1, 2, 0.03), brassMat);
  plaqueBack.position.set(0, -2.32, outer / 2 + 0.02);
  const plaqueFace = new THREE.Mesh(
    new THREE.PlaneGeometry(3.28, 0.44),
    new THREE.MeshStandardMaterial({
      map: tex.plaqueTex,
      roughness: 0.35,
      metalness: 0.45,
    })
  );
  plaqueFace.position.set(0, -2.32, outer / 2 + 0.075);
  g.add(plaqueBack, plaqueFace);

  return g;
}

/** 四层阶梯立体切片地形网格 + 外立面地质沉积岩层切面 */
function buildSlicedTerrainMesh(shadows: boolean): THREE.Group {
  const g = new THREE.Group();
  const N = 96;
  const stride = N + 1;
  const size = BOX_HALF * 2;

  const heights = new Float32Array(stride * stride);
  for (let iz = 0; iz <= N; iz++) {
    const z = -BOX_HALF + (iz / N) * size;
    for (let ix = 0; ix <= N; ix++) {
      const x = -BOX_HALF + (ix / N) * size;
      heights[iz * stride + ix] = sampleDioramaTerrainY(x, z);
    }
  }

  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];

  const cGrass = new THREE.Color(COLORS.grassLush);
  const cGrassHi = new THREE.Color(COLORS.grassHighlight);
  const cSand = new THREE.Color(COLORS.seabedSand);
  const cSlate = new THREE.Color(COLORS.slateRock);
  const cSlateLight = new THREE.Color(COLORS.slateLight);
  const tmp = new THREE.Color();

  for (let iz = 0; iz <= N; iz++) {
    const z = -BOX_HALF + (iz / N) * size;
    for (let ix = 0; ix <= N; ix++) {
      const x = -BOX_HALF + (ix / N) * size;
      const y = heights[iz * stride + ix];
      pos.push(x, y, z);

      const hx0 = heights[iz * stride + Math.max(0, ix - 1)];
      const hx1 = heights[iz * stride + Math.min(N, ix + 1)];
      const hz0 = heights[Math.max(0, iz - 1) * stride + ix];
      const hz1 = heights[Math.min(N, iz + 1) * stride + ix];
      const step = size / N;
      const slope = Math.hypot((hx1 - hx0) / (2 * step), (hz1 - hz0) / (2 * step));

      if (y < WATER_TOP_Y + 0.04) {
        const depthT = Math.min(1, Math.max(0, (WATER_TOP_Y - y) / 1.7));
        tmp.copy(cSand).lerp(new THREE.Color(0xdac18e), depthT * 0.55);
      } else if (slope > 0.65) {
        const rockMix = Math.min(1, (slope - 0.65) / 0.75);
        const hMix = Math.min(1, y / 3.8);
        tmp
          .copy(cSlate)
          .lerp(cSlateLight, hMix * 0.4)
          .lerp(cGrass, (1 - rockMix) * 0.45);
      } else {
        const hMix = Math.min(1, Math.max(0, y / 3.8));
        tmp.copy(cGrass).lerp(cGrassHi, hMix * 0.55);
      }
      col.push(tmp.r, tmp.g, tmp.b);
    }
  }

  for (let iz = 0; iz < N; iz++) {
    for (let ix = 0; ix < N; ix++) {
      const a = iz * stride + ix;
      const b = a + 1;
      const c = a + stride;
      const d = c + 1;
      idx.push(a, c, b);
      idx.push(b, c, d);
    }
  }

  const topGeo = new THREE.BufferGeometry();
  topGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  topGeo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  topGeo.setIndex(idx);
  topGeo.computeVertexNormals();

  const topMesh = new THREE.Mesh(
    topGeo,
    new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.88,
      metalness: 0.02,
    })
  );
  topMesh.castShadow = shadows;
  topMesh.receiveShadow = shadows;
  g.add(topMesh);

  // 四周垂直切面岩层壁
  const wallPos: number[] = [];
  const wallCol: number[] = [];
  const wallIdx: number[] = [];

  const cSoil = new THREE.Color(COLORS.soilCocoa);
  const cClay = new THREE.Color(COLORS.clayTerracotta);
  const cBedrock = new THREE.Color(COLORS.slateRock);
  const baseBottomY = -1.86;

  const addCutWall = (points: Array<{ x: number; z: number; topY: number }>, flip: boolean) => {
    const startVert = wallPos.length / 3;
    const rows = 5;
    for (let ir = 0; ir <= rows; ir++) {
      const rt = ir / rows;
      for (let ip = 0; ip < points.length; ip++) {
        const pt = points[ip];
        const y = THREE.MathUtils.lerp(pt.topY, baseBottomY, rt);
        wallPos.push(pt.x, y, pt.z);

        if (pt.topY < WATER_TOP_Y + 0.05) {
          tmp
            .copy(cSand)
            .lerp(cClay, rt * 0.65)
            .lerp(cBedrock, rt * 0.45);
        } else if (rt < 0.14) {
          tmp.copy(cGrass).lerp(cSoil, rt / 0.14);
        } else if (rt < 0.45) {
          tmp.copy(cSoil).lerp(cClay, (rt - 0.14) / 0.31);
        } else {
          tmp.copy(cClay).lerp(cBedrock, (rt - 0.45) / 0.55);
        }
        wallCol.push(tmp.r, tmp.g, tmp.b);
      }
    }
    const len = points.length;
    for (let ir = 0; ir < rows; ir++) {
      const r0 = startVert + ir * len;
      const r1 = startVert + (ir + 1) * len;
      for (let ip = 0; ip < len - 1; ip++) {
        if (flip) {
          wallIdx.push(r0 + ip, r0 + ip + 1, r1 + ip);
          wallIdx.push(r0 + ip + 1, r1 + ip + 1, r1 + ip);
        } else {
          wallIdx.push(r0 + ip, r1 + ip, r0 + ip + 1);
          wallIdx.push(r0 + ip + 1, r1 + ip, r1 + ip + 1);
        }
      }
    }
  };

  addCutWall(
    Array.from({ length: stride }, (_, ix) => ({
      x: -BOX_HALF + (ix / N) * size,
      z: -BOX_HALF,
      topY: heights[ix],
    })),
    true
  );
  addCutWall(
    Array.from({ length: stride }, (_, ix) => ({
      x: -BOX_HALF + (ix / N) * size,
      z: BOX_HALF,
      topY: heights[N * stride + ix],
    })),
    false
  );
  addCutWall(
    Array.from({ length: stride }, (_, iz) => ({
      x: -BOX_HALF,
      z: -BOX_HALF + (iz / N) * size,
      topY: heights[iz * stride],
    })),
    false
  );
  addCutWall(
    Array.from({ length: stride }, (_, iz) => ({
      x: BOX_HALF,
      z: -BOX_HALF + (iz / N) * size,
      topY: heights[iz * stride + N],
    })),
    true
  );

  const wallGeo = new THREE.BufferGeometry();
  wallGeo.setAttribute("position", new THREE.Float32BufferAttribute(wallPos, 3));
  wallGeo.setAttribute("color", new THREE.Float32BufferAttribute(wallCol, 3));
  wallGeo.setIndex(wallIdx);
  wallGeo.computeVertexNormals();

  const wallMesh = new THREE.Mesh(
    wallGeo,
    new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.9,
      metalness: 0.02,
      flatShading: true,
    })
  );
  wallMesh.receiveShadow = shadows;
  g.add(wallMesh);

  return g;
}

/** 构造跨谷木索吊桥、跨海朱红拱桥、石阶梯与双级飞瀑 */
function buildBridgesStairsAndWaterfall(
  tex: IslandTextures,
  shadows: boolean
): {
  group: THREE.Group;
  waterfallMat: THREE.MeshStandardMaterial;
  waterfallSplashPos: THREE.Vector3;
  dockLampMat: THREE.MeshStandardMaterial;
  dockLampHalo: THREE.Sprite;
} {
  const g = new THREE.Group();

  const woodMat = new THREE.MeshStandardMaterial({
    map: tex.woodPlankTex,
    roughness: 0.78,
  });
  const darkWoodMat = new THREE.MeshStandardMaterial({
    color: COLORS.darkTimber,
    roughness: 0.84,
  });
  const stoneMat = new THREE.MeshStandardMaterial({
    color: COLORS.slateLight,
    roughness: 0.85,
  });
  const vermilionMat = new THREE.MeshStandardMaterial({
    color: COLORS.vermilionBridge,
    roughness: 0.5,
  });

  // 1. 跨谷木索吊桥
  const startS = new THREE.Vector3(-1.45, TIER_LEVELS.tower - 0.15, -3.15);
  const endS = new THREE.Vector3(0.45, TIER_LEVELS.office + 0.05, -2.95);
  const span = startS.distanceTo(endS);
  const susBridge = new THREE.Group();
  susBridge.position.copy(startS);
  susBridge.lookAt(endS);

  const plankN = 9;
  for (let i = 0; i < plankN; i++) {
    const t = (i + 0.5) / plankN;
    const sag = Math.sin(t * Math.PI) * -0.22;
    const plank = new THREE.Mesh(new RoundedBoxGeometry(0.74, 0.07, 0.18, 2, 0.02), woodMat);
    plank.position.set(0, sag, t * span);
    plank.castShadow = shadows;
    plank.receiveShadow = shadows;
    susBridge.add(plank);
  }
  for (const side of [-0.38, 0.38]) {
    const ropePts: THREE.Vector3[] = [];
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      ropePts.push(new THREE.Vector3(side, Math.sin(t * Math.PI) * -0.22 + 0.34, t * span));
    }
    const rope = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ropePts), 12, 0.025, 6, false),
      darkWoodMat
    );
    susBridge.add(rope);
    for (const pz of [0.08, span - 0.08]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.45, 7), darkWoodMat);
      post.position.set(side, 0.2, pz);
      susBridge.add(post);
    }
  }
  g.add(susBridge);

  // 2. 跨海朱红太鼓拱桥
  const bStart = new THREE.Vector3(2.95, 0.14, -0.05);
  const bEnd = new THREE.Vector3(3.15, 0.08, 1.55);
  const bSpan = bStart.distanceTo(bEnd);
  const taikoBridge = new THREE.Group();
  taikoBridge.position.copy(bStart);
  taikoBridge.lookAt(bEnd);

  const archSteps = 10;
  for (let i = 0; i < archSteps; i++) {
    const t = (i + 0.5) / archSteps;
    const ay = Math.sin(t * Math.PI) * 0.42;
    const step = new THREE.Mesh(new RoundedBoxGeometry(0.92, 0.08, 0.16, 2, 0.02), woodMat);
    step.position.set(0, ay, t * bSpan);
    step.rotation.x = Math.cos(t * Math.PI) * -0.45;
    step.castShadow = shadows;
    step.receiveShadow = shadows;
    taikoBridge.add(step);
  }
  for (const side of [-0.46, 0.46]) {
    const railPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      railPts.push(new THREE.Vector3(side, Math.sin(t * Math.PI) * 0.42 + 0.34, t * bSpan));
    }
    const rail = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(railPts), 14, 0.04, 6, false),
      vermilionMat
    );
    rail.castShadow = shadows;
    taikoBridge.add(rail);
    for (const pt of [0.05, 0.5, 0.95]) {
      const py = Math.sin(pt * Math.PI) * 0.42;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.42, 7), vermilionMat);
      post.position.set(side, py + 0.18, pt * bSpan);
      taikoBridge.add(post);
      if (pt !== 0.5) {
        const finial = new THREE.Mesh(
          new THREE.SphereGeometry(0.06, 8, 6),
          new THREE.MeshStandardMaterial({
            color: COLORS.brassGold,
            metalness: 0.8,
            roughness: 0.3,
          })
        );
        finial.position.set(side, py + 0.42, pt * bSpan);
        taikoBridge.add(finial);
      }
    }
  }
  g.add(taikoBridge);

  // 3. 崖壁石阶梯
  const stairGroup = new THREE.Group();
  stairGroup.position.set(-2.2, 0.18, 2.25);
  stairGroup.rotation.y = 2.65;
  for (let i = 0; i < 6; i++) {
    const st = new THREE.Mesh(new RoundedBoxGeometry(0.82, 0.18, 0.28, 2, 0.04), stoneMat);
    st.position.set(0, i * 0.16, i * 0.22);
    st.castShadow = shadows;
    st.receiveShadow = shadows;
    stairGroup.add(st);
  }
  g.add(stairGroup);

  // 4. 海湾木栈码头 + 码头暖灯
  const dock = new THREE.Group();
  dock.position.set(-0.65, 0.04, 3.65);
  dock.rotation.y = 0.25;
  for (let i = 0; i < 8; i++) {
    const plank = new THREE.Mesh(new RoundedBoxGeometry(1.05, 0.07, 0.22, 2, 0.02), woodMat);
    plank.position.set(0, 0, i * 0.26);
    plank.castShadow = shadows;
    plank.receiveShadow = shadows;
    dock.add(plank);
  }
  for (const pz of [0.25, 1.0, 1.85]) {
    for (const px of [-0.46, 0.46]) {
      const pile = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 1.9, 8), darkWoodMat);
      pile.position.set(px, -0.92, pz);
      dock.add(pile);
    }
  }
  const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.9, 7), darkWoodMat);
  lampPole.position.set(-0.46, 0.45, 1.85);
  const dockLampMat = new THREE.MeshStandardMaterial({
    color: COLORS.lanternWarm,
    emissive: new THREE.Color(COLORS.lanternWarm),
    emissiveIntensity: 0,
    roughness: 0.2,
  });
  const dockBulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), dockLampMat);
  dockBulb.position.set(-0.46, 0.95, 1.85);
  const dockLampHalo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: tex.softGlowTex,
      color: 0xffe28a,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  dockLampHalo.position.set(-0.46, 0.95, 1.85);
  dockLampHalo.scale.set(1.4, 1.4, 1);
  dock.add(lampPole, dockBulb, dockLampHalo);
  g.add(dock);

  // 5. 双级动态飞瀑
  const waterfallMat = new THREE.MeshStandardMaterial({
    color: 0x6fd9f2,
    emissive: new THREE.Color(0x4bc5e8),
    emissiveIntensity: 0.16,
    roughness: 0.18,
    transparent: true,
    opacity: 0.88,
  });

  const wfCurve1 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.35, 2.25, -1.85),
    new THREE.Vector3(-1.55, 1.95, -0.95),
    new THREE.Vector3(-1.72, 1.38, -0.25),
    new THREE.Vector3(-1.78, 1.15, 0.3),
  ]);
  const wf1Geo = new THREE.TubeGeometry(wfCurve1, 18, 0.28, 8, false);
  wf1Geo.scale(1.1, 1, 0.45);
  g.add(new THREE.Mesh(wf1Geo, waterfallMat));

  const wfCurve2 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.72, 1.12, 0.45),
    new THREE.Vector3(-1.45, 0.72, 0.85),
    new THREE.Vector3(-1.15, 0.25, 1.18),
    new THREE.Vector3(-0.98, -0.08, 1.42),
  ]);
  const wf2Geo = new THREE.TubeGeometry(wfCurve2, 16, 0.3, 8, false);
  wf2Geo.scale(1.15, 1, 0.5);
  g.add(new THREE.Mesh(wf2Geo, waterfallMat));

  for (const [rx, ry, rz] of [
    [-1.65, 2.25, -1.9],
    [-1.05, 2.25, -1.9],
    [-2.05, 1.18, 0.25],
    [-1.4, 1.18, 0.28],
  ]) {
    const rk = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 1), stoneMat);
    rk.position.set(rx, ry, rz);
    rk.castShadow = shadows;
    g.add(rk);
  }

  return {
    group: g,
    waterfallMat,
    waterfallSplashPos: new THREE.Vector3(-0.98, -0.02, 1.42),
    dockLampMat,
    dockLampHalo,
  };
}

/** 构造琉璃海切面水体 + 海底珊瑚礁生态 + 发光宝箱 + 8 条热带小鱼 */
function buildCrystalSeaAndReef(
  periodHour: number,
  shadows: boolean
): {
  group: THREE.Group;
  waterMesh: THREE.Mesh;
  waterUniforms: TerrainParts["waterUniforms"];
  waterWallMat: THREE.MeshStandardMaterial;
  reefGlowMats: THREE.MeshStandardMaterial[];
  kelpBlades: THREE.Mesh[];
  fishActors: FishActor[];
  chestGlowMat: THREE.MeshStandardMaterial;
} {
  const g = new THREE.Group();
  const initL = sampleLightingAtHour(periodHour);

  const N = 88;
  const stride = N + 1;
  const half = BOX_HALF - 0.03;
  const size = half * 2;
  const wPos: number[] = [];
  const wTerrainY: number[] = [];
  const wIdx: number[] = [];

  for (let iz = 0; iz <= N; iz++) {
    const z = -half + (iz / N) * size;
    for (let ix = 0; ix <= N; ix++) {
      const x = -half + (ix / N) * size;
      wPos.push(x, WATER_TOP_Y, z);
      wTerrainY.push(sampleDioramaTerrainY(x, z));
    }
  }
  for (let iz = 0; iz < N; iz++) {
    for (let ix = 0; ix < N; ix++) {
      const a = iz * stride + ix;
      const b = a + 1;
      const c = a + stride;
      const d = c + 1;
      wIdx.push(a, c, b);
      wIdx.push(b, c, d);
    }
  }

  const waterGeo = new THREE.BufferGeometry();
  waterGeo.setAttribute("position", new THREE.Float32BufferAttribute(wPos, 3));
  waterGeo.setAttribute("aTerrainY", new THREE.Float32BufferAttribute(wTerrainY, 1));
  waterGeo.setIndex(wIdx);
  waterGeo.computeVertexNormals();

  const waterUniforms: TerrainParts["waterUniforms"] = {
    uTime: { value: 0 },
    uShallowColor: { value: new THREE.Color(initL.waterShallow) },
    uDeepColor: { value: new THREE.Color(initL.waterDeep) },
    uFoamColor: { value: new THREE.Color(initL.waterFoam) },
    uSunColor: { value: new THREE.Color(initL.sunColor) },
    uSunDir: { value: new THREE.Vector3(...initL.sunPos).normalize() },
    uRippleCenter: { value: new THREE.Vector2(1.5, 2.5) },
    uRippleAge: { value: 99 },
    uFocusWaveCenter: { value: new THREE.Vector2(3.2, 2.65) },
    uFocusWaveAge: { value: 99 },
  };

  const waterMat = new THREE.ShaderMaterial({
    uniforms: waterUniforms,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      attribute float aTerrainY;
      uniform float uTime;
      uniform vec2 uRippleCenter;
      uniform float uRippleAge;
      varying vec3 vWorldPos;
      varying float vTerrainY;
      varying float vWave;

      void main() {
        vec3 pos = position;
        float depth = max(0.0, -0.05 - aTerrainY);
        float damp = smoothstep(0.0, 0.35, depth);
        float w = sin(pos.x * 1.35 + uTime * 1.7) * cos(pos.z * 1.25 - uTime * 1.3) * 0.032 * damp;

        float dRip = length(pos.xz - uRippleCenter);
        float ripEnv = exp(-uRippleAge * 1.35) * exp(-abs(dRip - uRippleAge * 2.4) * 1.8);
        w += sin((dRip - uRippleAge * 2.4) * 8.0) * ripEnv * 0.055 * damp;

        pos.y += w;
        vWave = w;
        vTerrainY = aTerrainY;
        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        vWorldPos = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uShallowColor;
      uniform vec3 uDeepColor;
      uniform vec3 uFoamColor;
      uniform vec3 uSunColor;
      uniform vec3 uSunDir;
      uniform vec2 uRippleCenter;
      uniform float uRippleAge;
      uniform vec2 uFocusWaveCenter;
      uniform float uFocusWaveAge;
      varying vec3 vWorldPos;
      varying float vTerrainY;
      varying float vWave;

      void main() {
        float depth = -0.05 - vTerrainY;
        if (depth < -0.03) discard;

        float dMix = smoothstep(0.0, 1.65, max(0.0, depth));
        vec3 col = mix(uShallowColor, uDeepColor, dMix);

        float c1 = sin(vWorldPos.x * 2.4 + uTime * 1.1) * cos(vWorldPos.z * 2.2 - uTime * 0.9);
        float c2 = sin((vWorldPos.x + vWorldPos.z) * 1.8 - uTime * 0.8);
        float caustic = smoothstep(0.4, 0.92, (c1 + c2) * 0.5 + 0.35);
        col = mix(col, uShallowColor * 1.18, caustic * (1.0 - dMix * 0.6) * 0.28);

        float shoreRipple = sin(vWorldPos.x * 3.0 + uTime * 1.5) * cos(vWorldPos.z * 3.0 - uTime * 1.2) * 0.03;
        float foam1 = 1.0 - smoothstep(0.0, 0.14, abs(depth + shoreRipple - 0.04));
        float foam2 = (1.0 - smoothstep(0.0, 0.11, abs(depth + shoreRipple - 0.24 - 0.04 * sin(uTime * 1.8)))) * 0.45;
        float foam = clamp(foam1 + foam2, 0.0, 1.0) * smoothstep(-0.02, 0.03, depth);

        float dRip = length(vWorldPos.xz - uRippleCenter);
        float ripWave = (1.0 - smoothstep(0.0, 0.24, abs(dRip - uRippleAge * 2.4))) * exp(-uRippleAge * 1.2) * step(0.01, 4.0 - uRippleAge);
        foam = max(foam, ripWave * 0.9);

        float dFoc = length(vWorldPos.xz - uFocusWaveCenter);
        float focWave = (1.0 - smoothstep(0.0, 0.28, abs(dFoc - uFocusWaveAge * 2.2))) * exp(-uFocusWaveAge * 0.95) * step(0.01, 4.5 - uFocusWaveAge);
        col = mix(col, vec3(1.0, 0.88, 0.48), focWave * 0.88);

        vec3 viewDir = normalize(cameraPosition - vWorldPos);
        vec3 waveN = normalize(vec3(
          sin(vWorldPos.x * 2.6 + uTime * 1.3) * 0.07,
          1.0,
          cos(vWorldPos.z * 2.5 - uTime * 1.2) * 0.07
        ));
        vec3 halfV = normalize(uSunDir + viewDir);
        float spec = pow(max(dot(waveN, halfV), 0.0), 48.0) * 0.34;

        vec3 finalCol = mix(col, uFoamColor, foam * 0.9) + uSunColor * spec;

        float alpha = mix(0.36, 0.56, dMix);
        alpha = max(alpha, max(foam * 0.92, focWave * 0.9));

        gl_FragColor = vec4(finalCol, alpha);
      }
    `,
  });

  const waterMesh = new THREE.Mesh(waterGeo, waterMat);
  g.add(waterMesh);

  // 正面与右侧半透明琉璃海水切面侧壁
  const waterWallMat = new THREE.MeshStandardMaterial({
    color: initL.waterWall,
    roughness: 0.12,
    metalness: 0.05,
    transparent: true,
    opacity: 0.44,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const buildWaterSideWall = (axis: "frontZ" | "rightX") => {
    const segs = 64;
    const p: number[] = [];
    const ixArr: number[] = [];
    const edgePos = BOX_HALF - 0.015;
    for (let i = 0; i <= segs; i++) {
      const coord = -edgePos + (i / segs) * (edgePos * 2);
      const x = axis === "frontZ" ? coord : edgePos;
      const z = axis === "frontZ" ? edgePos : coord;
      const ty = sampleDioramaTerrainY(x, z);
      const topY = WATER_TOP_Y;
      const botY = Math.min(WATER_TOP_Y, Math.max(-1.82, ty));
      p.push(x, topY, z);
      p.push(x, botY, z);
    }
    for (let i = 0; i < segs; i++) {
      const a = i * 2;
      const b = a + 1;
      const c = a + 2;
      const d = a + 3;
      if (axis === "frontZ") {
        ixArr.push(a, b, c, c, b, d);
      } else {
        ixArr.push(a, c, b, c, d, b);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    geo.setIndex(ixArr);
    geo.computeVertexNormals();
    return new THREE.Mesh(geo, waterWallMat);
  };
  g.add(buildWaterSideWall("frontZ"), buildWaterSideWall("rightX"));

  // 海底珊瑚礁生态 + 海带 + 宝箱 + 8 条热带小鱼
  const reefGlowMats: THREE.MeshStandardMaterial[] = [];
  const makeCoralMat = (color: number, glowColor: number) => {
    const m = new THREE.MeshStandardMaterial({
      color,
      emissive: new THREE.Color(glowColor),
      emissiveIntensity: initL.reefGlow,
      roughness: 0.55,
    });
    reefGlowMats.push(m);
    return m;
  };

  const coralPinkMat = makeCoralMat(COLORS.coralPink, 0xff5e98);
  const coralTealMat = makeCoralMat(COLORS.coralTeal, 0x3bf5e3);
  const coralVioletMat = makeCoralMat(COLORS.coralViolet, 0xaa73ff);
  const coralGoldMat = makeCoralMat(COLORS.coralGold, 0xffb838);

  const coralSpots: Array<[number, number, number, THREE.Material, "stag" | "brain"]> = [
    [1.6, 1.2, 0.9, coralPinkMat, "stag"],
    [4.4, 0.6, 1.0, coralTealMat, "stag"],
    [4.5, 4.3, 0.95, coralVioletMat, "brain"],
    [0.5, 4.7, 0.85, coralPinkMat, "brain"],
    [2.3, 4.2, 0.9, coralGoldMat, "stag"],
    [4.6, 2.2, 0.8, coralTealMat, "brain"],
    [0.9, 2.1, 0.75, coralVioletMat, "stag"],
  ];

  for (const [cx, cz, sc, mat, kind] of coralSpots) {
    const gy = sampleDioramaTerrainY(cx, cz);
    if (gy > WATER_TOP_Y - 0.5) continue;
    const cg = new THREE.Group();
    cg.position.set(cx, gy, cz);
    cg.scale.setScalar(sc);

    if (kind === "stag") {
      for (let b = 0; b < 4; b++) {
        const a = (b / 4) * Math.PI * 2 + 0.3;
        const branch = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 0.36, 4, 8), mat);
        branch.position.set(Math.cos(a) * 0.14, 0.24, Math.sin(a) * 0.14);
        branch.rotation.z = -Math.cos(a) * 0.48;
        branch.rotation.x = Math.sin(a) * 0.48;
        cg.add(branch);
      }
    } else {
      const base = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), mat);
      base.scale.set(1.2, 0.75, 1.1);
      base.position.y = 0.14;
      const knob = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), mat);
      knob.position.set(0.16, 0.18, 0.08);
      cg.add(base, knob);
    }
    g.add(cg);
  }

  const kelpBlades: THREE.Mesh[] = [];
  const kelpMat = new THREE.MeshStandardMaterial({
    color: COLORS.kelpGreen,
    roughness: 0.72,
    side: THREE.DoubleSide,
  });
  for (const [kx, kz] of [
    [1.1, 1.5],
    [1.25, 1.65],
    [4.2, 4.7],
    [4.35, 4.55],
    [4.8, 1.4],
    [0.1, 4.6],
    [2.1, 4.8],
  ]) {
    const gy = sampleDioramaTerrainY(kx, kz);
    if (gy > WATER_TOP_Y - 0.7) continue;
    const bladeGeo = new THREE.BoxGeometry(0.12, 0.78, 0.03);
    bladeGeo.translate(0, 0.39, 0);
    const blade = new THREE.Mesh(bladeGeo, kelpMat);
    blade.position.set(kx, gy, kz);
    blade.rotation.y = kx * 1.4;
    kelpBlades.push(blade);
    g.add(blade);
  }

  const chestGroup = new THREE.Group();
  const chX = 2.65;
  const chZ = 4.65;
  chestGroup.position.set(chX, sampleDioramaTerrainY(chX, chZ) + 0.14, chZ);
  chestGroup.rotation.set(-0.08, -0.5, 0.1);
  const chestBox = new THREE.Mesh(
    new RoundedBoxGeometry(0.55, 0.34, 0.38, 2, 0.04),
    new THREE.MeshStandardMaterial({ color: COLORS.darkTimber, roughness: 0.75 })
  );
  const chestBand = new THREE.Mesh(
    new RoundedBoxGeometry(0.57, 0.08, 0.4, 2, 0.02),
    new THREE.MeshStandardMaterial({ color: COLORS.brassGold, metalness: 0.8, roughness: 0.3 })
  );
  chestBand.position.y = 0.08;
  const chestGlowMat = new THREE.MeshStandardMaterial({
    color: 0xffe47a,
    emissive: new THREE.Color(0xffd24c),
    emissiveIntensity: 0.85,
    roughness: 0.25,
  });
  const chestGlowSlit = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.05, 0.32), chestGlowMat);
  chestGlowSlit.position.y = 0.14;
  chestGroup.add(chestBox, chestBand, chestGlowSlit);
  g.add(chestGroup);

  const fishActors: FishActor[] = [];
  const fishColors = [COLORS.fishOrange, COLORS.fishBlue, COLORS.fishGold];
  for (let i = 0; i < 8; i++) {
    const fg = new THREE.Group();
    const fCol = fishColors[i % fishColors.length];
    const fMat = new THREE.MeshStandardMaterial({ color: fCol, roughness: 0.38 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), fMat);
    body.scale.set(0.72, 0.85, 1.55);
    const tailPivot = new THREE.Object3D();
    tailPivot.position.z = -0.15;
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.14, 4), fMat);
    tail.rotation.x = Math.PI / 2;
    tail.position.z = -0.05;
    tailPivot.add(tail);
    fg.add(body, tailPivot);

    const isRightBay = i % 2 === 0;
    const cx = isRightBay ? 3.55 : 2.1;
    const cz = isRightBay ? 1.45 : 3.55;
    g.add(fg);
    fishActors.push({
      group: fg,
      tail: tailPivot,
      centerX: cx,
      centerZ: cz,
      radiusX: 0.9 + (i % 3) * 0.32,
      radiusZ: 0.75 + (i % 2) * 0.35,
      baseY: Math.max(SEABED_Y + 0.35, -0.75 - (i % 3) * 0.24),
      speed: 0.55 + (i % 4) * 0.14,
      phase: i * 1.35,
    });
  }

  g.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.isMesh && mesh !== waterMesh && mesh.material !== waterWallMat) {
      mesh.receiveShadow = shadows;
    }
  });

  return {
    group: g,
    waterMesh,
    waterUniforms,
    waterWallMat,
    reefGlowMats,
    kelpBlades,
    fishActors,
    chestGlowMat,
  };
}

export function buildTerrain(
  tex: IslandTextures,
  periodHour: number,
  shadows: boolean
): TerrainParts {
  const group = new THREE.Group();
  group.add(buildMuseumPedestal(tex, shadows));
  group.add(buildSlicedTerrainMesh(shadows));

  const links = buildBridgesStairsAndWaterfall(tex, shadows);
  group.add(links.group);

  const sea = buildCrystalSeaAndReef(periodHour, shadows);
  group.add(sea.group);

  return {
    group,
    waterMesh: sea.waterMesh,
    waterUniforms: sea.waterUniforms,
    waterWallMat: sea.waterWallMat,
    waterfallMat: links.waterfallMat,
    waterfallSplashPos: links.waterfallSplashPos,
    reefGlowMats: sea.reefGlowMats,
    kelpBlades: sea.kelpBlades,
    fishActors: sea.fishActors,
    dockLampMat: links.dockLampMat,
    dockLampHalo: links.dockLampHalo,
    chestGlowMat: sea.chestGlowMat,
  };
}
