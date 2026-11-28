/* eslint-disable */
// papercraft / lib / paper-life.js: a living world, as plumbing (references/motion.md section 12).
//
// Weather and air (fallers: leaves, snow, petals, ash, rain; motes: dust, pollen, spores, bubbles, embers), flyers
// (butterflies, moths, bees, fireflies), flocks (birds, bats, gulls; a school of fish in a reef), puffs (chimney smoke,
// steam), mist, cloud shadows, and creatures that move with a behaviour (graze, peck, shy, float, perch, pet).
// Everything is paper: small matte cut cards lit by the scene (fireflies and embers glow). Nothing here draws a
// subject: YOUR brief chooses the kinds, their colours, cuts, counts and where they live. Sizes and speeds are in hero
// heights (H), so one set of numbers fits any scale. Deterministic: seeded, advanced only by update(dt); reset()
// replays from the seed (call it from your restart, so `restart(); step(T)` captures repeat).
//
//   const life = createLife({ scene, camera, heroHeight: 3.6, seed: 7, wind: [0.94, 0.34] });
//   life.fallers({ count: 40, cut: 'leaf', colors: ['#d9822b', '#c8552a'] });     // this world's leaves
//   life.critter(duckHandle.group, { behaviour: 'float', hero: heroPosition });
//   H.onStep((t, dt) => life.update(dt, H.target)); H.onRestart(() => life.reset(H.target));   // the 3D harness's hooks
import * as THREE from 'three';

const rngOf = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const lerp = (a, b, t) => a + (b - a) * t;
const pick = (r, v) => (Array.isArray(v) ? lerp(v[0], v[1], r()) : v);
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const wrap = (v, c, w) => c + ((((v - c + w / 2) % w) + w) % w) - w / 2;

/** Unit cut outlines (about 1 across, centred; wings start at the body, x = 0): pass a name or your own [[x, y], ...]. */
export const cuts = {
  leaf: () => { const p = []; for (let i = 0; i <= 10; i++) { const t = i / 10; p.push([t - 0.5, 0.27 * Math.sin(Math.PI * t) ** 0.8]); } for (let i = 9; i >= 1; i--) { const t = i / 10; p.push([t - 0.5, -0.27 * Math.sin(Math.PI * t) ** 0.8]); } p.push([-0.5, -0.02], [-0.62, -0.03], [-0.62, 0.02]); return p; },
  petal: () => { const p = []; for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; const r = 0.5 * (1 - 0.35 * Math.max(0, Math.cos(a)) ** 3); p.push([Math.cos(a) * r, Math.sin(a) * r * 0.62]); } return p; },
  flake: () => { const p = []; for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2, r = i % 2 ? 0.2 : 0.5; p.push([Math.cos(a) * r, Math.sin(a) * r]); } return p; },
  disc: () => { const p = []; for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; p.push([Math.cos(a) * 0.5, Math.sin(a) * 0.5]); } return p; },
  // smoke and steam as the source game cuts it: a round paper disc with a spiral cut printed on it (puffTexture)
  puff: () => { const p = []; for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; p.push([Math.cos(a) * 0.5, Math.sin(a) * 0.5]); } return p; },
  streak: () => [[-0.035, -0.5], [0.035, -0.5], [0.035, 0.5], [-0.035, 0.5]],
  confetti: () => [[-0.4, -0.25], [0.4, -0.25], [0.4, 0.25], [-0.4, 0.25]],
  wing: () => [[0, 0.05], [0.3, 0.5], [0.72, 0.56], [0.95, 0.28], [0.7, 0.02], [0.82, -0.3], [0.5, -0.46], [0.12, -0.24]],
  birdWing: () => [[0, 0.1], [0.5, 0.14], [1, 0.02], [0.55, -0.06], [0, -0.1]],
  // a paper smoke curl: a spiral band (one and a half turns) cut from a disc of card
  curl: () => { const o = [], inn = []; for (let i = 0; i <= 40; i++) { const t = i / 40, a = t * Math.PI * 3, r = 0.12 + 0.38 * t, w = 0.05 + 0.09 * t; o.push([Math.cos(a) * r, Math.sin(a) * r]); inn.push([Math.cos(a) * (r - w), Math.sin(a) * (r - w)]); } return o.concat(inn.reverse()); },
};
const shapeGeo = (cut, mirror = false) => {
  const pts = typeof cut === 'function' ? cut() : Array.isArray(cut) ? cut : cuts[cut]();
  const g = new THREE.ShapeGeometry(new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(mirror ? -x : x, y))));
  return g;
};
// the spiral cut on a puff disc (a thin pale-grey line, 1.6 turns), mapped onto the 'puff' cut's shape coordinates
let _puffTex = null;
const puffTexture = () => {
  if (_puffTex) return _puffTex;
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 128, 128);
  g.strokeStyle = '#cfc7b9'; g.lineWidth = 5.5; g.lineCap = 'round'; g.beginPath();
  for (let a = 0; a <= 9.5; a += 0.2) { const r = (0.07 + a * 0.062) / 0.9 * 64, x = 64 + (0.02 / 0.9) * 64 + Math.cos(a) * r, y = 64 - (0.05 / 0.9) * 64 + Math.sin(a) * r; if (a === 0) g.moveTo(x, y); else g.lineTo(x, y); }
  g.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.offset.set(0.5, 0.5);   // shape units (-0.5..0.5) -> uv
  return (_puffTex = t);
};
// a soft round blot: as a colour map with alpha (sprites), or as a grey alpha map (three reads alphaMap from green)
const radialTexture = (soft = 0.55, asAlphaMap = false) => {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  const col = (a) => (asAlphaMap ? `rgb(${Math.round(255 * a)},${Math.round(255 * a)},${Math.round(255 * a)})` : `rgba(255,255,255,${a})`);
  gr.addColorStop(0, col(1)); gr.addColorStop(soft, col(0.55)); gr.addColorStop(1, col(0));
  if (asAlphaMap) { g.fillStyle = '#000'; g.fillRect(0, 0, 128, 128); }
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); if (!asAlphaMap) t.colorSpace = THREE.SRGBColorSpace; return t;
};

/**
 * scene, camera: three.js. heroHeight: H in world units. wind: the prevailing direction on the page [x, z].
 * box: the volume (in H) around the update centre in which weather and air live and wrap (default ~2x the frame).
 * groundY: optional (x, z) => y terrain height callback for undulating/multi-altitude worlds (defaults to 0).
 */
export function createLife({ scene, camera, heroHeight = 3.6, seed = 1, wind = [0.94, 0.34], box = { w: 34, d: 30, h: 7.5 }, groundY = null } = {}) {
  const H = heroHeight, wl = Math.hypot(wind[0], wind[1]) || 1, WX = wind[0] / wl, WZ = wind[1] / wl;
  const BW = box.w * H, BD = box.d * H, BH = box.h * H;
  const group = new THREE.Group(); group.name = 'life'; scene.add(group);
  const kinds = [], centre = new THREE.Vector3(), _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(),
    _s = new THREE.Vector3(), _e = new THREE.Euler(), _o = new THREE.Object3D(), _c = new THREE.Color(), _w = new THREE.Vector3(), _up = new THREE.Vector3();
  // the ground's height under (x, z); a callback that returns nothing (off the terrain) counts as 0
  const gy = (x, z) => { const y = groundY ? groundY(x, z) : 0; return Number.isFinite(y) ? y : 0; };
  let night = 0, time = 0, nKind = 0;
  const factor = (k) => lerp(k.day ?? 1, k.night ?? 1, night);
  const pool = (geo, n, { glow = 0, map = null } = {}) => {
    // Dead-matte Lambert (no GGX specular sheen, matching SKILL.md law 2) or unlit emissive for glowing fireflies/embers
    const mat = glow ? new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, toneMapped: false })
      : new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide, map });
    const m = new THREE.InstancedMesh(geo, mat, Math.max(1, n));
    m.frustumCulled = false; m.castShadow = false; m.receiveShadow = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    group.add(m); return m;
  };
  const colourAll = (mesh, n, colors, r, mul = 1) => { for (let i = 0; i < n; i++) { _c.set(colors[Math.floor(r() * colors.length) % colors.length]).multiplyScalar(mul); mesh.setColorAt(i, _c); } if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true; };
  // two wing cards per flyer: the body frame turns to the heading; each wing (A spans +x, B its mirror -x) flaps up
  // about the body's forward axis, then its cut is laid level with the forewing forward
  const _bq = new THREE.Quaternion(), _qz = new THREE.Quaternion(), _Z = new THREE.Vector3(0, 0, 1);
  const setWings = (A, B, i, x, y, z, yaw, fl, s) => {
    _o.position.set(x, y, z); _o.rotation.set(0, yaw, 0); _o.scale.setScalar(s); _bq.copy(_o.quaternion);
    _o.rotateZ(fl); _o.rotateX(Math.PI / 2); _o.updateMatrix(); A.setMatrixAt(i, _o.matrix);
    _o.quaternion.copy(_bq); _o.rotateZ(-fl); _o.rotateX(Math.PI / 2); _o.updateMatrix(); B.setMatrixAt(i, _o.matrix);
  };
  const add = (k) => { k.seed = seed * 7919 + (++nKind) * 977; kinds.push(k); k.reset(rngOf(k.seed)); return k; };

  /** Things that fall and settle: leaves, snow, petals, blossom, ash, confetti; rain with { cut: 'streak', streak: true }.
   *  colors: your world's (the default is plain paper). */
  function fallers({ count = 40, colors = ['#efe6d2'], cut = 'leaf', size = [0.22, 0.33], fall = [0.7, 1.2], sway = 0.55, tumble = 1.5, land = 9, wind: ws = 0.9, streak = false, ground = 0, day = 1, night: nt = 1 } = {}) {
    const mesh = pool(shapeGeo(cut), count), S = new Float32Array(count * 9); // bx, yRel, bz, vy, phase, size, angle, landT, axisSeed
    const spawn = (r, i, top) => { const o = i * 9; S[o] = centre.x + (r() - 0.5) * BW; S[o + 2] = centre.z + (r() - 0.5) * BD; S[o + 1] = top ? BH * lerp(0.75, 1, r()) : BH * r(); S[o + 3] = pick(r, fall) * H; S[o + 4] = r() * 6.28; S[o + 5] = pick(r, size) * H; S[o + 6] = r() * 6.28; S[o + 7] = -1; S[o + 8] = r(); };
    return add({ day, night: nt, mesh, reset(r) { this.r = r; colourAll(mesh, count, colors, r); for (let i = 0; i < count; i++) { spawn(r, i, false); if (!streak && r() < 0.25) { S[i * 9 + 1] = ground; S[i * 9 + 7] = r() * land; } } },
      update(dt) {
        const n = (mesh.count = Math.round(count * factor(this))), r = this.r;
        for (let i = 0; i < n; i++) {
          const o = i * 9;
          if (S[o + 7] < 0) {
            S[o + 1] -= S[o + 3] * dt; S[o + 4] += dt * (1.1 + (i % 5) * 0.12); S[o + 6] += tumble * dt * (S[o + 8] < 0.5 ? 1 : -1);
            S[o] += WX * ws * H * dt; S[o + 2] += WZ * ws * H * dt;
            if (S[o + 1] <= ground + 0.004 * H) { S[o + 1] = ground + 0.004 * H; S[o + 7] = 0; if (streak) S[o + 7] = land; }
          } else if ((S[o + 7] += dt) >= land) spawn(r, i, true);
          S[o] = wrap(S[o], centre.x, BW); S[o + 2] = wrap(S[o + 2], centre.z, BD);
          const landed = S[o + 7] >= 0, k = landed ? Math.max(0, 1 - S[o + 7] / land) : 1;
          const x = S[o] + (landed ? 0 : sway * H * Math.sin(S[o + 4])), z = S[o + 2] + (landed ? 0 : sway * 0.6 * H * Math.cos(S[o + 4] * 0.7));
          _p.set(x, gy(x, z) + S[o + 1], z);
          if (streak) { _e.set(0, Math.atan2(camera.position.x - x, camera.position.z - z), -0.12 * ws * Math.sign(WX || 1)); _q.setFromEuler(_e); _s.set(S[o + 5], landed ? 0 : S[o + 5], 1); }
          else if (landed) { _e.set(-Math.PI / 2, 0, S[o + 6]); _q.setFromEuler(_e); _s.setScalar(S[o + 5] * k); }
          else { _e.set(S[o + 6] * (0.6 + S[o + 8]), S[o + 6], S[o + 6] * 0.4); _q.setFromEuler(_e); _s.setScalar(S[o + 5]); }
          mesh.setMatrixAt(i, _m.compose(_p, _q, _s));
        }
        mesh.instanceMatrix.needsUpdate = true;
      } });
  }

  /** Things that hang in the air: dust, pollen, spores; bubbles and embers with rise > 0 (embers glow > 0). */
  function motes({ count = 50, colors = ['#f1dfb6'], cut = 'disc', size = [0.04, 0.065], speed = [0.2, 0.5], height = [0.25, 2.5], rise = 0, glow = 0, near = 8, day = 1, night: nt = 1 } = {}) {
    const mesh = pool(shapeGeo(cut), count, { glow }), S = new Float32Array(count * 7); // x, yRel, z, heading, speed, size, phase
    return add({ day, night: nt, mesh, reset(r) { colourAll(mesh, count, colors, r, glow || 1); for (let i = 0; i < count; i++) { const o = i * 7; S[o] = centre.x + (r() - 0.5) * BW; S[o + 1] = pick(r, height) * H; S[o + 2] = centre.z + (r() - 0.5) * BD; S[o + 3] = r() * 6.28; S[o + 4] = pick(r, speed) * H; S[o + 5] = pick(r, size) * H; S[o + 6] = r() * 6.28; } },
      update(dt) {
        const n = (mesh.count = Math.round(count * factor(this))), lo = height[0] * H, hi = height[1] * H;
        for (let i = 0; i < n; i++) {
          const o = i * 7; S[o + 3] += Math.sin(time * 0.7 + i) * 0.6 * dt; S[o + 6] += dt;
          S[o] = wrap(S[o] + (Math.cos(S[o + 3]) * S[o + 4] + WX * 0.15 * H) * dt, centre.x, BW);
          S[o + 2] = wrap(S[o + 2] + (Math.sin(S[o + 3]) * S[o + 4] + WZ * 0.15 * H) * dt, centre.z, BD);
          S[o + 1] += (rise * H + Math.sin(S[o + 6] * 1.3) * 0.08 * H) * dt; if (S[o + 1] > hi) S[o + 1] = lo; if (S[o + 1] < lo) S[o + 1] = hi;
          _p.set(S[o], gy(S[o], S[o + 2]) + S[o + 1], S[o + 2]);
          const fade = smooth(near * 0.5 * H, near * H, _p.distanceTo(camera.position));      // never a fat blur near the lens
          _s.setScalar(S[o + 5] * fade); mesh.setMatrixAt(i, _m.compose(_p, camera.quaternion, _s));
        }
        mesh.instanceMatrix.needsUpdate = true;
      } });
  }

  /** Small flyers that roam: butterflies, moths, bees (paired wings), fireflies (glow > 0: a pulsing dot, no wings). */
  function flyers({ count = 12, colors = ['#efe6d2'], size = 0.22, roam = 1.8, height = [0.5, 1.25], flap = 11, anchors = null, glow = 0, cut = 'wing', day = 1, night: nt = 0 } = {}) {
    const wings = !glow, A = wings ? pool(shapeGeo(cut), count) : pool(shapeGeo('disc'), count, { glow }), B = wings ? pool(shapeGeo(cut, true), count) : null;
    const S = new Float32Array(count * 8); // anchor x, z, phase a, b, c, height, size, colourIdx
    let cols = [];
    return add({ day, night: nt, reset(r) {
      cols = []; for (let i = 0; i < count; i++) {
        const o = i * 8, a = anchors && anchors.length ? anchors[i % anchors.length] : [centre.x + (r() - 0.5) * BW * 0.6, centre.z + (r() - 0.5) * BD * 0.6];
        S[o] = a[0]; S[o + 1] = a[1]; S[o + 2] = r() * 6.28; S[o + 3] = r() * 6.28; S[o + 4] = r() * 6.28; S[o + 5] = pick(r, height) * H; S[o + 6] = size * H * lerp(0.85, 1.15, r());
        cols.push(colors[Math.floor(r() * colors.length) % colors.length]);
        _c.set(cols[i]).multiplyScalar(glow || 1); A.setColorAt(i, _c); if (B) B.setColorAt(i, _c);
      }
      if (A.instanceColor) A.instanceColor.needsUpdate = true; if (B && B.instanceColor) B.instanceColor.needsUpdate = true;
    },
      update() {
        const n = Math.round(count * factor(this)); A.count = n; if (B) B.count = n;
        for (let i = 0; i < n; i++) {
          const o = i * 8, t = time, R = roam * H;
          const x = S[o] + R * (Math.sin(t * 0.37 + S[o + 2]) + 0.45 * Math.sin(t * 0.91 + S[o + 3])), z = S[o + 1] + R * (Math.cos(t * 0.29 + S[o + 3]) + 0.45 * Math.sin(t * 0.83 + S[o + 4]));
          const vx = R * (0.37 * Math.cos(t * 0.37 + S[o + 2]) + 0.41 * Math.cos(t * 0.91 + S[o + 3])), vz = R * (-0.29 * Math.sin(t * 0.29 + S[o + 3]) + 0.37 * Math.cos(t * 0.83 + S[o + 4]));
          const y = gy(x, z) + S[o + 5] + 0.18 * H * Math.sin(t * 1.7 + S[o + 4]);
          if (!wings) {
            const pulse = 0.45 + 0.55 * Math.max(0, Math.sin(t * 2.1 + S[o + 2])) ** 2;
            _s.setScalar(S[o + 6] * (0.6 + 0.4 * pulse)); A.setMatrixAt(i, _m.compose(_p.set(x, y, z), camera.quaternion, _s));
            continue;
          }
          const yaw = Math.atan2(vx, vz), fl = 0.25 + 1.0 * Math.abs(Math.sin(t * flap * Math.PI + S[o + 2]));
          setWings(A, B, i, x, y, z, yaw, fl, S[o + 6]);
        }
        A.instanceMatrix.needsUpdate = true; if (B) B.instanceMatrix.needsUpdate = true;
        if (!wings && A.instanceColor) A.instanceColor.needsUpdate = true;
      } });
  }

  /** A flock that crosses now and then, just above the tallest pieces (so it stays near the focal band): birds, bats,
   *  gulls; a school of fish with a fin cut. every / cross in seconds; height, span, wing in H (height: just above the
   *  world's tallest common pieces; much higher, they leave the focal band and blur into dark slashes). */
  function flock({ size = 5, every = 30, cross = 15, height = 2.8, span = 56, wing = 0.33, flap = 6.5, colors = ['#f6f1e6', '#e9e2d4'], cut = 'birdWing', gap = 0.9, day = 1, night: nt = 0.35 } = {}) {
    const A = pool(shapeGeo(cut), size), B = pool(shapeGeo(cut, true), size);
    let dir = 0, start = 0, ox = 0, oz = 0, go = false, began = false;
    return add({ day, night: nt, reset(r) { this.r = r; colourAll(A, size, colors, r); colourAll(B, size, colors, rngOf(this.seed)); start = every * (0.15 + 0.35 * r()); dir = r() * 6.28; go = r() < factor(this); began = false; },
      update() {
        const r = this.r;
        if (time > start + cross) { start += every * lerp(0.8, 1.2, r()); dir = r() * 6.28; go = r() < factor(this); began = false; }  // at night only some crossings happen
        const u = (time - start) / cross;
        if (u >= 0 && !began) { began = true; ox = centre.x; oz = centre.z; }
        const vis = go && u >= 0 && u <= 1;
        A.count = B.count = vis ? size : 0; if (!vis) return;
        const dx = Math.cos(dir), dz = Math.sin(dir), cx = ox + dx * span * H * (u - 0.5), cz = oz + dz * span * H * (u - 0.5);
        for (let i = 0; i < size; i++) {
          const k = i - (size - 1) / 2, back = Math.abs(k) * gap * H, side = k * gap * H * 0.9;
          const x = cx - dx * back - dz * side, z = cz - dz * back + dx * side, y = gy(x, z) + height * H + 0.15 * H * Math.sin(time * 0.8 + i);
          const fl = 0.15 + 0.75 * Math.abs(Math.sin(time * flap * Math.PI + i * 1.3));
          setWings(A, B, i, x, y, z, Math.atan2(dx, dz), fl, wing * H);
        }
        A.instanceMatrix.needsUpdate = B.instanceMatrix.needsUpdate = true;
      } });
  }

  /** Puffs from emitters (chimney smoke, steam, a kettle): at = [[x, y, z] | { object, offset: [x, y, z] }]. An emitter on
   *  an object puffs only while that object stands upright (a chimney lying folded does not smoke). */
  function puffs({ at = [], perEmitter = 3, life = 4.5, rise = 0.45, size = [0.2, 0.45], drift = 0.33, wobble = 0.075, spin = 0.5, colors = ['#f3e8d2', '#ece0c8'], cut = 'puff', day = 1, night: nt = 0 } = {}) {
    const n = Math.max(1, at.length * perEmitter), mesh = pool(shapeGeo(cut), n, { map: cut === 'puff' ? puffTexture() : null }), S = new Float32Array(n * 2); // phase, sizeJitter
    return add({ day, night: nt, mesh, reset(r) { colourAll(mesh, n, colors, r); for (let i = 0; i < n; i++) { S[i * 2] = r(); S[i * 2 + 1] = lerp(0.85, 1.15, r()); } },
      update() {
        let shown = 0;
        if (factor(this) > 0.01) for (let e = 0; e < at.length; e++) {
          const a = at[e];
          if (Array.isArray(a)) _w.set(a[0], a[1], a[2]);
          else { a.object.updateWorldMatrix(true, false); _w.set(...(a.offset || [0, 0, 0])).applyMatrix4(a.object.matrixWorld); _up.set(0, 1, 0).transformDirection(a.object.matrixWorld); if (_up.y < 0.85) continue; }
          for (let k = 0; k < perEmitter; k++) {
            const i = e * perEmitter + k, age = ((time / life + S[i * 2] + k / perEmitter) % 1), t = age * life;
            _p.set(_w.x + WX * drift * H * t + Math.sin(t * 1.9 + k) * wobble * H, _w.y + rise * H * t, _w.z + WZ * drift * H * t + Math.cos(t * 1.4 + k) * wobble * H);
            const s = lerp(size[0], size[1], age) * H * S[i * 2 + 1] * smooth(0, 0.12, age) * (1 - smooth(0.72, 1, age)) * factor(this);
            _q.copy(camera.quaternion).multiply(_qz.setFromAxisAngle(_Z, spin * t + i * 2.1));   // a slow turn in the view plane
            _s.setScalar(s); mesh.setMatrixAt(shown++, _m.compose(_p, _q, _s));
          }
        }
        mesh.count = shown; mesh.instanceMatrix.needsUpdate = true;
      } });
  }

  /** Low soft mist sheets drifting along the wind (a misty forest, a marsh, a cold morning). */
  function mist({ count = 7, size = [5.5, 7.5], y = 0.8, alpha = 0.1, drift = 0.25, color = '#e8ece6', day = 1, night: nt = 1.25 } = {}) {
    const tex = radialTexture(0.5), items = [], yRel = [];
    for (let i = 0; i < count; i++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color, transparent: true, opacity: alpha, depthWrite: false })); group.add(m); items.push(m); yRel.push(y * H); }
    return add({ day, night: nt, reset(r) { for (let i = 0; i < items.length; i++) { const m = items[i], x = centre.x + (r() - 0.5) * BW, z = centre.z + (r() - 0.5) * BD; yRel[i] = y * H * lerp(0.8, 1.2, r()); m.position.set(x, gy(x, z) + yRel[i], z); const s = pick(r, size) * H; m.scale.set(s, s * 0.45, 1); } },
      update(dt) { const f = factor(this); for (let i = 0; i < items.length; i++) { const m = items[i]; m.position.x = wrap(m.position.x + WX * drift * H * dt, centre.x, BW); m.position.z = wrap(m.position.z + WZ * drift * H * dt, centre.z, BD); m.position.y = gy(m.position.x, m.position.z) + yRel[i]; m.material.opacity = alpha * f; } } });
  }

  /** Big soft cloud shadows sliding over the page (a sunny day with clouds; never at night). */
  function cloudShadows({ count = 4, size = [13, 22], alpha = 0.15, speed = 0.57, color = '#0b0a1c', day = 1, night: nt = 0 } = {}) {
    const tex = radialTexture(0.62, true), items = [];
    for (let i = 0; i < count; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color, alphaMap: tex, transparent: true, opacity: alpha, depthWrite: false }));
      m.rotation.x = -Math.PI / 2; m.renderOrder = -1; group.add(m); items.push(m);
    }
    return add({ day, night: nt, reset(r) { for (const m of items) { const x = centre.x + (r() - 0.5) * BW * 1.5, z = centre.z + (r() - 0.5) * BD * 1.5; m.position.set(x, gy(x, z) + 0.04 * H, z); const s = pick(r, size) * H; m.scale.set(s, s * lerp(0.55, 0.8, r()), 1); m.rotation.z = r() * 3; } },
      update(dt) { const f = factor(this); for (const m of items) { m.position.x = wrap(m.position.x + WX * speed * H * dt, centre.x, BW * 1.5); m.position.z = wrap(m.position.z + WZ * speed * H * dt, centre.z, BD * 1.5); m.position.y = gy(m.position.x, m.position.z) + 0.04 * H; m.material.opacity = alpha * f; m.visible = f > 0.01; } } });
  }

  /**
   * Pooled deterministic 3D cut-paper celebration/impact bursts (folded stars, confetti, petals). Zero allocations per
   * spawn; replays identically after reset(). Call returned handle's `spawn(origin, { count, colors, speed, scale })`
   * (origin: [x, y, z] or a Vector3).
   */
  function bursts({ capacity: cap = 96, cut = 'confetti', colors = ['#e6b24c', '#d81d4a', '#f6efe3'], size = [0.11, 0.18], gravity = 1.6, drag = 1.75, glow = 0 } = {}) {
    const capacity = Math.max(1, Math.floor(cap) || 1);
    const mesh = pool(shapeGeo(cut), capacity, { glow });
    // Pre-allocate instanceColor before first render so Three.js compiles USE_INSTANCING_COLOR on frame 0
    for (let i = 0; i < capacity; i++) mesh.setColorAt(i, _c.set(colors[i % colors.length]).multiplyScalar(glow || 1));
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.count = 0;
    const slots = Array.from({ length: capacity }, () => ({ on: false, age: 0, life: 1, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, rx: 0, ry: 0, rz: 0, ax: 0, ay: 0, az: 0, s0: 1, ph: 0, col: new THREE.Color() }));
    let cur = 0, r = rngOf(seed * 3571 + 19);
    const kind = add({
      reset(rr) { r = rr; cur = 0; for (const p of slots) p.on = false; mesh.count = 0; },
      update(dt) {
        const dr = Math.exp(-drag * dt); let shown = 0;
        for (const p of slots) {
          if (!p.on) continue;
          p.age += dt;
          if (p.age >= p.life) { p.on = false; continue; }
          const u = p.age / p.life;
          p.vx *= dr; p.vz *= dr; p.vy -= gravity * H * dt;
          p.x += (p.vx + Math.sin(p.age * 7.5 + p.ph) * 0.14 * H) * dt;
          p.y += p.vy * dt; p.z += p.vz * dt;
          const floor = gy(p.x, p.z) + 0.04 * H;
          if (p.y < floor) { p.y = floor; p.vy *= -0.15; p.vx *= 0.6; p.vz *= 0.6; }
          p.ax += p.rx * dt; p.ay += p.ry * dt; p.az += p.rz * dt;
          const popIn = u < 0.1 ? u / 0.1 : 1, shrink = u > 0.62 ? Math.max(0, 1 - ((u - 0.62) / 0.38) ** 2) : 1;
          _p.set(p.x, p.y, p.z); _e.set(p.ax, p.ay, p.az); _q.setFromEuler(_e); _s.setScalar(Math.max(1e-3, p.s0 * popIn * shrink));
          mesh.setMatrixAt(shown, _m.compose(_p, _q, _s));
          mesh.setColorAt(shown, p.col);
          shown++;
        }
        mesh.count = shown;
        if (shown > 0) { mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true; }
      },
    });
    kind.spawn = (at, { count = 20, colors: pal = colors, speed = [1.2, 2.2], upBoost = 1.0, scale = 1.0, life = [1.0, 1.8], spreadZ = 1.0 } = {}) => {
      const origin = Array.isArray(at) ? at : [at.x, at.y, at.z];
      for (let i = 0; i < count; i++) {
        const p = slots[cur++ % capacity], r1 = r(), r2 = r(), r3 = r();
        const ang = (i / Math.max(1, count)) * Math.PI * 2 + (r1 - 0.5) * 0.45, sp = pick(r, speed) * H;
        p.on = true; p.age = 0; p.life = pick(r, life);
        p.x = origin[0] + Math.cos(ang) * 0.1 * H; p.y = origin[1] + (r2 - 0.3) * 0.15 * H; p.z = origin[2] + Math.sin(ang) * 0.1 * H;
        p.vx = Math.cos(ang) * sp; p.vz = Math.sin(ang) * sp * 0.72 * spreadZ + (spreadZ > 1 ? 0.5 * H * r3 : 0);
        p.vy = sp * (0.55 + 0.65 * r1) * upBoost;
        p.rx = (r1 - 0.5) * 8.5; p.ry = (r2 - 0.5) * 10.5; p.rz = (r3 - 0.5) * 8.0;
        p.ax = r1 * 6.28; p.ay = r2 * 6.28; p.az = r3 * 6.28;
        p.s0 = pick(r, size) * H * scale; p.ph = r3 * 6.28;
        p.col.set(pal[i % pal.length]).multiplyScalar(glow || 1);
      }
    };
    return kind;
  }

  /**
   * A creature that lives in the world: moves `node` (a popup's group, or any Object3D standing on the page) with a
   * behaviour, flips its card to face the way it goes (never edge-on), hops and rocks a little per step.
   *   graze  slow drift round home, long pauses; stops and faces the hero when he passes (sheep, cows, camels, deer)
   *   peck   short quick moves and turns; scatters a hop away from the hero (hens, chicks, pigeons, small birds)
   *   shy    sits still; when the hero comes close it freezes, bounds away, then peeks back (rabbits, foxes, lizards)
   *   float  slow arcs round home on water (ducks, swans, boats); keep `roam` inside the water
   *   perch  stays put, turns now and then (an owl on a stump, a cat on a fence, a gull on a post)
   *   pet    wanders, sits and naps near home (cats, dogs)
   * walk: a WalkField (its blockers, solids and water stop the creature; tested with why(), so the hero's walk is untouched);
 * solid: a radius in H (with walk): the creature is a moving solid in that walk field, so the hero walks round it, not
 * through it (yaks, cows, camels, people; small critters may stay walk-through, 0); hero: a Vector3 (his position); card: the Object3D whose
   * scale.x flips (default node; critter art faces +x). Distances in H, speeds in H/s.
   */
  function critter(node, { behaviour = 'graze', home = null, roam = 1.2, speed = 0.7, run = 4.5, walk = null, hero = null, card = node, notice = 2.2, scatter = 1.25, hop = 0.03, rock = 0.06, step = 0.28, solid = 0 } = {}) {
    const h0 = home ? new THREE.Vector3(home[0], node.position.y, home[1]) : node.position.clone();
    const baseSX = Math.abs(card.scale.x) || 1;
    const sol = walk && solid > 0 ? { x: h0.x, z: h0.z, r: solid * H, base: -Infinity, top: Infinity } : null;
    if (sol) walk.solids.push(sol);   // a moving solid: its position follows the creature every step
    const st = { mode: 'idle', t: 0, tx: h0.x, tz: h0.z, sp: speed, face: 1, flip: 1, ph: 0, ang: 0 };
    return add({ reset(r) { this.r = r; node.position.copy(h0); if (sol) { sol.x = h0.x; sol.z = h0.z; } st.mode = 'idle'; st.t = r() * 3; st.face = st.flip = 1; st.ph = 0; st.ang = r() * 6.28; card.scale.x = baseSX; },
      update(dt) {
        const r = this.r, p = node.position, dh = hero ? Math.hypot(hero.x - p.x, hero.z - p.z) / H : 1e9;
        // his own height above the ground stays (an owl on a stump, a cat on a fence), over rising ground too
        const baseY = h0.y + (groundY ? gy(p.x, p.z) - gy(h0.x, h0.z) : 0);
        const goTo = (x, z, sp, mode) => { st.tx = x; st.tz = z; st.sp = sp; st.mode = mode; };
        const away = (dist, sp) => { const ax = p.x - hero.x, az = p.z - hero.z, l = Math.hypot(ax, az) || 1; goTo(p.x + (ax / l) * dist * H, p.z + (az / l) * dist * H, sp, 'flee'); };
        const faceHero = () => { if (hero) st.face = Math.sign((hero.x - p.x) * camRight.x + (hero.z - p.z) * camRight.z) || st.face; };
        if (behaviour === 'float') {
          st.ang += (speed * H / Math.max(0.3 * H, roam * H)) * dt; const rr = roam * H * (0.75 + 0.25 * Math.sin(time * 0.23 + h0.x));
          const nx = h0.x + Math.cos(st.ang) * rr, nz = h0.z + Math.sin(st.ang) * rr * 0.6;
          st.face = Math.sign((nx - p.x) * camRight.x + (nz - p.z) * camRight.z) || st.face; p.x = nx; p.z = nz;
          p.y = baseY + 0.01 * H * Math.sin(time * 1.3 + h0.z);
        } else {
          st.t -= dt;
          if (behaviour === 'perch') { if (st.t <= 0) { st.face = -st.face; st.t = lerp(4, 9, r()); } }
          else if (st.mode === 'idle' || st.mode === 'watch') {
            if (hero && behaviour === 'shy' && dh < notice * 1.2) { if (st.mode !== 'freeze') { st.mode = 'freeze'; st.t = 0.4; faceHero(); } }
            else if (hero && behaviour === 'peck' && dh < scatter) away(lerp(1, 1.5, r()), run * 0.6);
            else if (hero && behaviour === 'graze' && dh < notice) { st.mode = 'watch'; faceHero(); st.t = Math.max(st.t, 0.6); }
            else if (st.t <= 0) {
              const far = behaviour === 'peck' ? lerp(0.3, 0.8, r()) * H : lerp(0.3, 1, r()) * roam * H, a = r() * 6.28;
              let x = p.x + Math.cos(a) * far, z = p.z + Math.sin(a) * far;
              if (Math.hypot(x - h0.x, z - h0.z) > roam * H) { x = h0.x + (x - h0.x) * 0.5; z = h0.z + (z - h0.z) * 0.5; }
              goTo(x, z, behaviour === 'peck' ? speed * 1.4 : behaviour === 'graze' ? speed * 0.5 : speed, 'walk');
            }
          } else if (st.mode === 'freeze') { if (st.t <= 0) away(lerp(3, 5, r()), run); }
          if (st.mode === 'walk' || st.mode === 'flee') {
            const dx = st.tx - p.x, dz = st.tz - p.z, d = Math.hypot(dx, dz), m = Math.min(d, st.sp * H * dt);
            if (d < 0.02 * H) { st.mode = 'idle'; st.t = behaviour === 'peck' ? lerp(0.3, 1.2, r()) : behaviour === 'pet' ? lerp(5, 15, r()) : lerp(2, 6, r()); if (behaviour === 'shy' && hero) { st.mode = 'watch'; faceHero(); st.t = lerp(4, 8, r()); } }
            else {
              const mx = (dx / d) * m, mz = (dz / d) * m;
              st.face = Math.sign(mx * camRight.x + mz * camRight.z) || st.face;
              let blocked = false;
              if (walk) { const r0 = sol ? sol.r : 0; if (sol) sol.r = 0; blocked = !!walk.why(p.x + mx, p.z + mz, baseY, false); if (sol) sol.r = r0; }   // never blocked by itself
              if (blocked) { st.mode = 'idle'; st.t = 0.5; }   // blocked: stop, choose again
              else { p.x += mx; p.z += mz; }
              st.ph += m / (step * H) * Math.PI;
            }
          }
          const moving = st.mode === 'walk' || st.mode === 'flee';
          p.y = baseY + (moving ? hop * H * Math.abs(Math.sin(st.ph)) : 0);
          card.rotation.z = moving ? rock * Math.sin(st.ph) : card.rotation.z * 0.9;
        }
        if (sol) { sol.x = p.x; sol.z = p.z; }
        // the paper flip: |scale.x| jumps across +-0.3, so the card is never seen edge-on
        const want = st.face, k = 1 - Math.exp(-11 * dt);
        st.flip += (want - st.flip) * k; if (Math.abs(st.flip) < 0.3) st.flip = want * 0.3;
        card.scale.x = baseSX * st.flip;
      } });
  }

  const camRight = new THREE.Vector3(1, 0, 0);
  function update(dt, at = null) {
    if (at) centre.copy(at);
    camRight.set(1, 0, 0).applyQuaternion(camera.quaternion).setY(0).normalize();
    time += dt; for (const k of kinds) k.update(dt);
  }
  function reset(at = null) { if (at) centre.copy(at); time = 0; for (const k of kinds) k.reset(rngOf(k.seed)); }
  return { group, fallers, motes, flyers, flock, puffs, mist, cloudShadows, bursts, critter, update, reset,
    /** 0 = day, 1 = night (dusk ~0.5): each kind's counts / opacity blend between its day and night factors. */
    setNight(k) { night = Math.min(1, Math.max(0, k)); },
    get time() { return time; } };
}
