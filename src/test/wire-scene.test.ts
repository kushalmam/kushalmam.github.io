import { afterEach, beforeEach, expect, it, vi } from "vitest";
import * as THREE from "three";
import { createWireScene, WireCurve } from "../scene/createWireScene";

const calls = vi.hoisted(() => ({ render: vi.fn(), dispose: vi.fn() }));
vi.mock("three", async importOriginal => ({
  ...await importOriginal<typeof import("three")>(),
  WebGLRenderer: class {
    setPixelRatio = vi.fn();
    setClearColor = vi.fn();
    setSize = vi.fn();
    render = calls.render;
    dispose = calls.dispose;
  },
}));

let frames: Map<number, FrameRequestCallback>;
let hidden: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  vi.clearAllMocks();
  frames = new Map();
  let id = 0;
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.set(++id, callback);
    return id;
  });
  vi.stubGlobal("cancelAnimationFrame", (key: number) => frames.delete(key));
  hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(false);
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("generates distinct finite curves with continuous upward paths", () => {
  const midpoints = new Set<number>();
  for (let i = 0; i < 11; i++) {
    const curve = new WireCurve(i);
    midpoints.add(curve.getPoint(.5).x);
    const points = curve.getPoints(300);
    points.forEach((point, index) => {
      expect(point.toArray().every(Number.isFinite)).toBe(true);
      if (index) expect(point.y).toBeGreaterThan(points[index - 1].y);
    });
  }
  expect(midpoints.size).toBe(11);
});

it("runs one loop, pauses, recovers context, and releases GPU resources", () => {
  const host = document.createElement("div");
  const canvas = document.createElement("canvas");
  host.append(canvas);
  const wires = createWireScene(canvas);
  wires.setSize(800, 700);
  const scene = calls.render.mock.lastCall![0] as THREE.Scene;
  const meshes = scene.children as THREE.Mesh<THREE.TubeGeometry, THREE.ShaderMaterial>[];
  const disposal = meshes.flatMap(mesh => [
    vi.spyOn(mesh.geometry, "dispose"), vi.spyOn(mesh.material, "dispose"),
  ]);
  expect(meshes).toHaveLength(11);
  wires.play();
  wires.play();
  expect(frames.size).toBe(1);
  const tick = [...frames.values()][0];
  frames.clear();
  tick(performance.now() + 16);
  expect(meshes[0].material.uniforms.uTime.value).toBeGreaterThan(0);
  wires.stop();
  expect(frames.size).toBe(0);
  wires.play();
  canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
  expect(host.dataset.contextLost).toBe("true");
  expect(frames.size).toBe(0);
  canvas.dispatchEvent(new Event("webglcontextrestored"));
  expect(host.dataset.contextLost).toBeUndefined();
  expect(frames.size).toBe(1);
  wires.dispose();
  wires.dispose();
  expect(frames.size).toBe(0);
  disposal.forEach(spy => expect(spy).toHaveBeenCalledOnce());
  expect(calls.dispose).toHaveBeenCalledOnce();
});

it("resumes its loop after a hidden tab becomes visible again", () => {
  const canvas = document.createElement("canvas");
  const wires = createWireScene(canvas);
  wires.play();
  expect(frames.size).toBe(1);

  hidden.mockReturnValue(true);
  document.dispatchEvent(new Event("visibilitychange"));
  expect(frames.size).toBe(0);

  hidden.mockReturnValue(false);
  document.dispatchEvent(new Event("visibilitychange"));
  expect(frames.size).toBe(1);
  wires.dispose();
});
