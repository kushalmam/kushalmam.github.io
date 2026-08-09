import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Download,
  Github,
  Linkedin,
  Mail,
  Moon,
  SunMedium,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import WatercolorBackground from "../components/WatercolorBackground.tsx";

const navItems = [
  { to: "/", label: "About", number: "01" },
  { to: "/projects", label: "Projects", number: "02" },
  { to: "/resume", label: "Resume", number: "03" },
  { to: "/contact", label: "Contact", number: "04" },
];

type ProjectPreviewKind = "recommendation" | "health" | "market" | "sports" | "clinical" | "pricing";

type Project = {
  name: string;
  period: string;
  category: string;
  outcome: string;
  description: string;
  href: string;
  preview: ProjectPreviewKind;
  previewTitle: string;
  previewMetrics: [string, string, string];
  previewImage?: string;
};

const projects: Project[] = [
  {
    name: "Rekindle",
    period: "Jul. 2026",
    category: "Recommendation systems",
    outcome: "Time-safe retrieval + ranking",
    description: "A history-aware product discovery system for Amazon Electronics, built around time-safe evaluation, implicit feedback, and a two-stage retrieval and ranking pipeline.",
    href: "https://github.com/Techdude01/rekindle",
    preview: "recommendation",
    previewTitle: "Recall → rank",
    previewMetrics: ["Replay", "Signals", "Rank"],
    previewImage: "/images/projects/rekindle-kindle.svg",
  },
  {
    name: "Verdia",
    period: "Apr. 2026",
    category: "Hack Princeton / health AI",
    outcome: "Patient + insurer decision support",
    description: "A healthcare-fintech prototype that turns a seven-day risk score into clearer choices for patients, care teams, and insurers through role-based dashboards.",
    href: "https://github.com/Techdude01/Verdia---Hack-Princeton-Spring-26",
    preview: "health",
    previewTitle: "Health, made legible",
    previewMetrics: ["Patient", "Risk 7d", "Insurer"],
    previewImage: "/images/projects/verdia-dashboard.png",
  },
  {
    name: "MarketMind",
    period: "Mar. 2026",
    category: "yHack26 / agentic research",
    outcome: "Market research with a trace",
    description: "A research workspace that brings together a Next.js interface, Flask API, and PostgreSQL-backed workflow for exploring markets with more context and less tab switching.",
    href: "https://github.com/Techdude01/MarketMind-yHack26",
    preview: "market",
    previewTitle: "Question → signal",
    previewMetrics: ["Sources", "Synthesis", "Next"],
    previewImage: "/images/projects/marketmind-dashboard.jpg",
  },
  {
    name: "NBAnomaly",
    period: "Dec. 2025 — Present",
    category: "Data platform",
    outcome: "78% backtest precision",
    description: "An NBA platform that surfaces player under- and overperformance across 10+ seasons, then turns the signal into a fast scouting report.",
    href: "https://github.com/Techdude01/NBAnomaly",
    preview: "sports",
    previewTitle: "Find the outlier",
    previewMetrics: ["10+ yrs", "78%", "2.5ms"],
    previewImage: "/images/projects/nbanomaly-dashboard.jpg",
  },
  {
    name: "AutoCPT",
    period: "Feb. 2025",
    category: "Applied AI / HackNYU winner",
    outcome: "HackNYU 2025 Best Use of AI",
    description: "A live-visit assistant that turns clinician-patient conversations into suggested CPT codes, with a focus on speed, auditability, and less manual work.",
    href: "https://github.com/Techdude01/AutoCPT",
    preview: "clinical",
    previewTitle: "Voice → code",
    previewMetrics: ["Whisper", "<500ms", "CPT"],
    previewImage: "/images/projects/autocpt-dashboard.png",
  },
  {
    name: "NYC Airbnb Pricing Lab",
    period: "May 2026",
    category: "ML / data research",
    outcome: "Model comparison + error analysis",
    description: "A pricing study built from NYC Airbnb data, with feature engineering, Optuna-tuned regression models, held-out metrics, and visual error analysis.",
    href: "https://github.com/Techdude01/BNB_Pricing",
    preview: "pricing",
    previewTitle: "Price meets place",
    previewMetrics: ["Features", "Models", "Error"],
    previewImage: "/images/projects/bnb-price-vs-reviews.png",
  },
];

const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isLight = mounted && resolvedTheme === "light";
  const nextTheme = isLight ? "dark" : "light";

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={`Switch to ${nextTheme} mode`}
      onClick={() => setTheme(nextTheme)}
    >
      {isLight ? <Moon aria-hidden="true" /> : <SunMedium aria-hidden="true" />}
    </button>
  );
};

const ProjectPreview = ({ project }: { project: Project }) => (
  <div className={`project-preview project-preview--${project.preview}`}>
    {project.previewImage ? (
      <div className="project-preview-image-wrap">
        <img src={project.previewImage} alt={`${project.name} analysis preview`} />
      </div>
    ) : (
      <div className="project-preview-canvas" aria-hidden="true">
        <div className="project-preview-glow" />
        <div className="project-preview-copy">
          <span>{project.category}</span>
          <strong>{project.previewTitle}</strong>
        </div>
        <div className="project-preview-diagram">
          <span className="project-preview-node project-preview-node--one">{project.previewMetrics[0]}</span>
          <span className="project-preview-node project-preview-node--two">{project.previewMetrics[1]}</span>
          <span className="project-preview-node project-preview-node--three">{project.previewMetrics[2]}</span>
          <span className="project-preview-line project-preview-line--one" />
          <span className="project-preview-line project-preview-line--two" />
          <span className="project-preview-core"><ArrowUpRight aria-hidden="true" /></span>
        </div>
      </div>
    )}
  </div>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
};

export const PortfolioLayout = () => {
  const { pathname } = useLocation();
  const showHeaderName = pathname !== "/";

  return (
    <div className="resume-app">
      <WatercolorBackground />
      <ScrollToTop />
      <a href="#main-content" className="skip-link">Skip to content</a>

      <header className="site-header">
        <div className="site-header-inner site-header-inner--identity">
          <Link
            to="/"
            className={`site-name${showHeaderName ? "" : " site-name--placeholder"}`}
            aria-label="Kushal Mamillapalli, About"
            aria-hidden={!showHeaderName}
            tabIndex={showHeaderName ? undefined : -1}
          >
            Kushal Mamillapalli
          </Link>

          <nav className="site-nav" aria-label="Portfolio pages">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === "/"}>
                <span aria-hidden="true">{item.number}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <ThemeToggle />
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>

    </div>
  );
};

const usePageTitle = (title: string, description: string) => {
  useEffect(() => {
    document.title = `${title} — Kushal Mamillapalli`;

    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    meta?.setAttribute("content", description);
  }, [description, title]);
};

export const AboutPage = () => {
  usePageTitle(
    "Backend & Data Systems Engineer",
    "Kushal Mamillapalli is a backend and data systems engineer building production data pipelines, APIs, and real-time systems.",
  );

  return (
    <section className="resume-page about-page" aria-labelledby="about-title">
      <div className="page-wrap about-layout">
        <div className="about-copy">
          <h1 id="about-title">Kushal<br /><em>Mamillapalli</em></h1>
          <div className="about-details">
            <p className="about-detail about-detail--current">
              I&apos;m currently a Data Engineering Intern at Spotify, learning how
              large-scale data systems stay reliable in practice.
            </p>
            <p className="about-detail about-detail--belief">
              I believe good computer science should enrich people&apos;s lives. I&apos;m
              drawn to data and backend engineering, and to AI and computer vision
              when they make complex work more useful.
            </p>
            <p className="about-detail about-detail--education">
              A 2026 NYU Tandon Computer Science graduate, I&apos;m interested in
              engineering that makes complexity feel simpler for the people using it.
            </p>
          </div>
          <div className="about-actions">
            <Link className="button button-primary" to="/projects">Selected projects <ArrowUpRight aria-hidden="true" /></Link>
            <Link className="button" to="/resume">View résumé</Link>
          </div>
        </div>

        <div className="about-visual">
          <div className="hero-art">
            <figure className="profile-portrait">
              <img src="/images/IMG_3406.jpeg" alt="Kushal Mamillapalli" />
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
};

export const ProjectsPage = () => {
  usePageTitle("Projects", "Selected GitHub projects by Kushal Mamillapalli.");

  return (
    <section className="resume-page projects-page" aria-labelledby="projects-title">
      <div className="page-wrap">
        <header className="projects-intro">
          <h1 id="projects-title">Built to be opened.</h1>
        </header>

        <div className="projects-grid">
          {projects.map((project) => (
            <article className={`project-card project-card--${project.preview}`} key={project.name}>
              <ProjectPreview project={project} />
              <div className="project-card-body">
                <div className="project-card-heading">
                  <div>
                    <p className="entry-meta">{project.category} / {project.period}</p>
                    <h2>{project.name}</h2>
                  </div>
                </div>
                <p className="project-card-outcome">{project.outcome}</p>
                <p className="project-card-description">{project.description}</p>
                <div className="project-card-footer">
                  <a className="project-link" href={project.href} target="_blank" rel="noreferrer">
                    View on GitHub <ArrowUpRight aria-hidden="true" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export const ContactPage = () => {
  usePageTitle("Contact", "Get in touch with Kushal Mamillapalli.");

  return (
    <section className="resume-page contact-page" aria-labelledby="contact-title">
      <div className="page-wrap contact-layout">
        <div className="contact-copy">
          <h1 id="contact-title">Let&apos;s build something useful.</h1>
          <p className="contact-intro">
            I&apos;m open to thoughtful work in data infrastructure, backend systems, and applied AI—especially when it makes something complex easier to use.
          </p>
        </div>
        <ul className="contact-list">
          <li>
            <a href="mailto:kushalmam06@gmail.com">
              <Mail aria-hidden="true" />
              <span>Email</span>
              <strong>kushalmam06@gmail.com</strong>
              <ArrowUpRight aria-hidden="true" />
            </a>
          </li>
          <li>
            <a href="https://github.com/Techdude01" target="_blank" rel="noreferrer">
              <Github aria-hidden="true" />
              <span>GitHub</span>
              <strong>github.com/Techdude01</strong>
              <ArrowUpRight aria-hidden="true" />
            </a>
          </li>
          <li>
            <a href="https://www.linkedin.com/in/kushal-mamillapalli/" target="_blank" rel="noreferrer">
              <Linkedin aria-hidden="true" />
              <span>LinkedIn</span>
              <strong>linkedin.com/in/kushal-mamillapalli</strong>
              <ArrowUpRight aria-hidden="true" />
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
};

export const ResumePage = () => {
  usePageTitle("Resume", "One-page resume for Kushal Mamillapalli.");

  return (
    <section className="resume-page" aria-label="Resume">
      <div className="page-wrap">
        <div className="resume-display">
          <div className="resume-actions">
            <div>
              <a className="button button-primary" href="/documents/kushal-mamillapalli-resume.pdf" target="_blank" rel="noreferrer">
                Read resume <ArrowUpRight aria-hidden="true" />
              </a>
              <a className="button" href="/documents/kushal-mamillapalli-resume.pdf" download>
                Download PDF <Download aria-hidden="true" />
              </a>
            </div>
          </div>

          <object className="resume-preview" data="/documents/kushal-mamillapalli-resume.pdf#view=FitH" type="application/pdf" aria-label="Kushal Mamillapalli resume PDF">
            <p>Your browser cannot preview PDFs. <a href="/documents/kushal-mamillapalli-resume.pdf">Open the resume PDF.</a></p>
          </object>
        </div>
      </div>
    </section>
  );
};

export default PortfolioLayout;
