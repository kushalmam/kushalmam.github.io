import { useEffect, useRef, useState } from "react";
import { signalProgress } from "./signalProgress";

/** The measured route anchors both the 3D braid and its no-WebGL fallback. */
export default function SignalRoute() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);
  const path = useRef<SVGPathElement>(null);
  const [layout, setLayout] = useState({ d: "", heroD: "", width: 1, height: 1, mainTop: 0, about: 0, landmarks: [] as number[] });

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    let mounted = true;
    const measure = () => {
      if (!mounted || document.fonts.status !== "loaded") return;
      const origin = document.querySelector<HTMLElement>("[data-signal-origin]");
      const terminal = document.querySelector<HTMLElement>(".signal-terminal");
      const topSection = document.getElementById("top");
      const aboutSection = document.getElementById("about");
      const workSection = document.getElementById("work");
      const contactSection = document.getElementById("contact");
      if (!origin || !terminal || !topSection || !aboutSection || !workSection || !contactSection) return;
      const width = main.clientWidth;
      const mobile = width < 700;
      const rect = main.getBoundingClientRect();
      const top = (element: HTMLElement) => element.getBoundingClientRect().top - rect.top;
      const hero = topSection.offsetHeight;
      const about = top(aboutSection) + 68;
      const work = top(workSection);
      const rail = mobile ? 22 : width * .075;
      const center = mobile ? rail : width / 2;
      const originRect = origin.getBoundingClientRect();
      const startX = originRect.left - rect.left + originRect.width / 2;
      const startY = originRect.top - rect.top + originRect.height / 2;
      let d = mobile
        ? `M ${startX} ${startY} C ${width * .99} ${startY - 35}, ${width * .99} 320, ${width * .74} 365 C ${width * .55} 405, ${rail} 370, ${rail} ${hero - 15} L ${rail} ${about}`
        : `M ${startX} ${startY} C ${width * .71} ${startY - 90}, ${width * .94} ${startY - 70}, ${width * .90} 365 C ${width * .85} 610, ${width * .28} 515, ${width * .17} 610 C ${rail} 670, ${rail} ${hero - 15}, ${rail} ${about}`;
      const heroD = d;
      if (mobile) {
        d += ` L ${rail} ${work}`;
      } else {
        const portrait = document.querySelector(".about-portrait")!.getBoundingClientRect();
        const bottom = portrait.bottom - rect.top;
        d += ` C ${rail} ${about + 150}, ${width * .07} ${bottom + 60}, ${width * .24} ${bottom + 90} C ${width * .40} ${bottom + 120}, ${center} ${work - 110}, ${center} ${work + 5}`;
      }
      const cards = [...document.querySelectorAll<HTMLElement>(".project-card")];
      cards.forEach((card, i) => {
        if (!mobile && i % 2) return;
        const y = card.getBoundingClientRect().top - rect.top + 70;
        d += ` L ${center} ${y}`;
      });
      const terminalRect = terminal.getBoundingClientRect();
      const endX = terminalRect.left - rect.left + terminalRect.width / 2;
      const endY = terminalRect.top - rect.top + terminalRect.height / 2;
      const loopRadius = mobile ? 22 : 34;
      const approachX = mobile ? rail : width * .88;
      const approachY = endY + loopRadius * 2.2;
      d += ` L ${center} ${endY + loopRadius * 3} C ${center} ${endY + loopRadius * 1.5}, ${approachX} ${approachY}, ${approachX} ${endY + loopRadius} C ${approachX} ${endY - loopRadius * .8}, ${endX + loopRadius * 2.2} ${endY - loopRadius * 1.4}, ${endX + loopRadius} ${endY - loopRadius * .4} C ${endX + loopRadius * .35} ${endY - loopRadius * 1.35}, ${endX - loopRadius * .5} ${endY - loopRadius * 1.1}, ${endX} ${endY}`;
      const landmarks = [about, ...[...document.querySelectorAll<HTMLElement>(".project-image")].map(image => image.getBoundingClientRect().top - rect.top + image.clientHeight / 2)];
      setLayout({ d, heroD, width, mainTop: rect.top + window.scrollY, about, landmarks, height: main.offsetHeight });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(main);
    document.fonts.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => { mounted = false; observer.disconnect(); window.removeEventListener("resize", measure); };
  }, []);

  useEffect(() => {
    if (!layout.d || !path.current) return;
    const length = path.current.getTotalLength();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let disposed = false;
    let scene: ReturnType<typeof import("../scene/createSignalScene").createSignalScene> | undefined;
    const points = Array.from({ length: 801 }, (_, i) => {
      const p = path.current!.getPointAtLength(length * i / 800);
      return { x: p.x, y: p.y };
    });
    setReady(false);
    const paint = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = signalProgress(points, window.scrollY, window.innerHeight, layout.mainTop, layout.about, max);
      const distance = progress * length;
      scene?.render(window.scrollY, distance / length, document.documentElement.dataset.theme === "dark", reduced.matches);
      frame = 0;
    };
    import("../scene/createSignalScene").then(async ({ createSignalScene }) => {
      if (disposed || !canvas.current) return;
      try {
        scene = createSignalScene({ canvas: canvas.current, points, width: layout.width, mainTop: layout.mainTop, about: layout.about, landmarks: layout.landmarks, onLost: () => { setReady(false); setFallback(true); scene?.dispose(); scene = undefined; } });
        await scene.prepare();
        if (disposed) return;
        paint();
        requestAnimationFrame(() => {
          if (!disposed) {
            const main = document.querySelector<HTMLElement>("main");
            if (main) main.dataset.signalReady = "true";
            setReady(true);
          }
        });
      } catch { setReady(false); setFallback(true); }
    }).catch(() => { if (!disposed) { setReady(false); setFallback(true); } });
    const schedule = () => { if (!document.hidden && !frame) frame = requestAnimationFrame(paint); };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reduced.addEventListener("change", schedule);
    const themeObserver = new MutationObserver(schedule);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const visibility = () => { if (!document.hidden) schedule(); };
    document.addEventListener("visibilitychange", visibility);
    paint();
    return () => {
      disposed = true;
      const main = document.querySelector<HTMLElement>("main");
      if (main) delete main.dataset.signalReady;
      scene?.dispose();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reduced.removeEventListener("change", schedule);
      cancelAnimationFrame(frame);
    };
  }, [layout]);

  return <><canvas ref={canvas} className="signal-canvas" data-ready={ready} aria-hidden="true" /><svg className="signal-route" data-layout-ready={Boolean(layout.d)} data-rendered={ready} data-fallback={fallback} viewBox={`0 0 ${layout.width} ${layout.height}`} aria-hidden="true">
    <defs>
      <filter id="cable-shadow" x="-40%" y="-10%" width="180%" height="130%"><feDropShadow dx="3" dy="9" stdDeviation="7" floodColor="#244d47" floodOpacity=".18" /></filter>
    </defs>
    <path className="cable-shadow" d={layout.d} />
    <path ref={path} className="cable-body" d={layout.d} />
    <path className="cable-light" d={layout.d} transform="translate(-2 -3)" />
    <path className="cable-shadow cable-hero" d={layout.heroD} />
    <path className="cable-body cable-hero" d={layout.heroD} />
    <path className="cable-light cable-hero-light" d={layout.heroD} transform="translate(-2 -3)" />

  </svg></>;
}
