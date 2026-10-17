import { describe, expect, it } from "vitest";
import { buildFeed } from "../feed";
import { portfolioProjects } from "../portfolioProjects";

const lastBuild = "Sat, 17 Oct 2026 12:00:00 GMT";
const feed = buildFeed({ base: "/", lastBuild });

const parse = (xml: string) => new DOMParser().parseFromString(xml, "application/xml");

describe("RSS feed", () => {
  it("is well-formed XML, not just XML-shaped text", () => {
    const document = parse(feed);
    expect(document.querySelector("parsererror")).toBeNull();
    expect(document.documentElement.tagName).toBe("rss");
    expect(document.documentElement.getAttribute("version")).toBe("2.0");
  });

  it("identifies itself so a mirrored or forwarded copy stays subscribable", () => {
    const self = parse(feed).querySelector('atom\\:link, link[rel="self"]');
    expect(self?.getAttribute("rel")).toBe("self");
    expect(self?.getAttribute("href")).toBe("https://kushalmam.github.io/feed.xml");
    expect(self?.getAttribute("type")).toBe("application/rss+xml");
  });

  it("declares a polling cadence and a build date", () => {
    expect(feed).toContain("<sy:updatePeriod>monthly</sy:updatePeriod>");
    expect(feed).toContain("<sy:updateFrequency>1</sy:updateFrequency>");
    expect(feed).toContain(`<lastBuildDate>${lastBuild}</lastBuildDate>`);
  });

  it("carries one item per rendered project, with unique stable guids", () => {
    const items = [...parse(feed).getElementsByTagName("item")];
    expect(items).toHaveLength(portfolioProjects.length);

    const guids = items.map(item => item.getElementsByTagName("guid")[0].textContent);
    expect(new Set(guids).size).toBe(guids.length);
    // Derived from the project name, so renaming the repository cannot re-flood
    // subscribers with a "new" item.
    expect(guids[0]).toBe("https://kushalmam.github.io/selected-work/rekindle");
    expect(feed).toContain('isPermaLink="false"');
  });

  it("escapes markup, so a category with an ampersand cannot break the document", () => {
    expect(portfolioProjects.some(project => project.category.includes("&"))).toBe(true);
    expect(feed).toContain("Retrieval &amp; ranking");
    expect(feed).not.toContain("Retrieval & ranking");
    // The escaping is what makes this parse; if it regressed, this throws.
    expect(() => parse(feed)).not.toThrow();
    expect(parse(feed).getElementsByTagName("item")).toHaveLength(portfolioProjects.length);
  });

  it("points every self-referential URL at the deploy base", () => {
    const subpath = buildFeed({ base: "/portfolio/", lastBuild });
    expect(subpath).toContain("<link>https://kushalmam.github.io/portfolio/</link>");
    expect(subpath).toContain('href="https://kushalmam.github.io/portfolio/feed.xml"');
  });
});
