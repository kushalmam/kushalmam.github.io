import { clamp, ease, smoothstep } from "../timeline";
import { BAYER_8X8 } from "./dither";

export interface HeroSeaState {
  story: number;
  time: number;
  frameDelta: number;
  paused: boolean;
  reducedMotion: boolean;
  hover: { x: number; y: number; inside: boolean };
  ripples: readonly { x: number; y: number; age: number }[];
  lightMode: boolean;
}

interface PreparedRipple {
  rx: number;
  ry: number;
  radius: number;
  band: number;
  invBand: number;
  minR2: number;
  maxR2: number;
  ageFade: number;
  pushScale: number;
}

const TRIG_SIZE = 1024;
const TRIG_MASK = TRIG_SIZE - 1;
const RAD_TO_TRIG = TRIG_SIZE / (Math.PI * 2);
const SIN_LUT = new Float32Array(TRIG_SIZE);
const COS_LUT = new Float32Array(TRIG_SIZE);
for (let i = 0; i < TRIG_SIZE; i++) {
  const angle = (i / TRIG_SIZE) * Math.PI * 2;
  SIN_LUT[i] = Math.sin(angle);
  COS_LUT[i] = Math.cos(angle);
}
const fastSin = (rad: number): number => SIN_LUT[((rad * RAD_TO_TRIG) | 0) & TRIG_MASK];
const fastCos = (rad: number): number => COS_LUT[((rad * RAD_TO_TRIG) | 0) & TRIG_MASK];

const EXP_SIZE = 256;
const EXP_MAX = 6;
const EXP_SCALE = (EXP_SIZE - 1) / EXP_MAX;
const EXP_NEG_LUT = new Float32Array(EXP_SIZE);
for (let i = 0; i < EXP_SIZE; i++) {
  EXP_NEG_LUT[i] = Math.exp(-i / EXP_SCALE);
}

let seaCanvas: HTMLCanvasElement | null = null;
let seaCtx: CanvasRenderingContext2D | null = null;
let seaImageData: ImageData | null = null;
let seaCols = 0;
let seaRows = 0;
let seaWidth = 0;
let seaHeight = 0;
let quietMask: Float32Array | null = null;
let introAttenMask: Float32Array | null = null;
let tiltX = 0;
let tiltY = 0;

function ensureSeaBuffers(
  cols: number,
  rows: number,
  cellSize: number,
  width: number,
  height: number,
): boolean {
  if (!seaCanvas || !seaCtx || !seaImageData || seaCols !== cols || seaRows !== rows) {
    seaCols = cols;
    seaRows = rows;
    seaCanvas = document.createElement("canvas");
    seaCanvas.width = cols;
    seaCanvas.height = rows;
    seaCtx = seaCanvas.getContext("2d");
    seaImageData = seaCtx ? seaCtx.createImageData(cols, rows) : null;
    quietMask = new Float32Array(cols * rows);
    introAttenMask = new Float32Array(cols * rows);
    seaWidth = 0;
  }
  if (!seaCtx || !seaImageData || !quietMask || !introAttenMask) return false;

  if (seaWidth !== width || seaHeight !== height) {
    seaWidth = width;
    seaHeight = height;
    for (let y = 0; y < rows; y++) {
      const vv = ((y + 0.5) * cellSize) / height;
      const rowOff = y * cols;
      const qLeftY = Math.pow((vv - 0.38) / 0.18, 4);
      const qIntroY = Math.pow((vv - 0.65) / 0.17, 4);
      const qNavY = Math.pow((vv - 0.06) / 0.08, 4);
      for (let x = 0; x < cols; x++) {
        const u = ((x + 0.5) * cellSize) / width;
        const quietLeft =
          Math.exp(-Math.pow((u - 0.3) / 0.3, 4) - qLeftY) * 0.3;
        const quietIntro =
          Math.exp(-Math.pow((u - 0.79) / 0.21, 4) - qIntroY) * 0.68;
        const quietNav =
          Math.exp(-Math.pow((u - 0.84) / 0.2, 4) - qNavY) * 0.5;
        const i = rowOff + x;
        quietMask[i] = Math.max(0, 1 - quietLeft - quietIntro - quietNav);
        introAttenMask[i] = 1 - quietIntro * 0.52;
      }
    }
  }
  return true;
}

export function renderHeroSea(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: HeroSeaState,
): void {
  const heroReveal = 1 - ease((state.story - 0.8) / 0.95);
  if (heroReveal <= 0.005 || width <= 0 || height <= 0) return;

  const cellSize = width < 700 ? 3 : 4;
  const cols = Math.max(1, Math.ceil(width / cellSize));
  const rows = Math.max(1, Math.ceil(height / cellSize));

  if (!ensureSeaBuffers(cols, rows, cellSize, width, height)) return;
  const imageData = seaImageData!;
  const qMask = quietMask!;
  const attenMask = introAttenMask!;

  const { time, frameDelta, hover, ripples, lightMode } = state;
  const interactive = !state.paused && !state.reducedMotion && state.story < 1.1;

  const follow = 1 - Math.exp(-6 * Math.min(0.05, frameDelta));
  const targetX =
    interactive && hover.inside ? (hover.y - 0.5) * 1.4 : Math.sin(time * 0.55) * 0.12;
  const targetY =
    interactive && hover.inside ? (hover.x - 0.5) * 1.4 : Math.sin(time * 0.4 + 1.3) * 0.2;
  tiltX += (targetX - tiltX) * follow;
  tiltY += (targetY - tiltY) * follow;

  const px = hover.x * width;
  const py = hover.y * height;
  const reach = Math.max(140, height * 0.28);
  const reach2 = reach * reach;
  const hoverActive = interactive && hover.inside;

  const activeRipples: PreparedRipple[] = [];
  if (interactive && ripples.length > 0) {
    const maxDim = Math.max(width, height);
    const band = Math.max(cellSize * 4, 28);
    const invBand = 1 / band;
    for (let i = 0; i < ripples.length; i++) {
      const rip = ripples[i];
      const ageFade = 1 - smoothstep(0, 1.2, rip.age);
      if (ageFade <= 0.002) continue;
      const radius = rip.age * maxDim * 0.75;
      const minR = Math.max(0, radius - band);
      const maxR = radius + band;
      activeRipples.push({
        rx: rip.x * width,
        ry: rip.y * height,
        radius,
        band,
        invBand,
        minR2: minR * minR,
        maxR2: maxR * maxR,
        ageFade,
        pushScale: cellSize * 1.8,
      });
    }
  }

  const rippleCount = activeRipples.length;
  const foldFade = 1 - ease((state.story - 0.4) / 1.2) * 0.18;
  const minDensity = lightMode ? 0.24 : 0.18;
  const baseAlpha = lightMode ? 110 : 215;
  const hasHeroReveal = heroReveal < 1;
  const invW = 1 / width;
  const invH = 1 / height;
  const time013 = time * 0.13;
  const time009 = time * 0.09;
  const time012 = time * 0.12;
  const time018 = time * 0.18;
  const time025 = time * 0.25;
  const data = imageData.data;
  data.fill(0);

  for (let y = 0; y < rows; y++) {
    const sy = (y + 0.5) * cellSize;
    const v = sy * invH;
    const ys = Math.sin(v * 5.4 - time018) * 0.52;
    const rowOff = y * cols;
    const by = (y & 7) << 3;
    const byRev = ((y + 5) & 7) << 3;
    const tiltShiftU = tiltY * (v - 0.5) * cellSize * 2;
    const dyHover = sy - py;
    const dyHover2 = dyHover * dyHover;

    for (let x = 0; x < cols; x++) {
      if (hasHeroReveal && heroReveal <= BAYER_8X8[byRev | ((x + 3) & 7)]) {
        continue;
      }
      const sx = (x + 0.5) * cellSize;
      let ring = 0;
      let pushX = 0;
      let pushY = 0;

      for (let rIdx = 0; rIdx < rippleCount; rIdx++) {
        const rip = activeRipples[rIdx];
        const dx = sx - rip.rx;
        const dy = sy - rip.ry;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < rip.minR2 || dist2 > rip.maxR2) continue;
        const dist = Math.sqrt(dist2);
        const gap = Math.abs(dist - rip.radius);
        const t = gap * rip.invBand;
        const bandFade = t >= 1 ? 0 : 1 - t * t * (3 - 2 * t);
        const fall = rip.ageFade * bandFade;
        if (fall <= 0) continue;
        if (fall > ring) ring = fall;
        const invDist = dist > 0.001 ? 1 / dist : 1;
        const push = fall * rip.pushScale * invDist;
        pushX += dx * push;
        pushY += dy * push;
      }

      const u = (sx + pushX + tiltShiftU) * invW;
      const vv = (sy + pushY + tiltX * (u - 0.5) * cellSize * 2) * invH;
      const a = u * 3.8 + vv * 1.65 + ys;
      const b = vv * 2.7 - u * 0.8 + fastSin(u * 6 + time012) * 0.28;
      const surface =
        fastSin(a * 3.5 + time013) + fastCos(b * 4.1 - time009) * 0.57;
      const norm = surface * 2.0833333333333335;
      const norm2 = norm * norm;
      const ridge = norm2 >= EXP_MAX ? 0 : EXP_NEG_LUT[(norm2 * EXP_SCALE) | 0];
      const cBase = 0.5 + 0.5 * fastCos(a * 26 + b * 4);
      const contour = cBase * cBase * cBase;

      const idx = rowOff + x;
      const rawValue = (ridge * 0.78 + contour * 0.24) * qMask[idx];

      let hoverGlint = 0;
      if (hoverActive) {
        const dxH = sx - px;
        const d2H = dxH * dxH + dyHover2;
        if (d2H < reach2) {
          const distH = Math.sqrt(d2H);
          hoverGlint = clamp(1 - smoothstep(reach * 0.2, reach, distH)) * 0.42;
        }
      }

      const density = clamp(rawValue * foldFade + ring * 0.65 + hoverGlint * 0.22);
      if (density <= minDensity || density <= BAYER_8X8[by | (x & 7)]) continue;

      const colorT = clamp(rawValue * 1.05 + 0.08 * fastSin(u * 4 + v * 3 - time025));
      let r: number;
      let g: number;
      let bl: number;

      if (lightMode) {
        if (colorT < 0.52) {
          const t = colorT / 0.52;
          r = 98 + (42 - 98) * t;
          g = 112 + (134 - 112) * t;
          bl = 110 + (118 - 110) * t;
        } else {
          const t = (colorT - 0.52) / 0.48;
          r = 42 + (68 - 42) * t;
          g = 134 + (168 - 134) * t;
          bl = 118 + (144 - 118) * t;
        }
        if (hoverGlint > 0.05) {
          const t = hoverGlint * 0.8;
          r += (196 - r) * t;
          g += (108 - g) * t;
          bl += (76 - bl) * t;
        }
        if (ring > 0.05) {
          const t = ring * 0.85;
          r += (32 - r) * t;
          g += (142 - g) * t;
          bl += (122 - bl) * t;
        }
      } else {
        if (colorT < 0.55) {
          const t = colorT / 0.55;
          r = 22 + (56 - 22) * t;
          g = 68 + (186 - 68) * t;
          bl = 92 + (170 - 92) * t;
        } else {
          const t = (colorT - 0.55) / 0.45;
          r = 56 + (228 - 56) * t;
          g = 186 + (242 - 186) * t;
          bl = 170 + (210 - 170) * t;
        }
        if (hoverGlint > 0.05) {
          const t = hoverGlint * 0.8;
          r += (242 - r) * t;
          g += (174 - g) * t;
          bl += (114 - bl) * t;
        }
        if (ring > 0.05) {
          const t = ring * 0.9;
          r += (140 - r) * t;
          g += (252 - g) * t;
          bl += (214 - bl) * t;
        }
      }

      const k = idx << 2;
      data[k] = (r + 0.5) | 0;
      data[k + 1] = (g + 0.5) | 0;
      data[k + 2] = (bl + 0.5) | 0;
      data[k + 3] = (baseAlpha * (0.65 + 0.35 * density) * attenMask[idx] + 0.5) | 0;
    }
  }

  seaCtx!.putImageData(imageData, 0, 0);
  const prevSmooth = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(seaCanvas!, 0, 0, cols * cellSize, rows * cellSize);
  ctx.imageSmoothingEnabled = prevSmooth;
}
