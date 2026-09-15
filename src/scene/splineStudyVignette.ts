/** Preview-only adapter for @splinetool/runtime 2.0.46 internals.
 * There is no public effect setter. Never use this to change export branding.
 */
export function studyVignette(runtime: unknown) {
  const scene = (runtime as {
    _scene?: { activePage?: { data?: { postprocessing?: { vignette?: { enabled?: boolean } } } } };
    requestRender?: () => void;
  });
  const data = scene._scene?.activePage?.data;
  const postprocessing = data?.postprocessing;
  const vignette = postprocessing?.vignette;
  if (!vignette || typeof vignette.enabled !== "boolean" || typeof scene.requestRender !== "function") {
    throw new Error("This Spline runtime no longer exposes the preview vignette hook.");
  }
  const authored = vignette.enabled;
  return (light: boolean) => {
    // The renderer compares postprocessing by identity before rebuilding passes.
    // Mutating enabled in place leaves the old shader active.
    data!.postprocessing = { ...postprocessing, vignette: { ...vignette, enabled: light ? false : authored } };
    scene.requestRender!();
  };
}
