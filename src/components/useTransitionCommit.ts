import { useEffect } from "react";
import type Lenis from "lenis";

/** Past this share of a transition, scrolling down finishes it. */
const COMMIT_DOWN = .8;
/** At or below this share, scrolling up rewinds it fully. */
const COMMIT_UP = .2;
/** Scroll must be still this long before a transition is completed. */
const SETTLE_MS = 140;
/** The flood disc is full at this share of its bridge (see usePipelineGuide). */
const FLOOD_FULL = .84;

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

type Span = { start: number; end: number };

/**
 * When scrolling stops inside one of the three scroll-scrubbed transitions,
 * finish it rather than leave the page frozen half-way: stopping after 80% of
 * a downward pass completes it, and stopping within the first 20% of an upward
 * pass rewinds it. Anything in between is left where the reader put it.
 */
export function useTransitionCommit(lenis: Lenis | undefined) {
  useEffect(() => {
    if (!lenis) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const bridge = (selector: string) => document.querySelector<HTMLElement>(selector);
    const pageTop = (element: HTMLElement) => element.getBoundingClientRect().top + window.scrollY;

    // start → end is the scroll range over which each transition plays.
    const spans = (): Span[] => {
      const vh = window.innerHeight;
      const result: Span[] = [];
      const gate = bridge("[data-gate]");
      if (gate) {
        const start = pageTop(gate);
        result.push({ start, end: start + Math.max(1, gate.offsetHeight - vh) });
      }
      const flood = bridge("[data-flood-bridge]");
      if (flood) {
        const start = pageTop(flood) - vh;
        result.push({ start, end: start + flood.offsetHeight * FLOOD_FULL });
      }
      const columns = bridge(".bridge--columns");
      if (columns) {
        const start = pageTop(columns);
        result.push({ start, end: start + Math.max(1, columns.offsetHeight - vh) });
      }
      return result.filter(span => span.end - span.start > 1);
    };

    let timer = 0;
    let holding = false;
    let lastY = lenis.scroll;
    let direction = 1;

    const settle = () => {
      timer = 0;
      if (reduced.matches || holding) return;
      const y = lenis.scroll;
      for (const { start, end } of spans()) {
        const progress = (y - start) / (end - start);
        if (progress <= 0 || progress >= 1) continue;
        const target = direction > 0
          ? progress >= COMMIT_DOWN ? end : undefined
          : progress <= COMMIT_UP ? start : undefined;
        if (target === undefined || Math.abs(target - y) < 2) continue;
        lenis.scrollTo(target, { duration: .8, easing: easeOut });
        return;
      }
    };
    const queue = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(settle, SETTLE_MS);
    };

    const stopScroll = lenis.on("scroll", () => {
      const y = lenis.scroll;
      if (Math.abs(y - lastY) > .5) direction = y > lastY ? 1 : -1;
      lastY = y;
      queue();
    });
    // Don't fight a finger or scrollbar that's still down, then check on release.
    const press = () => { holding = true; };
    const release = () => { holding = false; queue(); };
    window.addEventListener("pointerdown", press, { passive: true });
    window.addEventListener("pointerup", release, { passive: true });
    window.addEventListener("pointercancel", release, { passive: true });

    return () => {
      window.clearTimeout(timer);
      stopScroll();
      window.removeEventListener("pointerdown", press);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, [lenis]);
}
