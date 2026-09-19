/** Keep thin moving highlights sampled on large screens without unbounded DPR growth. */
export function renderScale(width: number, height: number, dpr: number) {
  const preferred = width < 700 ? 3 : Math.max(2, dpr);
  const budget = Math.sqrt(8_000_000 / Math.max(1, width * height));
  // Never downsample below CSS resolution: that causes crawling wire edges.
  return Math.max(1, Math.min(preferred, 3, budget));
}
