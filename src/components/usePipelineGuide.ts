import { useEffect } from "react";

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const ease = (t: number) => t * t * (3 - 2 * t);
const lerp = (from: number, to: number, t: number) => from + (to - from) * t;
const GUIDE_SIZE = 22;
const PILL_PADDING = 11;
const FLOOD_FULL = .84;
const PROJECT_ACCENTS = ["#d7b6ff", "#bf9df7", "#aa86e9", "#916bd1"];

/** Untransformed document offset, so held/receding sections don't skew measurements. */
function pageOffset(element: HTMLElement) {
  let top = 0, left = 0;
  for (let node: HTMLElement | null = element; node; node = node.offsetParent as HTMLElement | null) {
    top += node.offsetTop;
    left += node.offsetLeft;
  }
  return { top, left };
}

/** Writes a style value only when it changed, so idle frames cost no style recalc. */
function writer() {
  const written = new WeakMap<HTMLElement, Map<string, string>>();
  return (element: HTMLElement, property: string, value: string) => {
    let values = written.get(element);
    if (!values) written.set(element, values = new Map());
    if (values.get(property) === value) return;
    values.set(property, value);
    element.style.setProperty(property, value);
  };
}

/**
 * The accent dot over the surname's "ı" detaches as the hero leaves and wraps
 * the active pipeline stage in the header. Layout is measured once per resize;
 * each frame is arithmetic on scrollY followed by writes, so scrolling never
 * forces a synchronous layout.
 */
export function usePipelineGuide() {
  useEffect(() => {
    const guide = document.querySelector<HTMLElement>("[data-guide-dot]");
    const origin = document.querySelector<HTMLElement>("[data-name-dot]");
    const hero = document.getElementById("top");
    const stages = [...document.querySelectorAll<HTMLAnchorElement>("[data-stage]")];
    const sections = stages.map(stage => document.getElementById(stage.hash.slice(1)));
    if (!guide || !origin || !hero || sections.some(section => !section)) return;
    const about = sections[1]!;
    const work = sections[2]!;
    const projectTrack = work.querySelector<HTMLElement>(".project-track");
    const projects = [...work.querySelectorAll<HTMLElement>(".project-row")];
    const gate = document.querySelector<HTMLElement>("[data-gate]");
    const flood = document.querySelector<HTMLElement>("[data-flood]");
    const floodBridge = document.querySelector<HTMLElement>("[data-flood-bridge]");
    const caption = guide.querySelector<HTMLElement>("[data-guide-label]");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Native (and touch) scrolling runs ahead of rAF, so counter-scroll holds
    // would shake there; only hold content where Lenis drives the scroll.
    const touch = window.matchMedia("(pointer: coarse)");
    // With scroll-driven animations the gate and flood run in CSS on the
    // compositor; this only positions the flood and handles the Lenis holds.
    const driven = typeof CSS !== "undefined" && CSS.supports?.("animation-timeline: view()");
    const write = writer();
    let raf = 0;
    let last = performance.now();
    let stageX = NaN, stageY = NaN, stageW = NaN;
    let active = -1, activeProject = -1;

    let layout = {
      tops: [] as number[],
      projectTops: [] as number[],
      labels: [] as DOMRect[],
      dot: { top: 0, left: 0, size: 0 },
      heroHeight: 1,
      gate: { top: 0, height: 0 },
      flood: { top: 0, height: 0 },
    };
    const measure = () => {
      const dot = pageOffset(origin);
      const projectOrigin = projectTrack ? projectTrack.getBoundingClientRect().top + window.scrollY : 0;
      layout = {
        tops: sections.map(section => pageOffset(section!).top),
        projectTops: projects.map(project => projectOrigin + project.offsetTop),
        labels: stages.map(stage => stage.getBoundingClientRect()),
        dot: { top: dot.top, left: dot.left, size: origin.offsetWidth },
        heroHeight: Math.max(1, hero.offsetHeight),
        gate: gate ? { top: pageOffset(gate).top, height: gate.offsetHeight } : { top: 0, height: 0 },
        flood: floodBridge ? { top: pageOffset(floodBridge).top, height: floodBridge.offsetHeight } : { top: 0, height: 0 },
      };    };

    const paint = (now: number) => {
      raf = 0;
      const dt = Math.min(.05, (now - last) / 1000);
      last = now;
      const scroll = window.scrollY;
      const vh = window.innerHeight, vw = window.innerWidth;
      const hold = !reduced.matches && !touch.matches && document.documentElement.classList.contains("lenis");

      let next = 0;
      layout.tops.forEach((top, index) => { if (top - scroll <= vh * .45) next = index; });
      if (next !== active) {
        stages.forEach((stage, index) => stage.toggleAttribute("data-active", index === next));
        document.documentElement.dataset.stage = String(next);
        if (caption) caption.textContent = stages[next].firstChild?.textContent ?? "";
        active = next;
      }

      // The Transform accent follows the project crossing the viewport's
      // reading line. CSS fades the color between each distinct purple.
      const project = layout.projectTops.reduce((current, top, index) =>
        top - scroll <= vh * .55 ? index : current, 0);
      if (project !== activeProject) {
        projects.forEach((row, index) => row.toggleAttribute("data-current", index === project));
        activeProject = project;
      }
      write(document.documentElement, "--project-accent", PROJECT_ACCENTS[Math.min(project, PROJECT_ACCENTS.length - 1)]);

      // Ingest → Route: a late line announces the green gate, then both fade
      // before About settles into a clean paper surface.
      let heroShift = 0, heroTransform = "", heroVisibility = "", aboutTransform = "", aboutOrigin = "";
      if (gate) {
        const span = Math.max(1, layout.gate.height - vh);
        const into = scroll - layout.gate.top;
        const through = reduced.matches ? 1 : clamp(into / span);
        const grow = ease(clamp((through - .26) / .18));
        const open = ease(clamp((through - .70) / .30));
        if (!driven) {
          write(gate, "--gate-line", clamp((through - .10) / .14).toFixed(3));
          write(gate, "--grow", grow.toFixed(3));
          write(gate, "--scan", ease(clamp((through - .58) / .12)).toFixed(3));
          write(gate, "--open", open.toFixed(3));
        }
        if (hold && through > 0 && through < 1) {
          // The hero holds still and recedes behind the closing gate; About is
          // pinned beneath it once closed, so the gate opens onto it in place.
          if (grow < 1) {
            heroShift = into;
            heroTransform = `translate3d(0, ${into.toFixed(1)}px, 0) scale(${(1 - .05 * grow).toFixed(4)})`;
          } else {
            heroVisibility = "hidden";
            const aboutTop = layout.tops[1] - scroll;
            aboutTransform = `translate3d(0, ${(-aboutTop).toFixed(1)}px, 0) scale(${(1 - .04 * (1 - open)).toFixed(4)})`;
            aboutOrigin = "50% 50vh";
          }
        }
      }

      const label = layout.labels[active];
      const targetX = label.left + label.width / 2, targetY = label.top + label.height / 2;
      const targetW = label.width + PILL_PADDING * 2;
      const k = reduced.matches || Number.isNaN(stageX) ? 1 : 1 - Math.exp(-12 * dt);
      stageX = Number.isNaN(stageX) ? targetX : stageX + (targetX - stageX) * k;
      stageY = Number.isNaN(stageY) ? targetY : stageY + (targetY - stageY) * k;
      stageW = Number.isNaN(stageW) ? targetW : stageW + (targetW - stageW) * k;

      const t = ease(clamp(scroll / (layout.heroHeight * .5)));
      const dotSize = layout.dot.size;
      const x = lerp(layout.dot.left + dotSize / 2, stageX, t);
      const y = lerp(layout.dot.top + dotSize / 2 - scroll + heroShift, stageY, t);
      const size = lerp(dotSize, GUIDE_SIZE, t);
      const width = lerp(GUIDE_SIZE, stageW, t);
      const scale = size / GUIDE_SIZE;
      write(guide, "width", `${width.toFixed(1)}px`);
      write(guide, "transform", `translate3d(${(x - width * scale / 2).toFixed(1)}px, ${(y - size / 2).toFixed(1)}px, 0) scale(${scale.toFixed(3)})`);
      write(guide, "--pill", t.toFixed(3));

      // Route → Transform: the dot swells until the night fills the viewport.
      if (flood && floodBridge) {
        const { top, height } = layout.flood;
        const bridgeTop = top - scroll;
        const p = height ? clamp((vh - bridgeTop) / height) : 0;
        // About holds still and recedes while the night swallows it, so the
        // hand-off reads as a change of plane rather than more page.
        if (hold && p > 0) aboutTransform = `translate3d(0, ${(p * height).toFixed(1)}px, 0) scale(${(1 - .07 * ease(p)).toFixed(4)})`;
        const reach = Math.hypot(Math.max(x, vw - x), Math.max(y, vh - y));
        write(flood, "--flood-x", `${x.toFixed(0)}px`);
        write(flood, "--flood-y", `${y.toFixed(0)}px`);
        write(flood, "--flood-r", `${Math.ceil(reach)}px`);
        if (!driven) {
          const visible = p > 0 && bridgeTop + height > 0;
          write(flood, "visibility", visible ? "visible" : "hidden");
          if (visible) {
            // Full by the time Work's edge arrives (see .work's overlap), so night never idles.
            const swell = clamp(p / FLOOD_FULL);
            const radius = size / 2 + (reach - size / 2) * Math.pow(swell, 1.8);
            write(flood, "--flood-scale", (radius / reach).toFixed(4));
            write(flood, "--p", swell.toFixed(3));
          }
        }
      }

      write(hero, "transform", heroTransform);
      write(hero, "visibility", heroVisibility);
      write(about, "transform", aboutTransform);
      write(about, "transform-origin", aboutOrigin);
      const settling = Math.abs(targetX - stageX) > .2 || Math.abs(targetY - stageY) > .2 || Math.abs(targetW - stageW) > .2;
      if (settling) schedule();
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };
    const remeasure = () => { measure(); schedule(); };

    document.documentElement.dataset.guide = "ready";
    measure();
    const resize = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(remeasure);
    resize?.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", remeasure);
    reduced.addEventListener?.("change", schedule);
    document.fonts?.ready.then(remeasure);
    schedule();
    return () => {
      cancelAnimationFrame(raf);
      resize?.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", remeasure);
      reduced.removeEventListener?.("change", schedule);
      delete document.documentElement.dataset.guide;
      delete document.documentElement.dataset.stage;
      document.documentElement.style.removeProperty("--project-accent");
      projects.forEach(project => project.removeAttribute("data-current"));
      hero.style.transform = "";
      hero.style.visibility = "";
      about.style.transform = "";
      about.style.transformOrigin = "";
    };
  }, []);
}
