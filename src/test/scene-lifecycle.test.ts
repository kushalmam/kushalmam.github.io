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
    scene.focus(2);
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
  it("separates strata and lights the selected project route", () => {
    const scene = createSystemScene(document.createElement("div"));
    visibility([{ isIntersecting: true }]);
    flush();
    const renderedScene = calls.render.mock
      .lastCall![0] as import("three").Scene;
    const strata = renderedScene.children.find(
      (object) => object.type === "Group",
    )!;
    const initialGap =
      strata.children[0].position.y - strata.children[1].position.y;
    scene.focus(2, 1);
    flush();
    expect(
      strata.children[0].position.y - strata.children[1].position.y,
    ).toBeGreaterThan(initialGap + 1);
    const route = strata.children[2].children[2] as import("three").Mesh<
      import("three").TubeGeometry,
      import("three").MeshBasicMaterial
    >;
    expect(route.material.color.getHexString()).toBe("b9f542");
    expect(route.material.opacity).toBe(1);
    scene.dispose();
  });
});
