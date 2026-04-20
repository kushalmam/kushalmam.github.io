import { Mail, Github, Linkedin, MapPin } from "lucide-react";

const Contact = () => {
  return (
    <section id="contact" className="relative py-28 md:py-36 border-t border-white/5">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-xs uppercase tracking-[0.2em] text-primary/90 mb-3">Contact</p>
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight max-w-3xl">
          Let's build something fast and useful.
        </h2>
        <p className="mt-5 text-muted-foreground max-w-xl">
          Open to summer 2026 internships in backend, ML infra, or quant dev. The fastest way to
          reach me is email.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href="mailto:km6238@nyu.edu"
            className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-3 text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            <Mail className="h-4 w-4" /> km6238@nyu.edu
          </a>
          <a
            href="https://github.com/Techdude01"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm text-foreground hover:bg-white/5 transition-colors"
          >
            <Github className="h-4 w-4" /> GitHub
          </a>
          <a
            href="https://linkedin.com/in/kushal-mamillapalli"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm text-foreground hover:bg-white/5 transition-colors"
          >
            <Linkedin className="h-4 w-4" /> LinkedIn
          </a>
        </div>

        <div className="mt-12 flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> Secaucus, NJ · 785-836-0862
        </div>
      </div>

      <footer className="mt-24 border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Kushal Mamillapalli</span>
          <span>Built with React, Tailwind & Spline.</span>
        </div>
      </footer>
    </section>
  );
};

export default Contact;
