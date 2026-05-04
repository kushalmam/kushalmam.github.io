import { Mail, Github, Linkedin, MapPin } from "lucide-react";
import LiquidGlassButton from "@/components/sections/LiquidGlassButton";

const Contact = () => {
  return (
    <section
      id="contact"
      className="video-bookend video-bookend-end relative py-28 md:py-36"
    >
      <div className="mx-auto max-w-6xl px-6">
        <p className="eyebrow mb-4">Contact</p>
        <h2 className="font-display text-4xl md:text-6xl leading-[1.02] max-w-3xl">
          Let's build something that actually holds up.
        </h2>
        <p className="mt-6 text-muted-foreground max-w-xl leading-relaxed">
          Open to full-time software engineering roles focused on backend systems, ML
          infrastructure, and platform engineering. Email's still the fastest way to reach me.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <LiquidGlassButton href="mailto:km6238@nyu.edu" variant="primary">
            <Mail className="h-4 w-4" /> km6238@nyu.edu
          </LiquidGlassButton>
          <LiquidGlassButton
            href="https://github.com/Techdude01"
            target="_blank"
            rel="noreferrer"
            variant="ghost"
          >
            <Github className="h-4 w-4" /> GitHub
          </LiquidGlassButton>
          <LiquidGlassButton
            href="https://linkedin.com/in/kushal-mamillapalli"
            target="_blank"
            rel="noreferrer"
            variant="ghost"
          >
            <Linkedin className="h-4 w-4" /> LinkedIn
          </LiquidGlassButton>
        </div>

        <div className="mt-12 flex items-center gap-2 text-[13px] text-muted-foreground font-mono">
          <MapPin className="h-3.5 w-3.5" /> Secaucus, NJ · 785-836-0862
        </div>
      </div>

      <footer className="mt-24 border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-wrap items-center justify-between gap-4 text-[13px] text-muted-foreground font-mono">
          <span>© {new Date().getFullYear()} Kushal Mamillapalli</span>
          <span>New York, NY</span>
        </div>
      </footer>
    </section>
  );
};

export default Contact;
