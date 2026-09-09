import { useEffect, useState } from "react";

type Theme = "light" | "dark";
const isTheme = (value: string | null | undefined): value is Theme =>
  value === "light" || value === "dark";

const stored = () => {
  try {
    return localStorage.getItem("portfolio-theme");
  } catch {
    return null;
  }
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    const painted = document.documentElement.dataset.theme;
    if (isTheme(painted)) return painted;
    return matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute(
        "content",
        getComputedStyle(document.documentElement)
          .getPropertyValue("--paper")
          .trim(),
      );
  }, [theme]);

  useEffect(() => {
    const query = matchMedia("(prefers-color-scheme: dark)");
    // Until a choice is stored, the OS still leads; other tabs always do.
    const followSystem = () => {
      if (!isTheme(stored())) setTheme(query.matches ? "dark" : "light");
    };
    const followOtherTabs = (event: StorageEvent) => {
      if (event.key !== "portfolio-theme" && event.key !== null) return;
      if (isTheme(event.newValue)) setTheme(event.newValue);
    };
    query.addEventListener("change", followSystem);
    window.addEventListener("storage", followOtherTabs);
    return () => {
      query.removeEventListener("change", followSystem);
      window.removeEventListener("storage", followOtherTabs);
    };
  }, []);

  const choose = (next: Theme) => {
    setTheme(next);
    try {
      localStorage.setItem("portfolio-theme", next);
    } catch {
      /* The choice still applies for this visit without storage. */
    }
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      role="switch"
      aria-label="Dark theme"
      aria-checked={theme === "dark"}
      onClick={() => choose(theme === "dark" ? "light" : "dark")}
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <span className="theme-toggle-knob" />
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M19.4 4.6l-2.1 2.1M6.7 17.3l-2.1 2.1" />
        </svg>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M20 14.4A8.6 8.6 0 0 1 9.6 4 8.5 8.5 0 1 0 20 14.4Z" />
        </svg>
      </span>
    </button>
  );
}
