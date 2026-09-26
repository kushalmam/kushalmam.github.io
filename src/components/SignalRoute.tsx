import { useEffect, useRef, useState } from "react";
import { signalProgress } from "./signalProgress";
import { contactApproach } from "./contactApproach";

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
    let layoutReady = false;
    const measure = () => {
      if (!mounted || !layoutReady || document.fonts.status !== "loaded") return;
      const origin = document.querySelector<HTMLElement>("[data-signal-origin]");
      const terminal = document.querySelector<HTMLElement>("[data-signal-terminal]");
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
        ? `M ${startX} ${startY} C ${width * .99} ${startY - 35}, ${width * .99} 320, ${width * .74} 365 C ${width * .55} 405, ${rail} 370, ${rail} ${hero - 150} L ${rail} ${about}`
        : `M ${startX} ${startY} C ${width * .71} ${startY - 90}, ${width * .94} ${startY - 70}, ${width * .90} 365 C ${width * .85} 610, ${width * .28} 515, ${width * .17} 610 C ${rail} 670, ${rail} ${hero - 15}, ${rail} ${about}`;
      const heroD = d;
      if (mobile) {
        d += ` L ${rail} ${work}`;
      } else {
        const portrait = document.querySelector(".about-portrait")!.getBoundingClientRect();
        const bottom = portrait.bottom - rect.top;
        const turn = bottom + 32;
        d += ` L ${rail} ${turn} C ${rail} ${turn + 70}, ${center} ${work - 95}, ${center} ${work + 5}`;
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
      const approachHeight = mobile ? 240 : 430;
      d += ` ${contactApproach(center, { x: endX, y: endY }, approachHeight).d}`;
      const landmarks = [about, ...[...document.querySelectorAll<HTMLElement>(".project-image")].map(image => image.getBoundingClientRect().top - rect.top + image.clientHeight / 2)];
      setLayout({ d, heroD, width, mainTop: rect.top + window.scrollY, about, landmarks, height: main.offsetHeight });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(main);
    document.fonts.ready.then(async () => {
      const nameAnimations = [...document.querySelectorAll<HTMLElement>(".name-word")]
        .flatMap(word => word.getAnimations().map(animation => animation.finished));
      await Promise.allSettled(nameAnimations);
      if (!mounted) return;
      layoutReady = true;
      measure();
    });
    window.addEventListener("resize", measure);
    window.addEventListener("signal-route-measure", measure);
    return () => { mounted = false; observer.disconnect(); window.removeEventListener("resize", measure); window.removeEventListener("signal-route-measure", measure); };
  }, []);

  useEffect(() => {
    if (!layout.d || !path.current) return;
    const length = path.current.getTotalLength();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let disposed = false;
    let lastScroll = window.scrollY;
    let energy = 0;
    let targetEnergy = 0;
    let pointerStrength = 0;
    let targetPointerStrength = 0;
    let pointer = { x: 10000, y: 10000 };
    let targetPointer = { ...pointer };
    let lastPaint = performance.now();
    let hoveredCard = -1;
    let focusedCard = -1;
    let focusStrength = 0;
    let targetFocusStrength = 0;
    let focusY = 10000;
    let scene: ReturnType<typeof import("../scene/createSignalScene").createSignalScene> | undefined;
    const points = Array.from({ length: 801 }, (_, i) => {
      const p = path.current!.getPointAtLength(length * i / 800);
      return { x: p.x, y: p.y };
    });
    setReady(false);
    const paint = () => {
      const now = performance.now();
      const dt = Math.min((now - lastPaint) / 1000, .05);
      lastPaint = now;
      const pointerDamping = 1 - Math.exp(-12 * dt);
      pointer.x += (targetPointer.x - pointer.x) * pointerDamping;
      pointer.y += (targetPointer.y - pointer.y) * pointerDamping;
      energy += (targetEnergy - energy) * .2;
      targetEnergy *= .86;
      pointerStrength += (targetPointerStrength - pointerStrength) * pointerDamping;
      focusStrength += (targetFocusStrength - focusStrength) * .45;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = signalProgress(points, window.scrollY, window.innerHeight, layout.mainTop, layout.about, max);
      const distance = progress * length;
      const main = document.querySelector<HTMLElement>("main");
      if (main) {
        if (progress > .982) main.dataset.signalAtContact = "true";
        else delete main.dataset.signalAtContact;
      }
      scene?.render(window.scrollY, distance / length, document.documentElement.dataset.theme === "dark", reduced.matches,
        energy, { x: pointer.x, y: -(pointer.y + window.scrollY - layout.mainTop) }, pointerStrength,
        { y: focusY, strength: focusStrength });
      frame = 0;
      if (!reduced.matches && !document.hidden && (Math.hypot(pointer.x - targetPointer.x, pointer.y - targetPointer.y) > .1 || energy > .005 || targetEnergy > .005 || Math.abs(pointerStrength - targetPointerStrength) > .005 || Math.abs(focusStrength - targetFocusStrength) > .005)) {
        frame = requestAnimationFrame(paint);
      }
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
      } catch (error) { console.warn("Wire renderer unavailable; using SVG fallback.", error); scene?.dispose(); scene = undefined; if (!disposed) { setReady(false); setFallback(true); } }
    }).catch(error => { console.warn("Wire module unavailable; using SVG fallback.", error); if (!disposed) { setReady(false); setFallback(true); } });
    const schedule = () => { if (!document.hidden && !frame) frame = requestAnimationFrame(paint); };
    const scroll = () => {
      const next = window.scrollY;
      targetEnergy = Math.max(targetEnergy, Math.min(1, Math.abs(next - lastScroll) / 105));
      lastScroll = next;
      schedule();
    };
    const pointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || reduced.matches) return;
      targetPointer = { x: event.clientX, y: event.clientY };
      if (pointerStrength < .005) pointer = { ...targetPointer };
      targetPointerStrength = 1;
      schedule();
    };
    const pointerOut = (event: PointerEvent) => {
      if (event.relatedTarget) return;
      targetPointerStrength = 0;
      schedule();
    };
    const syncFocus = () => {
      const index = hoveredCard >= 0 ? hoveredCard : focusedCard;
      targetFocusStrength = index >= 0 ? 1 : 0;
      if (index >= 0) focusY = -layout.landmarks[index + 1];
      schedule();
    };
    const projectCards = [...document.querySelectorAll<HTMLElement>(".project-card")];
    const cardListeners = projectCards.map((card, index) => {
      const enter = (event: PointerEvent) => { if (event.pointerType === "mouse") { hoveredCard = index; syncFocus(); } };
      const leave = () => { if (hoveredCard === index) { hoveredCard = -1; syncFocus(); } };
      const focus = () => { focusedCard = index; syncFocus(); };
      const blur = () => { if (focusedCard === index) { focusedCard = -1; syncFocus(); } };
      card.addEventListener("pointerenter", enter);
      card.addEventListener("pointerleave", leave);
      card.addEventListener("focusin", focus);
      card.addEventListener("focusout", blur);
      return () => {
        card.removeEventListener("pointerenter", enter);
        card.removeEventListener("pointerleave", leave);
        card.removeEventListener("focusin", focus);
        card.removeEventListener("focusout", blur);
      };
    });
    focusedCard = projectCards.findIndex(card => card.contains(document.activeElement));
    hoveredCard = projectCards.findIndex(card => card.matches(":hover"));
    if (focusedCard >= 0 || hoveredCard >= 0) syncFocus();
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("pointermove", pointerMove, { passive: true });
    window.addEventListener("pointerout", pointerOut);
    reduced.addEventListener("change", schedule);
    const themeObserver = new MutationObserver(schedule);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const visibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
        targetEnergy = 0;
        targetPointerStrength = 0;
      } else schedule();
    };
    document.addEventListener("visibilitychange", visibility);
    paint();
    return () => {
      disposed = true;
      const main = document.querySelector<HTMLElement>("main");
      if (main) {
        delete main.dataset.signalReady;
        delete main.dataset.signalAtContact;
      }
      scene?.dispose();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("pointerout", pointerOut);
      cardListeners.forEach(remove => remove());
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
