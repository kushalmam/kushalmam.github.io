import { useEffect, useRef, useState, type PointerEvent } from "react";

const asset = (name: string) => `${import.meta.env.BASE_URL}images/hero/${name}`;

export default function AssemblyVisual() {
  const host = useRef<HTMLElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const element = host.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const sync = () => {
      const allowed = !reduced.matches;
      setEnabled(previous => allowed && (visible || previous));
      setActive(allowed && visible && !document.hidden);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(element);
    reduced.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      reduced.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  const playing = active && !paused && !failed;
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (playing) {
      void element.play().catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setFailed(true);
          setReady(false);
        }
      });
    } else {
      element.pause();
    }
  }, [playing, enabled]);

  const verifyTransparency = () => {
    // Some decoders accept VP9 but discard alpha. Keep the still rather than
    // displaying an opaque rectangle in those browsers.
    const element = video.current;
    if (!element) return;
    const probe = document.createElement("canvas");
    probe.width = probe.height = 1;
    const context = probe.getContext("2d", { willReadFrequently: true });
    if (!context) { setFailed(true); return; }
    try {
      context.drawImage(element, 0, 0, 1, 1, 0, 0, 1, 1);
      if (context.getImageData(0, 0, 1, 1).data[3] !== 0) setFailed(true);
    } catch { setFailed(true); }
  };

  const resetParallax = () => {
    surface.current?.style.setProperty("--pointer-x", "0px");
    surface.current?.style.setProperty("--pointer-y", "0px");
  };
  const move = (event: PointerEvent<HTMLElement>) => {
    if (!playing || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    // At most 2.5px horizontal / 1.5px vertical, settled through CSS damping.
    surface.current?.style.setProperty("--pointer-x", `${((event.clientX - bounds.left) / bounds.width - .5) * 5}px`);
    surface.current?.style.setProperty("--pointer-y", `${((event.clientY - bounds.top) / bounds.height - .5) * 3}px`);
  };

  return (
    <figure ref={host} className="hero-object" data-playing={playing || undefined}
      onPointerMove={move} onPointerLeave={resetParallax}>
      <div className="assembly-parallax" ref={surface}>
        <div className="assembly-drift">
          <picture>
            <source media="(max-width: 600px)" srcSet={asset("assembly-700.webp")} />
            <img src={asset("assembly-1400.webp")} width="1400" height="1400"
              {...{ fetchpriority: "high" }}
              alt="Silver machined shell and clear stacked layers around a lime internal component." />
          </picture>
          {enabled && !failed && <video ref={video} className="assembly-video"
            data-ready={ready || undefined} muted playsInline loop preload="none"
            aria-hidden="true" poster={asset("assembly-700.webp")}
            onLoadedData={verifyTransparency}
            onPlaying={() => setReady(true)}
            onError={() => { setFailed(true); setReady(false); }}>
            <source src={asset("assembly-motion.webm")} type="video/webm" />
          </video>}
        </div>
      </div>
      <figcaption>
        {enabled && !failed && <button type="button" className="assembly-pause"
          onClick={() => { setPaused(value => !value); resetParallax(); }}
          aria-label={paused ? "Play assembly motion" : "Pause assembly motion"}>
          {paused ? "Play motion" : "Pause motion"}
        </button>}
        <span>01 — Assembly</span>
      </figcaption>
    </figure>
  );
}
