import type { ProjectDiagramId } from "../portfolioProjects";
import { ease, mix } from "../timeline";

export interface DiagramPoint {
  x: number;
  y: number;
  char: string;
  alpha: number;
  bank?: string;
  seed?: number;
  depth?: boolean;
}

const SYMBOL_BANKS = [". ,:;`", "/\\|_-~", "()[]{}<>", "+*=#%@&"] as const;

export function buildProjectDiagram(
  id: ProjectDiagramId,
  phase: number,
  clock: number,
): DiagramPoint[] {
  const points: DiagramPoint[] = [];
  const clamp = (v: number) => Math.max(0, Math.min(1, v));

  function point(x: number, y: number, z = 0, light = 0.7) {
    const a = Math.sin(clock * 0.09) * 0.13;
    const rx = x * Math.cos(a) + z * Math.sin(a);
    const rz = -x * Math.sin(a) + z * Math.cos(a);
    const perspective = 2.9 / (2.9 - rz);
    const value = clamp(light);
    const bank = SYMBOL_BANKS[Math.min(3, Math.floor(value * 4))];
    const variation = Math.abs(Math.floor(x * 39 + y * 57 + z * 83));
    const char = bank[variation % bank.length];
    points.push({
      x: 0.5 + rx * 0.43 * perspective,
      y: 0.5 + y * 0.43 * perspective,
      char,
      alpha: 0.18 + value * 0.78,
    });
  }

  if (id === "rekindle") {
    // Three lateral retrieval currents braid together before opening into ranking shelves.
    for (let stream = 0; stream < 3; stream++) {
      for (let u = 0; u < 108; u++) {
        for (let v = 0; v < 8; v++) {
          const p = u / 107;
          const merge = ease((p - 0.12) / 0.78);
          const width = (v / 7 - 0.5) * 0.15;
          point(
            -1.12 + p * 1.34,
            (stream - 1) * 0.78 * (1 - merge) +
              Math.sin(p * 8 + stream * 2.1 - clock * 0.3) * (0.07 + merge * 0.13) +
              width,
            Math.cos(p * 7 + stream * 2.1 - clock * 0.2) * (0.12 + merge * 0.22),
            0.27 + 0.53 * (0.5 + 0.5 * Math.cos(p * 35 - clock * 1.7 + stream)),
          );
        }
      }
    }
    for (let strand = 0; strand < 5; strand++) {
      for (let i = 0; i < 76; i++) {
        const p = i / 75;
        const angle = p * 10 + strand * Math.PI * 0.4 - clock * 0.35;
        const radius = 0.27 * (1 - p * 0.4);
        point(
          -0.55 + p * 0.8,
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          0.23 + 0.3 * Math.max(0, Math.sin(angle)),
        );
      }
    }
    const order = [2, 0, 4, 1, 5, 3];
    const cycle = (clock * 0.105) % 1;
    const turn = ease(cycle < 0.5 ? cycle * 3 : (cycle - 0.5) * 3);
    for (let row = 0; row < 6; row++) {
      for (let u = 0; u < 57; u++) {
        for (let v = 0; v < 7; v++) {
          const target = cycle < 0.5 ? order.indexOf(row) : row;
          const previous = cycle < 0.5 ? row : order.indexOf(row);
          const rank = mix(previous, target, turn);
          const p = u / 56;
          const q = v / 6 - 0.5;
          const length = 0.47 + (5 - row) * 0.055;
          point(
            0.29 + p * length,
            -0.84 + rank * 0.33 + q * 0.055 + Math.sin(p * Math.PI) * 0.05,
            q * 0.24 + Math.sin(p * 4 + clock * 0.13) * 0.1,
            (target < 3 ? 0.88 : 0.48) * (0.72 + 0.28 * Math.cos(p * 33 - clock * 0.7)),
          );
        }
      }
    }
  } else if (id === "autocpt") {
    // Speech occupies the left volume; fragments branch into a two-by-two field of code structures.
    for (let x = 0; x < 72; x++) {
      for (let band = 0; band < 15; band++) {
        const p = x / 71;
        const q = (band / 14) * 2 - 1;
        const amplitude = 0.15 + 0.57 * (0.5 + 0.5 * Math.sin(p * 14 - clock * 1.3));
        point(
          -1.1 + p * 0.62,
          q * amplitude * Math.sin(p * Math.PI),
          Math.sin(p * 10 - clock * 0.3 + q) * 0.22,
          0.26 + 0.53 * (1 - Math.abs(q)),
        );
      }
    }
    const centers: [number, number][] = [
      [0.35, -0.58],
      [0.86, -0.36],
      [0.29, 0.43],
      [0.83, 0.66],
    ];
    for (let group = 0; group < 24; group++) {
      const p = (clock * 0.055 + group / 24) % 1;
      const target = centers[group % 4];
      const cx = mix(-0.45, target[0], p);
      const cy =
        mix(Math.sin(group * 2.1) * 0.49, target[1], p) +
        Math.sin(p * Math.PI) * Math.sin(group) * 0.2;
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 3; y++) {
          point(
            cx + (x - 5) * 0.014,
            cy + y * 0.018,
            Math.sin(p * 7 + group) * 0.17,
            0.28 + 0.46 * p,
          );
        }
      }
    }
    centers.forEach(([cx, cy], stack) => {
      for (let layer = 0; layer < 3; layer++) {
        for (let u = 0; u < 27; u++) {
          for (let v = 0; v < 6; v++) {
            const p = u / 26;
            const q = v / 5 - 0.5;
            point(
              cx + (p - 0.5) * 0.36,
              cy + layer * 0.085 + Math.sin(p * Math.PI) * 0.035,
              q * 0.2 + Math.sin(stack) * 0.08,
              0.37 + 0.4 * (0.5 + 0.5 * Math.cos(p * 22 - clock * 0.5 + layer)),
            );
          }
        }
      }
    });
  } else if (id === "nbanomaly") {
    // Peel coherent meridians from a recognizable basketball into a field of player distributions.
    const change = ease((phase - 0.1) / 0.79);
    const rotation = clock * 0.19;
    for (let lat = 1; lat < 47; lat++) {
      for (let lon = 0; lon < 90; lon++) {
        const phi = (lat / 47) * Math.PI;
        const theta = (lon / 90) * Math.PI * 2 + rotation;
        const radius = 0.67;
        const bx = -0.48 + Math.sin(phi) * Math.cos(theta) * radius;
        const by = -0.04 + Math.cos(phi) * radius;
        const bz = Math.sin(phi) * Math.sin(theta) * radius;
        if (bz < -0.12) continue;
        const group = Math.floor(lon / 9);
        const delay = (group / 10) * 0.42;
        const peel = ease((change - delay) / Math.max(0.1, 1 - delay));
        const column = group;
        const tx = 0.19 + column * 0.09 + (lat % 3) * 0.009;
        const height =
          column === 6 ? 1.47 : 0.43 + Math.abs(Math.sin(column * 1.9)) * 0.66;
        const ty = 0.8 - (lat / 47) * height;
        const seam = Math.min(Math.abs(Math.sin(theta * 2)), Math.abs(Math.cos(phi)));
        const arc = Math.sin(peel * Math.PI);
        const lighting = 0.31 + 0.55 * Math.max(0, bz / radius);
        point(
          mix(bx, tx, peel) + arc * 0.13,
          mix(by, ty, peel) + arc * Math.sin(group * 0.7) * 0.22,
          bz * (1 - peel) + arc * Math.cos(group) * 0.13,
          seam < 0.065 ? 0.14 : lighting + (column === 6 ? peel * 0.12 : 0),
        );
      }
    }
    // Remaining shell seams hold the ball's silhouette as its surface separates.
    for (let i = 0; i < 155; i++) {
      const a = (i / 154) * Math.PI * 2;
      const remain = 1 - change;
      point(-0.48 + Math.cos(a) * 0.67, -0.04 + Math.sin(a) * 0.67, 0, 0.24 * remain);
    }
    for (let col = 0; col < 10; col++) {
      for (let layer = 0; layer < 3; layer++) {
        for (let y = 0; y < 24; y++) {
          const p = y / 23;
          const height = col === 6 ? 1.47 : 0.43 + Math.abs(Math.sin(col * 1.9)) * 0.66;
          point(
            0.19 + col * 0.09 + layer * 0.01,
            0.8 - p * height,
            -0.18 + layer * 0.06,
            (col === 6 ? 0.65 : 0.22 + p * 0.15) * (0.3 + change * 0.7),
          );
        }
      }
    }
  } else {
    // Full-bleed circular Omnitrix / Ultimatrix dial silhouette, 4 indicator pips, and connected hourglass.
    const spin = clock * 0.28;
    const pulse = 0.5 + 0.5 * Math.sin(clock * 2.1);

    for (let i = 0; i < 160; i++) {
      const angle = (i / 160) * Math.PI * 2 + spin;
      point(Math.cos(angle) * 0.86, Math.sin(angle) * 0.86, 0.04, 0.62);
      point(Math.cos(angle) * 0.69, Math.sin(angle) * 0.69, 0.06, 0.45);
    }

    // 4 rotating bezel indicator pips
    for (let pip = 0; pip < 4; pip++) {
      const a = (pip * Math.PI) / 2 + spin;
      for (let r = 0; r < 6; r++) {
        const rad = 0.75 + r * 0.015;
        point(Math.cos(a) * rad, Math.sin(a) * rad, 0.1, 0.9);
      }
    }

    // Curved circular top & bottom hourglass sectors + connected center waist
    const dialLimit = 0.67;
    for (let row = -18; row <= 18; row++) {
      const y = (row / 18) * dialLimit;
      for (let col = -18; col <= 18; col++) {
        const x = (col / 18) * dialLimit;
        const r2 = x * x + y * y;
        if (r2 > dialLimit * dialLimit) continue;
        const waist = 0.085 + pulse * 0.025;
        if (Math.abs(y) < Math.max(0, Math.abs(x) - waist) * 1.18) continue;
        const onBevel = Math.abs(Math.abs(y) - Math.max(0, Math.abs(x) - waist) * 1.18) < 0.09;
        point(x, y, 0.14 + pulse * 0.04, onBevel ? 0.94 : 0.74);
      }
    }
  }

  return points;
}
