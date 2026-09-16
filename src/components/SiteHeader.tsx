import ThemeToggle from "./ThemeToggle";
import { useEffect, useState, type MouseEvent } from "react";

export default function SiteHeader() {
  const [active, setActive] = useState("top");
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const threshold = (document.querySelector(".site-header")?.getBoundingClientRect().height ?? 80) + 120;
      let current = "top";
      for (const id of ["top", "about", "work", "contact"]) {
        if ((document.getElementById(id)?.getBoundingClientRect().top ?? Infinity) <= threshold) current = id;
      }
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) current = "contact";
      setActive(current);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

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
    // Keep the browser's native anchor scrolling, but place focus on the new
    // landmark when it can receive it so keyboard users know where they landed.
    window.setTimeout(() => {
      if (target instanceof HTMLElement) {
        target.focus({ preventScroll: true });
      }
    }, 0);
  };

  return (
    <header className="site-header">
      <div className="header-inner content-grid">
        <a
          className="wordmark"
          href="#top"
          aria-label="Kushal Mamillapalli home"
          aria-current={active === "top" ? "page" : undefined}
          onClick={focusSectionAfterNavigation}
        >
          Kushal Mamillapalli<span className="brand-dot">.</span>
        </a>
        <nav aria-label="Main navigation">
          {["about", "work"].map((id) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={active === id ? "location" : undefined}
              onClick={focusSectionAfterNavigation}
            >
              {id[0].toUpperCase() + id.slice(1)}
            </a>
          ))}
          <a
            href={`${import.meta.env.BASE_URL}documents/kushal-mamillapalli-resume.pdf`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Résumé <span aria-hidden="true">↗</span>
          </a>
          <a
            href="#contact"
            aria-current={active === "contact" ? "location" : undefined}
            onClick={focusSectionAfterNavigation}
          >
            Contact
          </a>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
