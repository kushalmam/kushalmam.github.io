# Kushal Mamillapalli — Portfolio

Warm paper, muted teal typography, and a continuous sculpted signal route.
Page order: name-led hero → About → four project cards → Contact + Résumé.

`SignalRoute.tsx` measures the page after fonts load and when layout dimensions change.
The name styles share a fixed grid and stationary dot; font cycling never rebuilds the wire. Its route drives
three depth-tested tube meshes in `src/scene/createSignalScene.ts`. A physical metal/enamel material uses a prefiltered HDR studio environment, filtered
longitudinal brushing, and directional reflections. Custom shader extensions preserve
scroll deformation, cursor bending with corrected normals, and signal illumination. The
viewport-sized renderer is lazy-loaded, caps pixel density, renders only on change,
and releases its GPU resources on teardown. Reduced motion freezes the strands
and removes the traveling signal. A styled SVG remains if WebGL is unavailable.

Light mode pairs warm paper with teal enamel. Dark mode uses charcoal-black,
warm ivory, and a sharper steel response. Theme selection follows the
system until overridden, persists locally, and paints before React to avoid flashes.
The portrait and Spotify/NYU marks reuse existing assets. See
[the options and art-direction decisions](docs/signal-art-direction.md).

Project previews were restored from commit `3c38b2c`: Rekindle’s original SVG,
plus the MarketMind, AutoCPT, and NBAnomaly product screenshots. The shared selection
lives in `src/portfolioProjects.ts`, also used by the no-JavaScript HTML fallback.

```sh
bun install
bun run dev          # localhost:8080
bun run typecheck    # strict application and build configuration checks
bun run lint
bun run test
bun run build
bun run preview
```

## Where to make changes

- `src/content.ts`: project evidence, source links, and experience history.
- `src/components/EditorialPortfolio.tsx`: page composition, introduction, and project selection.
- `src/index.css`: the design protocol, component styles, and responsive layouts.
- `src/components/SiteHeader.tsx`: native anchor navigation.
- `src/components/ThemeToggle.tsx`: accessible light/dark switch and persistence.
- `src/components/OrgMark.tsx`: single-colour org logos for the experience rows.
- `scripts/hero/`: editable sculpture, rendering script, and responsive image exporter.
- `src/scene/createSignalScene.ts`: live hero braid geometry, renderer lifecycle, and disposal.
- `src/scene/wireMaterial.ts`: physical metal/enamel shading, brushing, cursor deformation, and signal emission.
- `public/environments/wire-studio.hdr`: original bundled HDR studio lighting; regenerate with `uv run scripts/generate-wire-studio.py`.
- `scripts/staticFallback.ts`: build-time HTML from the same project and experience data.
- `index.html`: metadata, pre-paint theme initialization, and fallback insertion point.
- `public/documents/`: résumé PDF; `public/images/`: optimized portrait.

The build inserts readable content into the root before React mounts. Project and
experience edits therefore reach the JavaScript and no-JavaScript versions together.
The résumé and portrait use Vite's configured base path, including `/portfolio/`.

The obsolete Spline and Babylon previews have been removed. The homepage hero is
the single source of truth for the wire. Both themes use ACES tone mapping; the
signal emission is restrained to preserve the material highlights.
