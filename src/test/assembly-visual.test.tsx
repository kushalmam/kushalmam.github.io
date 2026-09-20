import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import AssemblyVisual from "../components/AssemblyVisual";
import { createAssemblyScroll } from "../components/assemblyScroll";

vi.mock("../components/assemblyScroll", async importOriginal => ({
  ...await importOriginal<typeof import("../components/assemblyScroll")>(),
  createAssemblyScroll: vi.fn(),
}));
let intersect: (visible: boolean) => void;
let reduced: boolean;
let motionListeners: Set<() => void>;
let hidden = false;
const update = vi.fn().mockResolvedValue(undefined);
const dispose = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  reduced = false;
  hidden = false;
  motionListeners = new Set();
  vi.mocked(createAssemblyScroll).mockResolvedValue({ update, dispose });
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
      intersect = visible => callback([{ isIntersecting: visible }]);
    }
    observe() {}
    disconnect() {}
  });
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("matchMedia", () => ({
    get matches() { return reduced; },
    addEventListener: (_event: string, listener: () => void) => motionListeners.add(listener),
    removeEventListener: (_event: string, listener: () => void) => motionListeners.delete(listener),
  }));
  vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden);
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("loads on entry, freezes when hidden/offscreen, and preserves manual pause", async () => {
  const { container, unmount } = render(<AssemblyVisual />);
  expect(createAssemblyScroll).not.toHaveBeenCalled();
  act(() => intersect(true));
  await screen.findByRole("button", { name: "Pause assembly motion" });
  expect(container.querySelector("canvas")).toHaveAttribute("data-ready");
  act(() => intersect(false));
  expect(container.querySelector("figure")).not.toHaveAttribute("data-playing");
  act(() => intersect(true));
  fireEvent.click(screen.getByRole("button", { name: "Pause assembly motion" }));
  expect(container.querySelector("figure")).not.toHaveAttribute("data-playing");
  act(() => { hidden = true; document.dispatchEvent(new Event("visibilitychange")); });
  act(() => { hidden = false; document.dispatchEvent(new Event("visibilitychange")); });
  expect(container.querySelector("figure")).not.toHaveAttribute("data-playing");
  fireEvent.click(screen.getByRole("button", { name: "Play assembly motion" }));
  expect(container.querySelector("figure")).toHaveAttribute("data-playing");
  unmount();
  expect(dispose).toHaveBeenCalledTimes(1);
});

it("keeps reduced motion static and restores the still if frame loading fails", async () => {
  reduced = true;
  const { container } = render(<AssemblyVisual />);
  act(() => intersect(true));
  expect(createAssemblyScroll).not.toHaveBeenCalled();
  expect(container.querySelector("canvas")).toBeNull();
  vi.mocked(createAssemblyScroll).mockRejectedValue(new Error("Missing frame"));
  act(() => { reduced = false; motionListeners.forEach(listener => listener()); });
  await waitFor(() => expect(container.querySelector("canvas")).toBeNull());
  expect(screen.getByRole("img")).toHaveAttribute("src", expect.stringContaining("assembly-1600.webp"));
  expect(container.querySelector("figure")).not.toHaveAttribute("data-playing");
});
