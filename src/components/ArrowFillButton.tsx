import type { AnchorHTMLAttributes, CSSProperties, ReactNode } from "react";
import "./arrow-fill-button.css";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  bgColor?: string;
  textColor?: string;
  fillBgColor?: string;
  fillTextColor?: string;
  hoverFillBgColor?: string;
  hoverFillTextColor?: string;
};

/** Clipped expanding fill and sliding double-arrow adapted from ObsidianUI's official source. */
export default function ArrowFillButton({
  children,
  className = "",
  bgColor = "var(--ink)",
  textColor = "var(--paper)",
  fillBgColor = "var(--paper)",
  fillTextColor = "var(--ink)",
  hoverFillBgColor = "var(--mint)",
  hoverFillTextColor = "var(--ink)",
  style: customStyle,
  ...props
}: Props) {
  const style = {
    "--btn-bg": bgColor,
    "--btn-text": textColor,
    "--btn-fill-bg": fillBgColor,
    "--btn-fill-text": fillTextColor,
    "--btn-fill-bg-hover": hoverFillBgColor,
    "--btn-fill-text-hover": hoverFillTextColor,
    "--btn-arrow": fillTextColor,
    "--btn-arrow-hover": hoverFillTextColor,
  } as CSSProperties;

  return <a {...props} className={`arrow-fill-btn ${className}`} style={{ ...style, ...customStyle }}>
    <span className="arrow-fill-btn__text">{children}</span>
    <span aria-hidden="true" className="arrow-fill-btn__circle">
      <span className="arrow-fill-btn__circle-text">{children}</span>
      <span className="arrow-fill-btn__icon-wrap">
        <svg viewBox="0 0 10 10" fill="none" aria-hidden="true" className="arrow-fill-btn__icon">
          <path d="M0 4.375h7.625l-3.5-3.5L5 0l5 5-5 5-.875-.875 3.5-3.5H0z" className="arrow-fill-btn__path" />
          <path d="M0 4.375h7.625l-3.5-3.5L5 0l5 5-5 5-.875-.875 3.5-3.5H0z" className="arrow-fill-btn__path" />
        </svg>
      </span>
    </span>
  </a>;
}
