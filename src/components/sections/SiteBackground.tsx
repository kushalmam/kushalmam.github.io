import { useEffect, useState } from "react";

/**
 * Fixed, full-viewport background:
 *  - Spline iframe (desktop) or CSS gradient fallback (mobile)
 *  - Frosted glass overlay: backdrop-blur(12px) saturate(120%) + rgba(13,13,20,0.4)
 *  - Soft radial vignette
 *  - SVG film grain
 * All sit behind page content via negative z-index.
 */
const SiteBackground = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none">
      {/* Layer 0 — Spline / fallback */}
      <div className="fixed inset-0 -z-40">
        {!isMobile ? (
          <>
            <div className="absolute inset-0 mobile-hero-bg" />
            <iframe
              src="https://my.spline.design/gradientbackground-muF6CBRi4cCND8Pm8PbPOhHd/"
              title="Background"
              loading="lazy"
              className="absolute inset-0 w-full h-full"
              style={{ border: 0, pointerEvents: "none" }}
            />
          </>
        ) : (
          <div className="absolute inset-0 mobile-hero-bg" />
        )}
      </div>

      {/* Layer 1 — Frosted glass overlay (blur + saturation + dark tint) */}
      <div
        className="fixed inset-0 -z-30"
        style={{
          backdropFilter: "blur(14px) saturate(115%)",
          WebkitBackdropFilter: "blur(14px) saturate(115%)",
          backgroundColor: "rgba(13, 13, 20, 0.58)",
        }}
      />

      {/* Layer 2 — Radial vignette + top/bottom scrim for text legibility */}
      <div
        className="fixed inset-0 -z-20"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.55) 100%), linear-gradient(180deg, rgba(13,13,20,0.35) 0%, rgba(13,13,20,0) 30%, rgba(13,13,20,0) 70%, rgba(13,13,20,0.35) 100%)",
        }}
      />

      {/* Layer 3 — Film grain */}
      <div className="fixed inset-0 -z-10 grain-layer" />
    </div>
  );
};

export default SiteBackground;
