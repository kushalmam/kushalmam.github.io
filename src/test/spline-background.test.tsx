import { render, waitFor, cleanup, act } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import SystemsScene from "../components/SystemsScene";

const scene = vi.hoisted(() => ({ load: vi.fn().mockResolvedValue(undefined), setBackgroundColor: vi.fn(), setSize: vi.fn(), play: vi.fn(), stop: vi.fn(), dispose: vi.fn() }));
vi.mock("../scene/loadSplineScene", () => ({ WIRE_SCENE_URL: "scene", createSplineScene: vi.fn().mockResolvedValue(scene) }));
afterEach(() => { cleanup(); delete document.documentElement.dataset.theme; vi.unstubAllGlobals(); vi.clearAllMocks(); });

it("matches light mode before reveal and follows subsequent theme changes", async () => {
  document.documentElement.dataset.theme = "light";
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal("IntersectionObserver", class {
    constructor(private callback: (entries: { isIntersecting: boolean }[]) => void) {}
    observe() { queueMicrotask(() => this.callback([{ isIntersecting: true }])); }
    disconnect() {}
  });
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  const { container } = render(<SystemsScene />);
  await waitFor(() => expect(container.querySelector("[data-ready]" )).not.toBeNull());
  expect(scene.setBackgroundColor).toHaveBeenLastCalledWith("#fafbf6");
  act(() => { document.documentElement.dataset.theme = "dark"; });
  await waitFor(() => expect(scene.setBackgroundColor).toHaveBeenLastCalledWith("#090d0a"));
});
