import { afterEach, expect, it, vi } from "vitest";
import * as THREE from "three";
import { createSignalScene } from "../scene/createSignalScene";

const calls = vi.hoisted(() => ({ render: vi.fn(), dispose: vi.fn(), size: vi.fn() }));
vi.mock("three", async importOriginal => ({
  ...await importOriginal<typeof import("three")>(),
  WebGLRenderer: class {
    setPixelRatio = vi.fn();
    setClearColor = vi.fn();
    setSize = calls.size;
    render = calls.render;
    dispose = calls.dispose;
  },
}));
afterEach(() => { vi.restoreAllMocks(); vi.clearAllMocks(); });

it("anchors the camera during scrolling, handles reduced motion, and disposes each GPU resource once", () => {
  const canvas = document.createElement("canvas");
  const lost = vi.fn();
  const signal = createSignalScene({ canvas, width: 1000, mainTop: 100, about: 700, onLost: lost,
    points: Array.from({ length: 101 }, (_, i) => ({ x: 100 + Math.sin(i / 10) * 30, y: i * 30 })),
  });
  expect(calls.size).toHaveBeenCalledWith(1000, window.innerHeight, false);
  signal.render(500, .4, true, false, .75, { x: 210, y: -480 }, .8);
  const [scene, camera] = calls.render.mock.lastCall as [THREE.Scene, THREE.OrthographicCamera];
  expect(camera.position.y).toBe(-400);
  const meshes = scene.children as THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>[];
  expect(meshes).toHaveLength(3);
  const disposals = meshes.flatMap(mesh => [vi.spyOn(mesh.geometry, "dispose"), vi.spyOn(mesh.material, "dispose")]);
  for (const mesh of meshes) {
    expect([...mesh.geometry.getAttribute("position").array].every(Number.isFinite)).toBe(true);
    const normals = mesh.geometry.getAttribute("normal");
    for (const index of [0, Math.floor(normals.count / 2), normals.count - 1]) {
      expect(Math.hypot(normals.getX(index), normals.getY(index), normals.getZ(index))).toBeCloseTo(1, 4);
    }
    expect(mesh.material.uniforms.uDark.value).toBe(1);
    expect(mesh.material.uniforms.uProgress.value).toBe(.4);
    expect(mesh.material.uniforms.uEnergy.value).toBe(.75);
    expect(mesh.material.uniforms.uPointer.value).toEqual(new THREE.Vector2(210, -480));
    expect(mesh.material.uniforms.uPointerStrength.value).toBe(.8);
  }
  signal.render(750, .6, false, true, .75, { x: 210, y: -480 }, .8);
  expect(meshes[0].material.uniforms.uMotion.value).toBe(0);
  expect(meshes[0].material.uniforms.uDark.value).toBe(0);
  expect(meshes[0].material.uniforms.uEnergy.value).toBe(0);
  expect(meshes[0].material.uniforms.uPointerStrength.value).toBe(0);
  canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
  expect(lost).toHaveBeenCalledOnce();
  signal.dispose(); signal.dispose();
  disposals.forEach(dispose => expect(dispose).toHaveBeenCalledOnce());
  expect(calls.dispose).toHaveBeenCalledOnce();
  const count = calls.render.mock.calls.length;
  signal.render(900, .8, false, false);
  expect(calls.render).toHaveBeenCalledTimes(count);
});
