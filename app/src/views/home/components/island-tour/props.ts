// 高崖雪松、铁艺路灯、漂浮云朵、盘旋海鸥，以及机关增强粒子系统（樱花瓣雨、白烟水雾、珍珠气泡、萤火虫）
import * as THREE from "three";
import { COLORS } from "./palette";
import type { IslandTextures } from "./textures";
import { WATER_TOP_Y, sampleDioramaTerrainY, zones } from "./zones";

export interface CloudActor {
  group: THREE.Group;
  angle: number;
  radius: number;
  height: number;
  speed: number;
  bobPhase: number;
}

export interface BirdActor {
  group: THREE.Group;
  wingL: THREE.Object3D;
  wingR: THREE.Object3D;
  angle: number;
  radius: number;
  height: number;
  speed: number;
  phase: number;
}

export interface PetalParticle {
  mesh: THREE.Mesh;
  age: number;
  life: number;
  originX: number;
  originY: number;
  originZ: number;
  driftX: number;
  driftZ: number;
  spin: number;
}

export interface SmokeParticle {
  mesh: THREE.Mesh;
  age: number;
  life: number;
  driftX: number;
  driftZ: number;
}

export interface SplashParticle {
  mesh: THREE.Mesh;
  age: number;
  life: number;
  angle: number;
}

export interface BubbleParticle {
  mesh: THREE.Mesh;
  age: number;
  life: number;
  x: number;
  z: number;
  startY: number;
}

export interface FireflyItem {
  sprite: THREE.Sprite;
  baseX: number;
  baseY: number;
  baseZ: number;
  phase: number;
  speed: number;
}

export interface PropsParts {
  group: THREE.Group;
  lampBulbMat: THREE.MeshStandardMaterial;
  lampHalos: THREE.Sprite[];
  cloudMat: THREE.MeshStandardMaterial;
  clouds: CloudActor[];
  birds: BirdActor[];
  petals: PetalParticle[];
  smokeParticles: SmokeParticle[];
  splashParticles: SplashParticle[];
  bubbles: BubbleParticle[];
  fireflies: FireflyItem[];
  burstBubblesAt: (x: number, z: number) => void;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildProps(
  tex: IslandTextures,
  waterfallSplashPos: THREE.Vector3,
  shadows: boolean
): PropsParts {
  const group = new THREE.Group();
  const rnd = mulberry32(88);

  // ---- 1. 高崖雪松与海岸灌木 ----
  const trunkMat = new THREE.MeshStandardMaterial({ color: COLORS.darkTimber, roughness: 0.88 });
  const cedarTopMat = new THREE.MeshStandardMaterial({ color: 0x4b9355, roughness: 0.82 });
  const cedarMidMat = new THREE.MeshStandardMaterial({ color: 0x3b7846, roughness: 0.85 });

  const cedarSpots: Array<[number, number, number]> = [
    [-4.6, -4.4, 0.95],
    [-4.7, -2.1, 0.82],
    [4.45, -4.3, 0.9],
    [4.55, -2.0, 0.85],
    [-4.55, 2.25, 0.86],
    [-4.35, 4.45, 0.78],
  ];
  for (const [cx, cz, sc] of cedarSpots) {
    const gy = sampleDioramaTerrainY(cx, cz);
    if (gy < 0.08) continue;
    const cg = new THREE.Group();
    cg.position.set(cx, gy, cz);
    cg.scale.setScalar(sc);
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.6, 7), trunkMat);
    tr.position.y = 0.3;
    const c1 = new THREE.Mesh(new THREE.ConeGeometry(0.62, 0.78, 8), cedarMidMat);
    c1.position.y = 0.88;
    const c2 = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.7, 8), cedarTopMat);
    c2.position.y = 1.32;
    const c3 = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.56, 8), cedarTopMat);
    c3.position.y = 1.7;
    cg.add(tr, c1, c2, c3);
    cg.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = shadows;
        o.receiveShadow = shadows;
      }
    });
    group.add(cg);
  }

  // ---- 2. 铁艺暖光路灯（4 盏沿山路与海岸分布） ----
  const lampPostMat = new THREE.MeshStandardMaterial({
    color: 0x383e48,
    roughness: 0.45,
    metalness: 0.6,
  });
  const lampBulbMat = new THREE.MeshStandardMaterial({
    color: COLORS.lanternWarm,
    emissive: new THREE.Color(COLORS.lanternWarm),
    emissiveIntensity: 0,
    roughness: 0.2,
  });
  const lampHalos: THREE.Sprite[] = [];
  for (const [lx, lz] of [
    [2.65, -0.75],
    [-1.4, 2.65],
    [-4.35, 0.9],
    [-2.05, -2.5],
  ]) {
    const gy = sampleDioramaTerrainY(lx, lz);
    const lg = new THREE.Group();
    lg.position.set(lx, gy, lz);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.045, 1.15, 7), lampPostMat);
    pole.position.y = 0.58;
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.095, 10, 8), lampBulbMat);
    bulb.position.y = 1.22;
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.1, 8), lampPostMat);
    cap.position.y = 1.32;
    lg.add(pole, bulb, cap);

    const halo = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: tex.softGlowTex,
        color: 0xffe28a,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    halo.position.y = 1.22;
    halo.scale.set(1.5, 1.5, 1);
    lg.add(halo);
    lampHalos.push(halo);
    group.add(lg);
  }

  // ---- 3. 五瓣野花点缀（InstancedMesh 合批） ----
  const flowerCoords: Array<{ x: number; y: number; z: number }> = [];
  for (let tries = 0; flowerCoords.length < 24 && tries < 400; tries++) {
    const fx = (rnd() - 0.5) * 9.8;
    const fz = (rnd() - 0.5) * 9.8;
    const fy = sampleDioramaTerrainY(fx, fz);
    if (fy < 0.14) continue;
    if (zones.some((z) => Math.hypot(fx - z.x, fz - z.z) < 1.65)) continue;
    flowerCoords.push({ x: fx, y: fy, z: fz });
  }
  const petalGeo = new THREE.SphereGeometry(0.06, 6, 5);
  const petalMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.65 });
  const flowers = new THREE.InstancedMesh(petalGeo, petalMat, flowerCoords.length);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const fColors = [0xffa3c0, 0xffe26b, 0x9cd6ff, 0xfffaf0];
  flowerCoords.forEach((f, idx) => {
    m.compose(new THREE.Vector3(f.x, f.y + 0.06, f.z), q, new THREE.Vector3(1.1, 0.7, 1.1));
    flowers.setMatrixAt(idx, m);
    flowers.setColorAt(idx, new THREE.Color(fColors[idx % fColors.length]));
  });
  flowers.instanceMatrix.needsUpdate = true;
  if (flowers.instanceColor) flowers.instanceColor.needsUpdate = true;
  group.add(flowers);

  // ---- 4. 蓬松 3D 云朵（环绕箱庭上空缓慢漂浮） ----
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.92,
    transparent: true,
    opacity: 0.88,
  });
  const clouds: CloudActor[] = [];
  for (let i = 0; i < 4; i++) {
    const cg = new THREE.Group();
    for (const [px, py, pz, pr] of [
      [0, 0, 0, 0.56],
      [-0.46, -0.06, 0.06, 0.4],
      [0.48, -0.05, -0.04, 0.44],
      [0.14, 0.18, 0.1, 0.36],
    ]) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(pr, 10, 8), cloudMat);
      puff.position.set(px, py, pz);
      puff.scale.set(1.15, 0.76, 0.95);
      cg.add(puff);
    }
    const radius = 6.2 + (i % 2) * 1.4;
    const angle = (i / 4) * Math.PI * 2;
    const height = 7.4 + (i % 2) * 0.95;
    cg.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
    group.add(cg);
    clouds.push({
      group: cg,
      angle,
      radius,
      height,
      speed: 0.036 + (i % 2) * 0.012,
      bobPhase: i * 1.4,
    });
  }

  // ---- 5. 盘旋海鸥 ----
  const birds: BirdActor[] = [];
  const birdMat = new THREE.MeshStandardMaterial({ color: 0xfffaf0, roughness: 0.65 });
  for (let i = 0; i < 3; i++) {
    const bg = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.18, 4, 6), birdMat);
    body.rotation.x = Math.PI / 2;
    const wingL = new THREE.Object3D();
    const wl = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.02, 0.09), birdMat);
    wl.position.x = -0.14;
    wingL.add(wl);
    const wingR = new THREE.Object3D();
    const wr = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.02, 0.09), birdMat);
    wr.position.x = 0.14;
    wingR.add(wr);
    bg.add(body, wingL, wingR);
    group.add(bg);
    birds.push({
      group: bg,
      wingL,
      wingR,
      angle: i * 2.1,
      radius: 4.5 + i * 0.85,
      height: 6.2 + i * 0.55,
      speed: 0.3 + i * 0.04,
      phase: i * 1.6,
    });
  }

  // ---- 6. 樱花花瓣飘落粒子 ----
  const petals: PetalParticle[] = [];
  const petalGeoFall = new THREE.PlaneGeometry(0.11, 0.08);
  const officeZ = zones.find((z) => z.key === "office")!;
  for (let i = 0; i < 28; i++) {
    const pm = new THREE.Mesh(
      petalGeoFall,
      new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? COLORS.sakuraDeep : COLORS.sakuraSoft,
        roughness: 0.65,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
      })
    );
    group.add(pm);
    petals.push({
      mesh: pm,
      age: (i / 28) * 5.0,
      life: 5.0,
      originX: officeZ.x + (rnd() - 0.5) * 2.6,
      originY: officeZ.groundY + 3.2 + rnd() * 0.9,
      originZ: officeZ.z + (rnd() - 0.5) * 2.4,
      driftX: (rnd() - 0.35) * 0.6,
      driftZ: (rnd() - 0.25) * 0.7,
      spin: 1.5 + rnd() * 2.5,
    });
  }

  // ---- 7. 工坊烟囱白烟 & 瀑布水花 ----
  const smokeParticles: SmokeParticle[] = [];
  for (let i = 0; i < 9; i++) {
    const sm = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 8, 6),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        roughness: 0.95,
        depthWrite: false,
      })
    );
    group.add(sm);
    smokeParticles.push({
      mesh: sm,
      age: (i / 9) * 3.0,
      life: 3.0,
      driftX: (i % 2 === 0 ? 1 : -1) * 0.12,
      driftZ: 0.08,
    });
  }

  const splashParticles: SplashParticle[] = [];
  for (let i = 0; i < 10; i++) {
    const sp = new THREE.Mesh(
      new THREE.SphereGeometry(0.085, 7, 5),
      new THREE.MeshStandardMaterial({
        color: 0xf4fcff,
        transparent: true,
        opacity: 0,
        roughness: 0.45,
        depthWrite: false,
      })
    );
    sp.position.copy(waterfallSplashPos);
    group.add(sp);
    splashParticles.push({
      mesh: sp,
      age: (i / 10) * 1.3,
      life: 1.3,
      angle: (i / 10) * Math.PI * 2,
    });
  }

  // ---- 8. 海底珍珠气泡串 ----
  const bubbles: BubbleParticle[] = [];
  const bubbleMat = new THREE.MeshStandardMaterial({
    color: 0xe6fbff,
    emissive: new THREE.Color(0x8ae8ff),
    emissiveIntensity: 0.25,
    roughness: 0.1,
    transparent: true,
    opacity: 0.72,
  });
  for (let i = 0; i < 16; i++) {
    const bm = new THREE.Mesh(new THREE.SphereGeometry(0.045 + (i % 3) * 0.015, 8, 6), bubbleMat);
    const bx = 1.4 + (i % 4) * 0.9;
    const bz = 1.2 + Math.floor(i / 4) * 0.95;
    const by = Math.min(-0.9, sampleDioramaTerrainY(bx, bz) + 0.15);
    group.add(bm);
    bubbles.push({
      mesh: bm,
      age: (i / 16) * 2.4,
      life: 2.4,
      x: bx,
      z: bz,
      startY: by,
    });
  }

  const burstBubblesAt = (x: number, z: number) => {
    const bedY = Math.min(-0.6, sampleDioramaTerrainY(x, z) + 0.12);
    if (bedY >= WATER_TOP_Y - 0.2) return;
    bubbles.slice(0, 8).forEach((b, idx) => {
      b.x = x + (Math.random() - 0.5) * 0.55;
      b.z = z + (Math.random() - 0.5) * 0.55;
      b.startY = bedY;
      b.age = (idx / 8) * 0.6;
    });
  };

  // ---- 9. 星夜萤火虫 ----
  const fireflies: FireflyItem[] = [];
  for (let i = 0; i < 18; i++) {
    const fx = (rnd() - 0.5) * 9.5;
    const fz = (rnd() - 0.5) * 9.5;
    const fy = Math.max(0.4, sampleDioramaTerrainY(fx, fz) + 0.55 + rnd() * 1.1);
    const sp = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: tex.softGlowTex,
        color: 0xffe878,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    sp.position.set(fx, fy, fz);
    sp.scale.set(0.32, 0.32, 1);
    group.add(sp);
    fireflies.push({
      sprite: sp,
      baseX: fx,
      baseY: fy,
      baseZ: fz,
      phase: rnd() * Math.PI * 2,
      speed: 0.8 + rnd() * 0.9,
    });
  }

  return {
    group,
    lampBulbMat,
    lampHalos,
    cloudMat,
    clouds,
    birds,
    petals,
    smokeParticles,
    splashParticles,
    bubbles,
    fireflies,
    burstBubblesAt,
  };
}
