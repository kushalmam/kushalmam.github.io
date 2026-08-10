import { useEffect, useRef, useState, type CSSProperties } from "react";

const sections = [
  ["Intro", "#221E33"],
  ["NBAnomaly", "#3346D3"],
  ["AutoCPT", "#E82D7B"],
  ["MarketMind", "#0B9B85"],
  ["Experience", "#7B3FD1"],
  ["Resume", "#5B5670"],
  ["Contact", "#C87F00"],
] as const;

type BloomProps = {
  className?: string;
  style: CSSProperties;
};

const Bloom = ({ className = "", style }: BloomProps) => (
  <div className={`bloom ${className}`} style={style} />
);

const MobileBloom = ({ style }: { style: CSSProperties }) => (
  <div className="m-bloom" style={style} />
);

const Pigment = ({ children, className = "", style }: { children: string; className?: string; style?: CSSProperties }) => (
  <p className={`pigment ${className}`} style={style}>
    <span className="dot" />
    {children}
  </p>
);

const Chips = ({ children }: { children: string[] }) => (
  <div className="chips">
    {children.map((chip) => (
      <span className="chip" key={chip}><span>{chip}</span></span>
    ))}
  </div>
);

const WatercolorFilters = () => (
  <svg width="0" height="0" className="watercolor-filters" aria-hidden="true">
    <defs>
      <filter id="wc" x="-30%" y="-30%" width="160%" height="160%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.016" numOctaves="4" seed="7" result="t" />
        <feDisplacementMap in="SourceGraphic" in2="t" scale="120" />
      </filter>
      <filter id="wc-seam" x="-60%" y="-10%" width="220%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.008 0.045" numOctaves="4" seed="11" result="t" />
        <feDisplacementMap in="SourceGraphic" in2="t" scale="160" />
      </filter>
      <filter id="wc-soft" x="-40%" y="-60%" width="180%" height="220%">
        <feTurbulence type="fractalNoise" baseFrequency="0.06 0.14" numOctaves="3" seed="3" result="t" />
        <feDisplacementMap in="SourceGraphic" in2="t" scale="10" />
      </filter>
    </defs>
  </svg>
);

const MobileWatercolorFlow = () => (
  <div className="mobile-watercolor-flow" aria-hidden="true">
    <span className="mobile-watercolor-wash mobile-watercolor-wash--one" />
    <span className="mobile-watercolor-wash mobile-watercolor-wash--two" />
    <span className="mobile-watercolor-wash mobile-watercolor-wash--three" />
    <span className="mobile-watercolor-wash mobile-watercolor-wash--four" />
    <span className="mobile-watercolor-wash mobile-watercolor-wash--five" />
    <span className="mobile-watercolor-wash mobile-watercolor-wash--six" />
    <span className="mobile-watercolor-wash mobile-watercolor-wash--seven" />
  </div>
);

const WatercolorPortfolio = () => {
  const runwayRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLElement>(null);
  const inksRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    const runway = runwayRef.current;
    const track = trackRef.current;
    const inks = inksRef.current;
    const bar = barRef.current;

    if (!runway || !track || !inks || !bar) return;

    const panels = Array.from(track.querySelectorAll<HTMLElement>(".panel"));
    const contents = panels.map((panel) => panel.querySelector<HTMLElement>(".content"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 720px)");
    let maxX = 0;
    let targetX = 0;
    let renderedX = 0;
    let frame = 0;
    let lastIndex = 0;

    const isMobile = () => mobile.matches;

    const apply = (x: number) => {
      track.style.transform = `translate3d(${-x}px, 0, 0)`;

      if (!reducedMotion.matches) {
        inks.style.transform = `translate3d(${x * 0.22}px, 0, 0)`;

        contents.forEach((content, index) => {
          if (!content) return;
          const distance = (index * window.innerWidth - x) / window.innerWidth;
          const amount = Math.min(Math.abs(distance), 1);
          content.style.opacity = String(1 - amount * 0.55);
          content.style.transform = `translate3d(${distance * 60}px, 0, 0)`;
        });
      }

      if (maxX > 0) {
        bar.style.width = `${(x / maxX) * 100}%`;
        const index = Math.min(Math.round(x / window.innerWidth), sections.length - 1);
        if (index !== lastIndex) {
          lastIndex = index;
          setActiveSection(index);
        }
      }
    };

    const render = () => {
      const difference = targetX - renderedX;
      renderedX = reducedMotion.matches || Math.abs(difference) < 0.1
        ? targetX
        : renderedX + difference * 0.15;
      apply(renderedX);

      if (Math.abs(targetX - renderedX) >= 0.1) {
        frame = window.requestAnimationFrame(render);
      } else {
        frame = 0;
      }
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(render);
    };

    const update = () => {
      if (isMobile()) return;
      targetX = Math.min(Math.max(-runway.getBoundingClientRect().top, 0), maxX);
      schedule();
    };

    const onWheel = (event: WheelEvent) => {
      if (isMobile()) return;

      const atStart = window.scrollY <= 0;
      const atEnd = window.scrollY >= maxX - 1;

      if ((event.deltaY < 0 && atStart) || (event.deltaY > 0 && atEnd)) {
        event.preventDefault();
      }
    };

    const size = () => {
      if (isMobile()) {
        runway.style.height = "";
        track.style.transform = "";
        inks.style.transform = "";
        contents.forEach((content) => {
          if (!content) return;
          content.style.opacity = "";
          content.style.transform = "";
        });
        return;
      }

      maxX = track.scrollWidth - window.innerWidth;
      runway.style.height = `${window.innerHeight + maxX}px`;
      targetX = Math.min(Math.max(-runway.getBoundingClientRect().top, 0), maxX);
      renderedX = targetX;
      apply(renderedX);
    };

    const onKeydown = (event: KeyboardEvent) => {
      if (isMobile()) return;
      if (event.key === "ArrowRight") window.scrollBy({ top: window.innerWidth, behavior: "smooth" });
      if (event.key === "ArrowLeft") window.scrollBy({ top: -window.innerWidth, behavior: "smooth" });
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", size);
    window.addEventListener("keydown", onKeydown);
    mobile.addEventListener("change", size);
    reducedMotion.addEventListener("change", size);
    size();

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", size);
      window.removeEventListener("keydown", onKeydown);
      mobile.removeEventListener("change", size);
      reducedMotion.removeEventListener("change", size);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <WatercolorFilters />
      <div className="runway" id="runway" ref={runwayRef}>
        <div className="stage">
          <main className="track" id="track" ref={trackRef}>
            <div className="inks" id="inks" ref={inksRef} aria-hidden="true">
              <Bloom style={{ width: "60vw", height: "60vw", left: "48vw", top: "-16vw", background: "radial-gradient(circle at 38% 42%, rgba(51,70,211,.85) 0%, rgba(123,63,209,.55) 42%, rgba(123,63,209,0) 70%)" }} />
              <Bloom className="b2" style={{ width: "46vw", height: "46vw", left: "64vw", bottom: "-18vw", background: "radial-gradient(circle at 55% 45%, rgba(232,45,123,.8) 0%, rgba(245,166,28,.5) 48%, rgba(245,166,28,0) 72%)" }} />
              <Bloom style={{ width: "28vw", height: "28vw", left: "-10vw", bottom: "-8vw", animationDelay: "-9s", background: "radial-gradient(circle at 50% 50%, rgba(11,155,133,.7) 0%, rgba(11,155,133,0) 70%)" }} />
              <div className="seam" style={{ left: "96vw", background: "linear-gradient(180deg, rgba(51,70,211,.55), rgba(51,70,211,.15) 60%, rgba(51,70,211,0))" }} />
              <Bloom style={{ width: "64vw", height: "64vw", left: "82vw", top: "-20vw", background: "radial-gradient(circle at 45% 50%, rgba(51,70,211,.7) 0%, rgba(51,70,211,.3) 45%, rgba(51,70,211,0) 70%)" }} />
              <Bloom className="b2" style={{ width: "32vw", height: "32vw", left: "160vw", bottom: "-10vw", background: "radial-gradient(circle at 50% 50%, rgba(123,63,209,.5) 0%, rgba(123,63,209,0) 70%)" }} />
              <div className="seam" style={{ left: "196vw", background: "linear-gradient(180deg, rgba(232,45,123,0), rgba(232,45,123,.45) 40%, rgba(51,70,211,.35))" }} />
              <Bloom style={{ width: "62vw", height: "62vw", left: "186vw", top: "-14vw", background: "radial-gradient(circle at 48% 46%, rgba(232,45,123,.72) 0%, rgba(232,45,123,.3) 46%, rgba(232,45,123,0) 70%)" }} />
              <Bloom className="b2" style={{ width: "34vw", height: "34vw", left: "255vw", bottom: "-12vw", background: "radial-gradient(circle at 50% 50%, rgba(245,166,28,.55) 0%, rgba(245,166,28,0) 70%)" }} />
              <div className="seam" style={{ left: "296vw", background: "linear-gradient(180deg, rgba(11,155,133,.4), rgba(232,45,123,.35) 55%, rgba(232,45,123,0))" }} />
              <Bloom style={{ width: "64vw", height: "64vw", left: "284vw", bottom: "-22vw", background: "radial-gradient(circle at 50% 44%, rgba(11,155,133,.72) 0%, rgba(11,155,133,.3) 46%, rgba(11,155,133,0) 70%)" }} />
              <Bloom className="b2" style={{ width: "30vw", height: "30vw", left: "362vw", top: "-8vw", background: "radial-gradient(circle at 50% 50%, rgba(51,70,211,.4) 0%, rgba(51,70,211,0) 70%)" }} />
              <div className="seam" style={{ left: "396vw", background: "linear-gradient(180deg, rgba(123,63,209,.45), rgba(11,155,133,.3) 60%, rgba(11,155,133,0))" }} />
              <Bloom style={{ width: "60vw", height: "60vw", left: "388vw", bottom: "-18vw", background: "radial-gradient(circle at 46% 48%, rgba(123,63,209,.68) 0%, rgba(123,63,209,.3) 46%, rgba(123,63,209,0) 70%)" }} />
              <Bloom className="b2" style={{ width: "28vw", height: "28vw", left: "458vw", top: "-6vw", background: "radial-gradient(circle at 50% 50%, rgba(232,45,123,.38) 0%, rgba(232,45,123,0) 70%)" }} />
              <div className="seam" style={{ left: "496vw", background: "linear-gradient(180deg, rgba(51,70,211,.4), rgba(123,63,209,.35) 50%, rgba(123,63,209,0))" }} />
              <Bloom style={{ width: "54vw", height: "54vw", left: "486vw", top: "-16vw", background: "radial-gradient(circle at 50% 50%, rgba(51,70,211,.6) 0%, rgba(51,70,211,0) 70%)" }} />
              <Bloom className="b2" style={{ width: "40vw", height: "40vw", left: "552vw", bottom: "-14vw", background: "radial-gradient(circle at 50% 50%, rgba(11,155,133,.5) 0%, rgba(11,155,133,0) 70%)" }} />
              <div className="seam" style={{ left: "596vw", background: "linear-gradient(180deg, rgba(245,166,28,.55), rgba(232,45,123,.3) 55%, rgba(232,45,123,0))" }} />
              <Bloom style={{ width: "70vw", height: "70vw", left: "610vw", bottom: "-24vw", background: "radial-gradient(circle at 46% 46%, rgba(245,166,28,.8) 0%, rgba(232,45,123,.4) 50%, rgba(232,45,123,0) 74%)" }} />
              <Bloom className="b2" style={{ width: "28vw", height: "28vw", left: "588vw", top: "-6vw", background: "radial-gradient(circle at 50% 50%, rgba(51,70,211,.4) 0%, rgba(51,70,211,0) 70%)" }} />
            </div>
            <MobileWatercolorFlow />

            <section className="panel hero-panel" aria-label="Intro">
              <MobileBloom style={{ width: "110vw", height: "110vw", right: "-40vw", top: "-30vw", background: "radial-gradient(circle at 40% 45%, rgba(51,70,211,.7) 0%, rgba(232,45,123,.45) 50%, rgba(232,45,123,0) 74%)" }} />
              <div className="content">
                <p className="eyebrow">NYU Tandon CS &apos;26 · Data Engineering @ Spotify</p>
                <h1>Kushal<br /><span className="wash">Mamillapalli</span></h1>
                <p className="tagline">I&apos;m currently a <b>Data Engineering Intern at Spotify</b>, learning how large-scale data systems stay reliable in practice.</p>
                <p className="tagline hero-detail">I believe good computer science should enrich people&apos;s lives. I&apos;m drawn to data and backend engineering, and to AI and computer vision when they make complex work more useful.</p>
                <p className="tagline hero-detail">A 2026 NYU Tandon Computer Science graduate, I&apos;m interested in engineering that makes complexity feel simpler for the people using it.</p>
              </div>
              <figure className="hero-portrait">
                <img src="/images/IMG_3406.jpeg" alt="Kushal Mamillapalli" />
              </figure>
              <div className="hint">Scroll
                <svg width="34" height="14" viewBox="0 0 34 14" fill="none" aria-hidden="true"><path d="M0 7h30M25 1l7 6-7 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
            </section>

            <section className="panel project-panel indigo" aria-label="NBAnomaly project">
              <MobileBloom style={{ width: "100vw", height: "100vw", left: "-30vw", top: "-30vw", background: "radial-gradient(circle at 45% 50%, rgba(51,70,211,.65) 0%, rgba(51,70,211,0) 70%)" }} />
              <div className="content"><Pigment>PB60 · Indigo</Pigment><h2 className="p-title">NBAnomaly</h2><p className="p-metric">78% backtest precision · 2.5ms reports</p><p className="p-desc">An NBA platform that surfaces player under- and overperformance across 10+ seasons, then turns the signal into a fast scouting report.</p><Chips>{["FastAPI", "AWS EC2", "PostgreSQL", "Gemini"]}</Chips><div className="project-links"><a className="p-link" href="https://github.com/Techdude01/NBAnomaly" target="_blank" rel="noreferrer">View on GitHub →</a></div></div>
              <figure className="project-visual project-visual--nbanomaly">
                <img src="/images/projects/nbanomaly-dashboard.jpg" alt="NBAnomaly scouting dashboard" />
              </figure>
            </section>

            <section className="panel project-panel opera" aria-label="AutoCPT project">
              <MobileBloom style={{ width: "100vw", height: "100vw", right: "-30vw", top: "-25vw", background: "radial-gradient(circle at 48% 46%, rgba(232,45,123,.6) 0%, rgba(232,45,123,0) 70%)" }} />
              <div className="content"><Pigment>PR122 · Opera Rose</Pigment><h2 className="p-title">AutoCPT</h2><p className="p-metric">HackNYU 2025 Best Use of AI · &lt;500ms live responses</p><p className="p-desc">A live-visit assistant that turns clinician-patient conversations into suggested CPT codes, with a focus on speed, auditability, and less manual work.</p><Chips>{["Flask", "Whisper", "LLaMA-3", "YOLOv8", "React"]}</Chips><div className="project-links"><a className="p-link" href="https://github.com/Techdude01/AutoCPT" target="_blank" rel="noreferrer">View on GitHub →</a><a className="p-link" href="https://devpost.com/software/autocpt" target="_blank" rel="noreferrer">View on Devpost →</a></div></div>
              <figure className="project-visual project-visual--autocpt">
                <img src="/images/projects/autocpt-dashboard.png" alt="AutoCPT live coding dashboard" />
              </figure>
            </section>

            <section className="panel project-panel virid" aria-label="MarketMind project">
              <MobileBloom style={{ width: "100vw", height: "100vw", left: "-30vw", bottom: "-35vw", background: "radial-gradient(circle at 50% 44%, rgba(11,155,133,.6) 0%, rgba(11,155,133,0) 70%)" }} />
              <div className="content"><Pigment>PG18 · Viridian</Pigment><h2 className="p-title">MarketMind</h2><p className="p-metric">Market research with a trace</p><p className="p-desc">A research workspace that brings together a Next.js interface, Flask API, and PostgreSQL-backed workflow for exploring markets with more context and less tab switching.</p><Chips>{["Next.js", "Flask", "PostgreSQL", "Research"]}</Chips><div className="project-links"><a className="p-link" href="https://github.com/Techdude01/MarketMind-yHack26" target="_blank" rel="noreferrer">View on GitHub →</a><a className="p-link" href="https://devpost.com/software/marketmind-5iychz" target="_blank" rel="noreferrer">View on Devpost →</a></div></div>
              <figure className="project-visual project-visual--marketmind">
                <img src="/images/projects/marketmind-dashboard.jpg" alt="MarketMind research workspace" />
              </figure>
            </section>

            <section className="panel violetp" aria-label="Experience">
              <MobileBloom style={{ width: "100vw", height: "100vw", right: "-30vw", bottom: "-30vw", background: "radial-gradient(circle at 46% 48%, rgba(123,63,209,.55) 0%, rgba(123,63,209,0) 70%)" }} />
              <div className="content"><Pigment>PV23 · Dioxazine Violet</Pigment><h2 className="p-title">What I do</h2><div className="xp"><div className="xp-item"><h3>Production data systems</h3><p>I build dependable data systems and developer tooling that make complex platforms easier to operate, migrate, and trust.</p></div><div className="xp-item"><h3>Analytics infrastructure</h3><p>I turn data-heavy workflows into clean, practical tools for analysis, forecasting, and better decisions.</p></div><div className="xp-item"><h3>Real-time computer vision</h3><p>I build real-time perception systems that help machines see, understand, and respond quickly.</p></div></div></div>
            </section>

            <section className="panel resume" aria-label="Resume">
              <MobileBloom style={{ width: "100vw", height: "100vw", left: "-30vw", top: "-30vw", background: "radial-gradient(circle at 50% 50%, rgba(51,70,211,.5) 0%, rgba(11,155,133,.35) 55%, rgba(11,155,133,0) 74%)" }} />
              <div className="content resume-layout"><div className="resume-intro"><Pigment className="graphite" style={{ color: "#5B5670" }}>Graphite · The Underdrawing</Pigment><h2 className="p-title">Resume</h2><p className="p-desc">The one-page version, for when you need it on paper.</p><a className="p-link" href="/documents/kushal-mamillapalli-resume.pdf" download>Download PDF ↓</a></div><div className="sheet"><iframe src="/documents/kushal-mamillapalli-resume.pdf#toolbar=0&navpanes=0" title="Kushal Mamillapalli resume" /><p className="sheet-fallback">Your browser cannot preview the PDF. <a href="/documents/kushal-mamillapalli-resume.pdf">Open the résumé.</a></p></div></div>
            </section>

            <section className="panel cad" aria-label="Contact">
              <MobileBloom style={{ width: "110vw", height: "110vw", right: "-40vw", bottom: "-40vw", background: "radial-gradient(circle at 46% 46%, rgba(245,166,28,.7) 0%, rgba(232,45,123,.35) 50%, rgba(232,45,123,0) 74%)" }} />
              <div className="content"><Pigment>PY35 · Cadmium Yellow</Pigment><h2 className="c-title">Say hello.</h2><p className="c-sub">I&apos;m open to thoughtful work in data infrastructure, backend systems, and applied AI—especially when it makes something complex easier to use.</p><div className="c-links"><a href="mailto:kushalmam06@gmail.com">kushalmam06@gmail.com</a><a href="https://github.com/Techdude01" target="_blank" rel="noreferrer">GitHub ↗</a><a href="https://linkedin.com/in/kushal-mamillapalli" target="_blank" rel="noreferrer">LinkedIn ↗</a></div></div>
            </section>
          </main>
        </div>
      </div>

      <div className="progress" aria-hidden="true">
        <span className="label" style={{ color: sections[activeSection][1] }}>{sections[activeSection][0]}</span>
        <span className="strokebg"><i ref={barRef} /></span>
      </div>
    </>
  );
};

export default WatercolorPortfolio;
