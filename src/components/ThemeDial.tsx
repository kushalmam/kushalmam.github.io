import { useEffect, useState } from "react";

type Preference = "light" | "system" | "dark";
const isPreference = (value: string | null | undefined): value is Preference =>
  value === "light" || value === "dark" || value === "system";

export default function ThemeDial() {
  const [preference, setPreference] = useState<Preference>(() => {
    const initial = document.documentElement.dataset.themePreference;
    return isPreference(initial) ? initial : "system";
  });
  useEffect(() => {
    const query = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const theme =
        preference === "system"
          ? query.matches
            ? "dark"
            : "light"
          : preference;
      document.documentElement.dataset.theme = theme;
      document.documentElement.dataset.themePreference = preference;
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute(
          "content",
          getComputedStyle(document.documentElement)
            .getPropertyValue("--paper")
            .trim(),
        );
    };
    const storage = (event: StorageEvent) => {
      if (event.key === "portfolio-theme" || event.key === null)
        setPreference(isPreference(event.newValue) ? event.newValue : "system");
    };
    apply();
    query.addEventListener("change", apply);
    window.addEventListener("storage", storage);
    return () => {
      query.removeEventListener("change", apply);
      window.removeEventListener("storage", storage);
    };
  }, [preference]);
  return (
    <label className="appearance">
      <span className="sr-only">Appearance</span>
      <select
        aria-label="Appearance"
        value={preference}
        onChange={(event) => {
          const value = event.target.value;
          if (!isPreference(value)) return;
          setPreference(value);
          try {
            if (value === "system") localStorage.removeItem("portfolio-theme");
            else localStorage.setItem("portfolio-theme", value);
          } catch {
            /* Choice still works without storage. */
          }
        }}
      >
        <option value="system">Auto</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}
