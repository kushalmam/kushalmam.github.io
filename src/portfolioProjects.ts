export type ProjectDiagramId =
  | "rekindle"
  | "autocpt"
  | "nbanomaly"
  | "cosmicr";

export interface PortfolioProject {
  name: string;
  slug: string;
  diagramId: ProjectDiagramId;
  background: readonly [number, number, number];
  category: string;
  status?: string;
  summary: string;
  description: string;
  href: string;
  image?: string;
  width?: number;
  height?: number;
  alt?: string;
}

export const portfolioProjects: PortfolioProject[] = [
  {
    name: "Rekindle",
    slug: "rekindle",
    diagramId: "rekindle",
    background: [14, 21, 18],
    category: "Retrieval & ranking",
    summary:
      "A product recommender that learns from review histories, achieving about 46% higher offline NDCG@10 than its strongest baseline.",
    description: "A better next recommendation.",
    href: "https://github.com/Techdude01/rekindle",
    image: "rekindle-simulation.png",
    width: 1400,
    height: 800,
    alt: "Conceptual two-tower retrieval diagram for Rekindle’s offline recommendation simulation",
  },
  {
    name: "AutoCPT",
    slug: "autocpt",
    diagramId: "autocpt",
    background: [23, 19, 15],
    category: "Applied AI · HackNYU winner",
    summary:
      "A speech-to-CPT prototype that suggests billing codes from live clinical transcripts to reduce manual code lookup.",
    description: "From conversation to clinical codes.",
    href: "https://github.com/Techdude01/AutoCPT",
    image: "autocpt-dashboard.png",
    width: 806,
    height: 429,
    alt: "AutoCPT application showing speech transcription and suggested CPT codes",
  },
  {
    name: "NBAnomaly",
    slug: "nbanomaly",
    diagramId: "nbanomaly",
    background: [17, 21, 29],
    category: "Sports data platform",
    summary:
      "A basketball analytics platform that compares player statistics to surface unusual performance profiles.",
    description: "Find the player behind the numbers.",
    href: "https://github.com/Techdude01/NBAnomaly",
    image: "nbanomaly-dashboard.jpg",
    width: 1274,
    height: 650,
    alt: "NBAnomaly ScoutIQ dashboard showing player statistics and anomaly scores",
  },
  {
    name: "cosmicR",
    slug: "cosmicr",
    diagramId: "cosmicr",
    background: [11, 23, 16],
    category: "Static recompilation",
    status: "Coming soon",
    summary:
      "A high-performance static recompilation port of Ben 10 Ultimate Alien: Cosmic Destruction, backed by automated correctness tests and verification harnesses.",
    description:
      "Static recompilation of Ben 10 Ultimate Alien: Cosmic Destruction to native PC.",
    href: "https://github.com/Techdude01/cosmicR",
  },
];
