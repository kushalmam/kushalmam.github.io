
# Kushal Mamillapalli — Portfolio Site

A fast, recruiter-friendly single-page portfolio with a Spline mesh-gradient hero, frosted aura overlay, and SVG film grain. Dark, minimal, content-first.

## Content (pulled from resume)
- **Name:** Kushal Mamillapalli
- **Role:** Backend & ML Engineer · CS @ NYU (BS '26, MS Financial Engineering '27)
- **Value prop:** "I build low-latency backends and ML pipelines — from 100GB ETL systems to real-time autonomous targeting."
- **Contact:** km6238@nyu.edu · 785-836-0862 · GitHub: Techdude01 · LinkedIn: kushal-mamillapalli · Secaucus, NJ

## Sections

**1. Sticky Nav** — "Kushal M." left; Work / GitHub / About / Contact right. Blurs + bottom border on scroll. Mobile hamburger.

**2. Hero (100dvh)**
- Spline iframe (`gradientbackground-muF6CBRi4cCND8Pm8PbPOhHd`) as background, `pointer-events:none`, lazy-loaded async
- Frosted overlay: `rgba(0,0,0,0.35)` + `backdrop-filter: blur(2px) saturate(1.4)` + radial vignette
- SVG `feTurbulence` grain layer at opacity 0.07
- Name (clamp 2.5–5rem), role title, 1-line tagline, two CTAs ("View my work" / "Get in touch")
- Mobile (<768px): Spline hidden, replaced by CSS radial gradient `#1a0533 → #0d0d14 → #000`; grain + vignette retained

**3. Projects** (3 cards, responsive 3→2→1)
- **NBAnomaly** — NBA scouting platform, FastAPI + Isolation Forest + Postgres cache (Gemini 4.5s → 2.5ms)
- **AutoCPT** — HackNYU 2025 winner; Whisper + LLaMA-3 → live CPT codes, <500ms
- **MarketMind** — Agentic Polymarket research, FinBERT/RoBERTa sentiment vs. crowd-implied probabilities
- Each: title, 2-sentence description, tech tags, GitHub link, hover lift + inner border glow

**4. GitHub Pinned Repos**
- Live fetch via GitHub REST API (`/users/Techdude01/repos?sort=updated`), top 4
- Card shows: name, description, language + color dot, stars, last updated
- Skeleton loaders while fetching; graceful fallback if rate-limited

**5. About**
- 3–4 sentence bio: NYU CS + Financial Engineering, focus on low-latency backends, ML systems, and quantitative tooling
- Experience timeline: NYU Enterprise Data Management (Apr 2025–Present) · RoboMaster Ultraviolet Lead (Jan 2024–Present)
- Skill pills grouped: **Languages** (Python, SQL, C++, TypeScript, Java, Bash) · **Backend** (FastAPI, Flask, Nginx, SQLAlchemy) · **Data/ML** (PostgreSQL, Snowflake, Parquet, scikit-learn, Prophet, Optuna, TensorRT, YOLOv8) · **Frontend** (Next.js, React, Recharts) · **Cloud** (AWS EC2/Lambda, Docker, GitLab CI, ROS2)
- Education block + certifications (AWS AI Practitioner, Bloomberg)

**6. Contact**
- `mailto:` CTA as primary (no backend needed)
- Icon + label links: GitHub, LinkedIn, Email
- Footer with copyright

## Visual System
- Background `#0d0d14`, foreground near-white, single muted-violet accent pulled from Spline palette
- Cards: 12px radius, `1px solid rgba(255,255,255,0.07)`, hover `translateY(-4px)` + inner border glow over 200ms
- No glass on content cards, no parallax, no auto-play media
- `prefers-reduced-motion` disables transforms; lazy-load images; semantic `<nav>/<main>/<section>/<footer>`; WCAG AA contrast throughout

## Tech
- React + Tailwind (existing stack); design tokens added to `index.css` + `tailwind.config.ts`
- Single page assembled in `src/pages/Index.tsx` from section components in `src/components/sections/`
- No backend required; GitHub API called client-side
