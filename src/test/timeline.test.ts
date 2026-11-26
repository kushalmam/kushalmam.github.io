import { describe, expect, it } from "vitest";
import { portfolioProjects } from "../portfolioProjects";
import {
  beatForHash,
  createTimeline,
  projectSlice,
  snapBeatForStory,
} from "../timeline";

describe("portfolio timeline & project set", () => {
  it("lists the four active projects including cosmicR without MarketMind", () => {
    expect(portfolioProjects.map((project) => project.name)).toEqual([
      "Rekindle",
      "AutoCPT",
      "NBAnomaly",
      "cosmicR",
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

  it("leaves readable plateaus unsnapped and resolves transition gaps by direction", () => {
    const timeline = createTimeline(portfolioProjects.length);
    // Inside Hero, settled About (crisp photo), Rekindle, AutoCPT, and Contact plateaus -> null
    expect(snapBeatForStory(0.1, timeline, 4, 1)).toBeNull();
    expect(snapBeatForStory(3.0, timeline, 4, 1)).toBeNull();
    expect(snapBeatForStory(5.35, timeline, 4, -1)).toBeNull();
    expect(snapBeatForStory(7.45, timeline, 4, 1)).toBeNull();
    expect(snapBeatForStory(14.1, timeline, 4, 1)).toBeNull();

    // Dead zone between Hero (0..0.2) and settled About (2.85..3.35), including the face dither->photo transition
    expect(snapBeatForStory(0.4, timeline, 4, 1)).toBe(0); // < 18% nudge snaps back
    expect(snapBeatForStory(0.8, timeline, 4, 1)).toBe(2.85); // >= 18% forward snaps ahead
    expect(snapBeatForStory(2.4, timeline, 4, 1)).toBe(2.85); // mid face-transition snaps forward to settled photo
    expect(snapBeatForStory(2.1, timeline, 4, -1)).toBe(0); // scrolling up snaps back to Hero
    expect(snapBeatForStory(2.6, timeline, 4, -1)).toBe(2.85); // tiny backward nudge stays at About

    // Dead zone between settled About and Rekindle (3.35..4.80), including photo->dither fade
    expect(snapBeatForStory(3.5, timeline, 4, 1)).toBe(2.85); // < 18% tiny nudge stays at About
    expect(snapBeatForStory(3.7, timeline, 4, 1)).toBe(5.35); // >= 18% commits forward to Rekindle
    expect(snapBeatForStory(3.7, timeline, 4, -1)).toBe(2.85); // scrolling up returns to About

    // Inter-project fade gap between Rekindle (ends 6.18) and AutoCPT (starts 7.06)
    expect(snapBeatForStory(6.5, timeline, 4, 1)).toBe(7.45);
    expect(snapBeatForStory(6.5, timeline, 4, -1)).toBe(5.35);

    // Dead zone between cosmicR (ends 12.15) and Contact / Let's build (starts 13.85)
    expect(snapBeatForStory(12.8, timeline, 4, 1)).toBe(14.1);
    expect(snapBeatForStory(12.8, timeline, 4, -1)).toBe(11.65);
  });
});
