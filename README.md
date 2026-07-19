# Kushal Fol

Personal portfolio and resume site for Kushal Mamillapalli, a NYU Tandon CS
graduate focused on backend systems, data engineering, and ML infrastructure.

## Overview

The site uses dedicated routed views for About, Work, Experience, Education,
Tech, Resume, and Contact—each with its own focused reading surface rather than
a long scroll through every resume section. The visual system is an editorial
warm-paper resume with responsive layouts, light/dark theming, and search/social
metadata.

## Tech Stack

- Vite + React + TypeScript
- React Router
- Tailwind CSS
- next-themes
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

```text
src/
  App.tsx                 # route setup and theme provider
  main.tsx                # React entrypoint
  pages/PortfolioPage.tsx # layout, page routes, and resume content
  pages/NotFound.tsx      # fallback route
  components/legacy/      # archived experimental UI, including smoke background
  components/sections/    # reusable experimental UI pieces
public/documents/         # downloadable one-page resume PDF
  lib/utils.ts            # shared utility helpers
  test/                   # Vitest setup and example tests
```

## Content

Portfolio copy, project details, experience, skills, and contact links live in
`src/pages/PortfolioPage.tsx`. Update the arrays near the top of that file to
change the displayed content.
