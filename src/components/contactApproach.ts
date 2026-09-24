type Point = { x: number; y: number };

/** A single monotone bend with vertical tangents at the rail and socket. */
export function contactApproach(railX: number, end: Point, height: number) {
  const start = { x: railX, y: end.y - height };
  const first = { x: railX, y: end.y - height * .64 };
  const second = { x: end.x, y: end.y - height * .28 };
  return { start, first, second, end,
    d: `L ${start.x} ${start.y} C ${first.x} ${first.y}, ${second.x} ${second.y}, ${end.x} ${end.y}` };
}
