// 工作岛风格立体纸艺世界构建器：水彩底板、梯田台地、5 大折纸/插片地标、环岛纸艺小火车、层叠剪纸海浪与远景山云
import * as THREE from "three";
import { PAPERCRAFT_ZONES, type ZoneKey } from "./zones";
import {
  boxFold,
  createLife,
  crossCard,
  extrudedLayerStack,
  hinge,
  makeCard,
  P2shape,
  paperMaterial,
  paperTextures,
  platform,
  prismFold,
  rng,
  windSway,
  type HingeHandle,
  type LifeHandle,
  type PaperTextures,
} from "./vendor/typed";

/** 工作岛动森绘本色板 */
export const WORK_ISLAND_PALETTE = {
  paperCream: "#faf3e3",
  inkCocoa: "#794f27",
  inkDark: "#4e3319",
  grassLight: "#9be07a",
  grassMid: "#7ec964",
  grassDeep: "#5fa952",
  sandLight: "#f5e3b5",
  sandWarm: "#e6c788",
  seaShallow: "#63dfd8",
  seaMid: "#42b8d4",
  seaDeep: "#2c86b5",
  slateLight: "#9aa2b0",
  slateDark: "#717988",
  terracotta: "#e27d4e",
  coralRoof: "#f06b57",
  vermilion: "#e64d3d",
  tomatoRed: "#eb4b3c",
  leafGreen: "#62b856",
  cedarWood: "#c58650",
  darkTimber: "#633c20",
  creamWall: "#fff7e7",
  mintIron: "#76c9b4",
  glassSky: "#9fe3f7",
  sakuraDeep: "#ff9bc0",
  sakuraSoft: "#ffd6e6",
  seaplaneYellow: "#ffd059",
  brassGold: "#e5b656",
  ridgeFar: "#a7cfb6",
  ridgeMid: "#8cc0a4",
} as const;

interface WaveStripItem {
  hinge: HingeHandle;
  baseZ: number;
  phase: number;
  amp: number;
}

interface JumpFishItem {
  mesh: THREE.Mesh;
  active: boolean;
  t: number;
  duration: number;
  startX: number;
  startZ: number;
  dx: number;
  dz: number;
  peakY: number;
}

interface SmokePuffItem {
  mesh: THREE.Mesh;
  age: number;
  life: number;
  origin: THREE.Vector3;
  driftX: number;
  driftZ: number;
}

export interface PapercraftWorld {
  root: THREE.Group;
  hinges: HingeHandle[];
  pickables: THREE.Object3D[];
  waterClickPlane: THREE.Mesh;
  landmarkHandles: Map<ZoneKey, { group: THREE.Group; hinge: HingeHandle; baseY: number }>;
  glowSetters: Array<(v: number) => void>;
  lampLights: THREE.PointLight[];
  beaconMat: THREE.MeshBasicMaterial;
  extraEmissives: Array<{ mat: THREE.MeshLambertMaterial | THREE.MeshBasicMaterial; base: number }>;
  life: LifeHandle;
  triggerToy(key: ZoneKey): void;
  splashAt(x: number, z: number): void;
  replayUnfold(): void;
  update(dt: number, sec: number, focusTarget: THREE.Vector3): void;
  dispose(): void;
}

/** 中心在 (0, 0) 的矩形轮廓（适合水平旋转底板与对称旋转翼片） */
function centeredRect(w: number, h: number): Array<[number, number]> {
  return [
    [-w / 2, -h / 2],
    [w / 2, -h / 2],
    [w / 2, h / 2],
    [-w / 2, h / 2],
  ];
}

function tagZone(obj: THREE.Object3D, key: ZoneKey) {
  obj.userData.zoneKey = key;
  obj.traverse((child) => {
    child.userData.zoneKey = key;
  });
}

/** 根据像素画布生成纸艺贴图并挂载纸纹凹凸 */
function makeGroundTexture(paper: PaperTextures): THREE.CanvasTexture {
  const W = 1536;
  const H = 1152;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;

  // 世界坐标 [-52, 52] x [-46, 36] 映射到画布
  const x0 = -52;
  const x1 = 52;
  const z0 = -46;
  const z1 = 36;
  const toX = (x: number) => ((x - x0) / (x1 - x0)) * W;
  const toY = (z: number) => ((z - z0) / (z1 - z0)) * H;

  // 1. 琉璃海水水彩底色
  const seaGrad = g.createLinearGradient(0, 0, 0, H);
  seaGrad.addColorStop(0, "#8adfe4");
  seaGrad.addColorStop(0.52, "#65dcd6");
  seaGrad.addColorStop(1, "#3ba5cc");
  g.fillStyle = seaGrad;
  g.fillRect(0, 0, W, H);

  // 2. 浅海晕染圈
  const coveGrad = g.createRadialGradient(toX(0), toY(0), 60, toX(0), toY(2), 540);
  coveGrad.addColorStop(0, "rgba(182, 245, 228, 0.72)");
  coveGrad.addColorStop(0.6, "rgba(128, 229, 218, 0.45)");
  coveGrad.addColorStop(1, "rgba(66, 184, 212, 0)");
  g.fillStyle = coveGrad;
  g.fillRect(0, 0, W, H);

  // 3. 沙滩海岸线轮廓
  const traceIsland = (scaleX: number, scaleZ: number, offsetZ = 0) => {
    const pts: Array<[number, number]> = [
      [-15.5, -13.5],
      [0, -15.8],
      [15.8, -13.0],
      [17.8, -3.5],
      [15.2, 4.4],
      [10.2, 3.6],
      [4.2, 2.2],
      [-1.5, 4.8],
      [-5.2, 8.2],
      [-12.2, 8.6],
      [-16.4, 4.2],
      [-17.4, -5.2],
    ];
    g.beginPath();
    const mapped = pts.map(([px, pz]) => [toX(px * scaleX), toY(pz * scaleZ + offsetZ)] as const);
    for (let i = 0; i < mapped.length; i++) {
      const curr = mapped[i];
      const next = mapped[(i + 1) % mapped.length];
      const mx = (curr[0] + next[0]) / 2;
      const my = (curr[1] + next[1]) / 2;
      if (i === 0) {
        const prev = mapped[mapped.length - 1];
        g.moveTo((prev[0] + curr[0]) / 2, (prev[1] + curr[1]) / 2);
      }
      g.quadraticCurveTo(curr[0], curr[1], mx, my);
    }
    g.closePath();
  };

  // 浅海泡沫边
  traceIsland(1.06, 1.07, 0.2);
  g.fillStyle = "rgba(255, 252, 240, 0.55)";
  g.fill();

  // 温暖沙滩环
  traceIsland(1.01, 1.02, 0.1);
  g.fillStyle = WORK_ISLAND_PALETTE.sandLight;
  g.fill();
  g.lineWidth = 4;
  g.strokeStyle = "rgba(182, 145, 92, 0.4)";
  g.stroke();

  // 主体草地
  traceIsland(0.92, 0.91, -0.35);
  const grassGrad = g.createLinearGradient(0, toY(-15), 0, toY(9));
  grassGrad.addColorStop(0, WORK_ISLAND_PALETTE.grassMid);
  grassGrad.addColorStop(0.55, WORK_ISLAND_PALETTE.grassLight);
  grassGrad.addColorStop(1, "#a9e682");
  g.fillStyle = grassGrad;
  g.fill();

  // 番茄茶亭所在的独立小沙洲
  g.save();
  g.beginPath();
  g.ellipse(toX(7.4), toY(5.6), 46, 36, 0, 0, Math.PI * 2);
  g.fillStyle = "rgba(255, 252, 240, 0.52)";
  g.fill();
  g.beginPath();
  g.ellipse(toX(7.4), toY(5.6), 36, 28, 0, 0, Math.PI * 2);
  g.fillStyle = WORK_ISLAND_PALETTE.sandWarm;
  g.fill();
  g.restore();

  // 4. 水彩草地色斑与野花点缀
  const rnd = rng(42);
  g.save();
  traceIsland(0.9, 0.89, -0.35);
  g.clip();
  for (let i = 0; i < 42; i++) {
    const px = toX((rnd() - 0.5) * 32);
    const py = toY((rnd() - 0.5) * 24 - 2);
    g.fillStyle = rnd() > 0.5 ? "rgba(255, 249, 210, 0.16)" : "rgba(86, 156, 74, 0.12)";
    g.beginPath();
    g.ellipse(px, py, 24 + rnd() * 44, 16 + rnd() * 28, rnd() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }
  g.restore();

  // 5. 连接五大区域的奶油石子小径
  g.save();
  g.lineCap = "round";
  g.lineJoin = "round";
  g.strokeStyle = "rgba(248, 236, 204, 0.85)";
  g.lineWidth = 18;
  g.beginPath();
  g.moveTo(toX(-7.4), toY(5.0));
  g.quadraticCurveTo(toX(-4.0), toY(1.2), toX(-0.4), toY(-3.2));
  g.quadraticCurveTo(toX(4.2), toY(-1.8), toX(8.2), toY(-3.8));
  g.moveTo(toX(-8.8), toY(-1.6));
  g.quadraticCurveTo(toX(-4.5), toY(-2.4), toX(-0.4), toY(-3.2));
  g.moveTo(toX(-0.4), toY(-3.2));
  g.lineTo(toX(-0.4), toY(-9.0));
  g.moveTo(toX(2.2), toY(1.8));
  g.quadraticCurveTo(toX(4.8), toY(3.4), toX(6.4), toY(4.9));
  g.stroke();
  g.restore();

  // 6. 叠一层轻柔的纸张纤维肌理（multiply）
  g.save();
  g.globalCompositeOperation = "multiply";
  g.globalAlpha = 0.24;
  const pat = g.createPattern(paper.sheet, "repeat");
  if (pat) {
    g.fillStyle = pat;
    g.fillRect(0, 0, W, H);
  }
  g.restore();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

/** 为 boxFold 补一块可同步折叠的背面剪纸墙，避免扇区大角度旋转露底 */
function attachBackWall(
  house: THREE.Group,
  w: number,
  d: number,
  wallH: number,
  paper: PaperTextures,
  color: string,
  seed: number
) {
  const back = makeCard(P2shape.rect(w, wallH), {
    paper,
    seed,
    thickness: 0.08,
    back: "kraft",
    pxPerUnit: 40,
    folds: ["bottom", "left", "right"],
    paint: (P: any) => {
      P.fill(color);
      P.marks("panel", { color: WORK_ISLAND_PALETTE.inkCocoa, alpha: 0.14, size: 0.22 });
    },
  });
  back.position.set(0, 0, -d);
  back.rotation.y = Math.PI;
  house.add(back);
  const origFollow = house.userData.follow;
  house.userData.follow = (p: number) => {
    origFollow?.(p);
    const k = Math.min(1, Math.max(0, (p - 0.1) / 0.5));
    back.position.z = -d * k - 0.06 * (1 - k);
  };
}

export function buildWorkIslandWorld(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
): PapercraftWorld {
  const root = new THREE.Group();
  scene.add(root);

  const paper = paperTextures(renderer, {
    color: WORK_ISLAND_PALETTE.paperCream,
    seed: 17,
    size: 512,
    unitsPerTile: 6,
    normalStrength: 2.2,
    fibres: 1.0,
    mottle: 0.05,
  });

  const hinges: HingeHandle[] = [];
  const pickables: THREE.Object3D[] = [];
  const landmarkHandles = new Map<
    ZoneKey,
    { group: THREE.Group; hinge: HingeHandle; baseY: number }
  >();
  const glowSetters: Array<(v: number) => void> = [];
  const lampLights: THREE.PointLight[] = [];
  const extraEmissives: Array<{
    mat: THREE.MeshLambertMaterial | THREE.MeshBasicMaterial;
    base: number;
  }> = [];

  const registerGlow = (obj: THREE.Object3D) => {
    obj.traverse((child) => {
      if (typeof child.userData.setGlow === "function") {
        glowSetters.push(child.userData.setGlow);
      }
    });
  };

  const addHinged = (
    child: THREE.Object3D,
    opts: {
      at: [number, number, number];
      yaw?: number;
      size?: number;
      delay?: number;
      parent?: THREE.Object3D;
    }
  ): HingeHandle => {
    const h = hinge(child, {
      at: new THREE.Vector3(...opts.at),
      yaw: opts.yaw ?? 0,
      open: 1,
      size: opts.size ?? 1.2,
      delay: opts.delay ?? 0.2,
    });
    (opts.parent || root).add(h.group);
    hinges.push(h);
    registerGlow(child);
    return h;
  };

  // =========================================================================
  // 1. 无限铺开的水彩纸艺底板
  // =========================================================================
  const groundTex = makeGroundTexture(paper);
  const groundMat = paperMaterial({
    map: groundTex,
    normalMap: paper.normalMap,
    normalScale: 0.45,
  });
  const groundMesh = new THREE.Mesh(new THREE.PlaneGeometry(104, 82), groundMat);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.position.set(0, 0, -5);
  groundMesh.receiveShadow = true;
  root.add(groundMesh);

  // 外围延伸纯色海纸，让移轴虚化和雾效无缝过渡
  const outerMat = paperMaterial({
    color: WORK_ISLAND_PALETTE.seaMid,
    map: paper.map,
    normalMap: paper.normalMap,
    normalScale: 0.25,
  });
  const outerPlane = new THREE.Mesh(new THREE.PlaneGeometry(360, 360), outerMat);
  outerPlane.rotation.x = -Math.PI / 2;
  outerPlane.position.y = -0.04;
  outerPlane.receiveShadow = true;
  root.add(outerPlane);

  // =========================================================================
  // 2. 三座阶梯折纸台地（Level 1 工坊 / Level 2 巨樱树屋 / Level 3 云顶灯塔）
  // =========================================================================
  const makeTerrace = (
    x: number,
    z: number,
    w: number,
    d: number,
    h: number,
    yaw: number,
    wallColor: string,
    topColor: string,
    seed: number,
    delay: number
  ) => {
    const p = platform({
      w,
      d,
      h,
      paper,
      seed,
      thickness: 0.1,
      print: { pxPerUnit: 40 },
      paints: {
        face: (P: any) => {
          P.gradient(wallColor, "#826b5c", 0);
          P.marks("brick", { color: WORK_ISLAND_PALETTE.inkDark, alpha: 0.16, size: 0.18 });
        },
        deck: (P: any) => {
          P.fill(topColor);
          P.marks("dot", { color: WORK_ISLAND_PALETTE.grassDeep, alpha: 0.18, size: 0.06 });
        },
        support: (P: any) => {
          P.fill(wallColor);
        },
      },
    });
    // platform() 前墙在 z = 0、台面往 -Z 延伸 d，向前偏移 d/2 使台面中心对齐目标 (x, z)
    const hdl = addHinged(p, {
      at: [x + Math.sin(yaw) * (d * 0.5), 0, z + Math.cos(yaw) * (d * 0.5)],
      yaw,
      size: w * 0.42,
      delay,
    });
    return { p, hdl };
  };

  makeTerrace(-8.8, -1.6, 8.2, 6.8, 1.2, 0.28, "#8e96a3", WORK_ISLAND_PALETTE.grassMid, 101, 0.08);
  makeTerrace(
    8.2,
    -3.8,
    8.8,
    7.2,
    1.5,
    -0.24,
    "#9d7e60",
    WORK_ISLAND_PALETTE.grassLight,
    102,
    0.12
  );
  makeTerrace(-0.4, -9.4, 8.4, 7.2, 2.8, 0.04, "#79808f", "#8ad36c", 103, 0.04);

  // 工坊崖壁前方的层叠剪纸瀑布
  const waterfallGroup = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const strip = makeCard(
      [
        [-0.95 + i * 0.12, 0],
        [0.95 - i * 0.12, 0],
        [0.8 - i * 0.1, 1.45 - i * 0.18],
        [-0.8 + i * 0.1, 1.45 - i * 0.18],
      ],
      {
        paper,
        seed: 140 + i,
        pxPerUnit: 44,
        thickness: 0.06,
        back: "mirror",
        paint: (P: any) => {
          P.gradient("#4fd4db", "#f2fcff", 0);
          P.marks("wave", { color: "#ffffff", alpha: 0.45, size: 0.22 });
        },
      }
    );
    strip.position.set(0, 0, 0.18 * i);
    strip.rotation.x = 0.24;
    waterfallGroup.add(strip);
  }
  addHinged(waterfallGroup, { at: [-5.8, 0.02, 0.95], yaw: 0.32, size: 1.0, delay: 0.22 });

  // =========================================================================
  // 3. 五大工作岛 3D 折叠地标
  // =========================================================================

  // ---- 3.1 办公区 · 巨樱树屋 ----
  const officeZone = PAPERCRAFT_ZONES.find((z) => z.key === "office")!;
  const officeGroup = new THREE.Group();

  const trunkPts: Array<[number, number]> = [
    [-0.7, -0.55],
    [0.7, -0.55],
    [0.55, 0.55],
    [-0.55, 0.55],
  ];
  const treeTrunk = prismFold(trunkPts, {
    h: 2.3,
    roof: "flat",
    paper,
    seed: 201,
    print: { pxPerUnit: 48 },
    paints: {
      wall: (P: any) => {
        P.fill("#6f492d");
        P.marks("hatch", { color: "#4a2c16", alpha: 0.25, size: 0.14 });
      },
      roof: (P: any) => P.fill("#c58650"),
    },
  });
  officeGroup.add(treeTrunk);

  // 树屋木平台
  const treeDeck = makeCard(
    [
      [-2.1, -1.6],
      [2.1, -1.6],
      [2.3, 1.6],
      [-2.3, 1.6],
    ],
    {
      paper,
      seed: 202,
      thickness: 0.12,
      pxPerUnit: 48,
      paint: (P: any) => {
        P.fill(WORK_ISLAND_PALETTE.cedarWood);
        P.marks("panel", { color: WORK_ISLAND_PALETTE.inkDark, alpha: 0.22, size: 0.22 });
      },
    }
  );
  treeDeck.rotation.x = -Math.PI / 2;
  treeDeck.position.set(0, 2.25, 0.05);
  officeGroup.add(treeDeck);

  const officeHouse = boxFold({
    w: 2.8,
    d: 2.2,
    wallH: 2.0,
    roofH: 1.25,
    overhang: 0.24,
    paper,
    seed: 203,
    print: { pxPerUnit: 56 },
    paints: {
      front: (P: any) => {
        P.fill(WORK_ISLAND_PALETTE.creamWall);
        P.layer(
          (lg: CanvasRenderingContext2D) => {
            lg.fillStyle = WORK_ISLAND_PALETTE.terracotta;
            lg.beginPath();
            lg.roundRect(-0.42, 0.06, 0.84, 1.18, [0.06, 0.06, 0.42, 0.42]);
            lg.fill();
          },
          { depth: 0.9 }
        );
        P.layer(
          (lg: CanvasRenderingContext2D) => {
            lg.fillStyle = "#ffe58c";
            lg.fillRect(-1.12, 0.72, 0.52, 0.62);
            lg.fillRect(0.6, 0.72, 0.52, 0.62);
          },
          { depth: 0.8 }
        );
        P.glow((gc: CanvasRenderingContext2D) => {
          gc.fillRect(-1.1, 0.74, 0.48, 0.58);
          gc.fillRect(0.62, 0.74, 0.48, 0.58);
        });
      },
      gable: (P: any) => {
        P.fill("#f7ebd2");
        P.layer(
          (lg: CanvasRenderingContext2D) => {
            lg.fillStyle = "#ffe58c";
            lg.beginPath();
            lg.arc(1.1, 1.25, 0.34, 0, Math.PI * 2);
            lg.fill();
          },
          { depth: 0.8 }
        );
        P.glow((gc: CanvasRenderingContext2D) => {
          gc.beginPath();
          gc.arc(1.1, 1.25, 0.32, 0, Math.PI * 2);
          gc.fill();
        });
      },
      roof: (P: any) => {
        P.fill(WORK_ISLAND_PALETTE.coralRoof);
        P.marks("scallop", { color: "#c94b3b", alpha: 0.28, size: 0.16 });
      },
    },
  });
  attachBackWall(officeHouse, 2.8, 2.2, 2.0, paper, WORK_ISLAND_PALETTE.creamWall, 204);
  officeHouse.position.set(0, 2.34, 1.1);
  officeGroup.add(officeHouse);

  // 樱花巨树冠（叠层花云 + 交叉卡纸，置于树屋后上方避免穿模）
  const sakuraCanopyPivot = new THREE.Group();
  sakuraCanopyPivot.position.set(-0.2, 4.35, -1.75);
  const sakuraPts = P2shape.cloud(205, { w: 5.4, h: 3.1, puffs: 6 });
  const sakuraCrown = crossCard(sakuraPts, {
    paper,
    seed: 205,
    thickness: 0.09,
    pxPerUnit: 48,
    halves: "back",
    back: "mirror",
    paint: (P: any) => {
      P.gradient(WORK_ISLAND_PALETTE.sakuraSoft, WORK_ISLAND_PALETTE.sakuraDeep, 0);
      P.marks("dot", { color: "#ffffff", alpha: 0.38, size: 0.08 });
      P.marks("dot", { color: "#f678a7", alpha: 0.25, size: 0.06 });
    },
  });
  sakuraCanopyPivot.add(sakuraCrown);
  officeGroup.add(sakuraCanopyPivot);

  // 小信箱卡
  const mailboxCard = makeCard(
    [
      [-0.36, 0],
      [0.36, 0],
      [0.36, 0.86],
      [0, 1.05],
      [-0.36, 0.86],
    ],
    {
      paper,
      seed: 206,
      thickness: 0.07,
      pxPerUnit: 56,
      paint: (P: any) => {
        P.fill(WORK_ISLAND_PALETTE.vermilion);
        P.layer(
          (lg: CanvasRenderingContext2D) => {
            lg.fillStyle = "#fff5d6";
            lg.fillRect(-0.22, 0.45, 0.44, 0.24);
          },
          { depth: 0.7 }
        );
      },
    }
  );
  mailboxCard.position.set(1.9, 0, 1.55);
  officeGroup.add(mailboxCard);

  tagZone(officeGroup, "office");
  officeGroup.userData.follow = (p: number) => officeHouse.userData.follow?.(p);
  pickables.push(officeGroup);
  const officeHinge = addHinged(officeGroup, {
    at: [officeZone.x, officeZone.y, officeZone.z],
    yaw: officeZone.facingYaw,
    size: 2.2,
    delay: officeZone.unfoldDelay,
  });
  landmarkHandles.set("office", { group: officeGroup, hinge: officeHinge, baseY: officeZone.y });

  // ---- 3.2 工坊 · 飞瀑水车坊 ----
  const workshopZone = PAPERCRAFT_ZONES.find((z) => z.key === "workshop")!;
  const workshopGroup = new THREE.Group();

  const workshopHouse = boxFold({
    w: 3.3,
    d: 2.5,
    wallH: 2.2,
    roofH: 1.45,
    overhang: 0.28,
    paper,
    seed: 221,
    print: { pxPerUnit: 56 },
    paints: {
      front: (P: any) => {
        P.fill("#d5955d");
        P.marks("panel", { color: WORK_ISLAND_PALETTE.inkDark, alpha: 0.22, size: 0.18 });
        P.layer(
          (lg: CanvasRenderingContext2D) => {
            lg.fillStyle = "#ff914d";
            lg.beginPath();
            lg.roundRect(-0.45, 0.04, 0.9, 1.25, [0.04, 0.04, 0.35, 0.35]);
            lg.fill();
            lg.fillStyle = "#ffd670";
            lg.fillRect(-1.26, 0.85, 0.56, 0.56);
            lg.fillRect(0.7, 0.85, 0.56, 0.56);
          },
          { depth: 0.9 }
        );
        P.glow((gc: CanvasRenderingContext2D) => {
          gc.fillRect(-1.24, 0.87, 0.52, 0.52);
          gc.fillRect(0.72, 0.87, 0.52, 0.52);
          gc.fillRect(-0.3, 0.24, 0.6, 0.72);
        });
      },
      gable: (P: any) => {
        P.fill("#c5844d");
        P.marks("panel", { color: WORK_ISLAND_PALETTE.inkDark, alpha: 0.2, size: 0.2 });
      },
      roof: (P: any) => {
        P.fill(WORK_ISLAND_PALETTE.terracotta);
        P.marks("scallop", { color: "#9c4727", alpha: 0.25, size: 0.16 });
      },
    },
  });
  attachBackWall(workshopHouse, 3.3, 2.5, 2.2, paper, "#c5844d", 222);
  workshopHouse.position.set(0, 0, 1.25);
  workshopGroup.add(workshopHouse);

  // 旋转纸艺水车（右侧山墙旁）
  const wheelGroup = new THREE.Group();
  wheelGroup.position.set(1.92, 0.95, 0.1);
  const wheelCard = makeCard(P2shape.ngon(16, 1.05), {
    paper,
    seed: 223,
    thickness: 0.1,
    pxPerUnit: 56,
    back: "mirror",
    paint: (P: any) => {
      P.fill(WORK_ISLAND_PALETTE.cedarWood);
      P.layer(
        (lg: CanvasRenderingContext2D) => {
          lg.strokeStyle = WORK_ISLAND_PALETTE.inkDark;
          lg.lineWidth = 0.11;
          lg.beginPath();
          lg.arc(0, 0, 0.86, 0, Math.PI * 2);
          lg.stroke();
          for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2;
            lg.beginPath();
            lg.moveTo(0, 0);
            lg.lineTo(Math.cos(a) * 0.96, Math.sin(a) * 0.96);
            lg.stroke();
          }
        },
        { depth: 0.8 }
      );
    },
  });
  wheelCard.rotation.y = Math.PI / 2;
  wheelGroup.add(wheelCard);
  workshopGroup.add(wheelGroup);

  // 屋顶装饰齿轮
  const gearCard = makeCard(P2shape.ngon(10, 0.65), {
    paper,
    seed: 224,
    thickness: 0.08,
    pxPerUnit: 56,
    back: "mirror",
    paint: (P: any) => {
      P.fill(WORK_ISLAND_PALETTE.brassGold);
      P.layer(
        (lg: CanvasRenderingContext2D) => {
          lg.fillStyle = WORK_ISLAND_PALETTE.inkDark;
          lg.beginPath();
          lg.arc(0, 0, 0.18, 0, Math.PI * 2);
          lg.fill();
        },
        { depth: 0.7 }
      );
    },
  });
  gearCard.position.set(0.7, 3.0, 0.95);
  workshopGroup.add(gearCard);

  tagZone(workshopGroup, "workshop");
  workshopGroup.userData.follow = (p: number) => workshopHouse.userData.follow?.(p);
  pickables.push(workshopGroup);
  const workshopHinge = addHinged(workshopGroup, {
    at: [workshopZone.x, workshopZone.y, workshopZone.z],
    yaw: workshopZone.facingYaw,
    size: 2.0,
    delay: workshopZone.unfoldDelay,
  });
  landmarkHandles.set("workshop", {
    group: workshopGroup,
    hinge: workshopHinge,
    baseY: workshopZone.y,
  });

  // ---- 3.3 番茄钟茶亭 ----
  const pomoZone = PAPERCRAFT_ZONES.find((z) => z.key === "pomo")!;
  const pomoGroup = new THREE.Group();

  // 水上圆木平台
  const pomoDeck = makeCard(P2shape.ngon(16, 2.25), {
    paper,
    seed: 241,
    thickness: 0.16,
    pxPerUnit: 48,
    paint: (P: any) => {
      P.fill(WORK_ISLAND_PALETTE.cedarWood);
      P.marks("panel", { color: WORK_ISLAND_PALETTE.inkDark, alpha: 0.22, size: 0.14 });
    },
  });
  pomoDeck.rotation.x = -Math.PI / 2;
  pomoDeck.position.y = 0.08;
  pomoGroup.add(pomoDeck);

  // 番茄柱身 + 红番茄棱顶
  const pomoBody = prismFold(P2shape.ngon(6, 1.35), {
    h: 1.85,
    roof: "pyramid",
    roofH: 1.55,
    center: true,
    paper,
    seed: 242,
    print: { pxPerUnit: 48 },
    paints: {
      wall: (P: any) => {
        P.fill(WORK_ISLAND_PALETTE.creamWall);
        P.layer(
          (lg: CanvasRenderingContext2D) => {
            lg.fillStyle = "#ffe384";
            lg.beginPath();
            lg.roundRect(-0.34, 0.36, 0.68, 0.95, 0.25);
            lg.fill();
          },
          { depth: 0.8 }
        );
        P.glow((gc: CanvasRenderingContext2D) => {
          gc.beginPath();
          gc.roundRect(-0.3, 0.4, 0.6, 0.88, 0.22);
          gc.fill();
        });
      },
      roof: (P: any) => {
        P.gradient("#ff6454", WORK_ISLAND_PALETTE.tomatoRed, 0);
        P.marks("dot", { color: "#ffd8cc", alpha: 0.22, size: 0.07 });
      },
    },
  });
  pomoBody.position.y = 0.14;
  pomoGroup.add(pomoBody);

  // 番茄顶绿萼蒂冠（十字插片）
  const calyxPts: Array<[number, number]> = [
    [-0.75, 0.05],
    [-0.35, 0.45],
    [-0.12, 0.2],
    [0, 0.82],
    [0.14, 0.2],
    [0.42, 0.45],
    [0.75, 0.05],
    [0.25, 0],
    [-0.25, 0],
  ];
  const tomatoCrown = crossCard(calyxPts, {
    paper,
    seed: 243,
    thickness: 0.08,
    pxPerUnit: 56,
    back: "mirror",
    paint: (P: any) => P.fill(WORK_ISLAND_PALETTE.leafGreen),
  });
  tomatoCrown.position.y = 3.4;
  pomoGroup.add(tomatoCrown);

  // 旋转黄金纸沙漏标志
  const hourglassGroup = new THREE.Group();
  hourglassGroup.position.set(-1.35, 1.35, 1.35);
  const hgCard = makeCard(
    [
      [-0.38, -0.52],
      [0.38, -0.52],
      [0.08, 0],
      [0.38, 0.52],
      [-0.38, 0.52],
      [-0.08, 0],
    ],
    {
      paper,
      seed: 244,
      thickness: 0.08,
      pxPerUnit: 56,
      back: "mirror",
      paint: (P: any) => {
        P.fill(WORK_ISLAND_PALETTE.brassGold);
        P.glow((gc: CanvasRenderingContext2D) => {
          gc.fillRect(-0.18, -0.35, 0.36, 0.22);
        });
      },
    }
  );
  hourglassGroup.add(hgCard);
  pomoGroup.add(hourglassGroup);

  // 朱红拱桥（连接茶亭与主岛）
  const bridgeGroup = new THREE.Group();
  const bridgeRailPts: Array<[number, number]> = [
    [-1.9, 0],
    [-1.9, 0.48],
    [-0.8, 0.96],
    [0, 1.08],
    [0.8, 0.96],
    [1.9, 0.48],
    [1.9, 0],
    [1.15, 0.36],
    [0, 0.54],
    [-1.15, 0.36],
  ];
  for (const zOff of [-0.55, 0.55]) {
    const rail = makeCard(bridgeRailPts, {
      paper,
      seed: 245,
      thickness: 0.09,
      pxPerUnit: 48,
      back: "mirror",
      paint: (P: any) => P.fill(WORK_ISLAND_PALETTE.vermilion),
    });
    rail.position.z = zOff;
    bridgeGroup.add(rail);
  }
  const bridgeDeck = makeCard(centeredRect(3.6, 1.05), {
    paper,
    seed: 246,
    thickness: 0.1,
    pxPerUnit: 48,
    paint: (P: any) => {
      P.fill(WORK_ISLAND_PALETTE.cedarWood);
      P.marks("panel", { color: WORK_ISLAND_PALETTE.inkDark, alpha: 0.25, size: 0.16 });
    },
  });
  bridgeDeck.rotation.x = -Math.PI / 2;
  bridgeDeck.position.y = 0.55;
  bridgeGroup.add(bridgeDeck);
  addHinged(bridgeGroup, { at: [4.2, 0.02, 4.1], yaw: -0.48, size: 1.2, delay: 0.38 });

  tagZone(pomoGroup, "pomo");
  pomoGroup.userData.follow = (p: number) => pomoBody.userData.follow?.(p);
  pickables.push(pomoGroup);
  const pomoHinge = addHinged(pomoGroup, {
    at: [pomoZone.x, pomoZone.y, pomoZone.z],
    yaw: pomoZone.facingYaw,
    size: 1.8,
    delay: pomoZone.unfoldDelay,
  });
  landmarkHandles.set("pomo", { group: pomoGroup, hinge: pomoHinge, baseY: pomoZone.y });

  // ---- 3.4 照相馆 · 玻璃暗房 & 水上纸飞机 ----
  const studioZone = PAPERCRAFT_ZONES.find((z) => z.key === "studio")!;
  const studioGroup = new THREE.Group();

  const studioHouse = boxFold({
    w: 3.1,
    d: 2.3,
    wallH: 2.05,
    roofH: 0.9,
    overhang: 0.22,
    paper,
    seed: 261,
    print: { pxPerUnit: 56 },
    paints: {
      front: (P: any) => {
        P.fill(WORK_ISLAND_PALETTE.creamWall);
        P.layer(
          (lg: CanvasRenderingContext2D) => {
            lg.fillStyle = WORK_ISLAND_PALETTE.mintIron;
            lg.fillRect(-1.55, 1.65, 3.1, 0.32);
            lg.fillStyle = "#5a4230";
            lg.fillRect(-1.26, 0.06, 0.62, 1.15);
          },
          { depth: 0.8 }
        );
        P.glow((gc: CanvasRenderingContext2D) => {
          gc.beginPath();
          gc.arc(0.35, 1.0, 0.55, 0, Math.PI * 2);
          gc.fill();
        });
      },
      gable: (P: any) => {
        P.fill("#f7eedc");
        P.layer(
          (lg: CanvasRenderingContext2D) => {
            lg.fillStyle = "#fff6e5";
            lg.fillRect(0.55, 0.72, 0.55, 0.65);
            lg.fillRect(1.25, 0.72, 0.55, 0.65);
          },
          { depth: 0.8 }
        );
      },
      roof: (P: any) => {
        P.fill(WORK_ISLAND_PALETTE.mintIron);
        P.marks("stripe", { color: "#ffffff", alpha: 0.22, size: 0.14 });
      },
    },
  });
  attachBackWall(studioHouse, 3.1, 2.3, 2.05, paper, WORK_ISLAND_PALETTE.creamWall, 262);
  studioHouse.position.set(0, 0, 1.15);
  studioGroup.add(studioHouse);

  // 标志性多层浮雕大镜头（extrudedLayerStack）
  const lensStack = extrudedLayerStack(P2shape.ngon(24, 0.72), {
    paper,
    seed: 263,
    layers: [
      { depth: 0.12, color: "#4e5c72", z: 0 },
      { depth: 0.12, color: "#e8f2f8", scale: 0.82, z: 0.14 },
      { depth: 0.12, color: "#58b6e6", scale: 0.64, z: 0.28 },
      { depth: 0.1, color: "#9ee8ff", scale: 0.36, z: 0.42 },
    ],
  });
  lensStack.position.set(0.35, 1.05, 1.23);
  studioGroup.add(lensStack);

  // 木码头 + 水上黄色纸飞机
  const pierCard = makeCard(centeredRect(1.5, 2.8), {
    paper,
    seed: 264,
    thickness: 0.12,
    pxPerUnit: 48,
    paint: (P: any) => {
      P.fill(WORK_ISLAND_PALETTE.cedarWood);
      P.marks("panel", { color: WORK_ISLAND_PALETTE.inkDark, alpha: 0.25, size: 0.18 });
    },
  });
  pierCard.rotation.x = -Math.PI / 2;
  pierCard.position.set(2.3, 0.08, 2.1);
  studioGroup.add(pierCard);

  const planeGroup = new THREE.Group();
  planeGroup.position.set(3.2, 0.35, 3.0);
  planeGroup.rotation.y = 0.65;
  const planeFuselage = makeCard(
    [
      [-0.95, 0.08],
      [0.85, 0.04],
      [1.05, 0.36],
      [0.45, 0.56],
      [-0.45, 0.56],
      [-0.88, 0.32],
    ],
    {
      paper,
      seed: 265,
      thickness: 0.12,
      pxPerUnit: 56,
      back: "mirror",
      paint: (P: any) => {
        P.fill(WORK_ISLAND_PALETTE.seaplaneYellow);
        P.layer(
          (lg: CanvasRenderingContext2D) => {
            lg.fillStyle = "#5cc3f2";
            lg.fillRect(-0.22, 0.28, 0.52, 0.22);
          },
          { depth: 0.7 }
        );
      },
    }
  );
  const planeWing = makeCard(centeredRect(0.75, 2.2), {
    paper,
    seed: 266,
    thickness: 0.08,
    pxPerUnit: 48,
    back: "mirror",
    paint: (P: any) => P.fill("#ffe17c"),
  });
  planeWing.rotation.x = Math.PI / 2;
  planeWing.position.set(0.15, 0.52, 0);
  const planeProp = makeCard(centeredRect(0.12, 0.9), {
    paper,
    seed: 267,
    thickness: 0.05,
    pxPerUnit: 56,
    back: "mirror",
    paint: (P: any) => P.fill(WORK_ISLAND_PALETTE.vermilion),
  });
  planeProp.rotation.y = Math.PI / 2;
  planeProp.position.set(1.12, 0.32, 0);
  planeGroup.add(planeFuselage, planeWing, planeProp);
  studioGroup.add(planeGroup);

  tagZone(studioGroup, "studio");
  studioGroup.userData.follow = (p: number) => studioHouse.userData.follow?.(p);
  pickables.push(studioGroup);
  const studioHinge = addHinged(studioGroup, {
    at: [studioZone.x, studioZone.y, studioZone.z],
    yaw: studioZone.facingYaw,
    size: 1.8,
    delay: studioZone.unfoldDelay,
  });
  landmarkHandles.set("studio", { group: studioGroup, hinge: studioHinge, baseY: studioZone.y });

  // ---- 3.5 塔台 · 云顶浑天仪灯塔 ----
  const towerZone = PAPERCRAFT_ZONES.find((z) => z.key === "tower")!;
  const towerGroup = new THREE.Group();

  const towerShaft = prismFold(P2shape.ngon(6, 1.32), {
    h: 4.5,
    roof: "flat",
    center: true,
    paper,
    seed: 281,
    print: { pxPerUnit: 52 },
    paints: {
      wall: (P: any) => {
        P.fill(WORK_ISLAND_PALETTE.creamWall);
        P.layer(
          (lg: CanvasRenderingContext2D) => {
            lg.fillStyle = WORK_ISLAND_PALETTE.vermilion;
            lg.fillRect(-1.5, 0.75, 3.0, 0.72);
            lg.fillRect(-1.5, 2.45, 3.0, 0.72);
          },
          { depth: 0.6 }
        );
        P.layer(
          (lg: CanvasRenderingContext2D) => {
            lg.fillStyle = "#4d321c";
            lg.beginPath();
            lg.roundRect(-0.32, 0.04, 0.64, 0.92, [0.04, 0.04, 0.32, 0.32]);
            lg.fill();
            lg.fillStyle = "#ffe588";
            lg.beginPath();
            lg.arc(0, 2.0, 0.26, 0, Math.PI * 2);
            lg.fill();
          },
          { depth: 0.8 }
        );
        P.glow((gc: CanvasRenderingContext2D) => {
          gc.beginPath();
          gc.arc(0, 2.0, 0.25, 0, Math.PI * 2);
          gc.fill();
        });
      },
      roof: (P: any) => P.fill("#454e5e"),
    },
  });
  towerGroup.add(towerShaft);

  // 灯室发光柱 + 顶盖
  const lanternMat = paperMaterial({
    color: "#fff3b8",
    emissive: "#ffd266",
    emissiveIntensity: 0.5,
  });
  extraEmissives.push({ mat: lanternMat, base: 0.45 });
  const lanternMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.86, 0.86, 0.95, 8), lanternMat);
  lanternMesh.position.y = 5.0;
  towerGroup.add(lanternMesh);

  const towerCap = prismFold(P2shape.ngon(6, 1.18), {
    h: 0.2,
    roof: "pyramid",
    roofH: 1.0,
    center: true,
    paper,
    seed: 282,
    print: { pxPerUnit: 48 },
    paints: {
      wall: (P: any) => P.fill("#454e5e"),
      roof: (P: any) => P.fill(WORK_ISLAND_PALETTE.vermilion),
    },
  });
  towerCap.position.y = 5.45;
  towerGroup.add(towerCap);

  // 旋转灯塔光束（带纵向渐变 alpha 贴图，星夜柔光扫射）
  const beamAlphaCanvas = document.createElement("canvas");
  beamAlphaCanvas.width = 32;
  beamAlphaCanvas.height = 128;
  const beamCtx = beamAlphaCanvas.getContext("2d")!;
  const beamGrad = beamCtx.createLinearGradient(0, 0, 0, 128);
  beamGrad.addColorStop(0, "rgba(255, 255, 255, 0.92)");
  beamGrad.addColorStop(0.45, "rgba(255, 255, 255, 0.42)");
  beamGrad.addColorStop(1, "rgba(255, 255, 255, 0.0)");
  beamCtx.fillStyle = beamGrad;
  beamCtx.fillRect(0, 0, 32, 128);
  const beamAlphaTex = new THREE.CanvasTexture(beamAlphaCanvas);

  const beaconPivot = new THREE.Group();
  beaconPivot.position.y = 5.05;
  const beaconMat = new THREE.MeshBasicMaterial({
    color: 0xffe999,
    alphaMap: beamAlphaTex,
    transparent: true,
    opacity: 0.04,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const coneGeo = new THREE.ConeGeometry(1.75, 11.5, 16, 1, true);
  coneGeo.translate(0, -5.75, 0);
  coneGeo.rotateZ(Math.PI / 2);
  const beamA = new THREE.Mesh(coneGeo, beaconMat);
  const beamB = new THREE.Mesh(coneGeo, beaconMat);
  beamB.rotation.y = Math.PI;
  beaconPivot.add(beamA, beamB);
  towerGroup.add(beaconPivot);

  // 黄金浑天仪三环
  const armillaryMat = paperMaterial({
    color: WORK_ISLAND_PALETTE.brassGold,
    map: paper.map,
  });
  const armillaryRings: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.92 - i * 0.16, 0.055, 8, 24),
      armillaryMat
    );
    ring.position.y = 6.95;
    towerGroup.add(ring);
    armillaryRings.push(ring);
  }

  tagZone(towerGroup, "tower");
  towerGroup.userData.follow = (p: number) => {
    towerShaft.userData.follow?.(p);
    towerCap.userData.follow?.(p);
  };
  pickables.push(towerGroup);
  const towerHinge = addHinged(towerGroup, {
    at: [towerZone.x, towerZone.y, towerZone.z],
    yaw: towerZone.facingYaw,
    size: 2.6,
    delay: towerZone.unfoldDelay,
  });
  landmarkHandles.set("tower", { group: towerGroup, hinge: towerHinge, baseY: towerZone.y });

  // =========================================================================
  // 4. 环岛纸艺小火车（轨道 + 木栈桥 + 火车头 + 两节车厢 + 纸烟）
  // =========================================================================
  const railLoop = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(-13.8, 0.12, 2.6),
      new THREE.Vector3(-14.6, 0.12, -5.8),
      new THREE.Vector3(-6.8, 0.12, -14.8),
      new THREE.Vector3(5.2, 0.12, -14.4),
      new THREE.Vector3(14.5, 0.12, -6.5),
      new THREE.Vector3(13.2, 0.12, 2.8),
      new THREE.Vector3(3.6, 0.25, 3.0),
      new THREE.Vector3(-4.2, 0.18, 2.7),
    ],
    true,
    "catmullrom",
    0.45
  );

  // 铁轨枕木（沿曲线分布）
  const trackGroup = new THREE.Group();
  const tieGeo = new THREE.BoxGeometry(0.9, 0.07, 0.22);
  const tieMat = paperMaterial({ color: WORK_ISLAND_PALETTE.darkTimber, map: paper.map });
  const tieCount = 96;
  const ties = new THREE.InstancedMesh(tieGeo, tieMat, tieCount);
  const tmpPos = new THREE.Vector3();
  const tmpTan = new THREE.Vector3();
  const dummy = new THREE.Object3D();
  for (let i = 0; i < tieCount; i++) {
    const u = i / tieCount;
    railLoop.getPointAt(u, tmpPos);
    railLoop.getTangentAt(u, tmpTan);
    dummy.position.copy(tmpPos);
    dummy.rotation.set(0, Math.atan2(tmpTan.x, tmpTan.z), 0);
    dummy.updateMatrix();
    ties.setMatrixAt(i, dummy.matrix);
  }
  ties.castShadow = true;
  ties.receiveShadow = true;
  trackGroup.add(ties);

  const railMat = paperMaterial({ color: "#7f8794", map: paper.map });
  for (const side of [-0.28, 0.28]) {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 120; i++) {
      const u = (i % 120) / 120;
      railLoop.getPointAt(u, tmpPos);
      railLoop.getTangentAt(u, tmpTan);
      const nx = -tmpTan.z;
      const nz = tmpTan.x;
      const len = Math.hypot(nx, nz) || 1;
      pts.push(
        new THREE.Vector3(
          tmpPos.x + (nx / len) * side,
          tmpPos.y + 0.05,
          tmpPos.z + (nz / len) * side
        )
      );
    }
    const railCurve = new THREE.CatmullRomCurve3(pts, true);
    const railMesh = new THREE.Mesh(
      new THREE.TubeGeometry(railCurve, 120, 0.045, 5, true),
      railMat
    );
    railMesh.castShadow = true;
    trackGroup.add(railMesh);
  }
  root.add(trackGroup);

  // 纸艺小火车头 + 2 节车厢
  const makeTrainCar = (isLoco: boolean, bodyColor: string, accentColor: string, seed: number) => {
    const car = new THREE.Group();
    const chassis = makeCard(centeredRect(1.3, 2.2), {
      paper,
      seed,
      thickness: 0.14,
      pxPerUnit: 44,
      paint: (P: any) => P.fill(WORK_ISLAND_PALETTE.darkTimber),
    });
    chassis.rotation.x = -Math.PI / 2;
    chassis.position.y = 0.22;
    car.add(chassis);

    const cabinD = isLoco ? 1.55 : 1.75;
    const cabin = boxFold({
      w: 1.05,
      d: cabinD,
      wallH: isLoco ? 1.15 : 0.78,
      roofH: isLoco ? 0.35 : 0.22,
      overhang: 0.1,
      paper,
      seed: seed + 1,
      print: { pxPerUnit: 52 },
      paints: {
        front: (P: any) => {
          P.fill(bodyColor);
          P.layer(
            (lg: CanvasRenderingContext2D) => {
              lg.fillStyle = accentColor;
              lg.fillRect(-0.55, isLoco ? 0.72 : 0.48, 1.1, 0.2);
              lg.fillStyle = "#ffe58c";
              lg.beginPath();
              lg.arc(0, isLoco ? 0.42 : 0.36, isLoco ? 0.24 : 0.16, 0, Math.PI * 2);
              lg.fill();
            },
            { depth: 0.7 }
          );
          if (isLoco) {
            P.glow((gc: CanvasRenderingContext2D) => {
              gc.beginPath();
              gc.arc(0, 0.42, 0.26, 0, Math.PI * 2);
              gc.fill();
            });
          }
        },
        gable: (P: any) => {
          P.fill(bodyColor);
          P.layer(
            (lg: CanvasRenderingContext2D) => {
              lg.fillStyle = "#fff4d2";
              lg.fillRect(0.28, 0.32, 0.36, 0.34);
              lg.fillRect(0.82, 0.32, 0.36, 0.34);
            },
            { depth: 0.6 }
          );
          P.glow((gc: CanvasRenderingContext2D) => {
            gc.fillRect(0.3, 0.34, 0.32, 0.3);
            gc.fillRect(0.84, 0.34, 0.32, 0.3);
          });
        },
        roof: (P: any) => P.fill(WORK_ISLAND_PALETTE.inkDark),
      },
    });
    attachBackWall(cabin, 1.05, cabinD, isLoco ? 1.15 : 0.78, paper, bodyColor, seed + 2);
    cabin.position.set(0, 0.28, cabinD / 2);
    car.add(cabin);

    if (isLoco) {
      const stack = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.1, 0.55, 8),
        paperMaterial({ color: WORK_ISLAND_PALETTE.brassGold, map: paper.map })
      );
      stack.position.set(0, 1.55, 0.42);
      stack.castShadow = true;
      car.add(stack);
    }

    registerGlow(car);
    return car;
  };

  const locoCar = makeTrainCar(
    true,
    WORK_ISLAND_PALETTE.vermilion,
    WORK_ISLAND_PALETTE.mintIron,
    301
  );
  const coachA = makeTrainCar(false, "#f5cf6e", WORK_ISLAND_PALETTE.coralRoof, 305);
  const coachB = makeTrainCar(
    false,
    WORK_ISLAND_PALETTE.mintIron,
    WORK_ISLAND_PALETTE.creamWall,
    309
  );
  root.add(locoCar, coachA, coachB);

  // 火车头灯光点光源（夜幕照亮铁轨前方）
  const trainHeadLight = new THREE.PointLight(0xffd27a, 0, 8, 1.6);
  trainHeadLight.position.set(0, 0.9, 1.1);
  locoCar.add(trainHeadLight);
  lampLights.push(trainHeadLight);

  // 火车纸烟与工坊白烟粒子
  const smokePuffs: SmokePuffItem[] = [];
  const smokeMat = paperMaterial({ color: "#fffaf0", map: paper.map });
  const smokeGeo = new THREE.IcosahedronGeometry(0.24, 1);
  for (let i = 0; i < 14; i++) {
    const m = new THREE.Mesh(smokeGeo, smokeMat);
    m.castShadow = false;
    root.add(m);
    smokePuffs.push({
      mesh: m,
      age: (i / 14) * 2.2,
      life: 2.2,
      origin: new THREE.Vector3(),
      driftX: (i % 2 === 0 ? 1 : -1) * 0.25,
      driftZ: -0.18,
    });
  }

  // =========================================================================
  // 5. 前景层叠剪纸海浪 + 轻点海面跃出纸鱼
  // =========================================================================
  const waveStrips: WaveStripItem[] = [];
  const waveRows: Array<{ z: number; color: string; y: number; amp: number; seed: number }> = [
    { z: 10.6, color: "#6be5dc", y: 0.05, amp: 0.08, seed: 401 },
    { z: 13.4, color: "#4ec6da", y: 0.05, amp: 0.1, seed: 402 },
    { z: 16.5, color: "#39a5cc", y: 0.05, amp: 0.12, seed: 403 },
  ];
  for (const row of waveRows) {
    const wavePts = P2shape.waves(rng(row.seed), { w: 46, h: 1.15, crests: 22 });
    const waveMesh = makeCard(wavePts, {
      paper,
      seed: row.seed,
      thickness: 0.07,
      pxPerUnit: 24,
      effects: 0,
      back: "mirror",
      paint: (P: any) => {
        P.fill(row.color);
        P.gradient("#e8fffd", row.color, 0);
      },
    });
    const wh = addHinged(waveMesh, {
      at: [0, row.y, row.z],
      size: 1.0,
      delay: 0.45 + (row.z - 10) * 0.03,
    });
    waveStrips.push({ hinge: wh, baseZ: row.z, phase: row.z * 0.7, amp: row.amp });
  }

  // 前海点击拾取隐形平面
  const waterClickPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(52, 16),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  waterClickPlane.rotation.x = -Math.PI / 2;
  waterClickPlane.position.set(0, 0.15, 13.2);
  root.add(waterClickPlane);

  // 跃海剪纸小鱼池
  const jumpFishes: JumpFishItem[] = [];
  const fishColors = ["#ff7e4f", "#ffd057", "#53d8fb"];
  const fishPts: Array<[number, number]> = [
    [-0.55, 0.18],
    [-0.3, 0.05],
    [0.05, 0.34],
    [0.52, 0.14],
    [0.58, 0.0],
    [0.45, -0.18],
    [-0.1, -0.26],
    [-0.32, -0.06],
    [-0.55, -0.18],
  ];
  for (let i = 0; i < 6; i++) {
    const fm = makeCard(fishPts, {
      paper,
      seed: 450 + i,
      thickness: 0.06,
      pxPerUnit: 48,
      back: "mirror",
      paint: (P: any) => {
        P.fill(fishColors[i % fishColors.length]);
        P.layer(
          (lg: CanvasRenderingContext2D) => {
            lg.fillStyle = "#fff8ea";
            lg.beginPath();
            lg.arc(0.32, 0.06, 0.06, 0, Math.PI * 2);
            lg.fill();
          },
          { depth: 0.6 }
        );
      },
    });
    fm.visible = false;
    root.add(fm);
    jumpFishes.push({
      mesh: fm,
      active: false,
      t: 0,
      duration: 1.05,
      startX: 0,
      startZ: 12,
      dx: 1,
      dz: 0.3,
      peakY: 2.2,
    });
  }

  // =========================================================================
  // 6. 动森树木、路灯与远景剪纸群山/纸云
  // =========================================================================
  const treeCoords: Array<[number, number, number, number, "pine" | "round"]> = [
    [-12.8, 0, 2.2, 1.15, "pine"],
    [-13.5, 0, -6.4, 1.05, "pine"],
    [-5.4, 2.8, -11.6, 1.1, "pine"],
    [4.4, 2.8, -11.2, 1.0, "pine"],
    [12.8, 0, -8.5, 1.2, "round"],
    [13.4, 0, -0.2, 1.05, "round"],
    [-11.8, 0, 6.2, 0.95, "round"],
    [11.2, 0, 4.8, 1.0, "pine"],
  ];

  // 共享样板材质：只印刷 2 棵模板（动森三层三角雪松 + 圆冠阔叶树），大幅缩短建场耗时
  const pinePts: Array<[number, number]> = [
    [-0.16, 0],
    [0.16, 0],
    [0.14, 0.72],
    [1.06, 0.72],
    [0.52, 1.56],
    [0.86, 1.56],
    [0.36, 2.38],
    [0.64, 2.38],
    [0, 3.32],
    [-0.64, 2.38],
    [-0.36, 2.38],
    [-0.86, 1.56],
    [-0.52, 1.56],
    [-1.06, 0.72],
    [-0.14, 0.72],
  ];
  const pineTemplate = crossCard(pinePts, {
    paper,
    seed: 501,
    thickness: 0.07,
    pxPerUnit: 44,
    paint: (P: any) => {
      P.gradient("#6fc761", "#3e8b48", 0);
      P.layer(
        (lg: CanvasRenderingContext2D) => {
          lg.fillStyle = WORK_ISLAND_PALETTE.darkTimber;
          lg.fillRect(-0.18, 0, 0.36, 0.74);
        },
        { depth: 0.6 }
      );
      P.marks("dot", { color: "#a5e887", alpha: 0.25, size: 0.07 });
    },
  });
  const roundPts = P2shape.radial(rng(502), {
    cx: 0,
    cy: 1.75,
    rx: 1.18,
    ry: 1.25,
    lobes: 8,
    depth: 0.16,
    stalk: { w: 0.34, base: 0 },
  });
  const roundTreeTemplate = crossCard(roundPts, {
    paper,
    seed: 502,
    thickness: 0.07,
    pxPerUnit: 44,
    paint: (P: any) => {
      P.gradient("#8ee06b", "#59ab4d", 0);
      P.marks("leaf", { color: "#bdf09b", alpha: 0.28, size: 0.09 });
    },
  });

  const treeSwayTargets: Array<{ hinge: HingeHandle; x: number; z: number; phase: number }> = [];
  treeCoords.forEach(([tx, ty, tz, sc, kind], idx) => {
    const clone = (kind === "pine" ? pineTemplate : roundTreeTemplate).clone();
    clone.scale.setScalar(sc);
    const th = addHinged(clone, {
      at: [tx, ty, tz],
      yaw: (idx * 0.7) % Math.PI,
      size: 1.1 * sc,
      delay: 0.18 + idx * 0.04,
    });
    treeSwayTargets.push({ hinge: th, x: tx, z: tz, phase: idx * 1.1 });
  });

  // 铁艺暖光路灯（夜幕时亮起点光源池）
  const lampSpots: Array<[number, number, number]> = [
    [-4.2, 0, 2.2],
    [4.4, 0, -0.5],
    [0.8, 0, 1.4],
  ];
  const lampCardMat = paperMaterial({ color: "#404654", map: paper.map });
  const lampBulbMat = paperMaterial({
    color: "#fff3b5",
    emissive: "#ffc95e",
    emissiveIntensity: 0.25,
  });
  extraEmissives.push({ mat: lampBulbMat, base: 0.25 });

  lampSpots.forEach(([lx, ly, lz], idx) => {
    const lg = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 2.2, 6), lampCardMat);
    pole.position.y = 1.1;
    pole.castShadow = true;
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), lampBulbMat);
    bulb.position.y = 2.25;
    const pl = new THREE.PointLight(0xffcf78, 0, 9.5, 1.6);
    pl.position.y = 2.25;
    lampLights.push(pl);
    lg.add(pole, bulb, pl);
    addHinged(lg, { at: [lx, ly, lz], size: 0.8, delay: 0.35 + idx * 0.05 });
  });

  // 远景多层剪纸群山（effects: 0 快速印刷 + 移轴远景柔焦）
  const ridgeSpecs = [
    { z: -20, w: 68, h: 9.5, color: WORK_ISLAND_PALETTE.ridgeMid, seed: 601 },
    { z: -26, w: 84, h: 13.5, color: WORK_ISLAND_PALETTE.ridgeFar, seed: 602 },
  ];
  ridgeSpecs.forEach((spec, idx) => {
    const pts: Array<[number, number]> = [[-spec.w / 2, 0]];
    const peaks = 9;
    const r = rng(spec.seed);
    for (let i = 0; i <= peaks; i++) {
      const px = -spec.w / 2 + (i / peaks) * spec.w;
      const py = i === 0 || i === peaks ? 1.5 : spec.h * (0.48 + r() * 0.52);
      pts.push([px, py]);
    }
    pts.push([spec.w / 2, 0]);
    const ridge = makeCard(pts, {
      paper,
      seed: spec.seed,
      thickness: 0.12,
      pxPerUnit: 18,
      effects: 0,
      paint: (P: any) => {
        P.gradient(spec.color, "#d8efe0", 0);
      },
    });
    addHinged(ridge, { at: [0, 0, spec.z], size: 4.5, delay: 0.02 + idx * 0.06 });
  });

  // 漂浮剪纸云朵
  const cloudActors: Array<{ group: THREE.Group; baseX: number; speed: number; phase: number }> =
    [];
  for (let i = 0; i < 4; i++) {
    const cm = makeCard(P2shape.cloud(650 + i, { w: 4.6 + (i % 2) * 1.4, h: 2.1, puffs: 5 }), {
      paper,
      seed: 650 + i,
      thickness: 0.09,
      pxPerUnit: 24,
      effects: 0,
      paint: (P: any) => P.fill("#fffdf7"),
    });
    const cg = new THREE.Group();
    cg.add(cm);
    const bx = -18 + i * 12;
    cg.position.set(bx, 11.2 + (i % 2) * 1.6, -15.5 - (i % 2) * 3);
    root.add(cg);
    cloudActors.push({ group: cg, baseX: bx, speed: 0.35 + i * 0.07, phase: i * 1.7 });
  }

  // =========================================================================
  // 7. paper-life.js 生命力粒子：樱花纸瓣、海岸纸鸥、星夜萤火虫
  // =========================================================================
  const life = createLife({
    scene,
    camera,
    heroHeight: 3.6,
    seed: 77,
    wind: [0.92, 0.38],
    box: { w: 10, d: 8, h: 4 },
  });
  life.fallers({
    count: 26,
    cut: "petal",
    colors: [WORK_ISLAND_PALETTE.sakuraDeep, WORK_ISLAND_PALETTE.sakuraSoft, "#ffe8f0"],
    size: [0.09, 0.14],
    fall: [0.32, 0.52],
    day: 1,
    night: 0.35,
  });
  life.flock({
    size: 4,
    every: 12,
    cross: 10,
    height: 3.0,
    colors: ["#fffcf2", "#f6f0e4"],
    day: 1,
    night: 0.15,
  });
  life.flyers({
    count: 22,
    cut: "disc",
    colors: ["#ffe680", "#fff2a8"],
    size: 0.065,
    glow: 1.5,
    day: 0,
    night: 1,
  });

  // =========================================================================
  // 8. 机关状态与每帧更新
  // =========================================================================
  let sakuraBoost = 0;
  let workshopBoost = 0;
  let planeBoost = 0;
  let towerBoost = 0;
  let hourglassTargetRot = 0;
  let wavePulse = 0;
  let trainProgress = 0.78;
  const trainHead = new THREE.Vector3();

  const tmpTrainPos = new THREE.Vector3();
  const tmpTrainTan = new THREE.Vector3();
  const placeTrainCar = (car: THREE.Group, uOffset: number, bobPhase: number) => {
    const u = (((trainProgress + uOffset) % 1) + 1) % 1;
    railLoop.getPointAt(u, tmpTrainPos);
    railLoop.getTangentAt(u, tmpTrainTan);
    car.position.set(
      tmpTrainPos.x,
      tmpTrainPos.y + 0.04 + Math.abs(Math.sin(bobPhase)) * 0.035,
      tmpTrainPos.z
    );
    car.rotation.y = Math.atan2(tmpTrainTan.x, tmpTrainTan.z);
    if (uOffset === 0) trainHead.copy(car.position);
  };

  const launchFishBurst = (x: number, z: number) => {
    let spawned = 0;
    for (const f of jumpFishes) {
      if (f.active) continue;
      f.active = true;
      f.t = 0;
      f.duration = 0.95 + spawned * 0.12;
      f.startX = THREE.MathUtils.clamp(x + (spawned - 1) * 1.1, -14, 14);
      f.startZ = THREE.MathUtils.clamp(z + (spawned % 2) * 0.8, 9.8, 16.2);
      f.dx = (spawned - 1) * 1.4;
      f.dz = (spawned % 2 === 0 ? -1 : 1) * 0.8;
      f.peakY = 2.0 + spawned * 0.45;
      f.mesh.visible = true;
      spawned++;
      if (spawned >= 3) break;
    }
    wavePulse = 1.0;
  };

  const triggerToy = (key: ZoneKey) => {
    if (key === "office") sakuraBoost = 1.0;
    else if (key === "workshop") workshopBoost = 1.0;
    else if (key === "pomo") {
      hourglassTargetRot += Math.PI;
      wavePulse = 0.9;
    } else if (key === "studio") planeBoost = 1.0;
    else if (key === "tower") towerBoost = 1.0;

    // 让对应地标轻弹一下
    const entry = landmarkHandles.get(key);
    if (entry) {
      entry.hinge.spring.v += 2.2;
    }
  };

  const replayUnfold = () => {
    for (const h of hinges) h.reset(0);
    for (const h of hinges) h.set(1, h.delay);
  };

  const UNFOLD_TIME_SCALE = 0.7;

  const update = (dt: number, sec: number, focusTarget: THREE.Vector3) => {
    sakuraBoost = Math.max(0, sakuraBoost - dt * 0.25);
    workshopBoost = Math.max(0, workshopBoost - dt * 0.25);
    planeBoost = Math.max(0, planeBoost - dt * 0.28);
    towerBoost = Math.max(0, towerBoost - dt * 0.26);
    wavePulse = Math.max(0, wavePulse - dt * 0.85);

    for (const h of hinges) h.update(dt * UNFOLD_TIME_SCALE);

    // 树冠随风摆动
    for (const t of treeSwayTargets) {
      t.hinge.sway = windSway(sec, t.x, t.z, {
        amp: 1.6,
        hz: 0.55,
        phase: t.phase,
        heroHeight: 2.4,
      });
    }
    sakuraCanopyPivot.rotation.z =
      Math.sin(sec * 1.4 + sakuraBoost * 7) * (0.025 + sakuraBoost * 0.06);

    // 工坊水车与屋顶齿轮
    const wsMult = 1 + workshopBoost * 2.8;
    wheelGroup.rotation.x -= dt * 1.2 * wsMult;
    gearCard.rotation.z += dt * 1.35 * wsMult;

    // 番茄钟沙漏旋转
    hourglassGroup.rotation.z +=
      (hourglassTargetRot - hourglassGroup.rotation.z) * Math.min(1, dt * 6);
    hourglassGroup.rotation.y += dt * 0.7;

    // 照相馆水上纸飞机
    const plMult = 1 + planeBoost * 4.5;
    planeProp.rotation.x += dt * 10 * plMult;
    planeGroup.position.y = 0.35 + Math.sin(sec * 1.8) * (0.06 + planeBoost * 0.32);
    planeGroup.rotation.z = Math.sin(sec * 1.5) * (0.04 + planeBoost * 0.14);

    // 塔台浑天仪与光束
    const twMult = 1 + towerBoost * 3.8;
    armillaryRings[0].rotation.y += dt * 0.65 * twMult;
    armillaryRings[0].rotation.x = 0.4 + Math.sin(sec * 0.6) * 0.15;
    armillaryRings[1].rotation.x += dt * 0.82 * twMult;
    armillaryRings[1].rotation.z = 0.65;
    armillaryRings[2].rotation.z += dt * 1.05 * twMult;
    beaconPivot.rotation.y += dt * 0.75 * twMult;

    // 环岛小火车巡行（18 秒绕岛一周）
    trainProgress = (trainProgress + dt * 0.055) % 1;
    placeTrainCar(locoCar, 0, sec * 14);
    placeTrainCar(coachA, -0.029, sec * 14 + 0.9);
    placeTrainCar(coachB, -0.057, sec * 14 + 1.8);

    // 火车与工坊冒纸烟
    smokePuffs.forEach((p, idx) => {
      p.age += dt * (idx < 8 ? 1 : wsMult);
      if (p.age >= p.life) {
        p.age -= p.life;
        if (idx < 8) {
          p.origin.set(trainHead.x, trainHead.y + 1.75, trainHead.z);
        } else {
          p.origin.set(workshopZone.x - 0.6, workshopZone.y + 3.7, workshopZone.z - 0.2);
        }
      }
      const k = p.age / p.life;
      p.mesh.position.set(
        p.origin.x + p.driftX * k * 1.8,
        p.origin.y + k * 2.4,
        p.origin.z + p.driftZ * k * 1.8
      );
      const sc = Math.sin(k * Math.PI) * (0.55 + k * 1.15);
      p.mesh.scale.setScalar(Math.max(0.001, sc));
      p.mesh.rotation.y += dt * 1.6;
    });

    // 前景剪纸海浪波涌
    for (const w of waveStrips) {
      const surge = 1 + wavePulse * 1.8;
      w.hinge.group.position.z = w.baseZ + Math.sin(sec * 1.6 + w.phase) * 0.28;
      w.hinge.sway = Math.sin(sec * 1.9 + w.phase) * w.amp * surge;
    }

    // 跃海小鱼抛物线
    for (const f of jumpFishes) {
      if (!f.active) continue;
      f.t += dt;
      const k = f.t / f.duration;
      if (k >= 1) {
        f.active = false;
        f.mesh.visible = false;
        continue;
      }
      const x = f.startX + f.dx * k;
      const z = f.startZ + f.dz * k;
      const y = 0.05 + Math.sin(k * Math.PI) * f.peakY;
      f.mesh.position.set(x, y, z);
      f.mesh.rotation.y = Math.atan2(f.dz, f.dx);
      f.mesh.rotation.z = (0.5 - k) * 1.4;
    }

    // 远景纸云缓移
    for (const c of cloudActors) {
      const offset = ((sec * c.speed + c.baseX + 26) % 52) - 26;
      c.group.position.x = offset;
      c.group.position.y = 11.4 + Math.sin(sec * 0.55 + c.phase) * 0.28;
    }

    life.update(dt, focusTarget);
  };

  const dispose = () => {
    groundTex.dispose();
    beamAlphaTex.dispose();
    paper.map.dispose();
    paper.normalMap.dispose();
    root.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mats = Array.isArray(mesh.material)
        ? mesh.material
        : mesh.material
          ? [mesh.material]
          : [];
      for (const m of mats) {
        const std = m as THREE.MeshStandardMaterial;
        std.map?.dispose?.();
        std.emissiveMap?.dispose?.();
        m.dispose();
      }
    });
    life.group.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mats = Array.isArray(mesh.material)
        ? mesh.material
        : mesh.material
          ? [mesh.material]
          : [];
      for (const m of mats) m.dispose();
    });
    scene.remove(root, life.group);
  };

  return {
    root,
    hinges,
    pickables,
    waterClickPlane,
    landmarkHandles,
    glowSetters,
    lampLights,
    beaconMat,
    extraEmissives,
    life,
    triggerToy,
    splashAt: launchFishBurst,
    replayUnfold,
    update,
    dispose,
  };
}
