import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import AssemblyVisual from "../components/AssemblyVisual";

let intersect: (visible: boolean) => void;
let reduced: boolean;
let motionListeners: Set<() => void>;
let hidden = false;
let play: ReturnType<typeof vi.spyOn>;
let pause: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  reduced = false;
  hidden = false;
  motionListeners = new Set();
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
      intersect = visible => callback([{ isIntersecting: visible }]);
    }
    observe() {}
    disconnect() {}
  });
  vi.stubGlobal("matchMedia", () => ({
    get matches() { return reduced; },
    addEventListener: (_event: string, listener: () => void) => motionListeners.add(listener),
    removeEventListener: (_event: string, listener: () => void) => motionListeners.delete(listener),
  }));
  vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden);
  play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("loads motion only on entry, pauses offscreen/hidden, and respects the visitor's pause", () => {
  const { container } = render(<AssemblyVisual />);
  expect(container.querySelector("video")).toBeNull();
  act(() => intersect(true));
  const video = container.querySelector("video")!;
  expect(video).toBeTruthy();
  expect(play).toHaveBeenCalledTimes(1);
  act(() => intersect(false));
  expect(pause).toHaveBeenCalled();
  expect(container.querySelector("video")).toBe(video);
  act(() => intersect(true));
  fireEvent.click(screen.getByRole("button", { name: "Pause assembly motion" }));
  expect(container.querySelector("figure")).not.toHaveAttribute("data-playing");
  const calls = play.mock.calls.length;
  act(() => { hidden = true; document.dispatchEvent(new Event("visibilitychange")); });
  act(() => { hidden = false; document.dispatchEvent(new Event("visibilitychange")); });
  expect(play).toHaveBeenCalledTimes(calls);
  fireEvent.click(screen.getByRole("button", { name: "Play assembly motion" }));
  expect(play).toHaveBeenCalledTimes(calls + 1);
});

it("keeps reduced-motion visits static and restores the poster on playback failure", () => {
  reduced = true;
  const { container } = render(<AssemblyVisual />);
  act(() => intersect(true));
  expect(container.querySelector("video")).toBeNull();
  expect(play).not.toHaveBeenCalled();
  act(() => { reduced = false; motionListeners.forEach(listener => listener()); });
  fireEvent.playing(container.querySelector("video")!);
  expect(container.querySelector("video")).toHaveAttribute("data-ready");
  fireEvent.error(container.querySelector("video")!);
  expect(container.querySelector("video")).toBeNull();
  expect(screen.getByRole("img")).toBeVisible();
  expect(container.querySelector("figure")).not.toHaveAttribute("data-playing");
});
