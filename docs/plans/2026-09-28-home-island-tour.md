# 首页 3D 小岛导览 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在首页 hero 与模块区之间新增一个 three.js 实时场景：低多边形小岛上 5 个功能分区，镜头自动巡游并弹出说明卡，可拖动、点击、Ctrl+滚轮缩放，按钮直达分区主页面。

**Architecture:** 纯数据（`zones.ts`、`palette.ts`）与 three.js 代码（`builders.ts`、`scene.ts`）分离；Vue 组件 `IslandTour.vue` 只 import 纯数据和 `IslandScene` 类型，场景模块在 section 接近视口时动态 import，three 因此单独成 chunk。场景对外只暴露 `createIslandScene(container, options)` 返回的 `IslandScene` 接口。

**Tech Stack:** Vue 3.5、TypeScript、three `^0.186.1`（`MeshToonMaterial`、`InstancedMesh`、`OrbitControls`）、Vite 8 动态 import。

**Spec:** `docs/specs/2026-09-28-home-island-tour-design.md`

## Global Constraints

- 依赖版本：`three@^0.186.1`、`@types/three@^0.186.0`（devDependency）；包管理只用 pnpm，提交 `pnpm-lock.yaml`（CI 走 `--frozen-lockfile`）。
- `zones.ts`、`palette.ts` **禁止** import `three`；`IslandTour.vue` 对 `scene.ts` 只能 `import type` 加动态 `import()`。违反会把 three 打进首页主包。
- 巡游：飞行 1.6s（easeInOutCubic），分区停留 5s，全岛俯视停留 3s；手动操作后暂停 6s，再从当前分区继续。
- 昼夜：光照过渡 1s；`night` 窗户发光、灯塔光束最亮。
- 画布高度：桌面 560px，767px 及以下 420px；`pixelRatio` 上限桌面 2、移动 1.5；移动端关阴影；阴影贴图 1024。
- 减少动态效果：不自动巡游、不弹跳、不播放海浪与齿轮 / 光束旋转，镜头切换瞬时；隐藏播放按钮。
- WebGL 不可用或场景模块加载失败：整个 section 不渲染，不做兜底图。
- 滚轮：未按 Ctrl 的 `wheel` 在舞台容器捕获阶段 `stopPropagation()`（不 `preventDefault`），页面照常滚动；按 Ctrl 才交给 `OrbitControls`。
- 分区按钮：已登录跳分区主页面，未登录跳 `/login`（`index.vue` 的 `goTo`）。
- 全场景网格数控制在 150 以内（树、花、石用 `InstancedMesh`）。
- 新写代码 eslint 0 问题；只对本计划新建文件允许 `pnpm eslint --fix`；禁止 `pnpm run lint`。
- 分支 `feature/home-island-tour`；提交 `<类型>: <中文描述>`。
- 远端：同步排除 `._*`、`node_modules`、`dist`、`.vite`、`.pnpm-store`、`.env*`；**新增依赖后在容器内 `pnpm install` 属于运行依赖变更，执行前必须征得用户同意**；不执行 `docker compose up`；开浏览器、登录登出前先问用户。

## Review Focus

1. **首屏包不含 three**：一旦某处误 `import` 了 `scene.ts` / `builders.ts` 或纯数据文件 import 了 three，主包会多出约 600KB。Task 4 Step 4 检查构建产物。
2. **页面滚动经过画布不被劫持**：普通滚轮在画布上必须照常滚动页面、不缩放。Task 5 Step 6 用事件计数验证。
3. **离开首页后的清理**：WebGL 上下文、rAF、ResizeObserver、IntersectionObserver、`visibilitychange` 监听都要释放；反复进出首页不能累积上下文（浏览器约 16 个上限后会丢失最早的上下文）。Task 5 Step 7。
4. **说明卡按钮在未登录时去 `/login`**：不能直接进业务页。Task 5 Step 5。
5. **画布离开视口时停止渲染**：rAF 不应在 section 不可见时持续运行。Task 5 Step 7 通过计数核对。

---

## 通用工具

```bash
cd /Volumes/AgentAPFS/Program/Personal/blog/blog-ui-vue3/app
pnpm run type-check && pnpm run build-only   # 每个任务的门禁
pnpm eslint <文件...>                          # 新文件应 0 问题
```

本项目无单元测试框架；场景行为在 Task 5 远端实测。

---

### Task 1: 依赖与分区 / 配色数据

**Files:**
- Modify: `app/package.json`、`app/pnpm-lock.yaml`（pnpm 生成）
- Create: `app/src/views/home/components/island-tour/zones.ts`
- Create: `app/src/views/home/components/island-tour/palette.ts`

**Interfaces:**
- Produces:
  - `type ZoneKey = "office" | "workshop" | "pomo" | "studio" | "tower"`
  - `interface IslandZone { key: ZoneKey; name: string; intro: string; features: string[]; path: string; angle: number }`
  - `const zones: IslandZone[]`、`const ISLAND_RADIUS = 10`、`const ZONE_RING = 6.6`
  - `function zoneDirection(angle: number): { x: number; z: number }`
  - `const COLORS: Record<string, number>`、`interface Lighting`、`const LIGHTING: Record<TimePeriod, Lighting>`

- [ ] **Step 1: 安装依赖**

```bash
cd /Volumes/AgentAPFS/Program/Personal/blog/blog-ui-vue3/app
pnpm add three@^0.186.1
pnpm add -D @types/three@^0.186.0
grep -n '"three"\|"@types/three"' package.json
```

期望：`dependencies` 出现 `"three": "^0.186.1"`，`devDependencies` 出现 `"@types/three": "^0.186.0"`。

- [ ] **Step 2: 新建 `zones.ts`**

```ts
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
```

- [ ] **Step 3: 新建 `palette.ts`**

```ts
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
  morning: { ambient: 0xffe6c8, ambientIntensity: 1.1, sun: 0xffd2a0, sunIntensity: 1.6, glow: 0, beam: 0.06 },
  afternoon: { ambient: 0xffffff, ambientIntensity: 1.2, sun: 0xfff6e0, sunIntensity: 2.0, glow: 0, beam: 0.04 },
  sunset: { ambient: 0xffc2a8, ambientIntensity: 0.9, sun: 0xff9a6b, sunIntensity: 1.4, glow: 0.6, beam: 0.16 },
  night: { ambient: 0x7f8fd6, ambientIntensity: 0.55, sun: 0x9fb2ff, sunIntensity: 0.5, glow: 1, beam: 0.35 },
};
```

- [ ] **Step 4: 验证并提交**

```bash
cd /Volumes/AgentAPFS/Program/Personal/blog/blog-ui-vue3/app
pnpm run type-check && pnpm run build-only
pnpm eslint src/views/home/components/island-tour/zones.ts src/views/home/components/island-tour/palette.ts
grep -n "from \"three" src/views/home/components/island-tour/zones.ts src/views/home/components/island-tour/palette.ts
```

期望：构建通过；eslint 0 问题（格式问题允许对这两个新文件 `--fix`）；最后一条 grep 无输出。

```bash
cd .. && git add app/package.json app/pnpm-lock.yaml app/src/views/home/components/island-tour
git commit -m "feat: 小岛导览引入 three 并定义分区与配色数据"
```

---

### Task 2: 几何体构建（岛、海、5 个地标、点缀物）

**Files:**
- Create: `app/src/views/home/components/island-tour/builders.ts`

**Interfaces:**
- Consumes: `COLORS`、`zones`、`ZONE_RING`、`ISLAND_RADIUS`、`zoneDirection`、`ZoneKey`
- Produces:
  - `function createToonGradient(): THREE.DataTexture`
  - `interface IslandParts { root: THREE.Group; landmarks: Map<ZoneKey, THREE.Group>; windowMat: THREE.MeshToonMaterial; beamMat: THREE.MeshBasicMaterial; beamPivot: THREE.Object3D; gears: THREE.Object3D[]; sea: THREE.Mesh; seaBase: Float32Array }`
  - `function buildIsland(gradient: THREE.Texture, shadows: boolean): IslandParts`
  - 每个地标 `THREE.Group` 的 `userData.zoneKey` 为其 `ZoneKey`（供拾取）

- [ ] **Step 1: 新建 `builders.ts`**

```ts
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
  root.add(mesh(lowPoly(new THREE.CylinderGeometry(R, R * 0.97, 0.6, 28, 1), 0.25, 1), COLORS.grass, 0, -0.3, 0));
  root.add(mesh(lowPoly(new THREE.CylinderGeometry(R + 1, R + 1.3, 0.5, 28, 1), 0.3, 2), COLORS.sand, 0, -0.55, 0));
  root.add(mesh(lowPoly(new THREE.CylinderGeometry(R + 1.3, R * 0.55, 3.2, 28, 2), 0.5, 3), COLORS.cliff, 0, -2.4, 0));

  // ---- 海面：环形网格，波浪在 scene 里逐帧改顶点 y ----
  const seaGeo = new THREE.RingGeometry(R + 0.6, R + 11, 64, 8);
  seaGeo.rotateX(-Math.PI / 2);
  const seaMat = new THREE.MeshToonMaterial({ color: COLORS.sea, gradientMap: gradient, transparent: true, opacity: 0.92 });
  const sea = new THREE.Mesh(seaGeo, seaMat);
  sea.position.y = -0.7;
  sea.receiveShadow = shadows;
  root.add(sea);
  const seaBase = Float32Array.from((seaGeo.getAttribute("position") as THREE.BufferAttribute).array);

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
      for (let i = 0; i < 4; i++) g.add(mesh(new THREE.BoxGeometry(0.1, 0.5, 0.1), COLORS.wood, -0.9 + i * 0.6, 0.25, -1.3));
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
        const tooth = mesh(new THREE.BoxGeometry(0.16, 0.16, 0.14), COLORS.stone, Math.cos(a) * 0.5, Math.sin(a) * 0.5, 0);
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
      const round = mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 12), windowMat, 0, 1.35, 1.22);
      round.rotation.x = Math.PI / 2;
      g.add(round);
      return g;
    },
    studio: () => {
      const g = new THREE.Group();
      g.add(mesh(new THREE.BoxGeometry(2.2, 1.9, 1.9), COLORS.wall, 0, 0.95, 0));
      g.add(mesh(new THREE.BoxGeometry(2.4, 0.2, 2.1), COLORS.wood, 0, 1.95, 0));
      const lensRing = mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.35, 20), COLORS.outline, 0, 1.05, 1.1);
      lensRing.rotation.x = Math.PI / 2;
      g.add(lensRing);
      const lens = mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.4, 20), COLORS.lens, 0, 1.05, 1.15);
      lens.rotation.x = Math.PI / 2;
      g.add(lens);
      g.add(mesh(new THREE.BoxGeometry(0.5, 0.3, 0.3), COLORS.wall, 0.7, 2.2, 0.3));
      // 两侧墙上的相框
      for (const side of [-1, 1]) {
        g.add(mesh(new THREE.BoxGeometry(0.06, 0.5, 0.6), COLORS.wood, side * 1.13, 1.2, 0));
        g.add(mesh(new THREE.BoxGeometry(0.07, 0.36, 0.46), COLORS.flowerPink, side * 1.14, 1.2, 0));
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
  const place = (inst: THREE.InstancedMesh, i: number, x: number, y: number, z: number, s: number) => {
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
  const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.12, 0.16, 0.9, 6), toon(COLORS.trunk), treeSpots.length);
  const crowns = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.7, 0), toon(COLORS.leaf), treeSpots.length);
  treeSpots.forEach((p, i) => {
    const s = 0.8 + rnd() * 0.5;
    place(trunks, i, p.x, 0.45 * s, p.z, s);
    place(crowns, i, p.x, 1.25 * s, p.z, s);
  });

  const zoneSpots = zones.map((z) => zoneDirection(z.angle)).map((d) => ({ x: d.x * ZONE_RING, z: d.z * ZONE_RING }));
  const clear = (x: number, z: number) =>
    Math.hypot(x, z) > 2.6 && zoneSpots.every((p) => Math.hypot(p.x - x, p.z - z) > 1.9) && treeSpots.every((p) => Math.hypot(p.x - x, p.z - z) > 0.8);
  const flowerSpots: { x: number; z: number }[] = [];
  for (let tries = 0; flowerSpots.length < 24 && tries < 400; tries++) {
    const a = rnd() * Math.PI * 2;
    const r = 3 + rnd() * 6.2;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (clear(x, z)) flowerSpots.push({ x, z });
  }
  const flowers = new THREE.InstancedMesh(new THREE.SphereGeometry(0.14, 6, 4), toon(0xffffff), flowerSpots.length);
  flowerSpots.forEach((p, i) => {
    place(flowers, i, p.x, 0.14, p.z, 1);
    flowers.setColorAt(i, new THREE.Color(i % 2 ? COLORS.flowerPink : COLORS.flowerYellow));
  });

  const rocks = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.35, 0), toon(COLORS.stone), 6);
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
```

- [ ] **Step 2: 验证并提交**

```bash
cd /Volumes/AgentAPFS/Program/Personal/blog/blog-ui-vue3/app
pnpm run type-check && pnpm run build-only
pnpm eslint src/views/home/components/island-tour/builders.ts
grep -c "new THREE.Mesh\|mesh(" src/views/home/components/island-tour/builders.ts
```

期望：构建通过；eslint 0 问题（格式问题允许对本新文件 `--fix`）；mesh 构造调用数（含岛体、地标、广场）在 100 以内，加 4 个 InstancedMesh，满足 150 上限。

```bash
cd .. && git add app/src/views/home/components/island-tour/builders.ts
git commit -m "feat: 小岛导览的岛体、海面、五个地标与点缀物几何体"
```

---

### Task 3: 场景运行时（渲染、镜头、巡游、拾取、昼夜、释放）

**Files:**
- Create: `app/src/views/home/components/island-tour/scene.ts`

**Interfaces:**
- Consumes: `buildIsland`、`createToonGradient`、`IslandParts`、`LIGHTING`、`Lighting`、`zones`、`zoneDirection`、`ZONE_RING`、`ZoneKey`、`TimePeriod`
- Produces:
  - `interface IslandSceneOptions { period: TimePeriod; reducedMotion: boolean; mobile: boolean; onZoneChange: (key: ZoneKey | null) => void }`
  - `interface IslandScene { setPeriod(period: TimePeriod): void; focusZone(key: ZoneKey): void; setAutoplay(on: boolean): void; pause(): void; resume(): void; dispose(): void }`
  - `function createIslandScene(container: HTMLElement, options: IslandSceneOptions): IslandScene`（WebGL 不可用时抛错）

说明：spec 列的接口是 `setPeriod / focusZone / pause / resume / dispose + onZoneChange`；这里 `pause / resume` 专指渲染循环（离开视口 / 标签页隐藏），另加 `setAutoplay` 表示巡游开关（播放 / 暂停按钮与「进入视口一半才开始」），两者语义不同，分开更清楚。

- [ ] **Step 1: 新建 `scene.ts`**

```ts
// 小岛场景运行时：渲染循环、镜头飞行、巡游状态机、拾取、昼夜光照、资源释放
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { TimePeriod } from "../../day-cycle";
import { buildIsland, createToonGradient } from "./builders";
import { LIGHTING, type Lighting } from "./palette";
import { ZONE_RING, zoneDirection, zones, type ZoneKey } from "./zones";

export interface IslandSceneOptions {
  period: TimePeriod;
  reducedMotion: boolean;
  mobile: boolean;
  /** 到站时给出分区 key，离站 / 回到全岛俯视时给 null */
  onZoneChange: (key: ZoneKey | null) => void;
}

export interface IslandScene {
  setPeriod(period: TimePeriod): void;
  focusZone(key: ZoneKey): void;
  /** 巡游开关 */
  setAutoplay(on: boolean): void;
  /** 停止渲染循环（离开视口 / 标签页隐藏） */
  pause(): void;
  resume(): void;
  dispose(): void;
}

const FLIGHT_MS = 1600;
const DWELL_MS = 5000;
const OVERVIEW_MS = 3000;
const IDLE_MS = 6000;
const LIGHT_MS = 1000;
const BOUNCE_MS = 500;

type Stop = ZoneKey | null; // null = 全岛俯视
const ORDER: Stop[] = [...zones.map((z) => z.key), null];

interface View {
  position: THREE.Vector3;
  target: THREE.Vector3;
}

const OVERVIEW: View = { position: new THREE.Vector3(0, 14, 22), target: new THREE.Vector3(0, 0.5, 0) };

function zoneView(key: ZoneKey): View {
  const zone = zones.find((z) => z.key === key) as (typeof zones)[number];
  const d = zoneDirection(zone.angle);
  // 从分区外侧略偏一边看过去
  const side = { x: d.z, z: -d.x };
  return {
    position: new THREE.Vector3(d.x * (ZONE_RING + 7) + side.x * 2.5, 4.5, d.z * (ZONE_RING + 7) + side.z * 2.5),
    target: new THREE.Vector3(d.x * ZONE_RING, 1.3, d.z * ZONE_RING),
  };
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

interface LightState {
  ambient: THREE.Color;
  ambientIntensity: number;
  sun: THREE.Color;
  sunIntensity: number;
  glow: number;
  beam: number;
}

const toState = (l: Lighting): LightState => ({
  ambient: new THREE.Color(l.ambient),
  ambientIntensity: l.ambientIntensity,
  sun: new THREE.Color(l.sun),
  sunIntensity: l.sunIntensity,
  glow: l.glow,
  beam: l.beam,
});

export function createIslandScene(container: HTMLElement, options: IslandSceneOptions): IslandScene {
  // WebGL 不可用时这里抛错，调用方据此隐藏整个 section
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, options.mobile ? 1.5 : 2));
  renderer.shadowMap.enabled = !options.mobile;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const canvas = renderer.domElement;
  canvas.style.display = "block";
  canvas.style.cursor = "grab";
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200);
  camera.position.copy(OVERVIEW.position);

  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(OVERVIEW.target);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 6;
  controls.maxDistance = 34;
  controls.minPolarAngle = 0.35;
  controls.maxPolarAngle = 1.25;
  controls.update();

  const gradient = createToonGradient();
  const parts = buildIsland(gradient, !options.mobile);
  scene.add(parts.root);

  const ambient = new THREE.AmbientLight(0xffffff, 1);
  const sun = new THREE.DirectionalLight(0xffffff, 2);
  sun.position.set(8, 14, 6);
  sun.castShadow = !options.mobile;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15, near: 1, far: 60 });
  sun.shadow.camera.updateProjectionMatrix(); // 改了边界必须刷新投影矩阵才生效
  scene.add(ambient, sun);

  // ---- 昼夜光照：从当前值插值到目标时段 ----
  let lightFrom = toState(LIGHTING[options.period]);
  let lightTo = lightFrom;
  let lightStart = -Infinity;
  const currentLight = (): LightState => ({
    ambient: ambient.color.clone(),
    ambientIntensity: ambient.intensity,
    sun: sun.color.clone(),
    sunIntensity: sun.intensity,
    glow: parts.windowMat.emissiveIntensity,
    beam: parts.beamMat.opacity,
  });
  const applyLight = (now: number) => {
    const t = Math.min(1, (now - lightStart) / LIGHT_MS);
    ambient.color.lerpColors(lightFrom.ambient, lightTo.ambient, t);
    ambient.intensity = lerp(lightFrom.ambientIntensity, lightTo.ambientIntensity, t);
    sun.color.lerpColors(lightFrom.sun, lightTo.sun, t);
    sun.intensity = lerp(lightFrom.sunIntensity, lightTo.sunIntensity, t);
    parts.windowMat.emissiveIntensity = lerp(lightFrom.glow, lightTo.glow, t);
    parts.beamMat.opacity = lerp(lightFrom.beam, lightTo.beam, t);
  };
  applyLight(0);

  // ---- 巡游状态机 ----
  interface Flight {
    fromPos: THREE.Vector3;
    fromTarget: THREE.Vector3;
    to: View;
    start: number;
    duration: number;
    stop: Stop;
  }
  let stopIndex = ORDER.length - 1; // 从全岛俯视开始
  let autoplay = false;
  let idleUntil = 0;
  let dwellUntil = 0;
  let resumeCurrent = false;
  let flight: Flight | null = null;
  const bounceAt = new Map<ZoneKey, number>();
  let hovered: ZoneKey | null = null;

  const flyTo = (index: number, now: number) => {
    stopIndex = index;
    const stop = ORDER[index];
    options.onZoneChange(null);
    flight = {
      fromPos: camera.position.clone(),
      fromTarget: controls.target.clone(),
      to: stop ? zoneView(stop) : OVERVIEW,
      start: now,
      duration: options.reducedMotion ? 0 : FLIGHT_MS,
      stop,
    };
  };

  const arrive = (f: Flight, now: number) => {
    flight = null;
    dwellUntil = now + (f.stop ? DWELL_MS : OVERVIEW_MS);
    if (f.stop) {
      options.onZoneChange(f.stop);
      if (!options.reducedMotion) bounceAt.set(f.stop, now);
    }
  };

  const updateTour = (now: number) => {
    if (flight) {
      const t = flight.duration ? Math.min(1, (now - flight.start) / flight.duration) : 1;
      const k = easeInOutCubic(t);
      camera.position.lerpVectors(flight.fromPos, flight.to.position, k);
      controls.target.lerpVectors(flight.fromTarget, flight.to.target, k);
      if (t >= 1) arrive(flight, now);
      return;
    }
    if (!autoplay || now < idleUntil) return;
    if (resumeCurrent) {
      // 手动操作结束 6 秒后，先飞回当前分区再接着巡游
      resumeCurrent = false;
      flyTo(stopIndex, now);
      return;
    }
    if (now >= dwellUntil) flyTo((stopIndex + 1) % ORDER.length, now);
  };

  // 拖动开始即视为手动操作：中断飞行，6 秒后恢复
  const onControlStart = () => {
    flight = null;
    idleUntil = performance.now() + IDLE_MS;
    resumeCurrent = true;
  };
  controls.addEventListener("start", onControlStart);

  // ---- 拾取：悬停高亮、点击飞过去 ----
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const pickables = [...parts.landmarks.values()];
  const pick = (ev: PointerEvent): ZoneKey | null => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    let o: THREE.Object3D | null = raycaster.intersectObjects(pickables, true)[0]?.object ?? null;
    while (o && !o.userData.zoneKey) o = o.parent;
    return o ? (o.userData.zoneKey as ZoneKey) : null;
  };
  let downAt: { x: number; y: number } | null = null;
  const onPointerDown = (ev: PointerEvent) => {
    downAt = { x: ev.clientX, y: ev.clientY };
  };
  const onPointerUp = (ev: PointerEvent) => {
    if (downAt && Math.hypot(ev.clientX - downAt.x, ev.clientY - downAt.y) < 6) {
      const key = pick(ev);
      if (key) api.focusZone(key);
    }
    downAt = null;
  };
  const onPointerMove = (ev: PointerEvent) => {
    if (ev.pointerType !== "mouse") return;
    hovered = pick(ev);
    canvas.style.cursor = hovered ? "pointer" : "grab";
  };
  const onPointerLeave = () => {
    hovered = null;
  };
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerleave", onPointerLeave);

  // ---- 尺寸 ----
  const resize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  // ---- 逐帧动画 ----
  const seaPos = parts.sea.geometry.getAttribute("position") as THREE.BufferAttribute;
  const animate = (now: number, dt: number) => {
    for (const [key, g] of parts.landmarks) {
      const target = hovered === key ? 1.06 : 1;
      g.scale.setScalar(g.scale.x + (target - g.scale.x) * 0.2);
      let y = 0;
      const b = bounceAt.get(key);
      if (b !== undefined) {
        const t = (now - b) / BOUNCE_MS;
        if (t >= 1) bounceAt.delete(key);
        else y = Math.sin(t * Math.PI) * 0.45;
      }
      g.position.y = y;
    }
    if (options.reducedMotion) return;
    for (const gear of parts.gears) gear.rotation.z += dt * 1.2;
    parts.beamPivot.rotation.y += dt * 0.8;
    const s = now / 1000;
    const base = parts.seaBase;
    for (let i = 0; i < seaPos.count; i++) {
      const x = base[i * 3];
      const z = base[i * 3 + 2];
      const wave = Math.sin(Math.hypot(x, z) * 0.9 - s * 1.4) * 0.08 + Math.cos(Math.atan2(z, x) * 3 + s * 0.8) * 0.04;
      seaPos.setY(i, base[i * 3 + 1] + wave);
    }
    seaPos.needsUpdate = true;
  };

  let raf = 0;
  let running = false;
  let last = 0;
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    updateTour(now);
    applyLight(now);
    animate(now, dt);
    controls.update();
    renderer.render(scene, camera);
  };

  const api: IslandScene = {
    setPeriod(period) {
      lightFrom = currentLight();
      lightTo = toState(LIGHTING[period]);
      lightStart = performance.now();
    },
    focusZone(key) {
      const now = performance.now();
      flyTo(ORDER.indexOf(key), now);
      idleUntil = now + IDLE_MS;
      resumeCurrent = false;
    },
    setAutoplay(on) {
      autoplay = on;
    },
    pause() {
      running = false;
      cancelAnimationFrame(raf);
    },
    resume() {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    },
    dispose() {
      api.pause();
      ro.disconnect();
      controls.removeEventListener("start", onControlStart);
      controls.dispose();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        m.geometry.dispose();
        (Array.isArray(m.material) ? m.material : [m.material]).forEach((mat) => mat.dispose());
        if ((o as THREE.InstancedMesh).isInstancedMesh) (o as THREE.InstancedMesh).dispose();
      });
      gradient.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };

  // 首帧：静态画出全岛俯视，等外部 resume
  renderer.render(scene, camera);
  return api;
}
```

- [ ] **Step 2: 验证并提交**

```bash
cd /Volumes/AgentAPFS/Program/Personal/blog/blog-ui-vue3/app
pnpm run type-check && pnpm run build-only
pnpm eslint src/views/home/components/island-tour/scene.ts
```

期望：构建通过；eslint 0 问题（格式问题允许对本新文件 `--fix`）。

```bash
cd .. && git add app/src/views/home/components/island-tour/scene.ts
git commit -m "feat: 小岛导览场景运行时（镜头巡游、拾取、昼夜光照、释放）"
```

---

### Task 4: Vue 外壳 `IslandTour` 与首页接入

**Files:**
- Create: `app/src/views/home/components/IslandTour.vue`
- Modify: `app/src/views/home/index.vue`

**Interfaces:**
- Consumes: `zones`、`ZoneKey`（值 import）；`IslandScene`（仅 `import type`）；`createIslandScene`（仅动态 `import()`）
- Produces: `<IslandTour :period @go="(path: string) => …">`；`index.vue` 的 `goTo(path: string)`

- [ ] **Step 1: 新建 `IslandTour.vue`**

```vue
<!-- 首页 3D 小岛导览 -->
<template>
  <section v-if="!failed" class="section island-tour">
    <div class="section-head">
      <div>
        <div class="section-eyebrow">TOUR · 小岛导览</div>
        <h2 class="section-title">小岛导览 (Island Tour)</h2>
      </div>
      <p class="section-sub">拖动小岛四处看看，点一下建筑走近它；按住 Ctrl 再滚动滚轮可以缩放。</p>
    </div>

    <!-- 未按 Ctrl 的滚轮在捕获阶段拦下，不让它到达画布，页面照常滚动 -->
    <div ref="stageEl" class="island-tour__stage" @wheel.capture.passive="onWheel">
      <div ref="canvasHost" class="island-tour__canvas"></div>
      <div v-if="!ready" class="island-tour__placeholder">小岛正在浮出水面…</div>

      <Transition name="island-tour-card">
        <div v-if="activeZone" :key="activeZone.key" class="island-tour__card">
          <div class="island-tour__card-name">{{ activeZone.name }}</div>
          <p class="island-tour__card-intro">{{ activeZone.intro }}</p>
          <div class="island-tour__chips">
            <span v-for="f in activeZone.features" :key="f" class="island-tour__chip">{{ f }}</span>
          </div>
          <button type="button" class="btn-ai btn-ai-primary btn-ai-sm" @click="emit('go', activeZone.path)">
            <span class="btn-ai-finger"></span>
            <span class="btn-ai-text">去看看 →</span>
          </button>
        </div>
      </Transition>

      <div class="island-tour__dots">
        <button
          v-for="z in zones"
          :key="z.key"
          type="button"
          class="island-tour__dot"
          :class="{ 'island-tour__dot--on': z.key === activeKey }"
          :title="z.name"
          :aria-label="'查看' + z.name"
          @click="scene?.focusZone(z.key)"
        ></button>
        <button
          v-if="!reducedMotion"
          type="button"
          class="island-tour__play"
          :aria-label="playing ? '暂停巡游' : '继续巡游'"
          @click="togglePlay"
        >
          {{ playing ? "❚❚" : "▶" }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onActivated, onBeforeUnmount, onDeactivated, onMounted, ref, shallowRef, watch } from "vue";
import type { TimePeriod } from "../day-cycle";
import { zones, type ZoneKey } from "./island-tour/zones";
import type { IslandScene } from "./island-tour/scene";

defineOptions({ name: "IslandTour" });

const props = defineProps<{ period: TimePeriod }>();
const emit = defineEmits<{ go: [path: string] }>();

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const stageEl = ref<HTMLElement | null>(null);
const canvasHost = ref<HTMLElement | null>(null);
const scene = shallowRef<IslandScene | null>(null);
const failed = ref(false);
const ready = ref(false);
const activeKey = ref<ZoneKey | null>(null);
const playing = ref(!reducedMotion);
const activeZone = computed(() => zones.find((z) => z.key === activeKey.value) ?? null);

let inView = false;
let tourStarted = false;
let loading = false;
let unmounted = false;
let preloadObserver: IntersectionObserver | null = null;
let viewObserver: IntersectionObserver | null = null;

// 只有在视口内且标签页可见时才跑渲染循环
const syncRunning = () => {
  if (!scene.value) return;
  if (inView && document.visibilityState === "visible") scene.value.resume();
  else scene.value.pause();
};

async function load() {
  loading = true;
  try {
    const { createIslandScene } = await import("./island-tour/scene");
    if (unmounted || !canvasHost.value) return;
    scene.value = createIslandScene(canvasHost.value, {
      period: props.period,
      reducedMotion,
      mobile: window.matchMedia("(max-width: 767px)").matches,
      onZoneChange: (key) => {
        activeKey.value = key;
      },
    });
    ready.value = true;
    if (tourStarted) scene.value.setAutoplay(playing.value);
    syncRunning();
  } catch {
    // WebGL 不可用或场景模块加载失败：整个 section 不渲染
    failed.value = true;
  }
}

const onWheel = (e: WheelEvent) => {
  if (!e.ctrlKey) e.stopPropagation();
};

const togglePlay = () => {
  playing.value = !playing.value;
  if (tourStarted) scene.value?.setAutoplay(playing.value);
};

watch(
  () => props.period,
  (p) => scene.value?.setPeriod(p)
);

onMounted(() => {
  const el = stageEl.value;
  if (!el) return;
  // 距视口约一屏时才加载 three
  preloadObserver = new IntersectionObserver(
    (entries) => {
      if (loading || !entries.some((e) => e.isIntersecting)) return;
      preloadObserver?.disconnect();
      void load();
    },
    { rootMargin: "100% 0px" }
  );
  // 进入视口一半以上才开始巡游；离开视口停止渲染
  viewObserver = new IntersectionObserver(
    (entries) => {
      const e = entries[entries.length - 1];
      inView = e.isIntersecting;
      if (e.intersectionRatio >= 0.5 && !tourStarted) {
        tourStarted = true;
        scene.value?.setAutoplay(playing.value);
      }
      syncRunning();
    },
    { threshold: [0, 0.5] }
  );
  preloadObserver.observe(el);
  viewObserver.observe(el);
  document.addEventListener("visibilitychange", syncRunning);
});

onActivated(syncRunning);
onDeactivated(() => scene.value?.pause());

onBeforeUnmount(() => {
  unmounted = true;
  preloadObserver?.disconnect();
  viewObserver?.disconnect();
  document.removeEventListener("visibilitychange", syncRunning);
  scene.value?.dispose();
  scene.value = null;
});
</script>

<style scoped lang="scss">
@use "../styles/shared";

.island-tour__stage {
  position: relative;
  height: 560px;
  border-radius: 28px;
  overflow: hidden;
}

.island-tour__canvas {
  position: absolute;
  inset: 0;
}

.island-tour__placeholder {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(255, 254, 246, 0.55);
  color: var(--ai-text);
  font-weight: 800;
}

.island-tour__card {
  position: absolute;
  left: 24px;
  bottom: 64px;
  width: min(320px, calc(100% - 48px));
  padding: 16px 18px;
  background: var(--ai-btn-face);
  border: 3px solid var(--ai-outline);
  border-radius: 22px;
  box-shadow: 0 6px 0 0 var(--ai-btn-shadow);
  color: var(--ai-text);
}

.island-tour__card-name {
  font-size: 20px;
  font-weight: 900;
}

.island-tour__card-intro {
  margin: 6px 0 10px;
  color: var(--ai-text-2);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.6;
}

.island-tour__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.island-tour__chip {
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(25, 200, 185, 0.12);
  color: var(--ai-primary-active);
  font-size: 12px;
  font-weight: 800;
}

.island-tour__dots {
  position: absolute;
  left: 50%;
  bottom: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  transform: translateX(-50%);
}

.island-tour__dot {
  width: 12px;
  height: 12px;
  padding: 0;
  border: 2px solid var(--ai-outline);
  border-radius: 50%;
  background: var(--ai-btn-face);
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.island-tour__dot--on {
  background: var(--ai-primary);
  transform: scale(1.25);
}

.island-tour__play {
  width: 28px;
  height: 28px;
  padding: 0;
  border: 2px solid var(--ai-outline);
  border-radius: 50%;
  background: var(--ai-btn-face);
  color: var(--ai-text);
  font-size: 11px;
  font-weight: 900;
  cursor: pointer;
}

// 卡片进出：位移按卡片尺寸（约 320px）取 16px，参见 lessons l08
.island-tour-card-enter-active,
.island-tour-card-leave-active {
  transition: opacity 260ms ease, transform 260ms ease;
}

.island-tour-card-enter-from,
.island-tour-card-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.96);
}

@media (max-width: 767px) {
  .island-tour__stage {
    height: 420px;
  }

  .island-tour__card {
    left: 12px;
    right: 12px;
    bottom: 56px;
    width: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .island-tour-card-enter-active,
  .island-tour-card-leave-active,
  .island-tour__dot {
    transition: none;
  }
}
</style>
```

- [ ] **Step 2: 接入 `index.vue`**

1. 模板在 `<HeroCounter v-else />` 之后插入：

```vue

    <!-- 小岛导览：3D 功能分区巡游 -->
    <IslandTour :period="currentTimePeriod" @go="goTo" />
```

2. 脚本加 `import IslandTour from "./components/IslandTour.vue";`（放在 `HeroCounter` import 之后）；`handleModuleClick` 及其上方注释整体替换为：

```ts
// 未登录一律去登录；已登录直达目标功能页
const goTo = (path: string) => {
  router.push(isLoggedIn.value ? path : "/login");
};

const handleModuleClick = (mod: HomeModule) => goTo(mod.path);
```

- [ ] **Step 3: 验证**

```bash
cd /Volumes/AgentAPFS/Program/Personal/blog/blog-ui-vue3/app
pnpm eslint src/views/home/index.vue 2>&1 | grep -cE "^\s+[0-9]+:[0-9]+"   # 改前先跑一次记基数，改后不得增加
pnpm run type-check && pnpm run build-only
pnpm eslint src/views/home/components/IslandTour.vue
```

期望：构建通过；`IslandTour.vue` 0 问题（格式问题允许对本新文件 `--fix`）；`index.vue` 问题数不增加。

- [ ] **Step 4: 构建产物检查（three 单独成 chunk）**

```bash
cd /Volumes/AgentAPFS/Program/Personal/blog/blog-ui-vue3/app
grep -l "WebGLRenderer" dist/js/*.js | xargs -I{} sh -c 'echo "{} $(wc -c < {})"'
grep -l "IslandTour" dist/js/*.js
grep -l "WebGLRenderer" dist/js/*.js | xargs grep -l "IslandTour" || echo "three 与 IslandTour 不在同一 chunk"
```

期望：含 `WebGLRenderer` 的只有 1 个 chunk（场景 chunk，数百 KB）；该 chunk 与首页 chunk（含 `IslandTour`）不是同一个文件，最后一条输出「three 与 IslandTour 不在同一 chunk」。若 `dist` 目录名不同，以 `vite.config.ts` 的 `build.outDir` 与 `chunkFileNames: "js/[name].[hash].js"` 为准。

- [ ] **Step 5: 提交**

```bash
cd .. && git add app/src/views/home
git commit -m "feat: 首页接入 3D 小岛导览 section"
```

---

### Task 5: 远端实测

**Files:** 视结果修正 `app/src/views/home/**`。

- [ ] **Step 1: 征得同意后同步并装依赖**

向用户说明：新增了 `three` 依赖，远端开发容器的 `node_modules` 在匿名卷上，需要同步 `package.json` / `pnpm-lock.yaml` 后在容器内执行 `pnpm install --frozen-lockfile`。得到同意后：

```bash
cd /Volumes/AgentAPFS/Program/Personal/blog/blog-ui-vue3
find . -name '._*' -not -path './app/node_modules/*' -delete
rsync -az --exclude='._*' --exclude='node_modules' --exclude='dist' --exclude='.vite' --exclude='.pnpm-store' --exclude='.env*' --exclude='.git' \
  app/src/ ubuntu@10.10.9.184:/data/personal/projects/blog-ui-vue3/app/src/
rsync -az app/package.json app/pnpm-lock.yaml ubuntu@10.10.9.184:/data/personal/projects/blog-ui-vue3/app/
ssh ubuntu@10.10.9.184 'docker exec blog-ui-vue3-web-1 pnpm install --frozen-lockfile 2>&1 | tail -5 && docker exec blog-ui-vue3-web-1 ls node_modules/three/package.json'
```

期望：安装成功，`node_modules/three/package.json` 存在。Vite 发现新依赖会自动重新预构建并刷新页面，不需要重启容器。

- [ ] **Step 2: 加载与分包**

打开 `http://10.10.9.184:8083/#/`（请用户保持浏览器面板处于显示状态：面板隐藏时页面 `visibilityState` 为 `hidden`，rAF 不跑，巡游无法观察）。

1. `read_console_messages` 只看 error：无 Vue / three 报错。
2. 页面顶部时 `read_network_requests` 过滤 `three`：尚未请求 three 相关模块。
3. 滚动到小岛 section 附近后再查：已请求 three（开发模式下是 `node_modules/.vite/deps/three*.js`）。

- [ ] **Step 3: 场景与巡游**

```js
await new Promise((r) => setTimeout(r, 8000));
JSON.stringify({
  canvas: !!document.querySelector(".island-tour canvas"),
  placeholder: !!document.querySelector(".island-tour__placeholder"),
  card: document.querySelector(".island-tour__card-name")?.textContent ?? null,
  dotOn: [...document.querySelectorAll(".island-tour__dot")].findIndex((d) => d.classList.contains("island-tour__dot--on")),
});
```

期望：有 canvas、占位已消失；section 可见 8 秒后已出现说明卡（办公区）且对应圆点高亮。

- [ ] **Step 4: 截图复核**

已登录：桌面 1440 白天（钉住）、桌面 1440 星夜（钉住：窗户发光、灯塔光束可见）、手机 375；分别截图，确认说明卡不遮挡圆点、卡片与圆点在星夜下可读、小岛与天空视频融合。

- [ ] **Step 5: 交互与跳转**

1. 点第 3 个圆点：数秒内说明卡变为「番茄钟小屋」。
2. 点说明卡「去看看 →」：已登录跳 `#/profile-center/pomo`；`navigate` 回 `#/`。
3. 请用户登出后，点任一圆点再点「去看看 →」：跳 `#/login`。

- [ ] **Step 6: 滚轮不被劫持**

```js
const canvas = document.querySelector(".island-tour canvas");
let hits = 0;
canvas.addEventListener("wheel", () => hits++);
canvas.dispatchEvent(new WheelEvent("wheel", { deltaY: 100, bubbles: true, cancelable: true }));
const plain = hits;
canvas.dispatchEvent(new WheelEvent("wheel", { deltaY: 100, ctrlKey: true, bubbles: true, cancelable: true }));
JSON.stringify({ plain, withCtrl: hits - plain });
```

期望：`{ plain: 0, withCtrl: 1 }`（未按 Ctrl 的滚轮到不了画布；按 Ctrl 的到得了）。

- [ ] **Step 7: 离开视口与卸载**

```js
let n = 0; const raf = window.requestAnimationFrame.bind(window);
window.requestAnimationFrame = (cb) => { n++; return raf(cb); };
document.querySelector(".island-tour").scrollIntoView(); await new Promise((r) => setTimeout(r, 1000)); const inView = n;
window.scrollTo(0, 0); await new Promise((r) => setTimeout(r, 1000)); const a = n;
await new Promise((r) => setTimeout(r, 1500)); const b = n;
window.requestAnimationFrame = raf;
JSON.stringify({ inView, afterLeaveGrowth: b - a });
```

期望：`inView` > 0；离开视口后 1.5s 内 `afterLeaveGrowth` 接近 0（只剩首页其他逻辑的零星调用，不再是每帧一次）。

卸载：`navigate` 到 `#/dashboard` 再回 `#/`，重复 5 次，`read_console_messages` 无「Too many active WebGL contexts」警告，页面上只有 1 个 `.island-tour canvas`。

- [ ] **Step 8: 减少动态效果与 WebGL 失败（代码核对）**

```bash
cd /Volumes/AgentAPFS/Program/Personal/blog/blog-ui-vue3/app/src/views/home/components
grep -n "reducedMotion" IslandTour.vue island-tour/scene.ts
grep -n "failed" IslandTour.vue
```

期望：`reducedMotion` 用于初始 `playing`、隐藏播放按钮、传入场景；场景里用于飞行时长 0、跳过弹跳、跳过海浪 / 齿轮 / 光束；`failed` 在 `catch` 中置真并控制根 `v-if`。

- [ ] **Step 9: 截图发给用户**

---

### Task 6: 交付

- [ ] **Step 1: 自查**

```bash
cd /Volumes/AgentAPFS/Program/Personal/blog/blog-ui-vue3
git diff --stat main...feature/home-island-tour
```

期望：只涉及 `app/package.json`、`app/pnpm-lock.yaml`、`app/src/views/home/**`、`docs/specs/2026-09-28-home-island-tour-design.md`、`docs/plans/2026-09-28-home-island-tour.md`。

- [ ] **Step 2: 整分支审查**

派审查代理审整条分支，Critical / Important 修复后再交付（用户可要求跳过）。

- [ ] **Step 3: 确认后走默认交付流程**

向用户确认「是否按默认交付流程继续」，同意后：推送分支 → 中文 PR → 等 CI 通过 → 本地快进合并 `main` → 推送 `main` → 远端核对「只存在于远端」的未跟踪文件后 `git fetch origin && git reset --hard origin/main` → 远端容器 `pnpm install --frozen-lockfile`（依赖已装过则为无操作）→ 复查首页无报错。
