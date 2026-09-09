import * as THREE from "three";

// Shared terrain, different depths: surface → interface → services → data → evidence.
// These are authored poses, not a continuous scroll animation.
const poses = [
  { gap: 0.72, peel: 0, turn: -0.34, x: 5, y: -1.3, zoom: 1 },
  { gap: 1.1, peel: 1.7, turn: -0.1, x: 10, y: -1, zoom: 0.88 },
  { gap: 1.65, peel: 2.5, turn: 0.12, x: 8, y: 0, zoom: 0.88 },
  { gap: 0.75, peel: 0.5, turn: -0.4, x: 5, y: -2, zoom: 1.1 },
];

function terrain(u: number, v: number) {
  const x =
    (u - 0.5) * (24 - 2.5 * Math.cos(v * Math.PI)) +
    2 * Math.sin(v * Math.PI * 2);
  const z =
    (v - 0.5) * 14 +
    1.3 * Math.sin(u * Math.PI * 2) +
    0.8 * Math.cos(u * Math.PI * 4);
  const y =
    0.85 * Math.sin(x * 0.25) +
    0.55 * Math.cos(z * 0.5) +
    2 * Math.exp(-((x - 5) ** 2 + (z + 2) ** 2) / 36);
  return new THREE.Vector3(x, y, z);
}

export function createSystemScene(host: HTMLElement) {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 90);
  camera.position.set(1, 11, 23);
  camera.lookAt(0, 0, 0);
  const ambient = new THREE.HemisphereLight(0xa9c6b1, 0x06110b, 2);
  scene.add(ambient);
  const light = new THREE.DirectionalLight(0xe2f5ce, 2.3);
  light.position.set(-6, 12, 5);
  scene.add(light);
  const system = new THREE.Group();
  scene.add(system);
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const layers: THREE.Group[] = [];
  const surfaces: THREE.MeshStandardMaterial[] = [];
  const contours: THREE.LineBasicMaterial[] = [];
  const routes: THREE.MeshBasicMaterial[] = [];
  const narrow = matchMedia("(max-width: 700px)");
  const segments = narrow.matches ? 28 : 48;
  const rows = narrow.matches ? 12 : 22;
  const points: number[] = [],
    indices: number[] = [],
    linePoints: number[] = [];
  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= segments; col++) {
      const p = terrain(col / segments, row / rows);
      points.push(p.x, p.y, p.z);
      if (col < segments) {
        const next = terrain((col + 1) / segments, row / rows);
        linePoints.push(p.x, p.y + 0.015, p.z, next.x, next.y + 0.015, next.z);
      }
      if (row < rows && col % Math.round(segments / 4) === 0) {
        const next = terrain(col / segments, (row + 1) / rows);
        linePoints.push(p.x, p.y + 0.015, p.z, next.x, next.y + 0.015, next.z);
      }
      if (col < segments && row < rows) {
        const a = row * (segments + 1) + col,
          b = a + segments + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
  }
  const surfaceGeometry = new THREE.BufferGeometry();
  surfaceGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(points, 3),
  );
  surfaceGeometry.setIndex(indices);
  surfaceGeometry.computeVertexNormals();
  const contourGeometry = new THREE.BufferGeometry();
  contourGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(linePoints, 3),
  );
  geometries.push(surfaceGeometry, contourGeometry);
  for (let index = 0; index < 5; index++) {
    const layer = new THREE.Group();
    const surface = new THREE.MeshStandardMaterial({
      roughness: 0.6,
      metalness: 0.25,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.88,
    });
    const contour = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: 0.28,
    });
    layer.add(
      new THREE.Mesh(surfaceGeometry, surface),
      new THREE.LineSegments(contourGeometry, contour),
    );
    materials.push(surface, contour);
    surfaces.push(surface);
    contours.push(contour);
    layers.push(layer);
    system.add(layer);
  }
  // Three routes follow the actual surface and correspond to project selection.
  for (let route = 0; route < 3; route++) {
    const path = Array.from({ length: 36 }, (_, index) => {
      const u = 0.04 + (index / 35) * 0.92;
      const v = 0.17 + route * 0.26 + (u > 0.35 && u < 0.65 ? 0.08 : 0);
      const point = terrain(u, v);
      point.y += 0.045;
      return point;
    });
    const geometry = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(path),
      narrow.matches ? 48 : 96,
      0.025,
      4,
      false,
    );
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.9,
    });
    geometries.push(geometry);
    materials.push(material);
    routes.push(material);
    layers[route * 2].add(new THREE.Mesh(geometry, material));
  }
  host.appendChild(renderer.domElement);
  host.dataset.ready = "true";
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let selected: number | null = null,
    section = 0,
    frame = 0,
    visible = false,
    disposed = false,
    lost = false,
    previous = 0;
  let target = { ...poses[0] };
  const current = { ...target };
  let lightMode = false;
  const accent = new THREE.Color(),
    emerald = new THREE.Color();
  const duration =
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--focus-time",
      ),
    ) || 480;

  function draw(now: number) {
    frame = 0;
    if (disposed || lost || !visible || document.hidden) return;
    const blend = motion.matches
      ? 1
      : 1 - Math.exp(-Math.min(now - previous, 32) / (duration / 4));
    previous = now;
    let moving = false;
    for (const key of Object.keys(current) as (keyof typeof current)[]) {
      current[key] = THREE.MathUtils.lerp(current[key], target[key], blend);
      if (Math.abs(current[key] - target[key]) < 0.002)
        current[key] = target[key];
      else moving = true;
    }
    layers.forEach((layer, index) => {
      layer.position.y =
        -index * current.gap + (index === 0 ? current.peel : 0);
      layer.position.x = index * (0.4 + current.peel * 0.22);
      layer.position.z = index * 0.18;
      layer.rotation.z = index === 0 ? current.peel * 0.03 : 0;
      // Fewer visible strata on phones, while preserving the same composition.
      layer.visible = !narrow.matches || index % 2 === 0;
    });
    const exposure = THREE.MathUtils.clamp((current.gap - 0.72) / 0.93, 0, 1);
    surfaces.forEach((surface, index) => {
      surface.opacity = index < 3 ? 0.8 - exposure * 0.5 : 0.9;
    });
    system.position.set(
      narrow.matches ? current.x * 0.2 : current.x,
      current.y,
      0,
    );
    system.rotation.y = current.turn;
    system.rotation.z = -0.12;
    camera.zoom = narrow.matches ? current.zoom * 0.7 : current.zoom;
    camera.updateProjectionMatrix();
    routes.forEach((material, index) => {
      const active = section === 2 ? index === selected : index === 0;
      material.color.copy(active ? accent : emerald);
      material.opacity = active ? 1 : 0.25;
    });
    renderer.render(scene, camera);
    if (moving) frame = requestAnimationFrame(draw);
  }
  function invalidate() {
    if (!frame && !disposed && !lost) {
      previous = performance.now();
      frame = requestAnimationFrame(draw);
    }
  }
  function palette() {
    const css = getComputedStyle(document.documentElement);
    lightMode = document.documentElement.dataset.theme === "light";
    accent.set(css.getPropertyValue("--accent").trim() || "#b9f542");
    ambient.color.set(lightMode ? 0xffffff : 0xa9c6b1);
    ambient.groundColor.set(lightMode ? 0x999999 : 0x06110b);
    light.color.set(lightMode ? 0xffffff : 0xe2f5ce);
    emerald.set(lightMode ? "#53876d" : "#258b61");
    scene.fog = new THREE.Fog(lightMode ? 0xf0f1eb : 0x090d0a, 19, 48);
    surfaces.forEach((surface, index) => {
      surface.color.set(lightMode ? 0xbfc4c0 : 0x081b12);
      surface.emissive.set(lightMode ? 0x000000 : 0x04130b);
      surface.opacity = index === 0 ? 0.82 : 0.94;
    });
    contours.forEach((contour, index) => {
      contour.color.copy(index === 0 ? emerald : accent);
      contour.opacity = lightMode ? 0.25 : 0.22;
    });
    invalidate();
  }
  function contextLost(event: Event) {
    event.preventDefault();
    lost = true;
    delete host.dataset.ready;
    cancelAnimationFrame(frame);
    frame = 0;
  }
  function contextRestored() {
    lost = false;
    host.dataset.ready = "true";
    invalidate();
  }
  renderer.domElement.addEventListener("webglcontextlost", contextLost);
  renderer.domElement.addEventListener("webglcontextrestored", contextRestored);
  const resize = new ResizeObserver(() => {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    invalidate();
  });
  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    invalidate();
  });
  const theme = new MutationObserver(palette);
  theme.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  resize.observe(host);
  visibility.observe(host);
  palette();
  document.addEventListener("visibilitychange", invalidate);
  motion.addEventListener("change", invalidate);
  narrow.addEventListener("change", invalidate);
  return {
    focus(value: number, project: number | null = null) {
      section = Math.max(0, Math.min(poses.length - 1, value));
      selected = project;
      target = {
        ...poses[section],
        gap: poses[section].gap + (project === null ? 0 : 0.25),
      };
      invalidate();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      visibility.disconnect();
      theme.disconnect();
      document.removeEventListener("visibilitychange", invalidate);
      motion.removeEventListener("change", invalidate);
      narrow.removeEventListener("change", invalidate);
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      renderer.dispose();
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      renderer.domElement.removeEventListener(
        "webglcontextrestored",
        contextRestored,
      );
      renderer.domElement.remove();
      delete host.dataset.ready;
    },
  };
}
