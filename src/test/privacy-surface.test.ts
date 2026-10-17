import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { staticFallback } from "../../scripts/staticFallback";

/**
 * The audit flagged `privacy-policy` — a required item — because /privacy 404ed.
 * The page is a standalone document rather than a React route: GitHub Pages
 * serves public/privacy/index.html at /privacy/ without any client-side router.
 */
const page = path.join(process.cwd(), "public/privacy/index.html");
const html = readFileSync(page, "utf8");
const sitemap = readFileSync(path.join(process.cwd(), "public/sitemap.xml"), "utf8");

describe("privacy policy", () => {
  it("is reachable at a stable URL from both renderers", () => {
    expect(existsSync(page)).toBe(true);
    expect(staticFallback("/")).toContain('href="/privacy/"');
    expect(staticFallback("/portfolio/")).toContain('href="/portfolio/privacy/"');
  });

  it("is self-describing and indexable", () => {
    expect(html).toContain('<html lang="en">');
    expect(html).toContain("<title>Privacy");
    expect(html).toContain('rel="canonical" href="https://kushalmam.github.io/privacy/"');
    expect(html).toContain('name="description"');
    expect(html).toContain('name="robots" content="index, follow"');
    expect(html).toMatch(/<h1>Privacy<\/h1>/);
  });

  it("says what is collected, who else sees a request, and how to have data removed", () => {
    expect(html).toContain("sets no cookies");
    expect(html).toContain("GitHub Pages");
    expect(html).toContain("mailto:kushalmam06@gmail.com");
    expect(html).toMatch(/will delete it/i);
  });

  it("is listed in the sitemap", () => {
    expect(sitemap).toContain("<loc>https://kushalmam.github.io/privacy/</loc>");
  });
});
