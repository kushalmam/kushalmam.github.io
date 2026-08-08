import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Download,
  FileText,
  Moon,
  SunMedium,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import WatercolorBackground from "../components/WatercolorBackground.tsx";

const navItems = [
  { to: "/", label: "About", number: "01" },
  { to: "/work", label: "Work", number: "02" },
  { to: "/experience", label: "Experience", number: "03" },
  { to: "/education", label: "Education", number: "04" },
  { to: "/tech", label: "Tech", number: "05" },
  { to: "/resume", label: "Resume", number: "06" },
];

const projects = [
  {
    name: "NBAnomaly",
    period: "Dec. 2025 — Present",
    category: "Data platform",
    outcome: "78% backtest precision",
    details: [
      "Built an NBA platform that surfaces player under- and overperformance across 10+ seasons with FastAPI on AWS EC2 and resilient ingestion.",
      "Validated 78% backtest precision with an Isolation Forest and reduced LLM report latency from 4.5 seconds to 2.5ms with cache-aside PostgreSQL.",
    ],
    stack: ["FastAPI", "AWS EC2", "PostgreSQL", "Gemini"],
    href: "https://github.com/Techdude01/NBAnomaly",
  },
  {
    name: "AutoCPT",
    period: "Feb. 2025",
    category: "Applied AI",
    outcome: "HackNYU 2025 Best Use of AI",
    details: [
      "Built a live-visit assistant that turns clinician-patient conversations into suggested CPT codes, saving clinicians 16+ hours a week with Whisper, LLaMA-3, and Groq.",
      "Enabled sub-500ms responses with async Flask, retry and audit logic, and React YOLOv8 overlays.",
    ],
    stack: ["Flask", "Whisper", "LLaMA-3", "YOLOv8", "React"],
    href: "https://github.com/Techdude01/AutoCPT",
  },
];

const experience = [
  {
    period: "Jun. 2026 — Aug. 2026",
    company: "Spotify",
    location: "New York City, NY",
    role: "Data Engineering Intern",
    details: [
      "Built a Claude/MCP deprecation skill across 10+ Spotify repositories with reader checks, SQL parity, and PR summaries, cutting manual work 70%.",
      "Decommissioned two Dataflow pipelines and three Pub/Sub topics, reducing GCP spend by about $15K a year.",
    ],
  },
  {
    period: "Apr. 2025 — Present",
    company: "NYU Enterprise Data Management",
    location: "New York City, NY",
    role: "Technical Systems Engineering Intern (Part-Time)",
    details: [
      "Cut Financial Aid ETL runtime 40% by migrating 100GB+ inputs to Parquet, improving read times 54%.",
      "Built a 600K-row SARIMA/Prophet forecasting engine with 4% MAPE and an Oracle Analytics Cloud dashboard.",
    ],
  },
  {
    period: "Jan. 2024 — Jun. 2026",
    company: "NYU ARC Robotics",
    location: "New York City, NY",
    role: "Computer Vision Lead",
    details: [
      "Built a C++ ROS 2 auto-aim system with Basler/RealSense cameras, YOLO, and TensorRT/DeepStream.",
      "Cut latency 70% (40ms to 12ms), raised throughput 2.3x, and improved armor-targeting F1 by 15%.",
    ],
  },
];

const skills = [
  { label: "Languages", items: ["Scala", "Java", "Python", "C++", "Bash", "sbt", "Maven"] },
  { label: "Data & Streaming", items: ["Apache Beam/Scio", "Google Cloud Dataflow", "BigQuery", "Bigtable", "Pub/Sub", "Protobuf", "Avro"] },
  { label: "ML & Vision", items: ["ROS 2", "TensorRT", "DeepStream", "CUDA/NVMM", "PyTorch", "YOLOv8", "scikit-learn", "Prophet", "Optuna"] },
  { label: "Cloud Infrastructure", items: ["Google Cloud IAM", "Kubernetes", "GitHub Actions/CI"] },
  { label: "Platforms", items: ["FastAPI", "Flask", "PostgreSQL", "Docker", "GitHub", "Oracle Analytics Cloud"] },
  { label: "Credentials", items: ["AWS Certified Machine Learning Engineer – Associate (May 2026)"] },
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

const InkDivider = () => (
  <svg className="ink-divider" viewBox="0 0 1200 16" preserveAspectRatio="none" aria-hidden="true">
    <path d="M2 8 C68 2, 126 14, 198 7 S334 2, 410 8 S546 14, 620 7 S758 2, 830 8 S968 14, 1042 7 S1144 3, 1198 8" />
  </svg>
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
        <div className={`site-header-inner${showHeaderName ? " site-header-inner--identity" : ""}`}>
          {showHeaderName && (
            <Link to="/" className="site-name" aria-label="Kushal Mamillapalli, About">
              Kushal Mamillapalli
            </Link>
          )}

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

      <footer className="site-footer">
        <span>© {new Date().getFullYear()} Kushal Mamillapalli</span>
      </footer>
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
          <p className="section-label"><span>01</span> About</p>
          <h1 id="about-title">Kushal<br /><em>Mamillapalli</em></h1>
          <p className="about-role">Data Engineering Intern @ Spotify / Backend &amp; Data Systems Engineer</p>
          <p className="about-lede">
            I build AI and backend systems that go the distance—where performance
            has to hold up in the real world, not just in theory.
          </p>
          <p className="about-detail">
            A 2026 NYU Tandon Computer Science graduate, I&apos;m a Data Engineering
            Intern at Spotify, working across data infrastructure and computer vision.
          </p>
          <div className="about-actions">
            <Link className="button button-primary" to="/work">Selected work <ArrowUpRight aria-hidden="true" /></Link>
            <Link className="button" to="/resume">View résumé</Link>
          </div>
        </div>

        <div className="about-visual">
          <div className="hero-art">
            <figure className="profile-portrait">
              <img src="/images/IMG_3406.jpeg" alt="Portrait of Kushal Mamillapalli" />
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
};

export const WorkPage = () => {
  usePageTitle("Selected Work", "Selected engineering projects by Kushal Mamillapalli.");

  return (
    <section className="resume-page" aria-label="Work">
      <div className="page-wrap">
        <div className="project-list">
          {projects.map((project, index) => (
            <div className="ink-separated-entry" key={project.name}>
              {index > 0 && <InkDivider />}
              <article className="project-entry">
                <div className="project-index">0{index + 1}</div>
                <div className="project-main">
                  <div className="entry-heading">
                    <div>
                      <p className="entry-meta">{project.category} / {project.period}</p>
                      <h2>{project.name}</h2>
                    </div>
                    <p className="project-outcome">{project.outcome}</p>
                  </div>
                  <div className="project-body">
                    <ul className="detail-list">
                      {project.details.map((detail) => <li key={detail}>{detail}</li>)}
                    </ul>
                    <div className="project-aside">
                      <ul className="tag-list" aria-label={`${project.name} technology stack`}>
                        {project.stack.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                      <a className="project-link" href={project.href} target="_blank" rel="noreferrer">
                        View on GitHub <ArrowUpRight aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const ExperiencePage = () => {
  usePageTitle("Experience", "Data engineering, software engineering, computer vision, and research experience at Spotify, NYU, and RoboMaster Team Ultraviolet.");

  return (
    <section className="resume-page" aria-label="Experience">
      <div className="page-wrap">
        <ol className="experience-list">
          {experience.map((item, index) => (
            <li className="ink-separated-entry" key={`${item.company}-${item.role}`}>
              {index > 0 && <InkDivider />}
              <div className="experience-entry">
                <time>{item.period}</time>
                <article>
                  <div className="entry-heading">
                    <div>
                      <h2>{item.company}</h2>
                      <p className="entry-meta">{item.role} / {item.location}</p>
                    </div>
                  </div>
                  <ul className="detail-list">
                    {item.details.map((detail) => <li key={detail}>{detail}</li>)}
                  </ul>
                </article>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export const EducationPage = () => {
  usePageTitle("Education", "Education and academic focus of Kushal Mamillapalli.");

  return (
    <section className="resume-page education-page" aria-label="Education">
      <div className="page-wrap">
        <article className="education-card">
          <div className="education-mark" aria-hidden="true">NYU</div>
          <div className="education-content">
            <div className="entry-heading">
              <div>
                <p className="entry-meta">Brooklyn, NY / Sep. 2023 — May 2026</p>
                <h2>NYU Tandon School of Engineering</h2>
              </div>
              <p className="education-gpa">3.9 <span>/ 4.0 GPA</span></p>
            </div>
            <p className="education-degree">B.S. Computer Science <span>with a Mathematics minor</span></p>
            <div className="education-grid">
              <div>
                <p className="section-label"><span>Recognition</span></p>
                <ul className="recognition-list">
                  <li>NYU IT Distinguished Student Employee Award, 2026</li>
                  <li>Dean&apos;s List, 2023 — 2026</li>
                </ul>
              </div>
              <div>
                <p className="section-label"><span>Coursework</span></p>
                <p>Data Structures, Algorithms, Operating Systems, Databases, Machine Learning, and Data Science.</p>
              </div>
            </div>
          </div>
        </article>
        <InkDivider />
      </div>
    </section>
  );
};

export const TechPage = () => {
  usePageTitle("Technical Skills", "Technical skills across backend systems, data engineering, machine learning, infrastructure, and frontend development.");

  return (
    <section className="resume-page" aria-label="Tech">
      <div className="page-wrap">
        <div className="skills-grid" aria-label="Technical skills">
          {skills.map((group, index) => (
            <section className="skill-card" key={group.label}>
              <p className="skill-number">0{index + 1}</p>
              <h2>{group.label}</h2>
              <p>{group.items.join(" · ")}</p>
            </section>
          ))}
        </div>
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
            <FileText aria-hidden="true" />
            <p className="section-label"><span>PDF</span> One page / Printable version</p>
            <p>A concise, printable resume with direct links to LinkedIn, GitHub, and project work.</p>
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
