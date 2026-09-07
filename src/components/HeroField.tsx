import { useEffect, useRef } from "react";

/** Animated, illuminated folds rendered as a real displaced Three.js surface. */
export default function HeroField() {
  const hostRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let cleanup: (() => void) | undefined;
    void import("three")
      .then((THREE) => {
        if (disposed) return;
        let renderer: InstanceType<typeof THREE.WebGLRenderer>;
        try {
          renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "low-power",
          });
        } catch {
          return;
        }
        renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
        renderer.setClearColor(0x050b16);
        host.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 100);
        camera.position.z = 15;
        const geometry = new THREE.PlaneGeometry(38, 30, 180, 140);
        const material = new THREE.ShaderMaterial({
          uniforms: {
            time: { value: 0 },
            lightMode: {
              value: document.documentElement.dataset.theme === "light" ? 1 : 0,
            },
            pointer: { value: new THREE.Vector2() },
          },
          vertexShader: `
          uniform float time;
          varying vec3 vPosition;
          varying float vFold;
          varying vec3 vNormal;
          float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
          float noise(vec2 p) {
            vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
            return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
          }
          float fbm(vec2 p) {
            float n=0.0, a=.5;
            for(int i=0;i<4;i++) { n+=a*noise(p); p=mat2(.8,.6,-.6,.8)*p*2.03; a*=.5; }
            return n;
          }
          float heightAt(vec2 xy) {
            vec2 uv=xy*.15;
            vec2 warp=vec2(fbm(uv+vec2(time*.035,0)),fbm(uv+vec2(3.1,-time*.025)));
            float fold=fbm(uv+warp*2.5);
            return sin(fold*11.0+uv.x*.8)*1.65 + fold*2.7;
          }
          void main() {
            vec3 p=position;
            p.z=heightAt(p.xy);
            float e=.04;
            float dx=(heightAt(p.xy+vec2(e,0))-heightAt(p.xy-vec2(e,0)))/(2.0*e);
            float dy=(heightAt(p.xy+vec2(0,e))-heightAt(p.xy-vec2(0,e)))/(2.0*e);
            vNormal=normalize(vec3(-dx,-dy,1.0));
            vFold=(p.z+1.0)/5.0;
            vPosition=p;
            gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
          }`,
          fragmentShader: `
          uniform vec2 pointer;
          uniform float lightMode;
          varying vec3 vPosition;
          varying float vFold;
          varying vec3 vNormal;
          void main() {
            vec3 normal=normalize(vNormal);
            vec3 light=normalize(vec3(-.3+pointer.x*.3,.65+pointer.y*.2,1.0));
            float diffuse=max(dot(normal,light),0.0);
            vec3 viewDir=normalize(vec3(0,0,15)-vPosition);
            float spec=pow(max(dot(normal,normalize(light+viewDir)),0.0),28.0);
            float edge=pow(1.0-max(dot(normal,viewDir),0.0),2.0);
            vec3 base=mix(vec3(.009,.023,.055),vec3(.024,.079,.17),smoothstep(.28,.7,vFold));
            vec3 color=base*(.4+diffuse*.9)+vec3(.075,.19,.37)*spec*.8+vec3(.015,.05,.12)*edge;
            float vignette=1.0-smoothstep(5.0,17.0,length(vPosition.xy));
            color*=.65+vignette*.35;
            vec3 pearl=mix(vec3(.57,.73,.89),vec3(.84,.92,.98),diffuse*.65+.25);
            pearl+=vec3(.11,.1,.07)*spec;
            pearl-=vec3(.06,.035,.015)*edge;
            gl_FragColor=vec4(mix(color,pearl,lightMode),1.0);
          }`,
        });
        const themeObserver = new MutationObserver(() => {
          const light = document.documentElement.dataset.theme === "light";
          material.uniforms.lightMode.value = light ? 1 : 0;
          renderer.setClearColor(light ? 0xe4f0fc : 0x050b16);
          renderer.render(scene, camera);
        });
        themeObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["data-theme"],
        });
        renderer.setClearColor(
          document.documentElement.dataset.theme === "light"
            ? 0xe4f0fc
            : 0x050b16,
        );
        const surface = new THREE.Mesh(geometry, material);
        scene.add(surface);
        const pointer = new THREE.Vector2();
        let visible = false,
          frame = 0,
          previous = 0;
        const parent = host.parentElement;
        const onPointer = (event: PointerEvent) => {
          if (motion.matches || event.pointerType === "touch") return;
          const bounds = host.getBoundingClientRect();
          pointer.set(
            (event.clientX - bounds.left) / bounds.width - 0.5,
            0.5 - (event.clientY - bounds.top) / bounds.height,
          );
        };
        const onLeave = () => pointer.set(0, 0);
        parent?.addEventListener("pointermove", onPointer);
        parent?.addEventListener("pointerleave", onLeave);
        const draw = (now: number) => {
          if (now - previous > 32) {
            material.uniforms.time.value += Math.min(
              (now - previous) / 1000,
              0.05,
            );
            previous = now;
            material.uniforms.pointer.value.lerp(pointer, 0.05);
            surface.rotation.y +=
              (pointer.x * 0.045 - surface.rotation.y) * 0.04;
            parent?.style.setProperty(
              "--type-x",
              `${material.uniforms.pointer.value.y * 1.5}deg`,
            );
            parent?.style.setProperty(
              "--type-y",
              `${material.uniforms.pointer.value.x * 2}deg`,
            );
            renderer.render(scene, camera);
          }
          frame = requestAnimationFrame(draw);
        };
        const sync = () => {
          cancelAnimationFrame(frame);
          if (motion.matches) {
            renderer.render(scene, camera);
            return;
          }
          if (visible && !document.hidden) {
            previous = performance.now();
            frame = requestAnimationFrame(draw);
          }
        };
        const resize = new ResizeObserver(() => {
          const { width, height } = host.getBoundingClientRect();
          if (!width || !height) return;
          renderer.setSize(width, height);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          surface.scale.x = Math.max(1, camera.aspect / 2);
          renderer.render(scene, camera);
        });
        resize.observe(host);
        const observer = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          sync();
        });
        observer.observe(host);
        document.addEventListener("visibilitychange", sync);
        motion.addEventListener("change", sync);
        cleanup = () => {
          cancelAnimationFrame(frame);
          resize.disconnect();
          themeObserver.disconnect();
          observer.disconnect();
          document.removeEventListener("visibilitychange", sync);
          motion.removeEventListener("change", sync);
          parent?.removeEventListener("pointermove", onPointer);
          parent?.removeEventListener("pointerleave", onLeave);
          parent?.style.removeProperty("--type-x");
          parent?.style.removeProperty("--type-y");
          geometry.dispose();
          material.dispose();
          renderer.dispose();
          renderer.domElement.remove();
        };
      })
      .catch(() => {
        /* The navy background and readable headline remain without WebGL. */
      });
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);
  return <div className="hero-field" ref={hostRef} aria-hidden="true" />;
}
