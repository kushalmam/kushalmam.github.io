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
    let idleTimer = 0, repeatTimer = 0;
    let lastTouch = -Infinity;
    let lastPattern = -1;
    let away = false;

    const stopAmbient = () => {
      window.clearTimeout(idleTimer);
      window.clearInterval(repeatTimer);
      idleTimer = 0;
      repeatTimer = 0;
    };

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
      else queueAmbient();
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };

    const batch = (amount: number, gap: number, order: number[]) => {
      const now = performance.now();
      waveAmount = amount;
      order.forEach((index, position) => { waveAt[index] = now + position * gap; });
      schedule();
    };

    const randomBatch = () => {
      const count = letters.length;
      const forward = Array.from({ length: count }, (_, index) => index);
      const shuffled = [...forward];
      for (let index = count - 1; index > 0; index--) {
        const swap = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
      }
      const patterns = [
        forward,
        [...forward].reverse(),
        [...forward].sort((a, b) => Math.abs(a - (count - 1) / 2) - Math.abs(b - (count - 1) / 2)),
        shuffled,
      ];
      const choice = (lastPattern + 1 + Math.floor(Math.random() * (patterns.length - 1))) % patterns.length;
      lastPattern = choice;
      batch(.55 + Math.random() * .4, 32 + Math.random() * 38, patterns[choice]);
    };

    // Wait until the letters have been still for two seconds. Once started,
    // ambient changes recur every four seconds until the visitor interacts.
    const queueAmbient = () => {
      if (away || idleTimer || repeatTimer) return;
      idleTimer = window.setTimeout(() => {
        idleTimer = 0;
        randomBatch();
        repeatTimer = window.setInterval(randomBatch, 4000);
      }, 2000);
    };

    const onEnter = (event: PointerEvent) => {
      const index = letters.indexOf(event.currentTarget as HTMLElement);
      lastTouch = performance.now();
      stopAmbient();
      waveAt.fill(Infinity);
      soil(index, 1, 140);
      soil(index - 1, .55, 60);
      soil(index + 1, .55, 60);
      schedule();
    };
    const heading = root.current!;
    letters.forEach(letter => letter.addEventListener("pointerenter", onEnter));

    const returnBatch = (amount: number, gap: number) => {
      if (performance.now() - lastTouch < 2000) return;
      stopAmbient();
      batch(amount, gap, letters.map((_, index) => index));
    };
    // A fresh pass also greets visitors returning to the hero or tab.
    const view = typeof IntersectionObserver === "undefined" ? undefined : new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) { away = true; stopAmbient(); }
      else if (away) { away = false; returnBatch(.9, 40); }
    });
    view?.observe(heading);
    let hiddenAt = 0;
    const onVisibility = () => {
      if (document.hidden) hiddenAt = performance.now();
      else if (performance.now() - hiddenAt > 2000) returnBatch(1, 56);
    };
    document.addEventListener("visibilitychange", onVisibility);
    schedule();
    return () => {
      cancelAnimationFrame(raf);
      stopAmbient();
      view?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      letters.forEach(letter => letter.removeEventListener("pointerenter", onEnter));
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
