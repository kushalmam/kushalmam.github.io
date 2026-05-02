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
            "radial-gradient(ellipse 60% 55% at 25% 50%, rgba(13,13,20,0.44) 0%, rgba(13,13,20,0.2) 45%, rgba(13,13,20,0) 75%)",
        }}
      />
      <div className="relative z-10 h-full mx-auto max-w-6xl px-6 flex flex-col justify-center">
        <p className="eyebrow mb-5">Software Engineer</p>
        <h1
          className="font-display text-foreground leading-[0.95]"
          style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}
        >
          Kushal Mamillapalli
        </h1>
        <p className="mt-7 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
          I like building low-latency systems. Right now that’s mostly backend work, data plumbing,
          and the occasional ML system that needs to behave in the real world.
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
