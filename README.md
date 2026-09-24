# Kushal Mamillapalli — Portfolio

Warm paper, muted teal typography, and a continuous sculpted signal route.
Page order: name-led hero → About → four project cards → Contact + Résumé.

`SignalRoute.tsx` measures the page after layout and font changes. Its route drives
three depth-tested tube meshes in `src/scene/createSignalScene.ts`. Surface lighting,
subtle scroll deformation, and nearby signal illumination use custom shaders. The
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

The prior Blender assets and experiments remain in the repository as historical
work; they are not imported by the homepage.

## Isolated Spline investigation

Open `/spline-study.html` on the development server for the original export next
to the actual wires-only export. This page is a separate build entry and is not
imported by the live portfolio. It offers light/dark surface checks, an optional
page-level edge fade, pause/play, and horizontal wire-group rotation around the
authored camera center. It never rotates the canvas or alters wire materials.

The earlier export showed no badge in browser verification. No watermark asset
or branding method is altered. See [the investigation](docs/research/spline-theme-export-findings.md)
for confirmed API behavior, limitations, and browser validation.

The Spline study remains as an isolated historical reference. Its hosted scenes
require network access. The portfolio does not import either study or `NativeWireBackground.tsx`.

Historical reference credit: [Flow by Vlad](https://community.spline.design/file/ff4fcef4-b6ab-406f-9359-d639509f2d99),
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

The System Strata design and renderer budgets below describe the previous
terrain implementation, retained in `src/scene/createSystemScene.ts` as reference.

An editorial portfolio about data infrastructure, backend systems, and applied ML.
Built with React 18, TypeScript, Vite, plain CSS, and locally rendered imagery. No router or animation framework is needed for this single page.

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
- `src/components/NativeWireBackground.tsx`: historical wire integration, not imported by the homepage.
- `src/scene/createSystemScene.ts`: scene objects, animation, renderer lifecycle, and disposal.
- `scripts/staticFallback.ts`: build-time HTML from the same project and experience data.
- `index.html`: metadata, pre-paint theme initialization, and fallback insertion point.
- `public/documents/`: résumé PDF; `public/images/`: optimized portrait.

The build inserts readable content into the root before React mounts. Project and
experience edits therefore reach the JavaScript and no-JavaScript versions together.
The résumé and portrait use Vite's configured base path, including `/portfolio/`.

## Historical design protocol (superseded by the assembly hero)

The visual identity is **System Strata**: five sampled terrain surfaces represent
visible surface, interface, services, data, and evidence. A full-viewport visual
field is independent of the constrained content grid. There is no drawing rail or
outer page frame. Rules only divide experience entries and disclosure controls.

Archivo's variable width and weight provide the expanded architectural display.
Newsreader italic is used selectively in the hero, award, and contact; IBM Plex
Sans remains the reading face, with Plex Mono reserved for dates, stacks, and the
Rekindle metric. All five font faces use self-hosted Latin WOFF2 and font-display
swap. The Archivo font includes both width and weight axes.

The dark palette uses almost-black `#090D0A`, warm white `#F1F1E8`, and acid lime
`#B9F542`. Emerald is concentrated in the scene. Light appearance keeps dark text
and a darker green accent for contrast. The header switch flips between the two and
stores the choice; the OS preference only decides the first visit. Org logos are drawn
in `currentColor` so they take the active theme's ink.

The original ten-step spacing scale, fluid gutters, reading measures, and focus
styles remain. Above 1400px on screens at least 3:2 wide, the content grid grows
from 82rem toward 110rem, the hero takes the full viewport height, and display type
keeps scaling, so 16:9 monitors extend the layout instead of stranding it in a fixed
centre band. Expanded hero typography can escape the reading grid. About is a
quieter, personal section. Projects share one component with data-driven `metric`,
`award`, and `research` compositions. Evidence text is stored once as value/unit;
the static fallback combines those fields.

Four authored scene poses change separation, front-layer exposure, lateral offsets,
perspective, and transparency. Opening a project illuminates its surface route.
There is no continuous scroll sampling, scroll hijacking, pointer chase, or animation
library. CSS opacity changes quiet the field under prose. The 480ms focus token
drives time-based damping; rendering stops after the pose settles. Reduced motion
uses a single settled frame. Hover timing remains 160ms.

## Historical renderer performance and maintenance

The optional scene loads when its host is visible. Five strata share one terrain
geometry and one contour geometry; three small tube geometries follow the surface.
Desktop uses about 12,864 mesh triangles across 13 draw calls. Phones initialize
with lower resolution, showing three layers and about 3,168 mesh triangles across
nine draw calls. No textures, shadows, post-processing, bloom, or custom shaders
are required. DPR remains capped at 1.5.

The field is persistent, but idle frames stop completely. Hidden documents and
non-visible hosts do not render. Resize and theme changes invalidate a single frame.
All geometry, materials, listeners, observers, and the renderer are disposed. Context
loss restores a static SVG strata composition; HTML content never needs WebGL.

Production output after the identity pass: main JavaScript ~156 KB (~51 KB gzip),
optional scene ~531 KB (~134 KB gzip), CSS ~14 KB (~3.8 KB gzip). The richer scene
adds about 5 KB gzip over the first pass. Vite retains its standard scene chunk
size advisory. Five WOFF2 faces total about 176 KB, including the 90 KB Archivo
variable font. The portrait remains ~132 KB. Monitor these budgets when extending
the scene; no physical integrated-GPU benchmark has been recorded.

The existing GitHub Pages workflow deploys pushes to main. This redesign does not
change that workflow or publish anything itself.

See `docs/redesign-audit.md` for the cleanup inventory and verification record.

## Original Babylon.js wire study

Open `/wire-study.html` for an isolated hero mockup with the portfolio headline,
navigation, and 20 strands arranged into five loose bundles. The production portfolio no longer imports this renderer.
The study bundles Babylon.js locally and does not load Spline or remote art assets.

- `src/scene/wireStudy/paths.ts`: original editable cable landmarks and radii.
- `src/scene/wireStudy/signals.ts`: randomized emission intervals, bounded manual pulses,
  and smoothly varying forward travel independent of material shading. Randomness
  is injectable for frame-rate-invariance and motion-continuity tests.
- `src/scene/wireStudy/shaders.ts`: analytic chrome studio reflections, coherent slow spatial-flow deformation
  with corrected normals, and separate emissive signal shading; this is an art-directed material, not a PBR simulation.
- `src/scene/wireStudy/createStudy.ts`: WebGL renderer, arc-length mesh coordinates,
  tight full-resolution HDR bloom, tone mapping, resize handling, and lifecycle cleanup.
  MSAA/supersampling and footprint-filtered reflections replace the extra FXAA blur
  to reduce crawling highlights and ribbed halos on moving wires.

Travel defaults to 2× and glow to .21 (70% below the previous .7). A shared
emission scheduler produces about .5 packets per scene-second, roughly 80% fewer
than the former eleven independent streams. Highlights stay cream/lime with 5%
muted cyan emissions; most strands are thin, faint background layers. No
independent strand oscillation is applied. Compact controls cover pause,
travel speed, glow, and light/dark surfaces. Reduced-motion starts paused; hidden or offscreen scenes
stop their animation loop. Narrow viewports use fewer tube segments and closer framing. Thin reflective
wires use 3× supersampling on narrow canvases, with an eight-million-pixel framebuffer
budget (never below CSS resolution), to prevent the broken/ridged highlights seen at lower sampling rates. GPU/context failure displays an explicit status message.
Hero navigation links return to the corresponding sections of the main portfolio.

Validation: signal timing, speed scaling, and capacity/retirement have unit tests;
run `bun run test`, `bun run typecheck`, `bun run lint`, and `bun run build`.
This is a visual prototype, not a production performance budget: its separate entry
adds roughly 270 KB gzip of renderer code plus shader chunks. No mobile hardware
benchmark or exact visual-match claim is made.
