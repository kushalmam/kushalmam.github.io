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
      "Built an NBA anomaly-scouting platform over 10+ seasons with FastAPI on AWS EC2, Nginx, rate-limited ingestion, and exponential backoff.",
      "Trained an Isolation Forest over 15+ engineered features and added cache-aside PostgreSQL before Gemini calls, reducing the report path from 4.5 seconds to 2.5 milliseconds.",
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
      "Won Reach Capital's Best Use of AI award at HackNYU 2025 for a live-visit coding assistant that saves clinicians 16+ hours a week by converting physician audio into CPT codes.",
      "Led the computer-vision effort for custom YOLOv8 fracture detection and helped design diagnostic transcription, delivered through async Flask with sub-500ms live responses.",
    ],
    stack: ["Flask", "Whisper", "LLaMA-3", "YOLOv8", "React"],
    href: "https://github.com/Techdude01/AutoCPT",
  },
  {
    name: "MarketMind",
    period: "Mar. 2026",
    category: "Market intelligence",
    outcome: "Sentiment / probability divergence",
    details: [
      "Built a Polymarket research pipeline that surfaces possible mispricings by comparing live news sentiment with crowd-implied probabilities.",
      "Routed thesis text through FinBERT and Cardiff RoBERTa into PostgreSQL, then shipped REST and Recharts analytics against live CLOB prices for EV, ROI, and breakeven analysis.",
    ],
    stack: ["Python", "FinBERT", "PostgreSQL", "Recharts"],
    href: "https://github.com/Techdude01/MarketMind-yHack26",
  },
];

const experience = [
  {
    period: "Jun. 2026 — Present",
    company: "Spotify",
    location: "New York, NY / Hybrid",
    role: "Data Engineering Intern, Personalization",
    details: [
      "Building personalization data pipelines that support Spotify's recommendation systems and product experiences.",
    ],
  },
  {
    period: "Apr. 2025 — Present",
    company: "New York University",
    location: "New York City Metropolitan Area / Hybrid",
    role: "SWE / Technical Intern",
    details: [
      "Modernized university financial reporting in Python and SQL, including 100GB+ Snowflake and Parquet Financial Aid pipelines that cut runtime 40% and storage 73%.",
      "Developed a Prophet-based forecasting engine for budget planning, reaching 4% MAPE on 600K rows and automating validation in GitLab CI.",
    ],
  },
  {
    period: "Jan. 2024 — Present",
    company: "NYU RoboMaster: Team Ultraviolet",
    location: "New York, NY / On-site",
    role: "Computer Vision Member / Lead",
    details: [
      "More than doubled inference throughput with CUDA DeepStream pipelines while cutting autonomous-targeting latency 70%, from 40ms to 12ms.",
      "Improved detection with YOLO26-OBB and strengthened the vision-to-control stack with TensorRT, ROS2, and reliability-focused tooling.",
    ],
  },
  {
    period: "Jun. 2024 — Aug. 2024",
    company: "NYU Tandon School of Engineering",
    location: "New York, NY / On-site",
    role: "Computer Vision / ETL Research Intern",
    details: [
      "Optimized 3D biological motion tracking in Python and OpenCV, reducing distortion residuals and reprojection error 48%.",
    ],
  },
];

const skills = [
  { label: "Languages", items: ["Python", "SQL", "C++", "TypeScript", "Java", "Bash"] },
  { label: "Backend & API", items: ["FastAPI", "Flask", "REST APIs", "WebSockets", "Nginx", "SQLAlchemy"] },
  { label: "Data & ML", items: ["PostgreSQL", "Snowflake", "Parquet", "Pandas", "scikit-learn", "Prophet", "Optuna", "XGBoost", "YOLOv8", "TensorRT"] },
  { label: "Cloud & Infra", items: ["AWS EC2", "AWS Lambda", "AWS Secrets Manager", "Docker", "GitLab CI", "Linux", "ROS2"] },
  { label: "Frontend", items: ["Next.js", "React", "React Query", "Recharts"] },
  { label: "Credentials", items: ["AWS Certified Machine Learning Engineer – Associate (May 2026 – May 2029)", "AWS Certified AI Practitioner", "Bloomberg Market Concepts"] },
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
    <section className="resume-page about-page page-variant page-variant--about" aria-labelledby="about-title">
      <div className="page-wrap about-layout">
        <div className="about-copy">
          <p className="section-label"><span>01</span> About</p>
          <h1 id="about-title">Kushal<br /><em>Mamillapalli</em></h1>
          <p className="about-role">Data Engineering Intern @ Spotify / AI &amp; Backend Engineer</p>
          <p className="about-lede">
            I build AI and backend systems that go the distance—where performance
            has to hold up in the real world, not just in theory.
          </p>
          <p className="about-detail">
            A 2026 NYU Tandon Computer Science graduate, I&apos;m a Data Engineering
            Intern on Spotify Personalization, working across data infrastructure,
            computer vision, and applied AI.
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
    <section className="resume-page page-variant page-variant--work" aria-label="Work">
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
    <section className="resume-page page-variant page-variant--experience" aria-label="Experience">
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
    <section className="resume-page education-page page-variant page-variant--education" aria-label="Education">
      <div className="page-wrap">
        <article className="education-card">
          <div className="education-mark" aria-hidden="true">NYU</div>
          <div className="education-content">
            <div className="entry-heading">
              <div>
                <p className="entry-meta">Brooklyn, NY / Sep. 2023 — May 2026</p>
                <h2>NYU Tandon School of Engineering</h2>
              </div>
              <p className="education-gpa">3.91 <span>/ 4.0 GPA</span></p>
            </div>
            <p className="education-degree">B.S. Computer Science <span>with a Mathematics minor</span></p>
            <div className="education-grid">
              <div>
                <p className="section-label"><span>Recognition</span></p>
                <ul className="recognition-list">
                  <li>NYU IT Distinguished Student Employee Award, 2026</li>
                  <li>National Merit Scholar</li>
                  <li>Dean&apos;s List, 2023 — 2026</li>
                </ul>
              </div>
              <div>
                <p className="section-label"><span>Coursework</span></p>
                <p>Data Structures, Algorithms, Object-Oriented Programming, Operating Systems, Networking, Security, Databases, Software Engineering, Machine Learning, Computer Architecture, Data Science, and Linear Algebra.</p>
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
    <section className="resume-page page-variant page-variant--tech" aria-label="Tech">
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
    <section className="resume-page page-variant page-variant--resume" aria-label="Resume">
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
