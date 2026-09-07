# Kushal Fol

Personal portfolio and resume site for Kushal Mamillapalli, a NYU Tandon CS
graduate focused on backend systems, data engineering, and ML infrastructure.

## Overview

A single-page, dark typographic portfolio with natural vertical scrolling:
intro, about and experience, selected projects, then contact with a résumé link.
The design uses midnight blue sections, Syne display typography, and a Newsreader italic accent, compact project narratives and animated workflow diagrams,
and selective entrance and hover motion. Reduced-motion preferences are respected.

## Tech Stack

- Vite + React + TypeScript
- Tailwind CSS and custom responsive CSS
- lucide-react icons
- Vitest + Testing Library

## Getting Started

Install dependencies:

```bash
bun install
```

Start the local dev server:

```bash
bun run dev
```

The Vite server runs at `http://localhost:8080`.

## Scripts

```bash
bun run dev          # start Vite locally
bun run build        # create a production build
bun run preview      # preview the production build
bun run lint         # run ESLint
bun run test         # run Vitest once
bun run test:watch   # run Vitest in watch mode
```

## Project Structure

- `src/App.tsx`: portfolio entry point
- `src/components/EditorialPortfolio.tsx`: content, project data, and scroll reveals
- `src/index.css`: responsive layout, typography, and motion
- `public/images/`: portrait and project screenshots
- `public/documents/`: résumé PDF
- `index.html`: metadata and static fallback content

## Content

Update project data and portfolio copy in `src/components/EditorialPortfolio.tsx`.
Keep the static fallback in `index.html` consistent with content changes.

## Hero animation

`src/components/HeroField.tsx` renders an illuminated, displaced Three.js surface behind the
headline. The shader controls the flowing folds, sapphire lighting, and motion. Animation pauses off
screen and in hidden tabs; reduced-motion users get a static render.

Organization logo sources: Spotify via Simple Icons, NYU Tandon's official site
(torch extracted from its wordmark), and the NYU ARC team website.

## Navigation and project previews

`SiteHeader.tsx` keeps the header visible, shortens the name on scroll, and provides
a keyboard-accessible disclosure menu. `ProjectPreview.tsx` contains illustrative
SVG workflows, not live project data. Animations pause off screen and respect
reduced-motion preferences.
