const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

export const BAYER_8X8 = new Float32Array(64);
for (let by = 0; by < 8; by++) {
  for (let bx = 0; bx < 8; bx++) {
    const v = bx ^ by;
    const m =
      ((v & 1) << 5) |
      ((by & 1) << 4) |
      ((v & 2) << 2) |
      ((by & 2) << 1) |
      ((v & 4) >> 1) |
      ((by & 4) >> 2);
    BAYER_8X8[(by << 3) | bx] = (m + 0.5) / 64;
  }
}

export function bayerThreshold(x: number, y: number): number {
  return BAYER_8X8[((y & 7) << 3) | (x & 7)];
}

export function bayerRevealPass(x: number, y: number, reveal: number): boolean {
  if (reveal <= 0) return false;
  if (reveal >= 1) return true;
  return reveal > bayerThreshold(x + 3, y + 5);
}

export function risographLightInk(
  r: number,
  g: number,
  b: number,
  strong: boolean,
): [number, number, number] {
  const maxRGB = Math.max(r, g, b);
  const minRGB = Math.min(r, g, b);
  const sat = (maxRGB - minRGB) / Math.max(1, maxRGB);
  if (sat > 0.12) {
    const lift = minRGB * 0.5;
    let sr = Math.max(0, r - lift);
    let sg = Math.max(0, g - lift);
    let sb = Math.max(0, b - lift);
    const peak = Math.max(sr, sg, sb);
    if (peak > 205) {
      const s = 205 / peak;
      sr *= s;
      sg *= s;
      sb *= s;
    }
    const lum = 0.2126 * sr + 0.7152 * sg + 0.0722 * sb;
    if (lum > 158) {
      const s = 158 / lum;
      sr *= s;
      sg *= s;
      sb *= s;
    }
    return [Math.round(sr), Math.round(sg), Math.round(sb)];
  }
  return strong ? [42, 46, 44] : [96, 102, 98];
}

export function applyBayerMask(
  cells: Float32Array,
  cols: number,
  rows: number,
  floor: number,
  outData: Uint8ClampedArray,
): number {
  let peak = 0;
  for (let y = 0; y < rows; y++) {
    const rowOffset = y * cols;
    const by = (y & 7) << 3;
    for (let x = 0; x < cols; x++) {
      const i = rowOffset + x;
      const cell = cells[i];
      if (cell > peak) peak = cell;
      const shown = clamp01(floor + cell);
      const on = shown > BAYER_8X8[by | (x & 7)];
      const k = i << 2;
      outData[k] = 255;
      outData[k + 1] = 255;
      outData[k + 2] = 255;
      outData[k + 3] = on ? 255 : 0;
    }
  }
  return peak;
}

export interface BayerDitherOptions {
  cellSize?: number;
  lightMode?: boolean;
  preserveColor?: boolean;
  edgeStrength?: number;
  gamma?: number;
  alphaThreshold?: number;
  reveal?: number;
  ditherAmount?: number;
  levels?: number;
}

interface DitherCache {
  sample: HTMLCanvasElement;
  sc: CanvasRenderingContext2D;
  outImage: ImageData;
  lum: Float32Array;
  alpha: Uint8ClampedArray;
  gridW: number;
  gridH: number;
  targetW: number;
  targetH: number;
}

const ditherCache = new WeakMap<HTMLCanvasElement, DitherCache>();
const gammaLutCache = new Map<number, Float32Array>();

function getGammaLut(gamma: number): Float32Array {
  const key = Math.round(gamma * 1000);
  let lut = gammaLutCache.get(key);
  if (!lut) {
    lut = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      lut[i] = Math.pow(i / 255, gamma);
    }
    gammaLutCache.set(key, lut);
  }
  return lut;
}

export function renderBayerDither(
  source: HTMLCanvasElement,
  target: HTMLCanvasElement,
  options: BayerDitherOptions = {},
): void {
  const cellSize = Math.max(1, Math.round(options.cellSize ?? 1));
  const lightMode = options.lightMode ?? false;
  const preserveColor = options.preserveColor ?? true;
  const edgeStrength = options.edgeStrength ?? 0.45;
  const gamma = options.gamma ?? (lightMode ? 0.92 : 0.84);
  const alphaThreshold = options.alphaThreshold ?? 40;
  const reveal = options.reveal ?? 1;
  const ditherAmount = options.ditherAmount ?? 0.22;
  const levels = Math.max(2, Math.round(options.levels ?? 4));
  const invLevels = 1 / levels;

  const outCtx = target.getContext("2d");
  if (!outCtx || target.width <= 0 || target.height <= 0) return;

  const gridW = Math.max(1, Math.floor(target.width / cellSize));
  const gridH = Math.max(1, Math.floor(target.height / cellSize));

  let cache = ditherCache.get(target);
  if (
    !cache ||
    cache.gridW !== gridW ||
    cache.gridH !== gridH ||
    cache.targetW !== target.width ||
    cache.targetH !== target.height
  ) {
    const sample = document.createElement("canvas");
    sample.width = gridW;
    sample.height = gridH;
    const sc = sample.getContext("2d", { willReadFrequently: true });
    if (!sc) return;
    const outImage = outCtx.createImageData(target.width, target.height);
    const count = gridW * gridH;
    cache = {
      sample,
      sc,
      outImage,
      lum: new Float32Array(count),
      alpha: new Uint8ClampedArray(count),
      gridW,
      gridH,
      targetW: target.width,
      targetH: target.height,
    };
    ditherCache.set(target, cache);
  }

  const { sc, lum, alpha, outImage } = cache;
  sc.imageSmoothingEnabled = true;
  sc.clearRect(0, 0, gridW, gridH);
  sc.drawImage(source, 0, 0, gridW, gridH);

  const pixels = sc.getImageData(0, 0, gridW, gridH).data;
  const count = gridW * gridH;
  for (let i = 0; i < count; i++) {
    const k = i << 2;
    const a = pixels[k + 3];
    alpha[i] = a;
    lum[i] =
      a < alphaThreshold
        ? 0
        : (pixels[k] * 0.2126 + pixels[k + 1] * 0.7152 + pixels[k + 2] * 0.0722) / 255;
  }

  const out = outImage.data;
  out.fill(0);
  const targetW = target.width;
  const targetH = target.height;
  const gammaLut = getGammaLut(gamma);
  const edgeGate = Math.max(0.14, 0.36 - edgeStrength * 0.28);
  const seamLight = Math.max(0.62, 1 - edgeStrength * 0.55);
  const seamDarkScale = Math.max(0.48, 1 - edgeStrength * 0.9);
  const hasReveal = reveal < 1;

  for (let y = 0; y < gridH; y++) {
    const ym1 = (y > 0 ? y - 1 : 0) * gridW;
    const y0 = y * gridW;
    const yp1 = (y < gridH - 1 ? y + 1 : gridH - 1) * gridW;
    const by = (y & 7) << 3;
    const byRev = ((y + 5) & 7) << 3;
    const py0 = y * cellSize;

    for (let x = 0; x < gridW; x++) {
      if (hasReveal && (reveal <= 0 || reveal <= BAYER_8X8[byRev | ((x + 3) & 7)])) {
        continue;
      }
      const idx = y0 + x;
      const a = alpha[idx];
      if (a < alphaThreshold) continue;

      const xm1 = x > 0 ? x - 1 : 0;
      const xp1 = x < gridW - 1 ? x + 1 : gridW - 1;

      const l00 = lum[ym1 + xm1];
      const l10 = lum[ym1 + x];
      const l20 = lum[ym1 + xp1];
      const l01 = lum[y0 + xm1];
      const l21 = lum[y0 + xp1];
      const l02 = lum[yp1 + xm1];
      const l12 = lum[yp1 + x];
      const l22 = lum[yp1 + xp1];

      const gx = -l00 - 2 * l01 - l02 + l20 + 2 * l21 + l22;
      const gy = -l00 - 2 * l10 - l20 + l02 + 2 * l12 + l22;
      const agx = (alpha[y0 + xp1] - alpha[y0 + xm1]) / 255;
      const agy = (alpha[yp1 + x] - alpha[ym1 + x]) / 255;
      const edge = clamp01(
        Math.sqrt(gx * gx + gy * gy) * 0.45 + Math.sqrt(agx * agx + agy * agy) * 0.7,
      );

      const l = lum[idx];
      const bayer = BAYER_8X8[by | (x & 7)] - 0.5;
      const k = idx << 2;
      const r = pixels[k];
      const g = pixels[k + 1];
      const b = pixels[k + 2];
      const maxRGB = r > g ? (r > b ? r : b) : g > b ? g : b;
      const minRGB = r < g ? (r < b ? r : b) : g < b ? g : b;
      const sat = (maxRGB - minRGB) / (maxRGB > 1 ? maxRGB : 1);

      let outR = 0;
      let outG = 0;
      let outB = 0;
      let outA = 0;

      if (lightMode) {
        if (l < 0.14 && sat <= 0.12) {
          if (edge > edgeGate) {
            outR = 44;
            outG = 48;
            outB = 46;
            outA = 235;
          }
        } else if (preserveColor && sat > 0.14) {
          const liftMin = minRGB * 0.5;
          let sr = r > liftMin ? r - liftMin : 0;
          let sg = g > liftMin ? g - liftMin : 0;
          let sb = b > liftMin ? b - liftMin : 0;
          const peak = sr > sg ? (sr > sb ? sr : sb) : sg > sb ? sg : sb;
          if (peak > 205) {
            const s = 205 / peak;
            sr *= s;
            sg *= s;
            sb *= s;
          }
          const cLum = 0.2126 * sr + 0.7152 * sg + 0.0722 * sb;
          if (cLum > 158) {
            const s = 158 / cLum;
            sr *= s;
            sg *= s;
            sb *= s;
          }
          const cr = Math.round(sr);
          const cg = Math.round(sg);
          const cb = Math.round(sb);
          const step = clamp01(Math.round((l + bayer * ditherAmount) * levels) * invLevels);
          const lift = step * 0.75;
          const hr = Math.min(242, Math.round(cr + (242 - cr) * 0.42));
          const hg = Math.min(244, Math.round(cg + (244 - cg) * 0.42));
          const hb = Math.min(240, Math.round(cb + (240 - cb) * 0.42));
          outR = Math.round(cr + (hr - cr) * lift);
          outG = Math.round(cg + (hg - cg) * lift);
          outB = Math.round(cb + (hb - cb) * lift);
          if (edge > edgeGate + 0.08 && l < 0.45) {
            outR = Math.round(outR * seamLight);
            outG = Math.round(outG * seamLight);
            outB = Math.round(outB * seamLight);
          }
          outA = 250;
        } else if (edge > edgeGate + 0.02 && l < 0.48) {
          outR = 38;
          outG = 42;
          outB = 40;
          outA = 248;
        } else {
          const gTone = gammaLut[Math.min(255, Math.max(0, (l * 255) | 0))];
          const step = clamp01(
            Math.round((gTone + bayer * ditherAmount) * levels) * invLevels,
          );
          outR = Math.round(70 + 159 * step);
          outG = Math.round(75 + 153 * step);
          outB = Math.round(72 + 149 * step);
          outA = 248;
        }
      } else {
        if (l < 0.14 && sat <= 0.12) {
          if (edge > edgeGate + 0.04) {
            outR = 128;
            outG = 138;
            outB = 134;
            outA = 215;
          }
        } else {
          const gTone = gammaLut[Math.min(255, Math.max(0, (l * 255) | 0))];
          const step = clamp01(
            Math.round((gTone + bayer * ditherAmount) * levels) * invLevels,
          );
          const scale = 0.36 + 0.72 * step;
          const seamDark = edge > edgeGate + 0.1 && l < 0.48 ? seamDarkScale : 1;
          const boost = scale * seamDark;
          if (preserveColor) {
            outR = Math.min(255, Math.round(r * boost));
            outG = Math.min(255, Math.round(g * boost));
            outB = Math.min(255, Math.round(b * boost));
          } else {
            const v = Math.min(255, Math.round(234 * boost));
            outR = v;
            outG = v;
            outB = Math.min(255, Math.round(227 * boost));
          }
          outA = 248;
        }
      }

      if (outA === 0) continue;

      if (cellSize === 1) {
        out[k] = outR;
        out[k + 1] = outG;
        out[k + 2] = outB;
        out[k + 3] = outA;
      } else {
        const px0 = x * cellSize;
        for (let dy = 0; dy < cellSize && py0 + dy < targetH; dy++) {
          const outRow = (py0 + dy) * targetW;
          for (let dx = 0; dx < cellSize && px0 + dx < targetW; dx++) {
            const ok = (outRow + px0 + dx) << 2;
            out[ok] = outR;
            out[ok + 1] = outG;
            out[ok + 2] = outB;
            out[ok + 3] = outA;
          }
        }
      }
    }
  }

  outCtx.putImageData(outImage, 0, 0);
}
