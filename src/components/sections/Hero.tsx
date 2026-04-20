import { ArrowRight, Mail } from "lucide-react";

const Hero = () => {
  return (
    <section
      id="top"
      className="relative w-full"
      style={{ height: "100dvh", minHeight: "640px" }}
    >
      <div className="relative z-10 h-full mx-auto max-w-6xl px-6 flex flex-col justify-center">
        <p className="text-xs uppercase tracking-[0.2em] text-primary/90 mb-4">
          Backend & ML Engineer
        </p>
        <h1
          className="font-semibold tracking-tight text-foreground leading-[0.95]"
          style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
        >
          Kushal Mamillapalli
        </h1>
        <p className="mt-6 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
          I build low-latency backends and ML pipelines — from 100GB ETL systems at NYU to
          real-time autonomous targeting on RoboMaster.
        </p>
        <p className="mt-2 text-sm text-muted-foreground/80">
          CS @ NYU · BS '26 · MS Financial Engineering '27
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href="#work"
            className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-3 text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            View my work <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-foreground hover:bg-white/5 transition-colors"
          >
            <Mail className="h-4 w-4" /> Get in touch
          </a>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-xs uppercase tracking-[0.2em] text-muted-foreground/60">
        Scroll
      </div>
    </section>
  );
};

export default Hero;
