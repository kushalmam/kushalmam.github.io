import { afterEach, expect, it, vi } from "vitest";
import * as THREE from "three";
import type { WireMaterial } from "../scene/wireMaterial";
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
  signal.render(500, .4, true, false, .75, { x: 210, y: -480 }, .8, { y: -900, strength: .7 });
  const [scene, camera] = calls.render.mock.lastCall as [THREE.Scene, THREE.OrthographicCamera];
  expect(camera.position.y).toBe(-400);
  const meshes = scene.children as THREE.Mesh<THREE.BufferGeometry, WireMaterial>[];
  expect(meshes).toHaveLength(3);
  const disposals = meshes.flatMap(mesh => [vi.spyOn(mesh.geometry, "dispose"), vi.spyOn(mesh.material, "dispose")]);
  for (const mesh of meshes) {
    expect([...mesh.geometry.getAttribute("position").array].every(Number.isFinite)).toBe(true);
    const normals = mesh.geometry.getAttribute("normal");
    const positions = mesh.geometry.getAttribute("position");
    const indices = mesh.geometry.index!;
    const a = new THREE.Vector3().fromBufferAttribute(positions, indices.getX(0));
    const b = new THREE.Vector3().fromBufferAttribute(positions, indices.getX(1));
    const c = new THREE.Vector3().fromBufferAttribute(positions, indices.getX(2));
    const outward = new THREE.Vector3().fromBufferAttribute(normals, indices.getX(0));
    expect(b.sub(a).cross(c.sub(a)).dot(outward)).toBeGreaterThan(0);
    expect([...mesh.geometry.getAttribute("tangent").array].every(Number.isFinite)).toBe(true);
    for (const index of [0, Math.floor(normals.count / 2), normals.count - 1]) {
      expect(Math.hypot(normals.getX(index), normals.getY(index), normals.getZ(index))).toBeCloseTo(1, 4);
    }
    expect(mesh.material.isMeshPhysicalMaterial).toBe(true);
    expect(mesh.material.metalness).toBe(.92);
    expect(mesh.material.anisotropy).toBeGreaterThan(0);
    expect(mesh.material.uniforms.uDark.value).toBe(1);
    expect(mesh.material.uniforms.uProgress.value).toBe(.4);
    expect(mesh.material.uniforms.uEnergy.value).toBe(.75);
    expect(mesh.material.uniforms.uPointer.value).toEqual(new THREE.Vector2(210, -480));
    expect(mesh.material.uniforms.uPointerStrength.value).toBe(.8);
    expect(mesh.material.uniforms.uFocusY.value).toBe(-900);
    expect(mesh.material.uniforms.uFocusStrength.value).toBe(.7);
  }
  signal.render(750, .6, false, true, .75, { x: 210, y: -480 }, .8, { y: -900, strength: .7 });
  expect(meshes[0].material.uniforms.uMotion.value).toBe(0);
  expect(meshes[0].material.uniforms.uDark.value).toBe(0);
  expect(meshes[0].material.uniforms.uEnergy.value).toBe(0);
  expect(meshes[0].material.uniforms.uPointerStrength.value).toBe(0);
  expect(meshes[0].material.uniforms.uFocusStrength.value).toBe(0);
  canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
  expect(lost).toHaveBeenCalledOnce();
  signal.dispose(); signal.dispose();
  disposals.forEach(dispose => expect(dispose).toHaveBeenCalledOnce());
  expect(calls.dispose).toHaveBeenCalledOnce();
  const count = calls.render.mock.calls.length;
  signal.render(900, .8, false, false);
  expect(calls.render).toHaveBeenCalledTimes(count);
});

it.each([375, 1000])("keeps the three work strands in ordered lanes beside all four projects at %ipx", width => {
  const signal = createSignalScene({
    canvas: document.createElement("canvas"), width, mainTop: 0, about: 300,
    landmarks: [300, 900, 980, 1500, 1580], onLost: vi.fn(),
    points: Array.from({ length: 101 }, (_, i) => ({ x: width / 2, y: i * 30 })),
  });
  signal.render(900, .4, true, false);
  const [scene] = calls.render.mock.lastCall as [THREE.Scene];
  const meshes = scene.children as THREE.Mesh<THREE.BufferGeometry, WireMaterial>[];
  for (const ring of [30, 33, 50, 53]) {
    const centers = meshes.map(mesh => {
      const positions = mesh.geometry.getAttribute("position");
      const sides = width < 700 ? 16 : 24;
      const first = ring * (sides + 1);
      return (positions.getX(first) + positions.getX(first + sides / 2)) / 2;
    });
    expect(centers[0]).toBeGreaterThan(centers[1]);
    expect(centers[1]).toBeGreaterThan(centers[2]);
  }
  signal.dispose();
});
