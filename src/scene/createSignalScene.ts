import * as THREE from "three";

type RoutePoint = { x: number; y: number };
type Options = { canvas: HTMLCanvasElement; points: RoutePoint[]; width: number; mainTop: number; about: number; landmarks?: number[]; onLost: () => void };

const vertexShader = /* glsl */`
  uniform float uScroll;
  uniform float uMotion;
  uniform float uProgress;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  void main() {
    vec3 p = position;
    // A small, scroll-driven flex. No perpetual idle loop.
    p.x += sin(p.y * .006 + uScroll * .002) * 2.5 * uMotion;
    p.z += sin(p.y * .009 + uScroll * .003) * 3.0 * uMotion;
    float packet = exp(-pow((uv.x - uProgress) / .012, 2.0)) * uMotion;
    p.x += cos(uv.x * 64.0) * packet * 1.4;
    p.z += packet * 2.2;
    vPosition = p;
    vNormal = normal;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const fragmentShader = /* glsl */`
  uniform float uDark;
  uniform float uStrand;
  uniform float uProgress;
  uniform float uMotion;
  uniform vec3 uSignal;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  void main() {
    vec3 n = normalize(vNormal);
    vec3 key = normalize(vec3(-.7, .8, 1.2));
    vec3 rim = normalize(vec3(.9, -.35, .65));
    float diffuse = max(dot(n, key), 0.0);
    float spec = pow(max(dot(n, normalize(key + vec3(0.,0.,1.))), 0.), mix(38., 65., uDark));
    float broad = pow(max(dot(n, normalize(vec3(-.3,.9,1.8))), 0.), 7.);
    float edge = pow(max(dot(n, normalize(rim + vec3(0.,0.,1.))), 0.), 45.);
    vec3 enamel = mix(vec3(.16,.32,.28), vec3(.31,.39,.29), smoothstep(.45,.98,vUv.x));
    enamel = mix(enamel, vec3(.32,.43,.39), uStrand * .17);
    vec3 base = mix(enamel, enamel * .37, uDark);
    vec3 color = base * (.40 + .70 * diffuse);
    color += broad * mix(vec3(.16,.23,.20), vec3(.08,.16,.14), uDark);
    color += spec * mix(vec3(.50,.57,.46), vec3(.52,.72,.63), uDark);
    color += edge * mix(vec3(.13,.18,.15), vec3(.24,.38,.33), uDark);
    float band = exp(-pow((vUv.x - uProgress) / .006, 2.));
    float spill = exp(-length(vPosition - uSignal) / 36.);
    vec3 mint = vec3(.43, 1., .68);
    color += mint * (band * .95 + spill * .20) * uMotion;
    gl_FragColor = vec4(color, 1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/** Viewport-sized renderer; page coordinates keep geometry anchored to the layout. */
export function createSignalScene({ canvas, points, width, mainTop, about, landmarks, onLost }: Options) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.setSize(width, window.innerHeight, false);
  renderer.setClearColor(0, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const camera = new THREE.OrthographicCamera(0, width, 0, -window.innerHeight, .1, 1000);
  camera.position.z = 500;
  const scene = new THREE.Scene();
  const mobile = width < 700;
  const materials: THREE.ShaderMaterial[] = [];
  const geometries: THREE.BufferGeometry[] = [];
  const rings = points.length;
  const sides = 12;
  for (let strand = 0; strand < 3; strand++) {
    const positions: number[] = [], normals: number[] = [], uvs: number[] = [], indices: number[] = [];
    for (let i = 0; i < rings; i++) {
      const p = points[i];
      const before = points[Math.max(0, i - 1)], after = points[Math.min(rings - 1, i + 1)];
      const dx = after.x - before.x, dy = after.y - before.y;
      const norm = Math.hypot(dx, dy) || 1;
      const nx = -dy / norm, ny = dx / norm;
      const t = i / (rings - 1);
      const opening = Math.exp(-Math.pow((p.y - about - 170) / 240, 2));
      const chapterSpread = (landmarks ?? []).reduce((spread, landmark) => spread + Math.exp(-Math.pow((p.y - landmark) / 115, 2)), 0);
      const contactConvergence = 1 - .86 * THREE.MathUtils.smoothstep(t, .91, 1);
      const spacing = ((mobile ? 4 : 7) + opening * (mobile ? 3 : 14) + chapterSpread * (mobile ? 3 : 10)) * contactConvergence;
      const phase = t * Math.PI * 8 + strand * Math.PI * 2 / 3;
      const offset = Math.cos(phase) * spacing;
      const z = Math.sin(phase) * spacing;
      const taper = 1 - .35 * THREE.MathUtils.smoothstep(p.y, about - 100, about + 200);
      const radius = (mobile ? 3.4 : 5.9) * taper * (1 - .42 * THREE.MathUtils.smoothstep(t, .94, 1));
      for (let j = 0; j <= sides; j++) {
        const angle = j / sides * Math.PI * 2;
        const c = Math.cos(angle), s = Math.sin(angle);
        positions.push(p.x + nx * (offset + radius * c), -p.y - ny * (offset + radius * c), z + radius * s);
        normals.push(nx * c, -ny * c, s);
        uvs.push(t, j / sides);
        if (i < rings - 1 && j < sides) {
          const a = i * (sides + 1) + j, b = a + sides + 1;
          indices.push(a, b, a + 1, b, b + 1, a + 1);
        }
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, side: THREE.DoubleSide, uniforms: {
      uDark: { value: 0 }, uStrand: { value: strand }, uProgress: { value: 0 }, uScroll: { value: 0 },
      uMotion: { value: 1 }, uSignal: { value: new THREE.Vector3() },
    } });
    scene.add(new THREE.Mesh(geometry, material));
    geometries.push(geometry); materials.push(material);
  }
  const lost = (event: Event) => { event.preventDefault(); onLost(); };
  canvas.addEventListener("webglcontextlost", lost);
  let disposed = false;
  return {
    prepare() {
      return renderer.compileAsync(scene, camera);
    },
    render(scroll: number, progress: number, dark: boolean, reduced: boolean) {
      if (disposed) return;
      camera.position.y = mainTop - scroll;
      const index = Math.min(points.length - 1, Math.round(progress * (points.length - 1)));
      const point = points[index];
      materials.forEach(material => {
        material.uniforms.uDark.value = dark ? 1 : 0;
        material.uniforms.uScroll.value = scroll;
        material.uniforms.uMotion.value = reduced ? 0 : 1;
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
      renderer.dispose();
    },
  };
}
