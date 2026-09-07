import { useEffect, useRef } from "react";
import { ArrowUpRight, ArrowDown, ArrowUp } from "lucide-react";

import HeroField from "./HeroField";
import SiteHeader from "./SiteHeader";
import ProjectPreview from "./ProjectPreview";

const projects = [
  {
    name: "NBAnomaly",
    detail: "Find the players whose performance deserves a closer look.",
    stack: "FastAPI / PostgreSQL / AWS / Gemini",
    github: "NBAnomaly",
    theme: "basketball",
    approach:
      "Historical game data feeds an anomaly model, then a generated report explains the result.",
  },
  {
    name: "AutoCPT",
    detail:
      "Turn a clinical conversation into suggested billing codes, with the clinician in control.",
    stack: "Flask / Whisper / LLaMA-3 / React",
    github: "AutoCPT",
    devpost: "autocpt",
    theme: "healthcare",
    approach:
      "Audio transcription flows into code suggestions, with an audit trail for review.",
  },
  {
    name: "MarketMind",
    detail: "Investigate where the market and the news tell different stories.",
    stack: "Next.js / Flask / PostgreSQL / NLP",
    github: "MarketMind-yHack26",
    devpost: "marketmind-5iychz",
    theme: "markets",
    approach:
      "A shared research view puts news sentiment beside crowd-implied probabilities.",
  },
];

export default function EditorialPortfolio() {
  const pageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const elements =
      pageRef.current?.querySelectorAll<HTMLElement>("[data-reveal]");
    if (
      !elements ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    elements.forEach((element) => {
      element.classList.add("will-reveal");
      observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={pageRef}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">
        <section
          className="hero page-gutter"
          id="top"
          aria-labelledby="hero-title"
        >
          <HeroField />
          <div className="hero-kicker">
            <span className="label">Backend & data systems engineer</span>
          </div>
          <div className="hero-display">
            <h1 id="hero-title">
              <span className="title-line">Behind the</span>
              <span className="title-line">interface.</span>
            </h1>
            <p className="hero-signature">
              Data, systems & a little curiosity.
            </p>
          </div>
          <div className="hero-bottom">
            <a className="scroll-link label" href="#about">
              <span className="round-arrow">
                <ArrowDown size={20} />
              </span>
              Scroll to explore
            </a>
          </div>
        </section>

        <section
          className="about page-gutter"
          id="about"
          aria-labelledby="about-title"
        >
          <h2 id="about-title" className="about-title" data-reveal>
            About me
          </h2>
          <div className="about-grid">
            <figure className="portrait" data-reveal>
              <img
                src="/images/IMG_3406.jpeg"
                alt="Kushal Mamillapalli outdoors"
                loading="lazy"
                width="600"
                height="750"
              />
            </figure>
            <div className="about-copy" data-reveal>
              <p className="about-lead">
                I like figuring out what happens behind the interface.
              </p>
              <p>
                I’m a 2026 Computer Science graduate from NYU Tandon, currently
                learning how large-scale data systems stay reliable in practice
                as a Data Engineering Intern at Spotify.
              </p>
              <p>
                My work has ranged from university data pipelines to computer
                vision for competition robots. I enjoy getting a system working,
                understanding where it breaks, and making it more reliable.
              </p>
            </div>
          </div>
          <div className="experience" data-reveal>
            <h3 className="experience-heading">Experience</h3>
            <div className="experience-rows">
              <article>
                <img
                  className="org-logo org-logo--spotify"
                  src="/images/logos/spotify.svg"
                  alt=""
                  width="48"
                  height="48"
                  loading="lazy"
                />
                <div>
                  <h4>Spotify</h4>
                  <p>Data Engineering Intern</p>
                  <p className="experience-detail">
                    Learning how large-scale data systems stay reliable in
                    production.
                  </p>
                </div>
                <span className="label">PZN</span>
              </article>
              <article>
                <img
                  className="org-logo org-logo--nyu"
                  src="/images/logos/nyu.svg"
                  alt=""
                  width="48"
                  height="48"
                  loading="lazy"
                />
                <div>
                  <h4>NYU Enterprise Data Management</h4>
                  <p>Analytics & data infrastructure</p>
                  <p className="experience-detail">
                    Optimized 100GB+ pipelines. Reduced ETL runtime by 40% and
                    storage by 73%.
                  </p>
                </div>
              </article>
              <article>
                <img
                  className="org-logo org-logo--arc"
                  src="/images/logos/arc.webp"
                  alt=""
                  width="48"
                  height="48"
                  loading="lazy"
                />
                <div>
                  <h4>ARC Robotics: Team Ultraviolet</h4>
                  <p>Computer vision & robotics</p>
                  <p className="experience-detail">
                    Brought autonomous-targeting latency from 40ms to 12ms with
                    YOLOv8 and TensorRT.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="work page-gutter" id="work" aria-label="Projects">
          {projects.map((project) => (
            <article
              className={`project project--${project.theme}`}
              key={project.name}
            >
              <div className="project-info" data-reveal>
                <div className="project-summary">
                  <h2>{project.name}</h2>
                  <p className="project-purpose">{project.detail}</p>
                  <p className="project-approach">{project.approach}</p>
                  <span className="stack">{project.stack}</span>
                  <div className="project-links">
                    <a
                      href={`https://github.com/Techdude01/${project.github}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View project <ArrowUpRight size={16} />
                    </a>
                    {project.devpost && (
                      <a
                        href={`https://devpost.com/software/${project.devpost}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Devpost <ArrowUpRight size={16} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <ProjectPreview theme={project.theme} name={project.name} />
            </article>
          ))}
        </section>

        <section
          className="contact page-gutter"
          id="contact"
          aria-labelledby="contact-title"
        >
          <div data-reveal>
            <h2 id="contact-title">Get in touch.</h2>
            <a className="email-link" href="mailto:kushalmam06@gmail.com">
              kushalmam06@gmail.com <ArrowUpRight />
            </a>
          </div>
          <div className="contact-bottom">
            <p>For work or a conversation, email me.</p>
            <div className="social-links">
              <a
                href="/documents/kushal-mamillapalli-resume.pdf"
                target="_blank"
                rel="noreferrer"
              >
                Résumé{" "}
                <span>
                  PDF <ArrowUpRight size={17} />
                </span>
              </a>
              <a
                href="https://linkedin.com/in/kushal-mamillapalli"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn <ArrowUpRight size={17} />
              </a>
              <a
                href="https://github.com/Techdude01"
                target="_blank"
                rel="noreferrer"
              >
                GitHub <ArrowUpRight size={17} />
              </a>
            </div>
          </div>
        </section>
      </main>
      <footer className="page-gutter">
        <span>© {new Date().getFullYear()} Kushal Mamillapalli</span>
        <a href="#top">
          Back to top <ArrowUp size={15} />
        </a>
      </footer>
    </div>
  );
}
