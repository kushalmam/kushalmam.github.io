import { useEffect } from "react";

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Writes normalized scroll progress onto every `[data-scene]` element:
 * `--enter` 0→1 as its top travels from the viewport bottom to the top,
 * `--exit` 0→1 as its bottom does the same, and `--through` 0→1 across a
 * pinned (taller than viewport) scene. One rAF, no React state.
 */
export function useScrollScenes() {
  useEffect(() => {
    const scenes = [...document.querySelectorAll<HTMLElement>("[data-scene]")];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    const paint = () => {
      raf = 0;
      const vh = window.innerHeight || 1;
      for (const scene of scenes) {
        const rect = scene.getBoundingClientRect();
        const still = reduced.matches;
        scene.style.setProperty("--enter", (still ? 1 : clamp((vh - rect.top) / vh)).toFixed(4));
        scene.style.setProperty("--exit", (still ? 0 : clamp((vh - rect.bottom) / vh)).toFixed(4));
        scene.style.setProperty("--through", (still ? 0 : clamp(-rect.top / Math.max(1, rect.height - vh))).toFixed(4));
      }
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };
    paint();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reduced.addEventListener?.("change", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reduced.removeEventListener?.("change", schedule);
    };
  }, []);
}
