import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { splineStudyController, type StudyTheme } from "./scene/splineStudyController";
import { WIRE_SCENE_URL } from "./scene/loadSplineScene";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "./splineStudy.css";

const ORIGINAL = "https://prod.spline.design/wsJFrnRqL89Q5Hh6/scene.splinecode";
const earlierExport = new URLSearchParams(location.search).get("source") === "earlier";
type Controller = ReturnType<typeof splineStudyController>;

export function Panel({ original = false, theme, playing, vignette, horizontal = false, label }: {
  original?: boolean; theme: StudyTheme; playing: boolean; vignette: boolean; horizontal?: boolean; label: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const controller = useRef<Controller>();
  const [status, setStatus] = useState("Loading original assets…");
  const [ready, setReady] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const element = canvas.current!;
    let disposed = false;
    let frame = 0;
    const scene = splineStudyController(element, original || earlierExport ? ORIGINAL : WIRE_SCENE_URL, original, earlierExport);
    controller.current = scene;
    const resize = () => scene.setSize(element.parentElement!.clientWidth, element.parentElement!.clientHeight);
    const observer = new ResizeObserver(resize);
    observer.observe(element.parentElement!);
    resize();
    void scene.ready.then(success => {
      if (!success || disposed) return;
      // Keep the canvas hidden until a browser paint can contain the loaded scene.
      frame = requestAnimationFrame(() => { if (!disposed) { setReady(true); setStatus("Loaded"); } });
    }).catch(() => { if (!disposed) setStatus("Scene unavailable. Check your connection, then retry."); });
    return () => { disposed = true; cancelAnimationFrame(frame); observer.disconnect(); scene.dispose(); controller.current = undefined; };
  }, [original, attempt]);
  useEffect(() => { controller.current?.setTheme(theme); }, [theme, attempt]);
  useEffect(() => { controller.current?.setPlaying(playing); }, [playing, attempt]);
  useEffect(() => { controller.current?.setHorizontal(horizontal); }, [horizontal, attempt]);
  return <section className="study-panel" data-theme={theme}>
    <h2>{label}</h2>
    <div className="study-stage" data-ready={ready || undefined}>
      <canvas ref={canvas} aria-label={label} />
      {!original && vignette && <div className="study-vignette" aria-hidden="true" />}
      {!ready && <div className="study-status" role="status">{status}{status.startsWith("Scene unavailable") && <button onClick={() => { setReady(false); setStatus("Loading original assets…"); setAttempt(value => value + 1); }}>Retry</button>}</div>}
    </div>
    <p>{original ? "Unmodified reference: original lighting, effects, and animation." : earlierExport ? "Original wires and animation. Authored vignette in dark mode; ivory background and optional soft edge fade in light mode." : "Same Spline geometry and materials. Opaque theme-matched surface; page-level vignette."}</p>
  </section>;
}

export function Study() {
  const [theme, setTheme] = useState<StudyTheme>(() => new URLSearchParams(location.search).get("theme") === "light" ? "light" : "dark");
  const [vignette, setVignette] = useState(true);
  const [horizontal, setHorizontal] = useState(false);
  const [paused, setPaused] = useState(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [hidden, setHidden] = useState(document.hidden);
  useEffect(() => {
    const visibility = () => setHidden(document.hidden);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const motion = () => setPaused(reduced.matches);
    document.addEventListener("visibilitychange", visibility);
    reduced.addEventListener("change", motion);
    return () => { document.removeEventListener("visibilitychange", visibility); reduced.removeEventListener("change", motion); };
  }, []);
  return <>
    <header className="study-header"><div><span className="study-eyebrow">ISOLATED PREVIEW / 01</span><h1>Spline, without the theme surprises.</h1></div><a href="./">Back to unchanged portfolio ↗</a></header>
    <div className="study-controls">
      <fieldset><legend>Adaptation theme</legend><button aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}>Dark</button><button aria-pressed={theme === "light"} onClick={() => setTheme("light")}>Light</button></fieldset>
      <label><input type="checkbox" checked={vignette} onChange={event => setVignette(event.target.checked)} /> Soft edge fade</label>
      <label><input type="checkbox" checked={horizontal} onChange={event => setHorizontal(event.target.checked)} /> Horizontal wires</label>
      <button aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? "Play both" : "Pause both"}</button>
      <a href={earlierExport ? "./spline-study.html" : "./spline-study.html?source=earlier"}>{earlierExport ? "Compare refreshed export" : "Test earlier export"}</a>
    </div>
    <main className="study-grid">
      <Panel original theme="dark" playing={!paused && !hidden} vignette={false} label="01 / Original Flow" />
      <Panel theme={theme} playing={!paused && !hidden} vignette={vignette} horizontal={horizontal} label={earlierExport ? "02 / Earlier export · wires-only test" : "02 / Theme-safe wires"} />
    </main>
    <footer><p>Actual Spline engine on both sides. Equal panel sizes; animation clocks are independent. Horizontal mode rotates the wire group, not the canvas or badge. No inversion or non-uniform scaling.</p><p>{earlierExport ? "Preview-only: light mode uses a guarded internal hook in pinned runtime 2.0.46. No export has been republished and no watermark has been removed. Main portfolio unchanged." : "The export’s badge is preserved. This preview is not a badge-free replacement for the live site."}</p><a href="https://community.spline.design/file/ff4fcef4-b6ab-406f-9359-d639509f2d99">Flow by Vlad</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></footer>
  </>;
}
createRoot(document.getElementById("root")!).render(<Study />);
