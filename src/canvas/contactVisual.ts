import { renderBayerDither } from "./dither";

export const CONTACT_FACES = ["Bungee", "Monoton", "Dela Gothic One", "Archivo"] as const;
export const CONTACT_WORDS = [
  "build.",
  "make.",
  "ship.",
  "talk.",
  "break.",
  "connect.",
] as const;

type AccentKind = "none" | "launch" | "slice" | "brackets";

interface WordStyle {
  word: (typeof CONTACT_WORDS)[number];
  family: (typeof CONTACT_FACES)[number];
  weight: 400 | 800;
  shadow: string;
  stops: readonly [string, string, string];
  accent: AccentKind;
}

const WORD_STYLES: readonly WordStyle[] = [
  {
    word: "build.",
    family: "Bungee",
    weight: 400,
    shadow: "#213358",
    stops: ["#82f7be", "#4cc9e0", "#f4f6e8"],
    accent: "none",
  },
  {
    word: "make.",
    family: "Monoton",
    weight: 400,
    shadow: "#4a2538",
    stops: ["#f7cf6a", "#ed7d5e", "#f8f1e0"],
    accent: "none",
  },
  {
    word: "ship.",
    family: "Archivo",
    weight: 800,
    shadow: "#192d5c",
    stops: ["#5ea2ff", "#6cf0ff", "#f2f8ff"],
    accent: "launch",
  },
  {
    word: "talk.",
    family: "Dela Gothic One",
    weight: 400,
    shadow: "#242a5c",
    stops: ["#74a8ff", "#5ee8ce", "#e8eaff"],
    accent: "none",
  },
  {
    word: "break.",
    family: "Bungee",
    weight: 400,
    shadow: "#4d2024",
    stops: ["#ff7759", "#f8c05a", "#fff3dc"],
    accent: "slice",
  },
  {
    word: "connect.",
    family: "Dela Gothic One",
    weight: 400,
    shadow: "#183a2c",
    stops: ["#6bf08c", "#74e8d2", "#f6df7d"],
    accent: "brackets",
  },
];

const SOURCE_W = 640;
const SOURCE_H = 320;
const TARGET_W = 480;
const TARGET_H = 240;

let sourceCanvas: HTMLCanvasElement | null = null;
let targetCanvas: HTMLCanvasElement | null = null;
let sourceCtx: CanvasRenderingContext2D | null = null;

export function contactWordHasMotion(wordIndex: number): boolean {
  const idx =
    ((wordIndex % WORD_STYLES.length) + WORD_STYLES.length) % WORD_STYLES.length;
  return WORD_STYLES[idx].accent !== "none";
}

function ensureCanvases(): {
  source: HTMLCanvasElement;
  target: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} | null {
  if (!sourceCanvas) {
    sourceCanvas = document.createElement("canvas");
    sourceCanvas.width = SOURCE_W;
    sourceCanvas.height = SOURCE_H;
    sourceCtx = sourceCanvas.getContext("2d", { willReadFrequently: true });
  }
  if (!targetCanvas) {
    targetCanvas = document.createElement("canvas");
    targetCanvas.width = TARGET_W;
    targetCanvas.height = TARGET_H;
  }
  if (!sourceCtx) {
    sourceCtx = sourceCanvas.getContext("2d", { willReadFrequently: true });
  }
  if (!sourceCtx) return null;
  return { source: sourceCanvas, target: targetCanvas, ctx: sourceCtx };
}

function drawFittedLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  family: string,
  weight: number,
  centerY: number,
  maxSize: number,
  maxWidth: number,
  fill: string | CanvasGradient,
  dx = 0,
  dy = 0,
): number {
  let size = maxSize;
  ctx.font = `${weight} ${size}px "${family}", Archivo, sans-serif`;
  const measured = ctx.measureText(text).width;
  if (measured > maxWidth) {
    size *= maxWidth / measured;
    ctx.font = `${weight} ${size}px "${family}", Archivo, sans-serif`;
  }
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = fill;
  ctx.fillText(text, 28 + dx, centerY + dy);
  return Math.min(maxWidth, ctx.measureText(text).width);
}

export function renderContactVisual(
  wordIndex: number,
  clock: number,
  lightMode: boolean,
  reveal = 1,
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

  const idx =
    ((wordIndex % WORD_STYLES.length) + WORD_STYLES.length) % WORD_STYLES.length;
  const style = WORD_STYLES[idx];

  const sweep = Math.sin(clock * 0.9) * 90;
  const grad = ctx.createLinearGradient(
    20 + sweep,
    10,
    SOURCE_W - 40 + sweep,
    SOURCE_H - 10,
  );
  grad.addColorStop(0, style.stops[0]);
  grad.addColorStop(0.52, style.stops[1]);
  grad.addColorStop(1, style.stops[2]);

  // Chromatic offset shadow layer for tactile depth
  drawFittedLine(
    ctx,
    "Let’s",
    style.family,
    style.weight,
    90,
    108,
    540,
    style.shadow,
    5,
    6,
  );
  drawFittedLine(
    ctx,
    style.word,
    style.family,
    style.weight,
    220,
    148,
    564,
    style.shadow,
    5,
    6,
  );

  // Foreground multi-stop color gradient typography
  drawFittedLine(ctx, "Let’s", style.family, style.weight, 90, 108, 540, grad);
  const wordWidth = drawFittedLine(
    ctx,
    style.word,
    style.family,
    style.weight,
    220,
    148,
    564,
    grad,
  );

  // Per-word graphic variety accents
  if (style.accent === "launch") {
    const barProgress = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(clock * 1.9));
    const barW = Math.min(540, wordWidth * barProgress);
    ctx.fillStyle = style.stops[1];
    ctx.fillRect(28, 286, barW, 8);
    ctx.strokeStyle = style.stops[2];
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(28 + barW - 14, 276);
    ctx.lineTo(28 + barW + 4, 290);
    ctx.lineTo(28 + barW - 14, 304);
    ctx.stroke();
  } else if (style.accent === "slice") {
    const sliceY = 196 + Math.sin(clock * 2.8) * 18;
    ctx.fillStyle = "#10110f";
    ctx.fillRect(20, sliceY, 590, 6);
    ctx.fillStyle = style.stops[0];
    ctx.fillRect(24, sliceY + 12, Math.min(560, wordWidth * 0.45), 4);
  } else if (style.accent === "brackets") {
    const pulse = Math.sin(clock * 2.1) * 6;
    const rightX = Math.min(614, 46 + wordWidth + pulse);
    ctx.strokeStyle = style.stops[0];
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(24 - pulse, 152);
    ctx.lineTo(12 - pulse, 152);
    ctx.lineTo(12 - pulse, 288);
    ctx.lineTo(24 - pulse, 288);
    ctx.moveTo(rightX - 12, 152);
    ctx.lineTo(rightX, 152);
    ctx.lineTo(rightX, 288);
    ctx.lineTo(rightX - 12, 288);
    ctx.stroke();
  }

  renderBayerDither(source, target, {
    cellSize: 2,
    ditherAmount: 0.2,
    lightMode,
    preserveColor: true,
    edgeStrength: 0.36,
    gamma: 0.9,
    reveal,
  });

  return target;
}
