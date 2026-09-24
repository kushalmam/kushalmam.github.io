import * as THREE from "three";

type RoutePoint = { x: number; y: number };
type Options = { canvas: HTMLCanvasElement; points: RoutePoint[]; width: number; mainTop: number; about: number; landmarks?: number[]; onLost: () => void };

const vertexShader = /* glsl */`
  uniform float uScroll;
  uniform float uMotion;
  uniform float uProgress;
  uniform float uEnergy;
  uniform vec2 uPointer;
  uniform float uPointerStrength;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  void main() {
    vec3 p = position;
    float flow = uMotion * (1.2 + uEnergy * 2.3);
    float xPhase = p.y * .006 + uScroll * .002;
    float zPhase = p.y * .009 + uScroll * .003;
    p.x += sin(xPhase) * flow;
    p.z += sin(zPhase) * flow * .8;
    vec2 away = p.xy - uPointer;
    float proximity = exp(-dot(away, away) / 18000.0);
    p.xy += away / max(length(away), 1.0) * proximity * uPointerStrength * uMotion * 4.0;
    vPosition = p;
    vNormal = normalize(vec3(normal.x, normal.y - normal.x * cos(xPhase) * .006 * flow - normal.z * cos(zPhase) * .009 * flow * .8, normal.z));
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const fragmentShader = /* glsl */`
  uniform float uDark;
  uniform float uStrand;
  uniform float uProgress;
  uniform float uMotion;
  uniform float uEnergy;
  uniform vec3 uSignal;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  void main() {
    vec3 n = normalize(vNormal);
    vec3 key = normalize(vec3(-.7, .85, 1.35));
    vec3 fill = normalize(vec3(.8, -.35, 1.0));
    float diffuse = max(dot(n, key), 0.0);
    float studio = pow(max(dot(n, normalize(vec3(-.32,.9,1.45))), 0.), 5.0);
    float strip = pow(max(dot(n, normalize(vec3(.22,.25,1.0))), 0.), 42.0);
    float rim = pow(max(dot(n, fill), 0.), 18.0);
    vec3 base = mix(vec3(.09,.25,.22), vec3(.09,.17,.16), uDark);
    base *= 1.0 + uStrand * .035;
    vec3 color = base * (.48 + .62 * diffuse);
    color += studio * mix(vec3(.50,.56,.48), vec3(.38,.48,.43), uDark) * .58;
    color += strip * mix(vec3(.70,.75,.65), vec3(.62,.75,.68), uDark) * (.52 + uEnergy * .12);
    color += rim * mix(vec3(.12,.22,.18), vec3(.16,.27,.23), uDark);
    float collar = (1.0 - step(.5, uStrand)) * smoothstep(.931,.938,vUv.x) * (1.0 - smoothstep(.953,.960,vUv.x));
    color = mix(color, mix(vec3(.46,.52,.44), vec3(.43,.53,.48), uDark) * (.66 + .42 * diffuse) + strip * .32, collar);
    float band = exp(-pow((vUv.x - uProgress) / .0045, 2.));
    float spill = exp(-length(vPosition - uSignal) / 30.);
    vec3 mint = vec3(.45, .93, .65);
    float activeStrand = 1.0 - step(.5, uStrand);
    color += mint * (band * mix(.20, .75, activeStrand) + spill * mix(.05, .17, activeStrand)) * uMotion;
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
      const chapterSpread = (landmarks ?? []).reduce((spread, landmark) => spread + Math.exp(-Math.pow((p.y - landmark) / 115, 2)), 0);
      const spacing = (mobile ? 4 : 7) + opening * (mobile ? 3 : 14) + chapterSpread * (mobile ? 3 : 10);
      const phase = t * Math.PI * 8 + strand * Math.PI * 2 / 3;
      const contactLead = THREE.MathUtils.smoothstep(t, .82, .94);
      const terminalFade = strand === 0 ? 0 : THREE.MathUtils.smoothstep(t, .89, .95);
      const braidedOffset = Math.cos(phase) * spacing;
      const offset = THREE.MathUtils.lerp(braidedOffset, 0, contactLead);
      const z = THREE.MathUtils.lerp(Math.sin(phase) * spacing, strand === 0 ? 1 : -5, contactLead);
      const taper = 1 - .35 * THREE.MathUtils.smoothstep(p.y, about - 100, about + 200);
      const collar = strand === 0 ? THREE.MathUtils.smoothstep(t, .931, .938) * (1 - THREE.MathUtils.smoothstep(t, .953, .960)) : 0;
      const radius = (mobile ? 3.4 : 5.9) * taper * (1 - .24 * THREE.MathUtils.smoothstep(t, .92, 1)) * (1 - terminalFade) * (1 + collar * .28);
      centers.push(new THREE.Vector3(p.x + nx * offset, -p.y - ny * offset, z));
      radii.push(radius);
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
      uMotion: { value: 1 }, uEnergy: { value: 0 }, uPointer: { value: new THREE.Vector2(10000, 10000) },
      uPointerStrength: { value: 0 }, uSignal: { value: new THREE.Vector3() },
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
    render(scroll: number, progress: number, dark: boolean, reduced: boolean, energy = 0, pointer = { x: 10000, y: 10000 }, pointerStrength = 0) {
      if (disposed) return;
      camera.position.y = mainTop - scroll;
      const index = Math.min(points.length - 1, Math.round(progress * (points.length - 1)));
      const point = points[index];
      materials.forEach(material => {
        material.uniforms.uDark.value = dark ? 1 : 0;
        material.uniforms.uScroll.value = scroll;
        material.uniforms.uMotion.value = reduced ? 0 : 1;
        material.uniforms.uEnergy.value = reduced ? 0 : energy;
        material.uniforms.uPointer.value.set(pointer.x, pointer.y);
        material.uniforms.uPointerStrength.value = reduced ? 0 : pointerStrength;
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
