import { useEffect, useRef } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

export default function useSmoothScrolling() {
  const controller = useRef<Lenis | null>(null);
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.14,
      smoothWheel: true,
      syncTouch: false,
      anchors: { duration: 0.75, easing: (t) => 1 - Math.pow(1 - t, 3) },
      respectReducedMotion: true,
      stopInertiaOnNavigate: true,
    });
    controller.current = lenis;
    return () => {
      controller.current = null;
      lenis.destroy();
    };
  }, []);
  return controller;
}
