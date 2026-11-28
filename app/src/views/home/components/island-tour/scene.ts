// 工作岛立体纸艺书运行时：PCSS 软阴影、PaperPost 40-tap 移轴景深/接触 AO/轮廓线、扇区轨道控制、FlapSpring 展开、环岛小火车与交互拾取
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { TimePeriod } from "../../day-cycle";
import { applyMoodToScene } from "./moods";
import {
  enableSoftShadows,
  fitShadow,
  LENS_DEFAULTS,
  paperLights,
  PaperPost,
} from "./vendor/typed";
import { buildWorkIslandWorld } from "./world";
import {
  OVERVIEW_CAMERA,
  PAPERCRAFT_ZONES,
  type PapercraftScene,
  type PapercraftSceneOptions,
  type PinScreenPos,
  type ZoneKey,
} from "./zones";

const FLIGHT_MS = 1400;
const DWELL_MS = 5200;
const OVERVIEW_MS = 3200;
const IDLE_MS = 6000;

type Stop = ZoneKey | null;
const ORDER: Stop[] = [...PAPERCRAFT_ZONES.map((z) => z.key), null];

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function createPapercraftScene(
  container: HTMLElement,
  options: PapercraftSceneOptions
): PapercraftScene {
  const tStart = performance.now();

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, options.mobile ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;

  const canvas = renderer.domElement;
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.cursor = "grab";
  canvas.style.touchAction = "pan-y";
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.3, 180);
  camera.position.set(...OVERVIEW_CAMERA.position);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(...OVERVIEW_CAMERA.target);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minAzimuthAngle = -Math.PI * 0.36;
  controls.maxAzimuthAngle = Math.PI * 0.36;
  controls.minPolarAngle = THREE.MathUtils.degToRad(30);
  controls.maxPolarAngle = THREE.MathUtils.degToRad(72);
  controls.minDistance = 16;
  controls.maxDistance = 52;
  controls.update();

  // 关键光rig + PCSS 软阴影（必须在首次 render 前 patch ShaderChunk）
  const shadowTarget = new THREE.Vector3(0, 0, -2);
  const lights = paperLights(scene, {
    target: shadowTarget,
    shadowExtent: 28,
    mapSize: options.mobile ? 2048 : 4096,
    distance: 64,
  });
  enableSoftShadows(lights.key, {
    softness: 0.26,
    maxPenumbra: 1.2,
    minPenumbra: 0.02,
    sheet: 0.3,
    blockerSamples: options.mobile ? 8 : 16,
    filterSamples: options.mobile ? 12 : 24,
  });

  // 宏镜头移轴后处理链（半浮点 MSAA + 40-tap DOF + 接触 AO + 轮廓线 + 雾效）
  const post = new PaperPost(renderer, scene, camera, {
    ...LENS_DEFAULTS,
    taps: options.mobile ? 20 : 40,
  });

  // 建造工作岛纸艺世界
  const world = buildWorkIslandWorld(renderer, scene, camera);

  // 初始情绪配色
  applyMoodToScene(options.period, {
    scene,
    lights,
    post,
    shadowTarget,
    glowSetters: world.glowSetters,
    lampLights: world.lampLights,
    beaconMat: world.beaconMat,
    extraEmissives: world.extraEmissives,
    life: world.life,
  });
  fitShadow(lights, shadowTarget);

  if (!options.reducedMotion) {
    world.replayUnfold();
  }

  options.onReadyStats?.({ buildMs: Math.round(performance.now() - tStart) });

  // 飞行镜头与巡游状态机
  interface Flight {
    fromPos: THREE.Vector3;
    midPos: THREE.Vector3;
    toPos: THREE.Vector3;
    fromTarget: THREE.Vector3;
    toTarget: THREE.Vector3;
    start: number;
    duration: number;
    stop: Stop;
  }

  let stopIndex = ORDER.length - 1;
  let activeStop: ZoneKey | null = null;
  let autoplay = false;
  let idleUntil = 0;
  let dwellUntil = 0;
  let resumeCurrent = false;
  let flight: Flight | null = null;
  let hovered: ZoneKey | null = null;

  const tmpA = new THREE.Vector3();
  const tmpB = new THREE.Vector3();

  const getStopView = (stop: Stop) => {
    if (!stop) {
      return {
        position: new THREE.Vector3(...OVERVIEW_CAMERA.position),
        target: new THREE.Vector3(...OVERVIEW_CAMERA.target),
      };
    }
    const z = PAPERCRAFT_ZONES.find((item) => item.key === stop)!;
    return {
      position: new THREE.Vector3(...z.cameraPos),
      target: new THREE.Vector3(z.x, z.y + z.focusOffsetY, z.z),
    };
  };

  const flyTo = (index: number, now: number) => {
    stopIndex = index;
    const stop = ORDER[index];
    const dest = getStopView(stop);
    activeStop = null;
    options.onZoneChange(null);

    const fromPos = camera.position.clone();
    const toPos = dest.position.clone();
    const midPos = fromPos.clone().add(toPos).multiplyScalar(0.5);
    const dist = fromPos.distanceTo(toPos);
    midPos.y = Math.max(midPos.y, Math.max(fromPos.y, toPos.y) + Math.min(3.5, dist * 0.14));

    flight = {
      fromPos,
      midPos,
      toPos,
      fromTarget: controls.target.clone(),
      toTarget: dest.target.clone(),
      start: now,
      duration: options.reducedMotion ? 0 : FLIGHT_MS,
      stop,
    };
  };

  const arrive = (f: Flight, now: number) => {
    flight = null;
    dwellUntil = now + (f.stop ? DWELL_MS : OVERVIEW_MS);
    activeStop = f.stop;
    if (f.stop) {
      options.onZoneChange(f.stop);
    }
  };

  const updateTour = (now: number) => {
    if (flight) {
      const t = flight.duration ? Math.min(1, (now - flight.start) / flight.duration) : 1;
      const k = easeInOutCubic(t);
      tmpA.lerpVectors(flight.fromPos, flight.midPos, k);
      tmpB.lerpVectors(flight.midPos, flight.toPos, k);
      camera.position.lerpVectors(tmpA, tmpB, k);
      controls.target.lerpVectors(flight.fromTarget, flight.toTarget, k);
      if (t >= 1) arrive(flight, now);
      return;
    }
    if (!autoplay || now < idleUntil) return;
    if (resumeCurrent) {
      resumeCurrent = false;
      flyTo(stopIndex, now);
      return;
    }
    if (now >= dwellUntil) {
      flyTo((stopIndex + 1) % ORDER.length, now);
    }
  };

  const onControlStart = () => {
    flight = null;
    idleUntil = Infinity;
    resumeCurrent = true;
  };
  const onControlEnd = () => {
    idleUntil = performance.now() + IDLE_MS;
  };
  controls.addEventListener("start", onControlStart);
  controls.addEventListener("end", onControlEnd);

  // 拾取地标 & 点击前景剪纸海浪跃出小鱼
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();

  const getNdc = (ev: PointerEvent): boolean => {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    return true;
  };

  const pickLandmark = (ev: PointerEvent): ZoneKey | null => {
    if (!getNdc(ev)) return null;
    raycaster.setFromCamera(ndc, camera);
    let o: THREE.Object3D | null =
      raycaster.intersectObjects(world.pickables, true)[0]?.object ?? null;
    while (o && !o.userData.zoneKey) o = o.parent;
    return o ? (o.userData.zoneKey as ZoneKey) : null;
  };

  let downAt: { x: number; y: number } | null = null;
  const onPointerDown = (ev: PointerEvent) => {
    downAt = { x: ev.clientX, y: ev.clientY };
    canvas.style.cursor = "grabbing";
  };
  const onPointerUp = (ev: PointerEvent) => {
    if (downAt && Math.hypot(ev.clientX - downAt.x, ev.clientY - downAt.y) < 6) {
      const key = pickLandmark(ev);
      if (key) {
        api.focusZone(key);
        api.triggerToy(key);
      } else if (getNdc(ev)) {
        raycaster.setFromCamera(ndc, camera);
        const hit = raycaster.intersectObject(world.waterClickPlane, false)[0];
        if (hit) {
          world.splashAt(hit.point.x, hit.point.z);
          options.onToyTriggered?.("🐟 剪纸海浪翻涌，小纸鱼跃出了海面");
        }
      }
    }
    downAt = null;
    canvas.style.cursor = hovered ? "pointer" : "grab";
  };
  const onPointerMove = (ev: PointerEvent) => {
    if (ev.pointerType !== "mouse") return;
    hovered = pickLandmark(ev);
    if (!downAt) canvas.style.cursor = hovered ? "pointer" : "grab";
  };
  const onPointerLeave = () => {
    hovered = null;
  };

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerleave", onPointerLeave);

  // 尺寸自适应（同步更新 renderer 与 PaperPost）
  const resize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    post.setSize(w, h);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  // 3D 标签投影
  const projVec = new THREE.Vector3();
  const projectPins = () => {
    if (!options.onProjectPins) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    const pins: PinScreenPos[] = PAPERCRAFT_ZONES.map((z) => {
      const handle = world.landmarkHandles.get(z.key);
      const openFactor = handle ? Math.max(0.1, handle.hinge.p ?? 1) : 1;
      projVec.set(z.x, z.y + z.pinOffsetY * openFactor, z.z);
      projVec.project(camera);
      const visible = projVec.z < 1 && projVec.z > -1;
      return {
        key: z.key,
        x: (projVec.x * 0.5 + 0.5) * w,
        y: (-projVec.y * 0.5 + 0.5) * h,
        visible,
      };
    });
    options.onProjectPins(pins);
  };

  let raf = 0;
  let running = false;
  let last = 0;
  let elapsed = 0;

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
    last = now;
    elapsed += dt;

    updateTour(now);
    controls.update();

    if (!options.reducedMotion) {
      world.update(dt, elapsed, controls.target);
    }

    // 地标悬停轻放大反馈
    for (const z of PAPERCRAFT_ZONES) {
      const h = world.landmarkHandles.get(z.key);
      if (!h) continue;
      const targetScale = hovered === z.key || activeStop === z.key ? 1.04 : 1.0;
      const cur = h.group.scale.x;
      h.group.scale.setScalar(cur + (targetScale - cur) * 0.16);
    }

    post.focus.copy(controls.target);
    fitShadow(lights, shadowTarget);
    post.render(elapsed);
    projectPins();
  };

  const api: PapercraftScene = {
    setPeriod(period: TimePeriod) {
      applyMoodToScene(period, {
        scene,
        lights,
        post,
        shadowTarget,
        glowSetters: world.glowSetters,
        lampLights: world.lampLights,
        beaconMat: world.beaconMat,
        extraEmissives: world.extraEmissives,
        life: world.life,
      });
    },
    focusZone(key: ZoneKey) {
      const now = performance.now();
      flyTo(ORDER.indexOf(key), now);
      idleUntil = now + IDLE_MS;
      resumeCurrent = false;
    },
    focusOverview() {
      const now = performance.now();
      flyTo(ORDER.length - 1, now);
      idleUntil = now + IDLE_MS;
      resumeCurrent = false;
    },
    setAutoplay(on: boolean) {
      autoplay = on;
      if (on) dwellUntil = performance.now() + 900;
    },
    replayUnfold() {
      if (options.reducedMotion) return;
      world.replayUnfold();
      options.onToyTriggered?.("📖 立体纸艺工作岛重新折起展开");
    },
    triggerToy(key: ZoneKey) {
      const z = PAPERCRAFT_ZONES.find((item) => item.key === key);
      world.triggerToy(key);
      if (z) options.onToyTriggered?.(z.toyLabel);
    },
    holdTour(on: boolean) {
      idleUntil = on ? Infinity : performance.now() + IDLE_MS;
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
      controls.removeEventListener("end", onControlEnd);
      controls.dispose();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      world.dispose();
      post.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };

  return api;
}
