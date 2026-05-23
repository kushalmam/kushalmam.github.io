# Kushal Fol

Personal portfolio for Kushal Mamillapalli, an NYU Tandon CS student focused on
backend systems, data engineering, and ML infrastructure.

## Overview

The site is a single-page React portfolio with section navigation for profile,
projects, experience, education, technical skills, and contact links. It includes
responsive layouts, light/dark theming, animated background treatments, and
metadata updates for search/social previews.

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
  pages/PortfolioPage.tsx # portfolio content and page sections
  pages/NotFound.tsx      # fallback route
  components/sections/    # background, glass, and section UI pieces
  lib/utils.ts            # shared utility helpers
  test/                   # Vitest setup and example tests
```

## Content

Portfolio copy, project details, experience, education, skills, and contact links
currently live in `src/pages/PortfolioPage.tsx`. Update the arrays near the top of
that file to change the displayed content.
