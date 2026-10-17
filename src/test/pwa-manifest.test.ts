import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The installable-app and crawler-declaration surface: the web app manifest and
 * its icons, the discovery links the HTML head has to carry for any of it to be
 * found, and the Content-Signal declaration in robots.txt.
 */
const publicFile = (...segments: string[]) => path.join(process.cwd(), "public", ...segments);
const read = (...segments: string[]) => readFileSync(publicFile(...segments), "utf8");

const manifest = JSON.parse(read("site.webmanifest")) as {
  name: string;
  short_name: string;
  start_url: string;
  scope: string;
  display: string;
  theme_color: string;
  background_color: string;
  lang: string;
  icons: { src: string; sizes: string; type: string; purpose?: string }[];
};

const html = readFileSync(path.join(process.cwd(), "index.html"), "utf8");
const robots = read("robots.txt");

describe("web app manifest", () => {
  it("declares the fields a browser needs to offer installation", () => {
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name.length).toBeLessThanOrEqual(12);
    expect(manifest.display).toBe("standalone");
    expect(manifest.lang).toBe("en");
    expect(manifest.theme_color).toMatch(/^#[0-9a-f]{6}$/i);
    expect(manifest.background_color).toMatch(/^#[0-9a-f]{6}$/i);
    // The site's own paper and night tones, so the splash screen matches.
    expect(manifest.theme_color).toBe("#efece4");
    expect(manifest.background_color).toBe("#efece4");
  });

  it("uses relative URLs, so the manifest survives a subpath deploy", () => {
    expect(manifest.start_url).toBe("./");
    expect(manifest.scope).toBe("./");
    for (const icon of manifest.icons) {
      expect(icon.src.startsWith("/")).toBe(false);
    }
  });

  it("ships both install sizes and a maskable icon, all present on disk", () => {
    const sizes = manifest.icons.map(icon => icon.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
    expect(manifest.icons.some(icon => icon.purpose?.includes("maskable"))).toBe(true);

    for (const icon of manifest.icons) {
      expect(icon.type).toBe("image/png");
      // Regenerate with `bun run icons` when this fails.
      expect(existsSync(publicFile(icon.src)), `${icon.src} is missing`).toBe(true);
    }
  });
});

describe("discovery links in the HTML head", () => {
  it("links the manifest and the feed, through the deploy base", () => {
    expect(html).toContain('rel="manifest" href="%BASE_URL%site.webmanifest"');
    expect(html).toContain('rel="alternate"');
    expect(html).toContain('type="application/rss+xml"');
    expect(html).toContain('href="%BASE_URL%feed.xml"');
    // A feed readers can label in their subscribe UI.
    expect(html).toContain('title="Kushal Mamillapalli — Selected work"');
  });
});

describe("Content-Signal declaration", () => {
  it("states a site-wide AI preference alongside the per-agent groups", () => {
    expect(robots).toMatch(
      /^Content-Signal: search=yes, ai-input=yes, ai-train=yes$/m,
    );
  });

  it("leaves robots.txt parseable: every line is a directive or a comment", () => {
    const lines = robots.split("\n").filter(line => line.trim() && !line.trimStart().startsWith("#"));
    // Sitemap: is a non-group directive and legitimately sits outside a group.
    for (const line of lines) {
      expect(line).toMatch(/^(User-agent|Allow|Disallow|Content-Signal|Sitemap): /);
    }
  });

  it("declares the signal once, in the wildcard group", () => {
    const lines = robots.split("\n");
    const signals = lines.filter(line => line.startsWith("Content-Signal:"));
    expect(signals).toHaveLength(1);
    expect(lines.indexOf("User-agent: *")).toBeLessThan(lines.indexOf(signals[0]));
  });
});

describe("api catalog", () => {
  it("stays valid linkset JSON and advertises the feed and manifest", () => {
    const catalog = JSON.parse(read(".well-known", "api-catalog")) as {
      linkset: Record<string, unknown>[];
    };
    expect(catalog.linkset).toHaveLength(1);
    const relations = Object.keys(catalog.linkset[0]);
    expect(relations).toEqual(expect.arrayContaining(["describedby", "sitemap", "alternate", "manifest"]));
  });
});
