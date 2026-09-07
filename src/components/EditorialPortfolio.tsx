import { useEffect, useRef } from "react";
import { ArrowUpRight, ArrowDown, ArrowUp } from "lucide-react";

import HeroField from "./HeroField";
import SiteHeader from "./SiteHeader";
import useSectionSettling from "./useSectionSettling";
import useSmoothScrolling from "./useSmoothScrolling";
import ProjectPreview from "./ProjectPreview";

const projects = [
  {
    name: "Rekindle",
    detail: "Retrieve and rank products from a history of reviews.",
    stack: "DuckDB / PyTorch / FAISS / LightGBM",
    github: "rekindle",
    theme: "recommender",
    caseStudy: [
      {
        title: "Constraint",
        text: "An 18 GB M3 Pro shaped the pipeline: prepare data with DuckDB on disk and evaluate chronologically without leaking future events.",
      },
      {
        title: "Decision",
        text: "Full-catalog evaluation exposed weak neural retrieval, so I combined it with popularity and item-item filtering before reranking. HNSW was faster but retained only 88.7% of exact candidates; exact FAISS stayed the default for the 55.9k-item catalog.",
      },
      {
        title: "Evidence",
        text: "The project report records NDCG@10 of 0.0104 versus 0.0071 for the strongest baseline on 29,416 eligible warm test events. Models were frozen before chronological replay, with 2,000 paired bootstrap resamples. This measures offline next-review ranking, not online engagement.",
      },
    ],
    sources: [
      {
        label: "Read the Rekindle experiment report",
        href: "https://github.com/Techdude01/rekindle/blob/main/docs/rekindle-report.md",
      },
      {
        label: "View Rekindle on GitHub",
        href: "https://github.com/Techdude01/rekindle",
      },
    ],
  },
  {
    name: "AutoCPT",
    detail: "Explore speech-to-CPT assistance for clinical billing.",
    stack: "Flask / Groq / React / Expo",
    github: "AutoCPT",
    devpost: "autocpt",
    theme: "healthcare",
    caseStudy: [
      {
        title: "Constraint",
        text: "A HackNYU prototype needed to move from live speech to CPT suggestions and a demo billing flow quickly.",
      },
      {
        title: "Decision",
        text: "Use Flask and WebSockets for the transcript loop, Groq for CPT extraction, React and Expo clients, and Capital One’s sandbox for demo billing.",
      },
      {
        title: "Evidence",
        text: "Our team won HackNYU 2025’s Best Use of AI powered by Reach Capital. I worked on fracture detection and the TypeScript frontend. The result was a hackathon demo using a billing sandbox, without a clinical accuracy study.",
      },
    ],
    sources: [
      {
        label: "View AutoCPT on GitHub",
        href: "https://github.com/Techdude01/AutoCPT",
      },
      {
        label: "See AutoCPT’s award and team roles",
        href: "https://devpost.com/software/autocpt",
      },
    ],
  },
  {
    name: "MarketMind",
    detail: "Investigate where the market and the news tell different stories.",
    stack: "Next.js / Flask / PostgreSQL / K2 + Tavily",
    github: "MarketMind-yHack26",
    devpost: "marketmind-5iychz",
    theme: "markets",
    caseStudy: [
      {
        title: "Constraint",
        text: "A hackathon research workflow had to connect live prediction-market context with current external evidence and a usable analysis view.",
      },
      {
        title: "Decision",
        text: "Use a K2/Tavily research agent behind Flask, persist structured market and thesis data in PostgreSQL, and derive a sentiment-divergence signal for the frontend.",
      },
      {
        title: "Evidence",
        text: "Our team connected evidence gathering, saved research, and sentiment analysis in one prototype. The repository includes signal tests and an evaluation harness; the six committed example outputs demonstrate the flow, rather than measured trading performance.",
      },
    ],
    sources: [
      {
        label: "View MarketMind on GitHub",
        href: "https://github.com/Techdude01/MarketMind-yHack26",
      },
      {
        label: "Read the MarketMind build plan",
        href: "https://github.com/Techdude01/MarketMind-yHack26/blob/main/plan.md",
      },
    ],
  },
];

export default function EditorialPortfolio() {
  const scrollController = useSmoothScrolling();
  useSectionSettling(scrollController);
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
      {/* tabindex makes the skip link actually move focus past the header
          controls; <main> is not focusable on its own. */}
      <main id="main" tabIndex={-1}>
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
              {/* The space keeps textContent readable for consumers that
                  ignore the line break, such as SEO and share-preview tools. */}
              <span className="title-line">Behind the</span>{" "}
              <span className="title-line">interface.</span>
            </h1>
            <p className="hero-signature">
              I build data pipelines, backend services, and ML systems that
              turn raw data into useful decisions.
            </p>
          </div>
          <div className="hero-bottom">
            <a className="scroll-link label" href="#work">
              <span className="round-arrow">
                <ArrowDown size={20} />
              </span>
              View selected work
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
                I’m a 2026 Computer Science graduate from NYU Tandon and a
                Data Engineer (Emerging Talent) at Spotify, improving
                personalization data pipelines.
              </p>
              <p>
                My work has ranged from university data pipelines to computer
                vision for competition robots. I enjoy getting a system working,
                understanding where it breaks, and making it more reliable.
              </p>
            </div>
          </div>
          <div className="experience">
            <h3 className="experience-heading">Experience</h3>
            <div className="experience-rows">
              <article className="experience--spotify">
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
                  <p>Data Engineer (Emerging Talent) · Sep 2026–Present</p>
                  <p className="experience-detail">
                    Improving personalization data pipelines.
                  </p>
                  <p>Data Engineering Intern · Jun–Aug 2026</p>
                </div>
                <span className="experience-period">Jun 2026–Present</span>
              </article>
              <article className="experience--nyu">
                <img
                  className="org-logo org-logo--nyu"
                  src="/images/logos/nyu.svg"
                  alt=""
                  width="48"
                  height="48"
                  loading="lazy"
                />
                <div>
                  <h4>NYU</h4>
                  <p>SWE / Technical Intern</p>
                  <p className="experience-detail">
                    Modernized university student financial reporting ETL.
                  </p>
                </div>
                <span className="experience-period">Apr 2025–Aug 2026</span>
              </article>
              <article className="experience--arc">
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
                  <p>Computer Vision Lead · Jan 2025–Jul 2026</p>
                  <p className="experience-detail">
                    Built computer vision pipelines that accelerated inference
                    with CUDA and DeepStream.
                  </p>
                  <p>Computer Vision / DevOps Engineer · Jan–Dec 2024</p>
                </div>
                <span className="experience-period">Jan 2024–Jul 2026</span>
              </article>
              <article className="experience--nyu">
                <img
                  className="org-logo org-logo--nyu"
                  src="/images/logos/nyu.svg"
                  alt=""
                  width="48"
                  height="48"
                  loading="lazy"
                />
                <div>
                  <h4>NYU Tandon</h4>
                  <p>Computer Vision Research Intern</p>
                  <p className="experience-detail">
                    Optimized 3D penguin biological motion tracking.
                  </p>
                </div>
                <span className="experience-period">Jun–Aug 2024</span>
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
              <div className="project-info">
                <div className="project-summary">
                  <h2>{project.name}</h2>
                  <p className="project-purpose">{project.detail}</p>
                  <span className="stack">{project.stack}</span>
                  <div className="case-study">
                    {project.caseStudy.map((section) => (
                      <div key={section.title}>
                        <h3>{section.title}</h3>
                        <p>{section.text}</p>
                      </div>
                    ))}
                  </div>
                  <div className="project-links">
                    {project.sources.map((source) => (
                      <a
                        href={source.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        key={source.href}
                      >
                        {source.label} <ArrowUpRight size={16} />
                      </a>
                    ))}
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
                rel="noopener noreferrer"
              >
                Résumé{" "}
                <span>
                  PDF <ArrowUpRight size={17} />
                </span>
              </a>
              <a
                href="https://linkedin.com/in/kushal-mamillapalli"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn <ArrowUpRight size={17} />
              </a>
              <a
                href="https://github.com/Techdude01"
                target="_blank"
                rel="noopener noreferrer"
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
