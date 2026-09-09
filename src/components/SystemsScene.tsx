import { useEffect, useRef, useState } from "react";
import type { createSystemScene } from "../scene/createSystemScene";

export default function SystemsScene({
  selectedProject,
}: {
  selectedProject: number | null;
}) {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<ReturnType<typeof createSystemScene>>();
  const [section, setSection] = useState(0);
  const focusRef = useRef({ section, selectedProject });
  useEffect(() => {
    focusRef.current = { section, selectedProject };
    scene.current?.focus(section, section === 2 ? selectedProject : null);
  }, [section, selectedProject]);
  useEffect(() => {
    let disposed = false;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting)
            setSection(Number((entry.target as HTMLElement).dataset.depth));
      },
      { rootMargin: "-15% 0px -55% 0px" },
    );
    document
      .querySelectorAll("[data-depth]")
      .forEach((element) => observer.observe(element));
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
      observer.disconnect();
      initialize.disconnect();
      scene.current?.dispose();
      scene.current = undefined;
    };
  }, []);
  return (
    <div className="strata-field" data-section={section} aria-hidden="true">
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
