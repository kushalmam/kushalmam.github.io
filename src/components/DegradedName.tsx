import { useEffect, useLayoutEffect, useRef } from "react";

/** Redaction cuts from rawest to clean; every letter stacks all of them so the width never jumps. */
const CUTS = 5;
const CLEAN = CUTS - 1;
const WORDS = ["Kushal", "Mamillapalli"];
const DOT_INDEX = 11;

/**
 * The name arrives as raw, degraded type and cleans itself letter by letter,
 * like data coming through the pipeline. Hovering a letter dirties it again.
 */
export default function DegradedName() {
  const root = useRef<HTMLHeadingElement>(null);
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useLayoutEffect(() => {
    if (reduced) return;
    root.current?.querySelectorAll<HTMLElement>("[data-cut]").forEach(letter => { letter.dataset.cut = "0"; });
  }, [reduced]);

  useEffect(() => {
    const letters = [...root.current?.querySelectorAll<HTMLElement>("[data-cut]") ?? []];
    if (reduced || !letters.length) return;
    const start = performance.now();
    // dirt: 1 = rawest cut, 0 = clean. hold: moment each letter may start cleaning.
    const dirt = letters.map(() => 1);
    const hold = letters.map((_, index) => start + 320 + index * 62);
    const waveAt = letters.map(() => Infinity);
    let waveAmount = .62;
    let raf = 0, last = start;
    // Automatic batches stand down while the visitor is playing with the name,
    // so the only degradation they see is the one they caused.
    let hovering = false, lastTouch = -Infinity;
    const paused = () => hovering || performance.now() - lastTouch < 4000;

    const soil = (index: number, amount: number, delay: number, now = performance.now()) => {
      if (!letters[index]) return;
      dirt[index] = Math.max(dirt[index], amount);
      hold[index] = Math.max(hold[index], now + delay);
    };
    const paint = (now: number) => {
      raf = 0;
      const dt = Math.min(.05, (now - last) / 1000);
      last = now;
      let busy = false;
      letters.forEach((letter, index) => {
        if (now >= waveAt[index]) { soil(index, waveAmount, 90, now); waveAt[index] = Infinity; }
        if (now >= hold[index]) dirt[index] = Math.max(0, dirt[index] - dt * 3.4);
        if (dirt[index] > 0 || waveAt[index] < Infinity) busy = true;
        const cut = String(Math.round((1 - dirt[index]) * CLEAN));
        if (letter.dataset.cut !== cut) letter.dataset.cut = cut;
      });
      if (busy) raf = requestAnimationFrame(paint);
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };

    const onEnter = (event: PointerEvent) => {
      const index = letters.indexOf(event.currentTarget as HTMLElement);
      lastTouch = performance.now();
      waveAt.fill(Infinity);
      soil(index, 1, 140);
      soil(index - 1, .55, 60);
      soil(index + 1, .55, 60);
      schedule();
    };
    const heading = root.current!;
    const onHover = () => { hovering = true; lastTouch = performance.now(); };
    const onLeave = () => { hovering = false; lastTouch = performance.now(); };
    letters.forEach(letter => letter.addEventListener("pointerenter", onEnter));
    heading.addEventListener("pointerenter", onHover);
    heading.addEventListener("pointerleave", onLeave);

    /** A fresh batch runs through the name, left to right. */
    const batch = (amount: number, gap: number) => {
      if (paused()) return;
      const now = performance.now();
      waveAmount = amount;
      letters.forEach((_, index) => { waveAt[index] = now + index * gap; });
      schedule();
    };
    // Natural triggers: an ambient trickle, coming back to the hero, coming back to the tab.
    const ambient = window.setInterval(() => batch(.62, 48), 7200);
    let away = false;
    const view = typeof IntersectionObserver === "undefined" ? undefined : new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) away = true;
      else if (away) { away = false; batch(.9, 40); }
    });
    view?.observe(heading);
    let hiddenAt = 0;
    const onVisibility = () => {
      if (document.hidden) hiddenAt = performance.now();
      else if (performance.now() - hiddenAt > 2000) batch(1, 56);
    };
    document.addEventListener("visibilitychange", onVisibility);
    schedule();
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(ambient);
      view?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      letters.forEach(letter => letter.removeEventListener("pointerenter", onEnter));
      heading.removeEventListener("pointerenter", onHover);
      heading.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced]);

  let offset = 0;
  return <h1 id="hero-title" className="name" ref={root} aria-label="Kushal Mamillapalli">
    {WORDS.map((word, wordIndex) => {
      const first = offset;
      offset += word.length;
      return <span key={word} className={`name-word${wordIndex ? " name-word--last" : ""}`} aria-hidden="true">
        {[...word].map((character, index) => {
          const dotted = wordIndex === 1 && index === DOT_INDEX;
          const glyph = dotted ? "ı" : character;
          return <span key={first + index} className="name-letter" data-cut={CLEAN}>
            {Array.from({ length: CUTS }, (_, cut) => <span key={cut} className="name-cut">{glyph}</span>)}
            {dotted && <span className="name-origin-dot" data-name-dot="" />}
          </span>;
        })}
      </span>;
    })}
  </h1>;
}
