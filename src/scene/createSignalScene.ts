import * as THREE from "three";

type RoutePoint = { x: number; y: number };
type Options = { canvas: HTMLCanvasElement; points: RoutePoint[]; width: number; mainTop: number; about: number; landmarks?: number[]; height?: number; onLost: () => void };

import { HDRLoader } from "three/addons/loaders/HDRLoader.js";
import { createWireMaterial, type WireMaterial } from "./wireMaterial";

/** Viewport-sized renderer; page coordinates keep geometry anchored to the layout. */
export function createSignalScene({ canvas, points, width, mainTop, about, landmarks, height, onLost }: Options) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  const mobile = width < 700;
  let surfaceHeight = mobile ? (height ?? window.innerHeight) : (canvas.clientHeight || window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? Math.min(1, 4096 / surfaceHeight) : 1.6));
  renderer.setSize(width, surfaceHeight, false);
  renderer.setClearColor(0, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  const camera = new THREE.OrthographicCamera(0, width, 0, -surfaceHeight, .1, 1000);
  camera.position.z = 500;
  const scene = new THREE.Scene();
  const materials: WireMaterial[] = [];
  const geometries: THREE.BufferGeometry[] = [];
  const rings = points.length;
  const sides = mobile ? 12 : 24;
  const firstProject = landmarks?.[1] ?? Number.POSITIVE_INFINITY;
  const projectLandmarks = landmarks?.slice(1) ?? [];
  for (let strand = 0; strand < 3; strand++) {
    const positions: number[] = [], normals: number[] = [], uvs: number[] = [], indices: number[] = [];
    const centers: THREE.Vector3[] = [];
    const radii: number[] = [];
    for (let i = 0; i < rings; i++) {
      const p = points[i];
      const before = points[Math.max(0, i - 1)], after = points[Math.min(rings - 1, i + 1)];
      const dx = after.x - before.x, dy = after.y - before.y;
      const norm = Math.hypot(dx, dy) || 1;
      const nx = -dy / norm, ny = dx / norm;
      const t = i / (rings - 1);
      const opening = Math.exp(-Math.pow((p.y - about - 170) / 240, 2));
      const projectBreath = Math.min(1.45, projectLandmarks.reduce((spread, landmark) => spread + Math.exp(-Math.pow((p.y - landmark) / 125, 2)), 0));
      const spacing = ((mobile ? 4 : 7) + opening * (mobile ? 3 : 14)) * (1 + .07 * Math.sin(t * 27 + strand * 1.8));
      const phase = t * Math.PI * 8 + strand * Math.PI * 2 / 3 + .13 * Math.sin(t * 19 + strand);
      const contactLead = THREE.MathUtils.smoothstep(t, .82, .94);
      const terminalFade = strand === 0 ? 0 : THREE.MathUtils.smoothstep(t, .89, .95);
      const braidedOffset = Math.cos(phase) * spacing;
      const projectBlend = THREE.MathUtils.smoothstep(p.y, firstProject - 480, firstProject - 270) * (1 - contactLead);
      const lane = (strand - 1) * ((mobile ? 5 : 8) + projectBreath * (mobile ? 2 : 4));
      const startBlend = THREE.MathUtils.smoothstep(t, 0, .035);
      const offset = startBlend * THREE.MathUtils.lerp(THREE.MathUtils.lerp(braidedOffset, lane, projectBlend), 0, contactLead);
      const layeredZ = (1 - strand) * (mobile ? 9 : 15);
      const z = THREE.MathUtils.lerp(THREE.MathUtils.lerp(Math.sin(phase) * spacing, layeredZ, projectBlend), strand === 0 ? 1 : -5, contactLead);
      const taper = 1 - .35 * THREE.MathUtils.smoothstep(p.y, about - 100, about + 200);
      const collar = strand === 0 ? THREE.MathUtils.smoothstep(t, .931, .938) * (1 - THREE.MathUtils.smoothstep(t, .953, .960)) : 0;
      const depthScale = THREE.MathUtils.lerp(1, strand === 0 ? 1.16 : strand === 2 ? .86 : 1, projectBlend);
      const radius = (mobile ? 3.4 : 5.9) * taper * depthScale * (1 - .24 * THREE.MathUtils.smoothstep(t, .92, 1)) * (1 - terminalFade) * (1 + collar * .28);
      centers.push(new THREE.Vector3(p.x + nx * offset, -p.y - ny * offset, z));
      radii.push(radius * (1 + .018 * Math.sin(t * 73 + strand)));
    }
    for (let i = 0; i < rings; i++) {
      const before = centers[Math.max(0, i - 1)], after = centers[Math.min(rings - 1, i + 1)];
      const tangent = new THREE.Vector3().subVectors(after, before).normalize();
      const side = new THREE.Vector3(-tangent.y, tangent.x, 0).normalize();
      const depth = new THREE.Vector3().crossVectors(tangent, side).normalize();
      const center = centers[i];
      const radius = radii[i];
      const t = i / (rings - 1);
      for (let j = 0; j <= sides; j++) {
        const angle = j / sides * Math.PI * 2;
        const c = Math.cos(angle), s = Math.sin(angle);
        const normal = side.clone().multiplyScalar(c).addScaledVector(depth, s);
        positions.push(center.x + normal.x * radius, center.y + normal.y * radius, center.z + normal.z * radius);
        normals.push(normal.x, normal.y, normal.z);
        uvs.push(t, j / sides);
        if (i < rings - 1 && j < sides) {
          const a = i * (sides + 1) + j, b = a + sides + 1;
          indices.push(a, a + 1, b, b, a + 1, b + 1);
        }
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeTangents();
    const material = createWireMaterial(strand, mobile);
    scene.add(new THREE.Mesh(geometry, material));
    geometries.push(geometry); materials.push(material);
  }
  const lost = (event: Event) => { event.preventDefault(); onLost(); };
  canvas.addEventListener("webglcontextlost", lost);
  let disposed = false;
  let environment: THREE.WebGLRenderTarget | undefined;
  return {
    async prepare() {
      const hdr = await new HDRLoader().loadAsync(`${import.meta.env.BASE_URL}environments/wire-studio.hdr`);
      if (disposed) { hdr.dispose(); return; }
      const pmrem = new THREE.PMREMGenerator(renderer);
      try {
        environment = pmrem.fromEquirectangular(hdr);
        scene.environment = environment.texture;
        // Layout changes can dispose this scene while Three polls compileAsync.
        // Compile synchronously after HDR loading so teardown cannot race that poll.
        renderer.compile(scene, camera);
      } finally { hdr.dispose(); pmrem.dispose(); }
    },
    render(scroll: number, progress: number, dark: boolean, reduced: boolean, energy = 0, pointer = { x: 10000, y: 10000 }, pointerStrength = 0, focus = { y: 10000, strength: 0 }) {
      if (disposed) return;
      // Phones use a document-positioned canvas: native scrolling moves pixels
      // together with the text, even when JS misses a frame during touch inertia.
      const nextHeight = mobile ? (height ?? window.innerHeight) : (canvas.clientHeight || window.innerHeight);
      if (nextHeight !== surfaceHeight) {
        surfaceHeight = nextHeight;
        renderer.setSize(width, surfaceHeight, false);
        camera.bottom = -surfaceHeight;
        camera.updateProjectionMatrix();
      }
      camera.position.y = mobile ? 0 : mainTop - scroll;
      const index = Math.min(points.length - 1, Math.round(progress * (points.length - 1)));
      const point = points[index];
      materials.forEach(material => {
        material.color.set(dark ? "#889b9d" : "#34695e");
        material.metalness = dark ? .92 : .58;
        material.roughness = dark ? .28 : .34;
        material.envMapIntensity = dark ? 1.15 : .85;
        material.clearcoat = mobile ? 0 : (dark ? .12 : .32);
        material.uniforms.uDark.value = dark ? 1 : 0;
        material.uniforms.uScroll.value = scroll;
        material.uniforms.uMotion.value = reduced ? 0 : 1;
        material.uniforms.uEnergy.value = reduced ? 0 : energy;
        material.uniforms.uPointer.value.set(pointer.x, pointer.y);
        material.uniforms.uPointerStrength.value = reduced ? 0 : pointerStrength;
        material.uniforms.uFocusY.value = focus.y;
        material.uniforms.uFocusStrength.value = reduced ? 0 : focus.strength;
        material.uniforms.uProgress.value = progress;
        material.uniforms.uSignal.value.set(point.x, -point.y, 0);
      });
      renderer.render(scene, camera);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      canvas.removeEventListener("webglcontextlost", lost);
      geometries.forEach(geometry => geometry.dispose());
      materials.forEach(material => material.dispose());
      environment?.dispose();
      renderer.dispose();
    },
  };
}
