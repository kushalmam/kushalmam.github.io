import type { MouseEvent } from "react";
import OrgMark from "./OrgMark";
import ThemeToggle from "./ThemeToggle";
import SignalRoute from "./SignalRoute";
import { portfolioProjects } from "../portfolioProjects";

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;


function navigate(event: MouseEvent<HTMLAnchorElement>) {
  if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const id = event.currentTarget.hash.slice(1);
  document.getElementById(id)?.focus({ preventScroll: true });
}

export default function EditorialPortfolio() {
  return <>
    <a className="skip-link" href="#main" onClick={navigate}>Skip to content</a>
    <header className="site-header">
      <a className="wordmark" href="#top" onClick={navigate} aria-label="Kushal Mamillapalli home">km<span>·</span></a>
      <div className="header-actions"><nav aria-label="Main navigation"><a href="#about" onClick={navigate}>About</a><a href="#work" onClick={navigate}>Work</a><a className="header-contact" href="#contact" onClick={navigate}>Contact <span aria-hidden="true">↗</span></a></nav><ThemeToggle /></div>
    </header>
    <main id="main" tabIndex={-1}>
      <SignalRoute />
      <section className="hero" id="top" tabIndex={-1} aria-labelledby="hero-title">
        <div className="hero-copy"><h1 id="hero-title"><span>Kushal</span>{" "}<span>Mamillapalli<span className="name-period">.</span></span></h1><p className="hero-role">Data Engineer</p></div>
        <div className="hero-bottom"><p>I make data <em>go places.</em></p><a href="#work" onClick={navigate}>Selected work <span aria-hidden="true">↓</span></a></div>
      </section>
      <section className="about section" id="about" tabIndex={-1} aria-labelledby="about-title">
        <figure className="about-portrait"><img src={asset("images/portrait.jpg")} alt="Kushal overlooking the New York skyline" width="720" height="709" loading="lazy" /></figure>
        <div className="about-content">
          <h2 className="about-lead" id="about-title">Data pipelines.<br />Real impact.</h2>
          <p className="about-text">I build data pipelines and recommendation systems. At NYU’s Team Ultraviolet, I led computer vision for RoboMaster robots.</p>
          <div className="about-affiliations">
            <div className="affiliation"><OrgMark name="spotify" /><span>Spotify<small>Data Engineer</small></span></div>
            <div className="affiliation affiliation--nyu"><OrgMark name="nyu" /><span>NYU Tandon<small>Computer Science ’26</small></span></div>
            <div className="affiliation"><OrgMark name="arc" /><span>Team Ultraviolet<small>RoboMaster · Computer Vision Lead</small></span></div>
          </div>
          <p className="about-offscreen">Usually building Gunpla or watching a murder mystery. Sometimes on the basketball court.</p>
        </div>
      </section>
      <section className="work section" id="work" tabIndex={-1} aria-labelledby="work-title">
        <div className="work-heading"><h2 id="work-title">Selected work<span>.</span></h2></div>
        <div className="project-grid">{portfolioProjects.map((project, index) => <article className={`project-card project-card--${index}`} key={project.name}>
          <a href={project.href} target="_blank" rel="noopener noreferrer" aria-label={`View ${project.name} on GitHub`}>
            <div className="project-image"><img src={asset(`images/projects/${project.image}`)} alt={project.alt} loading="lazy" width="1400" height="800" /><span className="project-open" aria-hidden="true">↗</span></div>
            <div className="project-caption"><h3>{project.name}</h3><p>{project.description}</p></div>
          </a>
        </article>)}</div>
      </section>
      <section className="contact section" id="contact" tabIndex={-1} aria-labelledby="contact-title">
        <h2 id="contact-title">Let’s talk<span>.</span></h2>
        <a className="email-link" href="mailto:kushalmam06@gmail.com">kushalmam06@gmail.com <span aria-hidden="true">↗</span></a>
        <div className="contact-bottom"><a className="resume-link" href={asset("documents/kushal-mamillapalli-resume.pdf")} target="_blank" rel="noopener noreferrer">Résumé <span>PDF ↗</span></a><nav aria-label="Professional links"><a href="https://linkedin.com/in/kushal-mamillapalli" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a><a href="https://github.com/Techdude01" target="_blank" rel="noopener noreferrer">GitHub ↗</a></nav></div>
      </section>
    </main>
    <footer><span>© {new Date().getFullYear()} Kushal Mamillapalli</span><a href="#top" onClick={navigate}>Back to top ↑</a></footer>
  </>;
}
