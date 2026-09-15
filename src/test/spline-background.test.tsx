import { render, waitFor, cleanup, act } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import SystemsScene from "../components/SplineBackground";

const scene = vi.hoisted(() => ({
  load: vi.fn().mockResolvedValue(undefined), setBackgroundColor: vi.fn(), setSize: vi.fn(), play: vi.fn(), stop: vi.fn(), dispose: vi.fn(), requestRender: vi.fn(),
  getAllObjects: vi.fn(() => [{ name: "Flow", visible: true }, { name: "lines", visible: true }]),
  findObjectByName: vi.fn(),
  _scene: { activePage: { data: { postprocessing: { vignette: { enabled: true } } } } },
}));
const wires = { rotation: { x: 0, y: 0, z: 0.25 }, position: { x: 120, y: -80, z: 0 } };
const camera = { rotation: { x: 0, y: 0, z: 0 }, position: { x: 20, y: 30, z: 1000 } };
vi.mock("../scene/loadSplineScene", () => ({ WIRE_SCENE_URL: "scene", createSplineScene: vi.fn().mockResolvedValue(scene) }));
afterEach(() => {
  cleanup();
  delete document.documentElement.dataset.theme;
  Object.defineProperty(document, "hidden", { configurable: true, value: false });
  Object.assign(wires.rotation, { x: 0, y: 0, z: 0.25 });
  Object.assign(wires.position, { x: 120, y: -80, z: 0 });
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

function stubBrowserObservers() {
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal("IntersectionObserver", class {
    constructor(private callback: (entries: { isIntersecting: boolean }[]) => void) {}
    observe() { queueMicrotask(() => this.callback([{ isIntersecting: true }])); }
    disconnect() {}
  });
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  scene.findObjectByName.mockImplementation((name: string) => name === "lines" ? wires : name === "Camera" ? camera : undefined);
}

it("matches light mode before reveal and follows subsequent theme changes", async () => {
  document.documentElement.dataset.theme = "light";
  stubBrowserObservers();
  const { container } = render(<SystemsScene />);
  await waitFor(() => expect(container.querySelector("[data-ready]" )).not.toBeNull());
  expect(scene.setBackgroundColor).toHaveBeenLastCalledWith("#fafbf6");
  expect(scene._scene.activePage.data.postprocessing.vignette.enabled).toBe(false);
  act(() => { document.documentElement.dataset.theme = "dark"; });
  await waitFor(() => expect(scene.setBackgroundColor).toHaveBeenLastCalledWith("#090d0a"));
  expect(scene._scene.activePage.data.postprocessing.vignette.enabled).toBe(true);
});

it("restores the intended wire framing before resuming a visible tab", async () => {
  stubBrowserObservers();
  const { container } = render(<SystemsScene />);
  await waitFor(() => expect(container.querySelector("[data-ready]")).not.toBeNull());
  const expected = {
    z: 0.25 + Math.PI / 2,
    x: camera.position.x - (-80 - camera.position.y),
    y: camera.position.y + (120 - camera.position.x),
  };

  Object.defineProperty(document, "hidden", { configurable: true, value: true });
  act(() => document.dispatchEvent(new Event("visibilitychange")));
  expect(container.querySelector(".wire-field")).toHaveAttribute("data-resuming", "true");
  Object.assign(wires.rotation, { z: 0.25 });
  Object.assign(wires.position, { x: 120, y: -80 });

  Object.defineProperty(document, "hidden", { configurable: true, value: false });
  act(() => document.dispatchEvent(new Event("visibilitychange")));

  await waitFor(() => expect(wires.rotation.z).toBeCloseTo(expected.z));
  expect(wires.position.x).toBeCloseTo(expected.x);
  expect(wires.position.y).toBeCloseTo(expected.y);
  expect(scene.requestRender).toHaveBeenCalled();
  await waitFor(() => expect(container.querySelector(".wire-field")).not.toHaveAttribute("data-resuming"));
});
