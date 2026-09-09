# Redesign audit — September 2026

## Baseline and decisions

Inspected the React/Vite entry point, active editorial page, raw Three.js shader,
theme persistence, SVG previews, scrolling hooks, alternate page shells, styling,
tests, asset references, and deployment configuration. The live GitHub Pages site
and local baseline matched visually and in content.

Kept React, Vite, raw Three.js, the three evidence-backed case studies, unified
experience rows, theme persistence, static HTML, and the existing résumé. Replaced
shader folds and oversized uppercase display type with a quiet exploded systems
drawing and sentence-case editorial hierarchy. The visible project evidence
retains qualification: offline replay, team hackathon award, and prototype outputs.
Full constraints, decisions, and evidence remain in native disclosures.

## Deleted complexity

Removed these obsolete source files:

- `src/components/WatercolorPortfolio.tsx`
- `src/components/WatercolorBackground.tsx`
- `src/components/legacy/SmokeBackground.tsx`
- `src/components/sections/GrainFilter.tsx`
- `src/components/sections/LiquidGlassButton.tsx`
- `src/components/sections/LiquidGlassPane.tsx`
- `src/components/sections/ProductShell.tsx`
- `src/components/sections/ThemeSlider.tsx`
- `src/pages/PortfolioPage.tsx`
- `src/pages/ProductPages.tsx`
- `src/pages/NotFound.tsx`
- `src/components/NavLink.tsx`
- `src/lib/utils.ts`
- `src/components/HeroField.tsx` (replaced by the scene host and renderer module)
- `src/components/ProjectPreview.tsx` (three competing illustrative visual systems)
- `src/components/useSmoothScrolling.ts`
- `src/components/useSectionSettling.ts`
- `src/test/section-settling.test.tsx` (the behavior it tested was deliberately removed)
- `src/test/example.test.ts` (template placeholder)
- `tailwind.config.ts` and `postcss.config.js`

Removed direct dependencies: `@nkzw/liquid-glass`, `clsx`, `lenis`, `lucide-react`,
`next-themes`, `react-router-dom`, `tailwind-merge`, `tailwindcss`, `autoprefixer`,
and `postcss`. Build tools may still depend on PostCSS transitively.

Removed unused assets: the fluid-motion video/poster, three company logos, and six
unused project preview images. Replaced `IMG_3406.jpeg` with a smaller portrait.
Social image metadata now references that retained portrait. Existing untracked
`tmp/` work was left untouched.

Replaced the 2,900-line CSS override stack with a single protocol; removed theme
orbs, glass surfaces, project-specific hues, gradients, timeline accent rails,
per-element reveal observers, animated chart decoration, custom menu behavior,
scroll settling, and duplicated content in the fallback HTML. Retained a native
appearance selector and simple visible navigation.

## Verification

- Strict TypeScript checks for application and Vite configuration pass.
- ESLint passes with unused variables enabled.
- Production build passes; optional Three.js chunk retains the documented size advisory.
- Six tests pass: preserved experience content; case-study disclosure switching;
  appearance persistence/reset; navigation/résumé targets; scene idle/offscreen
  behavior/disposal; reduced-motion frames and context-loss fallback.
- Browser inspections at 320, 390, 768, 1280, and 1440 CSS-pixel widths cover the
  phone, tablet, laptop, and desktop layouts. Checked both palettes, heading wraps,
  horizontal overflow, anchor clearance, project disclosures, and keyboard activation.
- Five project/report GitHub destinations, GitHub profile, LinkedIn, and the local
  résumé returned HTTP 200. Devpost returned HTTP 403 to the automated request;
  the existing award link is retained and is not claimed to be broken.

Reduced-motion renderer behavior is tested with a mocked renderer using real
Three.js scene objects. These tests do not substitute for GPU benchmarks on a
physical low-powered device. No production deployment was performed.


## Second pass — visual identity

Preserved the source structure, structured content, plain CSS, React/Vite/raw Three.js,
native navigation/disclosures, theme handling, fallback generation, and lifecycle work.
No router, animation framework, component library, or styling framework was added.

Replaced the persistent drawing rail and literal planes with a full-viewport System
Strata field. Five shared terrain slices change separation and exposure across four
poses. Three routed paths respond to project selection. Lower-resolution mobile
geometry, idle rendering, visibility pausing, reduced motion, and disposal remain.

Removed the decorative system captions, repeated numeric labels, plus signs, header
and section rules, generalized monospace styling, and the enclosing content frame.
The content grid now only constrains reading, independently of the visual field.
The palette moves to near-black/warm-white/acid-lime with emerald scene depth.

Added one self-hosted variable display font, Archivo; removed the Newsreader regular
font import. Newsreader italic remains selective. Rekindle emphasizes its metric,
AutoCPT its award, and MarketMind its research question through composition metadata
and shared markup. The portrait and personal writing remain in a quieter section.

Verification: strict typecheck, lint, build, and seven tests pass. Renderer tests now
also verify real layer separation and the selected route's highlight. Browser checks
cover 320px and 390px phones, 768px tablet, 1280×720 laptop, and 1440×900 desktop,
including both palettes, project switching, keyboard activation, and overflow.
A temporary page forced WebGL context creation to fail: the SVG/typographic layout
and project disclosures remained functional. That temporary fixture was removed.
The first viewport retains the identity, technical focus, current role, and work
link on laptop and phone. No production deployment was performed.
