import { createWireScene } from "./scene/createWireScene";

type Scene = { play(): void; stop(): void; dispose(): void; setSize(width: number, height: number): void };
type SplineScene = Scene & { load(url: string): Promise<void> };
const scenes: Scene[] = [];
const observers: ResizeObserver[] = [];
const motion = document.querySelector<HTMLButtonElement>("#motion")!;
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
let paused = reduced.matches;
let disposed = false;
const sync = () => {
  scenes.forEach(scene => paused || document.hidden ? scene.stop() : scene.play());
  motion.textContent = paused ? "Play both" : "Pause both";
  motion.setAttribute("aria-pressed", String(paused));
};
function attach(scene: Scene, canvas: HTMLCanvasElement, status: HTMLElement) {
  if (disposed) { scene.dispose(); return; }
  const resize = () => scene.setSize(canvas.parentElement!.clientWidth, canvas.parentElement!.clientHeight);
  const observer = new ResizeObserver(resize);
  observer.observe(canvas.parentElement!);
  observers.push(observer);
  scenes.push(scene);
  resize();
  status.hidden = true;
  motion.disabled = false;
  sync();
}
const nativeCanvas = document.querySelector<HTMLCanvasElement>("#native")!;
const nativeStatus = document.querySelector<HTMLElement>("#native-status")!;
try { attach(createWireScene(nativeCanvas), nativeCanvas, nativeStatus); }
catch { nativeStatus.textContent = "Three.js could not start. WebGL may be unavailable."; }

async function loadSpline() {
  const canvas = document.querySelector<HTMLCanvasElement>("#spline")!;
  const status = document.querySelector<HTMLElement>("#spline-status")!;
  let scene: SplineScene | undefined;
  try {
    const runtimeUrl = "https://unpkg.com/@splinetool/runtime@2.0.46/build/runtime.js";
    const { Application } = await import(/* @vite-ignore */ runtimeUrl) as { Application: new (canvas: HTMLCanvasElement) => SplineScene };
    if (disposed) return;
    scene = new Application(canvas);
    await scene.load("https://prod.spline.design/wPyTzb77ryucbKu0/scene.splinecode");
    attach(scene, canvas, status);
  } catch {
    scene?.dispose();
    status.textContent = "Spline could not load. Check your connection and reload to retry.";
  }
}
void loadSpline();
motion.addEventListener("click", () => { paused = !paused; sync(); });
document.addEventListener("visibilitychange", sync);
reduced.addEventListener("change", () => { paused = reduced.matches; sync(); });
window.addEventListener("pagehide", () => {
  disposed = true;
  observers.forEach(observer => observer.disconnect());
  scenes.forEach(scene => scene.dispose());
}, { once: true });
