import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

type Props = {
  children: string;
  className?: string;
  renderCharacter?: (character: string, index: number) => ReactNode;
};

/**
 * Character hover interaction adapted from ObsidianUI's official Flip Text:
 * https://www.obsidianui.dev/docs/flip-text
 */
export default function FlipText({ children, className = "", renderCharacter }: Props) {
  const [turns, setTurns] = useState<Record<number, number>>({});
  const reduced = useReducedMotion();

  return <span className={`flip-text ${className}`}>
    {children.split("").map((char, index) => <span
      key={`${char}-${index}`}
      className="flip-text__character"
      onMouseEnter={() => { if (!reduced) setTurns(previous => ({ ...previous, [index]: (previous[index] ?? 0) + 1 })); }}
    ><motion.span
      className="flip-text__glyph"
      initial={false}
      animate={{ rotateX: reduced ? 0 : (turns[index] ?? 0) * 360 }}
      transition={{ duration: .4, ease: "easeOut" }}
    >{renderCharacter?.(char, index) ?? (char === " " ? "\u00A0" : char)}</motion.span></span>)}
  </span>;
}
