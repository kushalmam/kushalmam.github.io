import { useEffect, useRef, useState } from "react";
import { assemblyFrame, createAssemblyScroll } from "./assemblyScroll";

const asset = (name: string) => `${import.meta.env.BASE_URL}images/hero/${name}`;

export default function AssemblyVisual() {
  const host = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(false);
  const renderer = useRef<Awaited<ReturnType<typeof createAssemblyScroll>> | null>(null);

  useEffect(() => {
    const element = host.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const sync = () => {
      setEnabled(previous => !reduced.matches && (visible || previous));
      setActive(!reduced.matches && visible && !document.hidden);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    }, { rootMargin: "160px" });
    observer.observe(element);
    reduced.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      reduced.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  useEffect(() => {
    if (!enabled || failed || !canvas.current) return;
    const controller = new AbortController();
    let instance: typeof renderer.current = null;
    void createAssemblyScroll(canvas.current, asset("scroll"), controller.signal)
      .then(result => {
        if (controller.signal.aborted) { result.dispose(); return; }
        instance = result;
        renderer.current = result;
        setReady(true);
      }).catch(() => {
        if (!controller.signal.aborted) { setFailed(true); setReady(false); }
      });
    return () => {
      controller.abort();
      instance?.dispose();
      renderer.current = null;
      setReady(false);
    };
  }, [enabled, failed]);

  const playing = active && !paused && !failed;
  useEffect(() => {
    const element = canvas.current;
    if (!element || !ready) return;
    let pending = 0;
    const update = () => {
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(() => {
        const bounds = element.getBoundingClientRect();
        const frame = playing
          ? assemblyFrame(bounds.top, bounds.height, window.innerHeight)
          : Number(element.dataset.frame || 0);
        void renderer.current?.update(frame).catch(() => {
          setFailed(true); setReady(false);
        });
      });
    };
    const resize = new ResizeObserver(update);
    resize.observe(element);
    if (playing) window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      cancelAnimationFrame(pending);
      resize.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [playing, ready]);

  return (
    <figure ref={host} className="hero-object" data-playing={playing || undefined}>
      <div className="assembly-surface">
        <img src={asset("assembly-1600.webp")} width="1600" height="1600"
          {...{ fetchpriority: "high" }}
          alt="Silver machined shell and clear stacked layers around a lime internal component." />
        {enabled && !failed && <canvas ref={canvas} className="assembly-canvas"
          data-ready={ready || undefined} aria-hidden="true" />}
      </div>
      <figcaption>
        {ready && !failed && <button type="button" className="assembly-pause"
          onClick={() => setPaused(value => !value)}
          aria-label={paused ? "Play assembly motion" : "Pause assembly motion"}>
          {paused ? "Resume scroll" : "Pause motion"}
        </button>}
        <span>01 — ASSEMBLY</span>
      </figcaption>
    </figure>
  );
}
