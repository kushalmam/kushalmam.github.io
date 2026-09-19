import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Camera } from "@babylonjs/core/Cameras/camera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Curve3, Path3D } from "@babylonjs/core/Maths/math.path";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import { ShaderMaterial } from "@babylonjs/core/Materials/shaderMaterial";
import { DefaultRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";
import { ImageProcessingConfiguration } from "@babylonjs/core/Materials/imageProcessingConfiguration";
import { renderScale } from "./renderQuality";
import { wireAssets } from "./paths";
import { SignalController } from "./signals";
import { fragmentSource, vertexSource } from "./shaders";

export function createStudy(canvas: HTMLCanvasElement, onError: (message: string) => void) {
  const engine = new Engine(canvas, true, { preserveDrawingBuffer: false, stencil: true }, false);
  const scene = new Scene(engine);
  const camera = new FreeCamera("studio", new Vector3(0, 0, 24), scene);
  camera.setTarget(Vector3.Zero());
  camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
  const small = matchMedia("(max-width: 700px)").matches;
  const materials: ShaderMaterial[] = [];
  const controller = new SignalController(Math.random, wireAssets.length);
  wireAssets.forEach((asset, index) => {
    const curve = Curve3.CreateCatmullRomSpline(asset.points.map(p => new Vector3(...p)), small ? 36 : 64);
    const path = new Path3D(curve.getPoints());
    const points = path.getCurve(), normals = path.getNormals(), binormals = path.getBinormals();
    const distances = path.getDistances();
    const sides = small ? 16 : 24;
    const positions: number[] = [], vertexNormals: number[] = [], uvs: number[] = [], indices: number[] = [];
    points.forEach((point, j) => {
      for (let k = 0; k <= sides; k++) {
        const angle = k / sides * Math.PI * 2;
        const normal = normals[j].scale(Math.cos(angle)).add(binormals[j].scale(Math.sin(angle)));
        positions.push(...point.add(normal.scale(asset.radius * (small ? 1.25 : 1))).asArray());
        vertexNormals.push(...normal.asArray());
        uvs.push(distances[j], k / sides);
        if (j < points.length - 1 && k < sides) {
          const a = j * (sides + 1) + k, b = a + sides + 1;
          indices.push(a, b, a + 1, a + 1, b, b + 1);
        }
      }
    });
    const mesh = new Mesh(asset.name, scene);
    const data = new VertexData();
    data.positions = positions; data.normals = vertexNormals; data.uvs = uvs; data.indices = indices;
    data.applyToMesh(mesh);
    const material = new ShaderMaterial(`cable-${index}`, scene, { vertexSource, fragmentSource }, {
      attributes: ["position", "normal", "uv"],
      uniforms: ["world", "worldViewProjection", "eye", "lightTheme", "signalsVisible", "packets", "motionTime", "strandBrightness", "reflectionFilter"],
    });
    material.backFaceCulling = false;
    material.setVector3("eye", camera.position);
    material.setFloat("signalsVisible", 1);
    material.setFloat("motionTime", 0);
    material.setFloat("strandBrightness", asset.brightness);
    material.setFloat("lightTheme", 0);
    material.setFloat("reflectionFilter", .3);
    material.onError = (_effect, errors) => onError(`Wire shader could not compile: ${errors}`);
    mesh.material = material;
    mesh.freezeWorldMatrix();
    materials.push(material);
  });
  const pipeline = new DefaultRenderingPipeline("studio-finishing", true, scene, [camera]);
  pipeline.samples = 4;
  // MSAA plus supersampling resolves edges without FXAA smearing thin strands.
  pipeline.fxaaEnabled = false;
  pipeline.bloomEnabled = true;
  // Keep the silver body out of bloom; only HDR packet highlights should glow.
  pipeline.bloomThreshold = 2.1;
  pipeline.bloomWeight = .21;
  pipeline.bloomKernel = 16;
  pipeline.bloomScale = 1;
  scene.imageProcessingConfiguration.toneMappingEnabled = true;
  scene.imageProcessingConfiguration.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES;
  scene.imageProcessingConfiguration.exposure = 1.25;
  let playing = true, visible = true, disposed = false, lost = false, last = performance.now();
  let speed = 2;
  let motionTime = 0;
  const updatePackets = () => {
    materials.forEach((material, wire) => {
      const values = controller.packets(wire).flatMap(p => [p.head, p.tail, p.color, p.strength]);
      while (values.length < 24) values.push(-100, 1, 0, 0);
      material.setArray4("packets", values);
      material.setFloat("motionTime", motionTime);
    });
  };
  const render = () => { if (!disposed && !lost) { updatePackets(); scene.render(); } };
  const tick = () => {
    const now = performance.now();
    const delta = Math.min((now - last) / 1000, .05);
    motionTime += delta;
    controller.advance(delta, speed);
    last = now;
    render();
  };
  const sync = () => {
    engine.stopRenderLoop(tick);
    if (playing && visible && !document.hidden && !disposed && !lost) {
      last = performance.now();
      engine.runRenderLoop(tick);
    }
  };
  const resize = () => {
    const scale = renderScale(canvas.clientWidth, canvas.clientHeight, devicePixelRatio || 1);
    engine.setHardwareScalingLevel(1 / scale);
    engine.resize();
    const aspect = canvas.clientWidth / Math.max(canvas.clientHeight, 1);
    const halfWidth = canvas.clientWidth < 700 ? 7.2 : 10.5;
    materials.forEach((material, index) => {
      const pixelRadius = wireAssets[index].radius * (small ? 1.25 : 1)
        * canvas.clientWidth * scale / (2 * halfWidth);
      // Fixed per-wire pixel footprint: unlike screen derivatives, it cannot pulse
      // when individual triangles cross pixel boundaries.
      material.setFloat("reflectionFilter", Math.min(.65, .65 / Math.max(pixelRadius, 1)));
    });
    camera.orthoLeft = -halfWidth; camera.orthoRight = halfWidth;
    camera.orthoTop = halfWidth / aspect; camera.orthoBottom = -halfWidth / aspect;
    render();
  };
  const setTheme = (light: boolean) => {
    scene.clearColor = light ? new Color4(.88, .87, .82, 1) : new Color4(.008, .012, .016, 1);
    materials.forEach(material => material.setFloat("lightTheme", light ? 1 : 0));
    render();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); });
  intersection.observe(canvas);
  document.addEventListener("visibilitychange", sync);
  engine.onContextLostObservable.add(() => { lost = true; sync(); onError("Graphics context lost. Reload this study to retry."); });
  controller.advance(3.8, 1);
  // Seed a composed still frame, also used when reduced motion is requested.
  controller.advance(2.5, 1);
  setTheme(false);
  resize();
  sync();
  // Post-process shaders load asynchronously; paused visitors still need a completed frame.
  scene.executeWhenReady(render);
  return {
    setTheme,
    setPlaying(value: boolean) { playing = value; sync(); render(); },
    setSpeed(value: number) { speed = value; },
    setGlow(value: number) { pipeline.bloomWeight = value; render(); },
    setSignals(value: boolean) { materials.forEach(m => m.setFloat("signalsVisible", value ? 1 : 0)); render(); },
    emit() { wireAssets.forEach((_, i) => controller.emit(i)); render(); },
    dispose() {
      disposed = true;
      observer.disconnect(); intersection.disconnect();
      document.removeEventListener("visibilitychange", sync);
      engine.stopRenderLoop(tick);
      scene.dispose(); engine.dispose();
    },
  };
}
