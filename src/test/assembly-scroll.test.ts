import { expect, it } from "vitest";
import { assemblyBufferSize, assemblyFrame } from "../components/assemblyScroll";

it("uses a Retina buffer at the actual displayed size without undersized 700px frames", () => {
  expect(assemblyBufferSize(780, 2)).toBe(1560);
  expect(assemblyBufferSize(416, 2)).toBe(832);
  expect(assemblyBufferSize(780, 1.5)).toBe(1170);
  expect(assemblyBufferSize(780, 3)).toBe(1560);
});

it("assembles at entry and exit and fully separates halfway, reversibly", () => {
  const height = 600;
  const viewport = 1000;
  const start = 180;
  const end = -height * .65;
  const middle = (start + end) / 2;
  expect(assemblyFrame(start + 200, height, viewport)).toBe(0);
  expect(assemblyFrame(start, height, viewport)).toBe(0);
  expect(assemblyFrame(middle, height, viewport)).toBe(24);
  expect(assemblyFrame(end, height, viewport)).toBe(0);
  expect(assemblyFrame(end - 200, height, viewport)).toBe(0);
  expect(assemblyFrame(middle + 80, height, viewport)).toBe(assemblyFrame(middle - 80, height, viewport));
});
