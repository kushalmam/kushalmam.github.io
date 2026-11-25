import { describe, expect, it } from "vitest";
import { portfolioProjects } from "../portfolioProjects";
import { beatForHash, createTimeline, projectSlice } from "../timeline";

describe("portfolio timeline & project set", () => {
  it("lists the four active projects including CosmicRecomp without MarketMind", () => {
    expect(portfolioProjects.map((project) => project.name)).toEqual([
      "Rekindle",
      "AutoCPT",
      "NBAnomaly",
      "CosmicRecomp",
    ]);
    expect(portfolioProjects.some((project) => /marketmind/i.test(project.name))).toBe(false);
  });

  it("scales timeline bounds for four projects and orders navigation beats monotonically", () => {
    const timeline = createTimeline(portfolioProjects.length);
    expect(timeline).toEqual({
      projectStart: 4.5,
      projectLength: 2.1,
      contactStart: 12.65,
      end: 15.3,
    });

    const top = beatForHash("#top", timeline)!;
    const about = beatForHash("#about", timeline)!;
    const work = beatForHash("#work", timeline)!;
    const contact = beatForHash("#contact", timeline)!;

    expect(top).toBe(0);
    expect(top).toBeLessThan(about);
    expect(about).toBeLessThan(work);
    expect(work).toBeLessThan(contact);
    expect(contact).toBeLessThan(timeline.end);
    expect(beatForHash("#unknown", timeline)).toBeNull();
  });

  it("clamps project indices cleanly across the four-project work segment", () => {
    const timeline = createTimeline(portfolioProjects.length);
    expect(projectSlice(4.1, timeline, 4).index).toBe(0);
    expect(projectSlice(5.0, timeline, 4).index).toBe(0);
    expect(projectSlice(7.0, timeline, 4).index).toBe(1);
    expect(projectSlice(9.0, timeline, 4).index).toBe(2);
    expect(projectSlice(11.2, timeline, 4).index).toBe(3);
    expect(projectSlice(14.0, timeline, 4).index).toBe(3);
  });
});
