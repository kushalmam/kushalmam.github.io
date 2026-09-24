import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import OrgMark from "./OrgMark";
import ThemeToggle from "./ThemeToggle";
import SignalRoute from "./SignalRoute";
import TextStream from "./TextStream";
import ArrowFillButton from "./ArrowFillButton";
import FlipText from "./FlipText";
import { portfolioProjects } from "../portfolioProjects";

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
const revealDelay = (delay: number): CSSProperties => ({ "--reveal-delay": `${delay}ms` } as CSSProperties);
const contactStreamItems = ["build.", "make.", "ship.", "explore.", "talk."];
const nameStyles = ["plain", "outline", "editorial"] as const;

function LastNameCharacter(character: string, index: number) {
  if (index !== 11) return character;
  return <span className="name-origin-i">ı<span className="name-origin-dot" data-signal-origin="" /></span>;
}

function NameLine({ text, style, last = false }: { text: string; style: typeof nameStyles[number]; last?: boolean }) {
  return <span className={`name-word${last ? " name-word--last" : ""}`}>
    <AnimatePresence initial={false} mode="wait">
      <motion.span
        key={style}
        className={`name-layer name-layer--${style}`}
        initial={{ opacity: 0, rotateX: -64, y: "0.045em", filter: "blur(1px)" }}
        animate={{ opacity: 1, rotateX: 0, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, rotateX: 68, y: "-0.035em", filter: "blur(1px)" }}
        transition={{ duration: .42, ease: [.2, .7, .2, 1] }}
      >
        <FlipText renderCharacter={last ? LastNameCharacter : undefined}>{text}</FlipText>
      </motion.span>
    </AnimatePresence>
  </span>;
}

const projectSignals = [
  ["M0 100 C72 100 82 34 152 34 S248 100 400 100", "M0 100 C86 100 110 72 174 72 S276 100 400 100", "M0 100 C72 100 82 166 152 166 S248 100 400 100"],
  ["M0 100 C88 100 74 30 168 54 S260 151 400 100", "M0 100 C93 100 168 161 232 111 S306 44 400 100", "M0 100 C110 100 116 63 196 100 S308 133 400 100"],
  ["M0 98 C30 30 47 162 76 78 S124 126 156 94 C218 94 286 94 400 94", "M0 104 C40 177 56 26 88 122 S133 77 162 104 C235 104 300 104 400 104", "M0 100 C39 66 61 139 94 88 S134 113 164 100 C236 100 308 100 400 100"],
  ["M0 126 C76 126 86 111 148 111 S204 37 256 37 C308 37 313 70 400 70", "M0 99 C84 99 100 115 154 115 S215 132 266 132 C317 132 326 101 400 101", "M0 70 C81 70 97 87 156 87 S215 62 264 62 C320 62 329 128 400 128"],
];


function navigate(event: MouseEvent<HTMLAnchorElement>) {
  if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const id = event.currentTarget.hash.slice(1);
  document.getElementById(id)?.focus({ preventScroll: true });
}

export default function EditorialPortfolio() {
  const nameRef = useRef<HTMLDivElement>(null);
  const [activeContactWord, setActiveContactWord] = useState<string>();
  const [nameStyleIndex, setNameStyleIndex] = useState(0);
  const nameStyle = nameStyles[nameStyleIndex];
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const cycle = window.setInterval(() => setNameStyleIndex(index => (index + 1) % nameStyles.length), 5600);
    return () => window.clearInterval(cycle);
  }, []);
  useEffect(() => {
    const refreshRoute = window.setTimeout(() => window.dispatchEvent(new Event("signal-route-measure")), 460);
    return () => window.clearTimeout(refreshRoute);
  }, [nameStyle]);
  useLayoutEffect(() => {
    const main = document.querySelector<HTMLElement>("main");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!main || reducedMotion.matches || !("IntersectionObserver" in window)) return;

    const targets = [...main.querySelectorAll<HTMLElement>("[data-reveal]")];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).dataset.revealed = "true";
        observer.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: "0px 0px -6% 0px" });

    targets.forEach(target => {
      target.dataset.revealed = "false";
      observer.observe(target);
    });
    main.dataset.revealReady = "true";
    return () => {
      observer.disconnect();
      delete main.dataset.revealReady;
    };
  }, []);

  return <>
    <a className="skip-link" href="#main" onClick={navigate}>Skip to content</a>
    <header className="site-header">
      <a className="wordmark" href="#top" onClick={navigate} aria-label="Kushal Mamillapalli home">km<span>·</span></a>
      <div className="header-actions"><nav aria-label="Main navigation"><a href="#about" onClick={navigate}>About</a><a href="#work" onClick={navigate}>Work</a><a className="header-contact" href="#contact" onClick={navigate}>Contact <span aria-hidden="true">↗</span></a></nav><ThemeToggle /></div>
    </header>
    <main id="main" tabIndex={-1}>
      <SignalRoute />
      <section className="hero" id="top" tabIndex={-1} aria-labelledby="hero-title">
        <div className="hero-copy"><div className="hero-name" ref={nameRef}>
          <h1 id="hero-title" aria-label="Kushal Mamillapalli">
            <NameLine text="Kushal" style={nameStyle} />
            <NameLine text="Mamillapalli" style={nameStyle} last />
          </h1>
        </div><p className="hero-role">Data Engineer</p></div>
        <div className="hero-bottom"><p>I make data <em>go places.</em></p><a href="#work" onClick={navigate}>Selected work <span aria-hidden="true">↓</span></a></div>
      </section>
      <section className="about section" id="about" tabIndex={-1} aria-labelledby="about-title">
        <figure className="about-portrait" data-reveal><img src={asset("images/portrait.jpg")} alt="Kushal overlooking the New York skyline" width="720" height="709" loading="lazy" /></figure>
        <div className="about-content">
          <h2 className="about-lead" id="about-title" data-reveal style={revealDelay(60)}>Data pipelines.<br />Real impact.</h2>
          <p className="about-text" data-reveal style={revealDelay(120)}>I build data pipelines and recommendation systems that turn messy inputs into reliable products.</p>
          <div className="about-affiliations">
            <div className="affiliation" data-reveal style={revealDelay(180)}><OrgMark name="spotify" /><span>Spotify<small>Data Engineer</small></span></div>
            <div className="affiliation affiliation--nyu" data-reveal style={revealDelay(230)}><OrgMark name="nyu" /><span>NYU Tandon<small>Computer Science ’26</small></span></div>
            <div className="affiliation" data-reveal style={revealDelay(280)}><OrgMark name="arc" /><span>ARC Robotics<small>Former RoboMaster CV Lead</small></span></div>
          </div>
          <p className="about-offscreen" data-reveal style={revealDelay(320)}>Usually building Gunpla or watching a murder mystery. Sometimes on the basketball court.</p>
        </div>
      </section>
      <section className="work section" id="work" tabIndex={-1} aria-labelledby="work-title">
        <div className="work-heading"><h2 id="work-title" data-reveal>Selected work<span>.</span></h2></div>
        <div className="project-grid">{portfolioProjects.map((project, index) => <article className={`project-card project-card--${index}`} key={project.name}>
          <a href={project.href} target="_blank" rel="noopener noreferrer" aria-label={`View ${project.name} on GitHub`} data-reveal style={revealDelay(index * 85)}>
            <div className="project-image"><img src={asset(`images/projects/${project.image}`)} alt={project.alt} loading="lazy" width="1400" height="800" /><svg className="project-signal" viewBox="0 0 400 200" preserveAspectRatio="none" aria-hidden="true">{projectSignals[index].map((d, strand) => <path key={strand} d={d} />)}</svg><span className="project-open" aria-hidden="true">↗</span></div>
            <div className="project-caption"><h3>{project.name}</h3><p>{project.description}</p></div>
          </a>
        </article>)}</div>
      </section>
      <section className="contact section" id="contact" tabIndex={-1} aria-labelledby="contact-title" data-stream-active={activeContactWord ?? undefined}>
        <h2 id="contact-title" aria-label="Let’s build, make, ship, explore, and talk." data-reveal><TextStream
          prefix={<>Let<span className="signal-terminal">’<span className="signal-terminal-socket" data-signal-terminal="" /></span>s</>}
          items={contactStreamItems}
          className="contact-stream"
          onActiveItemChange={setActiveContactWord}
        /></h2>
        <a className="email-link" href="mailto:kushalmam06@gmail.com" data-reveal style={revealDelay(100)}>kushalmam06@gmail.com <span aria-hidden="true">↗</span></a>
        <div className="contact-bottom" data-reveal style={revealDelay(180)}><ArrowFillButton className="resume-link" bgColor="var(--cta-base)" textColor="var(--cta-text)" href={asset("documents/kushal-mamillapalli-resume.pdf")} target="_blank" rel="noopener noreferrer"><span className="resume-link__content"><span>Résumé</span><span className="resume-link__format">PDF ↗</span></span></ArrowFillButton><nav aria-label="Professional links"><a href="https://linkedin.com/in/kushal-mamillapalli" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a><a href="https://github.com/Techdude01" target="_blank" rel="noopener noreferrer">GitHub ↗</a></nav></div>
      </section>
    </main>
    <footer><span>© {new Date().getFullYear()} Kushal Mamillapalli</span><a href="#top" onClick={navigate}>Back to top ↑</a></footer>
  </>;
}
