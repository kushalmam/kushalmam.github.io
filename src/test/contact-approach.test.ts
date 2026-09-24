import { expect, it } from "vitest";
import { contactApproach } from "../components/contactApproach";

it.each([430, 240])("keeps the contact bend descending with smooth vertical entries (%ipx)", height => {
  const curve = contactApproach(379, { x: 182, y: 2746 }, height);
  expect(curve.first.x).toBe(curve.start.x);
  expect(curve.second.x).toBe(curve.end.x);
  expect([curve.start.y, curve.first.y, curve.second.y, curve.end.y]).toEqual(
    [...[curve.start.y, curve.first.y, curve.second.y, curve.end.y]].sort((a, b) => a - b),
  );
  expect(curve.d).toContain(`182 2746`);
});
