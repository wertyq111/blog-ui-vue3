/* eslint-disable */
// papercraft / paper-motion.js
// Engine-free motion for paper: springs, the latched paper-flap spring, wind sway as a pure function of time and
// place, a fixed-step clock, smooth glide schedules, polar camera & continuity verification, and the walk field
// (what the hero may walk on, read from the built constructions). No dependencies; used by paperkit-3d.js and the 2D
// template, portable to any engine.

/** C2 quintic smootherstep in [0, 1] over [e0, e1] (supports ascending e0 < e1 or descending e0 > e1). */
export function smootherstep(e0, e1, x) {
  const span = e1 - e0;
  if (Math.abs(span) < 1e-9) return x >= e1 ? 1 : 0;
  const t = Math.max(0, Math.min(1, (x - e0) / span));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * Velocity-integrated [0..1] progress curve for smooth camera scrolls or dolly journeys:
 * holds at 0 during `holdStart` (while opening pieces unfold), eases gently into glide over `easeIn`, optionally
 * slows across scenic `dips` ([{ at: 0..1, amount: 0.15, width: 0.05 }] or [{ u, factor, width }]), eases to a stop
 * over `easeOut`, and holds at 1 during `holdEnd`.
 * A dip's `at` (or `u`) and `width` are fractions of the glide's TIME (between the holds), not of its progress: to slow
 * at a landmark, find the time it passes (sample the returned function) and put the dip there.
 * Returns a callable function `t => progress` (in [0, 1]) with `.samples` (Float64Array), `.duration`, and `.fps`.
 * The holds must leave time to glide: holdStart + holdEnd >= duration jumps from 0 to 1 (it warns).
 */
export function glideSchedule({ duration = 12, fps = 60, holdStart = 1.0, easeIn = 2.0, easeOut = 1.6, holdEnd = 1.5, dips = [] } = {}) {
  const nTotal = Math.max(1, Math.round(duration * fps));
  const nOpen = Math.min(nTotal, Math.max(0, Math.round(holdStart * fps)));
  const nEnd = Math.min(nTotal - nOpen, Math.max(0, Math.round(holdEnd * fps)));
  const nGlide = Math.max(0, nTotal - nOpen - nEnd);
  const out = new Float64Array(nTotal);
  if (nGlide < 2 && typeof console !== 'undefined') console.warn(`papercraft glideSchedule: holdStart (${holdStart}) + holdEnd (${holdEnd}) leave no time to glide in ${duration} s: the progress jumps`);
  if (nGlide === 0) {
    for (let i = nOpen; i < nTotal; i++) out[i] = 1;
  } else {
    const glideDur = nGlide / fps;
    const inU = Math.min(0.45, Math.max(0, easeIn) / Math.max(1e-6, glideDur));
    const outU = Math.min(0.45, Math.max(0, easeOut) / Math.max(1e-6, glideDur));
    const w = new Float64Array(nGlide);
    let sum = 0;
    for (let i = 0; i < nGlide; i++) {
      const u = (i + 0.5) / nGlide;
      const sIn = inU > 0 ? smootherstep(0, inU, u) : 1;
      const rIn = u < inU ? sIn * sIn : 1;
      const rOut = outU > 0 ? smootherstep(0, outU, 1 - u) : 1;
      let dip = 1;
      for (const d of dips) {
        const pos = d.at ?? d.u ?? 0.5;
        const amt = Math.max(0, Math.min(0.85, d.amount ?? (d.factor != null ? 1 - d.factor : 0.15)));
        const wid = Math.max(1e-3, d.width ?? 0.05);
        dip *= 1 - amt * Math.exp(-(((u - pos) / wid) ** 2));
      }
      w[i] = Math.max(1e-6, rIn * rOut * dip);
      sum += w[i];
    }
    let acc = 0;
    for (let i = 0; i < nGlide; i++) { acc += w[i]; out[nOpen + i] = acc / sum; }
    for (let i = nOpen + nGlide; i < nTotal; i++) out[i] = 1;
  }
  const fn = (t) => {
    if (t <= 0) return out[0];
    if (t >= duration) return out[nTotal - 1];
    const f = Math.min(nTotal - 1, Math.max(0, t * fps));
    const i0 = Math.floor(f), i1 = Math.min(nTotal - 1, i0 + 1);
    return out[i0] + (out[i1] - out[i0]) * (f - i0);
  };
  fn.samples = out;
  fn.duration = duration;
  fn.fps = fps;
  fn.at = fn;
  return fn;
}

/**
 * Polar camera position around `target` ([x, y, z] array) with azimuth `azim` in RADIANS (0 = the camera on +z, as
 * the harness's yaw 0; the harness's view.yaw is in degrees), elevation `pitchDeg` in degrees (40-55 typical),
 * distance `dist`, and subtle tripod breathing drift. Pure function, engine-free. Returns [x, y, z].
 */
export function polarCameraPos({ target = [0, 0, 0], azim = 0, pitchDeg = 44, dist = 36, time = 0, drift = 0.12 } = {}) {
  const p = (pitchDeg * Math.PI) / 180, horiz = dist * Math.cos(p);
  const bx = drift ? Math.sin(time * 0.62) * drift : 0;
  const by = drift ? Math.sin(time * 0.85 + 1.0) * drift * 0.55 : 0;
  return [
    target[0] + Math.sin(azim) * horiz + bx,
    target[1] + dist * Math.sin(p) + by,
    target[2] + Math.cos(azim) * horiz,
  ];
}

/**
 * Automated continuity check for scripted character/camera evaluators: steps `evalFn(t)` across [0, duration] at `fps`
 * and catches position teleports, camera distance snaps, yaw / azimuth / pitch snaps and non-finite values BEFORE
 * rendering a video. evalFn(t) returns any subset of { pos: [x,y,z] | {x,y,z}, x, y, z, yaw, azim (radians), pitchDeg
 * (degrees), dist }. An angle that wraps across +-PI is not a jump (the shortest arc is compared).
 * The limits are per frame at 60 fps, scaled to `fps`, in YOUR world units: the defaults suit a ~3.6-unit hero (0.55
 * units is 9 hero heights per second); pass maxPosStep / maxDistStep for another scale, maxAngleStep (rad) and
 * maxPitchStep (deg) for the angles. Returns { ok, issues: [{ t, kind, field, delta }] }.
 * cuts: [seconds, ...] where the film cuts on purpose: the step that crosses a cut is not compared (a film of several
 * shots is checked inside each shot). loop: true also compares the last frame with the first, for a film whose end
 * runs back into its start (that issue has t = duration and seam: true).
 */
export function checkContinuity(evalFn, { duration = 10, fps = 60, maxPosStep = null, maxAngleStep = null, maxDistStep = null, maxPitchStep = null, cuts = [], loop = false } = {}) {
  const scale = 60 / Math.max(1, fps);
  const limPos = maxPosStep ?? 0.55 * scale;
  const limAng = maxAngleStep ?? 0.45 * scale;
  const limDist = maxDistStep ?? 0.8 * scale;
  const limPitch = maxPitchStep ?? 6 * scale;
  const bad = (v) => v != null && !Number.isFinite(v);
  const n = Math.max(2, Math.round(duration * fps)), jumps = [];
  const getPos = (s) => {
    if (!s) return null;
    if (Array.isArray(s.pos)) return [s.pos[0] ?? 0, s.pos[1] ?? 0, s.pos[2] ?? 0];
    if (s.pos && typeof s.pos === 'object') return [s.pos.x ?? 0, s.pos.y ?? 0, s.pos.z ?? 0];
    if (s.x != null || s.y != null || s.z != null) return [s.x ?? 0, s.y ?? 0, s.z ?? 0];
    return null;
  };
  const angDiff = (a, b) => Math.abs(Math.atan2(Math.sin(b - a), Math.cos(b - a)));
  const compare = (prev, cur, t, extra) => {                       // one step: what moved further than a frame may
    const prevPos = getPos(prev), curPos = getPos(cur), at = +t.toFixed(3);
    if (curPos && prevPos) {
      const dp = Math.hypot(curPos[0] - prevPos[0], curPos[1] - prevPos[1], curPos[2] - prevPos[2]);
      if (dp > limPos) jumps.push({ t: at, kind: 'pos', field: 'pos', delta: +dp.toFixed(3), ...extra });
    }
    for (const k of ['yaw', 'azim']) {
      if (cur?.[k] != null && prev?.[k] != null) {
        const da = angDiff(prev[k], cur[k]);
        if (da > limAng) jumps.push({ t: at, kind: k, field: k, delta: +da.toFixed(3), ...extra });
      }
    }
    if (cur?.dist != null && prev?.dist != null) {
      const dd = Math.abs(cur.dist - prev.dist);
      if (dd > limDist) jumps.push({ t: at, kind: 'dist', field: 'dist', delta: +dd.toFixed(3), ...extra });
    }
    if (cur?.pitchDeg != null && prev?.pitchDeg != null) {
      const dq = Math.abs(cur.pitchDeg - prev.pitchDeg);
      if (dq > limPitch) jumps.push({ t: at, kind: 'pitch', field: 'pitchDeg', delta: +dq.toFixed(3), ...extra });
    }
  };
  const cutList = Array.isArray(cuts) ? cuts : cuts == null ? [] : [cuts];
  const first = evalFn(0);
  let prev = first, prevT = 0;
  for (let i = 1; i <= n; i++) {
    const t = (i / n) * duration, cur = evalFn(t), curPos = getPos(cur);
    // a NaN or Infinity anywhere is a broken frame (comparisons with NaN are false, so it would pass silently)
    const nf = [...(curPos || []).map((v, j) => [v, 'pos.' + 'xyz'[j]]), [cur?.yaw, 'yaw'], [cur?.azim, 'azim'], [cur?.pitchDeg, 'pitchDeg'], [cur?.dist, 'dist']].filter(([v]) => bad(v));
    for (const [, field] of nf) jumps.push({ t: +t.toFixed(3), kind: 'nan', field, delta: NaN });
    if (!cutList.some((c) => c > prevT && c <= t)) compare(prev, cur, t);   // a step across a cut is meant to jump
    prev = cur; prevT = t;
  }
  if (loop) compare(prev, first, duration, { seam: true });       // the last frame must run into the first
  return { ok: jumps.length === 0, issues: jumps, jumps };
}

/**
 * Damped spring, sub-stepped at 240 Hz (frame-rate independent). hz = natural frequency, zeta = damping ratio.
 * Overshoot fraction = exp(-zeta*PI/sqrt(1-zeta^2)): zeta 0.55 = 12 %.
 */
export class Spring {
  constructor({ value = 0, hz = 2.2, zeta = 0.55 } = {}) { this.x = value; this.v = 0; this.target = value; this.hz = hz; this.zeta = zeta; }
  step(dt) {
    const w = 2 * Math.PI * this.hz, n = Math.max(1, Math.ceil(dt * 240)), h = dt / n;
    for (let i = 0; i < n; i++) { this.v += (-w * w * (this.x - this.target) - 2 * this.zeta * w * this.v) * h; this.x += this.v * h; }
    return this.x;
  }
  set(target) { this.target = target; }
  /** Jump to a value at rest (replays, captures, scrubbing). */
  reset(x = 0) { this.x = x; this.v = 0; this.target = x; return this; }
  get p() { return this.x; }
  get settled() { return Math.abs(this.x - this.target) < 1e-3 && Math.abs(this.v) < 1e-3; }
}

/**
 * The paper flap: one scalar p (0 = flat, 1 = upright, > 1 = overshoot). Rises on a soft spring (1.25 Hz, damping
 * 0.32), LATCHES at upright into a stiff 4.5 Hz quiver whose air drag eats the big swing and whose crease friction ends
 * the tail (8-15 % overshoot, 4-6 reversals, still by ~1 s); falls softly (0.5 Hz, damping 0.7, constant pull) after a
 * small outward unlatch twitch and lands with one 1-2 % slap. size 0..1: bigger = slower and whippier.
 * Values from a shipped pop-up game; p is a fraction of the fold angle, so it works for any angle.
 */
export class FlapSpring {
  constructor({ p = 0, size = 0.4, jitter = 0, quiverJitter = jitter } = {}) {
    const t = Math.min(1, Math.max(0, (size - 0.12) / 0.58));
    const fs = (1.14 + (0.88 - 1.14) * t) * (1 + jitter * 0.03), wob = 1 + t;
    Object.assign(this, {
      fs, p, v: 0, target: p, locked: p >= 1, atRest: true,
      kUp: 62 * fs * fs, cUp: 5 * fs * (1 - 0.5 * t),
      wL: 2 * Math.PI * 4.5 * (1 + quiverJitter * 0.03), zL: 0.04 / Math.sqrt(wob), dragL: 3.5 / Math.sqrt(wob), fricL: 2.2 * fs * (1 + 0.8 * t), // every size quivers at 4.5 Hz
      kDn: 10 * fs * fs, cDn: 4.5 * fs, gDn: 5 * fs * fs, antic: 1.2 * fs, rest: 0.25, minBounce: 0.5 * fs,
    });
  }
  /** Jump to p at rest: 0 = lying flat, 1 = standing (replays, captures, scrubbing). */
  reset(p = 0) { Object.assign(this, { p, v: 0, target: p, locked: p >= 1, atRest: true }); return this; }
  set(target) {
    if (target === this.target) return;
    if (target === 0 && this.atRest && this.p >= 1) this.v = this.antic; // unlatch twitch before the fall
    this.target = target; this.atRest = false; if (target === 0) this.locked = false;
  }
  step(dt) {
    const n = Math.max(1, Math.ceil(dt * 240)), h = dt / n;
    for (let i = 0; i < n && !this.atRest; i++) {
      let a;
      if (this.target === 1) {
        if (!this.locked && this.p >= 1) this.locked = true;
        a = this.locked
          ? -this.wL * this.wL * (this.p - 1) - (2 * this.zL * this.wL + this.dragL * Math.abs(this.v) + this.fricL / (Math.abs(this.v) + 0.05)) * this.v
          : this.kUp * (1 - this.p) - this.cUp * this.v;
      } else {
        a = -this.kDn * this.p - this.cDn * this.v - this.gDn;
        if (this.v > 0) a -= this.cUp * this.v * Math.min(1, this.p);
        if (this.p > 1) a -= this.wL * this.wL * (this.p - 1) + 2 * this.zL * this.wL * this.v; // the end stop still acts past upright
      }
      this.v += a * h; this.p += this.v * h;
      if (this.p <= 0 && this.target === 0) { this.p = 0; this.v = this.v < -this.minBounce ? -this.v * this.rest : 0; if (this.v === 0) this.atRest = true; }
      if (this.target === 1 && Math.abs(this.p - 1) < 0.002 && Math.abs(this.v) < 0.024) { this.p = 1; this.v = 0; this.atRest = true; }
    }
    return this.p;
  }
}

/**
 * Wind sway angle (radians) for a standing piece at (x, z) and time t: two travelling gust fronts so neighbours move
 * one after another, a flutter whose strength follows the gust. amp in degrees (0.5-2.5 for foliage, ~0.25 for fences,
 * 0 for walls). heroHeight = your hero's height in your units (gust wavelengths are ~23 / 13 / 8 hero heights).
 * Add the result to the HINGE angle (rotation about the fold line), never as an in-plane rotation that lifts a foot.
 * Pure function: no state, identical in every capture.
 */
export function windSway(t, x, z, { amp = 1.5, hz = 0.6, phase = 0, dir = 0.52, heroHeight = 0.6 } = {}) {
  const k = 0.6 / heroHeight; x *= k; z *= k;
  const dx = Math.cos(dir), dz = Math.sin(dir);
  const a = (x * dx + z * dz) * (2 * Math.PI / 14) - t * (2 * Math.PI / 9) + 1.7 * Math.sin((z * dx - x * dz) * (2 * Math.PI / 14) * 0.6);
  const b = (x * 0.31 - z * 0.95) * (2 * Math.PI / 8) - t * (2 * Math.PI / 5.3);
  const g = 0.5 + 0.32 * Math.sin(a) + 0.18 * Math.sin(b);
  const ph = hz * 2 * Math.PI * t + phase - (x * dx + z * dz) * (2 * Math.PI / 5);
  const e = 0.35 + 0.65 * g;
  return (amp * Math.PI / 180) * (0.5 * (g - 0.3) + e * (0.55 * Math.sin(ph) + 0.1 * Math.sin(2.31 * ph + 1.7)));
}

/** Fixed-step clock: feed it real dt, it calls update(h) in fixed steps (deterministic sims, repeatable captures). */
export class FixedClock {
  constructor(h = 1 / 120, maxSteps = 30) { this.h = h; this.maxSteps = maxSteps; this.acc = 0; this.time = 0; }
  advance(dt, update) {
    this.acc += Math.min(dt, this.h * this.maxSteps);
    while (this.acc >= this.h) { update(this.h, this.time); this.time += this.h; this.acc -= this.h; }
    return this.acc / this.h; // interpolation alpha for rendering between steps
  }
}

/**
 * The walk field (engine-free; the 3D kit re-exports it): one answer to "how high is the ground here, and may the
 * hero step there?", read from the same constructions the camera sees ("the walk field is what is drawn").
 *   add(surface)  a world-space surface { heightAt(x, z) -> y | null } (2D decks, boardwalks, bridges), or a three.js
 *                 group whose userData.walk.heightAt works in the group's own frame (the 3D builders' groups)
 *   block(fn)     no-go areas of the page, fn(x, z) -> true (water, chasms, fields)
 *   solid(x, z, r, { base, top }) round footprints (houses, trees, rocks, wells, a crate ON a pier: base = the deck
 *                 height); they block any surface whose height lies in [base - step, top], so a rock under a bridge
 *                 does not block the deck above it; wall(x0, z0, x1, z1, { r, base, top }) the same along a segment
 *                 (parapets, fences, house fronts); why(x, z, y) says what stops the hero there
 *   radius        (constructor) half the hero's FEET span (~0.15 x hero height), not half the card: feet around the
 *                 centre must all stand on surfaces within one step, so the hero never pokes over a deck edge
 *   surface(x, z) -> { y, on } of the highest surface there, the page (y 0), or null when blocked
 *   move(pos, dx, dz) slides along blockers and steers round round ones, steps up or down at most `step` (~0.2 x hero
 *                 height), so parapets, cliff faces, deck edges and water stop the hero like walls while ramps, stairs
 *                 and bridges let him on
 *   route(pos, points) walks through waypoints with move() (a virtual stick): the scripted check of a route
 * pos is any { x, y, z } (a THREE.Vector3 works). A three.js group's walk may name a `frame` (a child object) whose
 * axes heightAt uses: a platform's level deck frame, so a leaning face never tilts the walk surface.
 */
export class WalkField {
  constructor({ step = 0.75, radius = 0 } = {}) { this.items = []; this.blocks = []; this.solids = []; this.step = step; this.radius = radius; this._side = 0; this._free = 0; }
  add(surface) { this.items.push(surface); return surface; }
  block(fn) { this.blocks.push(fn); }
  solid(x, z, r, { base = -Infinity, top = Infinity } = {}) { this.solids.push({ x, z, r, base, top }); }
  /** A wall along a segment (a parapet, a fence, a house front, a rail): blocks within r of it when the surface there is
   *  between base - step and top (a wall on a deck: base = the deck's height). Circles for round things, walls for long. */
  wall(x0, z0, x1, z1, { r = 0.3, base = -Infinity, top = Infinity, name = 'wall' } = {}) { this.solids.push({ seg: [x0, z0, x1, z1], r, base, top, name }); }
  _dist(q, x, z) {
    if (!q.seg) return Math.hypot(x - q.x, z - q.z);
    const [x0, z0, x1, z1] = q.seg, dx = x1 - x0, dz = z1 - z0, t = Math.max(0, Math.min(1, ((x - x0) * dx + (z - z0) * dz) / (dx * dx + dz * dz || 1)));
    return Math.hypot(x - x0 - dx * t, z - z0 - dz * t);
  }
  /** What stops the hero at (x, z) coming from height y: null when nothing does. */
  why(x, z, y = 0, feet = true) {
    const s = this._top(x, z); if (!s) return 'a block (water, a cliff)';
    for (const q of this.solids) if (this._dist(q, x, z) < q.r && s.y >= q.base - this.step && s.y <= q.top) return q.seg ? `${q.name} [${q.seg.map((v) => +v.toFixed(1))}]` : `a solid at [${q.x.toFixed(1)}, ${q.z.toFixed(1)}] r ${q.r.toFixed(2)}`;
    if (Math.abs(s.y - y) > this.step) return `a step of ${(s.y - y).toFixed(2)} (limit ${this.step})${s.y >= 10 ? ': a wall' : ''}`;
    if (feet && this.radius > 0) for (let k = 0; k < 8; k++) {       // the feet: what is under the one that fails
      const w = this.why(x + Math.cos(k * Math.PI / 4) * this.radius, z + Math.sin(k * Math.PI / 4) * this.radius, s.y, false);
      if (w) return `a foot on ${w}`;
    }
    return null;
  }
  _height(it, x, z) {
    if (!it.isObject3D) return it.heightAt(x, z);
    const w = it.userData.walk, o = w.frame || it, V = it.position.constructor;   // a three.js group: its own frame
    o.updateWorldMatrix(true, false);
    const v = o.worldToLocal(new V(x, 0, z)), hh = w.heightAt(v.x, v.z);
    return hh == null ? null : o.localToWorld(new V(v.x, hh, v.z)).y;
  }
  _top(x, z) {                          // the highest surface at a point, or the page, or null (a block)
    let best = null;
    for (const it of this.items) { const y = this._height(it, x, z); if (y != null && (!best || y > best.y)) best = { y, on: it }; }
    if (best) return best;
    return this.blocks.some((f) => f(x, z)) ? null : { y: 0, on: null };
  }
  surface(x, z) {
    const s = this._top(x, z); if (!s) return null;
    for (const q of this.solids) if (this._dist(q, x, z) < q.r && s.y >= q.base - this.step && s.y <= q.top) return null;
    return s;
  }
  _feet(x, z, y) {                      // every foot around the centre on a surface within one step of it
    const r = this.radius; if (!(r > 0)) return true;
    for (let k = 0; k < 8; k++) { const s = this.surface(x + Math.cos(k * Math.PI / 4) * r, z + Math.sin(k * Math.PI / 4) * r); if (!s || Math.abs(s.y - y) > this.step) return false; }
    return true;
  }
  /** Try to move pos by (dx, dz); returns true if it moved (pos.y becomes the new ground height). */
  move(pos, dx, dz) {
    const go = (mx, mz) => {
      if (!mx && !mz) return false;
      const x = pos.x + mx, z = pos.z + mz, s = this.surface(x, z);
      if (s && Math.abs(s.y - pos.y) <= this.step && this._feet(x, z, s.y)) { pos.x = x; pos.y = s.y; pos.z = z; return true; }
      return false;
    };
    if (go(dx, dz)) { if (++this._free > 8) this._side = 0; return true; }
    this._free = 0;
    // blocked: slide round it as the source game's player does. Steer 20-100 deg off the way he pushes, first to the side
    // that worked last time (decided once per obstacle, so he never dithers at a head-on bump), at the share of the step
    // that still goes forward (cos a: slower round a corner, never backwards), then the axis slides along a wall
    const len = Math.hypot(dx, dz), ux = dx / (len || 1), uz = dz / (len || 1);
    const sides = this._side ? [this._side, -this._side] : [1, -1];
    for (const a of [0.35, 0.7, 1.05, 1.4, 1.75]) for (const sd of sides) {   // 1.75: just past sideways, round a head-on bump
      const c = Math.cos(a), sn = Math.sin(a) * sd, k = len * Math.max(0.35, c);
      if (go((ux * c - uz * sn) * k, (uz * c + ux * sn) * k)) { this._side = sd; return true; }
    }
    return go(dx, 0) || go(0, dz);
  }
  /** Walk pos through waypoints [[x, z], ...] with move() in fixed steps of speed * dt (blockers and the step limit
   *  apply; never a teleport). Returns { reached, trace: [[x, y, z], ...], stuck? }. */
  route(pos, points, { speed = 7, dt = 1 / 60, maxTime = 60, near = 0.25 } = {}) {
    // stuck: the hero cannot move, or slides along a blocker for a second without getting closer to the waypoint
    const trace = [[pos.x, pos.y, pos.z]], end = (extra) => ({ reached, of: points.length, trace, y: pos.y, on: this.surface(pos.x, pos.z)?.on ?? null, ...extra });
    const stop = (tx, tz) => {          // what blocked: probe a step toward the waypoint
      const dx = tx - pos.x, dz = tz - pos.z, d = Math.hypot(dx, dz) || 1, k = Math.min(d, Math.max(0.3, speed * dt * 4)) / d;
      return end({ stuck: [pos.x, pos.y, pos.z], waypoint: reached, blockedBy: this.why(pos.x + dx * k, pos.z + dz * k, pos.y) || 'sliding along a blocker without getting closer' });
    };
    let reached = 0, t = 0;
    for (const [tx, tz] of points) {
      let bestD = Infinity, since = 0;
      while (t < maxTime) {
        const dx = tx - pos.x, dz = tz - pos.z, d = Math.hypot(dx, dz);
        if (d < near) { reached++; break; }
        if (d < bestD - 0.02) { bestD = d; since = 0; } else if ((since += dt) > 1) return stop(tx, tz);
        const k = Math.min(d, speed * dt) / d; t += dt;
        if (!this.move(pos, dx * k, dz * k)) return stop(tx, tz);
        if (trace.length < 4000) trace.push([pos.x, pos.y, pos.z]);
      }
      if (t >= maxTime) return end({ stuck: [pos.x, pos.y, pos.z], waypoint: reached });
    }
    return end({});
  }
}
