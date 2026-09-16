import * as THREE from "three";

// Independent reconstruction of Flow's visual vocabulary. All paths and
// materials are procedural; no Spline geometry, textures, or runtime are used.
// Art-directed horizontal landmarks, bottom to top. Separate silhouettes avoid
// the evenly spaced, repeating crossings of the initial sine-wave bundle.
const PATHS = [
  [-156, -142, -117, -123, -139, -118, -94, -88, -82],
  [-113, -98, -68, -83, -113, -103, -73, -59, -69],
  [-82, -62, -35, -48, -72, -56, -46, -66, -77],
  [-49, -38, -53, -71, -59, -28, -15, -27, -39],
  [-18, -30, -56, -36, -8, -10, -25, -41, -48],
  [4, -10, -28, -15, 19, 32, 18, 12, 20],
  [33, 15, 2, 34, 57, 48, 29, 34, 40],
  [55, 37, 18, 46, 80, 53, 21, 36, 57],
  [81, 70, 63, 82, 105, 111, 94, 81, 76],
  [116, 102, 86, 100, 119, 127, 115, 96, 91],
  [137, 122, 109, 121, 133, 128, 107, 104, 110],
] as const;
const RADII = [2.1, 1.5, 2.3, 1.35, 1.7, 2.15, 1.4, 2.4, 1.6, 1.3, 1.85];

export class WireCurve extends THREE.Curve<THREE.Vector3> {
  constructor(readonly index: number) { super(); }

  getPoint(t: number, target = new THREE.Vector3()) {
    const i = this.index;
    const y = (t - .5) * 1300;
    const phase = i * 1.731;
    const path = PATHS[i];
    const segment = Math.min(7, Math.floor(t * 8));
    const u = t * 8 - segment;
    const a = path[Math.max(0, segment - 1)], b = path[segment];
    const c = path[segment + 1], d = path[Math.min(8, segment + 2)];
    // Cubic Hermite interpolation keeps the vertical coordinate monotonic.
    const x = (2*u*u*u - 3*u*u + 1)*b + (u*u*u - 2*u*u + u)*(c-a)*.5
      + (-2*u*u*u + 3*u*u)*c + (u*u*u - u*u)*(d-b)*.5;
    const z = Math.sin(t * 5.4 + phase) * 16 + (i % 4) * 11;
    return target.set(x, y, z);
  }
}

const vertexShader = /* glsl */`
  uniform float uTime;
  uniform float uPhase;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vUv = uv;
    vec3 p = position;
    // The reference is almost still: motion belongs primarily to the signals.
    p.x += sin(p.y * .004 + uTime * .18 + uPhase) * .65;
    p.z += cos(p.y * .003 + uTime * .13 + uPhase) * .4;
    vec4 view = modelViewMatrix * vec4(p, 1.0);
    vView = -view.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * view;
  }
`;

const fragmentShader = /* glsl */`
  uniform float uTime;
  uniform float uPhase;
  uniform float uLight;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec3 n = normalize(vNormal);
    vec3 eye = vec3(0.0, 0.0, 1.0); // Orthographic, not perspective.
    vec3 key = normalize(vec3(-1.9, .16, .45));
    vec3 rim = normalize(vec3(.9, -.2, .35));
    // Broaden subpixel reflections to prevent sparkling on thin curved edges.
    float roughness = clamp(length(fwidth(n)) * .6, 0.0, 1.0);
    float specular = pow(max(dot(n, normalize(key + eye)), 0.0), mix(32.0, 12.0, roughness));
    float edge = pow(1.0 - abs(dot(n, eye)), 2.7);
    float fill = pow(max(dot(n, rim), 0.0), 18.0);
    vec3 metal = vec3(.003, .005, .008)
      + specular * vec3(.34, .41, .48)
      + fill * vec3(.075, .10, .12)
      + edge * vec3(.075, .095, .12);

    // UV.x is distance along the tube, not screen space. A short bright head
    // and longer fading tail travel around the curved surface without sprites.
    float travel = vUv.x * 4.2 + uTime * (.09 + .012 * sin(uPhase * 17.0)) + uPhase;
    float q = fract(travel);
    float pulse = smoothstep(.0, .023, q) * (1.0 - smoothstep(.031, .092, q));
    float wrap = .55 + .45 * sin(vUv.y * 6.283185 + vUv.x * 13.0 + uPhase * 3.0);
    pulse *= smoothstep(.12, .7, wrap);
    float colorIndex = fract(floor(travel) * .618 + uPhase * .37);
    vec3 signal = vec3(.39, .88, .17);
    if (colorIndex > .40) signal = vec3(.015, .57, .62);
    if (colorIndex > .65) signal = vec3(.65, .035, .39);
    if (colorIndex > .87) signal = vec3(.72, .52, .19);
    vec3 color = metal + pulse * signal * (.35 + .65 * max(dot(n, eye), 0.0));
    vec3 lightMetal = vec3(.30, .39, .34) + specular * .18;
    color = mix(color, lightMetal - pulse * vec3(.12, .07, .14), uLight);
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function createWireScene(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-450, 450, 450, -450, .1, 2000);
  camera.position.set(0, 0, 1000);
  const geometries: THREE.TubeGeometry[] = [];
  const materials: THREE.ShaderMaterial[] = [];
  const small = window.innerWidth < 700;
  for (let i = 0; i < 11; i++) {
    const geometry = new THREE.TubeGeometry(new WireCurve(i), small ? 256 : 400, RADII[i], small ? 8 : 16, false);
    const material = new THREE.ShaderMaterial({
      vertexShader, fragmentShader,
      uniforms: { uTime: { value: 0 }, uPhase: { value: i * .173 }, uLight: { value: 0 } },
    });
    geometries.push(geometry);
    materials.push(material);
    scene.add(new THREE.Mesh(geometry, material));
  }
  let disposed = false;
  let stopped = true;
  let lost = false;
  let frame = 0;
  let elapsed = 0;
  let previous = 0;
  const render = () => {
    if (!disposed && !lost && !document.hidden) renderer.render(scene, camera);
  };
  const tick = (now: number) => {
    frame = 0;
    if (disposed || stopped || lost || document.hidden) return;
    elapsed += Math.min((now - previous) / 1000, .05);
    previous = now;
    materials.forEach(material => { material.uniforms.uTime.value = elapsed; });
    render();
    frame = requestAnimationFrame(tick);
  };
  const stop = () => { stopped = true; cancelAnimationFrame(frame); frame = 0; };
  const play = () => {
    stopped = false;
    if (!frame && !disposed && !lost && !document.hidden) {
      previous = performance.now();
      frame = requestAnimationFrame(tick);
    }
  };
  const themeChanged = () => {
    const light = document.documentElement.dataset.theme === "light" ? 1 : 0;
    materials.forEach(material => { material.uniforms.uLight.value = light; });
    render();
  };
  const theme = new MutationObserver(themeChanged);
  theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  themeChanged();
  const contextLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    cancelAnimationFrame(frame);
    frame = 0;
    canvas.parentElement?.setAttribute("data-context-lost", "true");
  };
  const contextRestored = () => {
    lost = false;
    canvas.parentElement?.removeAttribute("data-context-lost");
    render();
    if (!stopped) play();
  };
  const visibilityChanged = () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
      return;
    }
    render();
    if (!stopped) play();
  };
  canvas.addEventListener("webglcontextlost", contextLost);
  canvas.addEventListener("webglcontextrestored", contextRestored);
  document.addEventListener("visibilitychange", visibilityChanged);
  return {
    play, stop,
    setSize(width: number, height: number) {
      if (disposed || width <= 0 || height <= 0) return;
      const halfHeight = 460;
      camera.left = -halfHeight * width / height;
      camera.right = halfHeight * width / height;
      camera.top = halfHeight;
      camera.bottom = -halfHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      render();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      stop();
      theme.disconnect();
      document.removeEventListener("visibilitychange", visibilityChanged);
      canvas.removeEventListener("webglcontextlost", contextLost);
      canvas.removeEventListener("webglcontextrestored", contextRestored);
      geometries.forEach(geometry => geometry.dispose());
      materials.forEach(material => material.dispose());
      scene.clear();
      renderer.dispose();
    },
  };
}
