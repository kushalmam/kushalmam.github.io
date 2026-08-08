import { useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Blocks,
  Bot,
  BrainCircuit,
  Cpu,
  Database,
  Gauge,
  Github,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Network,
  Server,
  ShieldCheck,
  TerminalSquare,
  Workflow,
  Zap,
} from "lucide-react";
import LiquidGlassButton from "@/components/sections/LiquidGlassButton";
import LiquidGlassPane from "@/components/sections/LiquidGlassPane";

type PageIntroProps = {
  eyebrow: string;
  title: string;
  copy: string;
};

type SystemNode = {
  id: string;
  label: string;
  detail: string;
  Icon: LucideIcon;
};

const setPageMeta = (title: string, description: string) => {
  document.title = title;

  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "description");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", description);

  const setOg = (prop: string, content: string) => {
    let el = document.querySelector(`meta[property="${prop}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("property", prop);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  };

  setOg("og:title", title);
  setOg("og:description", description);

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", window.location.origin + window.location.pathname);
};

const usePageMeta = (title: string, description: string) => {
  useEffect(() => {
    setPageMeta(title, description);
  }, [description, title]);
};

const PageIntro = ({ eyebrow, title, copy }: PageIntroProps) => (
  <header className="route-header">
    <p className="eyebrow">{eyebrow}</p>
    <h1 className="route-title">{title}</h1>
    <p className="route-copy">{copy}</p>
  </header>
);

const systemNodes: SystemNode[] = [
  {
    id: "gateway",
    label: "API Gateway",
    detail: "Typed ingress",
    Icon: Server,
  },
  {
    id: "queue",
    label: "Task Queue",
    detail: "Backpressure",
    Icon: Workflow,
  },
  {
    id: "workers",
    label: "GPU Workers",
    detail: "Batch inference",
    Icon: Cpu,
  },
  {
    id: "vector",
    label: "Vector DB",
    detail: "Retrieval layer",
    Icon: Database,
  },
  {
    id: "observe",
    label: "Observability",
    detail: "p99 + traces",
    Icon: Activity,
  },
];

const SystemDiagram = () => (
  <LiquidGlassPane className="system-panel">
    <div className="system-panel-header">
      <span className="eyebrow">Systems map</span>
      <span className="availability-pill">
        <span aria-hidden="true" />
        Open for systems roles
      </span>
    </div>

    <div className="system-map" aria-label="Animated backend architecture diagram">
      <svg className="system-lines" viewBox="0 0 640 360" aria-hidden="true">
        <path className="system-path system-path-1" d="M112 82 C198 82 244 154 318 178" />
        <path className="system-path system-path-2" d="M348 178 C408 132 448 92 526 82" />
        <path className="system-path system-path-3" d="M354 204 C418 244 462 282 538 282" />
        <path className="system-path system-path-4" d="M292 208 C224 256 178 284 104 284" />
        <path className="system-path system-path-5" d="M526 104 C498 166 498 218 534 260" />
      </svg>

      {systemNodes.map(({ id, label, detail, Icon }) => (
        <div key={id} className={`system-node system-node-${id}`}>
          <div className="system-node-icon">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <p>{label}</p>
            <span>{detail}</span>
          </div>
        </div>
      ))}

      <div className="system-core" aria-hidden="true">
        <Network className="h-6 w-6" />
      </div>
    </div>

    <div className="system-metrics">
      <div>
        <span>API latency</span>
        <strong>42ms</strong>
      </div>
      <div>
        <span>Queue health</span>
        <strong>steady</strong>
      </div>
      <div>
        <span>Deploy target</span>
        <strong>resilient</strong>
      </div>
    </div>
  </LiquidGlassPane>
);

const interests = [
  {
    title: "Distributed Systems",
    detail: "Service boundaries, queues, consistency tradeoffs, and failure-aware design.",
    Icon: Network,
  },
  {
    title: "ML Infrastructure",
    detail: "Inference services, evaluation loops, data quality, and model-serving ergonomics.",
    Icon: BrainCircuit,
  },
  {
    title: "Observability",
    detail: "Metrics, traces, p99s, and the instrumentation that makes systems legible.",
    Icon: Gauge,
  },
  {
    title: "Developer Experience",
    detail: "Tools and workflows that remove friction from building, testing, and shipping.",
    Icon: TerminalSquare,
  },
  {
    title: "GPU Systems",
    detail: "Batching, TensorRT, edge inference, and runtime constraints on real hardware.",
    Icon: Cpu,
  },
  {
    title: "Robotics",
    detail: "Computer vision, ROS2 loops, and low-latency perception-to-control paths.",
    Icon: Bot,
  },
];

const projects = [
  {
    title: "NBAnomaly",
    category: "Data Platform",
    outcome: "Gemini 4.5s to Postgres cache 2.5ms",
    architecture:
      "Designed a scouting pipeline that scores statistical anomalies across 30 NBA seasons, then serves cached reads through a tuned backend path.",
    stack: "Go · SQL · FastAPI · Kafka",
    tags: ["FastAPI", "Postgres", "scikit-learn", "Next.js"],
    github: "https://github.com/Techdude01",
  },
  {
    title: "AutoCPT",
    category: "Realtime Automation",
    outcome: "HackNYU 2025 winner · sub-500ms loop",
    architecture:
      "Built a streaming medical coding assistant that maps live clinician audio to CPT codes with WebSocket updates and low-latency model calls.",
    stack: "Python · OCR · CV · GCP",
    tags: ["Whisper", "LLaMA-3", "FastAPI", "WebSockets"],
    github: "https://github.com/Techdude01",
  },
  {
    title: "MarketMind",
    category: "Agentic Research",
    outcome: "Sentiment vs crowd-implied probability",
    architecture:
      "Composed crawlers, NLP scoring, and market comparison logic to flag prediction-market mismatches with repeatable research traces.",
    stack: "NLP · PostgreSQL · FastAPI",
    tags: ["Python", "FinBERT", "RoBERTa", "LangGraph"],
    github: "https://github.com/Techdude01",
  },
];

const experience = [
  {
    role: "Incoming Data Engineering Intern",
    company: "Spotify, Personalization",
    period: "Summer 2026",
    detail: "Joining the personalization team with a focus on data systems and product-facing infrastructure.",
  },
  {
    role: "Data Engineer",
    company: "NYU Enterprise Data Management",
    period: "Apr 2025 to Present",
    detail:
      "Optimizing ETL pipelines into Snowflake and maintaining data quality across enrollment systems.",
  },
  {
    role: "Computer Vision Lead",
    company: "RoboMaster, Ultraviolet",
    period: "Jan 2024 to Present",
    detail:
      "Leading the autonomous targeting stack with YOLOv8, TensorRT, Jetson deployment, and a ROS2 control loop under 30ms.",
  },
];

const skillGroups = [
  {
    label: "Languages",
    items: ["Python", "SQL", "C++", "TypeScript", "Java", "Bash"],
  },
  {
    label: "Backend",
    items: ["FastAPI", "Flask", "Nginx", "SQLAlchemy", "WebSockets"],
  },
  {
    label: "Data / ML",
    items: ["PostgreSQL", "Snowflake", "Parquet", "scikit-learn", "TensorRT", "YOLOv8"],
  },
  {
    label: "Cloud / Infra",
    items: ["AWS EC2", "AWS Lambda", "Docker", "GitLab CI", "ROS2"],
  },
];

export const OverviewPage = () => {
  usePageMeta(
    "Kushal Mamillapalli - Backend & Infrastructure Engineer",
    "Portfolio of Kushal Mamillapalli: backend systems, ML infrastructure, developer tooling, and platform engineering.",
  );

  return (
    <div className="route-page overview-route">
      <div className="overview-grid">
        <div className="overview-copy">
          <p className="eyebrow">Hey, I am</p>
          <h1 className="overview-name">Kushal Mamillapalli</h1>
          <p className="overview-role">Backend & Infrastructure Engineer</p>
          <p className="overview-lede">
            I build systems that survive scale, not just demos.
          </p>
          <p className="overview-support">
            Focused on distributed systems, ML infrastructure, developer tooling,
            and backend platforms that stay readable under pressure.
          </p>

          <div className="overview-actions">
            <LiquidGlassButton href="/projects" variant="primary">
              View projects <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </LiquidGlassButton>
            <LiquidGlassButton href="/contact" variant="ghost">
              <Mail className="h-4 w-4" aria-hidden="true" /> Contact
            </LiquidGlassButton>
          </div>

          <div className="overview-proof" aria-label="Portfolio highlights">
            <div>
              <Blocks className="h-4 w-4" aria-hidden="true" />
              <strong>15+</strong>
              <span>Projects built</span>
            </div>
            <div>
              <Zap className="h-4 w-4" aria-hidden="true" />
              <strong>30ms</strong>
              <span>Robotics loop</span>
            </div>
            <div>
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <strong>100%</strong>
              <span>Systems mindset</span>
            </div>
          </div>
        </div>

        <SystemDiagram />
      </div>
    </div>
  );
};

export const InterestsPage = () => {
  usePageMeta(
    "Interests - Kushal Mamillapalli",
    "Engineering interests across distributed systems, ML infrastructure, observability, developer tooling, GPU systems, and robotics.",
  );

  return (
    <div className="route-page">
      <PageIntro
        eyebrow="Interests"
        title="The parts of software where constraints become design."
        copy="I am drawn to systems work where performance, reliability, tooling, and product taste all have to meet in the same place."
      />

      <div className="interest-grid">
        {interests.map(({ title, detail, Icon }) => (
          <LiquidGlassPane key={title} as="article" interactive className="interest-card">
            <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2>{title}</h2>
            <p>{detail}</p>
          </LiquidGlassPane>
        ))}
      </div>
    </div>
  );
};

export const ProjectsPage = () => {
  usePageMeta(
    "Projects - Kushal Mamillapalli",
    "Selected engineering projects by Kushal Mamillapalli, framed around architecture, outcomes, and backend systems design.",
  );

  return (
    <div className="route-page">
      <PageIntro
        eyebrow="Projects"
        title="Selected builds with architecture, signal, and measurable outcomes."
        copy="The focus is not the framework list. It is the shape of the system, the latency budget, and the reason each layer exists."
      />

      <div className="project-grid">
        {projects.map((project, index) => (
          <LiquidGlassPane
            key={project.title}
            as="article"
            interactive
            className={`product-project-card ${index === 0 ? "product-project-card-featured" : ""}`}
          >
            <div className="project-card-topline">
              <span>{project.category}</span>
              <span>{project.stack}</span>
            </div>
            <h2>{project.title}</h2>
            <p className="project-outcome">{project.outcome}</p>
            <p className="project-architecture">{project.architecture}</p>
            <div className="project-tags">
              {project.tags.map((tag) => (
                <span key={tag} className="pill">
                  {tag}
                </span>
              ))}
            </div>
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              className="project-link"
              aria-label={`View ${project.title} on GitHub`}
            >
              <Github className="h-4 w-4" aria-hidden="true" />
              Source
              <ArrowUpRight className="ml-auto h-4 w-4" aria-hidden="true" />
            </a>
          </LiquidGlassPane>
        ))}
      </div>
    </div>
  );
};

export const ExperiencePage = () => {
  usePageMeta(
    "Experience - Kushal Mamillapalli",
    "Experience across data engineering, personalization infrastructure, and low-latency robotics computer vision.",
  );

  return (
    <div className="route-page">
      <PageIntro
        eyebrow="Experience"
        title="A product log of systems work, data pipelines, and real-time software."
        copy="The throughline is practical infrastructure: pipelines that need data quality, perception systems that need latency discipline, and platforms that need to be understood by the people operating them."
      />

      <ol className="experience-timeline">
        {experience.map((item) => (
          <LiquidGlassPane key={`${item.role}-${item.company}`} as="li" className="experience-item">
            <div className="experience-pin" aria-hidden="true" />
            <div>
              <p className="experience-period">{item.period}</p>
              <h2>{item.role}</h2>
              <p className="experience-company">{item.company}</p>
              <p className="experience-detail">{item.detail}</p>
            </div>
          </LiquidGlassPane>
        ))}
      </ol>
    </div>
  );
};

export const EducationPage = () => {
  usePageMeta(
    "Education - Kushal Mamillapalli",
    "Education, certifications, and technical foundations for Kushal Mamillapalli.",
  );

  return (
    <div className="route-page">
      <PageIntro
        eyebrow="Education"
        title="A computer science foundation pointed at systems that ship."
        copy="Coursework and credentials matter most when they become taste: cleaner abstractions, better debugging instincts, and stronger engineering judgment."
      />

      <div className="education-layout">
        <LiquidGlassPane className="education-primary">
          <GraduationCap className="h-7 w-7 text-primary" aria-hidden="true" />
          <p className="eyebrow">New York University</p>
          <h2>BS Computer Science</h2>
          <p>Minor in Mathematics · Class of 2026</p>
          <div className="education-chip-row">
            <span className="pill">Algorithms</span>
            <span className="pill">Databases</span>
            <span className="pill">Systems</span>
            <span className="pill">Applied ML</span>
          </div>
        </LiquidGlassPane>

        <div className="education-side">
          <LiquidGlassPane className="education-card">
            <p className="eyebrow">Certification</p>
            <h3>AWS Certified AI Practitioner</h3>
            <p>Cloud, model lifecycle, responsible AI, and applied infrastructure fundamentals.</p>
          </LiquidGlassPane>
          <LiquidGlassPane className="education-card">
            <p className="eyebrow">Working Style</p>
            <h3>Systems-first, product-aware</h3>
            <p>Prefer direct interfaces, measurable outcomes, and tooling that keeps teams moving.</p>
          </LiquidGlassPane>
        </div>
      </div>
    </div>
  );
};

export const ContactPage = () => {
  usePageMeta(
    "Contact - Kushal Mamillapalli",
    "Contact Kushal Mamillapalli for backend systems, ML infrastructure, and platform engineering opportunities.",
  );

  return (
    <div className="route-page contact-route">
      <div>
        <p className="eyebrow">Contact</p>
        <h1 className="contact-title">Let's build something that holds up.</h1>
        <p className="contact-copy">
          Open to full-time software engineering roles focused on backend systems,
          ML infrastructure, and platform engineering. Email's still the fastest
          way to reach me.
        </p>
      </div>

      <div className="contact-actions">
        <LiquidGlassButton href="mailto:kushalmam06@gmail.com" variant="primary">
          <Mail className="h-4 w-4" aria-hidden="true" /> kushalmam06@gmail.com
        </LiquidGlassButton>
        <LiquidGlassButton
          href="https://github.com/Techdude01"
          target="_blank"
          rel="noreferrer"
          variant="ghost"
        >
          <Github className="h-4 w-4" aria-hidden="true" /> GitHub
        </LiquidGlassButton>
        <LiquidGlassButton
          href="https://linkedin.com/in/kushal-mamillapalli"
          target="_blank"
          rel="noreferrer"
          variant="ghost"
        >
          <Linkedin className="h-4 w-4" aria-hidden="true" /> LinkedIn
        </LiquidGlassButton>
      </div>

      <LiquidGlassPane className="contact-card">
        <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
        <span>Secaucus, NJ</span>
        <span>New York, NY</span>
        <span>785-836-0862</span>
      </LiquidGlassPane>
    </div>
  );
};
