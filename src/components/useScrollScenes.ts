import { useEffect } from "react";

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Writes normalized scroll progress onto every `[data-scene]` element:
 * `--enter` 0→1 as its top travels from the viewport bottom to the top,
 * `--exit` 0→1 as its bottom does the same, and `--through` 0→1 across a
 * pinned (taller than viewport) scene. Geometry is measured on resize, so a
 * frame only reads scrollY and writes the values that changed.
 */
export function useScrollScenes() {
  useEffect(() => {
    const scenes = [...document.querySelectorAll<HTMLElement>("[data-scene]")];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const written = new Map<HTMLElement, string>();
    let boxes: { top: number; height: number }[] = [];
    let raf = 0;
    const measure = () => {
      const scroll = window.scrollY;
      boxes = scenes.map(scene => {
        const rect = scene.getBoundingClientRect();
        return { top: rect.top + scroll, height: rect.height };
      });
    };
    const paint = () => {
      raf = 0;
      const vh = window.innerHeight || 1;
      const scroll = window.scrollY;
      const still = reduced.matches;
      scenes.forEach((scene, index) => {
        const top = boxes[index].top - scroll, height = boxes[index].height;
        const enter = still ? 1 : clamp((vh - top) / vh);
        const exit = still ? 0 : clamp((vh - top - height) / vh);
        const through = still ? 0 : clamp(-top / Math.max(1, height - vh));
        const key = `${enter.toFixed(3)} ${exit.toFixed(3)} ${through.toFixed(3)}`;
        if (written.get(scene) === key) return;
        written.set(scene, key);
        scene.style.setProperty("--enter", enter.toFixed(3));
        scene.style.setProperty("--exit", exit.toFixed(3));
        scene.style.setProperty("--through", through.toFixed(3));
      });
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };
    const remeasure = () => { measure(); schedule(); };
    measure();
    paint();
    const resize = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(remeasure);
    resize?.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", remeasure);
    reduced.addEventListener?.("change", schedule);
    return () => {
      cancelAnimationFrame(raf);
      resize?.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", remeasure);
      reduced.removeEventListener?.("change", schedule);
    };
  }, []);
}
