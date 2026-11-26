export interface TimelineConfig {
  projectStart: number;
  projectLength: number;
  contactStart: number;
  end: number;
}

export interface ProjectSlice {
  index: number;
  local: number;
  entry: number;
}

export const clamp = (x: number): number => Math.max(0, Math.min(1, x));

export const mix = (a: number, b: number, p: number): number => a + (b - a) * p;

export const ease = (x: number): number => {
  const c = clamp(x);
  return c * c * (3 - 2 * c);
};

export const smoothstep = (a: number, b: number, x: number): number => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export function createTimeline(projectCount: number): TimelineConfig {
  const projectStart = 4.5;
  const projectLength = 2.1;
  const contactStart = Number((projectStart + projectCount * projectLength - 0.25).toFixed(2));
  const end = Number((projectStart + projectCount * projectLength + 2.4).toFixed(2));
  return { projectStart, projectLength, contactStart, end };
}

export function projectSlice(
  story: number,
  timeline: TimelineConfig,
  projectCount: number,
): ProjectSlice {
  const position = (story - timeline.projectStart) / timeline.projectLength;
  const index = Math.min(projectCount - 1, Math.max(0, Math.floor(position)));
  const local = clamp(position - index);
  const entry = ease(index === 0 ? (story - 4.08) / 0.85 : local / 0.22);
  return { index, local, entry };
}

export interface StoryZone {
  min: number;
  max: number;
  beat: number;
}

export function storyRestZones(
  timeline: TimelineConfig,
  projectCount: number,
): StoryZone[] {
  const zones: StoryZone[] = [
    { min: 0, max: 0.2, beat: 0 },
    // Wait until both the about copy reveal and dither-to-photo transition (2.0..2.85) finish,
    // and snap again once photo-to-dither (3.35..3.85) begins.
    { min: 2.85, max: 3.35, beat: 2.85 },
  ];
  for (let i = 0; i < projectCount; i++) {
    const start = timeline.projectStart + i * timeline.projectLength;
    const min = i === 0 ? start + 0.3 : start + timeline.projectLength * 0.22;
    const max =
      i === projectCount - 1
        ? timeline.contactStart - 0.5
        : start + timeline.projectLength * 0.8;
    zones.push({
      min: Number(min.toFixed(2)),
      max: Number(max.toFixed(2)),
      beat: Number((start + 0.85).toFixed(2)),
    });
  }
  zones.push({
    min: Number((timeline.contactStart + 1.2).toFixed(2)),
    max: timeline.end,
    beat: Number((timeline.contactStart + 1.45).toFixed(2)),
  });
  return zones;
}

/**
 * Returns the beat to snap to when `story` rests inside a transition gap,
 * or `null` when already inside a readable plateau.
 */
export function snapBeatForStory(
  story: number,
  timeline: TimelineConfig,
  projectCount: number,
  direction: -1 | 0 | 1,
): number | null {
  const zones = storyRestZones(timeline, projectCount);
  for (let i = 0; i < zones.length; i++) {
    const z = zones[i];
    if (story >= z.min && story <= z.max) {
      return null;
    }
    const next = zones[i + 1];
    if (next && story > z.max && story < next.min) {
      const span = Math.max(0.001, next.min - z.max);
      const frac = (story - z.max) / span;
      if (direction > 0) {
        return frac >= 0.18 ? next.beat : z.beat;
      }
      if (direction < 0) {
        return frac <= 0.82 ? z.beat : next.beat;
      }
      return frac >= 0.5 ? next.beat : z.beat;
    }
  }
  return null;
}

export function beatForHash(hash: string, timeline: TimelineConfig): number | null {
  switch (hash) {
    case "#top":
      return 0;
    case "#about":
      return 2.85;
    case "#work":
      return 5.35;
    case "#contact":
      return Number((timeline.contactStart + 1.45).toFixed(2));
    default:
      return null;
  }
}
