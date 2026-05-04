import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import ThemeSlider from "@/components/sections/ThemeSlider";

const links = [
  { href: "#work", label: "Work" },
  { href: "#github", label: "GitHub" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "nav-blur" : ""
      }`}
    >
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <a
          href="#top"
          className="font-display text-lg tracking-tight text-foreground"
        >
          Kushal M.
        </a>

        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-8">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-[15px] text-muted-foreground hover:text-foreground transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>
          <ThemeSlider />
        </div>

        <div className="md:hidden flex items-center gap-3">
          <ThemeSlider />
          <button
            aria-label="Toggle menu"
            className="text-foreground p-1 -mr-1"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden nav-blur border-t border-white/5">
          <div className="px-6 py-4 flex flex-col gap-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-[15px] text-muted-foreground hover:text-foreground transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Nav;
