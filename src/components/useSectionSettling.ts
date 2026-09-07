import { useEffect } from "react";

/** A small forward nudge after downward scrolling stops near a section boundary. */
export default function useSectionSettling() {
  useEffect(() => {
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let lastY = window.scrollY;
    let direction = 0;
    let idle = 0;
    let frame = 0;
    let animating = false;
    let touching = false;
    let userScrolling = false;

    const stop = () => {
      clearTimeout(idle);
      cancelAnimationFrame(frame);
      animating = false;
    };
    const settle = () => {
      if (
        !userScrolling ||
        direction <= 0 ||
        touching ||
        reducedMotion.matches ||
        document.querySelector("header details[open]")
      )
        return;
      const offset =
        parseFloat(
          getComputedStyle(document.documentElement).scrollPaddingTop,
        ) || 66;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const targets = [
        ...document.querySelectorAll<HTMLElement>(
          "main > section:not(#top), .experience, .project",
        ),
      ]
        .map((element) =>
          Math.min(max, element.getBoundingClientRect().top + y - offset),
        )
        .filter((target) => target > y + 2 && target - y <= 72)
        .sort((a, b) => a - b);
      const target = targets[0];
      if (target === undefined) return;
      userScrolling = false;
      animating = true;
      const started = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - started) / 200, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        window.scrollTo({ top: y + (target - y) * eased, behavior: "instant" });
        if (progress < 1) frame = requestAnimationFrame(tick);
        else {
          animating = false;
          lastY = window.scrollY;
        }
      };
      frame = requestAnimationFrame(tick);
    };
    const onScroll = () => {
      const y = window.scrollY;
      if (animating) {
        lastY = y;
        return;
      }
      if (Math.abs(y - lastY) > 0.5) direction = Math.sign(y - lastY);
      lastY = y;
      clearTimeout(idle);
      if (userScrolling && direction > 0) idle = window.setTimeout(settle, 160);
    };
    const onWheel = (event: WheelEvent) => {
      stop();
      direction = Math.sign(event.deltaY);
      userScrolling = direction > 0;
    };
    const onTouchStart = () => {
      stop();
      touching = true;
      userScrolling = true;
    };
    const onTouchEnd = () => {
      touching = false;
      if (direction > 0) idle = window.setTimeout(settle, 180);
    };
    const onKey = (event: KeyboardEvent) => {
      stop();
      // Keyboard navigation stays entirely native.
      userScrolling = false;
      if (
        ["ArrowUp", "PageUp", "Home"].includes(event.key) ||
        (event.key === " " && event.shiftKey)
      )
        direction = -1;
    };
    const onPointer = () => {
      stop();
      userScrolling = false;
    };
    const onHash = () => {
      stop();
      userScrolling = false;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("hashchange", onHash);
    reducedMotion.addEventListener("change", stop);
    return () => {
      stop();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("hashchange", onHash);
      reducedMotion.removeEventListener("change", stop);
    };
  }, []);
}
