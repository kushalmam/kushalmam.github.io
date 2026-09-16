import { useEffect, useRef, useState, type CSSProperties } from "react";
import { projects } from "../content";

type Project = (typeof projects)[number];
type Composition = Project["composition"];

function FlowDot({ path, delay = "0s" }: { path: string; delay?: string }) {
  return (
    <circle className="flow-dot" r="3" style={{ "--flow-delay": delay } as CSSProperties}>
      <animateMotion dur="3.6s" begin={delay} repeatCount="indefinite" path={path} />
    </circle>
  );
}

function MetricDiagram() {
  const candidateDots = Array.from({ length: 24 }, (_, index) => ({
    x: 282 + (index % 8) * 14,
    y: 91 + Math.floor(index / 8) * 14,
    index,
  }));
  return (
    <svg className="process-svg process-svg--metric" viewBox="0 0 720 250" role="img">
      <title>Retrieve and rank</title>
      <desc>Three retrieval routes flow into a candidate field, then into a final ranking node.</desc>
      <g className="diagram-grid" aria-hidden="true">
        <path d="M36 42H684M36 208H684" />
        <path d="M36 125H684" className="grid-line--strong" />
      </g>
      <g className="metric-routes" aria-hidden="true">
        <path d="M104 78C164 78 192 104 246 125" />
        <path d="M104 125H246" />
        <path d="M104 172C164 172 192 146 246 125" />
        <path d="M390 125C458 125 496 92 566 92" />
        <path d="M390 125C458 125 496 158 566 158" />
        <FlowDot path="M104 78C164 78 192 104 246 125" />
        <FlowDot path="M104 125H246" delay="-1.2s" />
        <FlowDot path="M104 172C164 172 192 146 246 125" delay="-2.4s" />
        <FlowDot path="M390 125C458 125 496 92 566 92" delay="-0.8s" />
      </g>
      <g className="metric-sources" aria-hidden="true">
        <circle cx="92" cy="78" r="12" />
        <circle cx="92" cy="125" r="12" />
        <circle cx="92" cy="172" r="12" />
      </g>
      <g className="diagram-node metric-retrieve">
        <rect x="220" y="94" width="76" height="62" rx="31" />
        <text x="258" y="130" textAnchor="middle">Retrieve</text>
      </g>
      <g className="metric-candidates" aria-hidden="true">
        {candidateDots.map(({ x, y, index }) => <circle key={index} cx={x} cy={y} r="4" style={{ "--dot-index": index } as CSSProperties} />)}
      </g>
      <g className="diagram-node metric-rank">
        <rect x="552" y="62" width="88" height="126" rx="44" />
        <text x="596" y="130" textAnchor="middle">Rank</text>
      </g>
      <g className="metric-output" aria-hidden="true">
        <path d="M646 92H684" />
        <path d="M646 104H674" />
        <path d="M646 158H684" />
        <path d="M646 170H674" />
      </g>
    </svg>
  );
}

function SpeechDiagram() {
  const bars = Array.from({ length: 34 }, (_, index) => 10 + ((index * 19) % 42));
  return (
    <svg className="process-svg process-svg--speech" viewBox="0 0 720 250" role="img">
      <title>Speech and codes</title>
      <desc>Speech pulses across a waveform and travels along a route into a set of suggested codes.</desc>
      <g className="diagram-grid" aria-hidden="true">
        <path d="M36 42H684M36 208H684" />
        <path d="M36 125H684" className="grid-line--strong" />
      </g>
      <g className="speech-wave" aria-hidden="true">
        {bars.map((height, index) => <rect key={index} x={56 + index * 9} y={125 - height / 2} width="4" height={height} rx="2" style={{ "--bar-index": index } as CSSProperties} />)}
      </g>
      <g className="speech-route" aria-hidden="true">
        <path d="M132 125C250 76 340 174 454 125C506 103 530 102 566 125" />
        <FlowDot path="M132 125C250 76 340 174 454 125C506 103 530 102 566 125" delay="-1.8s" />
      </g>
      <g className="diagram-node speech-node">
        <circle cx="132" cy="125" r="34" />
        <text x="132" y="130" textAnchor="middle">Speech</text>
      </g>
      <g className="code-stack" aria-hidden="true">
        <rect x="514" y="82" width="106" height="26" rx="13" />
        <rect x="528" y="112" width="106" height="26" rx="13" />
        <rect x="514" y="142" width="106" height="26" rx="13" />
      </g>
      <g className="diagram-node code-node">
        <circle cx="566" cy="125" r="34" />
        <text x="566" y="130" textAnchor="middle">Codes</text>
      </g>
    </svg>
  );
}

function ResearchDiagram() {
  return (
    <svg className="process-svg process-svg--research" viewBox="0 0 720 250" role="img">
      <title>Market and news signals</title>
      <desc>Market and news curves track one another before diverging at the research decision point.</desc>
      <g className="diagram-grid" aria-hidden="true">
        <path d="M54 42H684M54 208H684" />
        <path d="M54 125H684" className="grid-line--strong" />
      </g>
      <path className="research-axis" d="M54 208V42M54 208H684" aria-hidden="true" />
      <path className="research-signal research-signal--market" d="M54 166C118 158 132 94 198 116S296 116 350 133S432 104 486 112S570 98 684 76" pathLength="1" aria-hidden="true" />
      <path className="research-signal research-signal--news" d="M54 180C126 171 140 128 202 137S292 130 350 142S430 132 484 158S578 174 684 146" pathLength="1" aria-hidden="true" />
      <g className="research-divergence" aria-hidden="true">
        <path d="M484 72V196" />
        <path d="M476 72H492M476 196H492" />
        <circle cx="484" cy="112" r="5" />
        <circle cx="484" cy="158" r="5" />
      </g>
      <text className="signal-label signal-label--market" x="600" y="70">Market</text>
      <text className="signal-label signal-label--news" x="600" y="151">News</text>
    </svg>
  );
}

function ProjectDiagram({ composition }: { composition: Composition }) {
  if (composition === "metric") return <MetricDiagram />;
  if (composition === "award") return <SpeechDiagram />;
  return <ResearchDiagram />;
}

export default function ProjectVisual({ project }: { project: Project }) {
  const host = useRef<HTMLElement>(null);
  const reducedMotion = useRef(false);
  const started = useRef(false);
  const [stage, setStage] = useState(2);
  const [visible, setVisible] = useState(false);
  const [motionReduced, setMotionReduced] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const composition = project.composition;
  const pace = composition === "award" ? 1500 : composition === "research" ? 2400 : 1800;
  const visualHeadingId = `visual-heading-${composition}`;
  const visualCaptionId = `visual-caption-${composition}`;

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motionChanged = () => {
      reducedMotion.current = motion.matches;
      setMotionReduced(motion.matches);
      if (motion.matches) setStage(2);
    };
    const visibilityChanged = () => setPageVisible(!document.hidden);
    motionChanged();
    motion.addEventListener("change", motionChanged);
    document.addEventListener("visibilitychange", visibilityChanged);
    if (!host.current || !("IntersectionObserver" in window)) {
      return () => {
        motion.removeEventListener("change", motionChanged);
        document.removeEventListener("visibilitychange", visibilityChanged);
      };
    }
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (entry.isIntersecting && !reducedMotion.current && !started.current) {
        started.current = true;
        setStage(0);
      }
    }, { threshold: 0.35 });
    observer.observe(host.current);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", motionChanged);
      document.removeEventListener("visibilitychange", visibilityChanged);
    };
  }, []);

  useEffect(() => {
    if (!visible || motionReduced || !pageVisible) return;
    const timer = window.setTimeout(
      () => setStage((current) => (current + 1) % 3),
      pace,
    );
    return () => window.clearTimeout(timer);
  }, [motionReduced, pageVisible, pace, visible, stage]);

  useEffect(() => {
    const svg = host.current?.querySelector("svg");
    if (!svg) return;
    const animationDocument = svg as SVGSVGElement & {
      pauseAnimations?: () => void;
      unpauseAnimations?: () => void;
    };
    if (visible && !motionReduced && pageVisible) {
      animationDocument.unpauseAnimations?.();
    } else {
      animationDocument.pauseAnimations?.();
    }
  }, [motionReduced, pageVisible, visible, stage]);

  return (
    <figure
      ref={host}
      className={`project-visual animated-visual visual--${composition}`}
      data-stage={stage}
      data-playing={visible && !motionReduced && pageVisible}
      aria-labelledby={visualHeadingId}
      aria-describedby={visualCaptionId}
    >
      <div className="visual-heading">
        <span id={visualHeadingId}>{project.visual.label}</span>
        <span className="loop-status">{composition === "metric" ? "Retrieve / Rank" : composition === "award" ? "Speech / Codes" : "Market / News"}</span>
      </div>
      <div className="visual-loop">
        <ProjectDiagram composition={composition} />
      </div>
      <figcaption id={visualCaptionId}>Illustrative workflow · not live data.</figcaption>
    </figure>
  );
}
