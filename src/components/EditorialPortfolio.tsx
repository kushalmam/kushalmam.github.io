import { useState, type CSSProperties, type MouseEvent } from "react";
import { useLenis } from "lenis/react";
import OrgMark from "./OrgMark";
import TextStream from "./TextStream";
import SocialMark from "./SocialMark";
import DegradedName from "./DegradedName";
import { portfolioProjects } from "../portfolioProjects";
import { useScrollScenes } from "./useScrollScenes";
import { usePipelineGuide } from "./usePipelineGuide";

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
const contactStreamItems = ["build.", "make.", "ship.", "explore.", "talk."];
const stages = [
  { stage: "Ingest", section: "Intro", href: "#top" },
  { stage: "Route", section: "About", href: "#about" },
  { stage: "Transform", section: "Work", href: "#work" },
  { stage: "Output", section: "Contact", href: "#contact" },
];

const index = (value: number) => String(value + 1).padStart(2, "0");

export default function EditorialPortfolio() {
  const [activeContactWord, setActiveContactWord] = useState<string>();
  const lenis = useLenis();
  useScrollScenes();
  usePipelineGuide();

  const navigate = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const hash = event.currentTarget.hash;
    const target = document.getElementById(hash.slice(1));
    if (!target) return;
    if (lenis) {
      event.preventDefault();
      if (window.location.hash !== hash) window.history.pushState(null, "", hash);
      lenis.scrollTo(target);
    }
    target.focus({ preventScroll: true });
  };

  return <>
    <a className="skip-link" href="#main" onClick={navigate}>Skip to content</a>
    <header className="site-header">
      <a className="wordmark" href="#top" onClick={navigate} aria-label="Kushal Mamillapalli home">km</a>
      <nav className="stages" aria-label="Main navigation">
        {stages.map(item => <a key={item.href} href={item.href} onClick={navigate} data-stage="">
          {item.stage}<span className="visually-hidden"> — {item.section}</span>
        </a>)}
      </nav>
    </header>
    <span className="guide-dot" data-guide-dot="" aria-hidden="true"><span className="guide-dot__label" data-guide-label="">Ingest</span></span>
    <main id="main" tabIndex={-1}>
      <section className="hero" id="top" tabIndex={-1} aria-labelledby="hero-title">
        <div className="hero-name">
          <DegradedName />
        </div>
        <p className="hero-role">I make data <em>go places.</em></p>
      </section>

      <div className="bridge bridge--ingest" data-gate="" aria-hidden="true">
        <div className="ingest-stage">
          <span className="ingest-stage__door ingest-stage__door--top" />
          <span className="ingest-stage__door ingest-stage__door--bottom" />
          <span className="ingest-stage__grid" />
          <span className="ingest-stage__track">
            <span className="ingest-stage__line" />
            <span className="ingest-stage__line ingest-stage__line--lit" />
            <span className="ingest-stage__fill" />
            <span className="ingest-stage__dot" />
          </span>
        </div>
      </div>

      <section className="about section" id="about" tabIndex={-1} aria-labelledby="about-title">
        <h2 className="about-lead" id="about-title"><span>Data pipelines.</span><span>Real impact.</span></h2>
        <figure className="about-portrait">
          <img src={asset("images/portrait.jpg")} alt="Kushal overlooking the New York skyline" width="720" height="709" loading="lazy" />
        </figure>
        <p className="about-text">I build recommendation systems and the infrastructure behind them, turning messy inputs into reliable products.</p>
        <div className="about-affiliations">
          <div className="affiliation"><OrgMark name="spotify" /><span>Spotify<small>Data Engineer</small></span></div>
          <div className="affiliation affiliation--nyu"><OrgMark name="nyu" /><span>NYU Tandon<small>Computer Science ’26</small></span></div>
          <div className="affiliation"><OrgMark name="arc" /><span>ARC Robotics<small>Former RoboMaster CV Lead</small></span></div>
        </div>
        <p className="about-offscreen">Usually building Gunpla or watching a murder mystery. Sometimes on the basketball court.</p>
      </section>

      <div className="bridge bridge--flood" data-flood-bridge="" aria-hidden="true">
        <span className="flood" data-flood=""><span className="flood__disc" /></span>
      </div>

      <section className="work section" id="work" tabIndex={-1} aria-labelledby="work-title">
        <h2 className="work-title" id="work-title">Selected work<span>.</span></h2>
        <ol className="project-index">
          {portfolioProjects.map((project, position) => <li className="project-row" key={project.name}>
            <a className="project-card" href={project.href} target="_blank" rel="noopener noreferrer" aria-label={`View ${project.name} on GitHub`}>
              <div className="project-text">
                <span className="project-number">{index(position)}</span>
                <h3>{project.name}</h3>
                <p className="project-category">{project.category}</p>
                <p className="project-description">{project.description}</p>
              </div>
              <div className="project-media">
                <img src={asset(`images/projects/${project.image}`)} alt={project.alt} loading="lazy" width={project.width} height={project.height} />
              </div>
            </a>
          </li>)}
        </ol>
      </section>

      <div className="bridge bridge--columns" data-scene="" aria-hidden="true">
        <div className="bridge__stage">{Array.from({ length: 12 }, (_, column) => <span key={column} style={{ "--i": column } as CSSProperties} />)}</div>
      </div>

      <section className="contact section" id="contact" tabIndex={-1} aria-labelledby="contact-title" data-scene="" data-stream-active={activeContactWord ?? undefined}>
        <div className="contact-mask">
          <h2 id="contact-title" aria-label="Let’s build, make, ship, explore, and talk."><TextStream
            prefix={<>Let<span className="contact-apostrophe">’</span>s</>}
            items={contactStreamItems}
            className="contact-stream"
            onActiveItemChange={setActiveContactWord}
          /></h2>
        </div>
        <nav className="contact-grid" aria-label="Professional links">
          <a className="contact-cell contact-cell--email" href="mailto:kushalmam06@gmail.com"><span className="contact-cell__label">Email</span><span className="contact-cell__value">kushalmam06@gmail.com</span><span className="contact-cell__arrow" aria-hidden="true">↗</span></a>
          <a className="contact-cell" href={asset("documents/kushal-mamillapalli-resume.pdf")} target="_blank" rel="noopener noreferrer"><span className="contact-cell__label">PDF</span><span className="contact-cell__value">Résumé</span><span className="contact-cell__arrow" aria-hidden="true">↗</span></a>
          <a className="contact-cell" href="https://linkedin.com/in/kushal-mamillapalli" target="_blank" rel="noopener noreferrer"><span className="contact-cell__label"><SocialMark name="linkedin" /></span><span className="contact-cell__value">LinkedIn</span><span className="contact-cell__arrow" aria-hidden="true">↗</span></a>
          <a className="contact-cell" href="https://github.com/Techdude01" target="_blank" rel="noopener noreferrer"><span className="contact-cell__label"><SocialMark name="github" /></span><span className="contact-cell__value">GitHub</span><span className="contact-cell__arrow" aria-hidden="true">↗</span></a>
        </nav>
      </section>
    </main>
  </>;
}
