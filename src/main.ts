import "lenis/dist/lenis.css";
import "./styles/main.css";
import Lenis from "lenis";
import { portfolioProjects } from "./portfolioProjects";
import marksData from "./data/marks.json";
import {
  beatForHash,
  clamp,
  createTimeline,
  ease,
  mix,
  projectSlice,
  smoothstep,
} from "./timeline";
import { buildProjectDiagram, type DiagramPoint } from "./canvas/diagrams";
import { applyBayerMask } from "./canvas/dither";
import { buildHobbyArt, resetHobbyCaches } from "./canvas/hobbies";
import { renderProjectVisual } from "./canvas/projectVisuals";

type MarkKey = keyof typeof marksData;
interface MarkDef {
  viewBox: string;
  paths: string[];
}
const marks: Record<MarkKey, MarkDef> = marksData;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  glyphSize?: number;
  material?: boolean;
}

interface Point2D {
  x: number;
  y: number;
  char: string;
  alpha: number;
}

interface Ripple {
  x: number;
  y: number;
  age: number;
}

interface SculptureGlyph {
  image: HTMLCanvasElement;
  width: number;
  height: number;
}

const base = import.meta.env.BASE_URL;
const app = document.getElementById("app");
if (!app) {
  throw new Error("Missing #app container");
}

app.innerHTML = `
<header>
  <a class="header-mark" href="#top" aria-label="Kushal Mamillapalli — back to top">km.</a>
  <nav aria-label="Navigation">
    <a href="#about">About</a>
    <a href="#work">Work</a>
    <a href="#contact">Say hello</a>
    <button class="theme-toggle" type="button" aria-label="Switch to light mode" aria-pressed="false">
      <span aria-hidden="true">◐</span>
      <span class="theme-label">Light</span>
    </button>
  </nav>
</header>
<main id="top">
  <div class="journey">
    <div class="stage">
      <canvas id="field" aria-hidden="true"></canvas>
      <section class="opening" aria-labelledby="name">
        <h1 id="name">Kushal<span>Mamillapalli</span></h1>
        <p class="intro">I build recommendation systems and the infrastructure behind them.</p>
        <a class="scroll-link" href="#about" aria-label="Scroll to explore"><span class="scroll-travel" aria-hidden="true"></span></a>
      </section>
      <section class="about" id="about" aria-labelledby="about-title">
        <h2 id="about-title">Curious about<br>how things connect.</h2>
        <p class="bio">I’m a data engineer at <span class="inline-org"><svg class="mark" data-mark="spotify" aria-hidden="true"></svg>Spotify</span>, working on personalization pipelines.</p>
        <img class="reduced-photo" src="${base}images/portrait-720.webp" alt="Kushal in New York">
        <p class="education"><svg class="mark" data-mark="nyu" aria-hidden="true"></svg><span>I graduated from NYU Tandon with a degree in Computer Science in 2026.</span></p>
        <div class="offscreen">
          <div class="hobbies">
            <div><canvas class="hobby-art" data-hobby="gundam" role="img" aria-label="Dithered RX-78-2 Gundam head"></canvas><span>Building Gunpla</span></div>
            <div><canvas class="hobby-art" data-hobby="mystery" role="img" aria-label="Dithered magnifying glass"></canvas><span>Murder mysteries</span></div>
            <div><canvas class="hobby-art" data-hobby="cube" role="img" aria-label="Dithered three-dimensional Rubik’s cube"></canvas><span>Rubik’s cubing</span></div>
          </div>
        </div>
      </section>
      <section class="contact-ending" id="contact" aria-labelledby="contact-title">
        <h2 id="contact-title" class="screen-reader-only">Let’s build, make, and talk.</h2>
        <p class="reduced-contact-title">Let’s talk.</p>
        <nav class="contact-links" aria-label="Contact and professional links">
          <a class="contact-email" href="mailto:kushalmam06@gmail.com">
            <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
            <span>kushalmam06@gmail.com</span>
          </a>
          <div>
            <a href="https://github.com/Techdude01">
              <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 .297C5.37.297 0 5.67 0 12.297c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.26.82-.577 0-.285-.01-1.04-.015-2.04-3.338.726-4.043-1.416-4.043-1.416-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.305-5.467-1.333-5.467-5.93 0-1.311.469-2.381 1.236-3.221-.124-.303-.536-1.524.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 0 1 3.003-.404c1.018.005 2.044.138 3.003.404 2.291-1.552 3.297-1.23 3.297-1.23.655 1.652.243 2.873.12 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .32.216.694.825.576C20.565 22.092 24 17.596 24 12.297 24 5.67 18.627.297 12 .297z"/></svg>
              <span>GitHub</span>
            </a>
            <a href="https://linkedin.com/in/kushal-mamillapalli">
              <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.35V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              <span>LinkedIn</span>
            </a>
            <a href="${base}documents/kushal-mamillapalli-resume.pdf">
              <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M14 3v6h6M8 13h8M8 17h6"/></svg>
              <span>Résumé</span>
            </a>
            <a href="${base}privacy/">
              <span>Privacy</span>
            </a>
          </div>
        </nav>
      </section>
      <div class="stage-footer" aria-hidden="true"></div>
    </div>
  </div>
</main>
`;

const canvas = document.querySelector<HTMLCanvasElement>("#field")!;
const ctx = canvas.getContext("2d")!;
const stage = document.querySelector<HTMLElement>(".stage")!;
const journey = document.querySelector<HTMLElement>(".journey")!;
const opening = document.querySelector<HTMLElement>(".opening")!;
const about = document.querySelector<HTMLElement>(".about")!;
const contact = document.querySelector<HTMLElement>(".contact-ending")!;
const stageFooter = document.querySelector<HTMLElement>(".stage-footer")!;
const themeToggle = document.querySelector<HTMLButtonElement>(".theme-toggle")!;
const themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
const root = document.documentElement;

const timeline = createTimeline(portfolioProjects.length);
const TRANSITION_SPEED = 1.6;
const CONTACT_HOLD = 4.8;
const CONTACT_PERIOD = CONTACT_HOLD + 2 / TRANSITION_SPEED;
const CONTACT_FACES = ["Bungee", "Monoton", "Dela Gothic One"] as const;
const GLYPHS = " .,:;-=+*#%@";

const reduced = matchMedia("(prefers-reduced-motion: reduce)");

let w = 0;
let h = 0;
let time = 0;
let last = 0;
let raf = 0;
let story = 0;
let paused = reduced.matches;
let visible = true;

let portrait: HTMLImageElement | null = null;
let portraitInk: HTMLCanvasElement | null = null;
let portraitPhoto: HTMLCanvasElement | null = null;
let portraitPoints: Point2D[] = [];
let atlas: HTMLCanvasElement | null = null;
let atlasCell = 0;

let contactWordClock = 0;
let contactInteraction = false;
let contactMasks: { prefixes: DiagramPoint[][]; words: DiagramPoint[][] } | null = null;
let contactLayoutCache: {
  prefixes: DiagramPoint[][];
  words: DiagramPoint[][];
  rect: Rect;
} | null = null;
let smoothScroll: Lenis | null = null;

let ambient: HTMLCanvasElement | null = null;
let ambientTheme = -2;
let ambientWidth = 0;
let waveMorphOrigin: Point2D[] | null = null;

// Interaction techniques adapted from React Bits' official sources:
// https://reactbits.dev/text-animations/ascii-text and https://reactbits.dev/animations/dither-veil
// (MIT + Commons Clause; notices retained by attribution, no component code vendored).
const hashNoise = (x: number, y: number, s: number): number => {
  const v = Math.sin(x * 12.9898 + y * 78.233 + s * 37.719) * 43758.5453;
  return v - Math.floor(v);
};

const hover = { x: 0.5, y: 0.5, inside: false };
let tiltX = 0;
let tiltY = 0;
let ripples: Ripple[] = [];

let veilMask: HTMLCanvasElement | null = null;
let veilMaskCtx: CanvasRenderingContext2D | null = null;
let veilImageData: ImageData | null = null;
let veilAlpha: Float32Array | null = null;
let veilCols = 0;
let veilRows = 0;
let veilScale: HTMLCanvasElement | null = null;
let veilScratch: HTMLCanvasElement | null = null;
const veilBrush = { x: 0, y: 0 };
let veilPresence = 0;

let frameDelta = 1 / 60;
let scrollDirty = true;
let needsDraw = true;

const sculptureGlyphs = new Map<string, SculptureGlyph>();

function isLightMode(): boolean {
  return root.dataset.mode === "light";
}

function setTheme(mode: "light" | "dark", persist = true): void {
  root.dataset.mode = mode;
  themeToggle.setAttribute("aria-pressed", String(mode === "light"));
  themeToggle.setAttribute("aria-label", `Switch to ${mode === "light" ? "dark" : "light"} mode`);
  const label = themeToggle.querySelector(".theme-label");
  const icon = themeToggle.querySelector('[aria-hidden="true"]');
  if (label) label.textContent = mode === "light" ? "Dark" : "Light";
  if (icon) icon.textContent = mode === "light" ? "◑" : "◐";
  if (themeMeta) themeMeta.setAttribute("content", mode === "light" ? "#f2f6fc" : "#10110f");
  if (persist) {
    try {
      localStorage.setItem("portfolio-theme", mode);
    } catch {
      // Ignore storage failures in restricted browsing contexts.
    }
  }
  ambient = null;
  atlas = null;
  atlasCell = 0;
  ripples = [];
  veilPresence = 0;
  sculptureGlyphs.clear();
  resetHobbyCaches();
  if (portrait) cachePortrait();
  document
    .querySelectorAll<HTMLCanvasElement>(".hobby-art")
    .forEach((target) => buildHobbyArt(target, 0, isLightMode()));
  if (reduced.matches) renderReducedDiagrams();
  needsDraw = true;
  update();
}

themeToggle.addEventListener("click", () => setTheme(isLightMode() ? "dark" : "light"));

const panels = portfolioProjects.map((project) => {
  const panel = document.createElement("section");
  panel.className = "project-panel";
  panel.id = project.slug;
  panel.setAttribute("aria-labelledby", `${project.slug}-title`);
  panel.innerHTML = `<h2 id="${project.slug}-title">${project.name}</h2><p>${project.summary}</p><a href="${project.href}">View source ↗</a><canvas class="reduced-diagram" role="img" aria-label="Illustrative ${project.name} workflow animation"></canvas>`;
  stage.insertBefore(panel, stageFooter);
  return panel;
});

canvas.setAttribute("role", "presentation");

document.querySelectorAll<SVGSVGElement>("[data-mark]").forEach((svg) => {
  const key = svg.dataset.mark as MarkKey | undefined;
  const mark = key ? marks[key] : undefined;
  if (!mark) return;
  svg.setAttribute("viewBox", mark.viewBox);
  mark.paths.forEach((d) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    svg.append(path);
  });
});

const photo = new Image();
photo.onload = () => {
  portrait = photo;
  cachePortrait();
  draw();
};
photo.src = `${base}images/portrait-720.webp`;

function cachePortrait(): void {
  if (!portrait) return;
  const cols = 100;
  const rows = Math.round((100 * portrait.height) / portrait.width);
  const size = 600;
  const ph = Math.round((size * portrait.height) / portrait.width);

  portraitPhoto = document.createElement("canvas");
  portraitPhoto.width = size;
  portraitPhoto.height = ph;
  const c = portraitPhoto.getContext("2d")!;
  c.drawImage(
    portrait,
    portrait.width * 0.1,
    portrait.height * 0.1,
    portrait.width * 0.8,
    portrait.height * 0.8,
    0,
    0,
    size,
    ph,
  );
  const reducedPhoto = document.querySelector<HTMLImageElement>(".reduced-photo");
  if (reducedPhoto) reducedPhoto.src = portraitPhoto.toDataURL("image/webp");

  const sample = document.createElement("canvas");
  sample.width = cols;
  sample.height = rows;
  const sc = sample.getContext("2d")!;
  sc.drawImage(portraitPhoto, 0, 0, cols, rows);
  const pixels = sc.getImageData(0, 0, cols, rows).data;

  portraitInk = document.createElement("canvas");
  portraitInk.width = size;
  portraitInk.height = ph;
  const ink = portraitInk.getContext("2d")!;
  ink.font = "10px monospace";
  ink.textBaseline = "middle";
  portraitPoints = [];

  veilCols = cols;
  veilRows = rows;
  veilAlpha = new Float32Array(cols * rows);
  veilBrush.x = cols / 2;
  veilBrush.y = rows / 2;
  veilPresence = 0;

  veilMask = document.createElement("canvas");
  veilMask.width = cols;
  veilMask.height = rows;
  veilMaskCtx = veilMask.getContext("2d");
  veilImageData = veilMaskCtx ? veilMaskCtx.createImageData(cols, rows) : null;

  veilScale = document.createElement("canvas");
  veilScale.width = size;
  veilScale.height = ph;
  veilScratch = document.createElement("canvas");
  veilScratch.width = size;
  veilScratch.height = ph;

  const asciiInk = isLightMode() ? "rgb(41,65,101)" : "rgb(230,230,220)";
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const k = (y * cols + x) * 4;
      const v =
        (pixels[k] * 0.2126 + pixels[k + 1] * 0.7152 + pixels[k + 2] * 0.0722) / 255;
      const char = GLYPHS[Math.min(10, Math.floor(Math.pow(v, 0.7) * 11))];
      ink.fillStyle = asciiInk;
      ink.globalAlpha = 0.2 + v * 0.8;
      ink.fillText(char, x * 6, (y / rows) * ph + 3);
      ink.globalAlpha = 1;
      if (v > 0.12 && x % 2 === 0 && y % 2 === 0) {
        portraitPoints.push({
          x: x / cols,
          y: y / rows,
          char,
          alpha: 0.25 + v * 0.7,
        });
      }
    }
  }
}

function portraitRect(): Rect {
  const mobile = w < 700;
  const pw = mobile ? Math.min(w * 0.52, 310) : Math.min(w * 0.4, h * 0.65);
  return {
    x: mobile ? w * 0.4 : w * 0.045,
    y: mobile ? h * 0.025 : h * 0.16,
    w: pw,
    h: pw * (portrait ? portrait.height / portrait.width : 1),
  };
}

function updateVeil(r: Rect, photoMix: number): number {
  const cols = veilCols;
  const rows = veilRows;
  const cells = veilAlpha;
  const dt = Math.min(0.05, Math.max(0, frameDelta));
  if (!cols || !rows || !cells || !veilMaskCtx || !veilImageData || !veilMask || !veilScale) {
    return 0;
  }
  const cell = r.w / cols;

  let tx: number;
  let ty: number;
  let targetStrength: number;
  if (hover.inside && !reduced.matches) {
    tx = ((hover.x * w - r.x) / r.w) * cols;
    ty = ((hover.y * h - r.y) / r.h) * rows;
    targetStrength = 1;
  } else {
    tx = cols * (0.5 + 0.32 * Math.sin(time * 0.31) + 0.07 * Math.sin(time * 0.73 + 1.6));
    ty = rows * (0.5 + 0.26 * Math.sin(time * 0.41 + 1.1) + 0.06 * Math.cos(time * 0.9));
    targetStrength = 0.55;
  }

  veilPresence = mix(veilPresence, targetStrength, 1 - Math.exp(-dt / 0.2));
  const follow = 1 - Math.exp(-dt / (hover.inside ? 0.045 : 0.35));
  veilBrush.x = mix(veilBrush.x, tx, follow);
  veilBrush.y = mix(veilBrush.y, ty, follow);

  const fade = dt / 1.35;
  for (let i = 0; i < cells.length; i++) {
    const v = cells[i] - fade;
    cells[i] = v > 0 ? v : 0;
  }

  const radius =
    (Math.max(46, Math.min(230, r.w * 0.24)) * (0.45 + 0.55 * veilPresence)) / cell;
  const soft = Math.max(1.2, radius * 0.62);
  const x0 = Math.max(0, Math.floor(veilBrush.x - radius));
  const x1 = Math.min(cols, Math.ceil(veilBrush.x + radius));
  const y0 = Math.max(0, Math.floor(veilBrush.y - radius));
  const y1 = Math.min(rows, Math.ceil(veilBrush.y + radius));

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const d = Math.hypot(x + 0.5 - veilBrush.x, y + 0.5 - veilBrush.y);
      if (d >= radius) continue;
      const value = clamp((radius - d) / soft) * veilPresence;
      const i = y * cols + x;
      if (value > cells[i]) cells[i] = value;
    }
  }

  for (const rip of ripples) {
    const rx = ((rip.x * w - r.x) / r.w) * cols;
    const ry = ((rip.y * h - r.y) / r.h) * rows;
    const reach = (rip.age * Math.max(w, h) * 0.75) / cell;
    const band = Math.max(3, reach * 0.16);
    const strength = (1 - clamp(rip.age / 1.3)) * 0.9;
    if (strength <= 0.002) continue;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const gap = Math.abs(Math.hypot(x + 0.5 - rx, y + 0.5 - ry) - reach);
        if (gap >= band) continue;
        const value = clamp(1 - gap / band) * strength;
        const i = y * cols + x;
        if (value > cells[i]) cells[i] = value;
      }
    }
  }

  const peak = applyBayerMask(cells, cols, rows, photoMix, veilImageData.data);

  veilMaskCtx.putImageData(veilImageData, 0, 0);
  const sc = veilScale.getContext("2d")!;
  sc.setTransform(1, 0, 0, 1, 0, 0);
  sc.imageSmoothingEnabled = false;
  sc.clearRect(0, 0, veilScale.width, veilScale.height);
  sc.drawImage(veilMask, 0, 0, cols, rows, 0, 0, veilScale.width, veilScale.height);
  return peak;
}

function drawPortrait(): void {
  if (!portraitInk || !portraitPhoto || !veilMaskCtx || !veilScratch || !veilScale || story < 1.95) {
    return;
  }
  const toPhoto = ease((story - 2.25) / 0.55);
  const toAscii = ease((story - 3.55) / 0.55);
  const exit = ease((story - 4.08) / 0.65);
  const alpha = 1 - exit;
  const r = portraitRect();
  if (alpha < 0.001) return;

  const photoMix = toPhoto * (1 - toAscii);
  const peak = updateVeil(r, photoMix);
  if (photoMix < 0.001 && peak < 0.02) {
    ctx.globalAlpha = alpha;
    ctx.drawImage(portraitInk, r.x, r.y, r.w, r.h);
    ctx.globalAlpha = 1;
    return;
  }

  const sc = veilScratch.getContext("2d")!;
  sc.setTransform(1, 0, 0, 1, 0, 0);
  sc.imageSmoothingEnabled = false;
  sc.globalCompositeOperation = "source-over";
  sc.clearRect(0, 0, veilScratch.width, veilScratch.height);
  sc.drawImage(portraitInk, 0, 0);
  sc.globalCompositeOperation = "destination-out";
  sc.drawImage(veilScale, 0, 0);
  ctx.globalAlpha = alpha;
  ctx.drawImage(veilScratch, r.x, r.y, r.w, r.h);

  sc.globalCompositeOperation = "source-over";
  sc.clearRect(0, 0, veilScratch.width, veilScratch.height);
  sc.drawImage(portraitPhoto, 0, 0);
  sc.globalCompositeOperation = "destination-in";
  sc.drawImage(veilScale, 0, 0);
  ctx.drawImage(veilScratch, r.x, r.y, r.w, r.h);
  ctx.globalAlpha = 1;
}

function glyphAtlas(cell: number, step: number): HTMLCanvasElement {
  if (atlas && atlasCell === cell) return atlas;
  atlasCell = cell;
  atlas = document.createElement("canvas");
  atlas.width = cell * 11;
  atlas.height = step;
  const c = atlas.getContext("2d")!;
  const light = isLightMode();
  c.font = `${cell + 1}px monospace`;
  c.textBaseline = "middle";
  for (let i = 0; i < 11; i++) {
    c.fillStyle = light
      ? `rgba(31,64,109,${0.1 + i * 0.083})`
      : `rgba(218,220,210,${0.1 + i * 0.083})`;
    c.fillText(GLYPHS[i], i * cell, step / 2);
  }
  return atlas;
}

function drawWaves(): void {
  const fold = ease((story - 0.4) / 1.2);
  const alpha = 1 - ease((story - 1.1) / 1.1);
  if (alpha < 0.001) return;

  const cell = Math.max(7, Math.ceil(w / 145));
  const step = Math.ceil(cell * 1.35);
  const sprite = glyphAtlas(cell, step);
  const interactive = !paused && !reduced.matches && story < 1.1;
  const tickStep = Math.floor(time * 18);

  const follow = 1 - Math.exp(-6 * Math.min(0.05, frameDelta));
  const targetX =
    interactive && hover.inside ? (hover.y - 0.5) * 1.4 : Math.sin(time * 0.55) * 0.12;
  const targetY =
    interactive && hover.inside ? (hover.x - 0.5) * 1.4 : Math.sin(time * 0.4 + 1.3) * 0.2;
  tiltX += (targetX - tiltX) * follow;
  tiltY += (targetY - tiltY) * follow;

  const px = hover.x * w;
  const py = hover.y * h;
  const reach = Math.max(120, h * 0.18 * 1.6);
  const rings = interactive ? ripples : [];

  ctx.globalAlpha = alpha;
  for (let y = 0; y < h; y += step) {
    const v = y / h;
    const ys = Math.sin(v * 5.4 - time * 0.18) * 0.52;
    for (let x = 0; x < w; x += cell) {
      const cx = x + cell * 0.5;
      const cy = y + step * 0.5;
      let ring = 0;
      let pushX = 0;
      let pushY = 0;
      for (const rip of rings) {
        const rx = rip.x * w;
        const ry = rip.y * h;
        const radius = rip.age * Math.max(w, h) * 0.75;
        const band = Math.max(cell * 3, 24);
        const gap = Math.abs(Math.hypot(cx - rx, cy - ry) - radius);
        const fall = (1 - smoothstep(0, 1.2, rip.age)) * (1 - smoothstep(0, band, gap));
        if (fall <= 0) continue;
        ring = Math.max(ring, fall);
        const dx = cx - rx;
        const dy = cy - ry;
        const len = Math.hypot(dx, dy) || 1;
        pushX += (dx / len) * fall * cell * 1.5;
        pushY += (dy / len) * fall * cell * 1.5;
      }

      const u = x / w + (pushX + tiltY * (v - 0.5) * cell * 2) / w;
      const vv = v + (pushY + tiltX * (u - 0.5) * cell * 2) / h;
      const a = u * 3.8 + vv * 1.65 + ys;
      const b = vv * 2.7 - u * 0.8 + Math.sin(u * 6 + time * 0.12) * 0.28;
      const surface =
        Math.sin(a * 3.5 + time * 0.13) + Math.cos(b * 4.1 - time * 0.09) * 0.57;
      const value =
        Math.exp(-((surface / 0.48) ** 2)) * 0.76 +
        (0.5 + 0.5 * Math.cos(a * 26 + b * 4)) ** 3 * 0.25;
      if (value < 0.1 && ring < 0.08) continue;

      let index = value < 0.1 ? 0 : Math.min(10, Math.floor(value * 10));
      const near = Math.hypot(cx - px, cy - py);
      const scramble = hover.inside
        ? clamp(1 - smoothstep(reach * 0.35, reach, near)) * 0.55
        : 0;
      if (index > 0 && hashNoise(x, y, tickStep) < scramble * 0.8) {
        index = 1 + Math.floor(hashNoise(x, y, tickStep + 7.13) * 10);
      }
      if (ring > 0 && hashNoise(x, y, tickStep * 3.1) < ring) {
        index = 1 + Math.floor(hashNoise(x, y, tickStep * 1.7) * 10);
      }
      const z = surface * 0.22 * fold;
      const p = (u - 0.5) * Math.cos(fold * 1.1) + z * Math.sin(fold * 1.1);
      const perspective = 1 / (1 - z * 0.3);
      if (ring > 0) ctx.globalAlpha = alpha * Math.min(1, 0.72 + ring * 0.5);
      ctx.drawImage(
        sprite,
        index * cell,
        0,
        cell,
        step,
        (0.5 + p * perspective) * w,
        (0.5 + (vv - 0.5) * (1 - fold * 0.68) * perspective) * h,
        cell,
        step,
      );
      if (ring > 0) ctx.globalAlpha = alpha;
    }
  }
  ctx.globalAlpha = 1;
}

function drawWavePortraitMorph(): void {
  if (!portraitPoints.length) {
    drawWaves();
    return;
  }
  const amount = ease((story - 0.85) / 1.1);
  const r = portraitRect();
  if (!waveMorphOrigin) {
    waveMorphOrigin = [];
    const cell = Math.max(7, Math.ceil(w / 145));
    const step = Math.ceil(cell * 1.35);
    const fold = ease((0.85 - 0.4) / 1.2);
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += cell) {
        const u = x / w;
        const v = y / h;
        const a = u * 3.8 + v * 1.65 + Math.sin(v * 5.4 - time * 0.18) * 0.52;
        const b = v * 2.7 - u * 0.8 + Math.sin(u * 6 + time * 0.12) * 0.28;
        const surface =
          Math.sin(a * 3.5 + time * 0.13) + Math.cos(b * 4.1 - time * 0.09) * 0.57;
        const value =
          Math.exp(-((surface / 0.48) ** 2)) * 0.76 +
          (0.5 + 0.5 * Math.cos(a * 26 + b * 4)) ** 3 * 0.25;
        if (value < 0.1) continue;
        const z = surface * 0.22 * fold;
        const px = (u - 0.5) * Math.cos(fold * 1.1) + z * Math.sin(fold * 1.1);
        const perspective = 1 / (1 - z * 0.3);
        waveMorphOrigin.push({
          x: (0.5 + px * perspective) * w,
          y: (0.5 + (v - 0.5) * (1 - fold * 0.68) * perspective) * h,
          char: GLYPHS[Math.min(10, Math.floor(value * 10))],
          alpha: 0.1 + value * 0.8,
        });
      }
    }
  }
  const count = waveMorphOrigin.length;
  ctx.textBaseline = "middle";
  ctx.fillStyle = isLightMode() ? "#244a7c" : "#dcddd6";
  ctx.font = `${mix(Math.max(8, w / 145), (r.w / 100) * 1.67, amount)}px monospace`;
  for (let i = 0; i < count; i++) {
    const source = waveMorphOrigin[i];
    const target =
      portraitPoints[
        Math.min(portraitPoints.length - 1, Math.floor((i / count) * portraitPoints.length))
      ];
    const bend = Math.sin(amount * Math.PI) * Math.sin(i * 0.618) * 22;
    ctx.globalAlpha = mix(source.alpha, target.alpha, amount);
    ctx.fillText(
      amount < 0.5 ? source.char : target.char,
      mix(source.x, r.x + target.x * r.w, amount) + bend,
      mix(source.y, r.y + target.y * r.h, amount),
    );
  }
  ctx.globalAlpha = 1;
}

function diagramRect(): Rect {
  const mobile = w < 700;
  if (mobile) return { x: w * 0.035, y: h * 0.035, w: w * 0.93, h: h * 0.43 };
  const vh = Math.min(h, innerHeight);
  const height = Math.min(vh * 0.8, w * 0.56);
  return { x: w * 0.02, y: (vh - height) * 0.5, w: w * 0.55, h: height };
}

function fitAspectRect(bounds: Rect, aspect: number): Rect {
  if (bounds.w / bounds.h > aspect) {
    const fittedW = bounds.h * aspect;
    return {
      x: bounds.x + (bounds.w - fittedW) * 0.5,
      y: bounds.y,
      w: fittedW,
      h: bounds.h,
    };
  }
  const fittedH = bounds.w / aspect;
  return {
    x: bounds.x,
    y: bounds.y + (bounds.h - fittedH) * 0.5,
    w: bounds.w,
    h: fittedH,
  };
}

function sculptureGlyph(char: string, size: number): SculptureGlyph {
  const key = `${char}:${size}`;
  const existing = sculptureGlyphs.get(key);
  if (existing) return existing;

  const image = document.createElement("canvas");
  const width = Math.ceil(size * 0.92);
  const height = Math.ceil(size * 1.6);
  const ratio = 2;
  image.width = width * ratio;
  image.height = height * ratio;
  const c = image.getContext("2d")!;
  c.scale(ratio, ratio);
  c.font = `${size}px monospace`;
  c.textBaseline = "middle";
  c.fillStyle = isLightMode() ? "#244a7c" : "#dcddd6";
  c.fillText(char, 0, height * 0.5);

  const result = { image, width, height };
  sculptureGlyphs.set(key, result);
  return result;
}

function renderPoints(
  context: CanvasRenderingContext2D,
  from: DiagramPoint[],
  to: DiagramPoint[],
  amount: number,
  rect: Rect,
  sourceRect: Rect = rect,
): void {
  if (amount > 0.999) from = to;
  const count = Math.max(from.length, to.length);
  const size =
    rect.glyphSize ?? Math.round(Math.max(8, (rect.w / 88) * 1.55) * 2) / 2;
  for (let i = 0; i < count; i++) {
    const a = from[i % from.length];
    const b = to[i % to.length];
    if (!a || !b) continue;
    const x = mix(sourceRect.x + a.x * sourceRect.w, rect.x + b.x * rect.w, amount);
    const y = mix(sourceRect.y + a.y * sourceRect.h, rect.y + b.y * rect.h, amount);
    const bend =
      Math.sin(amount * Math.PI) * Math.sin(i * 2.399) * Math.min(80, w * 0.08);
    const sprite = sculptureGlyph(amount < 0.5 ? a.char : b.char, size);
    let dx = 0;
    let dy = 0;
    let ink = mix(a.alpha ?? 1, b.alpha ?? 1, amount);
    let materialSprite = sprite;
    if (rect.material) {
      const material = amount < 0.5 ? a : b;
      const seed = material.seed ?? i;
      const depth = material.depth ? 0.4 : 1;
      const wave = Math.sin(time * 0.29 + x * 0.004 + y * 0.008);
      dx = Math.cos(time * 0.21 + y * 0.01 + seed * 0.003) * 0.4 * depth;
      dy = (wave * 0.95 + Math.sin(time * 0.17 + seed * 0.013) * 0.35) * depth;
      ink = clamp(ink * (1 + Math.sin(time * 0.24 + seed * 0.009) * 0.035));
      if (material.bank && !material.depth && seed % 11 < 2) {
        const bank = material.bank;
        const step = Math.floor(time * 0.18 + seed * 0.017);
        materialSprite = sculptureGlyph(
          bank[Math.abs(Math.floor(seed) + step) % bank.length],
          size,
        );
      }
    }
    context.globalAlpha = ink;
    context.drawImage(
      materialSprite.image,
      x + bend + dx,
      y + Math.cos(i) * bend * 0.5 + dy - materialSprite.height / 2,
      materialSprite.width,
      materialSprite.height,
    );
  }
  context.globalAlpha = 1;
}

function drawProjects(): void {
  if (story < 4.08 || story >= timeline.contactStart) return;
  const { index, local, entry } = projectSlice(
    story,
    timeline,
    portfolioProjects.length,
  );
  const project = portfolioProjects[index];
  const exitFade =
    index === portfolioProjects.length - 1
      ? 1 - ease((story - (timeline.contactStart - 0.35)) / 0.35)
      : 1 - ease((local - 0.86) / 0.14);
  const visualMix = ease((entry - 0.5) / 0.45) * exitFade;

  if (visualMix < 0.99) {
    const next = buildProjectDiagram(project.diagramId, local, time);
    ctx.globalAlpha = 1 - visualMix * 0.88;
    if (entry > 0.999) {
      renderPoints(ctx, next, next, 1, diagramRect());
    } else {
      const previous =
        index === 0
          ? portraitPoints
          : buildProjectDiagram(portfolioProjects[index - 1].diagramId, 1, time);
      if (previous.length) {
        renderPoints(
          ctx,
          previous,
          next,
          entry,
          diagramRect(),
          index === 0 ? portraitRect() : diagramRect(),
        );
      } else {
        renderPoints(ctx, next, next, 1, diagramRect());
      }
    }
    ctx.globalAlpha = 1;
  }

  if (visualMix > 0.01) {
    const visual = renderProjectVisual(
      project.diagramId,
      local,
      time,
      isLightMode(),
    );
    const targetRect = fitAspectRect(diagramRect(), visual.width / visual.height);
    const prevSmooth = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = visualMix;
    ctx.drawImage(
      visual,
      targetRect.x,
      targetRect.y,
      targetRect.w,
      targetRect.h,
    );
    ctx.globalAlpha = 1;
    ctx.imageSmoothingEnabled = prevSmooth;
  }
}

function textMask(text: string, family: string): DiagramPoint[] {
  const surface = document.createElement("canvas");
  surface.width = 1100;
  surface.height = 360;
  const c = surface.getContext("2d")!;
  let size = 300;
  c.font = `400 ${size}px "${family}"`;
  size *= Math.min(1, 1040 / c.measureText(text).width);
  c.font = `400 ${size}px "${family}"`;
  c.fillStyle = "#fff";
  const metrics = c.measureText(text);
  const ascent = metrics.actualBoundingBoxAscent || size * 0.78;
  const descent = metrics.actualBoundingBoxDescent || size * 0.08;
  c.fillText(text, 4, (360 + ascent - descent) / 2);

  const pixels = c.getImageData(0, 0, 1100, 360).data;
  const face: DiagramPoint[] = [];
  const depth: DiagramPoint[] = [];
  const banks = [". ,:;`", "-_=~", "/\\|()[]{}<>", "+*#%@&"];
  for (let y = 0; y < 360; y += 7) {
    for (let x = 0; x < 1100; x += 7) {
      const alpha = pixels[(y * 1100 + x) * 4 + 3] / 255;
      if (alpha < 0.25) continue;
      const seed = Math.floor(x / 7) * 17 + Math.floor(y / 7) * 31;
      const bank = banks[(Math.floor(x / 21) + Math.floor(y / 28)) % banks.length];
      const char = bank[seed % bank.length];
      face.push({
        x: x / 1100,
        y: y / 360,
        char,
        bank,
        seed,
        alpha: alpha * (0.72 + (1 - y / 360) * 0.22),
      });
      if ((x + y) % 3 === 0) {
        depth.push({
          x: x / 1100 + 0.005,
          y: y / 360 + 0.018,
          char: ":",
          seed,
          depth: true,
          alpha: 0.18,
        });
      }
    }
  }
  return [...depth, ...face];
}

function contactLayout() {
  if (contactLayoutCache || !contactMasks) return contactLayoutCache;
  const vh = Math.min(h, innerHeight);
  const top = { x: w * 0.07, y: vh * 0.1, w: w * 0.86, h: vh * 0.26 };
  const bottom = { x: w * 0.07, y: vh * 0.35, w: w * 0.86, h: vh * 0.3 };
  const place = (points: DiagramPoint[], r: Rect): DiagramPoint[] =>
    points.map((p) => ({
      ...p,
      x: (r.x + p.x * r.w) / w,
      y: (r.y + p.y * r.h) / h,
    }));
  contactLayoutCache = {
    prefixes: contactMasks.prefixes.map((mask) => place(mask, top)),
    words: contactMasks.words.map((mask) => place(mask, bottom)),
    rect: {
      x: 0,
      y: 0,
      w,
      h,
      glyphSize: Math.max(5, (w / 1100) * 10.8),
      material: true,
    },
  };
  return contactLayoutCache;
}

function drawContact(): void {
  if (story < timeline.contactStart || !contactMasks) return;
  const layout = contactLayout();
  if (!layout) return;
  const entry = ease((story - timeline.contactStart) / 1.15);
  if (entry < 0.999) {
    const lastIndex = portfolioProjects.length - 1;
    const previous = buildProjectDiagram(
      portfolioProjects[lastIndex].diagramId,
      clamp(
        (timeline.contactStart - timeline.projectStart) / timeline.projectLength -
          lastIndex,
      ),
      time,
    );
    const target = [...layout.prefixes[0], ...layout.words[0]];
    renderPoints(ctx, previous, target, entry, layout.rect, diagramRect());
    return;
  }
  const index = Math.floor(contactWordClock / CONTACT_PERIOD) % 3;
  const part = contactWordClock % CONTACT_PERIOD;
  const morph = ease((part - CONTACT_HOLD) / (CONTACT_PERIOD - CONTACT_HOLD));
  const next = (index + 1) % 3;
  renderPoints(ctx, layout.prefixes[index], layout.prefixes[next], morph, layout.rect);
  renderPoints(ctx, layout.words[index], layout.words[next], morph, layout.rect);
}

Promise.all(
  CONTACT_FACES.map((family) => document.fonts.load(`400 300px "${family}"`)),
).then(() => {
  contactMasks = {
    prefixes: CONTACT_FACES.map((family) => textMask("Let’s", family)),
    words: ["build.", "make.", "talk."].map((word, i) =>
      textMask(word, CONTACT_FACES[i]),
    ),
  };
  contactLayoutCache = null;
  draw();
});

function drawAmbient(): void {
  const strength = ease((story - 1.1) / 1.5);
  if (strength < 0.001) return;
  const lastIndex = portfolioProjects.length - 1;
  const theme =
    story < 4.2
      ? -1
      : Math.min(
          lastIndex,
          Math.max(
            0,
            Math.floor((story - timeline.projectStart) / timeline.projectLength),
          ),
        );
  if (!ambient || ambientWidth !== w || ambientTheme !== theme) {
    ambientWidth = w;
    ambientTheme = theme;
    ambient = document.createElement("canvas");
    ambient.width = Math.min(1100, w);
    ambient.height = Math.round((ambient.width * h) / Math.max(1, w));
    const c = ambient.getContext("2d")!;
    const aw = ambient.width;
    const ah = ambient.height;
    const colors = isLightMode()
      ? [
          [34, 62, 103],
          [29, 55, 96],
          [38, 67, 108],
          [28, 72, 92],
        ]
      : [
          [145, 158, 145],
          [180, 157, 139],
          [143, 171, 161],
          [132, 174, 146],
        ];
    const index = Math.min(
      lastIndex,
      Math.max(0, Math.floor((story - timeline.projectStart) / timeline.projectLength)),
    );
    const color =
      story < 4.2
        ? isLightMode()
          ? [32, 59, 99]
          : [151, 157, 151]
        : colors[index];
    c.font = "9px monospace";
    c.textBaseline = "middle";
    for (let y = 0; y < ah; y += 13) {
      for (let x = 0; x < aw; x += 11) {
        const u = x / aw;
        const v = y / ah;
        const phase = u * 8 - v * 6 + Math.sin(v * 4) * 1.3;
        const ridge = Math.exp(-Math.pow(Math.sin(phase) * 3.2, 2));
        const fine = 0.5 + 0.5 * Math.cos(u * 27 + v * 13);
        const quiet = u > 0.55 && v > 0.2 && v < 0.77 ? 0.3 : 1;
        const alpha = (0.025 + ridge * 0.095) * quiet;
        c.fillStyle = `rgba(${color.join(",")},${alpha})`;
        c.fillText([".", ":", "/", "~", "+"][Math.min(4, Math.floor(fine * 5))], x, y);
      }
    }
  }
  const driftX = Math.sin(time * 0.035) * w * 0.009;
  const driftY = Math.cos(time * 0.03) * h * 0.008;
  ctx.globalAlpha = strength;
  ctx.drawImage(ambient, -w * 0.025 + driftX, -h * 0.025 + driftY, w * 1.05, h * 1.05);
  ctx.globalAlpha = 1;
}

function draw(): void {
  ctx.clearRect(0, 0, w, h);
  if (reduced.matches) return;
  drawAmbient();
  if (story < 0.85) drawWaves();
  else if (story < 1.95) drawWavePortraitMorph();
  if (story < 4.8) drawPortrait();
  drawProjects();
  drawContact();
}

function setPanel(panel: HTMLElement, alpha: number, offset = 0): void {
  panel.style.opacity = String(alpha);
  panel.style.transform = `translateY(${offset}px)`;
  panel.inert = alpha < 0.5;
  panel.style.pointerEvents = alpha > 0.5 ? "auto" : "none";
}

function update(): void {
  story =
    clamp(
      -journey.getBoundingClientRect().top /
        Math.max(1, journey.offsetHeight - stage.offsetHeight),
    ) * timeline.end;
  if (!reduced.matches) {
    if (story < 0.7) waveMorphOrigin = null;
    const exit = ease((story - 0.2) / 0.85);
    const reveal = ease((story - 1.5) / 0.65);
    const leave = ease((story - 3.95) / 0.65);
    setPanel(opening, 1 - exit, -exit * 45);
    setPanel(about, reveal * (1 - leave), leave * -35);
    panels.forEach((panel, i) => {
      const start = timeline.projectStart + i * timeline.projectLength;
      const entry = ease((story - start) / 0.3);
      const out = ease((story - start - timeline.projectLength + 0.25) / 0.25);
      setPanel(panel, entry * (1 - out), (1 - entry) * 30 - out * 25);
    });
    setPanel(contact, ease((story - timeline.contactStart - 0.55) / 0.65));
    if (story < timeline.contactStart) contactWordClock = 0;
  }

  if (!isLightMode()) {
    let bg: readonly [number, number, number] = [16, 17, 15];
    if (story > 4) {
      const p = (story - timeline.projectStart) / timeline.projectLength;
      const index = Math.min(portfolioProjects.length - 1, Math.max(0, Math.floor(p)));
      const amount = ease(clamp(p - index) / 0.22);
      const previous: readonly [number, number, number] =
        index === 0 ? [16, 17, 15] : portfolioProjects[index - 1].background;
      bg = [
        Math.round(mix(previous[0], portfolioProjects[index].background[0], amount)),
        Math.round(mix(previous[1], portfolioProjects[index].background[1], amount)),
        Math.round(mix(previous[2], portfolioProjects[index].background[2], amount)),
      ];
    }
    document.body.style.backgroundColor = `rgb(${bg.join(",")})`;
  } else {
    document.body.style.backgroundColor = "";
  }
  needsDraw = true;
}

function renderReducedDiagrams(): void {
  panels.forEach((panel, i) => {
    const c = panel.querySelector<HTMLCanvasElement>("canvas");
    if (!c) return;
    const visual = renderProjectVisual(
      portfolioProjects[i].diagramId,
      0.7,
      2.2,
      isLightMode(),
    );
    c.width = visual.width;
    c.height = visual.height;
    const diagramCtx = c.getContext("2d");
    if (diagramCtx) {
      diagramCtx.imageSmoothingEnabled = false;
      diagramCtx.clearRect(0, 0, c.width, c.height);
      diagramCtx.drawImage(visual, 0, 0);
    }
  });
}

function resize(): void {
  waveMorphOrigin = null;
  contactLayoutCache = null;
  ambient = null;
  w = innerWidth;
  h = stage.clientHeight;
  const d = Math.min(devicePixelRatio || 1, 2);
  canvas.width = w * d;
  canvas.height = h * d;
  ctx.setTransform(d, 0, 0, d, 0, 0);
  update();
  if (reduced.matches) {
    renderReducedDiagrams();
  }
}

const cubeArt = document.querySelector<HTMLCanvasElement>('[data-hobby="cube"]');

function tick(now: number): void {
  raf = 0;
  if (document.hidden) return;
  frameDelta = Math.max(0, Math.min((now - last) / 1000, 0.05));
  last = now;
  smoothScroll?.raf(now);
  if (scrollDirty) {
    scrollDirty = false;
    update();
  }
  if (visible && !paused && !reduced.matches) {
    time += frameDelta;
    if (ripples.length) {
      ripples = ripples.filter((rip) => (rip.age += frameDelta) < 1.3);
    }
    if (
      story > timeline.contactStart + 1.15 &&
      (!contactInteraction || contactWordClock % CONTACT_PERIOD > CONTACT_HOLD)
    ) {
      contactWordClock += frameDelta;
    }
    needsDraw = true;
    if (story > 1.45 && story < 4.2 && cubeArt) {
      buildHobbyArt(cubeArt, time, isLightMode());
    }
  }
  if (needsDraw && visible) {
    draw();
    needsDraw = false;
  }
  raf = requestAnimationFrame(tick);
}

function sync(): void {
  document.body.dataset.motionPaused = String(paused);
  cancelAnimationFrame(raf);
  last = performance.now();
  raf = requestAnimationFrame(tick);
}

contact.addEventListener("mouseenter", () => {
  contactInteraction = true;
});
contact.addEventListener("mouseleave", () => {
  contactInteraction = contact.contains(document.activeElement);
});
contact.addEventListener("focusin", () => {
  contactInteraction = true;
});
contact.addEventListener("focusout", (event) => {
  contactInteraction =
    contact.contains(event.relatedTarget as Node | null) || contact.matches(":hover");
});

document.addEventListener("visibilitychange", sync);
reduced.addEventListener("change", () => {
  paused = reduced.matches;
  if (reduced.matches) {
    [opening, about, ...panels, contact].forEach((panel) => {
      panel.inert = false;
    });
  }
  resize();
  sync();
});
new IntersectionObserver(([entry]) => {
  visible = entry.isIntersecting;
  sync();
}).observe(journey);

window.addEventListener("scroll", () => {
  scrollDirty = true;
}, { passive: true });
window.addEventListener("resize", resize);
window.addEventListener(
  "pointermove",
  (event) => {
    if (reduced.matches) return;
    hover.x = event.clientX / Math.max(1, w);
    hover.y = event.clientY / Math.max(1, h);
    hover.inside = true;
    needsDraw = true;
  },
  { passive: true },
);
window.addEventListener(
  "pointerdown",
  (event) => {
    if (paused || reduced.matches || story >= 4.1) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    ripples.push({
      x: event.clientX / Math.max(1, w),
      y: event.clientY / Math.max(1, h),
      age: 0,
    });
    needsDraw = true;
  },
  { passive: true },
);
document.documentElement.addEventListener("pointerleave", () => {
  hover.inside = false;
  needsDraw = true;
});
window.addEventListener(
  "pointercancel",
  () => {
    hover.inside = false;
    needsDraw = true;
  },
  { passive: true },
);

function setupSmoothScroll(): void {
  smoothScroll?.destroy();
  smoothScroll = null;
  if (reduced.matches) return;
  smoothScroll = new Lenis({
    autoRaf: false,
    lerp: 1 - Math.pow(1 - 0.075, TRANSITION_SPEED),
    smoothWheel: true,
    syncTouch: false,
    wheelMultiplier: 0.92,
    anchors: false,
    virtualScroll: (event) => {
      event.deltaY *= story < 3.9 ? 0.7 : 0.95;
      return true;
    },
  });
  smoothScroll.on("scroll", () => {
    scrollDirty = true;
  });
}

function scrollStory(target: number, duration: number): void {
  if (smoothScroll) {
    smoothScroll.scrollTo(target, {
      duration: duration / TRANSITION_SPEED,
      lerp: 0,
      easing: (p) => p * p * p * (p * (p * 6 - 15) + 10),
    });
    return;
  }
  window.scrollTo({
    top: target,
    behavior: reduced.matches ? "instant" : "smooth",
  });
}

reduced.addEventListener("change", setupSmoothScroll);
window.addEventListener("pagehide", () => smoothScroll?.destroy());

document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (event) => {
    const hash = a.getAttribute("href");
    if (!hash) return;
    const beat = beatForHash(hash, timeline);
    if (beat === null) return;
    const target =
      hash === "#about"
        ? about
        : hash === "#work"
          ? panels[0]
          : hash === "#contact"
            ? contact
            : document.getElementById("top");
    if (!target) return;
    event.preventDefault();
    const position = reduced.matches
      ? target.getBoundingClientRect().top + scrollY
      : journey.offsetTop +
        ((journey.offsetHeight - stage.offsetHeight) * beat) / timeline.end;
    const duration = a.classList.contains("scroll-link")
      ? 5.2
      : hash === "#top"
        ? 2.4
        : 3.4;
    scrollStory(position, duration);
  });
});

setTheme(isLightMode() ? "light" : "dark", false);
resize();
setupSmoothScroll();
sync();
