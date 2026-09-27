import { useEffect } from "react";

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const ease = (t: number) => t * t * (3 - 2 * t);
const lerp = (from: number, to: number, t: number) => from + (to - from) * t;
const GUIDE_SIZE = 22;
const PILL_PADDING = 11;
/** Accent per stage: ingest, route, transform (on night), output. */
const ACCENTS = ["#2c7456", "#3452c7", "#b7a6ff", "#d9502c"];
const PAPERS = ["#efece4", "#eceee9", "#eceee9", "#f2ebe2"];

const rgb = (hex: string) => [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16));
function mixStops(stops: string[], position: number) {
  const index = Math.min(stops.length - 2, Math.floor(position));
  const t = clamp(position - index);
  const [a, b] = [rgb(stops[index]), rgb(stops[index + 1])];
  return `rgb(${a.map((value, channel) => Math.round(value + (b[channel] - value) * t)).join(" ")})`;
}

/**
 * The accent dot over the surname's "ı" detaches as the hero leaves and wraps
 * the active pipeline stage in the header. One rAF, which stops once the dot
 * has settled.
 */
export function usePipelineGuide() {
  useEffect(() => {
    const guide = document.querySelector<HTMLElement>("[data-guide-dot]");
    const origin = document.querySelector<HTMLElement>("[data-name-dot]");
    const hero = document.getElementById("top");
    const stages = [...document.querySelectorAll<HTMLAnchorElement>("[data-stage]")];
    const sections = stages.map(stage => document.getElementById(stage.hash.slice(1)));
    if (!guide || !origin || !hero || sections.some(section => !section)) return;
    const flood = document.querySelector<HTMLElement>("[data-flood]");
    const floodBridge = document.querySelector<HTMLElement>("[data-flood-bridge]");
    const caption = guide.querySelector<HTMLElement>("[data-guide-label]");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let last = performance.now();
    let stageX = NaN, stageY = NaN, stageW = NaN;
    let active = -1;

    const paint = (now: number) => {
      raf = 0;
      const dt = Math.min(.05, (now - last) / 1000);
      last = now;
      const vh = window.innerHeight;
      let next = 0;
      sections.forEach((section, index) => { if (section!.getBoundingClientRect().top <= vh * .45) next = index; });
      if (next !== active) {
        stages.forEach((stage, index) => stage.toggleAttribute("data-active", index === next));
        document.documentElement.dataset.stage = String(next);
        if (caption) caption.textContent = stages[next].firstChild?.textContent ?? "";
        active = next;
      }
      // Continuous stage position: each boundary blends over one viewport.
      const position = sections.slice(1).reduce((sum, section) =>
        sum + ease(clamp((vh * .95 - section!.getBoundingClientRect().top) / vh)), 0);
      const root = document.documentElement.style;
      root.setProperty("--accent", mixStops(ACCENTS, position));
      root.setProperty("--paper-live", mixStops(PAPERS, position));

      const label = stages[active].getBoundingClientRect();
      const targetX = label.left + label.width / 2, targetY = label.top + label.height / 2;
      const targetW = label.width + PILL_PADDING * 2;
      const k = reduced.matches || Number.isNaN(stageX) ? 1 : 1 - Math.exp(-12 * dt);
      stageX = Number.isNaN(stageX) ? targetX : stageX + (targetX - stageX) * k;
      stageY = Number.isNaN(stageY) ? targetY : stageY + (targetY - stageY) * k;
      stageW = Number.isNaN(stageW) ? targetW : stageW + (targetW - stageW) * k;

      const dot = origin.getBoundingClientRect();
      const t = ease(clamp(window.scrollY / Math.max(1, hero.offsetHeight * .5)));
      const x = lerp(dot.left + dot.width / 2, stageX, t);
      const y = lerp(dot.top + dot.height / 2, stageY, t);
      const size = lerp(dot.width, GUIDE_SIZE, t);
      const width = lerp(GUIDE_SIZE, stageW, t);
      const scale = size / GUIDE_SIZE;
      guide.style.width = `${width.toFixed(2)}px`;
      guide.style.transform = `translate3d(${(x - width * scale / 2).toFixed(2)}px, ${(y - size / 2).toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
      guide.style.setProperty("--pill", t.toFixed(3));

      // Route → Transform: the dot swells until the night fills the viewport.
      if (flood && floodBridge) {
        const bridge = floodBridge.getBoundingClientRect();
        const p = bridge.height ? clamp((vh - bridge.top) / bridge.height) : 0;
        // About holds still and recedes while the night swallows it, so the
        // hand-off reads as a change of plane rather than more page.
        sections[1]!.style.transform = p > 0
          ? `translate3d(0, ${(p * bridge.height).toFixed(1)}px, 0) scale(${(1 - .07 * ease(p)).toFixed(4)})`
          : "";
        const visible = p > 0 && bridge.bottom > 0;
        flood.style.visibility = visible ? "visible" : "hidden";
        if (visible) {
          const vw = window.innerWidth;
          const reach = Math.hypot(Math.max(x, vw - x), Math.max(y, vh - y));
          const radius = size / 2 + (reach - size / 2) * Math.pow(p, 1.8);
          flood.style.clipPath = `circle(${radius.toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px)`;
          flood.style.setProperty("--p", p.toFixed(4));
        }
      }
      const settling = Math.abs(targetX - stageX) > .2 || Math.abs(targetY - stageY) > .2 || Math.abs(targetW - stageW) > .2;
      if (settling) schedule();
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };

    document.documentElement.dataset.guide = "ready";
    const resize = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(schedule);
    resize?.observe(document.documentElement);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.fonts?.ready.then(schedule);
    schedule();
    return () => {
      cancelAnimationFrame(raf);
      resize?.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      delete document.documentElement.dataset.guide;
      delete document.documentElement.dataset.stage;
      document.documentElement.style.removeProperty("--accent");
      document.documentElement.style.removeProperty("--paper-live");
      sections[1]!.style.transform = "";
    };
  }, []);
}
