import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import "./text-stream.css";

type Props = { items: string[]; prefix: ReactNode; paused?: boolean; className?: string; onActiveItemChange?: (item: string) => void };

/**
 * Scroll-momentum loop adapted from ObsidianUI's official Text Stream source:
 * https://www.obsidianui.dev/docs/text-stream
 * The centered mask and per-line focus falloff are tuned for this site's contact title.
 */
export default function TextStream({ items, prefix, paused = false, className = "", onActiveItemChange }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [copyCount, setCopyCount] = useState(1);
  const [inView, setInView] = useState(false);
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

    const metrics = { y: 0, distance: 0, velocity: .18, targetVelocity: .18, direction: 1 };
    let lastScroll = window.scrollY;
    let timeout = 0;
    const start = () => {
      const distance = content.offsetHeight;
      if (!distance || !viewport.offsetHeight) return;
      metrics.distance = distance;
      setCopyCount(Math.max(3, Math.ceil(viewport.offsetHeight / distance) + 2));
      metrics.y = gsap.utils.wrap(-distance, 0, metrics.y);
      gsap.set(track, { y: metrics.y });
    };
    const softenRows = () => {
      const bounds = viewport.getBoundingClientRect();
      const center = bounds.top + bounds.height / 2;
      const halfHeight = bounds.height / 2;
      let nearestItem: HTMLElement | undefined;
      let nearestDistance = Infinity;
      track.querySelectorAll<HTMLElement>(".text-stream__item").forEach(item => {
        const rect = item.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - center);
        const position = Math.min(1, distance / halfHeight);
        const edge = gsap.utils.clamp(0, 1, (position - .56) / .44);
        const eased = edge * edge * (3 - 2 * edge);
        item.style.opacity = `${1 - eased * .82}`;
        item.style.filter = `blur(${eased * 3.25}px)`;
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestItem = item;
        }
      });
      const activeItem = nearestItem?.dataset.streamItem;
      if (activeItem && activeItem !== activeItemRef.current) {
        activeItemRef.current = activeItem;
        onActiveItemChange?.(activeItem);
      }
    };
    const tick = (_time: number, deltaTime: number) => {
      if (!metrics.distance) return;
      const frameFactor = deltaTime / (1000 / 60);
      metrics.velocity = gsap.utils.interpolate(metrics.velocity, metrics.targetVelocity, .12);
      metrics.y += metrics.velocity * frameFactor;
      metrics.y = gsap.utils.wrap(-metrics.distance, 0, metrics.y);
      gsap.set(track, { y: metrics.y });
      softenRows();
    };
    const applyScrollMotion = (delta: number) => {
      if (!delta) return;
      metrics.direction = delta > 0 ? -1 : 1;
      metrics.targetVelocity = metrics.direction * Math.min(2.4, .18 + Math.pow(Math.abs(delta), 1.2) * .003);
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => { metrics.targetVelocity = metrics.direction * .18; }, 140);
    };
    const onWheel = (event: WheelEvent) => applyScrollMotion(event.deltaY);
    const onScroll = () => {
      const next = window.scrollY;
      applyScrollMotion(next - lastScroll);
      lastScroll = next;
    };

    start();
    softenRows();
    gsap.ticker.add(tick);
    const resizeObserver = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(start);
    resizeObserver?.observe(content);
    resizeObserver?.observe(viewport);
    window.addEventListener("resize", start);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", start);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timeout);
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
