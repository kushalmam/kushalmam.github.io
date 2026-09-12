import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSystemScene } from "../scene/createSystemScene";

const calls = vi.hoisted(() => ({ render: vi.fn(), dispose: vi.fn() }));
vi.mock("three", async (importOriginal) => {
  const actual = await importOriginal<typeof import("three")>();
  return {
    ...actual,
    WebGLRenderer: class {
      domElement = document.createElement("canvas");
      setPixelRatio = vi.fn();
      setSize = vi.fn();
      render = calls.render;
      dispose = calls.dispose;
    },
  };
});
let frames: Map<number, FrameRequestCallback>;
let nextFrame: number;
let visibility: (entries: { isIntersecting: boolean }[]) => void;
let reduced: boolean;
let now: number;
const flush = () => {
  let count = 0;
  while (frames.size && count++ < 200) {
    const pending = [...frames.values()];
    frames.clear();
    now += 16;
    pending.forEach((callback) => callback(now));
  }
  expect(frames.size).toBe(0);
};
beforeEach(() => {
  calls.render.mockClear();
  calls.dispose.mockClear();
  frames = new Map();
  nextFrame = 0;
  reduced = false;
  now = 0;
  vi.spyOn(performance, "now").mockImplementation(() => now);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.set(++nextFrame, callback);
    return nextFrame;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  vi.stubGlobal("matchMedia", () => ({
    get matches() {
      return reduced;
    },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: typeof visibility) {
        visibility = callback;
      }
      observe() {}
      disconnect() {}
    },
  );
  document.documentElement.style.removeProperty("--focus-time");
  document.documentElement.style.setProperty("--accent", "#b9f542");
  document.documentElement.style.setProperty("--muted", "#a4ada6");
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("systems drawing lifecycle", () => {
  it.each(["480ms", ".48s"])("animates section changes with a %s CSS duration", (duration) => {
    document.documentElement.style.setProperty("--focus-time", duration);
    const scene = createSystemScene(document.createElement("div"));
    visibility([{ isIntersecting: true }]);
    flush();
    calls.render.mockClear();
    scene.focus(2);
    flush();
    expect(calls.render.mock.calls.length).toBeGreaterThan(10);
    expect(calls.render.mock.calls.length).toBeLessThan(100);
    scene.dispose();
  });
  it("settles to idle and does no rendering while offscreen", () => {
    const host = document.createElement("div");
    const scene = createSystemScene(host);
    visibility([{ isIntersecting: true }]);
    flush();
    calls.render.mockClear();
    scene.focus(2);
    flush();
    expect(calls.render.mock.calls.length).toBeGreaterThan(1);
    expect(calls.render.mock.calls.length).toBeLessThan(100);
    calls.render.mockClear();
    visibility([{ isIntersecting: false }]);
    scene.focus(3);
    flush();
    expect(calls.render).not.toHaveBeenCalled();
    scene.dispose();
    expect(host.querySelector("canvas")).toBeNull();
    expect(calls.dispose).toHaveBeenCalledOnce();
  });
  it("renders a single settled frame for reduced motion and retains fallback on context loss", () => {
    reduced = true;
    const host = document.createElement("div");
    const scene = createSystemScene(host);
    visibility([{ isIntersecting: true }]);
    scene.focus(2, 1);
    flush();
    expect(calls.render).toHaveBeenCalledOnce();
    host
      .querySelector("canvas")!
      .dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
    expect(host.dataset.ready).toBeUndefined();
    host
      .querySelector("canvas")!
      .dispatchEvent(new Event("webglcontextrestored"));
    flush();
    expect(host.dataset.ready).toBe("true");
    scene.dispose();
    expect(frames.size).toBe(0);
  });
  it("loops project geometry, morphs between projects, and stops offscreen", () => {
    const scene = createSystemScene(document.createElement("div"));
    visibility([{ isIntersecting: true }]);
    flush();
    const advance = () => {
      const pending = [...frames.values()];
      frames.clear();
      now += 16;
      pending.forEach(callback => callback(now));
    };
    scene.focus(2, 0);
    for (let i = 0; i < 100; i++) advance();
    const renderedScene = calls.render.mock.lastCall![0] as import("three").Scene;
    const field = renderedScene.children.find(object => object.type === "Group")!;
    const before = field.children.map(layer => layer.position.y);
    expect(field.children[0].children[0].type).toBe("Mesh");
    expect(frames.size).toBe(1);
    scene.focus(2, 1);
    for (let i = 0; i < 100; i++) advance();
    expect(field.children.map(layer => layer.position.y)).not.toEqual(before);
    visibility([{ isIntersecting: false }]);
    calls.render.mockClear();
    flush();
    expect(calls.render).not.toHaveBeenCalled();
    scene.dispose();
  });
});
