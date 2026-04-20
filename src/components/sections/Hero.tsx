import { ArrowRight, Mail } from "lucide-react";

const Hero = () => {
  return (
    <section
      id="top"
      className="relative w-full"
      style={{ height: "100dvh", minHeight: "640px" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 55% at 25% 50%, rgba(13,13,20,0.55) 0%, rgba(13,13,20,0.25) 45%, rgba(13,13,20,0) 75%)",
        }}
      />
      <div className="relative z-10 h-full mx-auto max-w-6xl px-6 flex flex-col justify-center">
        <p className="eyebrow mb-5">Backend &amp; ML Engineer</p>
        <h1
          className="font-display text-foreground leading-[0.95]"
          style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}
        >
          Kushal Mamillapalli
        </h1>
        <p className="mt-7 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
          I build low-latency backends and ML pipelines — from 100GB ETL systems at NYU to
          real-time autonomous targeting on RoboMaster.
        </p>
        <p className="mt-2 text-sm text-muted-foreground/80">
          CS @ NYU · BS '26 · MS Financial Engineering '27
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <a href="#work" className="btn-primary">
            View my work <ArrowRight className="h-4 w-4" />
          </a>
          <a href="#contact" className="btn-ghost">
            <Mail className="h-4 w-4" /> Get in touch
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
