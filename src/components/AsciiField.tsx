import { useEffect, useRef } from "react";

const glyphs = " .,:-=+*#%@";

export default function AsciiField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 1;
    let height = 1;
    let frame = 0;
    let last = 0;
    let time = 0;
    let disposed = false;
    const resizeObserver = new ResizeObserver(resize);

    function draw() {
      if (disposed) return;
      context!.clearRect(0, 0, width, height);
      const cell = width < 560 ? 9 : 11;
      const row = cell * 1.35;
      const ink = getComputedStyle(document.documentElement).getPropertyValue("--ascii-ink").trim() || "#426b9b";
      context!.font = `${cell}px ui-monospace, monospace`;
      context!.textBaseline = "middle";

      for (let y = row / 2; y < height; y += row) {
        const v = y / height;
        for (let x = 0; x < width; x += cell) {
          const u = x / width;
          const phase = u * 6.8 + v * 2.7 + Math.sin(v * 5.2 - time * .16) * .42;
          const fold = Math.sin(phase * 2.5 + Math.sin(u * 3.4) * .45 + time * .08);
          const ridge = Math.exp(-((fold / .38) ** 2));
          const contour = (.5 + .5 * Math.cos(phase * 17 + v * 4)) ** 3;
          const fade = Math.min(1, Math.max(0, (u - .12) * 1.5)) * Math.min(1, Math.max(0, (1.05 - v) * 3));
          const density = (ridge * .78 + contour * .22) * fade;
          if (density < .18) continue;
          context!.globalAlpha = .12 + density * .25;
          context!.fillStyle = ink;
          context!.fillText(glyphs[Math.min(glyphs.length - 1, Math.floor(density * glyphs.length))], x, y);
        }
      }
      context!.globalAlpha = 1;
    }

    function resize() {
      const bounds = canvas!.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      canvas!.width = Math.round(width * ratio);
      canvas!.height = Math.round(height * ratio);
      context!.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw();
    }

    function animate(now: number) {
      frame = 0;
      if (disposed || document.hidden || reducedMotion.matches) return;
      if (now - last >= 80) {
        time += Math.min((now - last) / 1000, .1);
        last = now;
        draw();
      }
      frame = requestAnimationFrame(animate);
    }

    function syncMotion() {
      cancelAnimationFrame(frame);
      frame = 0;
      if (!disposed && !document.hidden && !reducedMotion.matches) {
        last = performance.now();
        frame = requestAnimationFrame(animate);
      } else draw();
    }

    resizeObserver.observe(canvas);
    document.addEventListener("visibilitychange", syncMotion);
    reducedMotion.addEventListener("change", syncMotion);
    resize();
    syncMotion();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", syncMotion);
      reducedMotion.removeEventListener("change", syncMotion);
    };
  }, []);

  return <canvas ref={canvasRef} className="ascii-field" aria-hidden="true" />;
}
