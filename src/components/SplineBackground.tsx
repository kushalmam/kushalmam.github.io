import { useEffect, useRef, useState } from "react";
import { createSplineScene, WIRE_SCENE_URL, type SplineScene } from "../scene/loadSplineScene";
import { studyVignette } from "../scene/splineStudyVignette";

export default function SplineBackground() {
  const host = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [section, setSection] = useState(0);
  const [ready, setReady] = useState(false);
  const [introduced, setIntroduced] = useState(false);
  const [resuming, setResuming] = useState(false);
  const [failed, setFailed] = useState(false);
  const app = useRef<SplineScene>();
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
    if (paused || document.hidden) app.current?.stop();
    else app.current?.play();
  }, [paused]);

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let initializing = false;
    let frame = 0;
    let canvas: HTMLCanvasElement | undefined;
    let resize: ResizeObserver | undefined;
    let theme: MutationObserver | undefined;
    let measureCanvas: (() => void) | undefined;
    let restoreFraming: (() => void) | undefined;
    let resumeFrame = 0;
    let settleFrame = 0;
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    let introTimer: ReturnType<typeof setTimeout> | undefined;

    const sync = () => {
      if (pausedRef.current || reduced.matches || document.hidden) app.current?.stop();
      else app.current?.play();
    };
    const initialize = async () => {
      if (initializing || app.current || disposed || reduced.matches || document.hidden) return;
      initializing = true;
      try {
        canvas = document.createElement("canvas");
        container.append(canvas);
        const runtime = await createSplineScene(canvas);
        if (disposed) { runtime.dispose(); return; }
        app.current = runtime;
        await runtime.load(WIRE_SCENE_URL);
        if (disposed) return;
        const decorative = new Set(["Flow", "Button", "Rectangle", "Keep Your Data"]);
        runtime.getAllObjects().forEach(object => {
          if (decorative.has(object.name)) object.visible = false;
        });
        const wires = runtime.findObjectByName("lines");
        const camera = runtime.findObjectByName("Camera");
        if (wires && camera) {
          const start = { x: wires.position.x, y: wires.position.y, z: wires.rotation.z };
          const target = {
            x: camera.position.x - (start.y - camera.position.y),
            y: camera.position.y + (start.x - camera.position.x),
            z: start.z + Math.PI / 2,
          };
          restoreFraming = () => {
            wires.rotation.z = target.z;
            wires.position.x = target.x;
            wires.position.y = target.y;
            runtime.requestRender();
          };
          restoreFraming();
        }
        const setVignette = studyVignette(runtime);
        const syncBackground = () => {
          const root = document.documentElement;
          const paper = getComputedStyle(root).getPropertyValue("--paper").trim();
          setVignette(root.dataset.theme === "light");
          runtime.setBackgroundColor(paper || (root.dataset.theme === "light" ? "#fafbf6" : "#090d0a"));
          if (pausedRef.current || reduced.matches || document.hidden) {
            clearTimeout(refreshTimer);
            runtime.play();
            refreshTimer = setTimeout(() => runtime.stop(), 500);
          }
        };
        syncBackground();
        theme = new MutationObserver(syncBackground);
        theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
        measureCanvas = () => {
          const width = container.clientWidth;
          const height = container.clientHeight;
          // Hidden tabs can briefly report a collapsed box. Passing that to the
          // runtime distorts its orthographic camera until the following resize.
          if (width > 0 && height > 0) runtime.setSize(width, height);
        };
        resize = new ResizeObserver(measureCanvas);
        resize.observe(container);
        measureCanvas();
        setReady(true);
        introTimer = setTimeout(() => setIntroduced(true), 1200);
        sync();
      } catch {
        if (disposed) return;
        app.current?.dispose();
        app.current = undefined;
        canvas?.remove();
        setFailed(true);
        // Static geometry is reserved for failure, never the loading state.
      } finally {
        initializing = false;
      }
    };
    const measureSection = () => {
      frame = 0;
      let current = 0;
      document.querySelectorAll<HTMLElement>("[data-depth]").forEach(element => {
        if (element.getBoundingClientRect().top <= innerHeight * .45) current = Number(element.dataset.depth);
      });
      setSection(current);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measureSection); };
    const motionChanged = () => {
      setPaused(reduced.matches);
      pausedRef.current = reduced.matches;
      if (!reduced.matches) void initialize();
      sync();
    };
    const visibility = () => {
      cancelAnimationFrame(resumeFrame);
      cancelAnimationFrame(settleFrame);
      if (document.hidden) {
        setResuming(true);
        sync();
        return;
      }

      // A page restored in the background may have skipped initialization.
      // Start the scene only when the first visible frame can be useful.
      if (!app.current) void initialize();

      // Prepare the stopped scene before its first visible frame, then verify it
      // once more after Spline restarts. This prevents a stale hidden-tab size or
      // authored transform from flashing on return.
      measureCanvas?.();
      restoreFraming?.();
      measureSection();
      resumeFrame = requestAnimationFrame(() => {
        if (disposed || document.hidden) return;
        measureCanvas?.();
        sync();
        restoreFraming?.();
        settleFrame = requestAnimationFrame(() => {
          if (disposed || document.hidden) return;
          measureCanvas?.();
          restoreFraming?.();
          setResuming(false);
        });
      });
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { void initialize(); observer.disconnect(); }
    });
    observer.observe(container);
    reduced.addEventListener("change", motionChanged);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    setPaused(reduced.matches);
    pausedRef.current = reduced.matches;
    measureSection();
    return () => {
      disposed = true;
      observer.disconnect();
      resize?.disconnect();
      theme?.disconnect();
      clearTimeout(refreshTimer);
      clearTimeout(introTimer);
      reduced.removeEventListener("change", motionChanged);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
      cancelAnimationFrame(resumeFrame);
      cancelAnimationFrame(settleFrame);
      app.current?.dispose();
      app.current = undefined;
      canvas?.remove();
    };
  }, []);

  return <>
    <div className="strata-field wire-field" data-section={section} data-paused={paused || undefined} data-intro={ready && !introduced || undefined} data-resuming={resuming || undefined} aria-hidden="true">
      <div className="wire-motion-surface">
      <div className="systems-canvas" ref={host} data-ready={ready || undefined}>
        {!ready && (failed || paused) && <svg className="scene-fallback" viewBox="0 0 600 1000" fill="none" preserveAspectRatio="xMidYMid slice">
          {Array.from({ length: 14 }, (_, i) =>
            <path key={i} d={`M${190+i*15} -50 C${90+i*23} 220 ${410-i*8} 300 ${170+i*17} 510 S${390-i*10} 850 ${220+i*13} 1050`} stroke="var(--strata-line)" strokeWidth={i % 4 === 0 ? 2 : 1} />
          )}
        </svg>}
      </div>
      </div>
    </div>
  </>;
}
