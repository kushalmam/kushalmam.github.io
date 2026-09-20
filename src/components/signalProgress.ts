type Point = { x: number; y: number };

/** Travel through the hero, then keep the signal near the viewport's reading line. */
export function signalProgress(points: Point[], scroll: number, viewport: number, mainTop: number, about: number, maxScroll: number) {
  if (scroll >= maxScroll - 1) return 1;
  const last = points.length - 1;
  const aboutIndex = points.reduce((best, point, index) => Math.abs(point.y - about) < Math.abs(points[best].y - about) ? index : best, 0);
  const handoff = Math.max(1, about + mainTop - viewport * .45);
  if (scroll < handoff) return .008 + (aboutIndex / last - .008) * Math.max(0, scroll) / handoff;
  const target = scroll - mainTop + viewport * .45;
  for (let i = Math.max(1, aboutIndex); i <= last; i++) {
    if (points[i].y < target) continue;
    const dy = points[i].y - points[i - 1].y;
    const fraction = dy > 0 ? Math.max(0, Math.min(1, (target - points[i - 1].y) / dy)) : 0;
    return (i - 1 + fraction) / last;
  }
  return 1;
}
