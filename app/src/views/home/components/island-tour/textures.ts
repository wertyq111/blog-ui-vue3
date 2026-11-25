// 纯代码程序化 CanvasTexture 生成器（胡桃木、黄铜铭牌、苔藓草地、暗房画作、柔光晕等）
import * as THREE from "three";

export interface IslandTextures {
  walnutTex: THREE.CanvasTexture;
  plaqueTex: THREE.CanvasTexture;
  grassTex: THREE.CanvasTexture;
  woodPlankTex: THREE.CanvasTexture;
  stuccoTex: THREE.CanvasTexture;
  roofTileTex: THREE.CanvasTexture;
  photoPrints: [THREE.CanvasTexture, THREE.CanvasTexture, THREE.CanvasTexture];
  softGlowTex: THREE.CanvasTexture;
  beamAlphaTex: THREE.CanvasTexture;
  dispose(): void;
}

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  return [c, ctx];
}

function toTex(
  canvas: HTMLCanvasElement,
  options: { repeat?: [number, number]; srgb?: boolean; clamp?: boolean } = {}
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = options.srgb === false ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  if (options.clamp) {
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
  } else {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
  }
  if (options.repeat) tex.repeat.set(options.repeat[0], options.repeat[1]);
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildWalnutTex(): THREE.CanvasTexture {
  const S = 512;
  const [c, ctx] = makeCanvas(S, S);
  const rnd = mulberry32(77);
  ctx.fillStyle = "#482e1d";
  ctx.fillRect(0, 0, S, S);

  for (let i = 0; i < 48; i++) {
    const y = (i / 48) * S;
    ctx.strokeStyle = i % 2 === 0 ? "rgba(32, 18, 10, 0.32)" : "rgba(96, 62, 38, 0.25)";
    ctx.lineWidth = 2 + rnd() * 4;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(S * 0.33, y + (rnd() - 0.5) * 26, S * 0.66, y + (rnd() - 0.5) * 26, S, y);
    ctx.stroke();
  }
  return toTex(c, { repeat: [2, 1] });
}

function buildPlaqueTex(): THREE.CanvasTexture {
  const W = 512;
  const H = 128;
  const [c, ctx] = makeCanvas(W, H);
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#f2cf78");
  grad.addColorStop(0.5, "#dfb051");
  grad.addColorStop(1, "#c79234");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "#6b4815";
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, W - 20, H - 20);

  ctx.fillStyle = "#7a5218";
  for (const [rx, ry] of [
    [24, 24],
    [W - 24, 24],
    [24, H - 24],
    [W - 24, H - 24],
  ]) {
    ctx.beginPath();
    ctx.arc(rx, ry, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#4a2e08";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "900 26px 'Nunito', 'PingFang SC', sans-serif";
  ctx.fillText("ZIYUE'S DIORAMA", W / 2, 46);
  ctx.font = "700 18px 'Noto Sans SC', 'PingFang SC', sans-serif";
  ctx.fillStyle = "#613e0f";
  ctx.fillText("琉璃海四层共生工作箱庭", W / 2, 84);

  return toTex(c, { clamp: true });
}

function buildGrassTex(): THREE.CanvasTexture {
  const S = 512;
  const [c, ctx] = makeCanvas(S, S);
  const rnd = mulberry32(101);
  ctx.fillStyle = "#dcdcdc";
  ctx.fillRect(0, 0, S, S);

  for (let i = 0; i < 65; i++) {
    const x = rnd() * S;
    const y = rnd() * S;
    const r = 20 + rnd() * 44;
    ctx.fillStyle = rnd() > 0.5 ? "rgba(255,255,255,0.22)" : "rgba(185,185,185,0.18)";
    for (const ox of [-S, 0, S]) {
      for (const oy of [-S, 0, S]) {
        ctx.beginPath();
        ctx.arc(x + ox, y + oy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  for (let i = 0; i < 150; i++) {
    const x = rnd() * S;
    const y = rnd() * S;
    const sz = 5 + rnd() * 5;
    ctx.fillStyle = rnd() > 0.5 ? "rgba(255,255,255,0.28)" : "rgba(165,165,165,0.24)";
    for (const ox of [-S, 0, S]) {
      for (const oy of [-S, 0, S]) {
        ctx.beginPath();
        ctx.moveTo(x + ox, y + oy - sz * 0.6);
        ctx.lineTo(x + ox - sz * 0.5, y + oy + sz * 0.45);
        ctx.lineTo(x + ox + sz * 0.5, y + oy + sz * 0.45);
        ctx.closePath();
        ctx.fill();
      }
    }
  }
  return toTex(c, { repeat: [4, 4] });
}

function buildWoodPlankTex(): THREE.CanvasTexture {
  const S = 256;
  const [c, ctx] = makeCanvas(S, S);
  const rnd = mulberry32(303);
  const planks = 6;
  const ph = S / planks;
  for (let i = 0; i < planks; i++) {
    const y = i * ph;
    ctx.fillStyle = ["#c98c57", "#be814d", "#d19560", "#c48651"][i % 4];
    ctx.fillRect(0, y, S, ph);
    ctx.fillStyle = "rgba(84, 46, 18, 0.26)";
    ctx.fillRect(0, y + ph - 2, S, 2);
    ctx.strokeStyle = "rgba(96, 56, 22, 0.14)";
    ctx.lineWidth = 1.4;
    for (let k = 0; k < 5; k++) {
      const gy = y + 6 + rnd() * (ph - 12);
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.bezierCurveTo(S * 0.3, gy + (rnd() - 0.5) * 6, S * 0.7, gy + (rnd() - 0.5) * 6, S, gy);
      ctx.stroke();
    }
  }
  return toTex(c, { repeat: [1.5, 1.5] });
}

function buildStuccoTex(): THREE.CanvasTexture {
  const S = 256;
  const [c, ctx] = makeCanvas(S, S);
  const rnd = mulberry32(404);
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(0, 0, S, S);
  for (let i = 0; i < 800; i++) {
    ctx.fillStyle = rnd() > 0.5 ? "rgba(255,255,255,0.4)" : "rgba(205,198,186,0.2)";
    ctx.beginPath();
    ctx.arc(rnd() * S, rnd() * S, 1 + rnd() * 2, 0, Math.PI * 2);
    ctx.fill();
  }
  return toTex(c, { repeat: [2, 2] });
}

function buildRoofTileTex(): THREE.CanvasTexture {
  const S = 256;
  const [c, ctx] = makeCanvas(S, S);
  ctx.fillStyle = "#dedede";
  ctx.fillRect(0, 0, S, S);
  const rows = 8;
  const cols = 8;
  const rh = S / rows;
  const cw = S / cols;
  for (let r = -1; r <= rows; r++) {
    const off = (r % 2) * (cw * 0.5);
    for (let col = -1; col <= cols + 1; col++) {
      const x = col * cw + off;
      const y = r * rh;
      const grad = ctx.createLinearGradient(x, y, x, y + rh);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.75, "#d8d8d8");
      grad.addColorStop(1, "#a2a2a2");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x + 1.5, y + 1.5, cw - 3, rh - 2, [4, 4, 12, 12]);
      ctx.fill();
    }
  }
  return toTex(c, { repeat: [2, 2], srgb: false });
}

function buildPhotoPrintTex(variant: 0 | 1 | 2): THREE.CanvasTexture {
  const S = 128;
  const [c, ctx] = makeCanvas(S, S);
  ctx.fillStyle = "#fffaf2";
  ctx.fillRect(0, 0, S, S);
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(10, 10, S - 20, S - 26, 6);
  ctx.clip();

  if (variant === 0) {
    const g = ctx.createLinearGradient(0, 10, 0, S - 16);
    g.addColorStop(0, "#ffaa7e");
    g.addColorStop(0.55, "#ffd59d");
    g.addColorStop(0.56, "#45a6d6");
    g.addColorStop(1, "#20649e");
    ctx.fillStyle = g;
    ctx.fillRect(10, 10, S - 20, S - 26);
    ctx.fillStyle = "#fff2a8";
    ctx.beginPath();
    ctx.arc(64, 50, 15, 0, Math.PI * 2);
    ctx.fill();
  } else if (variant === 1) {
    const g = ctx.createLinearGradient(0, 10, 0, S - 16);
    g.addColorStop(0, "#a8e6ff");
    g.addColorStop(1, "#dff6da");
    ctx.fillStyle = g;
    ctx.fillRect(10, 10, S - 20, S - 26);
    ctx.fillStyle = "#6b4423";
    ctx.fillRect(58, 62, 12, 34);
    ctx.fillStyle = "#ffabc8";
    ctx.beginPath();
    ctx.arc(64, 48, 22, 0, Math.PI * 2);
    ctx.arc(48, 56, 14, 0, Math.PI * 2);
    ctx.arc(80, 56, 14, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const g = ctx.createLinearGradient(0, 10, 0, S - 16);
    g.addColorStop(0, "#1c2c5e");
    g.addColorStop(1, "#3961a6");
    ctx.fillStyle = g;
    ctx.fillRect(10, 10, S - 20, S - 26);
    ctx.fillStyle = "#ffe587";
    ctx.beginPath();
    ctx.arc(64, 46, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff7fa9";
    ctx.fillRect(46, 76, 10, 20);
    ctx.fillStyle = "#5ee7df";
    ctx.fillRect(68, 72, 12, 24);
  }
  ctx.restore();
  return toTex(c, { clamp: true });
}

function buildSoftGlowTex(): THREE.CanvasTexture {
  const S = 128;
  const [c, ctx] = makeCanvas(S, S);
  const g = ctx.createRadialGradient(S / 2, S / 2, 2, S / 2, S / 2, S / 2);
  g.addColorStop(0, "rgba(255, 248, 214, 1)");
  g.addColorStop(0.28, "rgba(255, 225, 130, 0.72)");
  g.addColorStop(0.65, "rgba(255, 198, 92, 0.2)");
  g.addColorStop(1, "rgba(255, 180, 60, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  return toTex(c, { clamp: true });
}

function buildBeamAlphaTex(): THREE.CanvasTexture {
  const W = 64;
  const H = 256;
  const [c, ctx] = makeCanvas(W, H);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "rgba(255, 255, 255, 0.95)");
  g.addColorStop(0.35, "rgba(255, 255, 255, 0.55)");
  g.addColorStop(0.75, "rgba(255, 255, 255, 0.16)");
  g.addColorStop(1, "rgba(255, 255, 255, 0.0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  return toTex(c, { clamp: true, srgb: false });
}

export function createIslandTextures(): IslandTextures {
  const walnutTex = buildWalnutTex();
  const plaqueTex = buildPlaqueTex();
  const grassTex = buildGrassTex();
  const woodPlankTex = buildWoodPlankTex();
  const stuccoTex = buildStuccoTex();
  const roofTileTex = buildRoofTileTex();
  const photoPrints: [THREE.CanvasTexture, THREE.CanvasTexture, THREE.CanvasTexture] = [
    buildPhotoPrintTex(0),
    buildPhotoPrintTex(1),
    buildPhotoPrintTex(2),
  ];
  const softGlowTex = buildSoftGlowTex();
  const beamAlphaTex = buildBeamAlphaTex();

  return {
    walnutTex,
    plaqueTex,
    grassTex,
    woodPlankTex,
    stuccoTex,
    roofTileTex,
    photoPrints,
    softGlowTex,
    beamAlphaTex,
    dispose() {
      [
        walnutTex,
        plaqueTex,
        grassTex,
        woodPlankTex,
        stuccoTex,
        roofTileTex,
        ...photoPrints,
        softGlowTex,
        beamAlphaTex,
      ].forEach((t) => t.dispose());
    },
  };
}
