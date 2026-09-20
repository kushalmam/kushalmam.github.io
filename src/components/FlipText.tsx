import { useState } from "react";
import { motion } from "motion/react";

type Props = {
  children: string;
  className?: string;
  signalIndex?: number;
};

/**
 * Character hover interaction adapted from ObsidianUI's official Flip Text:
 * https://www.obsidianui.dev/docs/flip-text
 */
export default function FlipText({ children, className = "", signalIndex }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return <span className={`flip-text ${className}`}>
    {children.split("").map((char, index) => <motion.span
      key={`${char}-${index}`}
      className="flip-text__character"
      data-signal-origin={index === signalIndex ? "" : undefined}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
      animate={{ rotateX: hoveredIndex === index ? 360 : 0, y: hoveredIndex === index ? -6 : 0 }}
      transition={{ duration: .4, ease: "easeOut" }}
    >{char === " " ? "\u00A0" : char}</motion.span>)}
  </span>;
}
