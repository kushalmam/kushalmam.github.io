import { portfolioProjects } from "./portfolioProjects";

/**
 * The feed is generated at build time from the same `portfolioProjects` array the
 * page renders, so it cannot list a project the site has dropped, or miss one it
 * has added. `vite.config.ts` serves it in dev and emits it into the bundle.
 *
 * Format is RSS 2.0 rather than Atom or JSON Feed: it carries the two modules
 * `feed-hygiene` asks for (`atom:link rel="self"` for portability, the
 * Syndication module for polling cadence) and every reader still speaks it.
 */

const ORIGIN = "https://kushalmam.github.io";
const TITLE = "Kushal Mamillapalli — Selected work";
const DESCRIPTION =
  "Selected work from Kushal Mamillapalli, a data engineer at Spotify: retrieval and ranking pipelines, agentic research tooling, and applied ML infrastructure.";

const escapeXml = (text: string) =>
  text.replace(/[&<>"']/g, character =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character]!);

/**
 * A stable identifier that survives the repository being renamed, which is what
 * `<guid>` is for: a change here re-floods every subscriber with a "new" item,
 * so it is derived from the project's own name and not from its URL.
 */
const guidFor = (name: string) =>
  `${ORIGIN}/selected-work/${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

export function buildFeed({ base, lastBuild }: { base: string; lastBuild: string }): string {
  const site = `${ORIGIN}${base}`;

  const items = portfolioProjects
    .map(project => [
      "    <item>",
      `      <title>${escapeXml(`${project.name} — ${project.category}`)}</title>`,
      `      <link>${escapeXml(project.href)}</link>`,
      `      <guid isPermaLink="false">${escapeXml(guidFor(project.name))}</guid>`,
      `      <description>${escapeXml(project.description)}</description>`,
      "    </item>",
    ].join("\n"))
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:sy="http://purl.org/rss/1.0/modules/syndication/">
  <channel>
    <title>${escapeXml(TITLE)}</title>
    <link>${escapeXml(site)}</link>
    <description>${escapeXml(DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${escapeXml(lastBuild)}</lastBuildDate>
    <sy:updatePeriod>monthly</sy:updatePeriod>
    <sy:updateFrequency>1</sy:updateFrequency>
    <atom:link href="${escapeXml(`${site}feed.xml`)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}
