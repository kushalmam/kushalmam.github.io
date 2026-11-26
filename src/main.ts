import "./styles/main.css";
import { portfolioProjects } from "./portfolioProjects";
import marksData from "./data/marks.json";
import {
  beatForHash,
  clamp,
  createTimeline,
  ease,
  mix,
  projectSlice,
} from "./timeline";
import {
  CONTACT_GRID_H,
  CONTACT_GRID_W,
  CONTACT_TARGET_H,
  CONTACT_TARGET_W,
  CONTACT_WORDS,
  contactWordHasMotion,
  renderContactSource,
  renderContactVisual,
} from "./canvas/contactVisual";
import { applyBayerMask, renderBayerDither } from "./canvas/dither";
import { renderHeroSea } from "./canvas/field";
import {
  type DitherInteraction,
  GlStageRenderer,
  type Rect,
} from "./canvas/glStage";
import { buildHobbyArt, resetHobbyCaches, warmupHobbyGpu } from "./canvas/hobbies";
import {
  PROJECT_TARGET_H,
  PROJECT_TARGET_W,
  renderProjectSource,
  renderProjectVisual,
} from "./canvas/projectVisuals";

type MarkKey = keyof typeof marksData;
interface MarkDef {
  viewBox: string;
  paths: string[];
}
const marks: Record<MarkKey, MarkDef> = marksData;

interface Ripple {
  x: number;
  y: number;
  age: number;
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
        <h1 id="name">Kushal <span>Mamillapalli</span></h1>
        <p class="intro">I build recommendation systems and the infrastructure behind them.</p>
        <a class="scroll-link" href="#about" aria-label="Scroll to explore"><span class="scroll-travel" aria-hidden="true"></span></a>
      </section>
      <section class="about" id="about" aria-labelledby="about-title">
        <h2 id="about-title">Curious about <br>how things connect.</h2>
        <p class="bio">I’m a data engineer at <span class="inline-org"><svg class="mark" data-mark="spotify" aria-hidden="true"></svg>Spotify</span>, working on personalization pipelines.</p>
        <img class="reduced-photo" loading="lazy" decoding="async" src="${base}images/portrait-900.avif" alt="Kushal in New York">
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
      <div class="scroll-rail" aria-hidden="true"><span class="scroll-rail-fill"></span></div>
    </div>
  </div>
</main>
`;

const canvas = document.querySelector<HTMLCanvasElement>("#field")!;
let glStage = GlStageRenderer.create(canvas);
const ctx2d = glStage ? null : canvas.getContext("2d")!;

const stage = document.querySelector<HTMLElement>(".stage")!;
const journey = document.querySelector<HTMLElement>(".journey")!;
const opening = document.querySelector<HTMLElement>(".opening")!;
const about = document.querySelector<HTMLElement>(".about")!;
const contact = document.querySelector<HTMLElement>(".contact-ending")!;
const stageFooter = document.querySelector<HTMLElement>(".stage-footer")!;
const scrollRailFill = document.querySelector<HTMLElement>(".scroll-rail-fill");
const themeToggle = document.querySelector<HTMLButtonElement>(".theme-toggle")!;
const themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
const root = document.documentElement;

const timeline = createTimeline(portfolioProjects.length);
const TRANSITION_SPEED = 1.6;
const CONTACT_HOLD = 3.2;
const CONTACT_PERIOD = CONTACT_HOLD + 2 / TRANSITION_SPEED;

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
let portraitDither: HTMLCanvasElement | null = null;
let portraitDitherAnimated: HTMLCanvasElement | null = null;
let portraitPhoto: HTMLCanvasElement | null = null;

let contactWordClock = 0;
let contactInteraction = false;

interface AnchorScrollAnim {
  from: number;
  to: number;
  start: number;
  durationMs: number;
}
let anchorAnim: AnchorScrollAnim | null = null;
let journeyTop = 0;
let scrollRange = 1;
let lastScrollActivity = 0;

const hover = { x: 0.5, y: 0.5, inside: false };
let ripples: Ripple[] = [];

let veilMask: HTMLCanvasElement | null = null;
let veilMaskCtx: CanvasRenderingContext2D | null = null;
let veilImageData: ImageData | null = null;
let veilAlpha: Float32Array | null = null;
let veilBytes: Uint8Array | null = null;
let veilDirty = true;
let veilHasActiveCells = false;
let veilCols = 0;
let veilRows = 0;
let veilScale: HTMLCanvasElement | null = null;
let veilScratch: HTMLCanvasElement | null = null;
const veilBrush = { x: 0, y: 0 };
let veilPresence = 0;

let frameDelta = 1 / 60;
let lastCubeFrame = -1;
let scrollDirty = true;
let fieldDirty = true;
let displayFontsLoaded = false;
let displayFontsPromise: Promise<void> | null = null;
let lastContactSource: HTMLCanvasElement | null = null;
let lastContactSourceKey = "";
let lastContactHoldWordIdx = -1;
let lastStageSourceKind: "project" | "contact" | "" = "";
let activeNavHash = "";
const IDLE_SLEEP_MS = 30_000;
let lastUserActivity = performance.now();
let idleSlept = false;
let cosmicSpinBoost = 0;
const navLinks = Array.from(
  document.querySelectorAll<HTMLAnchorElement>('header nav a[href^="#"]'),
);

function isPortraitSettledStatic(): boolean {
  return story >= 2.85 && story <= 3.35 && ripples.length === 0 && Boolean(portrait);
}

function stopLoop(): void {
  if (raf) {
    cancelAnimationFrame(raf);
    raf = 0;
  }
}

function isLightMode(): boolean {
  return root.dataset.mode === "light";
}

function setTheme(mode: "light" | "dark", persist = true): void {
  root.dataset.mode = mode;
  themeToggle.setAttribute("aria-pressed", String(mode === "light"));
  themeToggle.setAttribute(
    "aria-label",
    `Switch to ${mode === "light" ? "dark" : "light"} mode`,
  );
  const label = themeToggle.querySelector(".theme-label");
  const icon = themeToggle.querySelector('[aria-hidden="true"]');
  if (label) label.textContent = mode === "light" ? "Dark" : "Light";
  if (icon) icon.textContent = mode === "light" ? "◑" : "◐";
  if (themeMeta) {
    themeMeta.setAttribute("content", mode === "light" ? "#f6f5f0" : "#10110f");
  }
  if (persist) {
    try {
      localStorage.setItem("portfolio-theme", mode);
    } catch {
      // Ignore storage failures in restricted browsing contexts.
    }
  }
  ripples = [];
  veilPresence = 0;
  veilHasActiveCells = false;
  lastCubeFrame = -1;
  lastContactSourceKey = "";
  lastContactHoldWordIdx = -1;
  lastStageSourceKind = "";
  resetHobbyCaches();
  if (portrait) cachePortrait();
  document
    .querySelectorAll<HTMLCanvasElement>(".hobby-art")
    .forEach((target) => buildHobbyArt(target, 0, isLightMode()));
  if (reduced.matches) renderReducedDiagrams();
  fieldDirty = true;
  update();
  wakeLoop();
}

themeToggle.addEventListener("click", () => {
  wakeOnInput();
  setTheme(isLightMode() ? "dark" : "light");
});

const panels = portfolioProjects.map((project, idx) => {
  const panel = document.createElement("section");
  panel.className = "project-panel";
  panel.id = project.slug;
  panel.setAttribute("aria-labelledby", `${project.slug}-title`);
  const num = String(idx + 1).padStart(2, "0");
  const total = String(portfolioProjects.length).padStart(2, "0");
  panel.innerHTML = `<span class="project-index">${num} / ${total}</span><h2 id="${project.slug}-title">${project.name}</h2><p>${project.summary}</p><a href="${project.href}">View source ↗</a><canvas class="reduced-diagram" role="img" aria-label="Dithered ${project.name} visual"></canvas>`;
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
let triedPortraitFallback = false;
photo.onload = () => {
  const commitPortrait = () => {
    portrait = photo;
    cachePortrait();
    fieldDirty = true;
    draw();
    fieldDirty = false;
  };
  if (typeof photo.decode === "function") {
    photo.decode().then(commitPortrait, commitPortrait);
  } else {
    commitPortrait();
  }
};
photo.onerror = () => {
  if (triedPortraitFallback) return;
  triedPortraitFallback = true;
  photo.src = `${base}images/portrait-960.webp`;
};
photo.src = `${base}images/portrait-900.avif`;

function cachePortrait(): void {
  if (!portrait) return;
  const cols = 160;
  const rows = Math.round((cols * portrait.height) / portrait.width);

  veilCols = cols;
  veilRows = rows;
  veilAlpha = new Float32Array(cols * rows);
  veilBytes = new Uint8Array(cols * rows);
  veilDirty = true;
  veilBrush.x = cols / 2;
  veilBrush.y = rows / 2;
  veilPresence = 0;

  if (glStage) {
    glStage.setPortrait(portrait);
    return;
  }

  const size = portrait.naturalWidth || portrait.width;
  const ph = portrait.naturalHeight || portrait.height;

  portraitPhoto = document.createElement("canvas");
  portraitPhoto.width = size;
  portraitPhoto.height = ph;
  const c = portraitPhoto.getContext("2d", { willReadFrequently: true })!;
  c.imageSmoothingEnabled = true;
  c.imageSmoothingQuality = "high";
  c.drawImage(
    portrait,
    0,
    0,
    portrait.width,
    portrait.height,
    0,
    0,
    size,
    ph,
  );

  const ditherW = 320;
  const ditherH = Math.round((ditherW * portrait.height) / portrait.width);
  portraitDither = document.createElement("canvas");
  portraitDither.width = ditherW;
  portraitDither.height = ditherH;
  renderBayerDither(portraitPhoto, portraitDither, {
    cellSize: 2,
    ditherAmount: 0.18,
    lightMode: isLightMode(),
    preserveColor: true,
    edgeStrength: 0.22,
    gamma: isLightMode() ? 0.94 : 0.88,
    levels: 6,
  });

  portraitDitherAnimated = document.createElement("canvas");
  portraitDitherAnimated.width = ditherW;
  portraitDitherAnimated.height = ditherH;

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

function stepVeil(r: Rect): number {
  const cols = veilCols;
  const rows = veilRows;
  const cells = veilAlpha;
  const dt = Math.min(0.05, Math.max(0, frameDelta));
  if (!cols || !rows || !cells) return 0;
  const cell = r.w / cols;

  let tx: number;
  let ty: number;
  let targetStrength: number;
  if (hover.inside && !reduced.matches) {
    tx = ((hover.x * w - r.x) / r.w) * cols;
    ty = ((hover.y * h - r.y) / r.h) * rows;
    targetStrength = 1;
  } else {
    tx =
      cols * (0.5 + 0.32 * Math.sin(time * 0.31) + 0.07 * Math.sin(time * 0.73 + 1.6));
    ty =
      rows * (0.5 + 0.26 * Math.sin(time * 0.41 + 1.1) + 0.06 * Math.cos(time * 0.9));
    targetStrength = 0.55;
  }

  veilPresence = mix(veilPresence, targetStrength, 1 - Math.exp(-dt / 0.2));
  const follow = 1 - Math.exp(-dt / (hover.inside ? 0.045 : 0.35));
  veilBrush.x = mix(veilBrush.x, tx, follow);
  veilBrush.y = mix(veilBrush.y, ty, follow);

  const fade = dt / 1.35;
  if (veilHasActiveCells) {
    for (let i = 0; i < cells.length; i++) {
      const v = cells[i] - fade;
      cells[i] = v > 0 ? v : 0;
    }
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
    const minR = Math.max(0, reach - band);
    const maxR = reach + band;
    const minR2 = minR * minR;
    const maxR2 = maxR * maxR;
    const rx0 = Math.max(0, Math.floor(rx - maxR));
    const rx1 = Math.min(cols, Math.ceil(rx + maxR));
    const ry0 = Math.max(0, Math.floor(ry - maxR));
    const ry1 = Math.min(rows, Math.ceil(ry + maxR));
    const invBand = 1 / band;
    for (let y = ry0; y < ry1; y++) {
      const dy = y + 0.5 - ry;
      const dy2 = dy * dy;
      const rowOff = y * cols;
      for (let x = rx0; x < rx1; x++) {
        const dx = x + 0.5 - rx;
        const dist2 = dx * dx + dy2;
        if (dist2 < minR2 || dist2 > maxR2) continue;
        const gap = Math.abs(Math.sqrt(dist2) - reach);
        if (gap >= band) continue;
        const value = (1 - gap * invBand) * strength;
        const i = rowOff + x;
        if (value > cells[i]) cells[i] = value;
      }
    }
  }

  let peak = 0;
  let bytesChanged = false;
  const bytes = veilBytes;
  if (bytes) {
    for (let i = 0; i < cells.length; i++) {
      const v = cells[i];
      if (v > peak) peak = v;
      const b = Math.min(255, (v * 255 + 0.5) | 0);
      if (bytes[i] !== b) {
        bytes[i] = b;
        bytesChanged = true;
      }
    }
    if (bytesChanged) veilDirty = true;
  }
  veilHasActiveCells = peak > 0.002;
  return peak;
}

function drawPortrait(): void {
  if (!portrait || story < 1.15 || story >= 4.25) return;

  const enterReveal = ease((story - 1.15) / 0.75);
  const exitReveal = 1 - ease((story - 3.75) / 0.45);
  const portraitReveal = clamp(enterReveal * exitReveal);
  if (portraitReveal <= 0.005) return;

  const r = portraitRect();
  const toPhoto = ease((story - 2.0) / 0.85);
  const toDither = ease((story - 3.35) / 0.5);
  const photoMix = toPhoto * (1 - toDither) * portraitReveal;

  if (glStage) {
    if (photoMix < 0.999 || ripples.length > 0) {
      stepVeil(r);
    }
    const ditherGridW = 160;
    const ditherGridH = Math.max(1, Math.round((ditherGridW * portrait.height) / portrait.width));
    glStage.drawPortrait({
      rect: r,
      photoMix,
      portraitReveal,
      lightMode: isLightMode(),
      ditherGridW,
      ditherGridH,
      veilCols,
      veilRows,
      veilBytes,
      veilDirty,
    });
    veilDirty = false;
    return;
  }

  if (
    !ctx2d ||
    !portraitDither ||
    !portraitDitherAnimated ||
    !portraitPhoto ||
    !veilMaskCtx ||
    !veilScratch ||
    !veilScale ||
    !veilImageData ||
    !veilMask ||
    !veilAlpha
  ) {
    return;
  }

  let ditherSurface = portraitDither;
  if (portraitReveal < 0.995) {
    renderBayerDither(portraitPhoto, portraitDitherAnimated, {
      cellSize: 2,
      ditherAmount: 0.18,
      lightMode: isLightMode(),
      preserveColor: true,
      edgeStrength: 0.22,
      gamma: isLightMode() ? 0.94 : 0.88,
      levels: 6,
      reveal: portraitReveal,
    });
    ditherSurface = portraitDitherAnimated;
  }

  const prevSmooth = ctx2d.imageSmoothingEnabled;
  const prevQuality = ctx2d.imageSmoothingQuality;

  if (photoMix >= 0.999 && portraitReveal >= 0.999 && ripples.length === 0) {
    ctx2d.imageSmoothingEnabled = true;
    ctx2d.imageSmoothingQuality = "high";
    ctx2d.drawImage(portraitPhoto, r.x, r.y, r.w, r.h);
    ctx2d.imageSmoothingEnabled = prevSmooth;
    ctx2d.imageSmoothingQuality = prevQuality;
    return;
  }

  stepVeil(r);
  const peak = applyBayerMask(veilAlpha, veilCols, veilRows, photoMix, veilImageData.data);
  veilMaskCtx.putImageData(veilImageData, 0, 0);
  const scaleCtx = veilScale.getContext("2d")!;
  scaleCtx.setTransform(1, 0, 0, 1, 0, 0);
  scaleCtx.imageSmoothingEnabled = false;
  scaleCtx.clearRect(0, 0, veilScale.width, veilScale.height);
  scaleCtx.drawImage(veilMask, 0, 0, veilCols, veilRows, 0, 0, veilScale.width, veilScale.height);

  if (photoMix < 0.001 && peak < 0.02) {
    ctx2d.imageSmoothingEnabled = false;
    ctx2d.drawImage(ditherSurface, r.x, r.y, r.w, r.h);
    ctx2d.imageSmoothingEnabled = prevSmooth;
    ctx2d.imageSmoothingQuality = prevQuality;
    return;
  }

  const sc = veilScratch.getContext("2d")!;
  sc.setTransform(1, 0, 0, 1, 0, 0);
  sc.imageSmoothingEnabled = false;
  sc.globalCompositeOperation = "source-over";
  sc.clearRect(0, 0, veilScratch.width, veilScratch.height);
  sc.drawImage(ditherSurface, 0, 0, veilScratch.width, veilScratch.height);
  sc.globalCompositeOperation = "destination-out";
  sc.drawImage(veilScale, 0, 0);
  ctx2d.imageSmoothingEnabled = false;
  ctx2d.drawImage(veilScratch, r.x, r.y, r.w, r.h);

  sc.imageSmoothingEnabled = true;
  sc.imageSmoothingQuality = "high";
  sc.globalCompositeOperation = "source-over";
  sc.clearRect(0, 0, veilScratch.width, veilScratch.height);
  sc.drawImage(portraitPhoto, 0, 0);
  sc.imageSmoothingEnabled = false;
  sc.globalCompositeOperation = "destination-in";
  sc.drawImage(veilScale, 0, 0);
  ctx2d.imageSmoothingEnabled = true;
  ctx2d.imageSmoothingQuality = "high";
  ctx2d.globalAlpha = portraitReveal;
  ctx2d.drawImage(veilScratch, r.x, r.y, r.w, r.h);
  ctx2d.globalAlpha = 1;
  ctx2d.imageSmoothingEnabled = prevSmooth;
  ctx2d.imageSmoothingQuality = prevQuality;
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

function localInteraction(rect: Rect): {
  hoverUv: { x: number; y: number } | null;
  interaction: DitherInteraction | undefined;
} {
  let hoverUv: { x: number; y: number } | null = null;
  if (hover.inside && !reduced.matches && rect.w > 0 && rect.h > 0) {
    const ux = (hover.x * w - rect.x) / rect.w;
    const uy = (hover.y * h - rect.y) / rect.h;
    if (ux >= 0 && ux <= 1 && uy >= 0 && uy <= 1) {
      hoverUv = { x: ux, y: uy };
    }
  }
  const localRipples = ripples
    .map((rip) => ({
      x: (rip.x * w - rect.x) / Math.max(1, rect.w),
      y: (rip.y * h - rect.y) / Math.max(1, rect.h),
      radius: rip.age * 0.95,
      strength: 1 - clamp(rip.age / 1.15),
    }))
    .filter((rip) => rip.strength > 0.005);

  const interaction: DitherInteraction | undefined =
    hoverUv || localRipples.length > 0
      ? {
          pointerUv: hoverUv,
          hoverStrength: hoverUv ? 0.85 : 0,
          ripples: localRipples,
        }
      : undefined;
  return { hoverUv, interaction };
}

function drawProjects(): void {
  if (story < 4.25 || story >= timeline.contactStart) return;
  const { index, local } = projectSlice(
    story,
    timeline,
    portfolioProjects.length,
  );
  const project = portfolioProjects[index];
  const enter = index === 0 ? ease((story - 4.25) / 0.55) : ease(local / 0.22);
  const leave =
    index === portfolioProjects.length - 1
      ? 1 - ease((story - (timeline.contactStart - 0.5)) / 0.5)
      : 1 - ease((local - 0.8) / 0.2);
  const reveal = clamp(enter * leave);
  if (reveal <= 0.005) return;

  const targetRect = fitAspectRect(diagramRect(), PROJECT_TARGET_W / PROJECT_TARGET_H);
  const { hoverUv, interaction } = localInteraction(targetRect);

  if (glStage) {
    if (project.diagramId === "cosmicrecomp") {
      const hoverSpin = hoverUv ? (hoverUv.x - 0.5) * 0.35 : 0;
      if (
        glStage.drawCosmicRecomp(targetRect, time, cosmicSpinBoost + hoverSpin, {
          lightMode: isLightMode(),
          preserveColor: true,
          edgeStrength: 0.56,
          ditherAmount: 0.22,
          reveal,
          interaction,
        })
      ) {
        return;
      }
    }
    const source = renderProjectSource(project.diagramId, local, time, hoverUv);
    lastStageSourceKind = "project";
    glStage.drawDitheredSource(source, targetRect, {
      gridW: PROJECT_TARGET_W,
      gridH: PROJECT_TARGET_H,
      lightMode: isLightMode(),
      preserveColor: true,
      edgeStrength: project.diagramId === "cosmicrecomp" ? 0.56 : 0.48,
      ditherAmount: 0.22,
      reveal,
      interaction,
    });
    return;
  }

  if (!ctx2d) return;
  const visual = renderProjectVisual(
    project.diagramId,
    local,
    time,
    isLightMode(),
    reveal,
  );
  const prevSmooth = ctx2d.imageSmoothingEnabled;
  ctx2d.imageSmoothingEnabled = false;
  ctx2d.drawImage(
    visual,
    targetRect.x,
    targetRect.y,
    targetRect.w,
    targetRect.h,
  );
  ctx2d.imageSmoothingEnabled = prevSmooth;
}

function drawContact(): void {
  if (story < timeline.contactStart) return;
  const entryReveal = ease((story - timeline.contactStart) / 0.85);
  const index = Math.floor(contactWordClock / CONTACT_PERIOD) % CONTACT_WORDS.length;
  const part = contactWordClock % CONTACT_PERIOD;
  const morph = clamp((part - CONTACT_HOLD) / (CONTACT_PERIOD - CONTACT_HOLD));
  const next = (index + 1) % CONTACT_WORDS.length;

  let activeIdx = index;
  let wordReveal = 1;
  if (morph > 0) {
    if (morph < 0.5) {
      activeIdx = index;
      wordReveal = 1 - ease(morph / 0.5);
    } else {
      activeIdx = next;
      wordReveal = ease((morph - 0.5) / 0.5);
    }
  }

  const reveal = clamp(entryReveal * wordReveal);
  if (reveal <= 0.005) return;

  const vh = Math.min(h, innerHeight);
  const bounds: Rect = {
    x: w * 0.05,
    y: vh * 0.11,
    w: w * 0.9,
    h: vh * 0.54,
  };
  const targetRect = fitAspectRect(bounds, CONTACT_TARGET_W / CONTACT_TARGET_H);
  const drawX = w < 700 ? targetRect.x : Math.min(targetRect.x, w * 0.055);
  const drawRect: Rect = { x: drawX, y: targetRect.y, w: targetRect.w, h: targetRect.h };

  if (glStage) {
    const light = isLightMode();
    const hasMotion = contactWordHasMotion(activeIdx);
    const drawClock = hasMotion ? time : 0;
    const sourceKey = `${activeIdx}:${drawClock}:${displayFontsLoaded ? 1 : 0}:${light ? 1 : 0}`;
    const needUpload =
      lastStageSourceKind !== "contact" ||
      sourceKey !== lastContactSourceKey ||
      !lastContactSource;
    if (needUpload) {
      lastContactSource = renderContactSource(activeIdx, drawClock, light);
      lastContactSourceKey = sourceKey;
      lastStageSourceKind = "contact";
    }
    const { interaction } = localInteraction(drawRect);
    glStage.drawDitheredSource(
      lastContactSource!,
      drawRect,
      {
        gridW: CONTACT_GRID_W,
        gridH: CONTACT_GRID_H,
        lightMode: light,
        preserveColor: true,
        edgeStrength: 0.36,
        gamma: 0.9,
        ditherAmount: 0.2,
        reveal,
        interaction,
      },
      needUpload,
    );
    return;
  }

  if (!ctx2d) return;
  const visual = renderContactVisual(activeIdx, time, isLightMode(), reveal);
  const prevSmooth = ctx2d.imageSmoothingEnabled;
  ctx2d.imageSmoothingEnabled = false;
  ctx2d.drawImage(visual, drawRect.x, drawRect.y, drawRect.w, drawRect.h);
  ctx2d.imageSmoothingEnabled = prevSmooth;
}

function ensureDisplayFonts(): void {
  if (displayFontsPromise) return;
  displayFontsPromise = Promise.all([
    document.fonts.load('400 150px "Bungee"'),
    document.fonts.load('400 150px "Monoton"'),
    document.fonts.load('400 150px "Dela Gothic One"'),
    document.fonts.load('800 150px "Archivo"'),
  ]).then(() => {
    displayFontsLoaded = true;
    lastContactSourceKey = "";
    fieldDirty = true;
    if (story >= timeline.contactStart) {
      draw();
      fieldDirty = false;
    }
  });
}

function warmupIdleResources(): void {
  ensureDisplayFonts();
  warmupHobbyGpu();
  glStage?.warmup();
}

if (typeof requestIdleCallback === "function") {
  requestIdleCallback(() => warmupIdleResources(), { timeout: 2000 });
} else {
  setTimeout(warmupIdleResources, 1200);
}

function draw(): void {
  if (glStage) {
    glStage.beginFrame(isLightMode());
    if (reduced.matches) return;
    if (story < 1.85) {
      glStage.drawHeroSea({
        story,
        time,
        frameDelta,
        paused,
        reducedMotion: reduced.matches,
        hover,
        ripples,
        lightMode: isLightMode(),
      });
    }
    drawPortrait();
    drawProjects();
    drawContact();
    return;
  }

  if (!ctx2d) return;
  ctx2d.clearRect(0, 0, w, h);
  if (reduced.matches) return;
  if (story < 1.85) {
    renderHeroSea(ctx2d, w, h, {
      story,
      time,
      frameDelta,
      paused,
      reducedMotion: reduced.matches,
      hover,
      ripples,
      lightMode: isLightMode(),
    });
  }
  drawPortrait();
  drawProjects();
  drawContact();
}

interface PanelState {
  alpha: number;
  offset: number;
  hidden: boolean;
  inert: boolean;
}
const panelStates = new WeakMap<HTMLElement, PanelState>();

function setPanel(panel: HTMLElement, alpha: number, offset = 0): void {
  const a = Math.round(alpha * 10000) / 10000;
  const o = Math.round(offset * 100) / 100;
  const hidden = a <= 0.001;
  const inert = a < 0.5;
  const prev = panelStates.get(panel);
  if (prev && prev.hidden && hidden) return;
  if (prev && prev.alpha === a && prev.offset === o && prev.hidden === hidden && prev.inert === inert) {
    return;
  }
  panelStates.set(panel, { alpha: a, offset: o, hidden, inert });
  if (!prev || prev.alpha !== a) panel.style.opacity = String(a);
  if (!prev || prev.offset !== o) panel.style.transform = `translateY(${o}px)`;
  if (!prev || prev.hidden !== hidden) panel.style.visibility = hidden ? "hidden" : "";
  if (!prev || prev.inert !== inert) {
    panel.inert = inert;
    panel.style.pointerEvents = inert ? "none" : "auto";
  }
}

function updateNavCurrent(): void {
  const hash = reduced.matches
    ? ""
    : story >= timeline.contactStart - 0.15
      ? "#contact"
      : story >= 4.2
        ? "#work"
        : story >= 1.45
          ? "#about"
          : "";
  if (hash === activeNavHash) return;
  activeNavHash = hash;
  for (const link of navLinks) {
    if (link.getAttribute("href") === hash) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  }
}

function update(): void {
  const progress = clamp((window.scrollY - journeyTop) / scrollRange);
  story = progress * timeline.end;
  if (scrollRailFill) {
    scrollRailFill.style.transform = `scaleY(${progress})`;
  }
  updateNavCurrent();
  if (!reduced.matches) {
    const exit = ease((story - 0.2) / 0.85);
    const reveal = ease((story - 1.5) / 0.65);
    const leave = ease((story - 3.75) / 0.45);
    setPanel(opening, 1 - exit, -exit * 45);
    setPanel(about, reveal * (1 - leave), leave * -35);
    panels.forEach((panel, i) => {
      const start = timeline.projectStart + i * timeline.projectLength;
      const entry = ease((story - start) / 0.3);
      const out = ease((story - start - timeline.projectLength + 0.25) / 0.25);
      setPanel(panel, entry * (1 - out), (1 - entry) * 30 - out * 25);
    });
    setPanel(contact, ease((story - timeline.contactStart - 0.55) / 0.65));
    if (story >= 5.5) ensureDisplayFonts();
    if (story < timeline.contactStart) {
      contactWordClock = 0;
      lastContactHoldWordIdx = -1;
    }
  }

  document.body.style.backgroundColor = "";
  fieldDirty = true;
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
  w = innerWidth;
  h = stage.clientHeight;
  journeyTop = journey.getBoundingClientRect().top + window.scrollY;
  scrollRange = Math.max(1, journey.offsetHeight - stage.offsetHeight);
  const maxDpr = glStage ? 1.5 : 2;
  const d = Math.min(devicePixelRatio || 1, maxDpr);
  canvas.width = Math.round(w * d);
  canvas.height = Math.round(h * d);
  if (glStage) {
    glStage.resize(w, h);
  } else if (ctx2d) {
    ctx2d.setTransform(d, 0, 0, d, 0, 0);
  }
  fieldDirty = true;
  update();
  if (reduced.matches) {
    renderReducedDiagrams();
  }
  wakeLoop();
}

const cubeArt = document.querySelector<HTMLCanvasElement>('[data-hobby="cube"]');

function wakeOnInput(): void {
  lastUserActivity = performance.now();
  if (idleSlept) {
    idleSlept = false;
    wakeLoop();
  }
}

function wakeLoop(): void {
  if (document.hidden || !visible || paused || reduced.matches || idleSlept) {
    if (fieldDirty && visible && !document.hidden) {
      draw();
      fieldDirty = false;
    }
    return;
  }
  if (raf === 0) {
    last = performance.now();
    raf = requestAnimationFrame(tick);
  }
}

function tick(now: number): void {
  raf = 0;
  if (document.hidden || !visible || paused || reduced.matches) return;
  frameDelta = Math.max(0, Math.min((now - last) / 1000, 0.2));
  last = now;

  if (anchorAnim) {
    const p = clamp((now - anchorAnim.start) / anchorAnim.durationMs);
    const eased = p * p * p * (p * (p * 6 - 15) + 10);
    window.scrollTo({
      top: anchorAnim.from + (anchorAnim.to - anchorAnim.from) * eased,
      behavior: "instant",
    });
    scrollDirty = true;
    lastUserActivity = now;
    if (p >= 1) anchorAnim = null;
  }

  if (scrollDirty) {
    scrollDirty = false;
    update();
  }

  time += frameDelta;
  if (cosmicSpinBoost > 0.001) {
    cosmicSpinBoost *= Math.exp(-3.5 * frameDelta);
  } else {
    cosmicSpinBoost = 0;
  }
  if (ripples.length) {
    ripples = ripples.filter((rip) => (rip.age += frameDelta) < 1.3);
  }
  if (
    story > timeline.contactStart + 1.15 &&
    (!contactInteraction || contactWordClock % CONTACT_PERIOD > CONTACT_HOLD)
  ) {
    contactWordClock += frameDelta;
  }

  const staticPortrait = story >= 1.85 && isPortraitSettledStatic();
  if (staticPortrait) {
    // Keep idle GPU draw at 0 on settled portrait.
  } else if (story >= timeline.contactStart + 0.9) {
    const part = contactWordClock % CONTACT_PERIOD;
    const wordIdx = Math.floor(contactWordClock / CONTACT_PERIOD) % CONTACT_WORDS.length;
    if (part <= CONTACT_HOLD && !contactWordHasMotion(wordIdx) && ripples.length === 0) {
      if (wordIdx !== lastContactHoldWordIdx) {
        lastContactHoldWordIdx = wordIdx;
        fieldDirty = true;
      }
    } else {
      lastContactHoldWordIdx = -1;
      fieldDirty = true;
    }
  } else {
    lastContactHoldWordIdx = -1;
    fieldDirty = true;
  }

  const scrolling = now - lastScrollActivity < 120;
  if (
    !scrolling &&
    story > 1.45 &&
    story < 4.2 &&
    cubeArt &&
    (lastCubeFrame < 0 || time - lastCubeFrame >= 0.033)
  ) {
    lastCubeFrame = time;
    buildHobbyArt(cubeArt, time, isLightMode());
  }

  if (fieldDirty) {
    draw();
    fieldDirty = false;
  }

  const canSleep =
    story < timeline.contactStart &&
    ripples.length === 0 &&
    !anchorAnim &&
    now - lastUserActivity >= IDLE_SLEEP_MS;
  if (canSleep) {
    idleSlept = true;
    return;
  }

  raf = requestAnimationFrame(tick);
}

function sync(): void {
  document.body.dataset.motionPaused = String(paused);
  delete document.body.dataset.bgPaused;
  stopLoop();
  if (!document.hidden && visible && !paused && !reduced.matches) {
    last = performance.now();
    raf = requestAnimationFrame(tick);
  } else if (fieldDirty && visible && !document.hidden) {
    draw();
    fieldDirty = false;
  }
}

canvas.addEventListener("webglcontextlost", (event) => {
  event.preventDefault();
  stopLoop();
});
canvas.addEventListener("webglcontextrestored", () => {
  glStage = GlStageRenderer.create(canvas);
  lastContactSourceKey = "";
  lastContactHoldWordIdx = -1;
  lastStageSourceKind = "";
  if (glStage && portrait) {
    glStage.setPortrait(portrait);
  }
  resize();
  sync();
});

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

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopLoop();
  } else {
    sync();
  }
});
reduced.addEventListener("change", () => {
  paused = reduced.matches;
  if (reduced.matches) {
    [opening, about, ...panels, contact].forEach((panel) => {
      panel.style.visibility = "";
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

const markScrollActivity = () => {
  lastScrollActivity = performance.now();
  lastUserActivity = lastScrollActivity;
  idleSlept = false;
  scrollDirty = true;
  if (glStage) {
    // Immediate sync update during native scroll so sticky stage matches scrollY in the same frame.
    update();
  }
  wakeLoop();
};

const cancelAnchorScroll = () => {
  anchorAnim = null;
  wakeOnInput();
};

const storyBeats = [
  0,
  2.85,
  ...portfolioProjects.map(
    (_, i) => timeline.projectStart + i * timeline.projectLength + 0.85,
  ),
  Number((timeline.contactStart + 1.45).toFixed(2)),
];

window.addEventListener("scroll", markScrollActivity, { passive: true });
window.addEventListener("wheel", cancelAnchorScroll, { passive: true });
window.addEventListener("touchstart", cancelAnchorScroll, { passive: true });
window.addEventListener("resize", () => {
  wakeOnInput();
  resize();
});
window.addEventListener("keydown", (event) => {
  if (reduced.matches) return;
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  const activeTag = (document.activeElement as Element | null)?.tagName;
  if (activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT") return;
  const forward = event.key === "ArrowDown" || event.key === "PageDown";
  const backward = event.key === "ArrowUp" || event.key === "PageUp";
  if (!forward && !backward) return;
  event.preventDefault();
  wakeOnInput();
  const nextBeat = forward
    ? storyBeats.find((b) => b > story + 0.25) ?? storyBeats[storyBeats.length - 1]
    : [...storyBeats].reverse().find((b) => b < story - 0.25) ?? 0;
  const targetY = journeyTop + (scrollRange * nextBeat) / timeline.end;
  scrollStory(targetY, 1.8);
});
window.addEventListener(
  "pointermove",
  (event) => {
    if (reduced.matches) return;
    hover.x = event.clientX / Math.max(1, w);
    hover.y = event.clientY / Math.max(1, h);
    hover.inside = true;
    wakeOnInput();
    if (!(story >= 1.85 && isPortraitSettledStatic())) {
      fieldDirty = true;
      wakeLoop();
    }
  },
  { passive: true },
);
window.addEventListener(
  "pointerdown",
  (event) => {
    if (paused || reduced.matches) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if ((event.target as Element | null)?.closest("a, button")) return;
    wakeOnInput();
    if (ripples.length >= 4) ripples.shift();
    ripples.push({
      x: event.clientX / Math.max(1, w),
      y: event.clientY / Math.max(1, h),
      age: 0,
    });
    if (story >= 4.25 && story < timeline.contactStart) {
      const { index } = projectSlice(story, timeline, portfolioProjects.length);
      if (portfolioProjects[index]?.diagramId === "cosmicrecomp") {
        cosmicSpinBoost += Math.PI / 4;
      }
    }
    fieldDirty = true;
    wakeLoop();
  },
  { passive: true },
);
document.documentElement.addEventListener("pointerleave", () => {
  hover.inside = false;
  if (!(story >= 1.85 && isPortraitSettledStatic())) {
    fieldDirty = true;
    wakeLoop();
  }
});
window.addEventListener(
  "pointercancel",
  () => {
    hover.inside = false;
    if (!(story >= 1.85 && isPortraitSettledStatic())) {
      fieldDirty = true;
      wakeLoop();
    }
  },
  { passive: true },
);

function scrollStory(target: number, duration: number): void {
  scrollDirty = true;
  if (reduced.matches) {
    anchorAnim = null;
    window.scrollTo({ top: target, behavior: "instant" });
    wakeLoop();
    return;
  }
  anchorAnim = {
    from: window.scrollY,
    to: Math.max(0, Math.min(scrollRange, target)),
    start: performance.now(),
    durationMs: Math.max(200, (duration / TRANSITION_SPEED) * 1000),
  };
  wakeLoop();
}

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
      : journeyTop + (scrollRange * beat) / timeline.end;
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
sync();
