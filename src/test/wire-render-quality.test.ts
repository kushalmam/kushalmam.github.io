import { expect, it } from "vitest";
import { renderScale } from "../scene/wireStudy/renderQuality";
it("keeps desktop wires supersampled and never shrinks high-resolution canvases", () => {
  expect(renderScale(2672, 1522, 2)).toBeGreaterThan(1.3);
  expect(renderScale(3840, 2160, 2)).toBeGreaterThanOrEqual(1);
  expect(renderScale(390, 844, 3)).toBe(3);
  expect(renderScale(1440, 900, 1)).toBe(2);
});
