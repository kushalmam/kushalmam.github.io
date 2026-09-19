import { useState, type MouseEvent } from "react";
import { projects, experiences } from "../content";
import OrgMark from "./OrgMark";
import SiteHeader from "./SiteHeader";
import ProjectVisual from "./ProjectVisual";
import AssemblyVisual from "./AssemblyVisual";

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

export default function EditorialPortfolio() {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  const focusSectionAfterNavigation = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) return;
    const href = event.currentTarget.getAttribute("href");
    if (!href?.startsWith("#")) return;
    const target = document.getElementById(href.slice(1));
    if (!target) return;
    window.setTimeout(() => {
      if (target instanceof HTMLElement) {
        target.focus({ preventScroll: true });
      }
    }, 0);
  };

  const renderProject = (project: (typeof projects)[number], index: number) => (
    <article
      className={`project project--${project.composition}`}
      data-project-index={index}
      key={project.name}
      data-selected={selectedProject === index || undefined}
      aria-labelledby={`project-title-${index}`}
    >
      <div className="project-index"><span>0{index + 1} / 03</span></div>
      <header className="project-heading">
        <div>
          <p className="eyebrow">{project.category}</p>
          <h3 id={`project-title-${index}`}>{project.name}</h3>
        </div>
      </header>
      <div className="project-thesis">
        <p>{project.detail}</p>
        <p className="project-contribution">{project.contribution}</p>
      </div>
      <p className="project-stack">{project.stack}</p>
      <div className="project-evidence">
        <strong>
          {project.evidenceValue}{" "}
          <small>{project.evidenceUnit}</small>
        </strong>
        <span>{project.context}</span>
      </div>
      <ProjectVisual project={project} />
      <details
        open={selectedProject === index}
        onToggle={(event) => {
          const open = event.currentTarget.open;
          setSelectedProject((current) =>
            open ? index : current === index ? null : current,
          );
        }}
      >
        <summary
          id={`project-summary-${index}`}
          aria-controls={`project-details-${index}`}
        >
          <span>Inside {project.name}</span>
          <span className="disclosure-mark" aria-hidden="true">
            ↓
          </span>
        </summary>
        <div
          id={`project-details-${index}`}
          className="case-study"
          role="region"
          aria-labelledby={`project-summary-${index}`}
        >
          {project.caseStudy.map((part) => (
            <div key={part.title}>
              <h4>{part.title}</h4>
              <p>{part.text}</p>
            </div>
          ))}
        </div>
      </details>
      <div
        className="project-links"
        role="group"
        aria-label={`${project.name} links`}
      >
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
  );

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <section
          className="hero sculpture-hero"
          id="top"
          tabIndex={-1}
          aria-labelledby="hero-title"
          data-depth="0"
        >
          <div className="hero-layout content-grid">
            <div className="hero-copy">
              <p className="eyebrow">
                Data infrastructure<br />
                Backend systems · Applied ML
              </p>
              <h1 id="hero-title">
                <span>Behind the</span> <em>interface.</em>
              </h1>
              <p className="hero-intro">
                I build the systems that move, shape,
                and serve data at scale.
              </p>
              <a
                className="text-link hero-link"
                href="#work"
                onClick={focusSectionAfterNavigation}
              >
                Explore systems <span aria-hidden="true">↓</span>
              </a>
            </div>
            <AssemblyVisual />
          </div>
        </section>

        <section className="current-work content-grid" aria-labelledby="current-work-title">
          <p className="eyebrow"><span className="status-dot" /> Currently at Spotify</p>
          <div>
            <h2 id="current-work-title">Behind a more personal listening experience.</h2>
            <p>Improving personalization data pipelines as a Data Engineer (Emerging Talent).</p>
          </div>
          <a className="text-link" href="#experience" onClick={focusSectionAfterNavigation}>Experience <span aria-hidden="true">↗</span></a>
        </section>

        <section
          className="section work content-grid"
          id="work"
          tabIndex={-1}
          aria-labelledby="work-title"
          data-depth="2"
        >
          <header className="section-heading">
            <p className="section-label">Selected system / 01</p>
            <h2 id="work-title">Retrieval. Ranking. Real constraints.</h2>
          </header>
          {renderProject(projects[0], 0)}
        </section>

        <section
          className="section about content-grid"
          id="about"
          tabIndex={-1}
          aria-labelledby="about-title"
          data-depth="1"
        >
          <header className="section-heading">
            <h2 id="about-title">A little about me.</h2>
          </header>
          <div className="about-grid">
            <div className="about-copy">
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
              <p>
                Outside of work, I enjoy building Gunpla, playing basketball,
                and watching murder mysteries.
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
          <section className="experience" id="experience" tabIndex={-1} aria-labelledby="experience-title">
            <h3 className="eyebrow" id="experience-title">Experience</h3>
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
          </section>
        </section>

        <section className="section work content-grid" id="more-work" tabIndex={-1} aria-labelledby="more-work-title" data-depth="2">
          <header className="section-heading">
            <p className="section-label">More work / 02—03</p>
            <h2 id="more-work-title">Projects & experiments.</h2>
          </header>
          {projects.slice(1).map((project, index) => renderProject(project, index + 1))}
        </section>

        <section
          className="section contact content-grid"
          id="contact"
          tabIndex={-1}
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
          <nav className="social-links" aria-label="Professional links">
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
          </nav>
        </section>
      </main>
      <footer className="content-grid">
        <span>© {new Date().getFullYear()} Kushal Mamillapalli</span>
        <a href="#top" onClick={focusSectionAfterNavigation}>Back to the surface ↑</a>
      </footer>
    </>
  );
}
