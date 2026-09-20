import { useEffect, useRef, type RefObject } from "react";

type Cell = {
  x: number;
  y: number;
  top: boolean;
  left: boolean;
  right: boolean;
  bottom: boolean;
  lift: number;
};

type Props = { targetRef: RefObject<HTMLElement | null> };

const lerp = (start: number, end: number, amount: number) => start + (end - start) * amount;

/**
 * Grid Lift interaction adapted from ObsidianUI's official source:
 * https://www.obsidianui.dev/docs/grid-lift
 * The text mask and raised-cell projection are retained, scoped to the existing wordmark.
 */
export default function GridLift({ targetRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const target = targetRef.current;
    if (!canvas || !target || !("CanvasRenderingContext2D" in window)) return;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const mask = document.createElement("canvas");
    const maskCtx = mask.getContext("2d", { willReadFrequently: true });
    if (!maskCtx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const spacing = 20;
    const hoverRadius = 210;
    const interactionRange = 130;
    const liftHeight = 20;
    const liftRotation = -72 * Math.PI / 180;
    const cells: Cell[] = [];
    let width = 1;
    let height = 1;
    let dpr = 1;
    let pixels = new Uint8ClampedArray();
    let pixelWidth = 1;
    let pointer = { x: -9999, y: -9999, active: false, nearText: false };
    let frame = 0;
    let ready = false;
    let disposed = false;

    const insideMask = (x: number, y: number) => {
      const px = Math.round(x * dpr);
      const py = Math.round(y * dpr);
      if (px < 0 || py < 0 || px >= pixelWidth || py * pixelWidth * 4 >= pixels.length) return false;
      return pixels[(py * pixelWidth + px) * 4 + 3] > 20;
    };

    const resize = () => {
      const rect = target.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      mask.width = canvas.width;
      mask.height = canvas.height;
      pixelWidth = mask.width;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      maskCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      maskCtx.clearRect(0, 0, width, height);

      const computed = getComputedStyle(target.querySelector<HTMLElement>(".name-layer--plain") ?? target);
      const fontSize = Number.parseFloat(computed.fontSize) || 100;
      maskCtx.font = `${computed.fontStyle} ${computed.fontWeight} ${fontSize}px ${computed.fontFamily}`;
      maskCtx.textBaseline = "alphabetic";
      if ("letterSpacing" in maskCtx) maskCtx.letterSpacing = computed.letterSpacing;
      const targetRect = target.getBoundingClientRect();
      target.querySelectorAll<HTMLElement>(".name-word").forEach(line => {
        const lineRect = line.getBoundingClientRect();
        const word = line.querySelector<HTMLElement>(".name-layer--plain");
        if (!word) return;
        const text = word.textContent?.trim() ?? "";
        const baseline = lineRect.bottom - targetRect.top - fontSize * .16;
        maskCtx.fillStyle = "#fff";
        maskCtx.fillText(text, lineRect.left - targetRect.left, baseline);
      });

      pixels = maskCtx.getImageData(0, 0, mask.width, mask.height).data;
      cells.length = 0;
      for (let x = 0; x < width; x += spacing) {
        for (let y = 0; y < height; y += spacing) {
          const cx = x + spacing / 2;
          const cy = y + spacing / 2;
          if (!insideMask(cx, cy)) continue;
          cells.push({
            x, y, lift: 0,
            top: insideMask(cx, y),
            left: insideMask(x, cy),
            right: insideMask(x + spacing, cy),
            bottom: insideMask(cx, y + spacing),
          });
        }
      }
      draw();
      ready = true;
      canvas.dataset.ready = "true";
    };

    const drawEdges = (cell: Cell, ox: number, oy: number, alpha: number, lineWidth: number, color: string) => {
      const x1 = cell.x + ox, y1 = cell.y + oy;
      const x2 = cell.x + spacing + ox, y2 = cell.y + spacing + oy;
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      if (cell.top) { ctx.moveTo(x1, y1); ctx.lineTo(x2, y1); }
      if (cell.left) { ctx.moveTo(x1, y1); ctx.lineTo(x1, y2); }
      if (cell.right) { ctx.moveTo(x2, y1); ctx.lineTo(x2, y2); }
      if (cell.bottom) { ctx.moveTo(x1, y2); ctx.lineTo(x2, y2); }
      ctx.stroke();
    };

    const draw = () => {
      if (disposed) return;
      ctx.clearRect(0, 0, width, height);
      const style = getComputedStyle(document.documentElement);
      const gridColor = style.getPropertyValue("--line").trim() || "#d2d8cd";
      const liftColor = style.getPropertyValue("--mint").trim() || "#a4ffcb";
      ctx.save();
      ctx.globalAlpha = .28;
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = .75;
      ctx.beginPath();
      for (let x = 0; x <= width; x += spacing) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
      for (let y = 0; y <= height; y += spacing) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
      ctx.stroke();
      ctx.restore();

      let moving = false;
      const nearest = pointer.nearText ? cells.reduce((distance, cell) => {
        const dx = cell.x + spacing / 2 - pointer.x;
        const dy = cell.y + spacing / 2 - pointer.y;
        return Math.min(distance, Math.hypot(dx, dy));
      }, Infinity) : Infinity;
      const canLift = !reducedMotion.matches && pointer.active && nearest <= interactionRange;
      for (const cell of cells) {
        const cx = cell.x + spacing / 2, cy = cell.y + spacing / 2;
        const distance = canLift ? Math.hypot(cx - pointer.x, cy - pointer.y) : Infinity;
        const influence = distance < hoverRadius ? Math.pow(1 - distance / hoverRadius, 1.6) : 0;
        const next = reducedMotion.matches ? 0 : lerp(cell.lift, influence, .12);
        cell.lift = next < .001 ? 0 : next;
        if (cell.lift <= .001) continue;
        moving ||= Math.abs(cell.lift - influence) > .01;
        const ox = Math.cos(liftRotation) * liftHeight * cell.lift;
        const oy = Math.sin(liftRotation) * liftHeight * cell.lift;
        for (let step = 1; step <= 12; step++) {
          const part = step / 12;
          drawEdges(cell, ox * part, oy * part, .12 * cell.lift * part, .65, liftColor);
        }
        ctx.globalAlpha = .3 * cell.lift;
        ctx.strokeStyle = liftColor;
        ctx.lineWidth = .7;
        ctx.beginPath();
        for (const [ex, ey] of [[cell.x, cell.y], [cell.x + spacing, cell.y], [cell.x, cell.y + spacing], [cell.x + spacing, cell.y + spacing]]) {
          ctx.moveTo(ex, ey);
          ctx.lineTo(ex + ox, ey + oy);
        }
        ctx.stroke();
        drawEdges(cell, ox, oy, .48 * cell.lift, .9, liftColor);
      }
      if (moving) frame = requestAnimationFrame(animate);
      else frame = 0;
    };

    const animate = () => {
      frame = 0;
      draw();
    };
    const schedule = () => {
      if (!ready) return;
      if (!frame) frame = requestAnimationFrame(animate);
    };
    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top, active: true, nearText: false };
      pointer.nearText = cells.some(cell => Math.hypot(cell.x + spacing / 2 - pointer.x, cell.y + spacing / 2 - pointer.y) <= interactionRange);
      schedule();
    };
    const onPointerLeave = () => {
      pointer.active = false;
      pointer.nearText = false;
      schedule();
    };
    const onMotionChange = () => schedule();
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(() => {
      if (document.fonts.status === "loaded") resize();
    });
    observer?.observe(target);
    const themeObserver = new MutationObserver(schedule);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);
    reducedMotion.addEventListener("change", onMotionChange);
    document.fonts.ready.then(async () => {
      const entranceAnimations = [...target.querySelectorAll<HTMLElement>(".name-word")]
        .flatMap(word => word.getAnimations().map(animation => animation.finished));
      await Promise.allSettled(entranceAnimations);
      if (!disposed) resize();
    });

    return () => {
      disposed = true;
      observer?.disconnect();
      themeObserver.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      reducedMotion.removeEventListener("change", onMotionChange);
      cancelAnimationFrame(frame);
    };
  }, [targetRef]);

  return <canvas ref={canvasRef} className="grid-lift" aria-hidden="true" />;
}
