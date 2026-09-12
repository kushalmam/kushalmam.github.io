import { useEffect, useRef, useState } from "react";
import type { createSystemScene } from "../scene/createSystemScene";

export default function SystemsScene() {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<ReturnType<typeof createSystemScene>>();
  const [focus, setFocus] = useState({ section: 0, selectedProject: null as number | null });
  const focusRef = useRef(focus);
  useEffect(() => {
    let disposed = false;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const anchor = window.innerHeight * 0.45;
      let section = 0;
      document.querySelectorAll<HTMLElement>("[data-depth]").forEach((element) => {
        if (element.getBoundingClientRect().top <= anchor) section = Number(element.dataset.depth);
      });
      let selectedProject: number | null = null;
      if (section === 2) {
        document.querySelectorAll<HTMLElement>("[data-project-index]").forEach((element) => {
          if (element.getBoundingClientRect().top <= anchor) selectedProject = Number(element.dataset.projectIndex);
        });
      }
      if (section !== focusRef.current.section || selectedProject !== focusRef.current.selectedProject) {
        focusRef.current = { section, selectedProject };
        setFocus(focusRef.current);
        scene.current?.focus(section, selectedProject);
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const resize = new ResizeObserver(schedule);
    resize.observe(document.body);
    measure();
    // Delay the optional GPU layer until its host enters the viewport.
    const initialize = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      initialize.disconnect();
      void import("../scene/createSystemScene")
        .then(({ createSystemScene }) => {
          if (disposed || !host.current) return;
          scene.current = createSystemScene(host.current);
          scene.current.focus(
            focusRef.current.section,
            focusRef.current.section === 2
              ? focusRef.current.selectedProject
              : null,
          );
        })
        .catch(() => {
          /* The static systems drawing remains if WebGL is unavailable. */
        });
    });
    if (host.current) initialize.observe(host.current);
    return () => {
      disposed = true;
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      resize.disconnect();
      cancelAnimationFrame(frame);
      initialize.disconnect();
      scene.current?.dispose();
      scene.current = undefined;
    };
  }, []);
  return (
    <div className="strata-field" data-section={focus.section} data-project={focus.selectedProject ?? undefined} aria-hidden="true">
      <div className="systems-canvas" ref={host}>
        <svg
          className="scene-fallback"
          viewBox="0 0 1400 900"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          {[4, 3, 2, 1, 0].map((layer) => (
            <g key={layer} transform={`translate(${layer * 12},${layer * 38})`}>
              <path
                d="M230 455C470 230 510 625 800 350S1190 395 1550 120L1530 405C1110 680 1050 440 800 660S470 535 230 455Z"
                fill="var(--strata-fill)"
                stroke="var(--strata-line)"
              />
              {[0, 1, 2, 3].map((line) => (
                <path
                  key={line}
                  d={`M${280 + line * 30} ${450 + line * 8}C550 ${300 + line * 55} 560 ${640 + line * 30} 810 ${380 + line * 48}S1210 ${450 + line * 20} 1530 ${180 + line * 50}`}
                  stroke={
                    layer === 0 && line === 2
                      ? "var(--accent)"
                      : "var(--strata-line)"
                  }
                />
              ))}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
