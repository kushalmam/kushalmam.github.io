import type { ProjectDiagramId } from "../portfolioProjects";
import { clamp, ease, mix } from "../timeline";
import { renderBayerDither } from "./dither";

const SOURCE_W = 480;
const SOURCE_H = 360;
const TARGET_W = 360;
const TARGET_H = 270;

let sharedSource: HTMLCanvasElement | null = null;
let sharedTarget: HTMLCanvasElement | null = null;

function ensureCanvases(): {
  source: HTMLCanvasElement;
  target: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} | null {
  if (!sharedSource) {
    sharedSource = document.createElement("canvas");
    sharedSource.width = SOURCE_W;
    sharedSource.height = SOURCE_H;
  }
  if (!sharedTarget) {
    sharedTarget = document.createElement("canvas");
    sharedTarget.width = TARGET_W;
    sharedTarget.height = TARGET_H;
  }
  const ctx = sharedSource.getContext("2d");
  if (!ctx) return null;
  return { source: sharedSource, target: sharedTarget, ctx };
}

function drawRoundedRect(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w * 0.5, h * 0.5);
  c.beginPath();
  c.moveTo(x + radius, y);
  c.lineTo(x + w - radius, y);
  c.quadraticCurveTo(x + w, y, x + w, y + radius);
  c.lineTo(x + w, y + h - radius);
  c.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  c.lineTo(x + radius, y + h);
  c.quadraticCurveTo(x, y + h, x, y + h - radius);
  c.lineTo(x, y + radius);
  c.quadraticCurveTo(x, y, x + radius, y);
  c.closePath();
}

function drawRekindleScene(
  c: CanvasRenderingContext2D,
  phase: number,
  clock: number,
): void {
  const pulse = 0.5 + 0.5 * Math.sin(clock * 2.2);
  const entrance = ease(phase / 0.35);

  // Left: 3 braided history/signal streams converging into central prism encoder
  const streamColors = ["#c8cec4", "#e6e8dc", "#9ab5a0"];
  for (let s = 0; s < 3; s++) {
    const startY = 82 + s * 98;
    const endY = 180 + (s - 1) * 14;
    c.beginPath();
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const x = 34 + t * 176;
      const wave =
        Math.sin(t * 7 + s * 2.1 - clock * 1.4) * (16 * (1 - t * 0.65));
      const y = mix(startY, endY, ease(t)) + wave;
      if (i === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.strokeStyle = streamColors[s];
    c.lineWidth = 4;
    c.stroke();

    // Source nodes
    c.beginPath();
    c.arc(34, startY, 10, 0, Math.PI * 2);
    c.fillStyle = s === 1 ? "#ebeae0" : "#8f988f";
    c.fill();
    c.strokeStyle = "#161b18";
    c.lineWidth = 3;
    c.stroke();

    // Animated signal packet along each stream
    const pt = ((clock * 0.42 + s * 0.33) % 1);
    const px = 34 + pt * 176;
    const py =
      mix(startY, endY, ease(pt)) +
      Math.sin(pt * 7 + s * 2.1 - clock * 1.4) * (16 * (1 - pt * 0.65));
    c.beginPath();
    c.arc(px, py, 6.5, 0, Math.PI * 2);
    c.fillStyle = "#f2f3e8";
    c.fill();
    c.strokeStyle = "#161b18";
    c.lineWidth = 2;
    c.stroke();
  }

  // Central chamfered prism / two-tower encoder block
  c.save();
  c.translate(226, 180);
  c.beginPath();
  c.moveTo(-22, -46);
  c.lineTo(18, -56);
  c.lineTo(28, 0);
  c.lineTo(18, 56);
  c.lineTo(-22, 46);
  c.lineTo(-30, 0);
  c.closePath();
  c.fillStyle = "#2b332e";
  c.fill();
  c.strokeStyle = "#d9ddd3";
  c.lineWidth = 3.5;
  c.stroke();

  c.beginPath();
  c.arc(0, 0, 10 + pulse * 3, 0, Math.PI * 2);
  c.fillStyle = "#d0e6d2";
  c.fill();
  c.restore();

  // Connector fan from prism to 6 ranked shelves
  const order = [2, 0, 4, 1, 5, 3];
  const cycle = (clock * 0.14) % 1;
  const turn = ease(cycle < 0.5 ? cycle * 2.6 : (cycle - 0.5) * 2.6);

  for (let row = 0; row < 6; row++) {
    const targetRank = cycle < 0.5 ? order.indexOf(row) : row;
    const prevRank = cycle < 0.5 ? row : order.indexOf(row);
    const rank = mix(prevRank, targetRank, turn);
    const y = 52 + rank * 48;
    const isTop = rank < 2.5;
    const barW = (132 + (5 - rank) * 10) * (0.4 + 0.6 * entrance);

    c.beginPath();
    c.moveTo(254, 180);
    c.bezierCurveTo(272, 180, 274, y + 14, 290, y + 14);
    c.strokeStyle = isTop ? "#b9d6bc" : "#566059";
    c.lineWidth = isTop ? 2.5 : 1.5;
    c.stroke();

    drawRoundedRect(c, 292, y, barW, 28, 5);
    c.fillStyle = isTop ? (rank < 1 ? "#ebeae0" : "#b9d6bc") : "#535c56";
    c.fill();
    c.strokeStyle = "#161b18";
    c.lineWidth = 3;
    c.stroke();

    // Inner score bar + rank chevron for top 3 items
    drawRoundedRect(c, 304, y + 9, barW * (isTop ? 0.52 : 0.32), 10, 2);
    c.fillStyle = isTop ? "#232a25" : "#89938c";
    c.fill();

    if (isTop) {
      const cx = 292 + barW - 18;
      const cy = y + 16;
      c.beginPath();
      c.moveTo(cx - 6, cy + 2);
      c.lineTo(cx, cy - 5);
      c.lineTo(cx + 6, cy + 2);
      c.strokeStyle = "#18201b";
      c.lineWidth = 3;
      c.stroke();
    }
  }
}

function drawAutoCPTScene(
  c: CanvasRenderingContext2D,
  phase: number,
  clock: number,
): void {
  // Left: Framed live audio waveform + scrolling clinical transcript lines
  drawRoundedRect(c, 26, 46, 178, 268, 8);
  c.fillStyle = "#1e2320";
  c.fill();
  c.strokeStyle = "#9ca49c";
  c.lineWidth = 3;
  c.stroke();

  // 28 animated spectrum bars
  for (let i = 0; i < 28; i++) {
    const p = i / 27;
    const envelope = Math.sin(p * Math.PI);
    const amp =
      (12 +
        42 *
          (0.5 + 0.5 * Math.sin(i * 0.65 - clock * 3.2)) *
          (0.55 + 0.45 * Math.cos(i * 1.1 + clock * 1.9))) *
      envelope;
    const bx = 40 + i * 5.4;
    c.fillStyle = amp > 28 ? "#efe7cf" : "#96a29a";
    c.fillRect(bx, 118 - amp, 3.2, amp * 2);
  }

  // Scrolling transcript bars with highlighted phrase
  const activeLine = Math.floor(clock * 0.55) % 4;
  for (let line = 0; line < 4; line++) {
    const ly = 202 + line * 24;
    const lw = 112 + ((line * 37) % 34);
    const highlighted = line === activeLine;
    drawRoundedRect(c, 42, ly, lw, 11, 3);
    c.fillStyle = highlighted ? "#f3e4b8" : "#646d67";
    c.fill();
    if (highlighted) {
      c.strokeStyle = "#181d1a";
      c.lineWidth = 2;
      c.stroke();
    }
  }

  // Right: 2x2 grid of structured CPT code cards
  const cards = [
    { x: 266, y: 52 },
    { x: 368, y: 74 },
    { x: 262, y: 194 },
    { x: 366, y: 214 },
  ];
  const activeCard = Math.floor(clock * 0.55 + clamp(phase) * 0.5) % 4;
  const sourceY = 207 + activeLine * 24;

  // Flowing curved connector traces from active transcript highlight to cards
  cards.forEach((card, idx) => {
    const targetY = card.y + 42;
    const active = idx === activeCard;
    c.beginPath();
    c.moveTo(204, sourceY);
    c.bezierCurveTo(234, sourceY, 236, targetY, card.x, targetY);
    c.strokeStyle = active ? "#f3e4b8" : "#565f59";
    c.lineWidth = active ? 3.5 : 1.5;
    c.stroke();

    if (active) {
      const t = (clock * 0.9) % 1;
      const omt = 1 - t;
      const px =
        omt * omt * omt * 204 +
        3 * omt * omt * t * 234 +
        3 * omt * t * t * 236 +
        t * t * t * card.x;
      const py =
        omt * omt * omt * sourceY +
        3 * omt * omt * t * sourceY +
        3 * omt * t * t * targetY +
        t * t * t * targetY;
      c.beginPath();
      c.arc(px, py, 6, 0, Math.PI * 2);
      c.fillStyle = "#fff4cf";
      c.fill();
      c.strokeStyle = "#181d1a";
      c.lineWidth = 2;
      c.stroke();
    }
  });

  cards.forEach((card, idx) => {
    const active = idx === activeCard;
    const w = 88;
    const h = 84;
    drawRoundedRect(c, card.x, card.y, w, h, 6);
    c.fillStyle = active ? "#f3e4b8" : "#444d47";
    c.fill();
    c.strokeStyle = "#181d1a";
    c.lineWidth = 3;
    c.stroke();

    // Bold 5-digit CPT code block bars
    for (let d = 0; d < 5; d++) {
      c.fillStyle = active ? "#1c221e" : "#b8c0b8";
      c.fillRect(card.x + 12 + d * 13, card.y + 18, 9, 18);
    }
    // Metadata line & confidence meter
    c.fillStyle = active ? "#464d47" : "#7f8982";
    c.fillRect(card.x + 12, card.y + 46, 54, 6);
    c.fillStyle = active ? "#222924" : "#96a099";
    c.fillRect(card.x + 12, card.y + 62, active ? 64 : 40, 8);

    // Corner lock-in brackets on active card
    if (active) {
      c.strokeStyle = "#f5edd2";
      c.lineWidth = 3;
      const pad = 6;
      const len = 12;
      c.beginPath();
      c.moveTo(card.x - pad, card.y - pad + len);
      c.lineTo(card.x - pad, card.y - pad);
      c.lineTo(card.x - pad + len, card.y - pad);
      c.moveTo(card.x + w + pad - len, card.y + h + pad);
      c.lineTo(card.x + w + pad, card.y + h + pad);
      c.lineTo(card.x + w + pad, card.y + h + pad - len);
      c.stroke();
    }
  });
}

function drawNBAnomalyScene(
  c: CanvasRenderingContext2D,
  phase: number,
  clock: number,
): void {
  const cx = 124;
  const cy = 180;
  const radius = 84;
  const spin = clock * 0.45;
  const rise = ease(clamp((phase - 0.05) / 0.65));

  // Left: 3D-shaded rotating basketball with meridian & curved side seams
  const grad = c.createRadialGradient(
    cx - 28,
    cy - 30,
    10,
    cx,
    cy,
    radius,
  );
  grad.addColorStop(0, "#f1aa74");
  grad.addColorStop(0.55, "#d88855");
  grad.addColorStop(1, "#523220");

  c.save();
  c.beginPath();
  c.arc(cx, cy, radius, 0, Math.PI * 2);
  c.fillStyle = grad;
  c.fill();
  c.clip();

  c.strokeStyle = "#191c1a";
  c.lineWidth = 4.5;

  // Horizontal equator seam
  c.beginPath();
  c.moveTo(cx - radius, cy);
  c.lineTo(cx + radius, cy);
  c.stroke();

  // Rotating vertical meridian seam
  const meridianOffset = Math.sin(spin) * radius * 0.88;
  c.beginPath();
  c.moveTo(cx, cy - radius);
  c.quadraticCurveTo(cx + meridianOffset * 1.4, cy, cx, cy + radius);
  c.stroke();

  // Classic side curved ribs
  for (const dir of [-1, 1]) {
    c.beginPath();
    c.ellipse(
      cx + dir * radius * 0.72 + Math.cos(spin) * 14,
      cy,
      radius * 0.46,
      radius * 0.78,
      0,
      0,
      Math.PI * 2,
    );
    c.stroke();
  }
  c.restore();

  c.beginPath();
  c.arc(cx, cy, radius, 0, Math.PI * 2);
  c.strokeStyle = "#191c1a";
  c.lineWidth = 4;
  c.stroke();

  // Right: Baseline grid + 10 player-distribution columns
  const baseX = 238;
  const baseY = 296;
  const chartW = 216;
  c.strokeStyle = "#566059";
  c.lineWidth = 2;
  for (let g = 0; g < 4; g++) {
    const gy = baseY - g * 66;
    c.beginPath();
    c.moveTo(baseX, gy);
    c.lineTo(baseX + chartW, gy);
    c.stroke();
  }

  for (let col = 0; col < 10; col++) {
    const isOutlier = col === 6;
    const rawH = isOutlier
      ? 226
      : 54 + Math.abs(Math.sin(col * 1.9 + 0.4)) * 88;
    const colH = rawH * (0.25 + 0.75 * rise);
    const x = baseX + 6 + col * 21;
    const y = baseY - colH;

    drawRoundedRect(c, x, y, 14, colH, 3);
    c.fillStyle = isOutlier ? "#f4e07c" : "#808c84";
    c.fill();
    c.strokeStyle = "#171c19";
    c.lineWidth = 2.5;
    c.stroke();

    if (isOutlier) {
      // Target crosshair reticle around the outlier peak
      const rx = x + 7;
      const ry = y;
      const ringR = 16 + Math.sin(clock * 3) * 2.5;
      c.strokeStyle = "#faf0b4";
      c.lineWidth = 2.5;
      c.beginPath();
      c.arc(rx, ry, ringR, 0, Math.PI * 2);
      c.stroke();

      c.beginPath();
      c.moveTo(rx - ringR - 6, ry);
      c.lineTo(rx - ringR + 4, ry);
      c.moveTo(rx + ringR - 4, ry);
      c.lineTo(rx + ringR + 6, ry);
      c.moveTo(rx, ry - ringR - 6);
      c.lineTo(rx, ry - ringR + 4);
      c.stroke();
    }
  }
}

function drawCosmicRecompScene(
  c: CanvasRenderingContext2D,
  clock: number,
): void {
  const cx = 240;
  const cy = 180;

  // Multi-beat mechanical Ultimatrix cycle (~3.6s loop)
  const period = 3.6;
  const cyclePos = (clock % period) / period;
  const spinStep = Math.floor(clock / period);
  const detentPhase = ease(clamp(cyclePos / 0.34));
  const bezelAngle = (spinStep + detentPhase) * (Math.PI / 4);
  const corePop =
    cyclePos < 0.34
      ? 0
      : cyclePos < 0.72
        ? ease((cyclePos - 0.34) / 0.16)
        : 1 - ease((cyclePos - 0.72) / 0.28);
  const wavePhase = cyclePos > 0.56 ? clamp((cyclePos - 0.56) / 0.36) : 0;

  // Subtle rotating perimeter ticks around the dial
  c.save();
  c.translate(cx, cy);
  c.rotate(clock * 0.08);
  for (let i = 0; i < 32; i++) {
    const a = (i / 32) * Math.PI * 2;
    const inner = i % 4 === 0 ? 142 : 148;
    c.beginPath();
    c.moveTo(Math.cos(a) * inner, Math.sin(a) * inner);
    c.lineTo(Math.cos(a) * 155, Math.sin(a) * 155);
    c.strokeStyle = i % 4 === 0 ? "#85b894" : "#445449";
    c.lineWidth = i % 4 === 0 ? 3 : 2;
    c.stroke();
  }
  c.restore();

  // Outer Ultimatrix metallic bezel, 4 compact diagonal clasp lugs & 4 glowing indicator pips
  c.save();
  c.translate(cx, cy);
  c.rotate(bezelAngle);

  for (let lug = 0; lug < 4; lug++) {
    c.save();
    c.rotate(Math.PI / 4 + (lug * Math.PI) / 2);
    c.beginPath();
    c.moveTo(-22, -104);
    c.lineTo(22, -104);
    c.lineTo(27, -122);
    c.lineTo(-27, -122);
    c.closePath();
    c.fillStyle = "#8a968e";
    c.fill();
    c.strokeStyle = "#141a16";
    c.lineWidth = 3.5;
    c.stroke();

    c.fillStyle = "#2d3731";
    c.fillRect(-11, -117, 22, 6);
    c.restore();
  }

  // Outer bevel ring
  c.beginPath();
  c.arc(0, 0, 112, 0, Math.PI * 2);
  c.fillStyle = "#48544d";
  c.fill();
  c.strokeStyle = "#141a16";
  c.lineWidth = 4;
  c.stroke();

  // Main stepped metallic slate ring
  c.beginPath();
  c.arc(0, 0, 102, 0, Math.PI * 2);
  c.fillStyle = "#9aa79e";
  c.fill();
  c.strokeStyle = "#141a16";
  c.lineWidth = 3.5;
  c.stroke();

  // Recessed dark bezel groove
  c.beginPath();
  c.arc(0, 0, 91, 0, Math.PI * 2);
  c.strokeStyle = "#141a16";
  c.lineWidth = 4;
  c.stroke();

  // 4 glowing emerald-green Ultimatrix indicator lights at 0, 90, 180, 270 deg
  for (let pip = 0; pip < 4; pip++) {
    const a = (pip * Math.PI) / 2;
    const px = Math.cos(a) * 98;
    const py = Math.sin(a) * 98;
    c.beginPath();
    c.arc(px, py, 6, 0, Math.PI * 2);
    c.fillStyle = "#78f59a";
    c.fill();
    c.strokeStyle = "#141a16";
    c.lineWidth = 2.5;
    c.stroke();
  }

  c.restore();

  // Full-bleed circular Omnitrix / Ultimatrix dial interior
  const dialR = 84;
  c.save();
  c.translate(cx, cy);

  c.beginPath();
  c.arc(0, 0, dialR, 0, Math.PI * 2);
  c.clip();

  // Luminous radial emerald gradient filling the entire dial circle
  const emerald = c.createRadialGradient(0, 0, 6, 0, 0, dialR);
  emerald.addColorStop(0, "#b4ffd0");
  emerald.addColorStop(0.55, "#62ee84");
  emerald.addColorStop(1, "#36be5d");
  c.fillStyle = emerald;
  c.fillRect(-dialR - 2, -dialR - 2, dialR * 2 + 4, dialR * 2 + 4);

  // Subtle diagonal dial scanline during detent spin
  if (detentPhase > 0.02 && detentPhase < 0.98) {
    const offset = -120 + detentPhase * 240;
    c.strokeStyle = "#d8ffe8";
    c.lineWidth = 5;
    c.beginPath();
    c.moveTo(offset - 70, -dialR);
    c.lineTo(offset + 70, dialR);
    c.stroke();
  }

  // Left & right matte-black inward-pointing chevron plates forming the iconic hourglass
  const slide = corePop * 5;
  const waistX = 10 + slide;

  const drawSidePlate = (dir: -1 | 1) => {
    c.beginPath();
    c.moveTo(dir * 62, -74);
    c.lineTo(dir * 95, -74);
    c.lineTo(dir * 95, 74);
    c.lineTo(dir * 62, 74);
    c.lineTo(dir * waistX, 0);
    c.closePath();
    c.fillStyle = "#111613";
    c.fill();

    // Signature Ultimatrix metallic silver/ivory bevel border along the chevron V-edge
    c.beginPath();
    c.moveTo(dir * 62, -74);
    c.lineTo(dir * waistX, 0);
    c.lineTo(dir * 62, 74);
    c.strokeStyle = "#dfe6df";
    c.lineWidth = 7;
    c.lineJoin = "miter";
    c.stroke();

    // Crisp dark inner hairline separating silver bevel from emerald core
    c.beginPath();
    c.moveTo(dir * 62, -74);
    c.lineTo(dir * waistX, 0);
    c.lineTo(dir * 62, 74);
    c.strokeStyle = "#0e1310";
    c.lineWidth = 2;
    c.stroke();
  };

  drawSidePlate(-1);
  drawSidePlate(1);

  c.restore();

  // Crisp inner dial ring border framing the full-bleed circular hourglass
  c.beginPath();
  c.arc(cx, cy, dialR, 0, Math.PI * 2);
  c.strokeStyle = "#141a16";
  c.lineWidth = 4;
  c.stroke();

  // Expanding lock-in shockwave ring
  if (wavePhase > 0 && wavePhase < 1) {
    const waveR = 54 + wavePhase * 98;
    c.beginPath();
    c.arc(cx, cy, waveR, 0, Math.PI * 2);
    c.strokeStyle = wavePhase < 0.6 ? "#9effba" : "#5bb876";
    c.lineWidth = Math.max(1.5, 4.5 * (1 - wavePhase));
    c.stroke();
  }
}

export function renderProjectVisual(
  id: ProjectDiagramId,
  phase: number,
  clock: number,
  lightMode: boolean,
): HTMLCanvasElement {
  const canvases = ensureCanvases();
  if (!canvases) {
    const fallback = document.createElement("canvas");
    fallback.width = TARGET_W;
    fallback.height = TARGET_H;
    return fallback;
  }

  const { source, target, ctx } = canvases;
  ctx.clearRect(0, 0, SOURCE_W, SOURCE_H);

  if (id === "rekindle") {
    drawRekindleScene(ctx, phase, clock);
  } else if (id === "autocpt") {
    drawAutoCPTScene(ctx, phase, clock);
  } else if (id === "nbanomaly") {
    drawNBAnomalyScene(ctx, phase, clock);
  } else {
    drawCosmicRecompScene(ctx, clock);
  }

  renderBayerDither(source, target, {
    cellSize: 2,
    lightMode,
    preserveColor: true,
    edgeStrength: id === "cosmicrecomp" ? 0.56 : 0.48,
  });

  return target;
}
