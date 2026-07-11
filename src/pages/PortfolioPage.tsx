import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Github,
  Linkedin,
  Mail,
  Moon,
  SunMedium,
} from "lucide-react";
import { useTheme } from "next-themes";
import GrainFilter from "@/components/sections/GrainFilter";
import SiteBackground from "@/components/sections/SiteBackground";

const navItems = [
  { href: "#top", label: "About" },
  { href: "#work", label: "Work" },
  { href: "#experience", label: "Experience" },
  { href: "#education", label: "Education" },
  { href: "#tech", label: "Tech" },
  { href: "#contact", label: "Contact" },
];

const sectionIds = new Set(["top", ...navItems.map((item) => item.href.slice(1))]);

const homeHighlights = [
  {
    label: "NYU data systems",
    metric: "40% faster ETL",
    detail: "Optimized 100GB+ financial-aid pipelines, reducing storage 73%.",
  },
  {
    label: "Real-time robotics",
    metric: "70% lower latency",
    detail: "Cut autonomous targeting from 40ms to 12ms as software lead.",
  },
  {
    label: "Product delivery",
    metric: "HackNYU winner",
    detail: "Built AutoCPT, a live clinical coding assistant with sub-500ms responses.",
  },
];

const getSectionFromHash = () => {
  const hash = decodeURIComponent(window.location.hash.replace(/^#/, ""));
  return sectionIds.has(hash) ? hash : "top";
};

const projects = [
  {
    name: "NBAnomaly",
    period: "Dec. 2025 to Present",
    outcome: "78% backtest precision / 4.5s -> 2.5ms LLM report path",
    details: [
      "Built an NBA anomaly-scouting platform over 10+ seasons with FastAPI on AWS EC2, Nginx, rate-limited ingestion, and exponential backoff.",
      "Trained an Isolation Forest over 15+ engineered features and added cache-aside PostgreSQL before Gemini calls.",
    ],
    stack: ["FastAPI", "AWS EC2", "Nginx", "PostgreSQL", "Gemini"],
    href: "https://github.com/Techdude01/NBAnomaly",
    linkLabel: "GitHub",
  },
  {
    name: "AutoCPT",
    period: "Feb. 2025",
    outcome: "HackNYU 2025 winner / <500ms live responses",
    details: [
      "Built a live-visit coding assistant saving clinicians 16+ hours/week by converting physician audio to CPT codes.",
      "Delivered async Flask streaming with retries, audit logs, Groq-hosted LLaMA-3, Whisper, and YOLOv8 fracture overlays in React.",
    ],
    stack: ["Flask", "Whisper", "LLaMA-3", "Groq", "YOLOv8", "React"],
    href: "https://github.com/Techdude01/AutoCPT",
    linkLabel: "GitHub",
  },
  {
    name: "MarketMind",
    period: "March 2026",
    outcome: "+/- 0.3 sentiment divergence / EV, ROI, breakeven analytics",
    details: [
      "Built a Polymarket research pipeline surfacing mispricings by comparing live news sentiment with crowd-implied probabilities.",
      "Routed thesis text through FinBERT and Cardiff RoBERTa into PostgreSQL, then shipped REST and Recharts analytics against live CLOB prices.",
    ],
    stack: ["Python", "FinBERT", "Cardiff RoBERTa", "PostgreSQL", "REST", "Recharts"],
    href: "https://github.com/Techdude01/MarketMind-yHack26",
    linkLabel: "GitHub",
  },
];

const experience = [
  {
    period: "Incoming, Summer 2026",
    company: "Spotify",
    location: "New York, NY",
    role: "Engineering Intern",
    details: [
      "Joining Spotify Personalization as a 10-week Engineering Intern focused on data engineering for recommendation systems.",
    ],
  },
  {
    period: "Apr. 2025 to Present",
    company: "NYU Enterprise Data Management",
    location: "New York, NY",
    role: "Backend & Data Systems Engineering Intern",
    details: [
      "Reduced NYU Financial Aid ETL runtime 40%, storage 73%, and compute 2 hours/run by optimizing 100GB+ Snowflake/Parquet pipelines in Python and SQL.",
      "Reached 4% MAPE on 600K-row departmental forecasts with Optuna-tuned SARIMA, Prophet, and XGBoost pipelines in GitLab CI, cutting debugging time 75%.",
    ],
  },
  {
    period: "Jan. 2024 to Present",
    company: "RoboMaster Team Ultraviolet",
    location: "Brooklyn, NY",
    role: "Software Engineer Lead",
    details: [
      "Cut autonomous-targeting latency 70% from 40ms to 12ms by optimizing C++/Python capture, preprocessing, and YOLOv8/TensorRT inference.",
      "Raised sustained camera ingest by 40+ FPS, eliminated UART corruption with bounded Python queues, thin C++ SDK shims, and a dual-CRC protocol.",
      "Improved targeting F1-score 15% with TensorRT-quantized YOLOv8 inference and lower onboard compute overhead.",
    ],
  },
];

const education = [
  {
    school: "NYU Tandon School of Engineering",
    location: "Brooklyn, NY",
    degree: "Senior / B.S. Computer Science / Mathematics minor",
    period: "2023 to 2026 / Expected May 2026",
    details: [
      "GPA: 3.9/4.0",
      "Dean's List, 2023 to Present",
      "Coursework: Data Structures, Algorithms, Operating Systems, Databases, Computer Networking, Computer Security, Machine Learning, Linear Algebra",
    ],
  },
];

const skills = [
  {
    label: "Languages",
    items: ["Python", "SQL", "C++", "TypeScript", "Java", "Bash"],
  },
  {
    label: "Backend / API",
    items: ["FastAPI", "Flask", "REST APIs", "WebSockets", "Nginx", "SQLAlchemy"],
  },
  {
    label: "Data / ML",
    items: ["PostgreSQL", "Snowflake", "Parquet", "Pandas", "NumPy", "scikit-learn", "Prophet", "Optuna", "XGBoost", "YOLOv8", "TensorRT"],
  },
  {
    label: "Cloud / Infra",
    items: ["AWS EC2", "AWS Lambda", "AWS Secrets Manager", "Docker", "GitLab CI", "Linux", "ROS2"],
  },
  {
    label: "Frontend / Visualization",
    items: ["Next.js", "React", "React Query", "Recharts"],
  },
  {
    label: "Certifications",
    items: ["AWS Certified AI Practitioner", "Bloomberg Market Concepts"],
  },
];

const contacts = [
  {
    label: "Email",
    value: "km6238@nyu.edu",
    href: "mailto:km6238@nyu.edu",
    Icon: Mail,
  },
  {
    label: "GitHub",
    value: "Techdude01",
    href: "https://github.com/Techdude01",
    Icon: Github,
  },
  {
    label: "LinkedIn",
    value: "kushal-mamillapalli",
    href: "https://linkedin.com/in/kushal-mamillapalli",
    Icon: Linkedin,
  },
];

const siteMeta = {
  url: "https://kushalmam.github.io/",
  title: "Kushal Mamillapalli — Backend & Data Systems Engineer",
  description:
    "Kushal Mamillapalli is a backend and data systems engineer building production data pipelines, APIs, and ML infrastructure.",
  socialDescription:
    "Backend systems, data engineering, and ML infrastructure work across production data, robotics, and applied AI.",
  image: "https://kushalmam.github.io/videos/fluid-motion-poster.jpg",
  imageAlt: "Kushal Mamillapalli portfolio preview",
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Kushal Mamillapalli",
  url: siteMeta.url,
  jobTitle: "Backend & Data Systems Engineer",
  email: "mailto:km6238@nyu.edu",
  sameAs: [
    "https://github.com/Techdude01",
    "https://linkedin.com/in/kushal-mamillapalli",
  ],
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "NYU Tandon School of Engineering",
  },
  knowsAbout: [
    "Backend systems",
    "Data engineering",
    "ML infrastructure",
    "FastAPI",
    "PostgreSQL",
    "Snowflake",
    "TensorRT",
  ],
};

const setMetaTag = (
  attribute: "name" | "property",
  key: string,
  content: string,
) => {
  let meta = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(attribute, key);
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", content);
};

const setMeta = () => {
  document.title = siteMeta.title;

  setMetaTag("name", "description", siteMeta.description);
  setMetaTag("name", "author", "Kushal Mamillapalli");
  setMetaTag("name", "robots", "index, follow");
  setMetaTag("name", "twitter:card", "summary_large_image");
  setMetaTag("name", "twitter:title", siteMeta.title);
  setMetaTag("name", "twitter:description", siteMeta.socialDescription);
  setMetaTag("name", "twitter:image", siteMeta.image);
  setMetaTag("name", "twitter:image:alt", siteMeta.imageAlt);

  setMetaTag("property", "og:type", "website");
  setMetaTag("property", "og:url", siteMeta.url);
  setMetaTag("property", "og:site_name", "Kushal Mamillapalli");
  setMetaTag("property", "og:title", siteMeta.title);
  setMetaTag("property", "og:description", siteMeta.socialDescription);
  setMetaTag("property", "og:image", siteMeta.image);
  setMetaTag("property", "og:image:alt", siteMeta.imageAlt);

  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", siteMeta.url);

  let schema = document.querySelector<HTMLScriptElement>("#portfolio-person-schema");
  if (!schema) {
    schema = document.createElement("script");
    schema.id = "portfolio-person-schema";
    schema.type = "application/ld+json";
    document.head.appendChild(schema);
  }
  schema.textContent = JSON.stringify(personSchema);
};

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
      aria-pressed={isLight}
      onClick={() => setTheme(nextTheme)}
    >
      {isLight ? (
        <Moon className="theme-icon" aria-hidden="true" />
      ) : (
        <SunMedium className="theme-icon" aria-hidden="true" />
      )}
    </button>
  );
};

const SectionHeading = ({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) => (
  <header className="section-heading">
    <p className="eyebrow" id={id}>
      {eyebrow}
    </p>
    <h2>{title}</h2>
    {children}
  </header>
);

const PortfolioPage = () => {
  const [activeSection, setActiveSection] = useState(getSectionFromHash);
  const contentRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMeta();
  }, []);

  useEffect(() => {
    const syncSectionWithLocation = () => setActiveSection(getSectionFromHash());

    window.addEventListener("hashchange", syncSectionWithLocation);
    window.addEventListener("popstate", syncSectionWithLocation);

    return () => {
      window.removeEventListener("hashchange", syncSectionWithLocation);
      window.removeEventListener("popstate", syncSectionWithLocation);
    };
  }, []);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [activeSection]);

  const navigateTo = (section: string) => {
    if (section === activeSection) {
      contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    window.history.pushState(null, "", `#${section}`);
    setActiveSection(section);
  };

  return (
    <div className="portfolio-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <GrainFilter />
      <SiteBackground />

      <header className="site-header">
        <div className="site-header-inner">
          <a
            href="#top"
            className="site-name"
            aria-label="Kushal Mamillapalli home"
            onClick={(event) => {
              event.preventDefault();
              navigateTo("top");
            }}
          >
            Kushal Mamillapalli
          </a>
          <nav className="site-nav" aria-label="Section navigation">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                aria-current={activeSection === item.href.slice(1) ? "page" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  navigateTo(item.href.slice(1));
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <main id="main-content" className="portfolio-content" tabIndex={-1} ref={contentRef}>
        <section
          className="hero-section viewport-section home-hero"
          id="top"
          aria-labelledby="hero-title"
          hidden={activeSection !== "top"}
        >
          <div className="page-wrap home-layout">
            <div className="home-intro">
              <p className="eyebrow">Backend &amp; Data Engineer / NYU Tandon CS '26</p>
              <h1 id="hero-title">Kushal Mamillapalli</h1>
              <p className="hero-copy">
                I&apos;m a backend and data engineer finishing Computer Science at
                NYU Tandon in 2026. I build APIs, data pipelines, and real-time
                systems—from high-volume university data infrastructure to
                robotics software. Based in Secaucus / New York, I&apos;m joining
                Spotify as an Engineering Intern in summer 2026.
              </p>
              <div className="home-actions" aria-label="About page actions">
                <a
                  className="home-action home-action--primary"
                  href="#work"
                  onClick={(event) => {
                    event.preventDefault();
                    navigateTo("work");
                  }}
                >
                  View selected work
                  <ArrowUpRight className="link-icon" aria-hidden="true" />
                </a>
                <a
                  className="home-action"
                  href="#contact"
                  onClick={(event) => {
                    event.preventDefault();
                    navigateTo("contact");
                  }}
                >
                  Get in touch
                </a>
              </div>
              <p className="home-personal">
                <span>Beyond coursework</span>
                I lead software for NYU&apos;s RoboMaster Team Ultraviolet and enjoy
                building systems where data, performance, and real-world constraints meet.
              </p>
            </div>

            <dl className="home-highlights" aria-label="Selected highlights">
              {homeHighlights.map((highlight) => (
                <div key={highlight.metric}>
                  <dt>{highlight.label}</dt>
                  <dd>{highlight.metric}</dd>
                  <p>{highlight.detail}</p>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="content-section viewport-section" id="work" aria-labelledby="work-heading" hidden={activeSection !== "work"}>
          <div className="page-wrap">
            <SectionHeading
              id="work-heading"
              eyebrow="Work"
              title="Projects"
            />

            <div className="project-list">
              {projects.map((project) => (
                <article className="project-row" key={project.name}>
                  <div>
                    <h3>{project.name}</h3>
                    <p className="row-kicker">{project.period}</p>
                    <p className="row-result">{project.outcome}</p>
                  </div>
                  <ul className="detail-list">
                    {project.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                  <ul className="inline-list" aria-label={`${project.name} stack`}>
                    {project.stack.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <a
                    className="text-link"
                    href={project.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {project.linkLabel}
                    <ArrowUpRight className="link-icon" aria-hidden="true" />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="content-section viewport-section"
          id="experience"
          aria-labelledby="experience-heading"
          hidden={activeSection !== "experience"}
        >
          <div className="page-wrap">
            <SectionHeading
              id="experience-heading"
              eyebrow="Experience"
              title="Experience"
            />

            <ol className="timeline-list">
              {experience.map((item) => (
                <li key={`${item.role}-${item.company}`} className="timeline-row">
                  <time>{item.period}</time>
                  <div>
                    <h3>{item.company}</h3>
                    <p className="row-kicker">
                      {item.role} / {item.location}
                    </p>
                    <ul className="detail-list">
                      {item.details.map((detail) => (
                        <li key={detail}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          className="content-section viewport-section"
          id="education"
          aria-labelledby="education-heading"
          hidden={activeSection !== "education"}
        >
          <div className="page-wrap">
            <SectionHeading
              id="education-heading"
              eyebrow="Education"
              title="Education"
            />
            <ol className="education-list">
              {education.map((item) => (
                <li key={`${item.degree}-${item.period}`}>
                  <div className="education-primary">
                    <h3>{item.school}</h3>
                    <p className="row-kicker">
                      {item.location} / {item.period}
                    </p>
                  </div>
                  <p className="education-degree">{item.degree}</p>
                  <ul className="education-details">
                    {item.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="content-section viewport-section" id="tech" aria-labelledby="tech-heading" hidden={activeSection !== "tech"}>
          <div className="page-wrap">
            <SectionHeading
              id="tech-heading"
              eyebrow="Tech"
              title="Technical skills"
            />
            <div className="skill-list" aria-label="Technical skill groups">
              {skills.map((group) => (
                <section key={group.label} className="skill-row">
                  <h3>{group.label}</h3>
                  <p>{group.items.join(", ")}</p>
                </section>
              ))}
            </div>
          </div>
        </section>

        <section className="content-section contact-section viewport-section" id="contact" aria-labelledby="contact-heading" hidden={activeSection !== "contact"}>
          <div className="page-wrap">
            <SectionHeading
              id="contact-heading"
              eyebrow="Contact"
              title="Contact"
            />
            <ul className="contact-list">
              {contacts.map(({ href, label, value, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noreferrer" : undefined}
                  >
                    <Icon className="contact-icon" aria-hidden="true" />
                    <span>{label}</span>
                    <strong>{value}</strong>
                    <ArrowUpRight className="link-icon" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
            <p className="location-line">Secaucus / New York</p>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <span>(c) {new Date().getFullYear()} Kushal Mamillapalli</span>
      </footer>
    </div>
  );
};

export default PortfolioPage;
