import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import NativeWireBackground from "../components/NativeWireBackground";
const scene = vi.hoisted(() => ({ setTheme: vi.fn(), setPlaying: vi.fn(), dispose: vi.fn() }));
vi.mock("../scene/wireStudy/createStudy", () => ({ createStudy: vi.fn(() => scene) }));
afterEach(() => { cleanup(); vi.clearAllMocks(); vi.unstubAllGlobals(); delete document.documentElement.dataset.theme; });
it("loads the native scene, follows theme changes, and disposes on unmount", async () => {
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  document.documentElement.dataset.theme = "light";
  const { container, unmount } = render(<NativeWireBackground />);
  await waitFor(() => expect(container.querySelector("[data-ready]")).not.toBeNull());
  expect(scene.setTheme).toHaveBeenLastCalledWith(true);
  act(() => { document.documentElement.dataset.theme = "dark"; });
  await waitFor(() => expect(scene.setTheme).toHaveBeenLastCalledWith(false));
  unmount();
  expect(scene.dispose).toHaveBeenCalledOnce();
});
it("uses eleven static wires without starting the GPU for reduced motion", async () => {
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
  const { container } = render(<NativeWireBackground />);
  await act(async () => {});
  expect(container.querySelectorAll("polyline")).toHaveLength(11);
  expect(container.querySelector("[data-ready]")).toBeNull();
  expect(scene.setPlaying).not.toHaveBeenCalled();
});
