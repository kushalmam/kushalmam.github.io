import {
  ChangeEvent,
  FormEvent,
  PointerEvent,
  MouseEvent,
  useEffect,
  useState,
} from "react";
import { Moon, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";

const themeToValue = (theme?: string) => (theme === "light" ? 1 : 0);

const ThemeSlider = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [value, setValue] = useState(themeToValue(resolvedTheme));

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    setValue(themeToValue(resolvedTheme));
  }, [mounted, resolvedTheme]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--theme-progress",
      String(value),
    );
  }, [value]);

  const commitTheme = (nextValue: number) => {
    setValue(nextValue);
    setTheme(nextValue === 1 ? "light" : "dark");
    document.documentElement.classList.toggle("light", nextValue === 1);
    document.documentElement.classList.toggle("dark", nextValue === 0);
    document.documentElement.style.colorScheme =
      nextValue === 1 ? "light" : "dark";
  };

  const handleRangeUpdate = (
    event: ChangeEvent<HTMLInputElement> | FormEvent<HTMLInputElement>,
  ) => {
    commitTheme(Number(event.currentTarget.value));
  };

  const updateFromPosition = (clientX: number, element: HTMLInputElement) => {
    const rect = element.getBoundingClientRect();
    const midpoint = rect.left + rect.width / 2;
    commitTheme(clientX >= midpoint ? 1 : 0);
  };

  const handlePointerUpdate = (event: PointerEvent<HTMLInputElement>) => {
    updateFromPosition(event.clientX, event.currentTarget);
  };

  const handleClickUpdate = (event: MouseEvent<HTMLInputElement>) => {
    updateFromPosition(event.clientX, event.currentTarget);
  };

  const currentThemeName = value === 1 ? "Light" : "Dark";

  return (
    <div className="theme-slider-shell">
      <span className="theme-slider-button" aria-hidden="true">
        <Moon className="theme-slider-icon" aria-hidden="true" />
      </span>
      <input
        type="range"
        aria-label="Color theme"
        aria-valuetext={currentThemeName}
        className="theme-slider-root"
        min={0}
        max={1}
        step={1}
        value={value}
        disabled={!mounted}
        onInput={handleRangeUpdate}
        onChange={handleRangeUpdate}
        onClick={handleClickUpdate}
        onPointerDown={handlePointerUpdate}
        onPointerMove={(event) => {
          if (event.buttons === 1) handlePointerUpdate(event);
        }}
      />
      <span className="theme-slider-button" aria-hidden="true">
        <SunMedium className="theme-slider-icon" aria-hidden="true" />
      </span>
    </div>
  );
};

export default ThemeSlider;
