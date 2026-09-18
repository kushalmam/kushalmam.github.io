import { useEffect, useRef, useState } from "react";
import { wireAssets } from "../scene/wireStudy/paths";
import type { createStudy } from "../scene/wireStudy/createStudy";

export default function NativeWireBackground() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [section, setSection] = useState(0);
  useEffect(() => {
    const surface = canvas.current;
    if (!surface) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let scene: ReturnType<typeof createStudy> | undefined;
    let disposed = false, loading = false, failed = false, frame = 0;
    const themeChanged = () => scene?.setTheme(document.documentElement.dataset.theme === "light");
    const sync = async () => {
      if (disposed || failed) return;
      if (!scene && !loading && !reduced.matches && !document.hidden) {
        loading = true;
        try {
          const { createStudy } = await import("../scene/wireStudy/createStudy");
          if (disposed) return;
          if (reduced.matches || document.hidden) return;
          scene = createStudy(surface, () => {
            failed = true;
            setReady(false);
            scene?.setPlaying(false);
          });
          themeChanged();
          setReady(!failed);
        } catch { failed = true; setReady(false); }
        finally { loading = false; }
      }
      scene?.setPlaying(!failed && !reduced.matches && !document.hidden);
    };
    const updateSection = () => {
      frame = 0;
      let current = 0;
      document.querySelectorAll<HTMLElement>("[data-depth]").forEach(element => {
        if (element.getBoundingClientRect().top <= innerHeight * .45) current = Number(element.dataset.depth);
      });
      setSection(current);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(updateSection); };
    const theme = new MutationObserver(themeChanged);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    reduced.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    updateSection();
    void sync();
    return () => {
      disposed = true;
      theme.disconnect();
      reduced.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
      scene?.dispose();
    };
  }, []);
  return <div className="strata-field native-wire-field" data-section={section} data-ready={ready || undefined} aria-hidden="true">
    <canvas ref={canvas} />
    {!ready && <svg viewBox="-12 -7 24 14" preserveAspectRatio="none" fill="none">
      {wireAssets.map(wire => <polyline key={wire.name} points={wire.points.map(([x,y]) => `${x},${-y}`).join(" ")} stroke="var(--strata-line)" strokeWidth={wire.radius} />)}
    </svg>}
  </div>;
}
