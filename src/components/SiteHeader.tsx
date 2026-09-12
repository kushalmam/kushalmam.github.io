import ThemeToggle from "./ThemeToggle";
import { useEffect, useState } from "react";

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
  return (
    <header className="site-header">
      <div className="header-inner content-grid">
        <a className="wordmark" href="#top">
          Kushal Mamillapalli<span className="brand-dot">.</span>
        </a>
        <nav aria-label="Main navigation">
          {["about", "work", "contact"].map((id) => (
            <a key={id} href={`#${id}`} aria-current={active === id ? "location" : undefined}>
              {id[0].toUpperCase() + id.slice(1)}
            </a>
          ))}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
