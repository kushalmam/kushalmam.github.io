import { createSplineScene, type SplineScene } from "./loadSplineScene";
import { studyVignette } from "./splineStudyVignette";

export type StudyTheme = "dark" | "light";
export const STUDY_SURFACES: Record<StudyTheme, string> = { dark: "#090d0a", light: "#fafbf6" };

/** Isolated preview controller. Never mutates the hosted Spline document. */
export function splineStudyController(canvas: HTMLCanvasElement, url: string, original: boolean, stripOriginalCopy = false) {
  let scene: SplineScene | undefined;
  let disposed = false;
  let loaded = false;
  let applyVignette: ((light: boolean) => void) | undefined;
  let theme: StudyTheme = "dark";
  let playing = false;
  let refreshTimer: ReturnType<typeof setTimeout> | undefined;
  const refreshPaused = () => {
    if (!scene || playing || !loaded) return;
    clearTimeout(refreshTimer);
    // Rebuilding effects may compile shaders asynchronously. Allow the normal
    // runtime loop to settle before restoring pause after a visual edit.
    scene.play();
    refreshTimer = setTimeout(() => { if (!disposed && !playing) scene?.stop(); }, 500);
  };
  let horizontal = false;
  let wires: ReturnType<SplineScene["findObjectByName"]>;
  let startingZ = 0;
  let startingPosition = { x: 0, y: 0 };
  let pivot = { x: 0, y: 0 };
  let size = { width: 0, height: 0 };
  const background = () => {
    if (loaded && !original) {
      applyVignette?.(theme === "light");
      scene?.setBackgroundColor(STUDY_SURFACES[theme]);
      refreshPaused();
    }
  };
  const motion = () => { if (loaded) { if (playing) scene?.play(); else scene?.stop(); } };
  const measure = () => { if (loaded && size.width > 0 && size.height > 0) scene?.setSize(size.width, size.height); };
  const orientation = () => {
    if (!loaded || !wires || original) return;
    wires.rotation.z = startingZ + (horizontal ? Math.PI / 2 : 0);
    // Rotate around the authored camera's projected center, not the wire group's
    // offset origin. Both are top-level objects in this verified scene.
    wires.position.x = horizontal ? pivot.x - (startingPosition.y - pivot.y) : startingPosition.x;
    wires.position.y = horizontal ? pivot.y + (startingPosition.x - pivot.x) : startingPosition.y;
    scene?.requestRender();
    refreshPaused();
  };
  const ready = (async () => {
    const runtime = await createSplineScene(canvas);
    if (disposed) { runtime.dispose(); return false; }
    scene = runtime;
    try {
      await runtime.load(url);
      if (disposed) return false;
      loaded = true;
      if (stripOriginalCopy && !original) {
        applyVignette = studyVignette(runtime);
        // Names verified against this export. Never hide lights, wire ancestors,
        // or watermark assets; this removes only the original demo's UI objects.
        const decorative = new Set(["Flow", "Button", "Rectangle", "Keep Your Data"]);
        runtime.getAllObjects().forEach(object => { if (decorative.has(object.name)) object.visible = false; });
      }
      if (!original) {
        wires = runtime.findObjectByName("lines");
        const camera = runtime.findObjectByName("Camera");
        startingZ = wires?.rotation.z ?? 0;
        if (wires) startingPosition = { x: wires.position.x, y: wires.position.y };
        if (camera) pivot = { x: camera.position.x, y: camera.position.y };
      }
      background();
      measure();
      orientation();
      motion();
      return true;
    } catch (error) {
      if (!disposed) runtime.dispose();
      scene = undefined;
      throw error;
    }
  })();
  return {
    ready,
    setTheme(next: StudyTheme) { theme = next; background(); },
    setPlaying(next: boolean) { playing = next; motion(); },
    setHorizontal(next: boolean) { horizontal = next; orientation(); },
    setSize(width: number, height: number) { size = { width, height }; measure(); },
    dispose() { if (disposed) return; disposed = true; clearTimeout(refreshTimer); loaded = false; scene?.dispose(); scene = undefined; },
  };
}
