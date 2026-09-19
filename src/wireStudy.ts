import "@fontsource/newsreader/latin-400-italic.css";
import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-500.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "./index.css";
import "./wireStudy.css";
import { createStudy } from "./scene/wireStudy/createStudy";

const root = document.querySelector<HTMLDivElement>("#root")!;
root.innerHTML = `
  <header class="site-header"><div class="header-inner content-grid">
    <a class="wordmark" href="./">Kushal Mamillapalli<span class="brand-dot">.</span></a>
    <nav aria-label="Main navigation"><a href="./#about">About</a><a href="./#work">Work</a><a href="./documents/kushal-mamillapalli-resume.pdf" target="_blank" rel="noopener">Résumé ↗</a><a href="./#contact">Contact</a></nav>
    <button id="theme" class="study-theme" aria-pressed="false">Light theme</button>
  </div></header>
  <div class="hero-wire-backdrop" aria-hidden="true"><canvas id="wire-canvas"></canvas></div>
  <main id="main"><section class="hero" id="top" aria-labelledby="hero-title"><div class="hero-copy content-grid">
    <p class="eyebrow">Data infrastructure · Backend · Applied ML</p>
    <h1 id="hero-title"><span>Behind the</span> <em>interface.</em></h1>
    <p class="hero-intro">I’m Kushal. I build data pipelines<br class="desktop-break" /> and recommendation systems.</p>
    <p class="current-role"><span class="status-dot"></span>Data Engineer (Emerging Talent) at Spotify</p>
    <a class="text-link hero-link" href="./#work">View projects <span aria-hidden="true">↓</span></a>
  </div></section></main>
  <div id="failure" role="status" hidden></div>
  <aside class="study-tools" aria-label="Hero preview controls">
    <span>HERO PREVIEW / 20 WIRES</span>
    <button id="play" aria-pressed="false">Pause motion</button>
    <details><summary>Adjust</summary><div class="study-settings">
      <label>Travel <output id="speed-value">2.0×</output><input id="speed" aria-label="Travel speed" type="range" min="0.2" max="2" step="0.1" value="2" /></label>
      <label>Glow <output id="glow-value">30%</output><input id="glow" aria-label="Glow strength" type="range" min="0" max="0.7" step="0.01" value="0.21" /></label>
    </div></details>
  </aside>`;
const get = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const failure = get<HTMLDivElement>("failure");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
let paused = reduced.matches, light = false;
document.documentElement.dataset.theme = "dark";
const showError = (message: string) => { failure.hidden = false; failure.textContent = message; };
try {
  const study = createStudy(get<HTMLCanvasElement>("wire-canvas"), showError);
  const syncMotion = () => {
    study.setPlaying(!paused);
    get("play").textContent = paused ? "Play motion" : "Pause motion";
    get("play").setAttribute("aria-pressed", String(paused));
  };
  syncMotion();
  get("play").addEventListener("click", () => { paused = !paused; syncMotion(); });
  get<HTMLInputElement>("speed").addEventListener("input", event => {
    const value = Number((event.target as HTMLInputElement).value);
    study.setSpeed(value); get("speed-value").textContent = `${value.toFixed(1)}×`;
  });
  get<HTMLInputElement>("glow").addEventListener("input", event => {
    const value = Number((event.target as HTMLInputElement).value);
    study.setGlow(value); get("glow-value").textContent = value === .7 ? "MAX" : `${Math.round(value / .7 * 100)}%`;
  });
  get("theme").addEventListener("click", () => {
    light = !light; document.documentElement.dataset.theme = light ? "light" : "dark";
    study.setTheme(light); get("theme").textContent = light ? "Dark theme" : "Light theme";
    get("theme").setAttribute("aria-pressed", String(light));
  });
  const motionChanged = () => { paused = reduced.matches; syncMotion(); };
  reduced.addEventListener("change", motionChanged);
  window.addEventListener("pagehide", event => {
    if (event.persisted) { study.setPlaying(false); return; }
    reduced.removeEventListener("change", motionChanged); study.dispose();
  });
  window.addEventListener("pageshow", syncMotion);
} catch (error) {
  showError(`The wire preview could not start. ${error instanceof Error ? error.message : "WebGL may be unavailable."}`);
  root.querySelectorAll("button, input").forEach(element => { (element as HTMLButtonElement).disabled = true; });
}
