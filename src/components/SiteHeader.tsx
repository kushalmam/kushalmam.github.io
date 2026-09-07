import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
import ThemeDial from "./ThemeDial";

export default function SiteHeader() {
  const [compact, setCompact] = useState(false);
  const menuRef = useRef<HTMLDetailsElement>(null);
  const toggleRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 70);
    const onPointer = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !menuRef.current?.contains(event.target) &&
        menuRef.current
      )
        menuRef.current.open = false;
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menuRef.current?.open) {
        menuRef.current.open = false;
        toggleRef.current?.focus();
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);
  const close = () => {
    if (menuRef.current) menuRef.current.open = false;
  };
  return (
    <header className={`site-header${compact ? " is-compact" : ""}`}>
      <a
        className="wordmark"
        href="#top"
        aria-label="Kushal Mamillapalli, back to top"
        onClick={close}
      >
        <span className="brand-full" aria-hidden="true">
          Kushal Mamillapalli
        </span>
        <span className="brand-short" aria-hidden="true">
          KM*
        </span>
      </a>
      <ThemeDial />
      <details className="header-menu" ref={menuRef}>
        <summary ref={toggleRef}>
          Menu <Plus size={19} aria-hidden="true" />
        </summary>
        <nav aria-label="Main navigation" className="menu-panel">
          <a href="#work" onClick={close}>
            Work <ArrowUpRight size={22} />
          </a>
          <a href="#about" onClick={close}>
            About <ArrowUpRight size={22} />
          </a>
          <a href="#contact" onClick={close}>
            Contact <ArrowUpRight size={22} />
          </a>
        </nav>
      </details>
    </header>
  );
}
