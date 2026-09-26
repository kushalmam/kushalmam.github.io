import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import "./text-stream.css";

type Props = { items: string[]; prefix: ReactNode; paused?: boolean; className?: string; onActiveItemChange?: (item: string) => void };

/**
 * Continuous upward loop adapted from ObsidianUI's official Text Stream source:
 * https://www.obsidianui.dev/docs/text-stream
 * The centered mask and per-line focus falloff are tuned for this site's contact title.
 */
export default function TextStream({ items, prefix, paused = false, className = "", onActiveItemChange }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [copyCount, setCopyCount] = useState(1);
  const [inView, setInView] = useState(() => !("IntersectionObserver" in window));
  const [reduceMotion, setReduceMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const activeItemRef = useRef<string>();

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: .08, rootMargin: "80px 0px" });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    const content = contentRef.current;
    const viewport = viewportRef.current;
    if (!track || !content || !viewport || paused || !inView || reduceMotion || !items.length) return;

    const pixelsPerSecond = .38 * 60 * 1.4;
    const metrics = { y: 0, distance: 0, viewportHeight: 0 };
    const start = () => {
      const distance = content.offsetHeight;
      if (!distance || !viewport.offsetHeight) return;
      metrics.distance = distance;
      metrics.viewportHeight = viewport.offsetHeight;
      setCopyCount(Math.max(3, Math.ceil(viewport.offsetHeight / distance) + 2));
      metrics.y = gsap.utils.wrap(-distance, 0, metrics.y);
      gsap.set(track, { y: metrics.y });
    };
    const softenRows = () => {
      // Copies have equal-height rows. Derive the centered item without forcing
      // layout and repainting per-row blur filters on every animation frame.
      const rowHeight = metrics.distance / items.length;
      if (!rowHeight) return;
      const index = Math.floor((metrics.viewportHeight / 2 - metrics.y) / rowHeight);
      const activeItem = items[((index % items.length) + items.length) % items.length];
      if (activeItem && activeItem !== activeItemRef.current) {
        activeItemRef.current = activeItem;
        onActiveItemChange?.(activeItem);
      }
    };
    const tick = (_time: number, deltaTime: number) => {
      if (!metrics.distance || document.hidden) return;
      metrics.y -= pixelsPerSecond * Math.min(deltaTime, 50) / 1000;
      metrics.y = gsap.utils.wrap(-metrics.distance, 0, metrics.y);
      gsap.set(track, { y: metrics.y });
      softenRows();
    };

    start();
    softenRows();
    gsap.ticker.add(tick);
    const resizeObserver = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(start);
    resizeObserver?.observe(content);
    resizeObserver?.observe(viewport);
    window.addEventListener("resize", start);
    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", start);
      gsap.ticker.remove(tick);
    };
  }, [inView, items, onActiveItemChange, paused, reduceMotion]);

  if (!items.length) return null;

  return <div ref={rootRef} className={`text-stream ${className}`}>
    <div className="text-stream__prefix" aria-hidden="true">{prefix}</div>
    <div ref={viewportRef} className="text-stream__viewport" aria-hidden="true">
      <div ref={trackRef} className="text-stream__track">
        {Array.from({ length: reduceMotion ? 1 : copyCount }, (_, copyIndex) => <div key={copyIndex} ref={copyIndex === 0 ? contentRef : null} className="text-stream__copy">
          {items.map((item, index) => <div className="text-stream__item" data-stream-item={item} key={`${copyIndex}-${index}`}>{item}</div>)}
        </div>)}
      </div>
    </div>
  </div>;
}
