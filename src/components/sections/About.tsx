const skillGroups: { label: string; items: string[] }[] = [
  {
    label: "Languages",
    items: ["Python", "SQL", "C++", "TypeScript", "Java", "Bash"],
  },
  { label: "Backend", items: ["FastAPI", "Flask", "Nginx", "SQLAlchemy"] },
  {
    label: "Data / ML",
    items: [
      "PostgreSQL",
      "Snowflake",
      "Parquet",
      "scikit-learn",
      "Prophet",
      "Optuna",
      "TensorRT",
      "YOLOv8",
    ],
  },
  { label: "Frontend", items: ["Next.js", "React", "Recharts"] },
  {
    label: "Cloud / Infra",
    items: ["AWS EC2", "AWS Lambda", "Docker", "GitLab CI", "ROS2"],
  },
];

const experience = [
  {
    role: "Incoming Data Engineering Intern",
    company: "Spotify · Personalization",
    period: "Incoming",
    detail: "Incoming on the personalization  team.",
  },
  {
    role: "Data Engineer",
    company: "NYU Enterprise Data Management",
    period: "Apr 2025 — Present",
    detail:
      "Optimize ETL pipelines into Snowflake and keep an eye on data quality across enrollment systems.",
  },
  {
    role: "Computer Vision Lead",
    company: "RoboMaster · Ultraviolet",
    period: "Jan 2024 — Present",
    detail:
      "Lead the CV stack for autonomous targeting: YOLOv8 + TensorRT on Jetson, with a ROS2 control loop under 30ms.",
  },
];

const About = () => {
  return (
    <section
      id="about"
      className="relative py-28 md:py-36 border-t border-white/5"
    >
      <div className="mx-auto max-w-6xl px-6">
        <p className="eyebrow mb-4">About</p>
        <h2 className="font-display text-4xl md:text-5xl leading-[1.05] max-w-3xl">
          I like systems that have to be fast and correct.
        </h2>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-5 text-muted-foreground leading-relaxed">
            <p>
              I am studying CS with a Minor in Math at NYU (BS '26). Most of my
              time goes into low-latency systems, data work, and ML when it
              actually needs to ship.
            </p>
            <p>
              Lately that's meant optimizing ETL pipelines into Snowflake at
              NYU's data team, real-time autonomous targeting for RoboMaster,
              and weekend builds like an agentic Polymarket researcher and a
              hackathon-winning live medical coder.
            </p>
            <p>
              I care about the boring details like caching, p99s, schema design
              because that's usually where the real difference shows up.
            </p>

            <div className="pt-6">
              <h3 className="eyebrow text-foreground/90 mb-5">Experience</h3>
              <ul className="space-y-5">
                {experience.map((e) => (
                  <li key={e.company} className="surface-card p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {e.role}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {e.company}
                        </p>
                      </div>
                      <span className="text-[11px] text-muted-foreground/80 font-mono">
                        {e.period}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                      {e.detail}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6">
              <h3 className="eyebrow text-foreground/90 mb-4">
                Education &amp; Certifications
              </h3>
              <div className="surface-card p-5 text-sm">
                <p className="text-foreground font-medium">
                  New York University
                </p>
                <p className="text-muted-foreground">
                  BS Computer Science · 2026 · MS Financial Engineering · 2027
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="pill">AWS Certified AI Practitioner</span>
                  <span className="pill">Bloomberg Market Concepts</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="eyebrow text-foreground/90 mb-5">Skills</h3>
            <div className="space-y-6">
              {skillGroups.map((g) => (
                <div key={g.label}>
                  <p className="text-xs text-muted-foreground/80 mb-2.5">
                    {g.label}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {g.items.map((s) => (
                      <span key={s} className="pill">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
