// 琉璃海立体切片箱庭运行时：24h 连续光影、等轴手办变焦、海面涟漪拾取、一区一机关与 3D 空间标签投影
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import type { TimePeriod } from "../../day-cycle";
import { buildLandmarks } from "./landmarks";
import { PERIOD_TO_HOUR, sampleLightingAtHour, type LightingKeyframe } from "./palette";
import { buildProps } from "./props";
import { buildTerrain } from "./terrain";
import { createIslandTextures } from "./textures";
import {
  WATER_TOP_Y,
  zones,
  type IslandScene,
  type IslandSceneOptions,
  type PinScreenPos,
  type ZoneKey,
} from "./zones";

const FLIGHT_MS = 1450;
const DWELL_MS = 5200;
const OVERVIEW_MS = 3200;
const IDLE_MS = 6000;
const BOUNCE_MS = 480;

type Stop = ZoneKey | null;
const ORDER: Stop[] = [...zones.map((z) => z.key), null];

interface View {
  position: THREE.Vector3;
  target: THREE.Vector3;
}

// 适配首页 580px 高度舞台：相机稍微拉远且目标抬高至 1.25，确保底部胡桃木底座到云顶浑天仪均完整在框内
const OVERVIEW_BASE: View = {
  position: new THREE.Vector3(11.8, 11.6, 14.2),
  target: new THREE.Vector3(0.0, 1.25, 0.0),
};

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

interface LightRuntime {
  hemiSky: THREE.Color;
  hemiGround: THREE.Color;
  hemiIntensity: number;
  sunColor: THREE.Color;
  sunIntensity: number;
  sunPos: THREE.Vector3;
  rimColor: THREE.Color;
  rimIntensity: number;
  envIntensity: number;
  exposure: number;
  windowGlow: number;
  lampGlow: number;
  beamOpacity: number;
  reefGlow: number;
  fireflyOpacity: number;
  waterShallow: THREE.Color;
  waterDeep: THREE.Color;
  waterWall: THREE.Color;
  waterFoam: THREE.Color;
  cloudColor: THREE.Color;
}

function toLightRuntime(k: LightingKeyframe): LightRuntime {
  return {
    hemiSky: new THREE.Color(k.hemiSky),
    hemiGround: new THREE.Color(k.hemiGround),
    hemiIntensity: k.hemiIntensity,
    sunColor: new THREE.Color(k.sunColor),
    sunIntensity: k.sunIntensity,
    sunPos: new THREE.Vector3(...k.sunPos),
    rimColor: new THREE.Color(k.rimColor),
    rimIntensity: k.rimIntensity,
    envIntensity: k.envIntensity,
    exposure: k.exposure,
    windowGlow: k.windowGlow,
    lampGlow: k.lampGlow,
    beamOpacity: k.beamOpacity,
    reefGlow: k.reefGlow,
    fireflyOpacity: k.fireflyOpacity,
    waterShallow: new THREE.Color(k.waterShallow),
    waterDeep: new THREE.Color(k.waterDeep),
    waterWall: new THREE.Color(k.waterWall),
    waterFoam: new THREE.Color(k.waterFoam),
    cloudColor: new THREE.Color(k.cloudColor),
  };
}

export function createIslandScene(
  container: HTMLElement,
  options: IslandSceneOptions
): IslandScene {
  const initialHour = options.hour ?? PERIOD_TO_HOUR[options.period];

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, options.mobile ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = !options.mobile;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const canvas = renderer.domElement;
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.cursor = "grab";
  container.appendChild(canvas);

  const scene = new THREE.Scene();

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new RoomEnvironment();
  const envRT = pmrem.fromScene(envScene, 0.04);
  scene.environment = envRT.texture;
  envScene.dispose();
  pmrem.dispose();

  const PERSP_FOV = 36;
  const ISO_FOV = 19;
  let targetFov = PERSP_FOV;
  let currentFov = PERSP_FOV;

  const camera = new THREE.PerspectiveCamera(PERSP_FOV, 1, 0.1, 220);
  camera.position.copy(OVERVIEW_BASE.position);

  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(OVERVIEW_BASE.target);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 7.5;
  controls.maxDistance = 48;
  controls.minPolarAngle = 0.28;
  controls.maxPolarAngle = 1.28;
  controls.update();
  canvas.style.touchAction = "pan-y";

  const textures = createIslandTextures();
  const shadows = !options.mobile;
  const terrain = buildTerrain(textures, initialHour, shadows);
  const landmarks = buildLandmarks(textures, shadows);
  const props = buildProps(textures, terrain.waterfallSplashPos, shadows);

  const root = new THREE.Group();
  root.add(terrain.group);
  for (const lm of landmarks.landmarks.values()) root.add(lm);
  for (const halo of landmarks.halos.values()) root.add(halo);
  root.add(landmarks.attachments);
  root.add(props.group);
  scene.add(root);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x88aa77, 1.0);
  const sun = new THREE.DirectionalLight(0xffffff, 2.0);
  sun.castShadow = shadows;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.03;
  Object.assign(sun.shadow.camera, {
    left: -11,
    right: 11,
    top: 11,
    bottom: -11,
    near: 1,
    far: 50,
  });
  sun.shadow.camera.updateProjectionMatrix();

  const rim = new THREE.DirectionalLight(0xffffff, 0.6);
  rim.position.set(-10, 9, -12);

  const workshopZ = zones.find((z) => z.key === "workshop")!;
  const forgeLight = new THREE.PointLight(0xff8438, 0.6, 5.5, 1.5);
  forgeLight.position.set(workshopZ.x, workshopZ.groundY + 1.0, workshopZ.z);

  const towerZ = zones.find((z) => z.key === "tower")!;
  const towerLight = new THREE.PointLight(0xffe082, 0, 10.0, 1.4);
  towerLight.position.set(towerZ.x, towerZ.groundY + 3.6, towerZ.z);

  scene.add(hemi, sun, rim, forgeLight, towerLight);

  let lightFrom = toLightRuntime(sampleLightingAtHour(initialHour));
  let lightTo = toLightRuntime(sampleLightingAtHour(initialHour));
  let lightStart = -Infinity;
  let lightDuration = 850;
  let curLampGlow = lightTo.lampGlow;
  let curFireflyOpacity = lightTo.fireflyOpacity;

  const captureCurrentLight = (): LightRuntime => ({
    hemiSky: hemi.color.clone(),
    hemiGround: hemi.groundColor.clone(),
    hemiIntensity: hemi.intensity,
    sunColor: sun.color.clone(),
    sunIntensity: sun.intensity,
    sunPos: sun.position.clone(),
    rimColor: rim.color.clone(),
    rimIntensity: rim.intensity,
    envIntensity: scene.environmentIntensity,
    exposure: renderer.toneMappingExposure,
    windowGlow: landmarks.windowMat.emissiveIntensity,
    lampGlow: curLampGlow,
    beamOpacity: landmarks.beamMat.opacity,
    reefGlow: terrain.reefGlowMats[0]?.emissiveIntensity ?? 0,
    fireflyOpacity: curFireflyOpacity,
    waterShallow: terrain.waterUniforms.uShallowColor.value.clone(),
    waterDeep: terrain.waterUniforms.uDeepColor.value.clone(),
    waterWall: terrain.waterWallMat.color.clone(),
    waterFoam: terrain.waterUniforms.uFoamColor.value.clone(),
    cloudColor: props.cloudMat.color.clone(),
  });

  const applyLight = (now: number) => {
    const t =
      lightStart === -Infinity ? 1 : Math.min(1, (now - lightStart) / Math.max(1, lightDuration));
    const k = easeInOutCubic(t);

    hemi.color.lerpColors(lightFrom.hemiSky, lightTo.hemiSky, k);
    hemi.groundColor.lerpColors(lightFrom.hemiGround, lightTo.hemiGround, k);
    hemi.intensity = lerp(lightFrom.hemiIntensity, lightTo.hemiIntensity, k);

    sun.color.lerpColors(lightFrom.sunColor, lightTo.sunColor, k);
    sun.intensity = lerp(lightFrom.sunIntensity, lightTo.sunIntensity, k);
    sun.position.lerpVectors(lightFrom.sunPos, lightTo.sunPos, k);

    rim.color.lerpColors(lightFrom.rimColor, lightTo.rimColor, k);
    rim.intensity = lerp(lightFrom.rimIntensity, lightTo.rimIntensity, k);

    scene.environmentIntensity = lerp(lightFrom.envIntensity, lightTo.envIntensity, k);
    renderer.toneMappingExposure = lerp(lightFrom.exposure, lightTo.exposure, k);

    landmarks.windowMat.emissiveIntensity = lerp(lightFrom.windowGlow, lightTo.windowGlow, k);
    landmarks.stringBulbMat.emissiveIntensity = landmarks.windowMat.emissiveIntensity * 1.15;
    landmarks.beamMat.opacity = lerp(lightFrom.beamOpacity, lightTo.beamOpacity, k);
    landmarks.beaconCoreMat.emissiveIntensity = 0.65 + landmarks.beamMat.opacity * 2.1;

    curLampGlow = lerp(lightFrom.lampGlow, lightTo.lampGlow, k);
    props.lampBulbMat.emissiveIntensity = curLampGlow * 1.5;
    terrain.dockLampMat.emissiveIntensity = curLampGlow * 1.5;
    for (const h of props.lampHalos) h.material.opacity = curLampGlow * 0.68;
    terrain.dockLampHalo.material.opacity = curLampGlow * 0.68;
    towerLight.intensity = curLampGlow * 2.4;

    const rGlow = lerp(lightFrom.reefGlow, lightTo.reefGlow, k);
    for (const rm of terrain.reefGlowMats) rm.emissiveIntensity = rGlow;
    terrain.chestGlowMat.emissiveIntensity = 0.55 + rGlow * 0.85;

    curFireflyOpacity = lerp(lightFrom.fireflyOpacity, lightTo.fireflyOpacity, k);

    terrain.waterUniforms.uShallowColor.value.lerpColors(
      lightFrom.waterShallow,
      lightTo.waterShallow,
      k
    );
    terrain.waterUniforms.uDeepColor.value.lerpColors(lightFrom.waterDeep, lightTo.waterDeep, k);
    terrain.waterWallMat.color.lerpColors(lightFrom.waterWall, lightTo.waterWall, k);
    terrain.waterUniforms.uFoamColor.value.lerpColors(lightFrom.waterFoam, lightTo.waterFoam, k);
    terrain.waterUniforms.uSunColor.value.copy(sun.color);
    terrain.waterUniforms.uSunDir.value.copy(sun.position).normalize();

    props.cloudMat.color.lerpColors(lightFrom.cloudColor, lightTo.cloudColor, k);
  };
  applyLight(0);

  const fovScale = () =>
    Math.tan(THREE.MathUtils.degToRad(PERSP_FOV / 2)) /
    Math.tan(THREE.MathUtils.degToRad(targetFov / 2));

  function getZoneView(key: ZoneKey): View {
    const z = zones.find((item) => item.key === key)!;
    const fx = Math.sin(z.facingAngle);
    const fz = Math.cos(z.facingAngle);
    const sx = fz;
    const sz = -fx;
    const scale = fovScale();
    const target = new THREE.Vector3(z.x, z.groundY + z.focusY, z.z);
    const offset = new THREE.Vector3(
      fx * z.cameraDist + sx * z.cameraSideOffset,
      z.cameraHeightOffset,
      fz * z.cameraDist + sz * z.cameraSideOffset
    ).multiplyScalar(scale);
    return {
      position: target.clone().add(offset),
      target,
    };
  }

  function getOverviewView(): View {
    const scale = fovScale();
    const offset = OVERVIEW_BASE.position.clone().sub(OVERVIEW_BASE.target).multiplyScalar(scale);
    return {
      position: OVERVIEW_BASE.target.clone().add(offset),
      target: OVERVIEW_BASE.target.clone(),
    };
  }

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
  const bounceAt = new Map<ZoneKey, number>();
  let hovered: ZoneKey | null = null;

  const tmpVecA = new THREE.Vector3();
  const tmpVecB = new THREE.Vector3();

  const flyTo = (index: number, now: number) => {
    stopIndex = index;
    const stop = ORDER[index];
    const dest = stop ? getZoneView(stop) : getOverviewView();
    activeStop = null;
    options.onZoneChange(null);

    const fromPos = camera.position.clone();
    const toPos = dest.position.clone();
    const midPos = fromPos.clone().add(toPos).multiplyScalar(0.5);
    const dist = fromPos.distanceTo(toPos);
    midPos.y = Math.max(midPos.y, Math.max(fromPos.y, toPos.y) + Math.min(2.8, dist * 0.14));

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
      if (!options.reducedMotion) bounceAt.set(f.stop, now);
    }
  };

  const updateTour = (now: number) => {
    if (flight) {
      const t = flight.duration ? Math.min(1, (now - flight.start) / flight.duration) : 1;
      const k = easeInOutCubic(t);
      tmpVecA.lerpVectors(flight.fromPos, flight.midPos, k);
      tmpVecB.lerpVectors(flight.midPos, flight.toPos, k);
      camera.position.lerpVectors(tmpVecA, tmpVecB, k);
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
    if (now >= dwellUntil) flyTo((stopIndex + 1) % ORDER.length, now);
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

  let sakuraBoost = 0;
  let workshopBoost = 0;
  let planeBoost = 0;
  let towerBoost = 0;
  let hourglassTargetRot = 0;
  let fishTargetPoint: THREE.Vector2 | null = null;
  let fishAttractLeft = 0;

  const triggerToyInternal = (key: ZoneKey) => {
    const z = zones.find((item) => item.key === key)!;
    if (key === "office") {
      sakuraBoost = 1.0;
    } else if (key === "workshop") {
      workshopBoost = 1.0;
    } else if (key === "pomo") {
      hourglassTargetRot += Math.PI;
      terrain.waterUniforms.uFocusWaveCenter.value.set(z.x, z.z);
      terrain.waterUniforms.uFocusWaveAge.value = 0;
    } else if (key === "studio") {
      planeBoost = 1.0;
    } else if (key === "tower") {
      towerBoost = 1.0;
    }
    if (!options.reducedMotion) bounceAt.set(key, performance.now());
    options.onToyTriggered?.(z.toyLabel);
  };

  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const pickables = [...landmarks.landmarks.values()];

  const getNdc = (ev: PointerEvent): boolean => {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    return true;
  };

  const pickLandmark = (ev: PointerEvent): ZoneKey | null => {
    if (!getNdc(ev)) return null;
    raycaster.setFromCamera(ndc, camera);
    let o: THREE.Object3D | null = raycaster.intersectObjects(pickables, true)[0]?.object ?? null;
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
        triggerToyInternal(key);
      } else if (getNdc(ev)) {
        raycaster.setFromCamera(ndc, camera);
        const hit = raycaster.intersectObject(terrain.waterMesh, false)[0];
        if (hit) {
          terrain.waterUniforms.uRippleCenter.value.set(hit.point.x, hit.point.z);
          terrain.waterUniforms.uRippleAge.value = 0;
          props.burstBubblesAt(hit.point.x, hit.point.z);
          fishTargetPoint = new THREE.Vector2(hit.point.x, hit.point.z);
          fishAttractLeft = 4.5;
          options.onToyTriggered?.("🫧 琉璃海面泛起涟漪，海底小鱼游了过来");
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

  const projVec = new THREE.Vector3();
  const projectPins = () => {
    if (!options.onProjectPins) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    const pins: PinScreenPos[] = zones.map((z) => {
      const lm = landmarks.landmarks.get(z.key)!;
      projVec.set(z.x, lm.position.y + z.pinOffsetY, z.z);
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

  let cableT = 0;
  let cableDir = 1;
  const cablePos = new THREE.Vector3();

  const animate = (now: number, dt: number) => {
    const sec = now / 1000;

    if (Math.abs(currentFov - targetFov) > 0.05) {
      const prevFov = currentFov;
      currentFov += (targetFov - currentFov) * Math.min(1, dt * 8);
      const ratio =
        Math.tan(THREE.MathUtils.degToRad(prevFov / 2)) /
        Math.tan(THREE.MathUtils.degToRad(currentFov / 2));
      const offset = camera.position.clone().sub(controls.target).multiplyScalar(ratio);
      camera.position.copy(controls.target).add(offset);
      camera.fov = currentFov;
      camera.updateProjectionMatrix();
    }

    for (const z of zones) {
      const g = landmarks.landmarks.get(z.key)!;
      const halo = landmarks.halos.get(z.key)!;
      const isHover = hovered === z.key;
      const isSelected = activeStop === z.key;

      const targetScale = isHover ? 1.045 : 1.0;
      g.scale.setScalar(g.scale.x + (targetScale - g.scale.x) * 0.18);

      let bounceY = 0;
      const b = bounceAt.get(z.key);
      if (b !== undefined) {
        const bt = (now - b) / BOUNCE_MS;
        if (bt >= 1) bounceAt.delete(z.key);
        else bounceY = Math.sin(bt * Math.PI) * 0.34;
      }
      g.position.y = z.groundY + bounceY;

      const haloMat = halo.material as THREE.MeshBasicMaterial;
      const targetOp = isSelected ? 0.8 : isHover ? 0.45 : 0;
      haloMat.opacity += (targetOp - haloMat.opacity) * 0.16;
      halo.scale.setScalar(isSelected ? 1 + Math.sin(sec * 3.2) * 0.04 : 1);
    }

    if (options.reducedMotion) return;

    sakuraBoost = Math.max(0, sakuraBoost - dt * 0.22);
    workshopBoost = Math.max(0, workshopBoost - dt * 0.22);
    planeBoost = Math.max(0, planeBoost - dt * 0.26);
    towerBoost = Math.max(0, towerBoost - dt * 0.25);
    fishAttractLeft = Math.max(0, fishAttractLeft - dt);

    terrain.waterUniforms.uTime.value = sec;
    terrain.waterUniforms.uRippleAge.value += dt;
    terrain.waterUniforms.uFocusWaveAge.value += dt;
    terrain.waterfallMat.emissiveIntensity = 0.14 + Math.sin(sec * 5.2) * 0.06;

    terrain.kelpBlades.forEach((blade, idx) => {
      blade.rotation.z = Math.sin(sec * 1.8 + idx * 0.9) * 0.18;
      blade.rotation.x = Math.cos(sec * 1.5 + idx) * 0.12;
    });

    terrain.fishActors.forEach((f, idx) => {
      const attract = fishAttractLeft > 0 && fishTargetPoint ? 1 : 0;
      const cx = attract ? lerp(f.centerX, fishTargetPoint!.x, 0.55) : f.centerX;
      const cz = attract ? lerp(f.centerZ, fishTargetPoint!.y, 0.55) : f.centerZ;
      const rx = attract ? 0.55 + (idx % 2) * 0.25 : f.radiusX;
      const rz = attract ? 0.5 + (idx % 3) * 0.2 : f.radiusZ;
      const ang = sec * f.speed * (attract ? 1.65 : 1.0) + f.phase;
      const nx = cx + Math.cos(ang) * rx;
      const nz = cz + Math.sin(ang) * rz;
      const dx = -Math.sin(ang) * rx;
      const dz = Math.cos(ang) * rz;
      f.group.position.set(nx, f.baseY + Math.sin(sec * 2 + f.phase) * 0.07, nz);
      f.group.rotation.y = Math.atan2(dx, dz);
      f.tail.rotation.y = Math.sin(sec * (attract ? 14 : 9) + f.phase) * 0.45;
    });

    for (const b of props.bubbles) {
      b.age += dt;
      if (b.age >= b.life) b.age -= b.life;
      const t = b.age / b.life;
      const curY = lerp(b.startY, WATER_TOP_Y - 0.06, t);
      b.mesh.position.set(
        b.x + Math.sin(sec * 3 + b.startY * 4) * 0.05,
        curY,
        b.z + Math.cos(sec * 2.5 + b.x) * 0.05
      );
      b.mesh.scale.setScalar(0.6 + t * 0.65);
    }

    const wsMult = 1 + workshopBoost * 2.5;
    landmarks.waterWheel.rotation.x -= dt * 1.15 * wsMult;
    for (const gr of landmarks.gears) {
      const spd = (gr.userData.speed as number) ?? 1;
      gr.rotation.z += dt * 1.1 * spd * wsMult;
    }
    landmarks.forgeMat.emissiveIntensity = 0.8 + Math.sin(sec * 8.5) * 0.25 + workshopBoost * 0.6;
    forgeLight.intensity =
      0.55 + curLampGlow * 1.2 + Math.sin(sec * 9) * 0.15 + workshopBoost * 0.8;

    cableT += dt * 0.12 * cableDir * wsMult;
    if (cableT >= 1) {
      cableT = 1;
      cableDir = -1;
    } else if (cableT <= 0) {
      cableT = 0;
      cableDir = 1;
    }
    const smoothCable = cableT * cableT * (3 - 2 * cableT);
    landmarks.cableCurve.getPointAt(smoothCable, cablePos);
    landmarks.cableCar.position.copy(cablePos);
    landmarks.cableCar.rotation.z = Math.sin(sec * 2.2) * 0.04;

    const twMult = 1 + towerBoost * 3.8;
    landmarks.armillaryRings[0].rotation.y += dt * 0.55 * twMult;
    landmarks.armillaryRings[0].rotation.x = 0.45 + Math.sin(sec * 0.5) * 0.15;
    landmarks.armillaryRings[1].rotation.x += dt * 0.72 * twMult;
    landmarks.armillaryRings[1].rotation.z = 0.65;
    landmarks.armillaryRings[2].rotation.z += dt * 0.95 * twMult;
    landmarks.beamPivot.rotation.y += dt * 0.6 * twMult;
    landmarks.pennant.rotation.y = Math.sin(sec * 4.5) * 0.25;

    const plMult = 1 + planeBoost * 4.5;
    landmarks.seaplaneProp.rotation.z += dt * 8.0 * plMult;
    landmarks.seaplaneGroup.position.y = -0.1 + Math.sin(sec * 1.7) * (0.045 + planeBoost * 0.14);
    landmarks.seaplaneGroup.rotation.z = Math.sin(sec * 1.4) * (0.04 + planeBoost * 0.1);

    landmarks.hourglassGroup.rotation.z +=
      (hourglassTargetRot - landmarks.hourglassGroup.rotation.z) * Math.min(1, dt * 6);
    landmarks.hourglassGroup.rotation.y += dt * 0.65;

    landmarks.sakuraCanopyGroup.rotation.z =
      Math.sin(sec * 1.3 + sakuraBoost * 6) * (0.02 + sakuraBoost * 0.05);
    const petalVisibleCount = sakuraBoost > 0.05 ? props.petals.length : 10;
    props.petals.forEach((p, idx) => {
      p.age += dt * (1 + sakuraBoost * 1.3);
      if (p.age >= p.life) p.age -= p.life;
      if (idx >= petalVisibleCount) {
        (p.mesh.material as THREE.MeshStandardMaterial).opacity = 0;
        return;
      }
      const t = p.age / p.life;
      p.mesh.position.set(
        p.originX + p.driftX * t * 2.2 + Math.sin(sec * 2 + idx) * 0.25,
        p.originY - t * 3.1,
        p.originZ + p.driftZ * t * 2.2 + Math.cos(sec * 1.7 + idx) * 0.25
      );
      p.mesh.rotation.set(sec * p.spin, sec * p.spin * 0.7, t * 4);
      (p.mesh.material as THREE.MeshStandardMaterial).opacity = Math.sin(t * Math.PI) * 0.9;
    });

    for (const sm of props.smokeParticles) {
      sm.age += dt * wsMult;
      if (sm.age >= sm.life) sm.age -= sm.life;
      const t = sm.age / sm.life;
      sm.mesh.position.set(
        landmarks.chimneyTipWorld.x + sm.driftX * t * 1.5,
        landmarks.chimneyTipWorld.y + 0.08 + t * 2.0,
        landmarks.chimneyTipWorld.z + sm.driftZ * t * 1.5
      );
      sm.mesh.scale.setScalar(0.65 + t * (1.7 + workshopBoost * 0.8));
      (sm.mesh.material as THREE.MeshStandardMaterial).opacity = Math.sin(t * Math.PI) * 0.45;
    }

    for (const sp of props.splashParticles) {
      sp.age += dt;
      if (sp.age >= sp.life) sp.age -= sp.life;
      const t = sp.age / sp.life;
      const r = 0.1 + t * 0.48;
      sp.mesh.position.set(
        terrain.waterfallSplashPos.x + Math.cos(sp.angle + sec) * r,
        terrain.waterfallSplashPos.y + Math.sin(t * Math.PI) * 0.24 + 0.04,
        terrain.waterfallSplashPos.z + Math.sin(sp.angle + sec) * r
      );
      (sp.mesh.material as THREE.MeshStandardMaterial).opacity = Math.sin(t * Math.PI) * 0.58;
    }

    for (const c of props.clouds) {
      c.angle += dt * c.speed;
      c.group.position.set(
        Math.cos(c.angle) * c.radius,
        c.height + Math.sin(sec * 0.6 + c.bobPhase) * 0.16,
        Math.sin(c.angle) * c.radius
      );
      c.group.lookAt(0, c.group.position.y, 0);
    }

    for (const b of props.birds) {
      b.angle += dt * b.speed;
      b.group.position.set(
        Math.cos(b.angle) * b.radius,
        b.height + Math.sin(sec * 1.4 + b.phase) * 0.28,
        Math.sin(b.angle) * b.radius
      );
      b.group.rotation.y = -b.angle;
      const flap = Math.sin(sec * 7.5 + b.phase) * 0.55;
      b.wingL.rotation.z = flap;
      b.wingR.rotation.z = -flap;
    }

    for (const ff of props.fireflies) {
      if (curFireflyOpacity <= 0.01) {
        ff.sprite.material.opacity = 0;
        continue;
      }
      const t = sec * ff.speed + ff.phase;
      ff.sprite.position.set(
        ff.baseX + Math.sin(t) * 0.35,
        ff.baseY + Math.sin(t * 1.4) * 0.24,
        ff.baseZ + Math.cos(t * 0.9) * 0.35
      );
      ff.sprite.material.opacity =
        curFireflyOpacity * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(sec * 3.2 + ff.phase))) * 0.88;
    }
  };

  let raf = 0;
  let running = false;
  let last = 0;

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
    last = now;
    updateTour(now);
    applyLight(now);
    animate(now, dt);
    controls.update();
    renderer.render(scene, camera);
    projectPins();
  };

  const api: IslandScene = {
    setPeriod(period: TimePeriod) {
      lightFrom = captureCurrentLight();
      lightTo = toLightRuntime(sampleLightingAtHour(PERIOD_TO_HOUR[period]));
      lightDuration = 850;
      lightStart = performance.now();
    },
    setHour(hour: number) {
      lightFrom = captureCurrentLight();
      lightTo = toLightRuntime(sampleLightingAtHour(hour));
      lightDuration = 90;
      lightStart = performance.now();
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
    setIsoMode(iso: boolean) {
      targetFov = iso ? ISO_FOV : PERSP_FOV;
      controls.minDistance = iso ? 14 : 7.5;
      controls.maxDistance = iso ? 80 : 48;
    },
    triggerToy(key: ZoneKey) {
      triggerToyInternal(key);
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

      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry.dispose();
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => m.dispose());
        }
        if ((o as THREE.InstancedMesh).isInstancedMesh) (o as THREE.InstancedMesh).dispose();
        const sp = o as THREE.Sprite;
        if (sp.isSprite) sp.material.dispose();
      });

      textures.dispose();
      envRT.dispose();
      sun.shadow.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };

  renderer.render(scene, camera);
  projectPins();
  return api;
}
