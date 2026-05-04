import { Github, ExternalLink } from "lucide-react";
import LiquidGlassPane from "@/components/sections/LiquidGlassPane";

type Project = {
  title: string;
  blurb: string;
  tags: string[];
  github?: string;
  demo?: string;
  highlight: string;
};

const projects: Project[] = [
  {
    title: "NBAnomaly",
    highlight: "Gemini 4.5s → Postgres cache 2.5ms",
    blurb:
      "NBA scouting platform surfacing statistical anomalies across 30 seasons. FastAPI service with Isolation Forest scoring and a Postgres cache layer that cut p50 latency from 4.5s to 2.5ms.",
    tags: ["FastAPI", "Postgres", "scikit-learn", "Next.js"],
    github: "https://github.com/Techdude01",
  },
  {
    title: "AutoCPT",
    highlight: "HackNYU 2025 Winner · <500ms",
    blurb:
      "Real-time medical coding assistant: Whisper streams clinician audio, a fine-tuned LLaMA-3 maps phrases to live CPT codes in under 500ms. Built and shipped over a single weekend.",
    tags: ["Whisper", "LLaMA-3", "FastAPI", "WebSockets"],
    github: "https://github.com/Techdude01",
  },
  {
    title: "MarketMind",
    highlight: "Agentic research on Polymarket",
    blurb:
      "An agentic research stack that crawls news, scores it with FinBERT/RoBERTa sentiment, and compares model probabilities to crowd-implied odds on Polymarket to flag mispricings.",
    tags: ["Python", "FinBERT", "RoBERTa", "LangGraph"],
    github: "https://github.com/Techdude01",
  },
];

const Projects = () => {
  return (
    <section id="work" className="relative py-28 md:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 flex items-end justify-between">
          <div>
            <p className="eyebrow mb-4">Selected work</p>
            <h2 className="font-display text-4xl md:text-5xl leading-[1.05]">
              Things I've built recently
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <LiquidGlassPane
              key={p.title}
              as="article"
              interactive
              className="p-6 flex flex-col"
            >
              <p className="eyebrow mb-3 text-primary/80">{p.highlight}</p>
              <h3 className="text-xl font-semibold text-foreground tracking-tight">{p.title}</h3>
              <p className="mt-3 text-[15px] text-muted-foreground leading-relaxed flex-1">
                {p.blurb}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <span key={t} className="pill">
                    {t}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-4 pt-4 border-t border-white/5">
                {p.github && (
                  <a
                    href={p.github}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Github className="h-3.5 w-3.5" /> GitHub
                  </a>
                )}
                {p.demo && (
                  <a
                    href={p.demo}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Live
                  </a>
                )}
              </div>
            </LiquidGlassPane>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
