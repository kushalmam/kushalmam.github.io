import { useState } from "react";
import { projects, experiences } from "../content";
import OrgMark from "./OrgMark";
import SiteHeader from "./SiteHeader";
import SystemsScene from "./SystemsScene";

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

export default function EditorialPortfolio() {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader />
      <SystemsScene selectedProject={selectedProject} />
      <main id="main" tabIndex={-1}>
        <section
          className="hero"
          id="top"
          aria-labelledby="hero-title"
          data-depth="0"
        >
          <div className="hero-copy content-grid">
            <p className="eyebrow">
              Data infrastructure · Backend · Applied ML
            </p>
            <h1 id="hero-title">
              <span>Behind the</span> <em>interface.</em>
            </h1>
            <p className="hero-intro">
              I’m Kushal. I build the systems
              <br className="desktop-break" /> that make the surface possible.
            </p>
            <p className="current-role">
              <span className="status-dot" />
              Data Engineer (Emerging Talent) at Spotify
            </p>
            <a className="text-link hero-link" href="#work">
              Explore selected work <span aria-hidden="true">↓</span>
            </a>
          </div>
        </section>

        <section
          className="section about content-grid"
          id="about"
          aria-labelledby="about-title"
          data-depth="1"
        >
          <header className="section-heading">
            <h2 id="about-title">A little about me.</h2>
          </header>
          <div className="about-grid">
            <div className="about-copy">
              <p className="lead">
                A useful interface starts with a system you can trust.
              </p>
              <p>
                I’m a 2026 Computer Science graduate from NYU Tandon and a Data
                Engineer (Emerging Talent) at Spotify, improving personalization
                data pipelines.
              </p>
              <p>
                My work has ranged from university data pipelines to computer
                vision for competition robots. I enjoy getting a system working,
                understanding where it breaks, and making it more reliable.
              </p>
            </div>
            <figure className="portrait">
              <img
                src={asset("images/portrait.jpg")}
                alt="Kushal Mamillapalli outdoors"
                loading="lazy"
                width="360"
                height="450"
              />
              <figcaption>Outside the editor.</figcaption>
            </figure>
          </div>
          <div className="experience" id="experience">
            <h3 className="eyebrow">Experience</h3>
            {experiences.map((experience) => (
              <article className="experience-row" key={experience.name}>
                <div>
                  <h4>
                    <OrgMark name={experience.mark} />
                    {experience.name}
                  </h4>
                  <p className="meta">{experience.period}</p>
                </div>
                <div>
                  <p>{experience.role}</p>
                  <p className="muted">{experience.detail}</p>
                  {experience.previous && (
                    <p className="previous-role">{experience.previous}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className="section work content-grid"
          id="work"
          aria-labelledby="work-title"
          data-depth="2"
        >
          <header className="section-heading">
            <p className="section-label">Selected work</p>
            <h2 id="work-title">Built below the surface.</h2>
          </header>
          {projects.map((project, index) => (
            <article
              className={`project project--${project.composition}`}
              key={project.name}
              data-selected={selectedProject === index || undefined}
            >
              <div className="project-heading">
                <div>
                  <p className="eyebrow">{project.category}</p>
                  <h3>{project.name}</h3>
                </div>
              </div>
              <p className="project-thesis">{project.detail}</p>
              <p className="project-stack">{project.stack}</p>
              <div className="project-evidence">
                <strong>
                  {project.evidenceValue}
                  <small>{project.evidenceUnit}</small>
                </strong>
                <span>{project.context}</span>
              </div>
              <details
                open={selectedProject === index}
                onToggle={(event) => {
                  const open = event.currentTarget.open;
                  setSelectedProject((current) =>
                    open ? index : current === index ? null : current,
                  );
                }}
              >
                <summary>
                  <span>Inside {project.name}</span>
                  <span className="disclosure-mark" aria-hidden="true">
                    ↓
                  </span>
                </summary>
                <div className="case-study">
                  {project.caseStudy.map((part) => (
                    <div key={part.title}>
                      <h4>{part.title}</h4>
                      <p>{part.text}</p>
                    </div>
                  ))}
                </div>
              </details>
              <div className="project-links">
                {project.sources.map((source) => (
                  <a
                    key={source.href}
                    href={source.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {source.label}
                    <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section
          className="section contact content-grid"
          id="contact"
          aria-labelledby="contact-title"
          data-depth="3"
        >
          <h2 id="contact-title">
            Let’s build
            <br />
            <em>something useful.</em>
          </h2>
          <p>For work or a conversation, email me.</p>
          <a className="email-link" href="mailto:kushalmam06@gmail.com">
            kushalmam06@gmail.com <span aria-hidden="true">↗</span>
          </a>
          <div className="social-links">
            <a
              href={asset("documents/kushal-mamillapalli-resume.pdf")}
              target="_blank"
              rel="noopener noreferrer"
            >
              Résumé <span className="meta">PDF ↗</span>
            </a>
            <a
              href="https://linkedin.com/in/kushal-mamillapalli"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn ↗
            </a>
            <a
              href="https://github.com/Techdude01"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub ↗
            </a>
          </div>
        </section>
      </main>
      <footer className="content-grid">
        <span>© {new Date().getFullYear()} Kushal Mamillapalli</span>
        <a href="#top">Back to the surface ↑</a>
      </footer>
    </>
  );
}
