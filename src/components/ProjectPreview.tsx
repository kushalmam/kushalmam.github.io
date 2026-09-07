import { useEffect, useRef } from "react";

type Props = { theme: string; name: string };

/** Illustrative diagrams of each workflow, rather than live application data. */
export default function ProjectPreview({ theme, name }: Props) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) =>
        element.classList.toggle("preview-active", entry.isIntersecting),
      { threshold: 0.1 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <figure className={`project-preview preview-${theme}`} ref={ref}>
      <svg
        viewBox="0 0 520 300"
        role="img"
        aria-label={`${name}: illustrative ${theme === "basketball" ? "player performance anomaly detection" : theme === "healthcare" ? "audio to suggested CPT medical billing codes workflow" : "comparison of market signals and news sentiment"}`}
      >
        <defs>
          <linearGradient id={`fade-${theme}`} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#76aaff" stopOpacity=".2" />
            <stop offset="1" stopColor="#76aaff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {theme === "basketball" ? (
          <>
            <text x="35" y="35" className="preview-label">
              Player performance
            </text>
            {[85, 130, 175, 220].map((y) => (
              <path key={y} d={`M35 ${y}H485`} className="chart-grid" />
            ))}
            <path
              d="M35 222L82 201L126 209L168 168L215 179L258 153L302 158L347 114L393 135L438 86L485 96L485 252H35Z"
              fill={`url(#fade-${theme})`}
            />
            <path
              d="M35 222L82 201L126 209L168 168L215 179L258 153L302 158L347 114L393 135L438 86L485 96"
              className="signal-line"
              pathLength="1"
            />
            <path d="M35 218Q245 157 485 122" className="baseline" />
            {[
              [82, 201],
              [168, 168],
              [258, 153],
              [347, 114],
              [438, 86],
            ].map(([x, y]) => (
              <circle key={x} cx={x} cy={y} r="4" className="data-dot" />
            ))}
            <circle cx="347" cy="114" r="13" className="anomaly-ring" />
            <path d="M347 97V61H424" className="callout-line" />
            <text x="365" y="54" className="preview-label">
              Outlier
            </text>
            <text x="35" y="278" className="preview-muted">
              Season history
            </text>
            <text x="370" y="278" className="preview-muted">
              Scouting signal
            </text>
          </>
        ) : theme === "healthcare" ? (
          <>
            <text x="35" y="35" className="preview-label">
              Conversation to suggested CPT codes
            </text>
            <rect
              x="35"
              y="67"
              width="450"
              height="75"
              rx="8"
              className="diagram-panel"
            />
            {Array.from({ length: 42 }, (_, i) => {
              const h =
                8 + Math.abs(Math.sin(i * 0.72) * Math.cos(i * 0.31)) * 43;
              return (
                <path
                  key={i}
                  d={`M${52 + i * 10} ${105 - h / 2}v${h}`}
                  className={`wave-bar wave-${i % 4}`}
                />
              );
            })}
            <path d="M260 153V181" className="flow-line" />
            <path d="m254 175 6 6 6-6" className="callout-line" />
            <rect
              x="35"
              y="195"
              width="212"
              height="67"
              rx="7"
              className="diagram-panel"
            />
            <text x="52" y="218" className="preview-muted">
              Visit transcript
            </text>
            <path d="M52 234H226M52 244H183" className="transcript-line" />
            <path d="M255 227H278" className="flow-line" />
            <rect
              x="286"
              y="195"
              width="199"
              height="67"
              rx="7"
              className="code-panel"
            />
            <text x="302" y="222" className="preview-label">
              Suggested CPT codes
            </text>
            <text x="302" y="245" className="preview-muted">
              Clinician review
            </text>
          </>
        ) : (
          <>
            <text x="35" y="35" className="preview-label">
              Market expectations / news sentiment
            </text>
            {[85, 130, 175, 220].map((y) => (
              <path key={y} d={`M35 ${y}H485`} className="chart-grid" />
            ))}
            <path
              d="M35 198C85 187 97 149 147 156S206 111 248 128S300 164 344 123S417 100 485 81"
              className="signal-line"
              pathLength="1"
            />
            <path
              d="M35 212C85 198 100 182 148 183S205 139 249 152S306 198 346 175S422 186 485 139"
              className="sentiment-line"
              pathLength="1"
            />
            <rect
              x="310"
              y="63"
              width="66"
              height="176"
              rx="3"
              className="divergence-band"
            />
            <path
              d="M343 129V174M338 130h10M338 174h10"
              className="callout-line"
            />
            <circle cx="485" cy="81" r="4" className="data-dot" />
            <text x="35" y="278" className="preview-muted">
              Two signals. One research view.
            </text>
          </>
        )}
      </svg>
    </figure>
  );
}
