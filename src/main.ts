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
} from "./timeline";
import {
  CONTACT_WORDS,
  contactWordHasMotion,
  renderContactVisual,
} from "./canvas/contactVisual";
import { applyBayerMask, renderBayerDither } from "./canvas/dither";
import { renderHeroSea } from "./canvas/field";
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
}

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
        <h1 id="name">Kushal<span>Mamillapalli</span></h1>
        <p class="intro">I build recommendation systems and the infrastructure behind them.</p>
        <a class="scroll-link" href="#about" aria-label="Scroll to explore"><span class="scroll-travel" aria-hidden="true"></span></a>
      </section>
      <section class="about" id="about" aria-labelledby="about-title">
        <h2 id="about-title">Curious about<br>how things connect.</h2>
        <p class="bio">I’m a data engineer at <span class="inline-org"><svg class="mark" data-mark="spotify" aria-hidden="true"></svg>Spotify</span>, working on personalization pipelines.</p>
        <img class="reduced-photo" src="${base}images/portrait-960.webp" alt="Kushal in New York">
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
let smoothScroll: Lenis | null = null;

const hover = { x: 0.5, y: 0.5, inside: false };
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
let lastCubeFrame = -1;
let scrollDirty = true;
let fieldDirty = true;
let idleTimer = 0;
let windowFocused = true;
let lastScrollActivity = 0;
let lastPointerActivity = 0;

function isPortraitSettledStatic(): boolean {
  return story >= 2.8 && story <= 3.55 && ripples.length === 0 && Boolean(portraitPhoto);
}

function stopLoop(): void {
  if (raf) {
    cancelAnimationFrame(raf);
    raf = 0;
  }
  if (idleTimer) {
    clearTimeout(idleTimer);
    idleTimer = 0;
  }
}

function isScrollActive(now: number): boolean {
  return (
    scrollDirty ||
    Boolean(smoothScroll?.isSmooth) ||
    now - lastScrollActivity < 450
  );
}

function nextFrameDelayMs(now: number): number {
  if (isScrollActive(now)) return 0;
  if (ripples.length > 0 && story < 4.55) return 16;
  if (story < 1.85) return now - lastPointerActivity < 350 ? 28 : 48;
  if (story < 4.2) {
    if (isPortraitSettledStatic()) return 55;
    return now - lastPointerActivity < 350 ? 32 : 48;
  }
  if (story < timeline.contactStart) return 40;

  const part = contactWordClock % CONTACT_PERIOD;
  const wordIndex = Math.floor(contactWordClock / CONTACT_PERIOD) % CONTACT_WORDS.length;
  const dissolving = part > CONTACT_HOLD || story < timeline.contactStart + 0.9;
  if (dissolving) return 40;

  const baseDelay = contactWordHasMotion(wordIndex) ? 66 : 125;
  if (contactInteraction) return baseDelay;
  return Math.max(40, Math.min(baseDelay, Math.ceil((CONTACT_HOLD - part) * 1000)));
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
  lastCubeFrame = -1;
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

themeToggle.addEventListener("click", () => setTheme(isLightMode() ? "dark" : "light"));

const panels = portfolioProjects.map((project) => {
  const panel = document.createElement("section");
  panel.className = "project-panel";
  panel.id = project.slug;
  panel.setAttribute("aria-labelledby", `${project.slug}-title`);
  panel.innerHTML = `<h2 id="${project.slug}-title">${project.name}</h2><p>${project.summary}</p><a href="${project.href}">View source ↗</a><canvas class="reduced-diagram" role="img" aria-label="Dithered ${project.name} visual"></canvas>`;
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
  fieldDirty = true;
  draw();
  fieldDirty = false;
};
photo.src = `${base}images/portrait-960.webp`;

function cachePortrait(): void {
  if (!portrait) return;
  const cols = 100;
  const rows = Math.round((100 * portrait.height) / portrait.width);
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

  const ditherW = 240;
  const ditherH = Math.round((ditherW * portrait.height) / portrait.width);
  portraitDither = document.createElement("canvas");
  portraitDither.width = ditherW;
  portraitDither.height = ditherH;
  renderBayerDither(portraitPhoto, portraitDither, {
    cellSize: 2,
    ditherAmount: 0.24,
    lightMode: isLightMode(),
    preserveColor: true,
    edgeStrength: 0.34,
  });

  portraitDitherAnimated = document.createElement("canvas");
  portraitDitherAnimated.width = ditherW;
  portraitDitherAnimated.height = ditherH;

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
  if (
    !cols ||
    !rows ||
    !cells ||
    !veilMaskCtx ||
    !veilImageData ||
    !veilMask ||
    !veilScale
  ) {
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
  if (
    !portraitDither ||
    !portraitDitherAnimated ||
    !portraitPhoto ||
    !veilMaskCtx ||
    !veilScratch ||
    !veilScale ||
    story < 1.15 ||
    story >= 4.55
  ) {
    return;
  }

  const enterReveal = ease((story - 1.15) / 0.75);
  const exitReveal = 1 - ease((story - 4.0) / 0.55);
  const portraitReveal = clamp(enterReveal * exitReveal);
  if (portraitReveal <= 0.005) return;

  const r = portraitRect();
  let ditherSurface = portraitDither;
  if (portraitReveal < 0.995) {
    renderBayerDither(portraitPhoto, portraitDitherAnimated, {
      cellSize: 2,
      ditherAmount: 0.24,
      lightMode: isLightMode(),
      preserveColor: true,
      edgeStrength: 0.34,
      reveal: portraitReveal,
    });
    ditherSurface = portraitDitherAnimated;
  }

  const toPhoto = ease((story - 2.25) / 0.55);
  const toDither = ease((story - 3.55) / 0.55);
  const photoMix = toPhoto * (1 - toDither) * portraitReveal;
  const prevSmooth = ctx.imageSmoothingEnabled;
  const prevQuality = ctx.imageSmoothingQuality;

  if (photoMix >= 0.999 && portraitReveal >= 0.999 && ripples.length === 0) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(portraitPhoto, r.x, r.y, r.w, r.h);
    ctx.imageSmoothingEnabled = prevSmooth;
    ctx.imageSmoothingQuality = prevQuality;
    return;
  }

  const peak = updateVeil(r, photoMix);

  if (photoMix < 0.001 && peak < 0.02) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(ditherSurface, r.x, r.y, r.w, r.h);
    ctx.imageSmoothingEnabled = prevSmooth;
    ctx.imageSmoothingQuality = prevQuality;
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
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(veilScratch, r.x, r.y, r.w, r.h);

  sc.imageSmoothingEnabled = true;
  sc.imageSmoothingQuality = "high";
  sc.globalCompositeOperation = "source-over";
  sc.clearRect(0, 0, veilScratch.width, veilScratch.height);
  sc.drawImage(portraitPhoto, 0, 0);
  sc.imageSmoothingEnabled = false;
  sc.globalCompositeOperation = "destination-in";
  sc.drawImage(veilScale, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.globalAlpha = portraitReveal;
  ctx.drawImage(veilScratch, r.x, r.y, r.w, r.h);
  ctx.globalAlpha = 1;
  ctx.imageSmoothingEnabled = prevSmooth;
  ctx.imageSmoothingQuality = prevQuality;
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

function drawProjects(): void {
  if (story < 4.2 || story >= timeline.contactStart) return;
  const { index, local } = projectSlice(
    story,
    timeline,
    portfolioProjects.length,
  );
  const project = portfolioProjects[index];
  const enter = index === 0 ? ease((story - 4.2) / 0.55) : ease(local / 0.22);
  const leave =
    index === portfolioProjects.length - 1
      ? 1 - ease((story - (timeline.contactStart - 0.5)) / 0.5)
      : 1 - ease((local - 0.8) / 0.2);
  const reveal = clamp(enter * leave);
  if (reveal <= 0.005) return;

  const visual = renderProjectVisual(
    project.diagramId,
    local,
    time,
    isLightMode(),
    reveal,
  );
  const targetRect = fitAspectRect(diagramRect(), visual.width / visual.height);
  const prevSmooth = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    visual,
    targetRect.x,
    targetRect.y,
    targetRect.w,
    targetRect.h,
  );
  ctx.imageSmoothingEnabled = prevSmooth;
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

  const visual = renderContactVisual(activeIdx, time, isLightMode(), reveal);
  const vh = Math.min(h, innerHeight);
  const bounds: Rect = {
    x: w * 0.05,
    y: vh * 0.11,
    w: w * 0.9,
    h: vh * 0.54,
  };
  const targetRect = fitAspectRect(bounds, visual.width / visual.height);
  const drawX = w < 700 ? targetRect.x : Math.min(targetRect.x, w * 0.055);
  const prevSmooth = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(visual, drawX, targetRect.y, targetRect.w, targetRect.h);
  ctx.imageSmoothingEnabled = prevSmooth;
}

Promise.all([
  document.fonts.load('400 150px "Bungee"'),
  document.fonts.load('400 150px "Monoton"'),
  document.fonts.load('400 150px "Dela Gothic One"'),
  document.fonts.load('800 150px "Archivo"'),
]).then(() => {
  fieldDirty = true;
  draw();
  fieldDirty = false;
});

function draw(): void {
  ctx.clearRect(0, 0, w, h);
  if (reduced.matches) return;
  if (story < 1.85) {
    renderHeroSea(ctx, w, h, {
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

function setPanel(panel: HTMLElement, alpha: number, offset = 0): void {
  panel.style.opacity = String(alpha);
  panel.style.transform = `translateY(${offset}px)`;
  panel.style.visibility = alpha <= 0.001 ? "hidden" : "";
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
  const d = Math.min(devicePixelRatio || 1, 2);
  canvas.width = w * d;
  canvas.height = h * d;
  ctx.setTransform(d, 0, 0, d, 0, 0);
  fieldDirty = true;
  update();
  if (reduced.matches) {
    renderReducedDiagrams();
  }
  wakeLoop();
}

const cubeArt = document.querySelector<HTMLCanvasElement>('[data-hobby="cube"]');

function wakeLoop(): void {
  if (document.hidden || !windowFocused || !visible || paused || reduced.matches) {
    if (fieldDirty && visible && !document.hidden) {
      draw();
      fieldDirty = false;
    }
    return;
  }
  if (idleTimer) {
    clearTimeout(idleTimer);
    idleTimer = 0;
  }
  if (raf === 0) {
    last = performance.now();
    raf = requestAnimationFrame(tick);
  }
}

function tick(now: number): void {
  raf = 0;
  if (document.hidden || !windowFocused) return;
  frameDelta = Math.max(0, Math.min((now - last) / 1000, 0.2));
  last = now;
  if (isScrollActive(now)) {
    smoothScroll?.raf(now);
  }
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
    if (!isPortraitSettledStatic()) {
      fieldDirty = true;
    }
    if (
      story > 1.45 &&
      story < 4.2 &&
      cubeArt &&
      (lastCubeFrame < 0 || time - lastCubeFrame >= 0.05)
    ) {
      lastCubeFrame = time;
      buildHobbyArt(cubeArt, time, isLightMode());
    }
  }
  if (fieldDirty && visible) {
    draw();
    fieldDirty = false;
  }
  if (visible && !paused && !reduced.matches) {
    const delay = nextFrameDelayMs(now);
    if (delay <= 0) {
      raf = requestAnimationFrame(tick);
    } else {
      idleTimer = window.setTimeout(() => {
        idleTimer = 0;
        if (!document.hidden && windowFocused && visible && !paused && !reduced.matches) {
          raf = requestAnimationFrame(tick);
        }
      }, delay);
    }
  }
}

function sync(): void {
  document.body.dataset.motionPaused = String(paused);
  if (windowFocused) {
    delete document.body.dataset.bgPaused;
  }
  stopLoop();
  if (!document.hidden && windowFocused && visible && !paused && !reduced.matches) {
    last = performance.now();
    raf = requestAnimationFrame(tick);
  } else if (fieldDirty && visible && !document.hidden) {
    draw();
    fieldDirty = false;
  }
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

window.addEventListener("blur", () => {
  windowFocused = false;
  document.body.dataset.bgPaused = "true";
  stopLoop();
});
window.addEventListener("focus", () => {
  windowFocused = true;
  delete document.body.dataset.bgPaused;
  sync();
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
  scrollDirty = true;
  windowFocused = true;
  delete document.body.dataset.bgPaused;
  wakeLoop();
};

window.addEventListener("scroll", markScrollActivity, { passive: true });
window.addEventListener("wheel", markScrollActivity, { passive: true });
window.addEventListener("touchstart", markScrollActivity, { passive: true });
window.addEventListener("touchmove", markScrollActivity, { passive: true });
window.addEventListener("keydown", (event) => {
  if (
    event.key === "ArrowDown" ||
    event.key === "ArrowUp" ||
    event.key === "PageDown" ||
    event.key === "PageUp" ||
    event.key === "Home" ||
    event.key === "End" ||
    event.key === " "
  ) {
    markScrollActivity();
  }
});
window.addEventListener("resize", resize);
window.addEventListener(
  "pointermove",
  (event) => {
    if (reduced.matches) return;
    hover.x = event.clientX / Math.max(1, w);
    hover.y = event.clientY / Math.max(1, h);
    hover.inside = true;
    if (story < 4.55 && !isPortraitSettledStatic()) {
      lastPointerActivity = performance.now();
      fieldDirty = true;
      wakeLoop();
    }
  },
  { passive: true },
);
window.addEventListener(
  "pointerdown",
  (event) => {
    windowFocused = true;
    delete document.body.dataset.bgPaused;
    if (paused || reduced.matches || story >= 4.1) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if ((event.target as Element | null)?.closest("a, button")) return;
    if (ripples.length >= 4) ripples.shift();
    ripples.push({
      x: event.clientX / Math.max(1, w),
      y: event.clientY / Math.max(1, h),
      age: 0,
    });
    lastPointerActivity = performance.now();
    fieldDirty = true;
    wakeLoop();
  },
  { passive: true },
);
document.documentElement.addEventListener("pointerleave", () => {
  hover.inside = false;
  if (story < 4.55 && !isPortraitSettledStatic()) {
    fieldDirty = true;
    wakeLoop();
  }
});
window.addEventListener(
  "pointercancel",
  () => {
    hover.inside = false;
    if (story < 4.55 && !isPortraitSettledStatic()) {
      fieldDirty = true;
      wakeLoop();
    }
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
  smoothScroll.on("scroll", markScrollActivity);
}

function scrollStory(target: number, duration: number): void {
  lastScrollActivity = performance.now();
  scrollDirty = true;
  windowFocused = true;
  delete document.body.dataset.bgPaused;
  if (smoothScroll) {
    smoothScroll.scrollTo(target, {
      duration: duration / TRANSITION_SPEED,
      lerp: 0,
      easing: (p) => p * p * p * (p * (p * 6 - 15) + 10),
    });
    wakeLoop();
    return;
  }
  window.scrollTo({
    top: target,
    behavior: reduced.matches ? "instant" : "smooth",
  });
  wakeLoop();
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
