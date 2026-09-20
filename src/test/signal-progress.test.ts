import { expect, it } from "vitest";
import { signalProgress } from "../components/signalProgress";

it("keeps the packet on the reading line after the hero despite unequal path lengths", () => {
  // Long horizontal hero, then a shorter straight route down the page.
  const points = Array.from({ length: 101 }, (_, i) => ({ x: i < 60 ? i * 10 : 600, y: i < 60 ? i * 15 : 900 + (i - 60) * 60 }));
  const progress = signalProgress(points, 1200, 1000, 100, 900, 2600);
  const index = progress * 100;
  const i = Math.floor(index);
  const y = points[i].y + (points[i + 1].y - points[i].y) * (index - i);
  expect(y - 1200 + 100).toBeCloseTo(450);
  expect(signalProgress(points, 0, 1000, 100, 900, 2600)).toBe(.008);
  expect(signalProgress(points, 2600, 1000, 100, 900, 2600)).toBe(1);
});
