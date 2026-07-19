import { useEffect, useRef, useState } from "react";

const THREE_CDN_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";

type ShaderUniforms = {
  uTime: { value: number };
  uTheme: { value: number };
  uRes: { value: { set: (width: number, height: number) => void } };
};

type RendererLike = {
  setClearColor: (color: number, alpha: number) => void;
  setSize: (width: number, height: number, updateStyle?: boolean) => void;
  setPixelRatio: (ratio: number) => void;
  render: (scene: object, camera: object) => void;
  dispose: () => void;
  forceContextLoss: () => void;
};

type Disposable = {
  dispose: () => void;
};

type MaterialLike = Disposable & {
  uniforms: ShaderUniforms;
};

type ThreeGlobal = {
  WebGLRenderer: new (options: {
    canvas: HTMLCanvasElement;
    antialias: boolean;
    alpha: boolean;
  }) => RendererLike;
  Scene: new () => { add: (object: object) => void };
  OrthographicCamera: new (
    left: number,
    right: number,
    top: number,
    bottom: number,
    near: number,
    far: number,
  ) => object;
  ShaderMaterial: new (options: {
    vertexShader: string;
    fragmentShader: string;
    uniforms: ShaderUniforms;
  }) => MaterialLike;
  Vector2: new (
    width?: number,
    height?: number,
  ) => { set: (width: number, height: number) => void };
  Mesh: new (geometry: object, material: object) => object;
  PlaneGeometry: new (width: number, height: number) => Disposable;
};

declare global {
  interface Window {
    THREE?: ThreeGlobal;
    __portfolioThreeCdnPromise?: Promise<ThreeGlobal>;
  }
}

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uRes;
  uniform float uTheme;
  varying vec2 vUv;

  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float smoothNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(noise(i), noise(i + vec2(1.0, 0.0)), u.x),
      mix(noise(i + vec2(0.0, 1.0)), noise(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;

    for (int i = 0; i < 5; i++) {
      v += a * smoothNoise(p);
      p = p * 2.08 + vec2(1.7, 9.2);
      a *= 0.5;
    }

    return v;
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.06;

    vec2 q = vec2(
      fbm(uv + t),
      fbm(uv + vec2(1.0))
    );

    vec2 r = vec2(
      fbm(uv + 2.0 * q + vec2(1.7 + t * 0.5, 9.2)),
      fbm(uv + 2.0 * q + vec2(8.3 + t * 0.3, 2.8))
    );

    float f = fbm(uv + 2.8 * r);
    float swirl = smoothstep(0.3, 0.75, f);

    vec3 darkBase = vec3(0.04, 0.04, 0.04);
    vec3 darkSmoke = vec3(1.0);
    vec3 lightBase = vec3(0.985, 0.98, 0.965);
    vec3 lightSmoke = vec3(0.06, 0.065, 0.07);

    vec3 darkColor = mix(darkBase, darkSmoke, swirl * 0.18);
    vec3 lightColor = mix(lightBase, lightSmoke, swirl * 0.24);
    vec3 color = mix(darkColor, lightColor, uTheme);

    gl_FragColor = vec4(color, 1.0);
  }
`;

const getThemeValue = () =>
  document.documentElement.classList.contains("light") ? 1 : 0;

const loadThreeFromCdn = () => {
  if (window.THREE) return Promise.resolve(window.THREE);
  if (window.__portfolioThreeCdnPromise) {
    return window.__portfolioThreeCdnPromise;
  }

  window.__portfolioThreeCdnPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${THREE_CDN_URL}"]`,
    );
    const script = existingScript ?? document.createElement("script");

    const handleLoad = () => {
      if (window.THREE) {
        resolve(window.THREE);
      } else {
        reject(new Error("Three.js CDN loaded without exposing window.THREE"));
      }
    };

    const handleError = () =>
      reject(new Error("Unable to load Three.js from cdnjs"));

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });

    if (!existingScript) {
      script.src = THREE_CDN_URL;
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }
  });

  return window.__portfolioThreeCdnPromise;
};

const SmokeBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [hasWebGlFallback, setHasWebGlFallback] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setReduceMotion(media.matches);

    updateMotionPreference();
    media.addEventListener("change", updateMotionPreference);

    return () => media.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let animationFrame = 0;
    let disposed = false;
    let renderer: RendererLike | null = null;
    let material: MaterialLike | null = null;
    let geometry: Disposable | null = null;
    let observer: MutationObserver | null = null;

    const resizeHandlers = new Set<() => void>();

    void loadThreeFromCdn()
      .then((THREE) => {
        if (disposed) return;

        renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          alpha: false,
        });
        renderer.setClearColor(0x0a0a0a, 1);

        const uniforms = {
          uTime: { value: reduceMotion ? 12 : 0 },
          uTheme: { value: getThemeValue() },
          uRes: {
            value: new THREE.Vector2(window.innerWidth, window.innerHeight),
          },
        };

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const planeGeometry = new THREE.PlaneGeometry(2, 2);
        const shaderMaterial = new THREE.ShaderMaterial({
          vertexShader,
          fragmentShader,
          uniforms,
        });
        geometry = planeGeometry;
        material = shaderMaterial;
        scene.add(new THREE.Mesh(planeGeometry, shaderMaterial));

        const renderFrame = () => {
          if (!renderer || disposed) return;
          renderer.render(scene, camera);
        };

        const resize = () => {
          if (!renderer || disposed) return;

          const width = window.innerWidth;
          const height = window.innerHeight;
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
          renderer.setSize(width, height, false);
          uniforms.uRes.value.set(width, height);

          if (reduceMotion) {
            renderFrame();
          }
        };

        const updateTheme = () => {
          uniforms.uTheme.value = getThemeValue();

          if (reduceMotion) {
            renderFrame();
          }
        };

        const render = () => {
          if (!renderer || disposed) return;

          if (!reduceMotion) {
            uniforms.uTime.value += 0.016;
          }

          renderFrame();

          if (!reduceMotion) {
            animationFrame = window.requestAnimationFrame(render);
          }
        };

        resize();
        updateTheme();
        render();
        setHasWebGlFallback(false);

        window.addEventListener("resize", resize);
        resizeHandlers.add(resize);
        observer = new MutationObserver(updateTheme);
        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["class"],
        });
      })
      .catch(() => {
        setHasWebGlFallback(true);
        renderer?.dispose();
        renderer?.forceContextLoss();
      });

    return () => {
      disposed = true;
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      resizeHandlers.forEach((handler) =>
        window.removeEventListener("resize", handler),
      );
      observer?.disconnect();
      geometry?.dispose();
      material?.dispose();
      renderer?.dispose();
      renderer?.forceContextLoss();
    };
  }, [reduceMotion]);

  return (
    <div
      aria-hidden="true"
      className="site-background-shell pointer-events-none fixed inset-0 -z-40 overflow-hidden bg-background"
    >
      <canvas ref={canvasRef} className="site-shader-canvas" />
      {hasWebGlFallback && <div className="site-shader-fallback" />}
      <div className="absolute inset-0 site-shader-color-grade" />
      <div className="absolute inset-0 site-shader-readability-mask" />
      <div className="absolute inset-0 grain-layer" />
    </div>
  );
};

export default SmokeBackground;
