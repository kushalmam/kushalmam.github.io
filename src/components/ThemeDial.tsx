import { useEffect, useRef, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

type Preference = "light" | "system" | "dark";
const choices = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "system", label: "Auto", Icon: Monitor },
  { value: "dark", label: "Dark", Icon: Moon },
] as const;
const isPreference = (value: string | null | undefined): value is Preference =>
  value === "light" || value === "dark" || value === "system";

export default function ThemeDial() {
  const [preference, setPreference] = useState<Preference>(() => {
    const initial = document.documentElement.dataset.themePreference;
    return isPreference(initial) ? initial : "system";
  });
  const [resolved, setResolved] = useState(
    document.documentElement.dataset.theme || "dark",
  );
  const pickerRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);

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
      document.documentElement.style.colorScheme = theme;
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", theme === "light" ? "#e4f0fc" : "#050b16");
      setResolved(theme);
    };
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, [preference]);

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (
        pickerRef.current &&
        event.target instanceof Node &&
        !pickerRef.current.contains(event.target)
      )
        pickerRef.current.open = false;
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && pickerRef.current?.open) {
        pickerRef.current.open = false;
        summaryRef.current?.focus();
      }
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === "portfolio-theme" || event.key === null)
        setPreference(isPreference(event.newValue) ? event.newValue : "system");
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", onKey);
    window.addEventListener("storage", onStorage);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const select = (value: Preference) => {
    setPreference(value);
    try {
      if (value === "system") localStorage.removeItem("portfolio-theme");
      else localStorage.setItem("portfolio-theme", value);
    } catch {
      /* The choice still works for this visit if storage is unavailable. */
    }
  };
  return (
    <details className="theme-picker" ref={pickerRef}>
      <summary
        ref={summaryRef}
        aria-label={`Appearance: ${preference === "system" ? `Auto, ${resolved}` : preference}`}
      >
        <span className="theme-orb" aria-hidden="true">
          <span />
        </span>
        <span className="theme-current">
          {preference === "system"
            ? "Auto"
            : preference === "light"
              ? "Light"
              : "Dark"}
        </span>
      </summary>
      <div className="theme-popover">
        <fieldset>
          <legend>Appearance</legend>
          <div className={`theme-track selected-${preference}`}>
            <span className="theme-thumb" aria-hidden="true" />
            {choices.map(({ value, label, Icon }) => (
              <label key={value}>
                <input
                  type="radio"
                  aria-label={label}
                  name="appearance"
                  value={value}
                  checked={preference === value}
                  onChange={() => select(value)}
                />
                <span>
                  <Icon size={18} aria-hidden="true" />
                  {label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <p aria-live="polite">
          {preference === "system"
            ? `Following your browser · ${resolved}`
            : `${preference === "light" ? "Light" : "Dark"} for this site`}
        </p>
      </div>
    </details>
  );
}
