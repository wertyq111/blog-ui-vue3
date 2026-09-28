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

const OVERVIEW: View = {
  position: new THREE.Vector3(0, 14, 22),
  target: new THREE.Vector3(0, 0.5, 0),
};

function zoneView(key: ZoneKey): View {
  const zone = zones.find((z) => z.key === key) as (typeof zones)[number];
  const d = zoneDirection(zone.angle);
  // 从分区外侧略偏一边看过去
  const side = { x: d.z, z: -d.x };
  return {
    position: new THREE.Vector3(
      d.x * (ZONE_RING + 7) + side.x * 2.5,
      zone.focusY + 3.2,
      d.z * (ZONE_RING + 7) + side.z * 2.5
    ),
    target: new THREE.Vector3(d.x * ZONE_RING, zone.focusY, d.z * ZONE_RING),
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

export function createIslandScene(
  container: HTMLElement,
  options: IslandSceneOptions
): IslandScene {
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
  Object.assign(sun.shadow.camera, {
    left: -15,
    right: 15,
    top: 15,
    bottom: -15,
    near: 1,
    far: 60,
  });
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
      const wave =
        Math.sin(Math.hypot(x, z) * 0.9 - s * 1.4) * 0.08 +
        Math.cos(Math.atan2(z, x) * 3 + s * 0.8) * 0.04;
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
