# Kushal Mamillapalli — Behind the interface

An editorial portfolio about data infrastructure, backend systems, and applied ML.
Built with React 18, TypeScript, Vite, plain CSS, and a progressively enhanced raw
Three.js drawing. No router or animation framework is needed for this single page.

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
- `src/components/SystemsScene.tsx`: page observation, scene loading, and static fallback.
- `src/scene/createSystemScene.ts`: scene objects, animation, renderer lifecycle, and disposal.
- `scripts/staticFallback.ts`: build-time HTML from the same project and experience data.
- `index.html`: metadata, pre-paint theme initialization, and fallback insertion point.
- `public/documents/`: résumé PDF; `public/images/`: optimized portrait.

The build inserts readable content into the root before React mounts. Project and
experience edits therefore reach the JavaScript and no-JavaScript versions together.
The résumé and portrait use Vite's configured base path, including `/portfolio/`.

## Design protocol

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

## Performance and maintenance

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
