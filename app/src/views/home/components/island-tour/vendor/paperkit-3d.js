/* eslint-disable */
// papercraft / paperkit-3d.js
// three.js building blocks for paper worlds: a dead-matte paper material (wrap light, a shadow leak in the world's
// colour, back-lit translucency), cut cards with real thickness and a printed cut edge, springs and hinges, the
// structure types' constructors (references/structures.md), a key / fill rig with
// contact-hardening soft shadows (PCSS), and a macro-lens post chain (tilt-shift DOF from depth AND screen height,
// light falloff, silhouette depth line, ACES grade, display-space haze, vignette, grain).
// Pairs with paperkit-2d.js for every texture. Tested with three r187 (import map or bundler providing 'three').
// Units are yours; the defaults assume 1 unit = 1 cm (a 3.6 cm hero, 0.08 cm card).
import * as THREE from 'three';
import { paperSheet, normalMap as sheetNormal, printCard, rng, mix, shade, toRGB, toHex, shape as P2shape, validateOutline } from './paperkit-2d.js';
import { Spring, FlapSpring, windSway, WalkField } from './paper-motion.js';
export { Spring, FlapSpring, windSway, WalkField };

// ---------------------------------------------------------------------------------------------------------------
// paper surface
// ---------------------------------------------------------------------------------------------------------------

/**
 * Shared paper textures: a tileable sheet (albedo detail) and its normal map. `unitsPerTile` = how much paper one
 * 512 px tile covers. Fibre must stay a few screen pixels wide where it is seen (5-8 cm per tile at macro distance).
 */
export function paperTextures(renderer, { color = '#f6efe2', seed = 7, size = 512, unitsPerTile = 6, normalStrength = 2.5, fibres = 1, mottle = 0.05 } = {}) {
  const sheet = paperSheet({ size, color, seed, fibres, mottle });
  const aniso = renderer.capabilities.getMaxAnisotropy();
  const map = new THREE.CanvasTexture(sheet);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.anisotropy = aniso;
  map.repeat.set(1 / unitsPerTile, 1 / unitsPerTile);
  const nrm = new THREE.CanvasTexture(sheetNormal(sheet, normalStrength));
  nrm.wrapS = nrm.wrapT = THREE.RepeatWrapping;
  nrm.anisotropy = aniso;
  nrm.repeat.set(1 / unitsPerTile, 1 / unitsPerTile);
  return { sheet, map, normalMap: nrm, unitsPerTile };
}

/** Look of the paper BRDF, shared by every paper material (change values at runtime, they are uniforms). */
export const PAPER_LIGHT = {
  wrap: { value: 0.3 },                                   // soft terminator: 0 = Lambert, 0.3 day, 0.42 night
  leak: { value: new THREE.Color('#a0602c') },            // what a shadow lets through, never black: the world's shadow colour (default: a warm ground's day amber; lilac-blue on snow, teal under water, navy at night)
  trans: { value: 0.3 },                                  // back-lit glow of thin card
  transTint: { value: new THREE.Color('#ffb070') },       // warm by day; make it cool and weak at night
};

const LAMBERT_PAPER = /* glsl */`
varying vec3 vViewPosition;
uniform float uPaperWrap; uniform vec3 uPaperLeak; uniform float uPaperTrans; uniform vec3 uPaperTransTint;
float gPaperShadow = 1.0; float gPaperShadowT = 1.0;
struct LambertMaterial { vec3 diffuseColor; float specularStrength; };
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
  float nl = dot( geometryNormal, directLight.direction );
  float front = saturate( ( nl + uPaperWrap ) / ( 1.0 + uPaperWrap ) );
  vec3 irradiance = front * directLight.color * mix( uPaperLeak, vec3( 1.0 ), gPaperShadow );
  float back = saturate( ( - nl + 0.1 ) / 1.1 );
  irradiance += back * uPaperTrans * uPaperTransTint * directLight.color * gPaperShadowT;
  reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
  gPaperShadow = 1.0; gPaperShadowT = 1.0;
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
  reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct RE_Direct_Lambert
#define RE_IndirectDiffuse RE_IndirectDiffuse_Lambert
`;

let lightsPatched = null;
function paperLightsChunk() {
  if (lightsPatched !== null) return lightsPatched;
  const src = THREE.ShaderChunk.lights_fragment_begin;
  const key = 'directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ]';
  const at = src.indexOf(key);
  if (at < 0) { console.warn('papercraft: lights chunk changed; paper shadows fall back to plain multiply'); lightsPatched = src; return src; }
  const end = src.indexOf(';', at) + 1;
  const call = src.slice(at + 'directLight.color *= '.length, end);
  lightsPatched = src.slice(0, at) + 'gPaperShadow = ' + call + '\n#ifdef PAPERCRAFT_PCSS\ngPaperShadowT = orLitT;\n#else\ngPaperShadowT = gPaperShadow;\n#endif\n' + src.slice(end);
  return lightsPatched;
}

/**
 * Dead-matte paper: Lambert with a soft terminator, shadows that leak the world's colour instead of going black, and a back-lit
 * glow. No specular, no environment reflection: any GGX sheen at grazing angles reads as plastic or wet.
 */
export function paperMaterial({ color = '#ffffff', map = null, normalMap = null, normalScale = 0.4, side = THREE.FrontSide, emissive = null, emissiveIntensity = 1, vertexColors = false, alphaTest = 0 } = {}) {
  const m = new THREE.MeshLambertMaterial({ color, map, normalMap, side, vertexColors, ...(alphaTest > 0 ? { alphaTest } : {}) });
  if (normalMap) m.normalScale.set(normalScale, normalScale);
  if (emissive) { m.emissive.set(emissive); m.emissiveIntensity = emissiveIntensity; }
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uPaperWrap = PAPER_LIGHT.wrap;
    shader.uniforms.uPaperLeak = PAPER_LIGHT.leak;
    shader.uniforms.uPaperTrans = PAPER_LIGHT.trans;
    shader.uniforms.uPaperTransTint = PAPER_LIGHT.transTint;
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <lights_lambert_pars_fragment>', LAMBERT_PAPER)
      .replace('#include <lights_fragment_begin>', paperLightsChunk());
  };
  m.customProgramCacheKey = () => (alphaTest > 0 ? 'papercraft-paper-cutout' : 'papercraft-paper');
  return m;
}

/** A copy of a paper material that keeps its paper lighting (three's clone() drops onBeforeCompile) and shares its
 *  textures (no second upload): a second plane, a tinted twin, the same print on another card. */
export function cloneMaterial(m) {
  const c = m.clone();
  c.onBeforeCompile = m.onBeforeCompile; c.customProgramCacheKey = m.customProgramCacheKey;
  return c;
}

// ---------------------------------------------------------------------------------------------------------------
// cards: a cut outline extruded to paper thickness; the print carries the cut edge INSIDE the silhouette (a thin dark
// line + a pale highlight on the lit edges only, none on folds); card sides a darker copy of the print (never a pale
// side strip: it reads as a sticker halo; never a second rim on top of the printed one)
// ---------------------------------------------------------------------------------------------------------------

/** Card side colour (the stock's thickness): a darkened copy of the print, with a hint of the paper core. */
export function edgeColorFor(printColor, core = '#f4e6c8') {
  const [r, g, b] = toRGB(printColor);
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return lum < 0.42 ? mix(shade(printColor, -0.5), core, 0.06) : mix(shade(printColor, -0.45), core, 0.1);
}

// Print resolution for every card: pxPerUnit values are tuned for a 1080 px short side at the templates' framing; the
// 3D harness sets this from the output frame (a 4K frame prints at 2x, references/formats.md). Pixel-sized print
// details (blurs, minimum line widths, the fibre sheet) scale with it, so a finer print reads the same, only sharper.
let PRINT_SCALE = 1;
export function setPrintScale(k = 1) { PRINT_SCALE = Math.max(0.25, Number(k) || 1); }
export function printScale() { return PRINT_SCALE; }

/**
 * Build a card from a closed outline (paperkit-2d shape, y up, fold line on y = 0) and a paint function.
 * The card stands in the XY plane facing +Z. Options:
 *  thickness  ~1.5-3 % of your hero's height (card stock); thinner reads as CG planes, thicker as foam board
 *  edgeWidth  the printed cut edge in world units: the lit-side highlight at its widest (~1.5 % of hero height); the
 *             dark silhouette line is ~1.5-2.5 px on screen; 0 = none. folds: edges that get no rim (default the base)
 *  contact    darkening toward the fold line { amount 0.1-0.14, height in units }: the card visibly touches the page
 *  back       'kraft' (55 % front colour + 45 % kraft), 'mirror' (same print mirrored, like a real die-cut) or a paint fn
 */
export function makeCard(pts, { paint = null, paper, thickness = 0.08, edgeWidth = 0.06, edgeColor = 'auto', ink = '#3a291c', keyline = false, contact = { amount: 0.12, height: 0.4 }, pxPerUnit = 64, backRes = 0.5, seed = 1, back = 'kraft', tone = 0.04, geomPts = null, materials = null, folds = ['bottom'], rimLight = [-0.55, 0.83], glowColor = '#ffc45a', glow = 2.2, effects = 1, holes = null } = {}) {
  // effects: 0 = print the layers flat (pieces the lens blurs: far rows, big foreground cards); builds much faster
  // rimLight: direction toward the key in the print (x right, y up): the side of the cut edge that gets the pale
  // highlight (key from the right: [0.55, 0.83]). back: 'kraft' | 'mirror' | paint fn | false (no back print).
  // glow: emissiveIntensity of printed panes (P.glow); setGlow(v) sets it: ~0.35 by day, ~1-1.5 at night (exposure ~1).
  // folds: which straight edges of the outline are FOLDS, not cuts ('bottom' = the hinge base on the page, 'top', 'left',
  // 'right', or a function (x0, y0, x1, y1) => bool). A fold gets no printed rim: one sheet bending has no cut edge.
  // geomPts: cut the card to a different outline than the print (e.g. one half of a slotted card); UVs stay in shape units
  // materials: reuse the printed materials of another card cut from the same print (no second print)
  // holes: outlines cut through the card, inside its outline (a door to walk through, windows, gaps between rungs or
  // spokes): cut in the geometry, their walls get the side colour, the print rims them like the outline
  const shapeTHREE = new THREE.Shape((geomPts || pts).map(([x, y]) => new THREE.Vector2(x, y)));
  if (holes && holes.length) shapeTHREE.holes = holes.map((h) => new THREE.Path(h.map(([x, y]) => new THREE.Vector2(x, y))));
  const geo = new THREE.ExtrudeGeometry(shapeTHREE, { depth: thickness, bevelEnabled: false, curveSegments: 1 });
  geo.translate(0, 0, -thickness / 2);
  const splitLids = () => { // ExtrudeGeometry: back lid first, then front lid; sides last
    const lids = geo.groups.find((g) => g.materialIndex === 0), sides = geo.groups.find((g) => g.materialIndex === 1);
    geo.clearGroups();
    geo.addGroup(lids.start, lids.count / 2, 2);
    geo.addGroup(lids.start + lids.count / 2, lids.count / 2, 0);
    geo.addGroup(sides.start, sides.count, 1);
  };
  if (materials) {
    if (materials.length > 2) splitLids();
    const m = new THREE.Mesh(geo, materials); m.castShadow = m.receiveShadow = true;
    m.userData.card = { thickness, outline: geomPts || pts };
    return m;
  }
  if (!paper || !paper.sheet || !paper.map) {
    throw new Error('papercraft makeCard: pass { paper } from paperTextures(renderer, ...) (or prebuilt { materials })');
  }
  const r = rng(seed * 7919 + 13);
  const finish = (P) => {
    // contact darkening at the fold line, then the printed cut edge (P.rim: a dark line at the silhouette, a pale
    // highlight on the lit edges only, nothing along folds)
    if (contact && contact.amount > 0) P.draw((g) => {
      const gr = g.createLinearGradient(0, P.box.y0, 0, P.box.y0 + contact.height);
      const [cr, cg, cb] = contact.color ? toRGB(contact.color) : [60, 34, 14];   // contact.color: the world's shadow colour (default umber)
      gr.addColorStop(0, `rgba(${cr},${cg},${cb},${contact.amount})`); gr.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
      g.fillStyle = gr; g.fillRect(P.box.x0 - 1, P.box.y0 - 1, P.box.w + 2, contact.height + 1);
    });
    if (keyline) P.outline(ink);                       // optional faint key line; the shipped style has none
    if (edgeWidth > 0) P.rim({ width: edgeWidth, color: edgeColor, skip: foldSkip(folds, P.box), light: rimLight });
  };
  const bleed = edgeColor === 'auto' ? '#d9c8a8' : edgeColor;
  const front = printCard(pts, { pxPerUnit, scale: PRINT_SCALE, sheet: paper.sheet, seed, bleed, effects, holes, paint: (P) => { if (paint) paint(P); else P.fill('#efe6d2'); finish(P); } });
  const avg = front.mean;
  const k = 1 + (r() * 2 - 1) * tone; // per-sheet tone: "the same colour" from slightly different sheets
  const tint = new THREE.Color().setRGB(k * (1 + (k - 1) * 0.35), k, k * (1 - (k - 1) * 0.5));
  const faceMat = (print, flip) => {
    const tex = new THREE.CanvasTexture(print.canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = paper.map.anisotropy;
    const { x0, y0, w, h } = front.box;
    tex.repeat.set((flip ? -1 : 1) / w, 1 / h);
    tex.offset.set(flip ? front.box.x1 / w : -x0 / w, -y0 / h);
    const m = paperMaterial({ map: tex, normalMap: paper.normalMap, normalScale: 0.7 }); // fibre you can see at 1-3 px
    m.color.copy(tint);
    if (print.glow && !flip) { // lit panes: an emissive map; HDR values > 1 turn into bokeh discs in the lens blur
      const e = new THREE.CanvasTexture(print.glow); e.colorSpace = THREE.SRGBColorSpace;
      e.repeat.copy(tex.repeat); e.offset.copy(tex.offset);
      m.emissiveMap = e; m.emissive.set(glowColor); m.emissiveIntensity = glow;
    }
    return m;
  };
  const sideMat = paperMaterial({ color: edgeColorFor(avg), map: paper.map, normalMap: paper.normalMap, normalScale: 0.25 });
  const mats = [faceMat(front, false), sideMat];
  if (back === 'mirror') {      // a die-cut printed on both sides: the back shows the same print, mirrored (no second print)
    mats.push(faceMat({ ...front, glow: null }, true));
    splitLids();
  } else if (back) {
    const backPaint = typeof back === 'function' ? back
      : (P) => { P.fill(mix(avg, '#e8d3ac', 0.45)); P.innerShade('#5a3a20', { alpha: 0.25, blurPx: 10 }); finish(P); };
    // the back is seen only in passing (mid-fold, at a turn): print it at backRes of the front's resolution
    const backPrint = printCard(pts.map(([x, y]) => [-x, y]), { pxPerUnit: pxPerUnit * backRes, scale: PRINT_SCALE, sheet: paper.sheet, seed: seed + 1, paint: backPaint, bleed, effects: 0, holes: holes && holes.map((h) => h.map(([x, y]) => [-x, y])) });
    mats.push(faceMat(backPrint, true));
    splitLids();
  }
  const mesh = new THREE.Mesh(geo, mats);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.card = { thickness, box: front.box, color: avg, outline: geomPts || pts };
  mesh.userData.setGlow = (v) => { if (mats[0].emissiveMap) mats[0].emissiveIntensity = v; }; // lights on / off, flicker
  return mesh;
}

/** Turn a folds spec into a rim skip predicate on the card's bounding box. */
export function foldSkip(folds, box) {
  if (!folds || (Array.isArray(folds) && !folds.length)) return null;
  if (typeof folds === 'function') return folds;
  const e = 1e-4 * Math.max(box.w, box.h), on = (v, t) => Math.abs(v - t) < e;
  return (x0, y0, x1, y1) => folds.some((f) =>
    (f === 'bottom' && on(y0, box.y0) && on(y1, box.y0)) || (f === 'top' && on(y0, box.y1) && on(y1, box.y1)) ||
    (f === 'left' && on(x0, box.x0) && on(x1, box.x0)) || (f === 'right' && on(x0, box.x1) && on(x1, box.x1)));
}

/**
 * cardClips(root, { tol, grid }): cards under `root` (a character, a machine, any construction) that cut into each
 * other in the pose they are in now. A real paper model never does: one card passing through another, or two cards
 * in one plane where they overlap, renders as a cut line that slides while they move or as flicker (z-fighting) that
 * changes with the camera. For every pair whose outlines overlap, the points of one card (its interior and its cut
 * edge) that lie over the other must stay clear of both slabs (thickness and angle counted); a T touching the back of
 * its front card is fine. Returns [{ a, b, kind: 'through' | 'overlap', depth }] ('through': one passes through the
 * other; 'overlap': closer than their thickness, i.e. coplanar), named by mesh name (or its parent's). The planes of
 * one slotted cross are skipped. Pose the model and call it at several poses: the 3D harness's
 * __papercraft.clips() walks the hero through his stride (references/mechanisms.md section 12).
 */
export function cardClips(root, { tol = 0.004, grid = 12 } = {}) {
  root.updateMatrixWorld(true);
  const cards = [];
  root.traverse((o) => { if (o.isMesh && o.visible && o.userData.card && o.userData.card.outline) cards.push(o); });
  const inPoly = (poly, x, y) => {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  const info = cards.map((m, i) => {
    const { outline, thickness } = m.userData.card;
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const [x, y] of outline) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    const step = Math.max(x1 - x0, y1 - y0) / grid, local = [];
    for (let a = 0; a < grid; a++) for (let b = 0; b < grid; b++) {   // the interior
      const x = x0 + (x1 - x0) * (a + 0.5) / grid, y = y0 + (y1 - y0) * (b + 0.5) / grid;
      if (inPoly(outline, x, y)) local.push([x, y]);
    }
    for (let k = 0; k < outline.length; k++) {                     // the cut edge: where a T or a flap pokes through
      const [ax, ay] = outline[k], [bx, by] = outline[(k + 1) % outline.length], n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / step));
      for (let s = 0; s < n; s++) local.push([ax + (bx - ax) * s / n, ay + (by - ay) * s / n]);
    }
    const pts = local.map(([x, y]) => new THREE.Vector3(x, y, 0).applyMatrix4(m.matrixWorld));
    const e = m.matrixWorld.elements, sz = Math.hypot(e[8], e[9], e[10]);   // world length of one local z unit
    return { outline, half: thickness * sz / 2, sz, n: new THREE.Vector3(e[8], e[9], e[10]).divideScalar(sz), pts, inv: m.matrixWorld.clone().invert(), box: new THREE.Box3().setFromPoints(pts),
      slot: m.userData.card.slot, name: m.name || m.parent?.name || `card ${i}` };
  });
  const q = new THREE.Vector3(), out = [];
  const test = (A, B) => {   // A's points over B's outline against B's slab, and A's own as far as it faces B
    const lim = B.half + A.half * Math.abs(A.n.dot(B.n)) - tol;
    let pos = false, neg = false, near = Infinity;
    for (const p of A.pts) {
      q.copy(p).applyMatrix4(B.inv);
      if (!inPoly(B.outline, q.x, q.y)) continue;
      const d = q.z * B.sz;
      near = Math.min(near, Math.abs(d));
      if (d > lim) pos = true; else if (d < -lim) neg = true;
    }
    if (pos && neg) return { kind: 'through', depth: +(near).toFixed(3) };
    if (near < lim) return { kind: 'overlap', depth: +(lim + tol - near).toFixed(3) };
    return null;
  };
  for (let i = 0; i < info.length; i++) for (let j = i + 1; j < info.length; j++) {
    const A = info[i], B = info[j];
    if (A.slot != null && A.slot === B.slot) continue;
    if (!A.box.clone().expandByScalar(A.half + B.half).intersectsBox(B.box)) continue;
    const r = test(A, B) || test(B, A);
    if (r) out.push({ a: A.name, b: B.name, ...r });
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------
// motion: springs and hinges
// ---------------------------------------------------------------------------------------------------------------

// Spring and FlapSpring live in paper-motion.js (engine-free); re-exported here for convenience.

/**
 * Put `child` on a hinge along the X axis through `at` (its fold line). p = 1 standing at `rest`, p = 0 lying flat
 * face-up (folded back onto the page). rest = the standing angle in radians (0 = plumb; +-0.03-0.05 = the hand-placed
 * lean nothing escapes; -0.35 = a rail leaning out). Returns { group, pivot, spring, set(open, delay), update(dt), p }.
 * Stagger choreography with `delay`; FlapSpring by default, or pass spring: new Spring(...).
 */
export function hinge(child, { at = new THREE.Vector3(), yaw = 0, open = 1, size = 0.4, flat = -Math.PI / 2 + 0.01, rest = 0, delay = 0, spring = null } = {}) {
  const pivot = new THREE.Group();
  const yawG = new THREE.Group();
  yawG.position.copy(at);
  yawG.rotation.y = yaw;
  yawG.add(pivot);
  pivot.add(child);
  const s = spring || new FlapSpring({ p: open, size });
  const h = {
    group: yawG, pivot, spring: s, delay, wait: 0, pending: false, open, onStart: null,
    sway: 0, // extra angle about the SAME fold line (wind): set it every frame, e.g. windSway(t, x, z, { heroHeight })
    set(o, d = h.delay) { h.open = o; h.wait = d; h.pending = true; },
    /** Jump to p at rest, nothing pending (replays: reset(0) every hinge, then set(1, delay) again). */
    reset(p = 0) { if (s.reset) s.reset(p); else Object.assign(s, { x: p, v: 0, target: p }); h.pending = false; h.wait = 0; h.open = p; h.update(0); },
    update(dt) {
      if (h.pending) { h.wait -= dt; if (h.wait <= 0) { h.pending = false; if (s.set) s.set(h.open); else s.target = h.open; if (h.onStart) h.onStart(h); } }
      const p = s.step(dt);
      pivot.rotation.x = flat + (rest - flat) * p - h.sway * Math.min(1, Math.max(0, p));
      if (child.userData.follow) child.userData.follow(p); // linked parts (slotted planes, box walls) follow the parent's p
      return p;
    },
    get p() { return s.p ?? s.x; },
  };
  pivot.rotation.x = flat + (rest - flat) * open;
  return h;
}

/** Clip a closed outline to one side of the vertical line x = 0 (side +1 keeps x >= 0). Sutherland-Hodgman. */
export function clipHalf(pts, side = 1) {
  const out = [], inside = (p) => p[0] * side >= 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length], ia = inside(a), ib = inside(b);
    if (ia) out.push(a);
    if (ia !== ib) { const t = a[0] / (a[0] - b[0]); out.push([0, a[1] + (b[1] - a[1]) * t]); }
  }
  return out;
}

/** The part of an outline at or below height ymax (a low buttress cut from a full fin). */
export function clipBelow(pts, ymax) {
  const out = [], inside = (p) => p[1] <= ymax;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length], ia = inside(a), ib = inside(b);
    if (ia) out.push(a);
    if (ia !== ib) { const t = (ymax - a[1]) / (b[1] - a[1]); out.push([a[0] + (b[0] - a[0]) * t, ymax]); }
  }
  return out;
}

/**
 * Slot-together cross and its family (references/mechanisms.md section 5), built like the real thing: card A in the
 * XY plane plus the second plane B as HALF cards hinged on A's front and back faces along the vertical slot line x = 0.
 * Folded, each half lies flat on its face of A; opening, it swings out to `angle` degrees without ever passing through
 * A. The halves FOLLOW the parent hinge's progress (never their own spring, or the planes scissor). B prints a little
 * darker (reads as depth). Put the group on a hinge() (the 3D harness's popup turns it as the source game does).
 *   full cross (+, default): A whole, both halves of B           trees, palms, cacti, tents, posts, lanterns
 *   half cross (T): halves 'back' (hidden depth behind a card that faces the camera: a boulder, an igloo, a shrine) or
 *                   'front' (a buttress or porch toward the viewer)
 *   quarter cross (L): main 'right' (or 'left'), halves 'front' (or 'back'): two half cards meeting at the slot, a
 *                   corner; with angle > 90 it opens into a V-fold (a dune, a drift, a ridge, a rock outcrop)
 * opts are makeCard options, plus: halves 'both' | 'front' | 'back'; main 'full' | 'left' | 'right'; angle (deg the
 * halves open to from A, 90 = square); opts.second = { pts, paint, ymax, scale, ... } for a different second plane
 * (ymax cuts it low: a buttress instead of a full fin; scale < 1 keeps a hidden half inside A's silhouette).
 * Without its own pts or paint, the second plane is A's print cut to the half and tinted a step darker: ONE print per
 * cross (a second print of the same art doubled the cost of every tree, lamp and post).
 */
let SLOT = 0;
export function crossCard(pts, opts = {}) {
  opts = { back: 'mirror', halves: 'both', main: 'full', angle: 90, ...opts };   // a slotted card is printed on both faces: a kraft back reads as a brown blade
  const group = new THREE.Group();
  const aGeom = opts.main === 'right' ? clipHalf(pts, 1) : opts.main === 'left' ? clipHalf(pts, -1) : null;
  const a = makeCard(pts, aGeom ? { ...opts, geomPts: aGeom } : opts);
  const sec = opts.second || {}, own = !!(sec.pts || sec.paint);   // own: the second plane has its own side view / print
  const bOpts = { ...opts, materials: null, seed: (opts.seed ?? 1) + 101, ...sec };   // A's stamped print (materials) is A's art only
  const bs = bOpts.scale ?? 1, bPts = own ? (bOpts.pts || pts).map(([x, y]) => [x * bs, y * bs]) : pts;   // scale < 1: the half hides inside A's silhouette
  const t = opts.thickness ?? 0.08;
  const sides = opts.halves === 'front' ? [1] : opts.halves === 'back' ? [-1] : [1, -1];
  let shared = own ? null : a.material.map((mat) => { const c = cloneMaterial(mat); c.color.multiplyScalar(0.92); return c; });
  const setGlow = (v) => { if (shared && shared[0].emissiveMap) shared[0].emissiveIntensity = v; };
  const halves = sides.map((side) => {
    let geom = clipHalf(bPts, side);
    if (bOpts.ymax != null) geom = clipBelow(geom, own ? bOpts.ymax : bOpts.ymax / bs);
    const m = makeCard(bPts, { ...bOpts, geomPts: geom, materials: shared });  // a second half reuses the first half's print
    if (!shared) { shared = m.material; for (const mat of shared) mat.color.multiplyScalar(0.92); }
    if (!own) m.scale.set(bs, bs, 1);                       // A's print at A's scale, the cut card scaled (UVs stay in A's units)
    m.userData.setGlow = setGlow;                            // lit panes on the second plane switch with the first
    const pivot = new THREE.Group();
    pivot.position.z = side * t * 1.02;                    // hinged on A's front (+1) or back (-1) face
    pivot.add(m);
    return pivot;
  });
  group.add(a, ...halves);
  const slot = ++SLOT; a.userData.card.slot = slot; for (const h of halves) h.children[0].userData.card.slot = slot;
  const open = (opts.angle * Math.PI) / 180;
  group.userData.follow = (p) => {
    const k = Math.min(1, Math.max(0, (p - 0.12) / 0.7)), e = k * k * (3 - 2 * k);
    for (const h of halves) h.rotation.y = -open * e;   // the +x half swings toward +z, the -x half toward -z
  };
  group.userData.follow(1);
  return group;
}

/**
 * Box fold with a gable roof (the mechanism of cottages, barns, shops, towers, temples, habitat modules, kiosks): a
 * front wall on the page hinge, two gable walls hinged on its side edges, a front roof slope hinged on its top edge and
 * a back slope hinged at the ridge. Folded, the gables lie
 * flat on the back of the front wall and the roof lies flat beyond its top edge (a net on the page); opening, the gables
 * swing out FIRST (p 0.1-0.6) and the roof closes over them AFTER (p 0.45-0.95), so no slab passes through a wall.
 * Put the group on a hinge() like any card; w = front width, d = depth. paints: { front, gable, roof } are YOUR
 * prints for your subject (unprinted card without them); examples/built-ground.js boxHouse() shows a cottage.
 * holes: { front, right, left } outlines cut through those walls (a door to walk through, windows, a portal): the front
 * in its own frame (x from -w/2 to w/2, y up from the base), a gable in its frame (x from 0 at the front edge to d, the
 * left one mirrored: 0 to -d). print: card options for every panel (H.cardOpts(x, z): print quality follows the lens).
 * No back wall: from a camera looking down from the front it is rarely seen; add one as a flap if yours sees it.
 */
function warnFlatPaints(fnName, opts, expected, badKeys) {
  if (!opts || typeof opts !== 'object') return;
  const hit = badKeys.filter((k) => k in opts && opts[k] != null);
  if (hit.length) console.warn(`papercraft ${fnName}: pass paints: { ${expected} } instead of top-level ${hit.join(', ')}`);
}

export function boxFold(opts = {}) {
  warnFlatPaints('boxFold', opts, 'front, gable, roof', ['paint', 'paintFront', 'paintGable', 'paintSide', 'paintRoof']);
  const { w = 4, d = 3, wallH = 3, roofH = 1.8, overhang = 0.2, paper, seed = 1, thickness = 0.08, edgeWidth = 0.06, paints = {}, rimLight, holes = {}, print = {} } = opts;
  const g = new THREE.Group();
  const base = { paper, thickness, edgeWidth, back: 'kraft', ...(rimLight ? { rimLight } : {}), pxPerUnit: print.pxPerUnit ?? 64, effects: print.effects ?? 1 };
  const front = makeCard(P2shape.rect(w, wallH), { ...base, seed, paint: paints.front, folds: ['bottom', 'left', 'right'], holes: holes.front || null });
  const gable = (side) => {
    // pentagon d wide with the peak in the middle, drawn with x from 0 (the hinge edge) to d * side
    const pts = [[-d / 2, 0], [d / 2, 0], [d / 2, wallH], [0, wallH + roofH], [-d / 2, wallH]].map(([x, y]) => [(x + d / 2) * side, y]);
    const ordered = side > 0 ? pts : pts.slice().reverse();
    const m = makeCard(ordered, { ...base, seed: seed + (side > 0 ? 3 : 5), paint: paints.gable, holes: (side > 0 ? holes.right : holes.left) || null,
      folds: (x0, y0, x1, y1) => (Math.abs(x0) < 1e-6 && Math.abs(x1) < 1e-6) || (Math.abs(y0) < 1e-6 && Math.abs(y1) < 1e-6) });
    const pv = new THREE.Group(); pv.position.set(side * w / 2, 0, -thickness); pv.add(m);
    return pv;
  };
  const right = gable(1), left = gable(-1);
  // each slope runs from the ridge (a fold) past its eave by `overhang` (a cut edge); the front slope hangs from a hinge
  // on the wall top, so its card starts `overhang` below that hinge
  const phi = Math.atan2(roofH, d / 2), S = Math.hypot(d / 2, roofH), L = S + overhang;
  const slope = (s, pts, fold) => makeCard(pts, { ...base, seed: seed + s, paint: paints.roof, folds: [fold] });
  const roofF = new THREE.Group(); roofF.position.set(0, wallH, thickness * 1.1); // a hair proud of the wall: no z-fight folded
  roofF.add(slope(7, P2shape.rect(w + 2 * overhang, L).map(([x, y]) => [x, y - overhang]), 'top'));
  const roofB = new THREE.Group(); roofB.position.set(0, S, 0); roofB.add(slope(9, P2shape.rect(w + 2 * overhang, L), 'bottom'));
  roofF.add(roofB);
  // ridge: a frame on the ridge line that stays upright in the house's frame (cog crests, chimneys, weathervanes, signs:
  // add cards to it, hinged or not; they ride the roof and fold flat with it)
  const ridge = new THREE.Group(); ridge.position.set(0, S, thickness * 1.5); roofF.add(ridge); // a hair proud: no z-fight folded
  g.add(front, right, left, roofF);
  g.userData.parts = { front, right, left, roofFront: roofF, roofBack: roofB, ridge };
  g.userData.ridge = ridge;
  const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  g.userData.follow = (p) => {
    const k1 = sm(0.1, 0.6, p), k2 = sm(0.45, 0.95, p);
    right.rotation.y = Math.PI - (Math.PI / 2) * k1;            // folded onto the back (PI) -> standing out (PI/2)
    left.rotation.y = -Math.PI + (Math.PI / 2) * k1;
    roofF.rotation.x = -(Math.PI / 2 - phi) * k2;               // coplanar above the wall -> tilted back to the pitch
    roofB.rotation.x = -2 * phi * k2;                           // straight on -> down the back slope
    ridge.rotation.x = -roofF.rotation.x;                       // upright on the ridge
  };
  g.userData.follow(1);
  return g;
}

/**
 * Layered card (bushes, hedges, coral heads, crowds, flower beds): 2-3 printed cards on ONE hinge, back to front, each a
 * little nearer the camera (z), so the layers overlap with a soft shadow between them, the stacked-card read of the
 * stacked-card read. layers: [{ pts, paint, z }] (z default 0.3 per layer); opts as makeCard. Folded, they lie in a stack.
 */
export function layeredCard(layers, opts = {}) {
  const g = new THREE.Group();
  layers.forEach((L, i) => { const m = makeCard(L.pts, { ...opts, paint: L.paint, seed: (opts.seed ?? 1) + i * 13 }); m.position.z = L.z ?? i * 0.3; g.add(m); });
  return g;
}

/**
 * Fan pair (references/structures.md, layered): the piece plus a darker, mirrored, slightly taller copy standing just
 * behind it and shifted sideways, on ONE hinge: depth from one side for the price of two cards (bushes, hedges, reeds,
 * a far tree line, a crowd). opts as makeCard, plus rear: { scale 1.14, shift 0.2 (of the width), dz (default -0.12 x
 * the height), tone 0.88, pts, paint } (pts / paint: a different rear piece).
 */
export function fanCard(pts, opts = {}) {
  const { rear = {}, ...o } = opts;
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const [x, y] of pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const s = rear.scale ?? 1.14, shift = (rear.shift ?? 0.2) * (x1 - x0), dz = rear.dz ?? -0.12 * (y1 - y0);
  const rp = (rear.pts || pts).map(([x, y]) => [-x * s + shift, y * s]).reverse();   // mirrored; reversed keeps the winding
  const g = new THREE.Group();
  const back = makeCard(rp, { ...o, paint: rear.paint || o.paint, seed: (o.seed ?? 1) + 7 });
  for (const m of [].concat(back.material)) if (m.color) m.color.multiplyScalar(rear.tone ?? 0.88);
  back.position.z = dz;
  g.add(back, makeCard(pts, o));
  return g;
}

/**
 * Prism fold (references/structures.md, folded volumes): walls standing on ANY footprint polygon, joined edge to edge
 * like a strip of card wrapped round it, with a lid or a pyramid / cone roof. A square or a rectangle with a flat roof,
 * an L-shaped hall, a hexagonal kiosk; 8-12 sides read as a round tower, a silo, a drum or a well. footprint: [[x, z],
 * ...] in order round the shape; its FIRST edge is the front wall (it is turned onto x, the shape behind it, z <= 0).
 * Folded, the walls flatten like a paper tube (the front half of the walls in a line, the back half folded flat
 * behind them: about half the perimeter wide) and the roof lies flat above the front wall; opening, the tube opens
 * into the closed shape (p 0.15-0.75) and the roof closes after it (p 0.55-0.95).
 * h: wall height. roof: 'flat' (a lid of the footprint's shape) | 'pyramid' (one triangle per wall meeting above the
 * centroid: with many sides a cone; convex footprints only) | 'none'. roofH: the pyramid's height. paints: { wall:
 * paint | [paint, ...] (cycled round the walls), roof: paint | [paint, ...] }. holes: { [wallIndex]: [outline, ...] } in the wall's own frame (x
 * from 0 to its length, y up). print: card options for every panel (H.cardOpts(x, z)). Put it on a hinge (a node).
 * With a flat lid, userData.top is a frame on the lid to build on (another structure type on top: a composition).
 * center: true shifts the folded prism so its footprint centroid sits at local (0, 0) instead of front wall on z = 0.
 */
export function prismFold(footprint, opts = {}) {
  warnFlatPaints('prismFold', opts, 'wall, roof', ['paint', 'paintWall', 'paintRoof', 'paintSide']);
  const { h = 3, roof = 'flat', roofH = 1.6, paper, seed = 1, thickness = 0.08, edgeWidth = 0.06, paints = {}, holes = {}, rimLight, print = {}, center = false } = opts;
  // normalise: the first edge on x, centred on the origin, the shape behind it (z <= 0)
  const [p0, p1] = footprint, ang = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]), ca = Math.cos(-ang), sa = Math.sin(-ang);
  let fp = footprint.map(([x, z]) => [(x - p0[0]) * ca - (z - p0[1]) * sa, (x - p0[0]) * sa + (z - p0[1]) * ca]);
  const L0 = fp[1][0];
  fp = fp.map(([x, z]) => [x - L0 / 2, z]);
  if (fp.reduce((s2, [, z]) => s2 + z, 0) > 0) fp = fp.map(([x, z]) => [x, -z]);   // the shape lies behind the front wall
  const n = fp.length, base = { paper, thickness, edgeWidth, back: 'kraft', ...(rimLight ? { rimLight } : {}), pxPerUnit: print.pxPerUnit ?? 64, effects: print.effects ?? 1 };
  const pick = (v, i) => (Array.isArray(v) ? v[i % v.length] : v);   // one print for every wall, or a list cycled round them
  const len = (i) => Math.hypot(fp[(i + 1) % n][0] - fp[i][0], fp[(i + 1) % n][1] - fp[i][1]);
  const head = (i) => Math.atan2(-(fp[(i + 1) % n][1] - fp[i][1]), fp[(i + 1) % n][0] - fp[i][0]);   // rotation about +y
  const wrapA = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  const g = new THREE.Group(), body = new THREE.Group(), joints = [], tris = [];
  g.add(body);
  // the tube's flattening fold: after the wall where half the perimeter is reached (the walls before it lie in a line,
  // the rest fold back flat behind them)
  let per = 0; for (let i = 0; i < n; i++) per += len(i);
  let fold = n - 2; for (let i = 0, acc = 0; i < n - 1; i++) { acc += len(i); if (acc >= per / 2 - 1e-6) { fold = i; break; } }
  let cx = 0, cz = 0; for (const [x, z] of fp) { cx += x / n; cz += z / n; }
  if (center) body.position.set(-cx, 0, -cz);
  let frame = body;
  for (let i = 0; i < n; i++) {
    const Li = len(i);
    const wall = makeCard(P2shape.rect(Li, h).map(([x, y]) => [x + Li / 2, y]), { ...base, seed: seed + i * 7, paint: pick(paints.wall, i), holes: holes[i] || null,
      folds: (x0, y0, x1, y1) => (Math.abs(y0) < 1e-6 && Math.abs(y1) < 1e-6) || (Math.abs(x0 - x1) < 1e-6 && (Math.abs(x0) < 1e-6 || Math.abs(x0 - Li) < 1e-6)) });
    const holder = new THREE.Group();
    if (i === 0) holder.position.x = -Li / 2;
    holder.add(wall); frame.add(holder);
    if (roof === 'pyramid') {   // the apex above the centroid, in this wall's final frame (x along it, z outward)
      const a = head(i), wx = cx - fp[i][0], wz = cz - fp[i][1];
      const ax = wx * Math.cos(a) - wz * Math.sin(a), az = wx * Math.sin(a) + wz * Math.cos(a);   // az < 0: inward
      const sl = Math.hypot(roofH, az), tri = makeCard([[0, 0], [Li, 0], [ax, sl]], { ...base, seed: seed + 101 + i * 7, paint: pick(paints.roof, i), folds: ['bottom'] });
      const pv = new THREE.Group(); pv.position.set(0, h, 0); pv.add(tri); holder.add(pv);
      tris.push([pv, Math.atan2(-az, roofH)]);
    }
    if (i < n - 1) {   // the next wall hangs on this one's far edge
      const j = new THREE.Group(); j.position.x = Li; holder.add(j);
      joints.push([j, wrapA(head(i + 1) - head(i)), i === fold ? Math.PI : 0]); frame = j;
    }
  }
  let lid = null;
  if (roof === 'flat') {   // the footprint as a card hinged on the front wall's top edge (local y = depth behind it)
    lid = new THREE.Group(); lid.position.set(0, h, thickness * 0.6);
    const pts = fp.map(([x, z]) => [x, -z]);
    lid.add(makeCard(pts, { ...base, seed: seed + 97, paint: pick(paints.roof, 0), folds: ['bottom'] }));
    // a frame on the lid's top face, at the footprint's centroid, y up and z toward the camera once the lid has closed:
    // pieces put in it (popup(..., { parent: node.userData.top }): a lamp, a dome, a rooftop garden) ride the lid
    const top = new THREE.Group(); top.rotation.x = Math.PI / 2; top.position.set(cx, -cz, thickness * 0.6);
    lid.add(top); g.userData.top = top;
    body.add(lid);
  }
  const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  g.userData.follow = (p) => {
    const e = sm(0.15, 0.75, p), e2 = sm(0.55, 0.95, p);
    for (const [j, d, f] of joints) { j.rotation.y = f + (d - f) * e; if (f) j.position.z = -thickness * 1.3 * (1 - e); }   // the back layer a hair behind, folded
    for (const [pv, th] of tris) pv.rotation.x = -th * e2;
    if (lid) lid.rotation.x = -(Math.PI / 2) * e2;
  };
  g.userData.follow(1);
  g.userData.footprint = center ? fp.map(([x, z]) => [x - cx, z - cz]) : fp;
  g.userData.centroid = center ? [0, 0] : [cx, cz];
  return g;
}

/**
 * Raised platform (parallel fold): a front face on the page hinge, a deck hinged on its top edge that stays LEVEL the
 * whole way up, and an optional back support parallel to the face (the classic floating-layer pop-up). Use it for
 * jetties, piers, docks, stages, station platforms, balconies, lookouts and shelves: build timber OPEN (a posts face
 * with the gaps cut to the base, `facePts`, and a posts support); a solid printed face only for masonry the brief names
 * (a quay wall, a stage front); never for natural terrain (the ground stays flat).
 * Folded, face, deck and support lie flat in one stack. Put the group on a hinge() like any card; put pieces that stand
 * ON the deck into `group.userData.deck` (a frame on the deck's top surface: y up, z toward the camera, origin at the
 * deck's front edge, so the deck spans z from 0 to -d) with their own hinges: they ride up level with it.
 * paints: { face, deck, support } printers. holes: { face, support } outlines cut through them (an arch, a tunnel mouth,
 * windows), in the card's own frame. print: card options for every card (H.cardOpts(x, z)). The group comes with a walk
 * surface on its deck (userData.walk: the deck rectangle, reaching 0.12 past its edges); replace it for a custom deck.
 */
export function platform(opts = {}) {
  warnFlatPaints('platform', opts, 'face, deck, support', ['paint', 'paintFace', 'paintDeck', 'paintSupport']);
  const { w = 4, d = 3, h = 2, paper, paints = {}, support = true, seed = 1, thickness = 0.08, edgeWidth = 0.06, facePts = null, deckPts = null, supportPts = null, rimLight, holes = {}, print = {} } = opts;
  // facePts / deckPts / supportPts: custom outlines (a domed shell, an island's rock face, a stage apron). Keep the fold
  // edges straight: the face's base on y = 0 and its top fold on y = h; the deck's front fold on y = 0 (its back edge on
  // y = d if there is a support); the support's top on y = 0, hanging down to y = -h.
  const g = new THREE.Group();
  const base = { paper, thickness, edgeWidth, back: 'kraft', ...(rimLight ? { rimLight } : {}), pxPerUnit: print.pxPerUnit ?? 64, effects: print.effects ?? 1 };
  const face = makeCard(facePts || P2shape.rect(w, h), { ...base, seed, paint: paints.face, folds: ['bottom', 'top'], holes: holes.face || null });
  const deckPivot = new THREE.Group(); deckPivot.position.set(0, h, 0);
  const deck = makeCard(deckPts || P2shape.rect(w, d), { ...base, seed: seed + 3, paint: paints.deck, folds: support ? ['bottom', 'top'] : ['bottom'] });
  deckPivot.add(deck);
  const deckFrame = new THREE.Group(); deckFrame.rotation.x = Math.PI / 2; deckFrame.position.z = thickness / 2; // on top
  deckPivot.add(deckFrame);
  g.add(face, deckPivot);
  let back = null;
  if (support) { // hangs from the deck's back edge down to the page, always parallel to the face
    back = new THREE.Group(); back.position.set(0, d, -thickness);
    const sc = makeCard(supportPts || P2shape.rect(w * 0.9, h).map(([x, y]) => [x, y - h]), { ...base, seed: seed + 5, paint: paints.support, folds: ['top', 'bottom'], holes: holes.support || null });
    back.add(sc); deckPivot.add(back);
  }
  g.userData.deck = deckFrame;
  // the walk surface: the deck rectangle in the deck's LEVEL frame (null off it), reaching 0.12 past its edges
  g.userData.walk = { frame: deckFrame, heightAt: (x, z) => (Math.abs(x) <= w / 2 + 0.12 && z <= 0.12 && z >= -d - 0.12 ? 0 : null), w, d, h };
  g.userData.follow = () => {
    const a = g.parent ? g.parent.rotation.x : 0;        // the hinge pivot's angle (set before follow is called)
    deckPivot.rotation.x = -Math.PI / 2 - a;              // world angle -PI/2: the deck stays level
    if (back) back.rotation.x = a + Math.PI / 2;           // world angle a: the support stays parallel to the face
  };
  g.userData.follow(1);
  return g;
}


/**
 * Cluster layout (dressing reads as one mass with depth; low fillers between groups keep the sharp band packed): n
 * pieces around (x, z), the biggest at the back, each next ~9 % smaller, ~7 % of the size nearer the camera (+z),
 * shifted to alternating sides. Returns [{ x, z, scale, yaw }]. Use 4-8 DIFFERENT pieces per cluster (your subject's
 * kinds: in the countryside example a bush, a rock, flowers, a tuft).
 */
export function clusterLayout(x, z, { n = 4, size = 1, seed = 1, spread = 0.5 } = {}) {
  const r = rng(seed), out = [];
  for (let i = 0; i < n; i++) {
    const side = i === 0 ? 0 : (i % 2 ? 1 : -1) * (0.14 + 0.05 * Math.ceil(i / 2)) * size * (1 + spread);
    out.push({ x: x + side + (r() - 0.5) * 0.08 * size, z: z + i * 0.07 * size * (1 + spread * 2), scale: Math.pow(0.91, i), yaw: (r() - 0.5) * 0.5 });
  }
  return out;
}

/**
 * Laminated cardstock cutout from a transparent image (HTMLImageElement, HTMLCanvasElement, or ImageBitmap — e.g.
 * extracted by scripts/extract_cutouts.py). Applies cotton-rag paper tooth inside the alpha channel, contact darkening
 * along the base, dark laminated inner slabs, a kraft or mirrored back, and an alpha-tested customDepthMaterial so
 * cast shadows match the exact cutout silhouette (never a rectangle). Stands on y = 0 facing +Z; put it on a hinge().
 * cross: true adds a slotted second cutout plane split into folding halves (folds flat without scissoring).
 * rim: the printed cut edge for art that has none (a photo, a sprite, a logo): the width in world units of the pale
 * highlight on the edges facing rimLight (~0.05, as makeCard's edgeWidth), with the thin dark cut line all round.
 * Leave it 0 for art drawn with its own cut line (references/image-gen.md section 8): two rims read as a sticker.
 * The fibre multiplied into the art has the size it has on printed cards, whatever the image's resolution, and the
 * texture follows the print scale (a 4K frame keeps twice the pixels). Not covered by cardClips (no outline): keep
 * cutouts in their own layers by hand.
 * back: 'kraft' (default), 'mirror' (the same art, as a die-cut printed through) or an image / canvas of the back's
 * own art, drawn as it looks from behind (a figure's back, a pencil drawing of the piece): it is cut to the front's
 * silhouette, so draw it to the same outline, mirrored.
 * glow: an image / canvas the size of the art, white where the card is lit (window panes, a lamp, a screen) and black
 * or clear elsewhere: those parts glow in glowColor at glowIntensity (~0.35 by day, ~1-1.5 at night), and
 * card.userData.setGlow(v) changes it (the 3D harness: H.glowing(card) lets the mood drive it).
 */
export function imageCard(img, { height = 3, paper = null, thickness = 0.08, back = 'kraft', backColor = null, edgeColor = null, alphaTest = 0.42, flipX = false, contact = 0.22, tooth = 0.48, maxPx = 1024, cross = false, angle = 90, rim = 0, rimLight = [-0.55, 0.83], glow = null, glowColor = '#ffc45a', glowIntensity = 0.35 } = {}) {
  const sw = img.naturalWidth || img.width || 1, sh = img.naturalHeight || img.height || 1;
  const w = height * (sw / sh);
  const scaleDown = Math.min(1, maxPx * PRINT_SCALE / Math.max(sw, sh));
  const cw = Math.max(2, Math.round(sw * scaleDown)), ch = Math.max(2, Math.round(sh * scaleDown));

  const frontC = document.createElement('canvas'); frontC.width = cw; frontC.height = ch;
  const fg = frontC.getContext('2d');
  fg.save();
  if (flipX) { fg.translate(cw, 0); fg.scale(-1, 1); }
  fg.drawImage(img, 0, 0, cw, ch);
  fg.restore();

  // sample mean opaque colour so edge & kraft back harmonise with the cutout
  const px = fg.getImageData(0, 0, cw, ch).data;
  let sr = 0, sg = 0, sb = 0, sn = 0;
  const step = Math.max(1, Math.floor((cw * ch) / 4096));
  for (let i = 0; i < cw * ch; i += step) {
    const a = px[i * 4 + 3];
    if (a > 128) { sr += px[i * 4]; sg += px[i * 4 + 1]; sb += px[i * 4 + 2]; sn++; }
  }
  const avg = sn ? toHex([Math.round(sr / sn), Math.round(sg / sn), Math.round(sb / sn)]) : '#d6c8b0';
  const ppu = ch / height;                                    // canvas px per world unit
  // the paper sheet at the size it has on printed cards (~64 px per unit), whatever this image's resolution
  const fibre = (ctx) => { const pat = ctx.createPattern(paper.sheet, 'repeat'); if (pat && pat.setTransform) pat.setTransform(new DOMMatrix().scale(Math.min(8, Math.max(0.5, ppu / 64)))); return pat; };
  const blank = () => { const c = document.createElement('canvas'); c.width = cw; c.height = ch; return c; };

  if (rim > 0) {
    // The cut edge as printed cards carry it (P.rim): a thin dark line right at the silhouette, a pale highlight just
    // inside it only on the edges that face the light. Built from the alpha: the silhouette pulled in by the line's
    // width (the intersection of shifted copies) leaves the line; that inner shape minus itself shifted away from the
    // light leaves the lit band.
    const dpx = Math.max(1.2, rim * 0.42 * ppu), hpx = Math.max(1.5, rim * ppu), ln = Math.hypot(rimLight[0], rimLight[1]) || 1;
    const sil = blank(); sil.getContext('2d').drawImage(frontC, 0, 0);
    const inner = blank(), ix = inner.getContext('2d');
    ix.drawImage(sil, 0, 0); ix.globalCompositeOperation = 'destination-in';
    for (let i = 0; i < 12; i++) ix.drawImage(sil, Math.cos(i / 12 * Math.PI * 2) * dpx, Math.sin(i / 12 * Math.PI * 2) * dpx);
    const band = (cut, colour) => {              // sil-or-inner minus `cut`, filled with one colour
      const c = blank(), x = c.getContext('2d');
      cut(x); x.globalCompositeOperation = 'source-in'; x.fillStyle = colour; x.fillRect(0, 0, cw, ch);
      return c;
    };
    const lit = band((x) => { x.drawImage(inner, 0, 0); x.globalCompositeOperation = 'destination-out'; x.drawImage(inner, -rimLight[0] / ln * hpx, rimLight[1] / ln * hpx); }, mix(avg, '#fff3d8', 0.72));
    const dark = band((x) => { x.drawImage(sil, 0, 0); x.globalCompositeOperation = 'destination-out'; x.drawImage(inner, 0, 0); }, mix(shade(avg, -0.55), '#3a2412', 0.5));
    fg.save(); fg.globalCompositeOperation = 'source-atop';
    fg.globalAlpha = 0.5; fg.drawImage(lit, 0, 0);
    fg.globalAlpha = 0.85; fg.drawImage(dark, 0, 0);
    fg.restore();
  }

  if (paper && paper.sheet && tooth > 0) {
    // Multiply paper fibre grain into the art (never alpha-over, which washes out colours!) and preserve exact cutout alpha
    const alphaSnap = document.createElement('canvas'); alphaSnap.width = cw; alphaSnap.height = ch;
    alphaSnap.getContext('2d').drawImage(frontC, 0, 0);
    fg.save();
    fg.globalCompositeOperation = 'multiply';
    fg.globalAlpha = tooth;
    const pat = fibre(fg);
    if (pat) { fg.fillStyle = pat; fg.fillRect(0, 0, cw, ch); }
    fg.globalCompositeOperation = 'destination-in';
    fg.globalAlpha = 1;
    fg.drawImage(alphaSnap, 0, 0);
    fg.restore();
  }
  if (contact > 0) {
    fg.save();
    fg.globalCompositeOperation = 'source-atop';
    const gr = fg.createLinearGradient(0, ch, 0, ch * 0.82);
    gr.addColorStop(0, `rgba(52,30,14,${contact})`);
    gr.addColorStop(1, 'rgba(52,30,14,0)');
    fg.fillStyle = gr; fg.fillRect(0, ch * 0.8, cw, ch * 0.22);
    fg.restore();
  }

  const aniso = paper?.map?.anisotropy || 4;
  const frontTex = new THREE.CanvasTexture(frontC);
  frontTex.colorSpace = THREE.SRGBColorSpace; frontTex.anisotropy = aniso;

  const makeSolidMaskTex = (hex) => {
    const c = document.createElement('canvas'); c.width = cw; c.height = ch;
    const ctx = c.getContext('2d');
    ctx.drawImage(frontC, 0, 0);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = hex; ctx.fillRect(0, 0, cw, ch);
    if (paper && paper.sheet) {
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 0.45;
      const pat = fibre(ctx);
      if (pat) { ctx.fillStyle = pat; ctx.fillRect(0, 0, cw, ch); }
      ctx.globalCompositeOperation = 'destination-in';
      ctx.globalAlpha = 1;
      ctx.drawImage(frontC, 0, 0);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso;
    return t;
  };

  const coreCol = edgeColor || edgeColorFor(avg);
  const coreTex = makeSolidMaskTex(coreCol);
  const isArt = (v) => !!v && typeof v === 'object' && ((v.naturalWidth || v.width) > 0);
  const makeBackArtTex = (art) => {          // the back's own art: seen from behind it reads the right way round
    const c = blank(), ctx = c.getContext('2d');
    ctx.fillStyle = backColor || mix(avg, '#e8d3ac', 0.45); ctx.fillRect(0, 0, cw, ch);   // kraft wherever the art is clear
    ctx.save();
    if (!flipX) { ctx.translate(cw, 0); ctx.scale(-1, 1); }
    ctx.drawImage(art, 0, 0, cw, ch);
    ctx.restore();
    if (paper && paper.sheet && tooth > 0) {
      ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = tooth;
      const pat = fibre(ctx);
      if (pat) { ctx.fillStyle = pat; ctx.fillRect(0, 0, cw, ch); }
      ctx.globalAlpha = 1;
    }
    ctx.globalCompositeOperation = 'destination-in';   // cut to the front's silhouette: one card, one outline
    ctx.drawImage(frontC, 0, 0);
    const tx = new THREE.CanvasTexture(c);
    tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = aniso;
    return tx;
  };
  const backTex = back === 'mirror' ? frontTex : isArt(back) ? makeBackArtTex(back) : makeSolidMaskTex(backColor || mix(avg, '#e8d3ac', 0.45));

  const frontMat = paperMaterial({ map: frontTex, normalMap: paper?.normalMap || null, normalScale: 0.55, alphaTest });
  const litMats = [];
  if (isArt(glow)) {                         // lit panes: an emissive map, as makeCard's P.glow
    const c = blank(), ctx = c.getContext('2d');
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, cw, ch);
    ctx.save();
    if (flipX) { ctx.translate(cw, 0); ctx.scale(-1, 1); }
    ctx.drawImage(glow, 0, 0, cw, ch);
    ctx.restore();
    const e = new THREE.CanvasTexture(c); e.colorSpace = THREE.SRGBColorSpace;
    frontMat.emissiveMap = e; frontMat.emissive.set(glowColor); frontMat.emissiveIntensity = glowIntensity;
    litMats.push(frontMat);
  }
  const backMat = paperMaterial({ map: backTex, normalMap: paper?.normalMap || null, normalScale: 0.45, alphaTest });
  const coreMat = paperMaterial({ map: coreTex, normalMap: paper?.normalMap || null, normalScale: 0.25, side: THREE.DoubleSide, alphaTest });
  const depthMat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: frontTex, alphaTest });
  const depthMatDouble = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: frontTex, alphaTest, side: THREE.DoubleSide });

  const buildSlab = (x0, x1, u0, u1, shadeMul = 1) => {
    const sw2 = x1 - x0;
    const planeGeo = (flipBack) => {
      const geo = new THREE.PlaneGeometry(sw2, height);
      const uv = geo.attributes.uv;
      for (let i = 0; i < uv.count; i++) {
        const u = uv.getX(i);
        // Back plane is rotated PI around Y BEFORE translating, so its local +x becomes -x; flip U to stay aligned with front art
        uv.setX(i, flipBack ? u1 - u * (u1 - u0) : u0 + u * (u1 - u0));
      }
      if (flipBack) geo.rotateY(Math.PI);
      geo.translate((x0 + x1) / 2, height / 2, 0);
      return geo;
    };
    const fM = shadeMul === 1 ? frontMat : (() => { const c = cloneMaterial(frontMat); c.color.multiplyScalar(shadeMul); if (litMats.length) litMats.push(c); return c; })();
    const bM = shadeMul === 1 ? backMat : (() => { const c = cloneMaterial(backMat); c.color.multiplyScalar(shadeMul); return c; })();
    const cM = shadeMul === 1 ? coreMat : (() => { const c = cloneMaterial(coreMat); c.color.multiplyScalar(shadeMul); return c; })();
    const sub = new THREE.Group();
    const gF = planeGeo(false);
    const mF = new THREE.Mesh(gF, fM); mF.position.z = thickness * 0.5;
    mF.castShadow = mF.receiveShadow = true; mF.customDepthMaterial = depthMat;
    const gB = planeGeo(true);
    const mB = new THREE.Mesh(gB, bM); mB.position.z = -thickness * 0.5;
    mB.castShadow = mB.receiveShadow = true; mB.customDepthMaterial = depthMat;
    const mC1 = new THREE.Mesh(gF, cM); mC1.position.z = -thickness * 0.16;
    mC1.castShadow = false; mC1.receiveShadow = true; mC1.customDepthMaterial = depthMatDouble;
    const mC2 = new THREE.Mesh(gF, cM); mC2.position.z = thickness * 0.16;
    mC2.castShadow = false; mC2.receiveShadow = true; mC2.customDepthMaterial = depthMatDouble;
    sub.add(mF, mB, mC1, mC2);
    return sub;
  };

  const g = new THREE.Group();
  g.add(buildSlab(-w / 2, w / 2, 0, 1, 1));
  if (cross) {
    const rightHalf = new THREE.Group(); rightHalf.position.z = thickness * 0.9; rightHalf.add(buildSlab(0, w / 2, 0.5, 1, 0.92));
    const leftHalf = new THREE.Group(); leftHalf.position.z = -thickness * 0.9; leftHalf.add(buildSlab(-w / 2, 0, 0, 0.5, 0.92));
    g.add(rightHalf, leftHalf);
    const openAng = (angle * Math.PI) / 180;
    g.userData.follow = (p) => {
      const k = Math.min(1, Math.max(0, (p - 0.12) / 0.7)), e = k * k * (3 - 2 * k);
      rightHalf.rotation.y = -openAng * e;
      leftHalf.rotation.y = -openAng * e;
    };
    g.userData.follow(1);
  }
  g.userData.card = { thickness, width: w, height, color: avg };
  g.userData.setGlow = (v) => { for (const m of litMats) m.emissiveIntensity = v; };   // lights on / off, flicker
  return g;
}

/**
 * Stepped multi-layer 3D die-cut cardstock sculpture (emblems, arches, logos, reliefs, frames).
 * shape2d: a THREE.Shape or closed polygon [[x, y], ...]; holes: optional array of [[x, y], ...] or THREE.Path.
 * layers: [{ depth, color, z, scale, edgeColor, faceCanvas }] from back to front. Never adds unrequested ornaments.
 * Supports g.userData.follow(p) so layers telescope smoothly from flat when mounted on a hinge().
 * Keep each layer's depth near card thickness (1-2x: ~0.08-0.16 for a 3.6-unit hero): the depth of the relief comes
 * from stacking sheets, and one much thicker slab reads as foam board. A layer's face is plain paper in its colour
 * unless you print it (faceCanvas: printCard(...).canvas of the same outline).
 */
export function extrudedLayerStack(shape2d, { scale = 1, layers = [{ depth: 0.12, color: '#efe6d2', z: 0 }], holes = null, paper = null, edgeColor = 'auto', bevel = 0.012, curveSegments = 36, seed = 1 } = {}) {
  let shape;
  if (shape2d instanceof THREE.Shape) {
    shape = shape2d;
  } else {
    const v = validateOutline(shape2d);
    if (!v.ok) console.warn(`papercraft extrudedLayerStack: outline issues: ${v.issues.join('; ')}`);
    shape = new THREE.Shape(shape2d.map(([x, y]) => new THREE.Vector2(x, y)));
  }
  if (holes && holes.length) {
    for (const h of holes) {
      if (h instanceof THREE.Path) shape.holes.push(h);
      else {
        const hv = validateOutline(h);
        if (!hv.ok) console.warn(`papercraft extrudedLayerStack: hole issues: ${hv.issues.join('; ')}`);
        shape.holes.push(new THREE.Path(h.map(([x, y]) => new THREE.Vector2(x, y))));
      }
    }
  }
  const pts = shape.getPoints(curveSegments);
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const p of pts) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); }
  const bw = Math.max(1e-4, x1 - x0), bh = Math.max(1e-4, y1 - y0);
  const aniso = paper?.map?.anisotropy || 4;

  const makeFaceTex = (hex, s) => {
    // sized by the piece (64 px per unit, as printed cards; finer with the print scale), so the fibre keeps its size
    const px = (v) => Math.min(2048, Math.max(64, Math.round(v * scale * 64 * PRINT_SCALE)));
    const tw = px(bw), th = px(bh), c = document.createElement('canvas'); c.width = tw; c.height = th;
    const ctx = c.getContext('2d');
    const gr = ctx.createLinearGradient(0, 0, 0, th);
    gr.addColorStop(0, shade(hex, 0.06)); gr.addColorStop(1, shade(hex, -0.06));
    ctx.fillStyle = gr; ctx.fillRect(0, 0, tw, th);
    if (paper && paper.sheet) {
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 0.55;
      const pat = ctx.createPattern(paper.sheet, 'repeat');
      if (pat && pat.setTransform) pat.setTransform(new DOMMatrix().scale(tw / (bw * scale * 64)));
      if (pat) { ctx.fillStyle = pat; ctx.fillRect(0, 0, tw, th); }
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    }
    const r = rng(s * 911 + 17);
    ctx.fillStyle = 'rgba(255,250,240,0.05)';
    for (let i = 0, n = Math.min(400, Math.round(40 * tw * th / 65536)); i < n; i++) ctx.fillRect(r() * tw, r() * th, 1 + r() * 4, 1);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso;
    return t;
  };

  const g = new THREE.Group();
  const entries = [];
  layers.forEach((L, idx) => {
    const depth = L.depth ?? 0.12, ls = L.scale ?? 1, col = L.color ?? '#efe6d2';
    const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel * 0.85, bevelSegments: 2, curveSegments });
    geo.translate(0, 0, -depth / 2);
    // normalise face UVs to 0..1 across shape bounds so paper textures map evenly without seam tiling
    const uv = geo.attributes.uv, pos = geo.attributes.position, nrm = geo.attributes.normal;
    for (let i = 0; i < uv.count; i++) {
      if (Math.abs(nrm.getZ(i)) > 0.5) uv.setXY(i, (pos.getX(i) - x0) / bw, (pos.getY(i) - y0) / bh);
    }
    uv.needsUpdate = true;
    const faceTex = L.faceCanvas ? (() => { const t = new THREE.CanvasTexture(L.faceCanvas); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso; return t; })() : makeFaceTex(col, seed + idx * 19);
    const faceMat = paperMaterial({ map: faceTex, normalMap: paper?.normalMap || null, normalScale: 0.55 });
    const eCol = L.edgeColor || (edgeColor === 'auto' ? edgeColorFor(col) : edgeColor);
    const sideMat = paperMaterial({ color: eCol, map: paper?.map || null, normalMap: paper?.normalMap || null, normalScale: 0.25 });
    const mesh = new THREE.Mesh(geo, [faceMat, sideMat]);
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.scale.set(ls * scale, ls * scale, 1);
    const rz = L.z ?? idx * (depth + 0.04);
    mesh.position.z = rz;
    g.add(mesh);
    entries.push({ mesh, rz });
  });
  g.userData.follow = (p) => {
    const k = Math.min(1, Math.max(0, (p - 0.12) / 0.78)), e = k * k * (3 - 2 * k);
    for (const { mesh, rz } of entries) mesh.position.z = rz * e;
  };
  g.userData.bounds = { x0: x0 * scale, x1: x1 * scale, y0: y0 * scale, y1: y1 * scale, w: bw * scale, h: bh * scale };
  return g;
}

// ---------------------------------------------------------------------------------------------------------------
// light: key from the upper left, frontal fill, hemisphere sky; contact-hardening soft shadows
// ---------------------------------------------------------------------------------------------------------------

/**
 * Patch three's BASIC shadow path into PCSS (blocker search + variable-width filter): crisp where a card meets the
 * page, wider with the gap - the cue that separates stacked paper layers. Also records a "thick" lit fraction that
 * ignores blockers within one sheet thickness, so a card never shadows its own back (for back-lit glow).
 * Call once after creating the key light, before the first render; set renderer.shadowMap.type = THREE.BasicShadowMap.
 * softness = penumbra width per unit of caster-receiver gap (0.2-0.3 = big soft window light; the sun is 0.01).
 */
export function enableSoftShadows(light, { softness = 0.26, maxPenumbra = 1.2, minPenumbra = 0.02, sheet = 0.3, blockerSamples = 16, filterSamples = 24 } = {}) {
  const chunk = THREE.ShaderChunk.shadowmap_pars_fragment;
  if (chunk.includes('papercraftPCSS')) return true;
  const cam = light.shadow.camera;
  const width = cam.right - cam.left, range = cam.far - cam.near;
  const f = (v) => v.toFixed(6);
  const fn = /* glsl */`
#define PAPERCRAFT_PCSS
#define OR_SEARCH_UV ${f(maxPenumbra / width)}
#define OR_PENUMBRA ${f((range * softness) / width)}
#define OR_MIN_UV ${f(minPenumbra / width)}
#define OR_THICK ${f(sheet / range)}
float orLitT = 1.0;
float orIGN( vec2 p ) { return fract( 52.9829189 * fract( dot( p, vec2( 0.06711056, 0.00583715 ) ) ) ); }
vec2 orVogel( int i, int n, float phi ) { float r = sqrt( ( float( i ) + 0.5 ) / float( n ) ); float t = float( i ) * 2.39996323 + phi; return vec2( cos( t ), sin( t ) ) * r; }
float papercraftPCSS( sampler2D sm, vec2 uv, float zr ) {
  float phi = orIGN( gl_FragCoord.xy ) * 6.2831853;
  float blk = 0.0; float n = 0.0;
  for ( int i = 0; i < ${blockerSamples}; i ++ ) {
    float d = textureLod( sm, uv + orVogel( i, ${blockerSamples}, phi ) * OR_SEARCH_UV, 0.0 ).r;
    if ( d < zr ) { blk += d; n += 1.0; }
  }
  if ( n < 0.5 ) { orLitT = 1.0; return 1.0; }
  blk /= n;
  float rad = clamp( ( zr - blk ) * OR_PENUMBRA, OR_MIN_UV, OR_SEARCH_UV );
  float s = 0.0; float st = 0.0;
  for ( int i = 0; i < ${filterSamples}; i ++ ) {
    float d = textureLod( sm, uv + orVogel( i, ${filterSamples}, phi + 1.7 ) * rad, 0.0 ).r;
    s += step( zr, d ); st += step( zr - OR_THICK, d );
  }
  orLitT = st / float( ${filterSamples} );
  return s / float( ${filterSamples} );
}
`;
  // anchor on structure, not comments (built three strips GLSL comments): the BASIC getShadow is the last
  // sampler2D getShadow in the chunk; replace its single depth read with the PCSS result
  const basic = chunk.lastIndexOf('float getShadow( sampler2D shadowMap');
  const read = 'float depth = texture2D( shadowMap, shadowCoord.xy ).r;';
  const at = basic < 0 ? -1 : chunk.indexOf(read, basic);
  if (at < 0) { console.warn('papercraft: shadow chunk changed in this three version; soft shadows disabled'); return false; }
  const patched = chunk.slice(0, at) + 'return mix( 1.0, papercraftPCSS( shadowMap, shadowCoord.xy, shadowCoord.z ), shadowIntensity );\n' + chunk.slice(at);
  THREE.ShaderChunk.shadowmap_pars_fragment = patched.replace('#ifdef USE_SHADOWMAP', '#ifdef USE_SHADOWMAP\n' + fn);
  return true;
}

/**
 * Key + frontal fill + hemisphere sky; the defaults are the template's clear-day set (assets/lights.json 'day'): pass
 * your light's colours and `ground` = your world's ground bounce. keyDir points FROM the scene TO the light: upper
 * left, a little toward the viewer (elevation ~44 deg). Key:fill ~3:1. Never a literal 3000 K key: put warmth in the
 * grade's tint (look.md section 5). Night: cool moon key + cool fill, warm practical lights (look.md section 8).
 */
export function paperLights(scene, { key = '#ffdcb2', keyIntensity = 3.0, keyDir = [-0.8, 0.95, 0.55], fill = '#f2dcc2', fillIntensity = 0.95, fillDir = [0.45, 0.5, 1.0], sky = '#fff0da', ground = '#b39a78', skyIntensity = 0.42, target = new THREE.Vector3(), shadowExtent = 30, mapSize = 2048, distance = 60 } = {}) {
  const k = new THREE.DirectionalLight(key, keyIntensity);
  k.position.copy(target).addScaledVector(new THREE.Vector3(...keyDir).normalize(), distance);
  k.target.position.copy(target);
  k.castShadow = true;
  const s = k.shadow;
  s.mapSize.set(mapSize, mapSize);
  s.camera.left = -shadowExtent; s.camera.right = shadowExtent; s.camera.top = shadowExtent; s.camera.bottom = -shadowExtent;
  s.camera.near = distance * 0.4; s.camera.far = distance * 1.6;
  s.bias = -0.0004; s.normalBias = 0.02;
  const f = new THREE.DirectionalLight(fill, fillIntensity);
  f.position.copy(target).addScaledVector(new THREE.Vector3(...fillDir).normalize(), distance);
  f.target.position.copy(target);
  const h = new THREE.HemisphereLight(sky, ground, skyIntensity);
  scene.add(k, k.target, f, f.target, h);
  return { key: k, fill: f, sky: h };
}

/**
 * A camera that moves (follows a hero, pans a long world): keep the key's shadow box centred on what the camera sees.
 * Call when the camera's look-at point moves; the centre snaps to whole shadow texels so soft edges do not crawl. The
 * fill follows too. For a low key (under ~25 deg) also raise paperLights' `distance` so the box's depth covers the scene.
 */
const _fsC = new THREE.Vector3(), _fsOff = new THREE.Vector3();
export function fitShadow(lights, center) {
  const k = lights.key, cam = k.shadow.camera, texel = (cam.right - cam.left) / k.shadow.mapSize.x;
  _fsC.set(Math.round(center.x / texel) * texel, center.y, Math.round(center.z / texel) * texel);
  for (const L of [lights.key, lights.fill]) {
    if (!L) continue;
    _fsOff.copy(L.position).sub(L.target.position);
    L.target.position.copy(_fsC); L.position.copy(_fsC).add(_fsOff); L.target.updateMatrixWorld();
  }
}

// ---------------------------------------------------------------------------------------------------------------
// the macro lens: tilt-shift DOF -> falloff + depth line -> ACES grade -> haze -> vignette -> grain
// ---------------------------------------------------------------------------------------------------------------

export const LENS_DEFAULTS = {
  // depth of field. band / ramp = fractions of the height of a 16:9 frame (post.bandScale converts them for another
  // shape); maxBlur = radius in px for a 1080 px short side
  focusBand: 0.26, ramp: 0.34, maxBlur: 14, nearGain: 1.6, farGain: 1.0, depthWeight: 0.8, taps: 40, highlightBoost: 0.35,
  // light falloff across the frame (warmer, brighter toward the key side), as a fraction at the frame edge
  falloff: 0.12, falloffTint: 0.07,
  // silhouette depth line: a thin darker line where a card stands in front of something further away
  edgeLine: 0.3, edgeLineColor: '#c2aa94', edgeLinePx: 1.1,   // subtle: the printed rim is the edge; depth is single-sample
  // contact occlusion (SSAO) tinted with the world's shadow colour: every stand-up piece visibly touches the page.
  // radius / bias in world units (~0.4 x hero height / ~0.02 x hero height); grey AO reads as dirt (aoTint default:
  // a warm ground's umber; match it to the leak in other light)
  ao: 1.2, aoRadius: 1.6, aoBias: 0.08, aoTint: '#5a3214',
  // grade
  exposure: 0.8, tint: [1.02, 0.99, 0.97], saturation: 0.95, contrast: 1.1, greenDesat: 0.25, shadowTint: '#3a200c', shadowLift: 0.03,
  // haze: fade toward a colour with GROUND distance from the focus point (world units), applied in display space;
  // subtle and far only (never a colour fog over the frame)
  haze: '#d8bf8e', hazeStart: 34, hazeEnd: 95, hazeAmount: 0.3,
  vignette: 0.05, vignetteColor: '#2a170b', grain: 0.012, grainSize: 1.3, chroma: 0.55, sharpen: 0.3,
};

const VERT = /* glsl */`varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4( position.xy, 0.0, 1.0 ); }`;

const COMMON = /* glsl */`
#include <packing>
uniform sampler2D tColor; uniform sampler2D tDepth;
uniform vec2 uRes; uniform float uNear; uniform float uFar;
uniform vec4 uDof;  // focusY (0..1 from bottom), focus view depth, band, ramp
uniform vec4 uDof2; // max blur px, near gain, far gain, depth weight
uniform float uKD;  // relative depth error -> frame-height fraction: 1 / (fovY * cot(pitch))
varying vec2 vUv;
float rawDepth( vec2 uv ) { return textureLod( tDepth, uv, 0.0 ).r; }
float viewDepth( vec2 uv ) { return -perspectiveDepthToViewZ( rawDepth( uv ), uNear, uFar ); }
float coc( vec2 uv ) {
  float z = viewDepth( uv );
  float c = mix( uv.y - uDof.x, ( z - uDof.y ) / uDof.y * uKD, uDof2.w );
  float a = clamp( ( abs( c ) - uDof.z * 0.5 ) / uDof.w, 0.0, 1.0 );
  a = a * a * ( 3.0 - 2.0 * a ) * 0.35 + a * 0.65;
  return min( a * ( c < 0.0 ? uDof2.y : uDof2.z ), 1.0 ) * uDof2.x;
}
float ign( vec2 p ) { return fract( 52.9829189 * fract( dot( p, vec2( 0.06711056, 0.00583715 ) ) ) ); }
// white-noise hash (no diagonal structure: interleaved gradient noise needs TAA to vanish, without it the blur shows
// a fine diagonal hatch that the references do not have)
float hash12( vec2 p ) { vec3 p3 = fract( vec3( p.xyx ) * 0.1031 ); p3 += dot( p3, p3.yzx + 33.33 ); return fract( ( p3.x + p3.y ) * p3.z ); }
`;

const DOF_FRAG = COMMON + /* glsl */`
uniform float uBoost;
void main() {
  vec2 texel = 1.0 / uRes;
  vec3 base = textureLod( tColor, vUv, 0.0 ).rgb;
  float c = coc( vUv );
  if ( c < 0.6 ) { gl_FragColor = vec4( base, 1.0 ); return; }
  float phi = hash12( gl_FragCoord.xy ) * 6.2831853;
  vec3 acc = base; float wsum = 1.0;
  for ( int i = 0; i < TAPS; i ++ ) {
    float tr = pow( ( float( i ) + 0.5 ) / float( TAPS ), 0.75 );   // centre-dense radii ...
    float t = float( i ) * 2.39996323 + phi;
    vec2 o = vec2( cos( t ), sin( t ) ) * tr * c;
    vec2 uv = vUv + o * texel;
    float d = length( o );
    float w = smoothstep( d - 1.0, d + 1.0, coc( uv ) ) * pow( tr, 0.6667 ); // ... re-weighted to the area; tap must reach us
    vec3 s = min( textureLod( tColor, uv, 0.0 ).rgb, vec3( 24.0 ) );
    w *= 1.0 + uBoost * min( dot( s, vec3( 0.2126, 0.7152, 0.0722 ) ), 6.0 );
    acc += s * w; wsum += w;
  }
  gl_FragColor = vec4( acc / wsum, 1.0 );
}
`;

const GRADE_FRAG = COMMON + /* glsl */`
uniform sampler2D tSharp;
uniform mat4 uInvProj; uniform mat4 uCamWorld; uniform vec3 uFocusW; uniform vec3 uRight; uniform float uFallR;
uniform vec4 uGrade;   // exposure, contrast, saturation, shadow lift
uniform vec3 uTint; uniform vec3 uShadowTint; uniform float uGreen;
uniform vec4 uFall;    // falloff, tint, edge line strength, edge line px
uniform vec3 uEdgeCol;
uniform vec4 uAo;      // strength, world radius, bias, -
uniform vec3 uAoTint; uniform vec2 uProjXY;
uniform vec3 uHaze; uniform vec3 uHazeP;
uniform vec4 uLens;    // vignette, grain, grain px, chroma px
uniform vec3 uVignetteColor; uniform float uTime; uniform float uSharpen;
vec3 aces( vec3 x ) { return clamp( ( x * ( 2.51 * x + 0.03 ) ) / ( x * ( 2.43 * x + 0.59 ) + 0.14 ), 0.0, 1.0 ); }
vec3 toSRGB( vec3 c ) { c = max( c, 0.0 ); return mix( c * 12.92, 1.055 * pow( c, vec3( 1.0 / 2.4 ) ) - 0.055, step( 0.0031308, c ) ); }
float luma( vec3 c ) { return dot( c, vec3( 0.2126, 0.7152, 0.0722 ) ); }
vec3 viewAt( vec2 uv ) { vec4 v = uInvProj * vec4( uv * 2.0 - 1.0, rawDepth( uv ) * 2.0 - 1.0, 1.0 ); return v.xyz / v.w; }
float contactAO( vec2 uv, vec2 texel ) {
  vec3 P = viewAt( uv );
  if ( -P.z > uFar * 0.9 ) return 1.0;
  vec3 pr = viewAt( uv + vec2( texel.x, 0.0 ) ), pl = viewAt( uv - vec2( texel.x, 0.0 ) );
  vec3 pu = viewAt( uv + vec2( 0.0, texel.y ) ), pd = viewAt( uv - vec2( 0.0, texel.y ) );
  vec3 dx = abs( pr.z - P.z ) < abs( P.z - pl.z ) ? pr - P : P - pl;   // smaller-difference neighbours: no smear
  vec3 dy = abs( pu.z - P.z ) < abs( P.z - pd.z ) ? pu - P : P - pd;   // across silhouettes
  vec3 N = normalize( cross( dx, dy ) );
  float R = uAo.y;
  vec2 rUv = R * uProjXY / ( 2.0 * max( -P.z, 1e-3 ) );
  float phi = ign( gl_FragCoord.xy * 1.37 ) * 6.2831853, occ = 0.0;
  for ( int i = 0; i < 10; i ++ ) {
    float r = sqrt( ( float( i ) + 0.5 ) / 10.0 ), t = float( i ) * 2.39996323 + phi;
    vec3 v = viewAt( uv + vec2( cos( t ), sin( t ) ) * r * rUv ) - P;
    float dv = dot( v, v );
    float fall = clamp( 1.0 - dv / ( R * R ), 0.0, 1.0 );
    occ += min( max( dot( v, N ) - uAo.z, 0.0 ) / ( dv + 1e-4 ) * R, 1.6 ) * fall;
  }
  return clamp( 1.0 - uAo.x * occ / 10.0, 0.0, 1.0 );
}
vec3 worldAt( vec2 uv, float depth ) {
  vec4 v = uInvProj * vec4( uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0 );
  return ( uCamWorld * vec4( v.xyz / v.w, 1.0 ) ).xyz;
}
void main() {
  vec2 texel = 1.0 / uRes;
  vec2 d = vUv - 0.5;
  float c = coc( vUv );
  // the DOF pass output, with a tiny lateral chromatic aberration toward the frame edges
  vec2 ca = d * dot( d, d ) * 4.0 * uLens.w * texel;
  vec3 col = vec3( texture2D( tColor, vUv + ca ).r, texture2D( tColor, vUv ).g, texture2D( tColor, vUv - ca ).b );
  // inside the blur: average away the gather's residual sampling noise (the references' blur is creamy)
  if ( c > 2.0 ) {
    float rr = min( c * 0.18, 3.0 ); vec3 sm = col;
    for ( int k = 0; k < 6; k ++ ) { float a = float( k ) * 1.0471976 + 0.5; sm += texture2D( tColor, vUv + vec2( cos( a ), sin( a ) ) * rr * texel ).rgb; }
    col = mix( col, sm / 7.0, smoothstep( 2.0, 5.0, c ) );
  }
  // in focus: a light unsharp mask (the bite of a macro lens)
  if ( c < 0.6 && uSharpen > 0.0 ) {
    vec3 n = texture2D( tSharp, vUv + vec2( texel.x, 0.0 ) ).rgb + texture2D( tSharp, vUv - vec2( texel.x, 0.0 ) ).rgb
           + texture2D( tSharp, vUv + vec2( 0.0, texel.y ) ).rgb + texture2D( tSharp, vUv - vec2( 0.0, texel.y ) ).rgb;
    col += clamp( ( col - n * 0.25 ) * uSharpen, -0.25, 0.25 ) * ( 1.0 - c / 0.6 );
  }
  float depth = rawDepth( vUv );
  vec3 wp = worldAt( vUv, depth );
  // contact occlusion in the world's shadow tint (faded out inside the blur, where a sharp AO edge would give it away)
  if ( uAo.x > 0.0 ) col *= mix( uAoTint, vec3( 1.0 ), mix( contactAO( vUv, texel ), 1.0, smoothstep( 2.0, 8.0, c ) ) );
  // light falloff across the frame (world space, so every material gets it): brighter / warmer toward the key side
  float t = clamp( dot( wp - uFocusW, uRight ) / uFallR, -1.0, 1.0 );
  col *= ( 1.0 - uFall.x * t ) * vec3( 1.0 - uFall.y * 0.5 * t, 1.0, 1.0 + uFall.y * t );
  // silhouette depth line: this pixel is in front of something much further away nearby -> slightly darker
  if ( uFall.z > 0.0 ) {
    float z = viewDepth( vUv ), r = uFall.w;
    float zf = max( max( viewDepth( vUv + vec2( r, 0.0 ) * texel ), viewDepth( vUv - vec2( r, 0.0 ) * texel ) ),
                    max( viewDepth( vUv + vec2( 0.0, r ) * texel ), viewDepth( vUv - vec2( 0.0, r ) * texel ) ) );
    float zs = 0.0035 * z;
    float line = smoothstep( zs, zs * 2.6, zf - z ) * uFall.z * ( 1.0 - smoothstep( 1.5, 4.0, c ) );
    col = mix( col, col * uEdgeCol, clamp( line, 0.0, 1.0 ) );
  }
  // grade: exposure x white balance -> ACES -> saturation -> sRGB -> contrast about 0.42
  col = aces( col * uGrade.x * uTint );
  float l = luma( col );
  col = max( mix( vec3( l ), col, uGrade.z ), 0.0 );
  col = toSRGB( col );
  col = ( col - 0.42 ) * uGrade.y + 0.42;
  // tame saturated yellow-green toward a muted paper green (hue-masked); under a warm key grey teals fall in the mask
  // too: greenDesat <= 0.1 for teal-led worlds, lower it when the brief's greens are fresh (look.md sections 7, 9)
  float gm = smoothstep( 0.1, 0.3, col.g - col.b ) * smoothstep( -0.2, -0.05, col.g - col.r ) * uGreen;
  col = mix( col, mix( vec3( luma( col ) ), col, 0.45 ) * vec3( 0.97, 1.0, 1.03 ), clamp( gm, 0.0, 1.0 ) );
  // lift the deepest tones toward shadowTint (the world's shadow hue: umber on a warm ground, navy at night), never black
  col += uShadowTint * uGrade.w * ( 1.0 - smoothstep( 0.0, 0.45, l ) );
  // haze toward an exact display colour with ground distance from the focus point, counted only away from the camera
  // and sideways (the near foreground of a wide shot must never pale)
  vec2 rel = wp.xz - uFocusW.xz; vec2 rg = normalize( uRight.xz ); vec2 fg = vec2( -rg.y, rg.x );
  float hd = length( vec2( dot( rel, rg ) * 0.75, max( 0.0, -dot( rel, fg ) ) ) );
  float h = depth >= 0.99999 ? 1.0 : smoothstep( uHazeP.x, uHazeP.y, hd );
  col = mix( col, uHaze, h * uHazeP.z );
  // mild warm vignette
  float vg = smoothstep( 0.2, 0.85, length( d * vec2( 1.0, 0.85 ) ) * 1.15 );
  col = mix( col, uVignetteColor, vg * uLens.x );
  // print grain: small, luma-shaped, deterministic per frame (fibre on the surfaces carries the paper, not this)
  vec2 gp = floor( gl_FragCoord.xy / uLens.z );
  float nz = hash12( gp + floor( uTime * 60.0 ) * 17.0 ) - 0.5;
  col += nz * uLens.y * ( 0.35 + 1.3 * sqrt( max( l, 0.0 ) ) * ( 1.0 - 0.6 * l ) ) * ( 1.0 - smoothstep( 1.0, 4.0, c ) ); // none inside the blur: the shipped frames' blur is silky (grain there reads as a screen filter)
  gl_FragColor = vec4( clamp( col, 0.0, 1.0 ), 1.0 );
}
`;

function displayColor(hex) { const c = new THREE.Color(hex); c.convertLinearToSRGB(); return new THREE.Vector3(c.r, c.g, c.b); }
function linearColor(hex) { const c = new THREE.Color(hex); return new THREE.Vector3(c.r, c.g, c.b); }

/**
 * Post chain for the macro-photo look. Usage: const post = new PaperPost(renderer, scene, camera, opts);
 * every frame: post.focus.copy(worldPointThatMustBeSharp); post.render(time). Call post.setSize(w, h) on resize.
 * Blur, lines and grain scale with the frame's short side; post.bandScale (default 1) scales band and ramp for a frame
 * taller than 16:9 (the 3D harness sets it: tan(fov / 2) of the 16:9 frame over the frame's own), post.magnify
 * (default 1) the blur and lines of a frame cropped closer than that.
 * Haze, vignette and shadow tint are art-directed in DISPLAY space, so the hex you choose is the colour you see.
 * Set post.view = 1 to see the circle of confusion (red = far blur, green = near blur) while tuning.
 */
export class PaperPost {
  constructor(renderer, scene, camera, opts = {}) {
    this.renderer = renderer; this.scene = scene; this.camera = camera;
    this.o = { ...LENS_DEFAULTS, ...opts };
    this.focus = new THREE.Vector3();
    renderer.toneMapping = THREE.NoToneMapping;
    const rtOpts = { type: THREE.HalfFloatType, colorSpace: THREE.LinearSRGBColorSpace };
    this.rtScene = new THREE.WebGLRenderTarget(2, 2, { ...rtOpts, samples: 4 });
    this.rtScene.depthTexture = new THREE.DepthTexture(2, 2);
    this.rtDof = new THREE.WebGLRenderTarget(2, 2, rtOpts);
    const shared = {
      tDepth: { value: this.rtScene.depthTexture }, uRes: { value: new THREE.Vector2(2, 2) },
      uNear: { value: camera.near }, uFar: { value: camera.far },
      uDof: { value: new THREE.Vector4() }, uDof2: { value: new THREE.Vector4() }, uKD: { value: 1 },
    };
    this.dof = new THREE.ShaderMaterial({
      defines: { TAPS: this.o.taps }, vertexShader: VERT, fragmentShader: DOF_FRAG, depthTest: false, depthWrite: false,
      uniforms: { ...shared, tColor: { value: this.rtScene.texture }, uBoost: { value: this.o.highlightBoost } },
    });
    this.grade = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: GRADE_FRAG, depthTest: false, depthWrite: false,
      uniforms: {
        ...shared, tColor: { value: this.rtDof.texture }, tSharp: { value: this.rtScene.texture },
        uInvProj: { value: new THREE.Matrix4() }, uCamWorld: { value: new THREE.Matrix4() }, uFocusW: { value: this.focus },
        uRight: { value: new THREE.Vector3(1, 0, 0) }, uFallR: { value: 30 },
        uGrade: { value: new THREE.Vector4() }, uTint: { value: new THREE.Vector3() }, uShadowTint: { value: new THREE.Vector3() }, uGreen: { value: 0 },
        uFall: { value: new THREE.Vector4() }, uEdgeCol: { value: new THREE.Vector3() },
        uAo: { value: new THREE.Vector4() }, uAoTint: { value: new THREE.Vector3() }, uProjXY: { value: new THREE.Vector2(1, 1) },
        uHaze: { value: new THREE.Vector3() }, uHazeP: { value: new THREE.Vector3() }, uLens: { value: new THREE.Vector4() },
        uVignetteColor: { value: new THREE.Vector3() }, uTime: { value: 0 }, uSharpen: { value: 0 },
      },
    });
    this.debug = new THREE.ShaderMaterial({
      vertexShader: VERT, depthTest: false, depthWrite: false, uniforms: { ...shared, tColor: { value: this.rtScene.texture } },
      fragmentShader: COMMON + 'void main(){ float c = coc( vUv ) / max( uDof2.x, 1.0 ); float s = mix( vUv.y - uDof.x, ( viewDepth( vUv ) - uDof.y ) / uDof.y * uKD, uDof2.w ); gl_FragColor = vec4( s > 0.0 ? c : 0.0, s < 0.0 ? c : 0.0, 0.0, 1.0 ) + vec4( texture2D( tColor, vUv ).rgb * 0.25, 0.0 ); }',
    });
    this.view = 0;
    this.quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.dof);
    this.quad.frustumCulled = false;
    this._p = new THREE.Vector3(); this._v = new THREE.Vector3(); this._fwd = new THREE.Vector3(); this._sz = new THREE.Vector2();
    this.apply();
    // Auto-size to the renderer's current canvas so forgetting setSize() never renders a smeared 2x2 quadrant.
    renderer.getSize(this._sz);
    if (this._sz.x > 0 && this._sz.y > 0) this.setSize(this._sz.x, this._sz.y);
  }
  /** Release all GPU targets, shaders and quad geometry. */
  dispose() {
    this.rtScene.depthTexture?.dispose(); this.rtScene.dispose(); this.rtDof.dispose();
    this.dof.dispose(); this.grade.dispose(); this.debug.dispose(); this.quad.geometry.dispose();
  }
  /** Re-read this.o (call after changing options at runtime). */
  apply() {
    const o = this.o, u = this.grade.uniforms;
    u.uGrade.value.set(o.exposure, o.contrast, o.saturation, o.shadowLift);
    u.uTint.value.set(...o.tint);
    u.uShadowTint.value.copy(displayColor(o.shadowTint));
    u.uGreen.value = o.greenDesat;
    u.uEdgeCol.value.copy(linearColor(o.edgeLineColor));
    u.uAo.value.set(o.ao, o.aoRadius, o.aoBias, 0);
    u.uAoTint.value.copy(linearColor(o.aoTint));
    u.uHaze.value.copy(displayColor(o.haze));
    u.uHazeP.value.set(o.hazeStart, o.hazeEnd, o.hazeAmount);
    u.uVignetteColor.value.copy(displayColor(o.vignetteColor));
    u.uSharpen.value = o.sharpen;
    this.dof.uniforms.uBoost.value = o.highlightBoost;
  }
  setSize(w, h) {
    const pr = this.renderer.getPixelRatio(), W = Math.max(2, Math.round(w * pr)), H = Math.max(2, Math.round(h * pr));
    this.rtScene.setSize(W, H); this.rtDof.setSize(W, H);
    this.dof.uniforms.uRes.value.set(W, H);
    this.H = H; this.S = Math.min(W, H);   // the short side: a 9:16 frame blurs like a 16:9 one of the same width
    // a big frame blurs over more pixels: more taps keep the blur smooth (recompiles once per size class)
    const taps = Math.round(this.o.taps * Math.min(2.5, Math.max(1, this.S / 1080)));
    if (this.dof.defines.TAPS !== taps) { this.dof.defines.TAPS = taps; this.dof.needsUpdate = true; }
  }
  render(time = 0) {
    const { renderer, scene, camera, o } = this;
    const u = this.dof.uniforms, g = this.grade.uniforms, k = (this.S || 1080) / 1080 * (this.magnify ?? 1), bs = this.bandScale ?? 1;
    camera.updateMatrixWorld();
    const p = this._p.copy(this.focus).project(camera);
    const fz = Math.max(0.01, -this._v.copy(this.focus).applyMatrix4(camera.matrixWorldInverse).z);
    const fovY = THREE.MathUtils.degToRad(camera.fov);
    camera.getWorldDirection(this._fwd);
    const pitch = Math.max(0.05, Math.asin(Math.min(0.999, -this._fwd.y)));
    u.uKD.value = Math.min(9, 1 / (fovY * (Math.cos(pitch) / Math.sin(pitch))));
    u.uNear.value = camera.near; u.uFar.value = camera.far;
    u.uDof.value.set(THREE.MathUtils.clamp(p.y * 0.5 + 0.5, 0.1, 0.9), fz, o.focusBand * bs, Math.max(0.02, o.ramp * bs));
    u.uDof2.value.set(o.maxBlur * k, o.nearGain, o.farGain, o.depthWeight);
    g.uInvProj.value.copy(camera.projectionMatrixInverse);
    g.uProjXY.value.set(camera.projectionMatrix.elements[0], camera.projectionMatrix.elements[5]);
    g.uCamWorld.value.copy(camera.matrixWorld);
    g.uRight.value.set(1, 0, 0).applyQuaternion(camera.quaternion).setY(0).normalize();
    g.uFallR.value = fz * Math.tan(fovY / 2) * camera.aspect * 1.25; // just beyond the frame's half width at the focus
    g.uFall.value.set(o.falloff, o.falloffTint, o.edgeLine, o.edgeLinePx * k);
    g.uLens.value.set(o.vignette, o.grain, o.grainSize * Math.max(1, k), o.chroma * k);
    g.uTime.value = time;
    renderer.setRenderTarget(this.rtScene);
    renderer.render(scene, camera);
    if (this.view === 1) { this.quad.material = this.debug; renderer.setRenderTarget(null); renderer.render(this.quad, this.quadCam); return; }
    this.quad.material = this.dof;
    renderer.setRenderTarget(this.rtDof);
    renderer.render(this.quad, this.quadCam);
    this.quad.material = this.grade;
    renderer.setRenderTarget(null);
    renderer.render(this.quad, this.quadCam);
  }
}

export { rng };
