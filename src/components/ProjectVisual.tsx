import { useEffect, useState, type CSSProperties } from "react";
import { projects } from "../content";

type Project = (typeof projects)[number];
type Composition = Project["composition"];

const replayItems = [
  { id: "r-17", relevance: 46, rank: 3 },
  { id: "r-08", relevance: 91, rank: 0 },
  { id: "r-41", relevance: 34, rank: 4 },
  { id: "r-04", relevance: 78, rank: 1 },
  { id: "r-29", relevance: 60, rank: 2 },
];

const waveform = [13, 20, 34, 18, 42, 28, 54, 36, 24, 48, 63, 39, 68, 44, 57, 30, 72, 46, 27, 55, 37, 68, 45, 24, 51, 32, 62, 40, 24, 49, 35, 60, 42, 24, 45, 29];

function ReplayDiagram() {
  return (
    <div className="replay-diagram" aria-label="Candidate rows reorder from retrieval into ranking">
      <div className="replay-labels" aria-hidden="true"><span>Retrieve</span><span>Rank</span></div>
      <div className="candidate-field">
        {replayItems.map((item, index) => (
          <div
            className="candidate-row"
            key={item.id}
            style={{ "--position": index, "--rank": item.rank, "--relevance": `${item.relevance}%` } as CSSProperties}
          >
            <span className="candidate-id">{item.id}</span>
            <span className="candidate-bar"><i /></span>
            <span className="candidate-rank">{String(item.rank + 1).padStart(2, "0")}</span>
          </div>
        ))}
      </div>
      <span className="replay-scan" aria-hidden="true" />
    </div>
  );
}

function SpeechDiagram() {
  return (
    <div className="speech-diagram" aria-label="Speech waveform resolves into three suggestions">
      <div className="speech-signal">
        <span className="diagram-label">Speech</span>
        <div className="natural-wave" aria-hidden="true">
          {waveform.map((height, index) => <i key={index} data-active={index >= 15 && index < 21 || undefined} style={{ "--bar-index": index, height: `${height}%` } as CSSProperties} />)}
          <span className="audio-playhead" />
        </div>
      </div>
      <div className="speech-transcript" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => <i key={index} style={{ "--line-index": index } as CSSProperties} />)}
      </div>
      <div className="suggestion-field">
        <span className="diagram-label">Suggestions</span>
        {Array.from({ length: 3 }, (_, index) => (
          <div className="suggestion-line" key={index}>
            <span className="suggestion-check">✓</span>
            <i style={{ width: `${68 - index * 13}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function MarketDiagram() {
  return (
    <div className="market-diagram" aria-label="Market and news signals diverge over time">
      <svg viewBox="0 0 720 250" role="img" aria-labelledby="market-title market-desc">
        <title id="market-title">Market and news signals</title>
        <desc id="market-desc">A scanning cursor compares two illustrative signals. The shaded interval highlights where they diverge.</desc>
        <path className="market-baseline" d="M42 208H688" aria-hidden="true" />
        <rect className="market-divergence-band" x="460" y="44" width="72" height="168" aria-hidden="true" />
        <path className="market-line market-line--market" d="M42 164C112 160 128 92 202 116S300 112 356 128S438 98 496 108S588 91 688 72" pathLength="1" />
        <path className="market-line market-line--news" d="M42 180C116 173 136 126 204 138S300 128 356 141S438 130 496 158S590 174 688 146" pathLength="1" />
        <g className="market-cursor-group" aria-hidden="true">
          <path className="market-cursor" d="M496 52V214" />
        </g>
      </svg>
      <div className="signal-legend"><span className="legend-market">Market</span><span className="legend-news">News</span></div>
    </div>
  );
}

function ProjectDiagram({ composition }: { composition: Composition }) {
  if (composition === "metric") return <ReplayDiagram />;
  if (composition === "award") return <SpeechDiagram />;
  return <MarketDiagram />;
}

export default function ProjectVisual({ project }: { project: Project }) {
  const [stage, setStage] = useState(2);
  const [visible, setVisible] = useState(false);
  const [motionReduced, setMotionReduced] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const [userPaused, setUserPaused] = useState(false);
  const composition = project.composition;
  const pace = composition === "award" ? 3200 : composition === "research" ? 4000 : 3000;
  const hostId = `visual-host-${composition}`;
  const playing = visible && !motionReduced && pageVisible && !userPaused;

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motionChanged = () => {
      setMotionReduced(motion.matches);
      if (motion.matches) setStage(2);
    };
    const visibilityChanged = () => setPageVisible(!document.hidden);
    const host = document.getElementById(hostId);
    motionChanged();
    motion.addEventListener("change", motionChanged);
    document.addEventListener("visibilitychange", visibilityChanged);
    if (!host || !("IntersectionObserver" in window)) {
      return () => {
        motion.removeEventListener("change", motionChanged);
        document.removeEventListener("visibilitychange", visibilityChanged);
      };
    }
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (entry.isIntersecting && !motion.matches) setStage((current) => current === 2 ? 0 : current);
    }, { threshold: 0.35 });
    observer.observe(host);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", motionChanged);
      document.removeEventListener("visibilitychange", visibilityChanged);
    };
  }, [hostId]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => setStage((current) => (current + 1) % 3), pace);
    return () => window.clearTimeout(timer);
  }, [pace, playing, stage]);

  return (
    <figure
      id={hostId}
      className={`project-visual animated-visual visual--${composition}`}
      data-stage={stage}
      data-playing={playing}
      aria-label={`${project.name} workflow`}
    >
      <ProjectDiagram composition={composition} />
      <button className="visual-control" type="button" aria-pressed={userPaused} disabled={motionReduced} onClick={() => setUserPaused((paused) => !paused)}>
        {motionReduced ? "Motion off" : userPaused ? "Resume" : "Pause"}
      </button>
    </figure>
  );
}
