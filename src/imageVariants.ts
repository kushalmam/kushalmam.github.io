/**
 * Single source of truth for responsive raster images.
 *
 * The width ladder here is shared with `scripts/optimize-images.ts`, so the
 * `<picture>` markup and the encoded files can never disagree. Add a new
 * raster image to `public/images`, run `bun run images`, then pass the source's
 * intrinsic width to `variantSrcSet` at the call site.
 */

/** Candidate widths, before clamping to the source's intrinsic width. */
export const VARIANT_WIDTHS = [480, 900, 1440] as const;

export type ImageFormat = "avif" | "webp";

/**
 * The widths actually encoded for a source: every ladder step narrower than
 * the original, plus the original itself.
 */
export function variantWidths(intrinsicWidth: number): number[] {
  return [...VARIANT_WIDTHS.filter(width => width < intrinsicWidth), intrinsicWidth];
}

/**
 * Variant paths for one source, relative to `public/`.
 * `images/portrait.jpg` + 720 + "webp" -> `images/portrait-480.webp`, …
 */
export function variantPaths(relativePath: string, intrinsicWidth: number, format: ImageFormat): { path: string; width: number }[] {
  const dot = relativePath.lastIndexOf(".");
  const stem = dot === -1 ? relativePath : relativePath.slice(0, dot);
  return variantWidths(intrinsicWidth).map(width => ({ path: `${stem}-${width}.${format}`, width }));
}

/**
 * A `srcset` for one format. `resolve` turns a public-relative path into the
 * URL the browser should request — React passes `asset`, the static fallback
 * passes the Vite base.
 */
export function variantSrcSet(
  relativePath: string,
  intrinsicWidth: number,
  format: ImageFormat,
  resolve: (path: string) => string = path => path,
): string {
  return variantPaths(relativePath, intrinsicWidth, format)
    .map(({ path, width }) => `${resolve(path)} ${width}w`)
    .join(", ");
}

/* Layout slots, measured from index.css:
   .about-portrait is columns 1/5, 1/6 below 1100px, 78% wide on phones.
   .project-media is columns 6/13, full width once the projects stack. */
export const PORTRAIT_SIZES = "(max-width: 699px) 78vw, (max-width: 1100px) 42vw, 33vw";
export const PROJECT_SIZES = "(max-width: 699px) 100vw, 58vw";
