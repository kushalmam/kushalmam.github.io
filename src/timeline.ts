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
