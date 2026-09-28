// 小岛几何体：全部由基础几何体拼成，卡通三阶着色
import * as THREE from "three";
import { COLORS } from "./palette";
import { ISLAND_RADIUS, ZONE_RING, zoneDirection, zones, type ZoneKey } from "./zones";

export interface IslandParts {
  root: THREE.Group;
  /** 各分区地标，userData.zoneKey 为分区 key */
  landmarks: Map<ZoneKey, THREE.Group>;
  /** 所有窗户与灯室共用的材质，夜间调 emissiveIntensity */
  windowMat: THREE.MeshToonMaterial;
  beamMat: THREE.MeshBasicMaterial;
  /** 灯塔光束的旋转轴 */
  beamPivot: THREE.Object3D;
  /** 工坊屋顶的齿轮，绕自身 z 轴旋转 */
  gears: THREE.Object3D[];
  sea: THREE.Mesh;
  /** 海面顶点的初始坐标，波浪在此基础上偏移 */
  seaBase: Float32Array;
}

/** 三阶色带：暗 / 中 / 亮，最近邻采样得到平涂卡通光感 */
export function createToonGradient(): THREE.DataTexture {
  const tex = new THREE.DataTexture(new Uint8Array([90, 170, 255]), 3, 1, THREE.RedFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

// 固定种子的伪随机，保证每次生成的小岛完全一样
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 顶点抖动 + 拆成非索引几何体重算法线，得到手捏积木的面片感。
// 同一坐标的顶点（接缝处的重复顶点）取同一偏移，避免裂缝。
function lowPoly(geo: THREE.BufferGeometry, amount: number, seed: number): THREE.BufferGeometry {
  const rnd = mulberry32(seed);
  const pos = geo.getAttribute("position") as THREE.BufferAttribute;
  const offsets = new Map<string, [number, number, number]>();
  for (let i = 0; i < pos.count; i++) {
    const key = `${pos.getX(i).toFixed(3)},${pos.getY(i).toFixed(3)},${pos.getZ(i).toFixed(3)}`;
    let o = offsets.get(key);
    if (!o) {
      o = [(rnd() - 0.5) * amount, (rnd() - 0.5) * amount * 0.6, (rnd() - 0.5) * amount];
      offsets.set(key, o);
    }
    pos.setXYZ(i, pos.getX(i) + o[0], pos.getY(i) + o[1], pos.getZ(i) + o[2]);
  }
  const flat = geo.toNonIndexed();
  flat.computeVertexNormals();
  geo.dispose();
  return flat;
}

export function buildIsland(gradient: THREE.Texture, shadows: boolean): IslandParts {
  const root = new THREE.Group();
  const mats = new Map<number, THREE.MeshToonMaterial>();
  const toon = (color: number) => {
    let m = mats.get(color);
    if (!m) {
      m = new THREE.MeshToonMaterial({ color, gradientMap: gradient });
      mats.set(color, m);
    }
    return m;
  };
  const windowMat = new THREE.MeshToonMaterial({
    color: COLORS.window,
    gradientMap: gradient,
    emissive: new THREE.Color(COLORS.windowLit),
    emissiveIntensity: 0,
  });
  const mesh = (
    geo: THREE.BufferGeometry,
    mat: number | THREE.Material,
    x = 0,
    y = 0,
    z = 0
  ): THREE.Mesh => {
    const m = new THREE.Mesh(geo, typeof mat === "number" ? toon(mat) : mat);
    m.position.set(x, y, z);
    m.castShadow = shadows;
    m.receiveShadow = shadows;
    return m;
  };
  const R = ISLAND_RADIUS;

  // ---- 岛体：草地 / 沙滩 / 岩壁 ----
  root.add(
    mesh(
      lowPoly(new THREE.CylinderGeometry(R, R * 0.97, 0.6, 28, 1), 0.25, 1),
      COLORS.grass,
      0,
      -0.3,
      0
    )
  );
  root.add(
    mesh(
      lowPoly(new THREE.CylinderGeometry(R + 1, R + 1.3, 0.5, 28, 1), 0.3, 2),
      COLORS.sand,
      0,
      -0.55,
      0
    )
  );
  root.add(
    mesh(
      lowPoly(new THREE.CylinderGeometry(R + 1.3, R * 0.55, 3.2, 28, 2), 0.5, 3),
      COLORS.cliff,
      0,
      -2.4,
      0
    )
  );

  // ---- 海面：环形网格，波浪在 scene 里逐帧改顶点 y ----
  const seaGeo = new THREE.RingGeometry(R + 0.6, R + 11, 64, 8);
  seaGeo.rotateX(-Math.PI / 2);
  const seaMat = new THREE.MeshToonMaterial({
    color: COLORS.sea,
    gradientMap: gradient,
    transparent: true,
    opacity: 0.92,
  });
  const sea = new THREE.Mesh(seaGeo, seaMat);
  sea.position.y = -0.7;
  sea.receiveShadow = shadows;
  root.add(sea);
  const seaBase = Float32Array.from(
    (seaGeo.getAttribute("position") as THREE.BufferAttribute).array
  );

  // ---- 中心广场与大树 ----
  root.add(mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.08, 20), COLORS.sand, 0, 0.04, 0));
  root.add(mesh(new THREE.CylinderGeometry(0.3, 0.4, 2, 7), COLORS.trunk, 0, 1, 0));
  root.add(mesh(new THREE.IcosahedronGeometry(1.6, 0), COLORS.leaf, 0, 2.8, 0));
  root.add(mesh(new THREE.IcosahedronGeometry(1.1, 0), COLORS.grass, 0.7, 3.6, 0.3));

  // ---- 地标 ----
  const gears: THREE.Object3D[] = [];
  const beamPivot = new THREE.Object3D();
  const beamMat = new THREE.MeshBasicMaterial({
    color: COLORS.beam,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const win = (w: number, h: number, x: number, y: number, z: number) =>
    mesh(new THREE.BoxGeometry(w, h, 0.06), windowMat, x, y, z);

  // 地标在本地坐标里正面朝 +z，底面在 y = 0
  const builders: Record<ZoneKey, () => THREE.Group> = {
    office: () => {
      const g = new THREE.Group();
      g.add(mesh(new THREE.BoxGeometry(2.2, 2.6, 1.8), COLORS.wall, 0, 1.3, 0));
      g.add(mesh(new THREE.BoxGeometry(2.3, 0.12, 1.9), COLORS.wood, 0, 1.35, 0));
      const roof = mesh(new THREE.ConeGeometry(1.75, 1.1, 4), COLORS.roofOrange, 0, 3.15, 0);
      roof.rotation.y = Math.PI / 4;
      g.add(roof);
      g.add(mesh(new THREE.BoxGeometry(0.55, 0.95, 0.06), COLORS.wood, 0, 0.48, 0.92));
      g.add(win(0.45, 0.45, -0.65, 0.9, 0.92), win(0.45, 0.45, 0.65, 0.9, 0.92));
      g.add(win(0.45, 0.45, -0.55, 2.0, 0.92), win(0.45, 0.45, 0.55, 2.0, 0.92));
      // 邮筒
      g.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 6), COLORS.trunk, 1.45, 0.35, 1.1));
      g.add(mesh(new THREE.BoxGeometry(0.35, 0.28, 0.25), COLORS.mailbox, 1.45, 0.8, 1.1));
      // 告示板
      g.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 1, 6), COLORS.trunk, -1.75, 0.5, 1.1));
      g.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 1, 6), COLORS.trunk, -1.15, 0.5, 1.1));
      g.add(mesh(new THREE.BoxGeometry(0.8, 0.5, 0.06), COLORS.wood, -1.45, 0.9, 1.1));
      // 屋后栅栏
      for (let i = 0; i < 4; i++)
        g.add(mesh(new THREE.BoxGeometry(0.1, 0.5, 0.1), COLORS.wood, -0.9 + i * 0.6, 0.25, -1.3));
      g.add(mesh(new THREE.BoxGeometry(2, 0.08, 0.06), COLORS.wood, 0, 0.38, -1.3));
      return g;
    },
    workshop: () => {
      const g = new THREE.Group();
      g.add(mesh(new THREE.BoxGeometry(2.4, 1.7, 2), COLORS.wood, 0, 0.85, 0));
      const shape = new THREE.Shape();
      shape.moveTo(-1.4, 0);
      shape.lineTo(1.4, 0);
      shape.lineTo(0, 1.1);
      shape.closePath();
      const roofGeo = new THREE.ExtrudeGeometry(shape, { depth: 2.2, bevelEnabled: false });
      roofGeo.translate(0, 0, -1.1);
      g.add(mesh(roofGeo, COLORS.roofRed, 0, 1.7, 0));
      g.add(mesh(new THREE.BoxGeometry(0.35, 0.8, 0.35), COLORS.stone, 0.7, 2.5, -0.4));
      g.add(mesh(new THREE.BoxGeometry(0.6, 1, 0.06), COLORS.outline, -0.5, 0.5, 1.02));
      g.add(win(0.5, 0.45, 0.6, 0.95, 1.02));
      // 山墙上的齿轮
      const gear = new THREE.Group();
      const disc = mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.14, 10), COLORS.stone);
      disc.rotation.x = Math.PI / 2;
      gear.add(disc);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const tooth = mesh(
          new THREE.BoxGeometry(0.16, 0.16, 0.14),
          COLORS.stone,
          Math.cos(a) * 0.5,
          Math.sin(a) * 0.5,
          0
        );
        tooth.rotation.z = a;
        gear.add(tooth);
      }
      gear.position.set(0, 2.15, 1.12);
      gears.push(gear);
      g.add(gear);
      return g;
    },
    pomo: () => {
      const g = new THREE.Group();
      g.add(mesh(new THREE.CylinderGeometry(1.15, 1.2, 0.9, 14), COLORS.wall, 0, 0.45, 0));
      const dome = mesh(new THREE.SphereGeometry(1.3, 14, 10), COLORS.tomato, 0, 1.2, 0);
      dome.scale.set(1, 0.8, 1);
      g.add(dome);
      g.add(mesh(new THREE.ConeGeometry(0.12, 0.35, 6), COLORS.leaf, 0, 2.35, 0));
      for (let i = 0; i < 5; i++) {
        const leaf = mesh(new THREE.BoxGeometry(0.5, 0.06, 0.18), COLORS.leaf, 0, 2.2, 0);
        leaf.rotation.y = (i / 5) * Math.PI * 2;
        leaf.translateX(0.25);
        g.add(leaf);
      }
      g.add(mesh(new THREE.BoxGeometry(0.5, 0.8, 0.08), COLORS.wood, 0, 0.4, 1.17));
      const round = mesh(
        new THREE.CylinderGeometry(0.22, 0.22, 0.06, 12),
        windowMat,
        0,
        1.35,
        1.22
      );
      round.rotation.x = Math.PI / 2;
      g.add(round);
      return g;
    },
    studio: () => {
      const g = new THREE.Group();
      g.add(mesh(new THREE.BoxGeometry(2.2, 1.9, 1.9), COLORS.wall, 0, 0.95, 0));
      g.add(mesh(new THREE.BoxGeometry(2.4, 0.2, 2.1), COLORS.wood, 0, 1.95, 0));
      const lensRing = mesh(
        new THREE.CylinderGeometry(0.75, 0.75, 0.35, 20),
        COLORS.outline,
        0,
        1.05,
        1.1
      );
      lensRing.rotation.x = Math.PI / 2;
      g.add(lensRing);
      const lens = mesh(
        new THREE.CylinderGeometry(0.52, 0.52, 0.4, 20),
        COLORS.lens,
        0,
        1.05,
        1.15
      );
      lens.rotation.x = Math.PI / 2;
      g.add(lens);
      g.add(mesh(new THREE.BoxGeometry(0.5, 0.3, 0.3), COLORS.wall, 0.7, 2.2, 0.3));
      // 两侧墙上的相框
      for (const side of [-1, 1]) {
        g.add(mesh(new THREE.BoxGeometry(0.06, 0.5, 0.6), COLORS.wood, side * 1.13, 1.2, 0));
        g.add(
          mesh(new THREE.BoxGeometry(0.07, 0.36, 0.46), COLORS.flowerPink, side * 1.14, 1.2, 0)
        );
      }
      g.add(win(0.4, 0.4, -0.75, 1.5, 0.96));
      return g;
    },
    tower: () => {
      const g = new THREE.Group();
      g.add(mesh(new THREE.CylinderGeometry(0.95, 1.1, 0.5, 12), COLORS.stone, 0, 0.25, 0));
      g.add(mesh(new THREE.CylinderGeometry(0.62, 0.9, 3.6, 12), COLORS.wall, 0, 2.3, 0));
      // 红色环带：半径按塔身锥度算，外扩 0.02 避免穿插
      g.add(mesh(new THREE.CylinderGeometry(0.817, 0.852, 0.45, 12), COLORS.roofRed, 0, 1.6, 0));
      g.add(mesh(new THREE.CylinderGeometry(0.708, 0.743, 0.45, 12), COLORS.roofRed, 0, 3.0, 0));
      g.add(win(0.3, 0.4, 0, 2.3, 0.79));
      g.add(mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.12, 12), COLORS.wood, 0, 4.16, 0));
      g.add(mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.7, 10), windowMat, 0, 4.57, 0));
      g.add(mesh(new THREE.ConeGeometry(0.6, 0.6, 10), COLORS.roofRed, 0, 5.22, 0));
      // 光束：锥尖在旋转轴上，向 +x 伸出
      const beamGeo = new THREE.ConeGeometry(0.9, 6, 16, 1, true);
      beamGeo.translate(0, -3, 0);
      beamGeo.rotateZ(Math.PI / 2);
      beamPivot.add(new THREE.Mesh(beamGeo, beamMat));
      beamPivot.position.set(0, 4.57, 0);
      g.add(beamPivot);
      return g;
    },
  };

  const landmarks = new Map<ZoneKey, THREE.Group>();
  for (const z of zones) {
    const g = builders[z.key]();
    const d = zoneDirection(z.angle);
    g.position.set(d.x * ZONE_RING, 0, d.z * ZONE_RING);
    // 本地 +z（正面）转到朝外方向
    g.rotation.y = Math.atan2(d.x, d.z);
    g.userData.zoneKey = z.key;
    landmarks.set(z.key, g);
    root.add(g);
  }

  // ---- 点缀物：树 / 花 / 石，InstancedMesh 合批 ----
  const rnd = mulberry32(7);
  const matrix = new THREE.Matrix4();
  const quat = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  const place = (
    inst: THREE.InstancedMesh,
    i: number,
    x: number,
    y: number,
    z: number,
    s: number
  ) => {
    quat.setFromAxisAngle(up, rnd() * Math.PI * 2);
    matrix.compose(new THREE.Vector3(x, y, z), quat, new THREE.Vector3(s, s, s));
    inst.setMatrixAt(i, matrix);
  };
  const midAngles = zones.map((z) => z.angle + Math.PI / 5);
  const treeSpots: { x: number; z: number }[] = [];
  for (const a of midAngles) {
    const inner = zoneDirection(a);
    treeSpots.push({ x: inner.x * 4.2, z: inner.z * 4.2 });
    for (const off of [-0.18, 0.18]) {
      const outer = zoneDirection(a + off);
      treeSpots.push({ x: outer.x * 8.4, z: outer.z * 8.4 });
    }
  }
  const trunks = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.12, 0.16, 0.9, 6),
    toon(COLORS.trunk),
    treeSpots.length
  );
  const crowns = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(0.7, 0),
    toon(COLORS.leaf),
    treeSpots.length
  );
  treeSpots.forEach((p, i) => {
    const s = 0.8 + rnd() * 0.5;
    place(trunks, i, p.x, 0.45 * s, p.z, s);
    place(crowns, i, p.x, 1.25 * s, p.z, s);
  });

  const zoneSpots = zones
    .map((z) => zoneDirection(z.angle))
    .map((d) => ({ x: d.x * ZONE_RING, z: d.z * ZONE_RING }));
  const clear = (x: number, z: number) =>
    Math.hypot(x, z) > 2.6 &&
    zoneSpots.every((p) => Math.hypot(p.x - x, p.z - z) > 1.9) &&
    treeSpots.every((p) => Math.hypot(p.x - x, p.z - z) > 0.8);
  const flowerSpots: { x: number; z: number }[] = [];
  for (let tries = 0; flowerSpots.length < 24 && tries < 400; tries++) {
    const a = rnd() * Math.PI * 2;
    const r = 3 + rnd() * 6.2;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (clear(x, z)) flowerSpots.push({ x, z });
  }
  const flowers = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.14, 6, 4),
    toon(0xffffff),
    flowerSpots.length
  );
  flowerSpots.forEach((p, i) => {
    place(flowers, i, p.x, 0.14, p.z, 1);
    flowers.setColorAt(i, new THREE.Color(i % 2 ? COLORS.flowerPink : COLORS.flowerYellow));
  });

  const rocks = new THREE.InstancedMesh(
    new THREE.DodecahedronGeometry(0.35, 0),
    toon(COLORS.stone),
    6
  );
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.4;
    place(rocks, i, Math.cos(a) * 9.4, 0.1, Math.sin(a) * 9.4, 0.7 + rnd() * 0.6);
  }

  for (const inst of [trunks, crowns, flowers, rocks]) {
    inst.castShadow = shadows;
    inst.receiveShadow = shadows;
    inst.instanceMatrix.needsUpdate = true;
    root.add(inst);
  }

  return { root, landmarks, windowMat, beamMat, beamPivot, gears, sea, seaBase };
}
