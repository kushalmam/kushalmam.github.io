import ThemeDial from "./ThemeDial";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-inner content-grid">
        <a className="wordmark" href="#top">
          Kushal Mamillapalli<span className="brand-dot">.</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#about">About</a>
          <a href="#work">Work</a>
          <a href="#contact">Contact</a>
        </nav>
        <ThemeDial />
      </div>
    </header>
  );
}
