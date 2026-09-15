import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { splineStudyController } from "../scene/splineStudyController";
const mock = vi.hoisted(() => ({
  load: vi.fn(), setBackgroundColor: vi.fn(), setSize: vi.fn(), play: vi.fn(), stop: vi.fn(), dispose: vi.fn(),
  findObjectByName: vi.fn(), requestRender: vi.fn(),
  getAllObjects: vi.fn(),
  _scene: { activePage: { data: { postprocessing: { vignette: { enabled: true } } } } },
}));
vi.mock("../scene/loadSplineScene", () => ({ createSplineScene: vi.fn(async () => mock) }));
beforeEach(() => {
  vi.clearAllMocks();
  mock.load.mockResolvedValue(undefined);
  mock._scene.activePage.data.postprocessing = { vignette: { enabled: true } };
});
afterEach(() => vi.restoreAllMocks());

it("keeps the original reference background untouched", async () => {
  const controller = splineStudyController(document.createElement("canvas"), "original", true);
  controller.setTheme("light");
  expect(await controller.ready).toBe(true);
  expect(mock.setBackgroundColor).not.toHaveBeenCalled();
  expect(mock.load).toHaveBeenCalledWith("original");
  expect(mock._scene.activePage.data.postprocessing.vignette.enabled).toBe(true);
  controller.dispose();
});

it("applies a theme chosen during loading before reporting ready; switches without reloading", async () => {
  const controller = splineStudyController(document.createElement("canvas"), "wires", false);
  controller.setTheme("light");
  controller.setPlaying(true);
  controller.setSize(600, 500);
  expect(await controller.ready).toBe(true);
  expect(mock.setBackgroundColor).toHaveBeenLastCalledWith("#fafbf6");
  expect(mock.setSize).toHaveBeenCalledWith(600, 500);
  expect(mock.play).toHaveBeenCalledOnce();
  controller.setTheme("dark");
  expect(mock.setBackgroundColor).toHaveBeenLastCalledWith("#090d0a");
  expect(mock.load).toHaveBeenCalledOnce();
  controller.setPlaying(false);
  expect(mock.stop).toHaveBeenCalled();
  controller.dispose();
});

it("does not reveal a scene disposed while its network request is pending", async () => {
  let finish!: () => void;
  mock.load.mockImplementation(() => new Promise<void>(resolve => { finish = resolve; }));
  const controller = splineStudyController(document.createElement("canvas"), "wires", false);
  await Promise.resolve();
  controller.dispose();
  finish();
  expect(await controller.ready).toBe(false);
  expect(mock.setBackgroundColor).not.toHaveBeenCalled();
  controller.dispose();
  expect(mock.dispose).toHaveBeenCalledOnce();
});

it("releases failed scenes instead of reporting them ready", async () => {
  mock.load.mockRejectedValue(new Error("offline"));
  const controller = splineStudyController(document.createElement("canvas"), "wires", false);
  await expect(controller.ready).rejects.toThrow("offline");
  controller.dispose();
  expect(mock.dispose).toHaveBeenCalledOnce();
  expect(mock.setBackgroundColor).not.toHaveBeenCalled();
});

it("rotates only the named wire group and restores its original angle", async () => {
  const wires = { rotation: { x: .1, y: .2, z: .3 }, position: { x: 100, y: -300, z: 0 } };
  const camera = { position: { x: 20, y: 40, z: 1000 } };
  mock.findObjectByName.mockImplementation(name => name === "lines" ? wires : camera);
  const controller = splineStudyController(document.createElement("canvas"), "wires", false);
  controller.setHorizontal(true);
  await controller.ready;
  expect(mock.findObjectByName).toHaveBeenCalledWith("lines");
  expect(wires.rotation.z).toBeCloseTo(.3 + Math.PI / 2);
  expect(wires.rotation.x).toBe(.1);
  expect(wires.rotation.y).toBe(.2);
  expect(wires.position.x).toBe(360);
  expect(wires.position.y).toBe(120);
  controller.setHorizontal(false);
  expect(wires.rotation.z).toBe(.3);
  expect(wires.position.x).toBe(100);
  expect(wires.position.y).toBe(-300);
  controller.dispose();
});

it("hides only verified demo objects in the earlier export, leaving scene assets intact", async () => {
  mock.findObjectByName.mockReturnValue(undefined);
  const names = ["Flow", "Button", "Button", "Rectangle", "Keep Your Data", "Camera", "lines", "Group 7", "Directional Light", "SplineWatermark"];
  const objects = names.map(name => ({ name, visible: true }));
  mock.getAllObjects.mockReturnValue(objects);
  const controller = splineStudyController(document.createElement("canvas"), "earlier", false, true);
  controller.setTheme("light");
  await controller.ready;
  expect(mock._scene.activePage.data.postprocessing.vignette.enabled).toBe(false);
  controller.setTheme("dark");
  expect(mock._scene.activePage.data.postprocessing.vignette.enabled).toBe(true);
  expect(mock.load).toHaveBeenCalledOnce();
  expect(objects.slice(0, 5).every(object => !object.visible)).toBe(true);
  expect(objects.slice(5).every(object => object.visible)).toBe(true);
  controller.dispose();
});
