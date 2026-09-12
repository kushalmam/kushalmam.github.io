export const projects = [
  {
    name: "Rekindle",
    composition: "metric",
    visual: {
      kind: "comparison" as const,
      label: "The ranking experiment",
      rows: [
        { label: "Strongest baseline", value: "0.0071" },
        { label: "Rekindle", value: "0.0104" },
      ],
      caption: "Offline next-review ranking · 29,416 eligible warm test events. Higher is better.",
    },
    evidenceValue: "~46% better",
    evidenceUnit: "than the strongest baseline on NDCG@10",
    detail: "Retrieve and rank products from a history of reviews.",
    stack: "DuckDB / PyTorch / FAISS / LightGBM",
    category: "Recommendation systems",
    context: "0.0104 vs. 0.0071 · 29,416 test events",
    caseStudy: [
      {
        title: "Constraint",
        text: "An 18 GB M3 Pro shaped the pipeline: prepare data with DuckDB on disk and evaluate chronologically without leaking future events.",
      },
      {
        title: "Decision",
        text: "Full-catalog evaluation exposed weak neural retrieval, so I combined it with popularity and item-item filtering before reranking. HNSW was faster but retained only 88.7% of exact candidates; exact FAISS stayed the default for the 55.9k-item catalog.",
      },
      {
        title: "Evidence",
        text: "The project report records NDCG@10 of 0.0104 versus 0.0071 for the strongest baseline on 29,416 eligible warm test events. Models were frozen before chronological replay, with 2,000 paired bootstrap resamples. This measures offline next-review ranking, not online engagement.",
      },
    ],
    sources: [
      {
        label: "Read the Rekindle experiment report",
        href: "https://github.com/Techdude01/rekindle/blob/main/docs/rekindle-report.md",
      },
      {
        label: "View Rekindle on GitHub",
        href: "https://github.com/Techdude01/rekindle",
      },
    ],
  },
  {
    name: "AutoCPT",
    composition: "award",
    visual: {
      kind: "workflow" as const,
      label: "From final speech to CPT history",
      steps: [
        { title: "Speech", detail: "Browser transcription" },
        { title: "Suggestions", detail: "Groq CPT extraction" },
        { title: "Demo bill", detail: "Capital One sandbox" },
      ],
      caption: "Prototype workflow · HackNYU 2025. No clinical accuracy study.",
    },
    evidenceValue: "Best Use",
    evidenceUnit: " of AI",
    detail: "Explore speech-to-CPT assistance for clinical billing.",
    stack: "Flask / Groq / React / Expo",
    category: "Applied AI / HackNYU 2025",
    context: "Team award · hackathon prototype",
    caseStudy: [
      {
        title: "Constraint",
        text: "A HackNYU prototype needed to move from live speech to CPT suggestions and a demo billing flow quickly.",
      },
      {
        title: "Decision",
        text: "Use Flask and WebSockets for the transcript loop, Groq for CPT extraction, React and Expo clients, and Capital One’s sandbox for demo billing.",
      },
      {
        title: "Evidence",
        text: "Our team won HackNYU 2025’s Best Use of AI powered by Reach Capital. I worked on fracture detection and the TypeScript frontend. The result was a hackathon demo using a billing sandbox, without a clinical accuracy study.",
      },
    ],
    sources: [
      {
        label: "View AutoCPT on GitHub",
        href: "https://github.com/Techdude01/AutoCPT",
      },
      {
        label: "See AutoCPT’s award and team roles",
        href: "https://devpost.com/software/autocpt",
      },
    ],
  },
  {
    name: "MarketMind",
    composition: "research",
    visual: {
      kind: "workflow" as const,
      label: "How a thesis takes shape",
      steps: [
        { title: "Market context", detail: "Prediction-market data" },
        { title: "External evidence", detail: "K2 + Tavily research" },
        { title: "Saved thesis", detail: "Research + sentiment signal" },
      ],
      caption: "Research workflow · Six committed example outputs, not measured trading performance.",
    },
    evidenceValue: "Evidence",
    evidenceUnit: " → thesis",
    detail: "Investigate where the market and the news tell different stories.",
    stack: "Next.js / Flask / PostgreSQL / K2 + Tavily",
    category: "Agentic research / yHack26",
    context: "Six example outputs · research prototype",
    caseStudy: [
      {
        title: "Constraint",
        text: "A hackathon research workflow had to connect live prediction-market context with current external evidence and a usable analysis view.",
      },
      {
        title: "Decision",
        text: "Use a K2/Tavily research agent behind Flask, persist structured market and thesis data in PostgreSQL, and derive a sentiment-divergence signal for the frontend.",
      },
      {
        title: "Evidence",
        text: "Our team connected evidence gathering, saved research, and sentiment analysis in one prototype. The repository includes signal tests and an evaluation harness; the six committed example outputs demonstrate the flow, rather than measured trading performance.",
      },
    ],
    sources: [
      {
        label: "View MarketMind on GitHub",
        href: "https://github.com/Techdude01/MarketMind-yHack26",
      },
      {
        label: "Read the MarketMind build plan",
        href: "https://github.com/Techdude01/MarketMind-yHack26/blob/main/plan.md",
      },
    ],
  },
];

export const experiences = [
  {
    name: "Spotify",
    mark: "spotify",
    role: "Data Engineer (Emerging Talent) · Sep 2026–Present",
    detail:
      "Personalization infrastructure across production data pipelines and recommendation workflows.",
    previous: "Data Engineering Intern · Jun–Aug 2026",
    period: "Jun 2026–Present",
  },
  {
    name: "NYU",
    mark: "nyu",
    role: "SWE / Technical Intern",
    detail: "Modernized university student financial reporting ETL.",
    previous: null,
    period: "Apr 2025–Aug 2026",
  },
  {
    name: "ARC Robotics: Team Ultraviolet",
    mark: "arc",
    role: "Computer Vision Lead · Jan 2025–Jul 2026",
    detail:
      "Built computer vision pipelines that accelerated inference with CUDA and DeepStream.",
    previous: "Computer Vision / DevOps Engineer · Jan–Dec 2024",
    period: "Jan 2024–Jul 2026",
  },
  {
    name: "NYU Tandon",
    mark: "nyu",
    role: "Computer Vision Research Intern",
    detail: "Optimized 3D penguin biological motion tracking.",
    previous: null,
    period: "Jun–Aug 2024",
  },
] as const;
