import { describe, expect, it } from "vitest";
import { applyBayerMask, BAYER_8X8, bayerThreshold } from "../canvas/dither";

describe("Bayer 8x8 dithering helpers", () => {
  it("builds a complete 8x8 matrix of 64 unique thresholds in (0, 1)", () => {
    expect(BAYER_8X8).toHaveLength(64);
    const unique = new Set(Array.from(BAYER_8X8));
    expect(unique.size).toBe(64);
    for (const value of BAYER_8X8) {
      expect(value).toBeGreaterThan(0);
      expect(value).toBeLessThan(1);
    }
  });

  it("wraps coordinates modulo 8 in bayerThreshold", () => {
    expect(bayerThreshold(0, 0)).toBe(bayerThreshold(8, 16));
    expect(bayerThreshold(3, 5)).toBe(bayerThreshold(11, 13));
    expect(bayerThreshold(7, 7)).toBe(bayerThreshold(-1, -1));
  });

  it("thresholds mask cells cleanly and reports peak exposure", () => {
    const cols = 8;
    const rows = 8;
    const cells = new Float32Array(cols * rows);
    cells[0] = 0.25;
    cells[9] = 0.75;

    const outZero = new Uint8ClampedArray(cols * rows * 4);
    const peakZero = applyBayerMask(new Float32Array(cols * rows), cols, rows, 0, outZero);
    expect(peakZero).toBe(0);
    expect(Array.from(outZero).every((v, idx) => (idx % 4 === 3 ? v === 0 : true))).toBe(true);

    const outHalf = new Uint8ClampedArray(cols * rows * 4);
    const peak = applyBayerMask(cells, cols, rows, 0.5, outHalf);
    expect(peak).toBe(0.75);
    const litCount = Array.from({ length: 64 }, (_, i) => outHalf[i * 4 + 3]).filter(
      (a) => a === 255,
    ).length;
    expect(litCount).toBeGreaterThan(24);
    expect(litCount).toBeLessThan(48);

    const outFull = new Uint8ClampedArray(cols * rows * 4);
    applyBayerMask(cells, cols, rows, 1, outFull);
    expect(
      Array.from({ length: 64 }, (_, i) => outFull[i * 4 + 3]).every((a) => a === 255),
    ).toBe(true);
  });
});
