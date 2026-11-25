const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

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

export function applyBayerMask(
  cells: Float32Array,
  cols: number,
  rows: number,
  floor: number,
  outData: Uint8ClampedArray,
): number {
  let peak = 0;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      const cell = cells[i];
      if (cell > peak) peak = cell;
      const shown = clamp01(floor + cell);
      const on = shown > bayerThreshold(x, y);
      const k = i * 4;
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
}

interface DitherCache {
  sample: HTMLCanvasElement;
  outImage: ImageData;
  gridW: number;
  gridH: number;
  targetW: number;
  targetH: number;
}

const ditherCache = new WeakMap<HTMLCanvasElement, DitherCache>();

export function renderBayerDither(
  source: HTMLCanvasElement,
  target: HTMLCanvasElement,
  options: BayerDitherOptions = {},
): void {
  const cellSize = Math.max(1, Math.round(options.cellSize ?? 2));
  const lightMode = options.lightMode ?? false;
  const preserveColor = options.preserveColor ?? true;
  const edgeStrength = options.edgeStrength ?? 0.45;
  const gamma = options.gamma ?? 0.92;
  const alphaThreshold = options.alphaThreshold ?? 40;

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
    const outImage = outCtx.createImageData(target.width, target.height);
    cache = {
      sample,
      outImage,
      gridW,
      gridH,
      targetW: target.width,
      targetH: target.height,
    };
    ditherCache.set(target, cache);
  }

  const sc = cache.sample.getContext("2d", { willReadFrequently: true });
  if (!sc) return;
  sc.imageSmoothingEnabled = true;
  sc.clearRect(0, 0, gridW, gridH);
  sc.drawImage(source, 0, 0, gridW, gridH);

  const pixels = sc.getImageData(0, 0, gridW, gridH).data;
  const count = gridW * gridH;
  const lum = new Float32Array(count);
  const alpha = new Uint8ClampedArray(count);

  for (let i = 0; i < count; i++) {
    const k = i * 4;
    alpha[i] = pixels[k + 3];
    lum[i] =
      (pixels[k] * 0.2126 + pixels[k + 1] * 0.7152 + pixels[k + 2] * 0.0722) / 255;
  }

  const out = cache.outImage.data;
  out.fill(0);
  const targetW = target.width;
  const targetH = target.height;

  const lumAt = (x: number, y: number): number => {
    const cx = x < 0 ? 0 : x >= gridW ? gridW - 1 : x;
    const cy = y < 0 ? 0 : y >= gridH ? gridH - 1 : y;
    const idx = cy * gridW + cx;
    return alpha[idx] < alphaThreshold ? 0 : lum[idx];
  };

  const alphaAt = (x: number, y: number): number => {
    const cx = x < 0 ? 0 : x >= gridW ? gridW - 1 : x;
    const cy = y < 0 ? 0 : y >= gridH ? gridH - 1 : y;
    return alpha[cy * gridW + cx] / 255;
  };

  for (let y = 0; y < gridH; y++) {
    for (let x = 0; x < gridW; x++) {
      const idx = y * gridW + x;
      const a = alpha[idx];
      if (a < alphaThreshold) continue;

      const l = lum[idx];
      const gx =
        -lumAt(x - 1, y - 1) -
        2 * lumAt(x - 1, y) -
        lumAt(x - 1, y + 1) +
        lumAt(x + 1, y - 1) +
        2 * lumAt(x + 1, y) +
        lumAt(x + 1, y + 1);
      const gy =
        -lumAt(x - 1, y - 1) -
        2 * lumAt(x, y - 1) -
        lumAt(x + 1, y - 1) +
        lumAt(x - 1, y + 1) +
        2 * lumAt(x, y + 1) +
        lumAt(x + 1, y + 1);
      const agx = alphaAt(x + 1, y) - alphaAt(x - 1, y);
      const agy = alphaAt(x, y + 1) - alphaAt(x, y - 1);
      const edge = clamp01(Math.hypot(gx, gy) * 0.45 + Math.hypot(agx, agy) * 0.7);
      const threshold = bayerThreshold(x, y);

      let outR = 0;
      let outG = 0;
      let outB = 0;
      let outA = 0;

      if (lightMode) {
        const tone = Math.pow(clamp01(l), gamma);
        const edgeGain = l > 0.72 ? edge * edgeStrength * 0.2 : edge * edgeStrength;
        const inkDensity = clamp01((1 - tone) * 0.92 + edgeGain);
        if (inkDensity > threshold) {
          const strongInk = l < 0.25 || (edge > 0.28 && l <= 0.72);
          outR = strongInk ? 16 : 35;
          outG = strongInk ? 39 : 79;
          outB = strongInk ? 72 : 138;
          outA = strongInk ? 245 : 225;
        }
      } else {
        const tone = Math.pow(clamp01(l), gamma);
        const k = idx * 4;
        if (l < 0.22) {
          if (tone * 0.45 > threshold) {
            outR = preserveColor ? Math.min(255, Math.round(pixels[k] * 1.1 + 12)) : 196;
            outG = preserveColor ? Math.min(255, Math.round(pixels[k + 1] * 1.1 + 14)) : 198;
            outB = preserveColor ? Math.min(255, Math.round(pixels[k + 2] * 1.1 + 12)) : 190;
            outA = 215;
          }
        } else {
          const suppress = l < 0.5 ? edge * edgeStrength : edge * edgeStrength * 0.35;
          if (tone - suppress > threshold) {
            if (preserveColor) {
              outR = Math.min(255, Math.round(pixels[k] * 1.04));
              outG = Math.min(255, Math.round(pixels[k + 1] * 1.04));
              outB = Math.min(255, Math.round(pixels[k + 2] * 1.04));
            } else {
              outR = 234;
              outG = 234;
              outB = 227;
            }
            outA = 245;
          }
        }
      }

      if (outA === 0) continue;

      const py0 = y * cellSize;
      const px0 = x * cellSize;
      for (let dy = 0; dy < cellSize && py0 + dy < targetH; dy++) {
        for (let dx = 0; dx < cellSize && px0 + dx < targetW; dx++) {
          const ok = ((py0 + dy) * targetW + (px0 + dx)) * 4;
          out[ok] = outR;
          out[ok + 1] = outG;
          out[ok + 2] = outB;
          out[ok + 3] = outA;
        }
      }
    }
  }

  outCtx.putImageData(cache.outImage, 0, 0);
}
