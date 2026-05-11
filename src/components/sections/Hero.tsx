import { ArrowRight, Mail } from "lucide-react";
import LiquidGlassButton from "@/components/sections/LiquidGlassButton";

const proofPoints = [
  "Backend systems",
  "Data engineering",
  "ML infrastructure",
];

const Hero = () => {
  return (
    <section
      id="top"
      className="video-bookend video-bookend-start relative w-full"
      style={{ height: "100dvh", minHeight: "640px" }}
    >
      <div className="relative z-10 h-full mx-auto max-w-6xl px-6 flex flex-col justify-center">
        <p className="eyebrow mb-5 hero-reveal">Software Engineer · NYU CS '26</p>
        <h1
          className="font-display text-foreground leading-[0.95] hero-reveal hero-reveal-delay-1"
          style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}
        >
          Kushal Mamillapalli
        </h1>
        <p className="mt-7 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed hero-reveal hero-reveal-delay-2">
          I build fast, reliable software for data-heavy products: low-latency APIs,
          production ETL, and ML systems that need to behave outside the notebook.
        </p>

        <ul className="mt-6 flex max-w-2xl flex-wrap gap-2.5 hero-reveal hero-reveal-delay-3">
          {proofPoints.map((point) => (
            <li key={point} className="hero-proof-pill">
              {point}
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap gap-3 hero-reveal hero-reveal-delay-4">
          <LiquidGlassButton href="#work" variant="primary">
            View my work <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </LiquidGlassButton>
          <LiquidGlassButton href="#contact" variant="ghost">
            <Mail className="h-4 w-4" aria-hidden="true" /> Get in touch
          </LiquidGlassButton>
        </div>
      </div>
    </section>
  );
};

export default Hero;
