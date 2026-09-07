# Portfolio project selection research

Research date: 2026-09-07. Public GitHub documentation and selected source files were inspected; experiments were not rerun. Reported numerical results remain author-reported measurements.

## Updated direction after user feedback

Feature Rekindle, AutoCPT, and MarketMind; replace NBAnomaly in the featured lineup. The user identified AutoCPT's HackNYU 2025 award as an important reason to retain it. [Devpost](https://devpost.com/software/autocpt) corroborates the award as “Best Use of AI powered by Reach Capital” and documents individual contributions; see `autocpt-marketmind.md` for details.

The user also requested deeper job narratives using LinkedIn summaries. The [public profile](https://www.linkedin.com/in/kushal-mamillapalli) exposes an AutoCPT project summary but hides job descriptions; direct browser navigation reached an authentication wall. The user subsequently supplied the experience summaries below. The LinkedIn AutoCPT description names YOLOv8 and diagnostic transcription, whereas Devpost names YOLOv11 and the TypeScript frontend. The site omits the disputed model version.

### User-supplied experience (2026-09-07)

- Spotify: Data Engineer (Emerging Talent), Sep 2026–Present; improving personalization data pipelines. Previous Data Engineering Intern, Jun–Aug 2026.
- NYU: SWE/Technical Intern, Apr 2025–Aug 2026; modernized university student financial reporting ETL.
- ARC Robotics: Computer Vision Lead, Jan 2025–Jul 2026; built CV pipelines, boosting inference with CUDA DeepStream. Previous Computer Vision/Devops Engineer, Jan–Dec 2024.
- NYU Tandon: Computer Vision Research Intern, Jun–Aug 2024; optimized 3D penguin biological motion tracking.

These support the updated role history and qualitative descriptions. The prior percentages and latency figures remain in need of measurement context and have been removed from the homepage and static fallback.

## Rekindle: recommended lead case study

The [project report](https://github.com/Techdude01/rekindle/blob/main/docs/rekindle-report.md) documents an 18 GB M3 Pro constraint, DuckDB disk-backed preparation, chronological evaluation, a neural retrieval result that changed model selection, and the decision to retain exact FAISS after comparing HNSW. These provide unusually concrete material for discussing engineering judgment.

The report states NDCG@10 of 0.0104 versus 0.0071 for the strongest baselines over 29,416 eligible warm test events, with 2,000 paired bootstrap resamples. This is an offline next-review prediction result, not production recommendation impact. Preserve the absolute values and evaluation boundary alongside any relative improvement. Do not imply independently reproduced results.

The [bootstrap implementation](https://github.com/Techdude01/rekindle/blob/main/src/rekindle/evaluation/bootstrap.py) uses shared sampled event indices across metric columns and deterministic seeded resampling, consistent with the described paired method. This confirms implementation, not the report's particular output values.

The [benchmark implementation](https://github.com/Techdude01/rekindle/blob/main/src/rekindle/evaluation/benchmarking.py) measures encoding/transfer, FAISS retrieval, and ranker prediction separately after loading models. Ranking inputs come from a saved crossfit candidate file; this is not complete request latency. Index construction, feature assembly, and network handling are outside the timed components. The report explicitly acknowledges component-only timing.

The [README](https://github.com/Techdude01/rekindle) distinguishes completed offline work from planned demo and cold-start work. The inspected tree contains code and tests but no committed run-output artifact directory. Ask whether aggregate evaluation JSON, run configuration, or a dated run manifest can be linked publicly.

Questions: Is this solo work, and which decisions and implementation were personally owned? May it replace a current featured project? Are the report figures final, and are shareable run outputs available?

## Other candidates inspected

- [NYC Airbnb Pricing Lab](https://github.com/Techdude01/BNB_Pricing): README explicitly distinguishes sampled presentation results from full report results and describes price-cap diagnostics. A useful alternative for an evaluation-focused case study, but numerical outputs were not inspected in this pass.
- [RM2025 Auto Sentry](https://github.com/Techdude01/nyu_rm_sentry): README documents a fork of the SMBU-POLARBEAR stack, a serial bridge, ROS 2 behavior trees, and hardware bring-up. Any case study must distinguish upstream functionality from the user's own contribution. This repository does not establish the portfolio's separate YOLOv8/TensorRT latency claim.

## Current site claims needing firsthand context

`src/components/EditorialPortfolio.tsx` states NYU pipeline size of 100GB+, 40% ETL runtime reduction, 73% storage reduction, and robotics latency changing from 40ms to 12ms. The sources inspected here do not establish measurement dates, equivalent workloads, hardware, production/test status, or individual attribution. Ask for that context before expanding these claims.

The current entry point always renders EditorialPortfolio. Decorative organization logos have empty alt text, and focus-visible styles exist. No routing redesign or redundant logo descriptions are warranted from those audit allegations alone.
