/* eslint-disable */
// papercraft / paperkit-2d.js
// Procedural paper for Canvas 2D: paper sheets, normal maps, cut-paper outlines and printed marks.
// No dependencies, deterministic (every function takes a seed or an rng). Works in any browser canvas and
// produces textures for WebGL (three.js CanvasTexture) or files (canvas.toBlob).
//
// Coordinates: outlines are arrays of [x, y] in your own units with y UP (a card standing on a table:
// y = 0 is the fold / base line). printCard() maps them to pixels for you.

// ---------------------------------------------------------------------------------------------------------------
// random + colour
// ---------------------------------------------------------------------------------------------------------------

/** mulberry32: fast seeded PRNG, returns () => [0, 1). */
export function rng(seed = 1) {
  let a = (seed >>> 0) || 0x9e3779b9;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function toRGB(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function toHex(rgb, g, b) {
  const arr = Array.isArray(rgb) ? rgb : [rgb, g, b];
  return '#' + arr.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}
/** Linear mix of two hex colours. */
export function mix(a, b, t) {
  const A = toRGB(a), B = toRGB(b);
  return toHex(A.map((v, i) => v + (B[i] - v) * t));
}
/** Paper-safe shading: k < 0 darkens toward warm umber (never grey or black), k > 0 lightens toward warm white. */
export function shade(c, k) {
  return k < 0 ? mix(c, '#2b1a0e', Math.min(1, -k)) : mix(c, '#fff7e8', Math.min(1, k));
}
const shade_ = shade; // for scopes where `shade` is an option name
export function rgba(c, a) {
  const [r, g, b] = toRGB(c);
  return `rgba(${r},${g},${b},${a})`;
}

function makeCanvas(w, h) {
  if (typeof OffscreenCanvas !== 'undefined' && typeof document === 'undefined') return new OffscreenCanvas(w, h);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

// ---------------------------------------------------------------------------------------------------------------
// noise
// ---------------------------------------------------------------------------------------------------------------

/** Tileable value noise on a size x size grid with `cells` lattice cells per side; values in [0, 1]. */
export function tileNoise(size, cells, r) {
  const lat = new Float32Array(cells * cells);
  for (let i = 0; i < lat.length; i++) lat[i] = r();
  const out = new Float32Array(size * size);
  const s = cells / size;
  for (let y = 0; y < size; y++) {
    const fy = y * s, y0 = Math.floor(fy), ty = fy - y0, sy = ty * ty * (3 - 2 * ty);
    const r0 = (y0 % cells) * cells, r1 = ((y0 + 1) % cells) * cells;
    for (let x = 0; x < size; x++) {
      const fx = x * s, x0 = Math.floor(fx), tx = fx - x0, sx = tx * tx * (3 - 2 * tx);
      const c0 = x0 % cells, c1 = (x0 + 1) % cells;
      const a = lat[r0 + c0] + (lat[r0 + c1] - lat[r0 + c0]) * sx;
      const b = lat[r1 + c0] + (lat[r1 + c1] - lat[r1 + c0]) * sx;
      out[y * size + x] = a + (b - a) * sy;
    }
  }
  return out;
}

/** 1D smooth noise for edges: returns f(t) with values in [-1, 1], period `period` samples. */
function edgeNoise(r, period = 64) {
  const v = Array.from({ length: period }, () => r() * 2 - 1);
  return (t) => {
    const i = Math.floor(t), f = t - i, s = f * f * (3 - 2 * f);
    const a = v[((i % period) + period) % period], b = v[(((i + 1) % period) + period) % period];
    return a + (b - a) * s;
  };
}

// ---------------------------------------------------------------------------------------------------------------
// paper sheets
// ---------------------------------------------------------------------------------------------------------------

/**
 * A tileable sheet of paper: base colour + low-frequency mottling + fibres + inclusions + grain.
 * Use it as the albedo of every surface (multiply your print over it) and derive the normal map from it.
 * fibres / mottle / grain are strengths: 0 = off, 1 = default cardstock. Kraft: fibres 1.6, mottle 0.09.
 * Watercolour paper: mottle 0.08, grain 0.05, fibres 0.5. Smooth printer card: fibres 0.4, mottle 0.02.
 */
export function paperSheet({ size = 512, color = '#f3ead9', seed = 7, fibres = 1, mottle = 0.07, grain = 0.045, tooth = 0.07, inclusions = 1, direction = 0.35 } = {}) {
  const r = rng(seed);
  const c = makeCanvas(size, size);
  const g = c.getContext('2d');
  g.fillStyle = color;
  g.fillRect(0, 0, size, size);
  // mottling (cloudy density of the pulp) and grain, as a multiply on the base
  // mottle (cloud of the pulp), tooth (the embossed texture of heavy paper, features ~4-6 texels: it must survive being
  // shrunk on screen, or only "felt" remains) and per-texel grain
  const lo = tileNoise(size, 6, r), mid = tileNoise(size, 24, r), th = tileNoise(size, Math.max(8, Math.round(size / 5)), r);
  const img = g.getImageData(0, 0, size, size), d = img.data;
  for (let i = 0, p = 0; i < lo.length; i++, p += 4) {
    const m = 1 + mottle * ((lo[i] - 0.5) * 1.4 + (mid[i] - 0.5) * 0.6) + tooth * (th[i] - 0.5) * 2 + grain * (r() - 0.5) * 2;
    d[p] *= m; d[p + 1] *= m; d[p + 2] *= m * 0.995;
  }
  g.putImageData(img, 0, 0);
  // fibres: short, slightly curved strands, mostly lighter than the sheet, a few darker; drawn wrapped so it tiles
  const n = Math.round((size * size) / 260 * fibres);
  const lightF = rgba(mix(color, '#ffffff', 0.7), 0.24), darkF = rgba(shade(color, -0.45), 0.14);
  g.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const x = r() * size, y = r() * size;
    const a = (r() < direction ? 0.15 * (r() - 0.5) : r() * Math.PI);
    const len = 3 + r() * r() * 30, bend = (r() - 0.5) * len * 0.5;
    const dx = Math.cos(a) * len, dy = Math.sin(a) * len;
    g.strokeStyle = r() < 0.72 ? lightF : darkF;
    g.lineWidth = 0.6 + r() * 1.0; // wide enough to survive minification (sub-pixel fibres read as felt)
    for (const ox of [-size, 0, size]) for (const oy of [-size, 0, size]) {
      if (x + ox + len < 0 || x + ox - len > size || y + oy + len < 0 || y + oy - len > size) continue;
      g.beginPath();
      g.moveTo(x + ox, y + oy);
      g.quadraticCurveTo(x + ox + dx * 0.5 - dy / len * bend, y + oy + dy * 0.5 + dx / len * bend, x + ox + dx, y + oy + dy);
      g.stroke();
    }
  }
  // inclusions: rare dark specks and tiny light flecks (recycled pulp)
  const k = Math.round((size * size) / 9000 * inclusions);
  for (let i = 0; i < k; i++) {
    g.fillStyle = r() < 0.6 ? rgba(shade(color, -0.6), 0.25 + r() * 0.3) : rgba('#ffffff', 0.35);
    g.beginPath();
    g.ellipse(r() * size, r() * size, 0.4 + r() * 0.9, 0.3 + r() * 0.6, r() * 3, 0, Math.PI * 2);
    g.fill();
  }
  return c;
}

/** Tileable tangent-space normal map from a sheet's luminance (fibres stand up, mottling dents). strength ~1-4. */
export function normalMap(sheet, strength = 2) {
  const w = sheet.width, h = sheet.height;
  const src = sheet.getContext('2d').getImageData(0, 0, w, h).data;
  const L = new Float32Array(w * h);
  for (let i = 0, p = 0; i < L.length; i++, p += 4) L[i] = (src[p] * 0.299 + src[p + 1] * 0.587 + src[p + 2] * 0.114) / 255;
  const c = makeCanvas(w, h);
  const g = c.getContext('2d');
  const img = g.createImageData(w, h), d = img.data;
  const at = (x, y) => L[((y + h) % h) * w + ((x + w) % w)];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dx = (at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1)) - (at(x - 1, y - 1) + 2 * at(x - 1, y) + at(x - 1, y + 1));
    const dy = (at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1)) - (at(x - 1, y - 1) + 2 * at(x, y - 1) + at(x + 1, y - 1));
    let nx = -dx * strength, ny = dy * strength, nz = 1;
    const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l;
    const p = (y * w + x) * 4;
    d[p] = (nx * 0.5 + 0.5) * 255; d[p + 1] = (ny * 0.5 + 0.5) * 255; d[p + 2] = (nz * 0.5 + 0.5) * 255; d[p + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return c;
}

// ---------------------------------------------------------------------------------------------------------------
// cut outlines (closed polygons, y up). Every shape is something you could cut from one sheet with scissors.
// ---------------------------------------------------------------------------------------------------------------

export function bbox(pts) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of pts) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 };
}

export const shape = {
  /** Trace any union of drawn primitives into a cut outline: shape.fromDrawing(g => { ... }, { w, h }). */
  fromDrawing: (...a) => fromDrawing(...a),
  /** Rectangle standing on y = 0. */
  rect(w, h) { return [[-w / 2, 0], [w / 2, 0], [w / 2, h], [-w / 2, h]]; },
  /** Low scalloped mound on a FLAT base (bushes, rocks, hedges, snow drifts, coral heads): stands on its fold line,
   *  never balanced on a point. w = width, h = height (bushes ~0.4 w, rocks ~0.55 w). */
  mound(r, { w = 3, h = 1.2, lobes = 7, depth = 0.18, n = 120 } = {}) {
    // a lobed half-ellipse: scallops along the top, sides meeting the base at right angles (no slivers at the feet)
    const ph = r() * Math.PI, k = Math.max(1, lobes) / 2, out = [];
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI, rr = 1 - depth * (1 - Math.pow(Math.abs(Math.sin(a * k * 2 + ph)), 0.6)) + (r() - 0.5) * 0.01;
      out.push([Math.cos(a) * (w / 2) * rr, Math.max(0, Math.sin(a)) * h * rr]);
    }
    out[0][1] = 0; out[n][1] = 0;
    return out;                                       // right foot -> over the top -> left foot; the base closes it
  },

  /**
   * Lobed radial outline: tree canopies, bushes, clouds, suns (lobes + spiky), flowers.
   * stalk: { w, base } joins the shape to a strip down to y = base (a cloud or sun on a paper stick, a lollipop tree trunk).
   */
  radial(r, { cx = 0, cy = 0, rx = 1, ry = 1, lobes = 7, depth = 0.14, spiky = false, wobble = 0.05, n = 180, stalk = null } = {}) {
    const phase = r() * Math.PI * 2, wob = edgeNoise(r, 16);
    const R = (t) => {
      const s = Math.abs(Math.sin((lobes * t + phase) / 2));
      const lobe = spiky ? 1 - depth + depth * 2 * Math.pow(1 - s, 6) - depth * 0.6 : 1 - depth + depth * Math.pow(s, 0.55);
      return lobe * (1 + wobble * wob((t / (Math.PI * 2)) * 16));
    };
    if (!stalk) {
      const pts = [];
      for (let i = 0; i < n; i++) { const t = (i / n) * Math.PI * 2; pts.push([cx + Math.cos(t) * rx * R(t), cy + Math.sin(t) * ry * R(t)]); }
      return pts;
    }
    // with a stalk: walk round the outline from just right of the bottom to just left of it, then down the strip
    const half = stalk.w / 2;
    const dt = Math.asin(Math.min(0.95, half / rx));
    const t0 = -Math.PI / 2 + dt, t1 = Math.PI * 1.5 - dt;
    const pts = [];
    for (let i = 0; i <= n; i++) { const t = t0 + ((t1 - t0) * i) / n; pts.push([cx + Math.cos(t) * rx * R(t), cy + Math.sin(t) * ry * R(t)]); }
    const yJoin = Math.min(pts[0][1], pts[pts.length - 1][1]);
    pts.push([cx - half, Math.min(yJoin, cy - ry * 0.6)], [cx - half * 1.25, stalk.base], [cx + half * 1.25, stalk.base], [cx + half, Math.min(yJoin, cy - ry * 0.6)]);
    return pts;
  },

  /** Rolling hill strip from x = -w/2..w/2, flat bottom on y = 0, crest around y = h. */
  hill(r, { w = 12, h = 3, bumps = 3, n = 140 } = {}) {
    const a = Array.from({ length: 3 }, () => r() * 6.28), k = [bumps, bumps * 2.3, bumps * 5.1], amp = [0.55, 0.22, 0.06];
    const top = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, x = -w / 2 + u * w;
      let y = h * 0.72;
      for (let j = 0; j < 3; j++) y += h * 0.28 * amp[j] * Math.sin(u * Math.PI * k[j] + a[j]) / 0.55;
      const edge = Math.sin((Math.PI / 2) * Math.min(1, Math.min(u, 1 - u) * 6)) ** 0.5; // shoulders drop toward the ends
      top.push([x, Math.max(h * 0.12, y * (0.55 + 0.45 * edge))]);
    }
    return [[-w / 2, 0], ...top, [w / 2, 0]];
  },

  /** Scalloped wave strip (water cut-outs), flat bottom on y = 0. */
  waves(r, { w = 8, h = 0.6, crests = 6, n = 120 } = {}) {
    const top = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, ph = (u * crests) % 1;
      top.push([-w / 2 + u * w, h * (0.45 + 0.55 * Math.pow(Math.sin(ph * Math.PI), 0.7)) * (0.9 + 0.1 * Math.sin(u * 9 + r()))]);
    }
    return [[-w / 2, 0], ...top, [w / 2, 0]];
  },

  /** Regular n-gon centred on (0, 0) of radius r (footprints for prismFold towers, silos, kiosks, dais steps). */
  ngon(n = 8, r = 1, { phase = Math.PI / n } = {}) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + phase;
      pts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    return pts;
  },

  /** Rounded-corner rectangle standing on y = 0 (clean signs, screens, panels, architectural arches). */
  roundedRect(w, h, r = 0.2, segs = 6) {
    const rad = Math.max(0, Math.min(r, w * 0.49, h * 0.49));
    if (rad < 1e-6) return [[-w / 2, 0], [w / 2, 0], [w / 2, h], [-w / 2, h]];
    const hw = w / 2, pts = [];
    const corners = [
      [hw - rad, rad, -Math.PI / 2, 0],
      [hw - rad, h - rad, 0, Math.PI / 2],
      [-hw + rad, h - rad, Math.PI / 2, Math.PI],
      [-hw + rad, rad, Math.PI, Math.PI * 1.5],
    ];
    for (const [cx, cy, a0, a1] of corners) {
      for (let i = 0; i <= segs; i++) {
        const a = a0 + (a1 - a0) * (i / segs);
        pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
      }
    }
    return pts;
  },

  /** Billowy storybook cloud bank on a flat base y = 0: upper envelope of overlapping circular puffs (never pointy).
   *  Call as shape.cloud(rng(seed), { w, h, puffs }) or shape.cloud({ w, h, puffs }). */
  cloud(rOrOpts, opts = {}) {
    const r = typeof rOrOpts === 'function' ? rOrOpts : rng(typeof rOrOpts === 'number' ? rOrOpts : 1);
    const { w = 6, h = 2.6, puffs = 5, n = 120 } = (rOrOpts && typeof rOrOpts === 'object') ? rOrOpts : opts;
    const hw = w / 2, balls = [];
    for (let i = 0; i < puffs; i++) {
      const u = puffs === 1 ? 0.5 : i / (puffs - 1);
      const cx = (u - 0.5) * w * 0.72 + (r() - 0.5) * w * 0.04;
      const env = Math.sin(Math.PI * (0.12 + 0.76 * u));
      const rad = h * (0.36 + 0.34 * env) * (0.94 + 0.12 * r());
      const cy = Math.max(rad * 0.32, h * (0.28 + 0.34 * env) - rad * 0.32);
      balls.push([cx, cy, rad]);
    }
    const top = [];
    for (let i = 0; i <= n; i++) {
      const x = -hw + (w * i) / n;
      let y = 0;
      for (const [cx, cy, rad] of balls) {
        const dx = x - cx;
        if (Math.abs(dx) < rad) y = Math.max(y, cy + Math.sqrt(rad * rad - dx * dx));
      }
      if (i === 0 || i === n) y = 0;
      top.push([x, Math.max(0, y)]);
    }
    return [[-hw, 0], ...top.filter((p, i) => i > 0 && i < top.length - 1), [hw, 0]];
  },

};

/**
 * Validate a closed 2D cut outline before extruding: catches degenerate edges, tiny area, NaN coordinates and
 * self-intersecting loops (which cause spikes or torn faces in THREE.ExtrudeGeometry).
 */
export function validateOutline(pts) {
  const issues = [];
  if (!Array.isArray(pts) || pts.length < 3) return { ok: false, area: 0, selfIntersections: 0, issues: ['outline needs at least 3 points'] };
  const n = pts.length;
  let area2 = 0, dup = 0;
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    if (!Number.isFinite(a[0]) || !Number.isFinite(a[1])) { issues.push(`non-finite point at ${i}`); return { ok: false, area: 0, selfIntersections: 0, issues }; }
    area2 += a[0] * b[1] - b[0] * a[1];
    if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 1e-7) dup++;
  }
  const area = Math.abs(area2) * 0.5;
  if (area < 1e-6) issues.push('zero or near-zero area');
  if (dup > 0) issues.push(`${dup} duplicate adjacent point(s)`);
  const cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const hit = (a, b, c, d) => {
    if (Math.max(a[0], b[0]) < Math.min(c[0], d[0]) || Math.max(c[0], d[0]) < Math.min(a[0], b[0])) return false;
    if (Math.max(a[1], b[1]) < Math.min(c[1], d[1]) || Math.max(c[1], d[1]) < Math.min(a[1], b[1])) return false;
    const d1 = cross(a, b, c), d2 = cross(a, b, d), d3 = cross(c, d, a), d4 = cross(c, d, b);
    return ((d1 > 1e-9 && d2 < -1e-9) || (d1 < -1e-9 && d2 > 1e-9)) && ((d3 > 1e-9 && d4 < -1e-9) || (d3 < -1e-9 && d4 > 1e-9));
  };
  let selfIntersections = 0;
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue;
      if (hit(a, b, pts[j], pts[(j + 1) % n])) selfIntersections++;
    }
  }
  if (selfIntersections > 0) issues.push(`${selfIntersections} self-intersecting edge pair(s)`);
  return { ok: issues.length === 0, area, selfIntersections, issues };
}

/**
 * Hand-cut irregularity: subdivide edges to `step` units and push points along the edge normal by smooth noise.
 * Defaults are relative to the shape (scale-free): amp = 0.8 % and step = 1.5 % of the shape's smaller side.
 * Scissors: amp ~1-3 % of the smaller side, long period. Torn / deckled paper: 3-6 %, plus `tear` for the fine tooth.
 * Pass amp / step / tear in your own units to override.
 */
export function roughen(pts, r, { amp = null, step = null, period = 24, tear = 0, keepBase = true } = {}) {
  const bb = bbox(pts), m = Math.max(1e-6, Math.min(bb.w, bb.h)), onBase = (y) => keepBase && Math.abs(y - bb.y0) < 1e-6 * (1 + m);
  if (amp === null) amp = 0.008 * m;
  if (step === null) step = Math.max(0.015 * m, Math.max(bb.w, bb.h) / 1500);
  const out = [], noise = edgeNoise(r, 97);
  let s = r() * 50;
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length];
    const len = Math.hypot(x1 - x0, y1 - y0), k = Math.max(1, Math.ceil(len / step));
    const nx = (y1 - y0) / (len || 1), ny = -(x1 - x0) / (len || 1);
    const flat = onBase(y0) && onBase(y1); // the fold line on the page is a score line: never wobble it
    for (let j = 0; j < k; j++) {
      const t = j / k;
      const d = flat ? 0 : amp * noise(s / step / period * 8) + (tear ? tear * (r() - 0.5) : 0);
      out.push([x0 + (x1 - x0) * t + nx * d, y0 + (y1 - y0) * t + ny * d]);
      s += len / k;
    }
  }
  return out;
}

export function tracePath(g, pts) {
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.closePath();
}

// ---------------------------------------------------------------------------------------------------------------
// printing on a card: draw in shape units (y up); everything is clipped to the cut outline
// ---------------------------------------------------------------------------------------------------------------

/**
 * Print onto a card cut to `pts`. paint(P) receives helpers that draw in shape units, clipped to the outline.
 * Returns { canvas, box, pxPerUnit }. The canvas is transparent outside the outline (use as a cut-out texture
 * or alpha map) and maps 1:1 onto the outline's bounding box (box) - in three.js set texture.repeat/offset from it.
 */
let _tooth = null;
/** A neutral (mean 50 % grey) tileable paper tooth: two-scale noise + short fibres, for soft-light / overlay passes. */
export function neutralTooth(size = 256, seed = 17) {
  if (_tooth) return _tooth;
  const r = rng(seed), c = makeCanvas(size, size), g = c.getContext('2d');
  const a = tileNoise(size, Math.round(size / 5), r), b = tileNoise(size, Math.round(size / 18), r);
  const img = g.createImageData(size, size), d = img.data;
  for (let i = 0, p = 0; i < a.length; i++, p += 4) { const v = 128 + ((a[i] - 0.5) * 0.7 + (b[i] - 0.5) * 0.5 + (r() - 0.5) * 0.25) * 150; d[p] = d[p + 1] = d[p + 2] = v; d[p + 3] = 255; }
  g.putImageData(img, 0, 0);
  g.lineCap = 'round';
  for (let i = 0; i < size * size / 300; i++) {
    const x = r() * size, y = r() * size, an = r() * Math.PI, l = 3 + r() * 12;
    g.strokeStyle = r() < 0.6 ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.25)'; g.lineWidth = 0.8 + r() * 0.8;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(an) * l, y + Math.sin(an) * l); g.stroke();
  }
  return (_tooth = c);
}

// ---------------------------------------------------------------------------------------------------------------
// applique: a print is a small collage of cut paper with one quiet fibre. Every part (a leaf, a limb, a pine tier, a
// window, a wing, a band of a bush) is its own layer laid over the one below: a short soft warm shadow on what lies
// under it (away from the light), its fill with a little mottle of its own, a thin pale lip on the edges that face
// the light, a soft darker band on the edges away from it, and on big layers an even pale cut edge (the paper core).
// That pair of lip and shadow is what makes a print read as layered paper instead of a flat vector fill. Raster
// based: a part can be anything you can draw (P.layer, or drawnPiece with layered parts).
// ---------------------------------------------------------------------------------------------------------------
const _scr = [];
function scratch(i, W, H) {
  let c = _scr[i];
  if (!c) c = _scr[i] = makeCanvas(W, H);
  else if (c.width !== W || c.height !== H) { c.width = W; c.height = H; }
  const x = c.getContext('2d', { willReadFrequently: true });
  x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1;
  x.shadowColor = 'rgba(0,0,0,0)'; x.shadowBlur = 0; x.shadowOffsetX = 0; x.shadowOffsetY = 0;
  x.clearRect(0, 0, W, H);
  return c;
}
let _felt = null;
/** A tileable mottle of soft light and dark blotches plus short fibres (alpha only): each layer gets its own patch. */
function feltPattern() {
  if (_felt) return _felt;
  const S = 256, r = rng(91), a = tileNoise(S, 9, r), b = tileNoise(S, 24, r), c = makeCanvas(S, S), g = c.getContext('2d');
  const img = g.createImageData(S, S), d = img.data;
  for (let i = 0, p = 0; i < a.length; i++, p += 4) {
    const v = a[i] * 0.6 + b[i] * 0.4 - 0.5, k = Math.min(1, Math.abs(v) * 2.4);
    d[p] = d[p + 1] = d[p + 2] = v > 0 ? 30 : 255; d[p + 3] = Math.round(k * 40);
  }
  g.putImageData(img, 0, 0);
  g.lineCap = 'round';
  for (let i = 0; i < 520; i++) {
    const x = r() * S, y = r() * S, an = r() * Math.PI, l = 3 + r() * 10;
    g.strokeStyle = r() < 0.55 ? 'rgba(255,250,238,0.2)' : 'rgba(40,22,6,0.14)'; g.lineWidth = 0.7 + r() * 0.8;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(an) * l, y + Math.sin(an) * l); g.stroke();
  }
  return (_felt = c);
}
/** Composite part image M (device pixels, print-sized) onto g as one cut-paper layer. Sizes in print pixels. */
function appliquePart(g, M, W, H, o, r) {
  // effects are washes over the part's own pixels (cream for the lip and the cut edge, warm dark for the shade), so a
  // layer can hold parts of several colours (all the leaves of a crown, all the planks of a fence) and every part still
  // gets its own lip and shadow: they come from the layer's alpha, not from its colour
  const ll = Math.hypot(o.light[0], o.light[1]) || 1, lx = o.light[0] / ll, ly = -o.light[1] / ll; // toward the light, y down
  const d = o.depth;
  if (o.felt > 0) {                 // optional mottle of its own (a different patch of the felt for every layer)
    const mg = M.getContext('2d'), pat = mg.createPattern(feltPattern(), 'repeat');
    if (pat.setTransform) pat.setTransform(new DOMMatrix().translateSelf(Math.floor(r() * 256), Math.floor(r() * 256)));
    mg.save(); mg.setTransform(1, 0, 0, 1, 0, 0); mg.globalCompositeOperation = 'source-atop'; mg.globalAlpha = Math.min(1, o.felt);
    mg.fillStyle = pat; mg.fillRect(0, 0, W, H); mg.restore();
  }
  const band = (dx, dy, color) => { // the part minus itself shifted by (dx, dy) = its edges facing (-dx, -dy), tinted
    const E = scratch(1, W, H), eg = E.getContext('2d');
    eg.drawImage(M, 0, 0); eg.globalCompositeOperation = 'destination-out'; eg.drawImage(M, dx, dy);
    eg.globalCompositeOperation = 'source-in'; eg.fillStyle = color; eg.fillRect(0, 0, W, H);
    return E;
  };
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  if (o.shadow > 0) { g.shadowColor = o.shadowColor; g.shadowBlur = d * 1.6 * o.shadow; g.shadowOffsetX = -lx * d * 1.1 * o.shadow; g.shadowOffsetY = -ly * d * 1.1 * o.shadow; }
  g.globalAlpha = o.alpha; g.drawImage(M, 0, 0);
  g.shadowColor = 'rgba(0,0,0,0)'; g.shadowBlur = 0; g.shadowOffsetX = 0; g.shadowOffsetY = 0;
  if (o.shade > 0) {                // a soft darker band on the edges away from the light (two steps instead of a blur)
    const w = d * 1.8 * o.shade;
    g.globalAlpha = o.alpha * 0.16; g.drawImage(band(lx * w, ly * w, o.shadeColor), 0, 0);
    g.globalAlpha = o.alpha * 0.2; g.drawImage(band(lx * w * 0.45, ly * w * 0.45, o.shadeColor), 0, 0);
  }
  if (o.rim > 0) {                  // an even pale cut edge all round (the paper core of a big layer)
    const w = d * 1.15 * o.rim, R = scratch(1, W, H), rg = R.getContext('2d');
    rg.drawImage(M, 0, 0); rg.globalCompositeOperation = 'destination-in';
    for (let k = 0; k < 4; k++) rg.drawImage(M, Math.cos(k * Math.PI / 2 + Math.PI / 4) * w, Math.sin(k * Math.PI / 2 + Math.PI / 4) * w);
    const E = scratch(2, W, H), eg = E.getContext('2d');
    eg.drawImage(M, 0, 0); eg.globalCompositeOperation = 'destination-out'; eg.drawImage(R, 0, 0);
    eg.globalCompositeOperation = 'source-in'; eg.fillStyle = o.rimColor; eg.fillRect(0, 0, W, H);
    g.globalAlpha = o.alpha * 0.85; g.drawImage(E, 0, 0);
  }
  if (o.lip > 0) {                  // a thin pale lip on the edges facing the light
    const w = d * 0.9 * o.lip;
    g.globalAlpha = o.alpha * 0.5; g.drawImage(band(-lx * w, -ly * w, o.lipColor), 0, 0);
  }
  g.restore();
}
function pathOf(pts) { const p = new Path2D(); pts.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y))); p.closePath(); return p; }
/** A canvas fillStyle (hex, rgb() or rgba()) as '#rrggbb'; gradients and patterns fall back to a warm mid tone. */
function colorOf(s) {
  if (typeof s !== 'string') return '#8a7a60';
  if (s[0] === '#') return s.length === 4 ? '#' + [...s.slice(1)].map((ch) => ch + ch).join('') : s.slice(0, 7);
  const m = s.match(/[\d.]+/g); return m ? toHex(m.slice(0, 3).map(Number)) : '#8a7a60';
}

// The tooth in soft-light, computed here rather than by the canvas: a CPU canvas blends soft-light per pixel in
// floats (~70 ns a pixel: about a sixth of a whole build); the same W3C formula through a lookup table is ~10x faster
// and equal to within one level.
let _toothA = null; const _softLUT = new Map();
function softLightLUT(a) {          // [cs << 8 | cb] -> the opaque result of soft-light at alpha a, 8-bit
  let L = _softLUT.get(a); if (L) return L;
  L = new Uint8Array(65536);
  for (let s = 0; s < 256; s++) for (let b = 0; b < 256; b++) L[(s << 8) | b] = Math.round(255 * (a * softLight(b / 255, s / 255) + (1 - a) * (b / 255)));
  _softLUT.set(a, L); return L;
}
function softLight(cb, cs) {
  if (cs <= 0.5) return cb - (1 - 2 * cs) * cb * (1 - cb);
  const d = cb <= 0.25 ? ((16 * cb - 12) * cb + 4) * cb : Math.sqrt(cb);
  return cb + (2 * cs - 1) * (d - cb);
}
function applyTooth(g, W, H, a) {
  const tc = neutralTooth(), S = tc.width;
  if (!_toothA) { const d = tc.getContext('2d').getImageData(0, 0, S, S).data; _toothA = new Uint8Array(S * S); for (let i = 0; i < S * S; i++) _toothA[i] = d[i * 4]; }
  const T = _toothA, L = softLightLUT(a), A = Math.round(a * 255), pow2 = (S & (S - 1)) === 0, mk = S - 1;
  const img = g.getImageData(0, 0, W, H), d = img.data;
  for (let y = 0, p = 0; y < H; y++) {
    const row = (pow2 ? y & mk : y % S) * S;
    for (let x = 0; x < W; x++, p += 4) {
      const al = d[p + 3], cs = T[row + (pow2 ? x & mk : x % S)];
      if (al === 255) { const o = cs << 8; d[p] = L[o | d[p]]; d[p + 1] = L[o | d[p + 1]]; d[p + 2] = L[o | d[p + 2]]; continue; }
      if (al === 0) { d[p] = d[p + 1] = d[p + 2] = cs; d[p + 3] = A; continue; }
      // a part-covered edge pixel: the general separable blend, then source-over (W3C compositing)
      const ab = al / 255, ao = a + ab * (1 - a), s = cs / 255;
      for (let c = 0; c < 3; c++) { const b = d[p + c] / 255, bl = (1 - ab) * s + ab * softLight(b, s); d[p + c] = Math.round(255 * (a * bl + ab * b * (1 - a)) / ao); }
      d[p + 3] = Math.round(255 * ao);
    }
  }
  g.putImageData(img, 0, 0);
}

/** onPrint(fn): fn(ms, widthPx, heightPx) after every print (the 3D harness's printStats() uses it). */
let _onPrint = null;
export function onPrint(fn) { _onPrint = fn; }

export function printCard(pts, { pxPerUnit = 64, scale = 1, sheet = null, seed = 1, paint = null, maxPx = 2048, bleed = null, tooth = 0.45, effects = 1, holes = null } = {}) {
  const t0 = performance.now();
  // effects: 0 = layers print flat (no lip / shadow / shade / cut edge): for pieces the lens blurs anyway (far, near)
  // holes: outlines cut out of the card (a door you walk through, windows, the gaps between rungs or spokes), in shape
  // units and inside the outline; each is cut away at the end and P.rim prints its cut edge like the outline's
  const box = bbox(pts);
  // scale: print finer (a 4K frame: 2) with every pixel-sized detail (blurs, minimum widths, the fibre sheet) scaled
  // too, so the card reads the same, only sharper
  const ppu = Math.min(pxPerUnit * scale, maxPx * scale / Math.max(box.w, box.h));
  const W = Math.max(2, Math.ceil(box.w * ppu)), H = Math.max(2, Math.ceil(box.h * ppu));
  const c = makeCanvas(W, H), g = c.getContext('2d', { willReadFrequently: true }); // CPU raster: many small draws + one upload; far faster than a GPU canvas flushed by readbacks
  const r = rng(seed);
  g.setTransform(ppu, 0, 0, -ppu, -box.x0 * ppu, box.y1 * ppu);
  const px = scale / ppu;   // one reference print pixel in shape units (details sized in px keep their size)
  const U = Math.min(box.w, box.h); // the card's own scale: mark sizes and offsets are fractions of it
  // layer effects (shadow offset, lip, cut edge) are sized in shape units: 0.1 unit (~2 px on screen at the templates'
  // framing, where the hero is ~3.6 units) times the depth multiplier, converted to print pixels
  const depthPx = (k = 1) => Math.max(1.2 * scale, Math.min(16 * scale, 0.1 * ppu * k));
  const P = {
    g, r, box, px, pts, U,
    clip() { g.save(); tracePath(g, pts); g.clip(); },
    unclip() { g.restore(); },
    fill(color) { g.fillStyle = color; g.fillRect(box.x0 - 1, box.y0 - 1, box.w + 2, box.h + 2); },
    /** Vertical (angle 0) or angled two-colour gradient across the card. */
    gradient(c0, c1, angle = 0) {
      const cx = (box.x0 + box.x1) / 2, cy = (box.y0 + box.y1) / 2, L = Math.max(box.w, box.h) / 2;
      const gr = g.createLinearGradient(cx - Math.sin(angle) * L, cy - Math.cos(angle) * L, cx + Math.sin(angle) * L, cy + Math.cos(angle) * L);
      gr.addColorStop(0, c0); gr.addColorStop(1, c1);
      g.fillStyle = gr; g.fillRect(box.x0 - 1, box.y0 - 1, box.w + 2, box.h + 2);
    },
    /** A soft printed shadow inside the outline on the (dx, dy) side (default lower-right), the way illustrators
     *  shade cut shapes lit from the upper left. dx, dy are fractions of the card's smaller side; blurPx is in print
     *  pixels (canvas shadows ignore the transform). */
    innerShade(color, { dx = 0.02, dy = -0.03, blurPx = 10, alpha = 0.5 } = {}) {
      g.save();
      g.shadowColor = rgba(color, alpha);
      g.shadowBlur = blurPx * scale;
      g.shadowOffsetX = -dx * U * ppu; g.shadowOffsetY = dy * U * ppu;
      g.beginPath();
      g.rect(box.x0 - box.w, box.y0 - box.h, box.w * 3, box.h * 3);
      for (let i = pts.length - 1; i >= 0; i--) (i === pts.length - 1 ? g.moveTo : g.lineTo).call(g, pts[i][0], pts[i][1]);
      g.closePath();
      g.fillStyle = '#000';
      g.fill('evenodd');
      g.restore();
    },
    /** Pattern marks, clipped. Organic: 'leaf' | 'dab' | 'dot' | 'tick' | 'scallop' | 'scale' | 'wave' | 'hatch'.
     *  Built: 'brick' | 'panel' (grooved plates) | 'rivet' | 'stripe' | 'window' (lit grid; `lit` share, `dark` colour).
     *  size is a FRACTION of the card's smaller side (0.03-0.12 typical); width is a stroke width in print pixels;
     *  light = highlight / lip colour for scale, rivet, panel. */
    marks(kind, { color = '#000', alpha = 0.5, size: sizeRel = 0.06, units = false, density = 1, angle = 0, region = box, width = 1.2, light = 'rgba(255,248,232,0.55)', lit = 0.7, dark = null } = {}) {
      const size = Math.max(units ? sizeRel : sizeRel * U, 2 * px); // units: true = size in shape units (big cards)
      // every mark of one style goes into ONE path that is filled / stroked once (overlaps read as one ink layer)
      const F = new Path2D(), S = new Path2D(), LF = new Path2D(), LS = new Path2D(), DF = new Path2D();
      const arcP = (P2d, x, y, rad, a0 = 0, a1 = Math.PI * 2, ccw = false) => { P2d.moveTo(x + Math.cos(a0) * rad, y + Math.sin(a0) * rad); P2d.arc(x, y, rad, a0, a1, ccw); };
      const { x0, y0, x1, y1 } = region;
      if (['hatch', 'tick', 'wave', 'scallop', 'brick', 'scale', 'panel', 'rivet', 'stripe', 'window'].includes(kind)) {
        const gap = size * 1.6 / density;
        let row = 0;
        for (let y = y0 + gap * 0.5; y < y1 + gap; y += gap, row++) {
          const off = kind === 'panel' || kind === 'window' ? 0 : (row % 2) * gap * 0.5;
          if (kind === 'hatch') { S.moveTo(x0 - 1, y); S.lineTo(x1 + 1, y + Math.tan(angle) * (x1 - x0 + 2)); }
          else if (kind === 'stripe') F.rect(x0 - 1, y, x1 - x0 + 2, gap * 0.38);
          else for (let x = x0 - gap + off; x < x1 + gap; x += gap) {
            const jx = (r() - 0.5) * gap * 0.3, jy = (r() - 0.5) * gap * 0.25;
            if (kind === 'tick') { S.moveTo(x + jx, y + jy); S.lineTo(x + jx + size * 0.15, y + jy + size); }
            else if (kind === 'wave') arcP(S, x + jx, y, size * 0.6, Math.PI * 0.15, Math.PI * 0.85);
            else if (kind === 'scallop') arcP(S, x, y, gap * 0.52, Math.PI, 0, true);
            else if (kind === 'scale') { arcP(F, x, y, gap * 0.56, Math.PI, 0, true); arcP(LS, x, y + gap * 0.08, gap * 0.42, Math.PI * 0.85, Math.PI * 0.15, true); }
            else if (kind === 'panel') {
              S.rect(x, y, gap * 0.96, gap * 0.9);
              LS.moveTo(x + width * px * 1.5, y + gap * 0.9 - width * px * 1.5); LS.lineTo(x + width * px * 1.5, y + width * px * 1.5); LS.lineTo(x + gap * 0.96, y + width * px * 1.5);
            } else if (kind === 'rivet') { arcP(F, x, y, size * 0.16); arcP(LF, x - size * 0.05, y + size * 0.05, size * 0.065); }
            else if (kind === 'window') (r() < lit ? F : DF).rect(x + gap * 0.25, y + gap * 0.15, gap * 0.5, gap * 0.62);
            else S.rect(x, y, gap * 0.92, gap * 0.42); // brick
          }
        }
      } else {
        const n = Math.round(((x1 - x0) * (y1 - y0)) / (size * size) * 0.55 * density);
        for (let i = 0; i < n; i++) {
          const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), a = angle + (r() - 0.5) * 1.6, s = size * (0.6 + r() * 0.7);
          if (kind === 'leaf') { F.moveTo(x + Math.cos(a) * s * 0.5, y + Math.sin(a) * s * 0.5); F.ellipse(x, y, s * 0.5, s * 0.2, a, 0, Math.PI * 2); }
          else if (kind === 'dab') { F.moveTo(x + Math.cos(a) * s * 0.35, y + Math.sin(a) * s * 0.35); F.ellipse(x, y, s * 0.35, s * 0.28, a, 0, Math.PI * 2); }
          else arcP(F, x, y, s * 0.12);
        }
      }
      g.save();
      g.globalAlpha = alpha; g.lineCap = 'round'; g.lineWidth = width * px;
      g.fillStyle = color; g.fill(F);
      g.strokeStyle = color; g.stroke(S);
      if (kind === 'window') { g.fillStyle = dark || shade(color, -0.6); g.fill(DF); }
      g.fillStyle = light; g.fill(LF);
      g.strokeStyle = light; g.lineWidth = width * (kind === 'scale' ? 1.5 : 1) * px; g.stroke(LS);
      g.restore();
    },
    /** Any extra drawing in shape units: P.draw(g => { ... }). Flat print: no layer effects. */
    draw(fn) { g.save(); fn(g, P); g.restore(); },
    /**
     * One cut-paper layer laid on the print (see "applique" above). shape: a Path2D or an outline [[x, y], ...] in
     * shape units filled with `color`, or a function (g, P) that FILLS the part itself (several fills, transforms,
     * gradients, several colours: all of it becomes ONE layer, and every separate part in it still gets its own lip and
     * shadow, so batch non-overlapping parts: all the leaves of a crown, all the planks of a fence). Options (multipliers,
     * 0 = off): shadow (short soft warm shadow on what lies below), lip (pale highlight on the lit edges), shade (darker
     * band on the far edges), rim (even pale cut edge all round: big layers such as pine tiers, shingle rows, bands),
     * felt (the layer's own mottle, opt-in); depth = effect size, 1 = 0.1 shape units (about 2 px on screen at the templates' framing); light = toward the key.
     */
    layer(shape, color = '#000', { shadow = 1, lip = 1, shade = 1, rim = 0, felt = 0, depth = 1, alpha = 1, light = [-0.55, 0.83],
      shadowColor = null, lipColor = null, shadeColor = null, rimColor = null } = {}) {
      const M = scratch(0, W, H), mg = M.getContext('2d', { willReadFrequently: true });
      mg.setTransform(ppu, 0, 0, -ppu, -box.x0 * ppu, box.y1 * ppu);
      mg.fillStyle = color; mg.strokeStyle = color; mg.lineCap = 'round'; mg.lineJoin = 'round';
      if (typeof shape === 'function') shape(mg, P);
      else mg.fill(shape instanceof Path2D ? shape : pathOf(shape));
      if (!effects) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = alpha; g.drawImage(M, 0, 0); g.restore(); return; }
      appliquePart(g, M, W, H, {
        shadow, lip, shade, rim, felt, depth: depthPx(depth), alpha, light,
        shadowColor: shadowColor || 'rgba(58,30,10,0.42)', lipColor: lipColor || '#fff3d8',
        shadeColor: shadeColor || '#2e1608', rimColor: rimColor || '#f5e4c0',
      }, r);
    },
    /**
     * Draw a piece part by part, back to front: every fill (fill, fillRect) becomes its own cut-paper layer (P.layer
     * effects, colours from the part's fillStyle); strokes, text and images print flat. fn(g, ink): ink(colour) returns
     * the colour for a layered part, ink(colour, 'print') for a flat printed detail (eyes, stripes, tiny dots).
     * opts: P.layer options for every part.
     */
    parts(fn, opts = {}) {
      const M = scratch(0, W, H), mg = M.getContext('2d', { willReadFrequently: true });
      mg.setTransform(ppu, 0, 0, -ppu, -box.x0 * ppu, box.y1 * ppu);
      mg.lineCap = 'round'; mg.lineJoin = 'round';
      let mode = 'layer';
      const o = { shadow: 1, lip: 1, shade: 1, rim: 0, felt: 0, alpha: 1, light: [-0.55, 0.83], shadowColor: 'rgba(58,30,10,0.42)',
        lipColor: '#fff3d8', shadeColor: '#2e1608', rimColor: '#f5e4c0', ...opts }; o.depth = depthPx(opts.depth ?? 1);
      const flush = (kind) => {
        if (kind === 'layer' && effects) appliquePart(g, M, W, H, o, r);
        else { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(M, 0, 0); g.restore(); }
        mg.save(); mg.setTransform(1, 0, 0, 1, 0, 0); mg.clearRect(0, 0, W, H); mg.restore();
      };
      const proxy = new Proxy(mg, {
        get(t, k) {
          if (k === 'fill' || k === 'fillRect') return (...a) => { t[k](...a); flush(mode); };
          if (k === 'stroke' || k === 'strokeRect' || k === 'fillText' || k === 'drawImage') return (...a) => { t[k](...a); flush('print'); };
          const v = t[k]; return typeof v === 'function' ? v.bind(t) : v;
        },
        set(t, k, v) { t[k] = v; return true; },
      });
      fn(proxy, (c, how) => { mode = how === 'print' ? 'print' : 'layer'; return c; });
    },
    /** Overlay the felt mottle on everything printed so far (the base sheet of a piece: crowns, walls, bodies). */
    felt(amount = 0.6) {   // quiet by default: the shipped grain is low-amplitude (plush felt and weaves read as cloth)
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-atop'; g.globalAlpha = Math.min(1, amount);
      const pat = g.createPattern(feltPattern(), 'repeat');
      if (pat.setTransform) pat.setTransform(new DOMMatrix().translateSelf(Math.floor(r() * 256), Math.floor(r() * 256)));
      g.fillStyle = pat; g.fillRect(0, 0, W, H); g.restore();
    },
    /** Mark parts of the print as lit (windows, lamps, screens): draw them in white (brightness = glow) into a
     *  separate emissive canvas, in shape units. makeCard turns it into an emissive map you can switch at runtime. */
    glow(fn) {
      if (!P.glowCanvas) { P.glowCanvas = makeCanvas(W, H); const gc = P.glowCanvas.getContext('2d'); gc.fillStyle = '#000'; gc.fillRect(0, 0, W, H); }
      const gc = P.glowCanvas.getContext('2d');
      gc.save(); gc.setTransform(ppu, 0, 0, -ppu, -box.x0 * ppu, box.y1 * ppu); gc.fillStyle = gc.strokeStyle = '#fff'; fn(gc, P); gc.restore();
    },
    /**
     * The cut edge as it reads in the shipped frames: a thin dark-brown line right at the silhouette (the card's
     * thickness and printed outline, ~1.5-2.5 px on screen) and a pale highlight just inside it ONLY on the edges that
     * face the light (upper left by default), fading to nothing on the shaded side. Never an even band all round
     * (that reads as an outline effect or a sticker), never white, never torn. width = the pale band at its widest, in
     * SHAPE units (~1.5 % of the piece's height); light = direction toward the key in shape space (y up).
     */
    rim({ width = 0.016 * box.h, color = 'auto', dark = 'auto', darkWidth = null, light = [-0.55, 0.83], wobble = 0.25, alpha = 1, skip = null } = {}) {
      // skip(x0, y0, x1, y1) -> true for outline segments that are FOLDS, not cuts (the hinge base, panel joins)
      if (color === 'auto' || dark === 'auto') {
        const s8 = makeCanvas(4, 4), sg = s8.getContext('2d', { willReadFrequently: true });
        sg.drawImage(c, 0, 0, 4, 4);
        const d = sg.getImageData(0, 0, 4, 4).data; let sr = 0, sgg = 0, sb = 0, sa = 0;
        for (let i = 0; i < d.length; i += 4) { const a = d[i + 3] / 255; sr += d[i] * a; sgg += d[i + 1] * a; sb += d[i + 2] * a; sa += a; }
        const mean = toHex(sa > 0 ? [sr / sa, sgg / sa, sb / sa] : [200, 190, 170]);
        if (color === 'auto') color = mix(mean, '#fff3d6', 0.78);       // the paper core: a light warm tone of the print
        if (dark === 'auto') dark = mix(shade(mean, -0.55), '#4a2812', 0.5); // a warm brown ink line, never near-black
      }
      const ll = Math.hypot(light[0], light[1]) || 1, lx = light[0] / ll, ly = light[1] / ll;
      const nz = edgeNoise(r, 61);
      g.save(); g.globalAlpha = alpha; g.fillStyle = color;
      const discs = new Path2D();
      let s = 0;
      // every cut: the outline, and each hole (the card lies OUTSIDE a hole, so the hole's edges face into it: with the
      // key at the upper left its lower and right edges catch the light)
      const cuts = [[pts, 1, skip], ...(holes || []).map((h) => [h, -1, null])];
      for (const [poly, side, sk] of cuts) {
        let area = 0;                     // orientation, so we know which side of each segment is off the card
        for (let i = 0; i < poly.length; i++) { const [x0, y0] = poly[i], [x1, y1] = poly[(i + 1) % poly.length]; area += x0 * y1 - x1 * y0; }
        const sgn = (area >= 0 ? 1 : -1) * side;
        for (let i = 0; i < poly.length; i++) {
          const [x0, y0] = poly[i], [x1, y1] = poly[(i + 1) % poly.length];
          const len = Math.hypot(x1 - x0, y1 - y0); if (len < 1e-9) continue;
          if (sk && sk(x0, y0, x1, y1)) { s += len; continue; }
          const nx = sgn * (y1 - y0) / len, ny = -sgn * (x1 - x0) / len;     // normal pointing off the card
          const facing = Math.max(0, nx * lx + ny * ly);
          const n = Math.max(1, Math.ceil(len / (width * 0.45)));
          for (let j = 0; j < n; j++) {
            const t = j / n, w = width * (0.08 + 1.3 * facing) * (1 + wobble * nz(s / width * 0.35));
            if (w > px * 0.6) { const cx = x0 + (x1 - x0) * t, cy = y0 + (y1 - y0) * t; discs.moveTo(cx + w, cy); discs.arc(cx, cy, w, 0, Math.PI * 2); }
            s += len / n;
          }
        }
      }
      g.fill(discs);
      // the dark cut line at every cut (half of the stroke is cut away off the card), broken at folds
      g.strokeStyle = dark; g.globalAlpha = alpha * 0.9; g.lineJoin = 'round';
      g.lineWidth = 2 * (darkWidth ?? Math.max(width * 0.42, 1.3 * px));
      for (const [poly, , sk] of cuts) {
        if (sk) {
          g.beginPath(); let open = false;
          for (let i = 0; i < poly.length; i++) {
            const [x0, y0] = poly[i], [x1, y1] = poly[(i + 1) % poly.length];
            if (sk(x0, y0, x1, y1)) { open = false; continue; }
            if (!open) { g.moveTo(x0, y0); open = true; }
            g.lineTo(x1, y1);
          }
          g.lineCap = 'round';
        } else tracePath(g, poly);
        g.stroke();
      }
      g.restore();
    },
    /** Optional faint ink key line just inside the cut (off by default in this style; use for busy grounds only). */
    outline(color, { widthPx = 1.4, misregPx = [0.8, -0.6], alpha = 0.35 } = {}) {
      g.save();
      g.translate(misregPx[0] * px, -misregPx[1] * px);
      tracePath(g, pts);
      g.strokeStyle = rgba(color, alpha);
      g.lineWidth = widthPx * 2 * px; // half of it is clipped away
      g.lineJoin = 'round';
      g.stroke();
      g.restore();
    },
    /** Multiply the paper sheet over the print so fibres show through the ink. */
    paper(sh = sheet, strength = 1) {
      if (!sh) return;
      g.save();
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.globalCompositeOperation = 'multiply';
      g.globalAlpha = strength;
      const pat = g.createPattern(sh, 'repeat');
      if (scale !== 1 && pat.setTransform) pat.setTransform(new DOMMatrix().scale(scale));   // the fibre keeps its size on the card
      g.fillStyle = pat;
      g.fillRect(0, 0, W, H);
      g.restore();
    },
  };
  // base: the card itself, then the user's print, then the paper showing through, then cut away outside
  P.clip();
  if (paint) paint(P); else P.fill('#efe6d2');
  P.unclip();
  P.paper(sheet, 1);
  if (tooth > 0) applyTooth(g, W, H, Math.min(1, tooth)); // multiply barely marks dark ink: a neutral (mean grey) tooth in soft-light keeps dark card papery
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'destination-in';
  g.setTransform(ppu, 0, 0, -ppu, -box.x0 * ppu, box.y1 * ppu);
  tracePath(g, pts);
  g.fillStyle = '#000';
  g.fill();
  if (holes && holes.length) { g.globalCompositeOperation = 'destination-out'; for (const h of holes) { tracePath(g, h); g.fill(); } }
  g.restore();
  // mean colour of the printed area (for card sides, shadows, palette checks)
  const m = makeCanvas(8, 8), mg = m.getContext('2d', { willReadFrequently: true });
  mg.drawImage(c, 0, 0, 8, 8);
  const md = mg.getImageData(0, 0, 8, 8).data;
  let sr = 0, sg = 0, sb = 0, sa = 0;
  for (let i = 0; i < md.length; i += 4) { const a = md[i + 3] / 255; sr += md[i] * a; sg += md[i + 1] * a; sb += md[i + 2] * a; sa += a; }
  const mean = sa > 0 ? toHex([sr / sa, sg / sa, sb / sa]) : '#cbb89a';
  // bleed: for cards cut by GEOMETRY, fill outside the cut with a colour so mipmaps never pull in transparent black
  if (bleed) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'destination-over'; g.fillStyle = bleed; g.fillRect(0, 0, W, H); g.restore(); }
  if (_onPrint) _onPrint(performance.now() - t0, W, H);
  return { canvas: c, box, pxPerUnit: ppu, mean, glow: P.glowCanvas || null };
}


/** Fill a fat almond leaf (or blade, petal, flame, feather) growing from its base (x, y) along angle a, length L;
 *  wf = half-width factor (0.3 = a leaf about 0.45 L wide, 0.18 = a grass blade). Shape units, one fill. */
export function fillLeaf(g, x, y, L, a, wf = 0.3) {
  const c = Math.cos(a), s = Math.sin(a), w = L * wf, tx = x + c * L, ty = y + s * L;
  g.beginPath(); g.moveTo(x, y);
  g.bezierCurveTo(x + c * L * 0.22 - s * w, y + s * L * 0.22 + c * w, x + c * L * 0.68 - s * w * 0.9, y + s * L * 0.68 + c * w * 0.9, tx, ty);
  g.bezierCurveTo(x + c * L * 0.68 + s * w * 0.9, y + s * L * 0.68 - c * w * 0.9, x + c * L * 0.22 + s * w, y + s * L * 0.22 - c * w, x, y);
  g.fill();
}

/** Fill a tapered limb (trunk, branch, stem, tentacle, pipe, horn) along a quadratic curve from (x0, y0) through the
 *  control (cx, cy) to (x1, y1); w0 / w1 = width at the start / end; round tip. Shape units, separate fills (a raster
 *  union, so overlapping limbs never cancel). Returns the point at t = 0.5 and the end direction. */
export function fillLimb(g, x0, y0, cx, cy, x1, y1, w0, w1, n = 16) {
  const L = [], R = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, mt = 1 - t;
    const x = mt * mt * x0 + 2 * mt * t * cx + t * t * x1, y = mt * mt * y0 + 2 * mt * t * cy + t * t * y1;
    const dx = 2 * mt * (cx - x0) + 2 * t * (x1 - cx), dy = 2 * mt * (cy - y0) + 2 * t * (y1 - cy), dl = Math.hypot(dx, dy) || 1;
    const w = (w0 + (w1 - w0) * t) / 2;
    L.push([x - dy / dl * w, y + dx / dl * w]); R.push([x + dy / dl * w, y - dx / dl * w]);
  }
  g.beginPath(); L.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  for (let i = R.length - 1; i >= 0; i--) g.lineTo(R[i][0], R[i][1]);
  g.closePath(); g.fill();
  g.beginPath(); g.arc(x1, y1, Math.max(w1 / 2, 1e-4), 0, Math.PI * 2); g.fill();
}
/** Point on the quadratic curve used by fillLimb. */
export function limbPoint(x0, y0, cx, cy, x1, y1, t) { const mt = 1 - t; return [mt * mt * x0 + 2 * mt * t * cx + t * t * x1, mt * mt * y0 + 2 * mt * t * cy + t * t * y1]; }

/** Horizontal extent [xmin, xmax] of a closed outline at height y (null if the line misses it). */
export function spanAt(pts, y) {
  let a = Infinity, b = -Infinity;
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length];
    if (y0 !== y1 && (y0 - y) * (y1 - y) <= 0) { const x = x0 + (x1 - x0) * (y - y0) / (y1 - y0); a = Math.min(a, x); b = Math.max(b, x); }
  }
  return a <= b ? [a, b] : null;
}

/**
 * Two contrasting accent colours for printed details on a base colour: every piece in this style carries accents that
 * are NOT shades of its own colour. These pairs are one world's defaults (red + dark olive on orange and on green):
 * pass your spec's accents (colors.accents) for your subject.
 */
export function accentsFor(base) {
  const [r, g, b] = toRGB(base), mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  let h = 0;
  if (mx !== mn) { const d = mx - mn; h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h = (h * 60 + 360) % 360; }
  if (mx - mn < 20) return ['#c8452d', '#5f7a4a'];             // neutrals (stone, paper): terracotta + sage
  if (h < 50 || h >= 330) return ['#a82c1c', '#5e6a32'];        // orange / red: deep red + dark olive
  if (h < 75) return ['#c8452d', '#4f6e45'];                     // ochre / yellow: terracotta + green
  if (h < 170) return ['#d4482c', '#5a6a2c'];                    // greens / olive: red + dark olive
  if (h < 260) return ['#f2e3c0', '#e0973a'];                    // teal / blue: cream + amber
  return ['#f2e3c0', '#e0b04a'];                                 // violet / pink: cream + gold
}

/** Tier tips of a stacked outline (pines, pagodas, layered cakes): [halfWidth, y] where the half-width peaks, bottom up. */
export function tierTips(pts, box, n = 140) {
  const ys = [], xs = [];
  for (let i = 0; i <= n; i++) { const y = box.y0 + box.h * (0.02 + 0.96 * i / n), s = spanAt(pts, y); ys.push(y); xs.push(s ? (s[1] - s[0]) / 2 : 0); }
  const out = [], win = Math.max(2, Math.round(n * 0.05));
  for (let i = 1; i < n; i++) {
    let ok = xs[i] > box.w * 0.12;
    for (let k = -win; k <= win && ok; k++) if (k && i + k >= 0 && i + k <= n && xs[i + k] > xs[i] + 1e-9) ok = false;
    if (ok && (!out.length || ys[i] - out[out.length - 1][1] > box.h * 0.08)) out.push([xs[i], ys[i]]);
  }
  return out;
}

/** One world's folk motifs (the countryside example's), an example set: write your subject's own. In shape units: a sprig (stem with
 *  paired leaves), a berry cluster, a five-petal flower with a dotted centre. Sizes are absolute (pass U fractions). */
export const motif = {
  sprig(g, x, y, len, ang, color, r) {
    g.save(); g.translate(x, y); g.rotate(ang); g.strokeStyle = g.fillStyle = color; g.lineCap = 'round'; g.lineWidth = len * 0.07;
    g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(len * 0.12, len * 0.5, 0, len); g.stroke();
    for (let k = 1; k <= 4; k++) for (const sd of [-1, 1]) {
      const t = k / 5, lx = len * 0.06 * Math.sin(t * Math.PI), ly = len * t;
      fillLeaf(g, lx, ly, len * 0.26 * (1 - t * 0.35), Math.PI / 2 - sd * 0.95, 0.3);
    }
    fillLeaf(g, 0, len * 0.96, len * 0.2, Math.PI / 2, 0.3);
    g.restore();
  },
  berries(g, x, y, rad, color, r) {
    for (let k = 0; k < 3 + Math.floor(r() * 3); k++) {
      const a = r() * Math.PI * 2, d = rad * 1.3 * Math.sqrt(r());
      g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, rad, 0, Math.PI * 2); g.fill();
    }
  },
  flower(g, x, y, rad, petal, centre) {
    if (petal) g.fillStyle = petal;
    for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2 + 0.3; g.beginPath(); g.arc(x + Math.cos(a) * rad * 0.55, y + Math.sin(a) * rad * 0.55, rad * 0.48, 0, Math.PI * 2); g.fill(); }
    if (centre) {
      g.fillStyle = centre; g.beginPath(); g.arc(x, y, rad * 0.32, 0, Math.PI * 2); g.fill();
      g.fillStyle = mix(centre, '#2a1608', 0.5);
      for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; g.beginPath(); g.arc(x + Math.cos(a) * rad * 0.2, y + Math.sin(a) * rad * 0.2, rad * 0.06, 0, Math.PI * 2); g.fill(); }
    }
  },
};

/** Scalloped shingle tiles over a region (roofs, towers, awnings, fish, dragons): rows laid from the eave up, each row
 *  ONE cut layer whose scalloped lower edge overlaps the row below with a pale cut edge and a short shadow; three tones
 *  mixed in every row. */
export function scallopTiles(P, region, { color, rows = 5 } = {}) {
  const { r } = P, rh = (region.y1 - region.y0) / rows, n = Math.max(3, Math.round((region.x1 - region.x0) / (rh * 1.3)));
  const tw = (region.x1 - region.x0) / n, tones = [color, shade(color, -0.14), shade(color, 0.1)], rad = tw / 2;
  for (let k = 0; k < rows; k++) {
    const yb = region.y0 + k * rh, off = (k % 2) * tw * 0.5;
    P.layer((g) => {
      for (let i = -1; i <= n; i++) {
        const x = region.x0 + i * tw + off;
        g.fillStyle = tones[Math.floor(r() * 3)];
        g.beginPath(); g.moveTo(x, region.y1 + rh); g.lineTo(x, yb + rad * 0.8);
        g.arc(x + rad, yb + rad * 0.8, rad, Math.PI, Math.PI * 2, false);
        g.lineTo(x + tw, region.y1 + rh); g.closePath(); g.fill();
      }
    }, color, { rim: 0.85, lip: 0.5, shade: 0.5, depth: 0.83 });
  }
}

/**
 * Trace the outer outline of whatever `draw(g)` fills (in units, y up, base on y = 0) into a cut polygon.
 * Draw a UNION of chunky primitives (ellipses, circles, rounded rects, polygons): the result is one die-cut outline.
 * res = trace pixels per unit; simplify = tolerance in trace pixels. Example:
 *   const fox = shape.fromDrawing((g) => { ell(g, 0, 0.5, 0.6, 0.35); circle(g, 0.55, 0.95, 0.22); ... }, { w: 1.6, h: 1.4 });
 */
export function fromDrawing(draw, { w = 2, h = 2, res = 80, simplify = 0.8, name = '' } = {}) {
  const pad = 2, W = Math.ceil(w * res) + pad * 2, H = Math.ceil(h * res) + pad * 2;
  const c = makeCanvas(W, H), g = c.getContext('2d', { willReadFrequently: true });
  g.setTransform(res, 0, 0, -res, pad + (w / 2) * res, H - pad);
  g.fillStyle = '#000';
  draw(g);
  const d = g.getImageData(0, 0, W, H).data, inside = (x, y) => x >= 0 && y >= 0 && x < W && y < H && d[(y * W + x) * 4 + 3] > 127;
  // one cut = one connected piece: label the parts, keep the LARGEST (a stray puff or a loose leg must never cost the
  // body), warn with the drawing's name and the dropped share; overlap the parts, or make them separate cards
  const lab = new Int32Array(W * H); let best = 0, bestN = 0, all = 0, nLab = 0, sx = -1, sy = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!inside(x, y) || lab[y * W + x]) continue;
    nLab++; let n = 0, top = y * W + x; const stack = [top]; lab[top] = nLab;
    while (stack.length) {
      const p = stack.pop(), px = p % W, py = (p - px) / W; n++;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]) {
        const nx = px + dx, ny = py + dy, q = ny * W + nx;
        if (inside(nx, ny) && !lab[q]) { lab[q] = nLab; stack.push(q); if (q < top) top = q; }
      }
    }
    all += n;
    if (n > bestN) { bestN = n; best = nLab; sx = top % W; sy = (top - sx) / W; }
  }
  if (sx < 0) return [];
  { // a drawing that runs off its w x h box is cut off silently: say so
    let edge = 0;
    for (let i = 0; i < W; i++) edge += (inside(i, 0) ? 1 : 0) + (inside(i, H - 1) ? 1 : 0);
    for (let j = 0; j < H; j++) edge += (inside(0, j) ? 1 : 0) + (inside(W - 1, j) ? 1 : 0);
    if (edge > (W + H) * 0.02) console.warn(`papercraft fromDrawing${name ? ' "' + name + '"' : ''} (${w} x ${h}): the drawing runs off its box and is cut there: give it a bigger w / h`);
  }
  if (all - bestN > all * 0.01) console.warn(`papercraft fromDrawing${name ? ' "' + name + '"' : ''} (${w} x ${h}): ${nLab} separate parts; ${Math.round((1 - bestN / all) * 100)} % of the filled area was dropped, the largest part kept (overlap the parts, or cut them as separate cards)`);
  // Moore-neighbour boundary tracing (clockwise in image space)
  const N = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  const out = [[sx, sy]];
  let cx = sx, cy = sy, dir = 7, guard = W * H * 4;
  const mine = (x, y) => inside(x, y) && lab[y * W + x] === best;
  do {
    let found = false;
    for (let k = 0; k < 8; k++) {
      const nd = (dir + 6 + k) % 8, nx = cx + N[nd][0], ny = cy + N[nd][1];
      if (mine(nx, ny)) { cx = nx; cy = ny; dir = nd; found = true; break; }
    }
    if (!found) break;
    out.push([cx, cy]);
  } while ((cx !== sx || cy !== sy) && --guard > 0);
  // Ramer-Douglas-Peucker simplification
  const rdp = (pts, e) => {
    if (pts.length < 3) return pts;
    let dmax = 0, idx = 0; const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1], L = Math.hypot(bx - ax, by - ay) || 1;
    for (let i = 1; i < pts.length - 1; i++) { const dd = Math.abs((bx - ax) * (ay - pts[i][1]) - (ax - pts[i][0]) * (by - ay)) / L; if (dd > dmax) { dmax = dd; idx = i; } }
    return dmax > e ? [...rdp(pts.slice(0, idx + 1), e).slice(0, -1), ...rdp(pts.slice(idx), e)] : [pts[0], pts[pts.length - 1]];
  };
  // a closed loop starts and ends on the same pixel: split it at the point farthest from the start, simplify both halves
  let far = 0, fd = -1;
  for (let i = 0; i < out.length; i++) { const dd = (out[i][0] - sx) ** 2 + (out[i][1] - sy) ** 2; if (dd > fd) { fd = dd; far = i; } }
  const simp = [...rdp(out.slice(0, far + 1), simplify).slice(0, -1), ...rdp(out.slice(far), simplify)];
  return simp.slice(0, -1).map(([x, y]) => [(x + 0.5 - pad) / res - w / 2, (H - pad - (y + 0.5)) / res]).map(([x, y]) => [x, Math.abs(y) < 1.5 / res ? 0 : y]);
}

/**
 * One drawing, cut AND printed (props, animals, tents, vehicles, characters, machines): draw(g, ink) fills every part,
 * back to front, asking ink('#hex') for the part's colour. The cut traces it with every part in black; the print draws
 * it again with the real colours, every fill as its own cut-paper layer (lip + short shadow: the shipped collage look);
 * ink('#hex', 'print') marks a flat printed detail (eyes, stripes, tiny dots). Then speckle and a soft inner shade
 * (finish: false to add your own). Parts must touch or overlap (one cut). Returns [pts, paint] for makeCard / printCard.
 */
export function drawnPiece(draw, { w = 2, h = 2, res = 80, simplify = 0.8, finish = true, layered = true, layer = {}, name = '' } = {}) {
  // layered (default): every fill is its own cut-paper layer (P.parts): draw back to front; ink(c, 'print') = flat detail
  const pts = fromDrawing((g) => draw(g, (c, how) => (how === 'print' ? 'rgba(0,0,0,0)' : '#000')), { w, h, res, simplify, name }); // print details never change the cut
  const paint = (P) => {
    if (layered) P.parts((g, ink) => draw(g, ink), layer); else P.draw((g) => draw(g, (c) => c));
    if (finish) { P.marks('dot', { color: '#2a1608', alpha: 0.12, size: 0.025, density: 0.4 }); P.innerShade('#3a2010', { alpha: 0.3, blurPx: 8 }); }
  };
  return [pts, paint];
}

/**
 * A smooth route through control points [[x, z], ...] (Catmull-Rom), for paths, rivers, roads, rails and walls that
 * run in ANY direction (x = f(z) helpers cannot turn back or cross the frame). Returns { pts, dist(x, z) }: print it
 * through pts as torn paper (a pale fibrous fringe, both edges jittered, never a smooth stroke: references/structures.md
 * section 6) and use dist() to keep pieces off it (one spec drives print and placement).
 */
export function pathLine(ctrl, { step = 0.5 } = {}) {
  const P = [];
  for (let i = 0; i < ctrl.length - 1; i++) {
    const p0 = ctrl[Math.max(0, i - 1)], p1 = ctrl[i], p2 = ctrl[i + 1], p3 = ctrl[Math.min(ctrl.length - 1, i + 2)];
    const n = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      P.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (p2[j] - p0[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (3 * p1[j] - p0[j] - 3 * p2[j] + p3[j]) * t3)));
    }
  }
  P.push(ctrl[ctrl.length - 1].slice());
  const dist = (x, z) => {
    let d = Infinity;
    for (let i = 0; i < P.length - 1; i++) {
      const [ax, az] = P[i], vx = P[i + 1][0] - ax, vz = P[i + 1][1] - az, L2 = vx * vx + vz * vz || 1e-9;
      const t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / L2));
      d = Math.min(d, Math.hypot(x - ax - vx * t, z - az - vz * t));
    }
    return d;
  };
  return { pts: P, dist };
}

/** Primitive helpers for fromDrawing (units, y up). */
export const draw2 = {
  ell(g, x, y, rx, ry, rot = 0) { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); g.fill(); },
  rect(g, x, y, w, h, rr = 0) { g.beginPath(); if (g.roundRect && rr > 0) g.roundRect(x, y, w, h, rr); else g.rect(x, y, w, h); g.fill(); },
  poly(g, pts) { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); },
};

// ---------------------------------------------------------------------------------------------------------------
// built ground in a pitched 2D view: decks (boardwalks, platforms, piers, bridge decks, terrace tops) are surfaces
// drawn through the scene's own projection, never flat cards standing on the water
// ---------------------------------------------------------------------------------------------------------------

/**
 * Draw a raised deck in a pitched 2D view: its print mapped through the scene's projection in narrow strips along x,
 * so an arched deck bends and every strip keeps the perspective. proj(x, y, z) -> [sx, sy] (screen px, y up in the
 * world, z toward the viewer). The deck spans x0..x1 and z0 (far) .. z1 (near); heightAt(x) its height (a constant,
 * or an arch along x), times rise (0 = lying on the page, 1 = up: tie it to the deck's face or side cards' spring).
 * print: a printCard canvas whose width runs along x and whose TOP row is the far edge, e.g.
 *   printCard(shape.rect(x1 - x0, z1 - z0), { paint: yourPlanks, sheet }).canvas   (planks running across the deck)
 * (planks across the deck). Each strip is darkened by how much it turns from the key (light = toward the key in the
 * x-y plane). edge: the deck's near fascia (its thickness, in world units) drawn as a darker band, 0 = none (a
 * near rail or face card covers it). Call it in the depth-sorted pass keyed at the deck's FAR edge (z0): after the
 * cards behind it, before the cards standing on it and the near rail.
 */
export function drawDeck2D(g, proj, { print, x0, x1, z0, z1, heightAt = () => 0, rise = 1, shift = 0, strips = 32, light = [-0.6, 0.8], edge = 0.18, edgeColor = '#5a3418', shadeColor = '#2a1608', along = 'x' } = {}) {
  // rise, shift: a deck riding a card that tips forward by phi (0 standing, PI/2 flat toward the viewer) sits at
  // h cos(phi) and h sin(phi) nearer: pass rise = cos(phi), shift = sin(phi) and it stays on the card it hangs on
  // along: 'x' = the deck runs across the view (strips along x, heightAt(x), the print's top row is the far edge);
  // 'z' = it runs into the depth (strips along z from far to near, heightAt(z), the print's top row is the far end).
  // A deck into the depth that stands higher than what is beside it is keyed at its NEAR edge in the draw order.
  const W = print.width, H = print.height, ll = Math.hypot(light[0], light[1]) || 1;
  const full = (u) => (typeof heightAt === 'function' ? heightAt(u) : heightAt), hAt = (u) => full(u) * rise, dz = (u) => full(u) * shift;
  g.save();
  if (along === 'z') {
    const sh = H / strips;
    for (let i = 0; i < strips; i++) {
      const v0 = z0 + (z1 - z0) * i / strips, v1 = z0 + (z1 - z0) * (i + 1) / strips, h0 = hAt(v0), h1 = hAt(v1);
      const A = proj(x0, h0, v0 + dz(v0)), B = proj(x1, h0, v0 + dz(v0)), N = proj(x0, h1, v1 + dz(v1));   // far-left, far-right, near-left
      g.setTransform((B[0] - A[0]) / W, (B[1] - A[1]) / W, (N[0] - A[0]) / sh, (N[1] - A[1]) / sh, A[0], A[1]);
      g.drawImage(print, 0, sh * i, W, Math.min(sh + 0.75, H - sh * i), 0, 0, W, Math.min(sh + 0.75, H - sh * i));
      const sl = (h1 - h0) / Math.max(1e-6, v1 - v0), nl = (light[1] + 0.35 * sl) / (Math.hypot(sl, 1) * ll), dark = Math.max(0, 0.3 * (1 - nl));
      if (dark > 0.01) { g.globalAlpha = dark; g.fillStyle = shadeColor; g.fillRect(0, 0, W, sh + 0.75); g.globalAlpha = 1; }
    }
    g.restore(); return;
  }
  const sw = W / strips;
  for (let i = 0; i < strips; i++) {
    const u0 = x0 + (x1 - x0) * i / strips, u1 = x0 + (x1 - x0) * (i + 1) / strips, h0 = hAt(u0), h1 = hAt(u1);
    const A = proj(u0, h0, z0 + dz(u0)), B = proj(u1, h1, z0 + dz(u1)), N = proj(u0, h0, z1 + dz(u0));   // far-left, far-right, near-left
    g.setTransform((B[0] - A[0]) / sw, (B[1] - A[1]) / sw, (N[0] - A[0]) / H, (N[1] - A[1]) / H, A[0], A[1]);
    g.drawImage(print, sw * i, 0, Math.min(sw + 0.75, W - sw * i), H, 0, 0, Math.min(sw + 0.75, W - sw * i), H);
    const sl = (h1 - h0) / (u1 - u0), nl = (-sl * light[0] + light[1]) / (Math.hypot(sl, 1) * ll), dark = Math.max(0, 0.32 * (1 - nl));
    if (dark > 0.01) { g.globalAlpha = dark; g.fillStyle = shadeColor; g.fillRect(0, 0, sw + 0.75, H); g.globalAlpha = 1; }
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (edge > 0) {                                     // the near fascia: the deck's thickness seen from the front
    g.fillStyle = edgeColor; g.beginPath();
    for (let i = 0; i <= strips; i++) { const u = x0 + (x1 - x0) * i / strips, [sx, sy] = proj(u, hAt(u), z1 + dz(u)); (i ? g.lineTo : g.moveTo).call(g, sx, sy); }
    for (let i = strips; i >= 0; i--) { const u = x0 + (x1 - x0) * i / strips, [sx, sy] = proj(u, hAt(u) - edge * rise, z1 + dz(u)); g.lineTo(sx, sy); }
    g.closePath(); g.fill();
  }
  g.restore();
}

/**
 * Any flat printed surface in a pitched 2D view that is not a deck (a roof slope, a side wall, an awning, a sign
 * board): the parallelogram with corners o (the print's top-left), o + u (top-right) and o + v (bottom-left), each
 * [x, y, z] in world units, drawn through proj in strips along v (perspective stays right) and darkened by how far it
 * turns from the key (light3 = toward the key: x, y up, z to the viewer). Key it in the depth order like a deck: a
 * surface long in z sorts with ONE key, so keep standing pieces out of its depth band or split it into keyed parts.
 * A wall running along z is nearly edge-on to a centred camera (~10-15 px): show it only when the camera sees it.
 */
export function drawSurface2D(g, proj, { print, o, u, v, strips = 24, light3 = [-0.6, 0.9, 0.35], shadeColor = '#2a1608', shade = 0.34 } = {}) {
  const W = print.width, H = print.height, sh = H / strips;
  const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]], nl = Math.hypot(...n) || 1;
  const ll = Math.hypot(...light3) || 1, facing = (n[1] >= 0 ? 1 : -1) * (n[0] * light3[0] + n[1] * light3[1] + n[2] * light3[2]) / (nl * ll);
  const dark = shade * (1 - Math.max(0, facing));
  const at = (t) => [o[0] + v[0] * t, o[1] + v[1] * t, o[2] + v[2] * t];
  g.save();
  for (let i = 0; i < strips; i++) {
    const a = at(i / strips), b = at((i + 1) / strips), A = proj(...a), B = proj(a[0] + u[0], a[1] + u[1], a[2] + u[2]), N = proj(...b);
    g.setTransform((B[0] - A[0]) / W, (B[1] - A[1]) / W, (N[0] - A[0]) / sh, (N[1] - A[1]) / sh, A[0], A[1]);
    const hh = Math.min(sh + 0.75, H - sh * i);
    g.drawImage(print, 0, sh * i, W, hh, 0, 0, W, hh);
    if (dark > 0.01) { g.globalAlpha = dark; g.fillStyle = shadeColor; g.fillRect(0, 0, W, hh); g.globalAlpha = 1; }
  }
  g.restore();
}

/** The soft shadow a raised deck casts on the page (water or ground): its outline projected along the light
 *  (light3 = toward the key, x, y up, z to the viewer). Draw it with the other ground shadows. */
export function deckShadow2D(g, proj, { x0, x1, z0, z1, heightAt = () => 0, rise = 1, shift = 0, light3 = [-0.6, 0.9, 0.35], color = '#3a1a08', alpha = 0.3, blurPx = 3, strips = 24 } = {}) {
  const sx = -light3[0] / light3[1], sz = -light3[2] / light3[1], full = (x) => (typeof heightAt === 'function' ? heightAt(x) : heightAt), hAt = (x) => full(x) * rise;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  if (blurPx) g.filter = `blur(${blurPx}px)`;
  g.globalAlpha = alpha * Math.min(1, rise * 2); g.fillStyle = color; g.beginPath();
  for (let i = 0; i <= strips; i++) { const u = x0 + (x1 - x0) * i / strips, h = hAt(u), [px, py] = proj(u + h * sx, 0, z0 + h * sz + full(u) * shift); (i ? g.lineTo : g.moveTo).call(g, px, py); }
  for (let i = strips; i >= 0; i--) { const u = x0 + (x1 - x0) * i / strips, h = hAt(u), [px, py] = proj(u + h * sx, 0, z1 + h * sz + full(u) * shift); g.lineTo(px, py); }
  g.closePath(); g.fill(); g.restore();
}
