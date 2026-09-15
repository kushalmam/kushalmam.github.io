import { expect, it, vi } from "vitest";
import { studyVignette } from "../scene/splineStudyVignette";

it("disables only the vignette for light mode and restores its authored dark setting", () => {
  const postprocessing = { vignette: { enabled: true, darkness: .8 }, bloom: { enabled: true } };
  const runtime = { _scene: { activePage: { data: { postprocessing } } }, requestRender: vi.fn() };
  const apply = studyVignette(runtime);
  apply(true);
  expect(runtime._scene.activePage.data.postprocessing.vignette.enabled).toBe(false);
  expect(runtime._scene.activePage.data.postprocessing).not.toBe(postprocessing);
  expect(postprocessing.bloom.enabled).toBe(true);
  expect(postprocessing.vignette.darkness).toBe(.8);
  apply(false);
  expect(runtime._scene.activePage.data.postprocessing.vignette.enabled).toBe(true);
  expect(runtime.requestRender).toHaveBeenCalledTimes(2);
});

it("rejects an incompatible runtime instead of silently showing a broken light theme", () => {
  expect(() => studyVignette({})).toThrow("preview vignette hook");
});
