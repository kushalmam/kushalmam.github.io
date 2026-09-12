import { useEffect, useRef, useState, type CSSProperties } from "react";
import { projects } from "../content";

export default function ProjectVisual({ project }: { project: (typeof projects)[number] }) {
  const host = useRef<HTMLElement>(null);
  const reducedMotion = useRef(false);
  const [stage, setStage] = useState(2);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!host.current || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (entry.isIntersecting && !reducedMotion.current) setStage(0);
    }, { threshold: 0.35 });
    observer.observe(host.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || reducedMotion.current) return;
    const timer = window.setTimeout(
      () => setStage((current) => (current + 1) % 3),
      1800,
    );
    return () => window.clearTimeout(timer);
  }, [visible, stage]);

  return (
    <figure ref={host} className={`project-visual animated-visual visual--${project.composition}`} data-stage={stage} data-playing={visible && !reducedMotion.current}>
      <div className="visual-heading">
        <span>{project.visual.label}</span>
        <span className="loop-status"><i /> System loop</span>
      </div>
      <div className="visual-loop" aria-hidden="true">
      {project.composition === "metric" ? (
        <div className="ranking-demo">
          <div className="retrieval-sources"><span>Two-tower</span><span>Popularity</span><span>Item–item CF</span></div>
          <div className="candidate-field" aria-hidden="true">
            {Array.from({ length: 30 }, (_, index) => <i key={index} className={index < 10 ? "candidate-selected" : ""} style={{ "--i": index } as CSSProperties} />)}
          </div>
          <div className="ranking-result"><span className="demo-kicker">{stage === 0 ? "Up to 200 candidates / source" : stage === 1 ? "LightGBM LambdaRank → top 10" : "Chronological replay"}</span>
            <strong>{stage < 2 ? "Retrieve → rank" : "0.0104"}</strong>
            <span>{stage < 2 ? "Deduplicated union · up to 600 candidates" : "NDCG@10 · 0.0071 strongest baseline"}</span>
          </div>
        </div>
      ) : project.composition === "award" ? (
        <div className="speech-demo">
          <div className="transcript-panel"><span className="demo-kicker">Browser speech recognition</span>
            <div className="audio-wave" aria-hidden="true">{Array.from({ length: 28 }, (_, index) => <i key={index} style={{ "--i": index, height: `${12 + (index * 17 % 43)}px` } as CSSProperties} />)}</div>
            <p>Final speech segment <span className="demo-cursor">▍</span></p>
            <span className="demo-footnote">WebSocket → Flask → Groq</span>
          </div>
          <div className="code-panel" data-revealed={stage > 0}>
            <span className="demo-kicker">CPT suggestion history</span>
            <div className="suggestion-row"><span>01</span><strong>Extract codes</strong><span>↗</span></div>
            <div className="suggestion-row" data-revealed={stage > 1}><span>02</span><strong>Merge unique codes</strong><span>✓</span></div>
            <span className="demo-footnote">Workflow illustration · no patient data</span>
          </div>
        </div>
      ) : (
        <div className="research-demo">
          <div className="research-doc"><span className="demo-kicker">Market context</span><strong>Question.<br />Evidence.<br /><em>Thesis.</em></strong><span className="demo-footnote">K2 agent ↔ Tavily search</span>
            <div className="document-lines" aria-hidden="true"><i /><i /><i /></div>
          </div>
          <div className="signal-panel" data-revealed={stage > 0}>
            <span className="demo-kicker">Committed example · Games</span>
            <div className="signal-values"><span>Market sentiment<strong>−0.9540</strong></span><span>News sentiment<strong>−0.7055</strong></span></div>
            <div className="sentiment-scale" aria-hidden="true"><i /><b /></div>
            <div className="sentiment-axis" aria-hidden="true"><span>−1</span><span>Sentiment scale</span><span>+1</span></div>
            <div className="signal-verdict" data-revealed={stage > 1}><span>Divergence <strong>0.2485</strong></span><b>SKIP</b></div>
            <span className="demo-footnote">Below the prototype’s 0.35 threshold</span>
          </div>
        </div>
      )}
      </div>
      <figcaption>{project.visual.caption} Animation illustrates the workflow; timing is not a benchmark.</figcaption>
    </figure>
  );
}
