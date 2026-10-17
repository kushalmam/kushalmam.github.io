import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PORTRAIT_SIZES, PROJECT_SIZES, variantPaths, variantSrcSet, variantWidths } from "../imageVariants";
import { portfolioProjects } from "../portfolioProjects";
import { staticFallback } from "../../scripts/staticFallback";

/** Intrinsic width of each source, mirroring the call sites. */
const sources: { path: string; width: number }[] = [
  { path: "images/portrait.jpg", width: 720 },
  ...portfolioProjects.map(project => ({ path: `images/projects/${project.image}`, width: project.width })),
];

describe("responsive image variants", () => {
  it("keeps the ladder below the intrinsic width and always ends on it", () => {
    expect(variantWidths(720)).toEqual([480, 720]);
    expect(variantWidths(806)).toEqual([480, 806]);
    expect(variantWidths(1400)).toEqual([480, 900, 1400]);
    expect(variantWidths(320)).toEqual([320]);
  });

  it("has an encoded avif and webp file for every variant of every source", () => {
    const missing = sources.flatMap(({ path: source, width }) =>
      (["avif", "webp"] as const).flatMap(format =>
        variantPaths(source, width, format)
          .filter(({ path: variant }) => !existsSync(path.join(process.cwd(), "public", variant)))
          .map(({ path: variant }) => variant),
      ),
    );
    // Regenerate with `bun run images` when this fails.
    expect(missing).toEqual([]);
  });

  it("describes each source for every width it has on disk", () => {
    const srcSet = variantSrcSet("images/portrait.jpg", 720, "webp");
    expect(srcSet).toBe("images/portrait-480.webp 480w, images/portrait-720.webp 720w");
  });

  it("resolves every candidate through the caller's base path", () => {
    const srcSet = variantSrcSet("images/portrait.jpg", 720, "avif", p => `/portfolio/${p}`);
    expect(srcSet).toBe("/portfolio/images/portrait-480.avif 480w, /portfolio/images/portrait-720.avif 720w");
  });

  it("offers the modern formats before the original in both renderers", () => {
    const fallback = staticFallback("/");
    expect(fallback).toContain(`srcset="/images/portrait-480.avif 480w, /images/portrait-720.avif 720w" sizes="${PORTRAIT_SIZES}"`);
    expect(fallback).toContain('type="image/webp"');
    expect(fallback).toContain('src="/images/portrait.jpg"');
    for (const project of portfolioProjects) {
      expect(fallback).toContain(`srcset="/images/projects/${project.image.split(".")[0]}-480.webp 480w`);
      expect(fallback).toContain(`sizes="${PROJECT_SIZES}"`);
    }
  });

  it("carries the deploy base into every candidate in the static fallback", () => {
    const fallback = staticFallback("/portfolio/");
    expect(fallback).toContain('srcset="/portfolio/images/portrait-480.webp 480w');
    expect(fallback).toContain('src="/portfolio/images/portrait.jpg"');
  });
});
