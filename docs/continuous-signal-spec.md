# Continuous signal — implementation contract

One native document, one graphite environment, one persistent viewport canvas. A braided input separates around the biography, orders into work channels, crosses and recombines between projects, then resolves into the contact socket. Preserve all current content, project links, images, typography families, name treatments, résumé and accessible navigation.

## Ownership and shared API

**Scene agent:** `src/scene/createSignalScene.ts`, `wireMaterial.ts`, new `signalModel.ts`, scene/model tests. Own the shared types and pure functions below. Reuse the existing tube construction, physical material and HDR environment where useful. Do not edit React or CSS.

**Page agent:** `src/components/SignalRoute.tsx`, `EditorialPortfolio.tsx`, `src/index.css`, controller helpers and interaction/controller tests. Do not edit scene files. Old `signalProgress.ts` and `contactApproach.ts` may remain if other tests use them; the new live route uses the shared model. Unmounted legacy scene components need no changes.

Publish these exact exports from `src/scene/signalModel.ts` first:

```ts
export type SignalPoint = { x: number; y: number; z: number; radius: number };
export type SignalRect = { x: number; y: number; width: number; height: number };
export type SignalSurface = SignalRect & { id: string };
export type SignalLayout = {
  width: number; height: number; viewportHeight: number; mainTop: number;
  mobile: boolean;
  origin: { x: number; y: number };
  terminal: { x: number; y: number };
  hero: SignalRect; about: SignalRect; work: SignalRect; contact: SignalRect;
  portrait: SignalSurface;
  projects: SignalSurface[]; // image boxes only, existing content order
};
export type SignalFrame = {
  scrollY: number; readingY: number; progress: number;
  heroExit: number; route: number; align: number; merge: number;
  gridOpacity: number; projectActivity: number[];
  reducedMotion: boolean; energy: number; focusIndex: number;
};
export function buildSignalTopology(layout: SignalLayout): [SignalPoint[], SignalPoint[], SignalPoint[]];
export function sampleSignalFrame(layout: SignalLayout, input: {
  scrollY: number; maxScroll: number; reducedMotion: boolean;
  energy?: number; focusIndex?: number;
}): SignalFrame;
```

Coordinates are CSS pixels relative to main's top left; **positive y points down, positive z points toward the viewer**. Only scene internals negate y. Rectangles use untransformed layout positions. `mainTop` is main's document offset. `projects` always has four elements with IDs `project-0` through `project-3`; portrait ID is `portrait`. Mobile means width below 700px.

Replace the current scene function's positional render API with:

```ts
createSignalScene({ canvas, layout, onLost }: {
  canvas: HTMLCanvasElement; layout: SignalLayout; onLost: () => void;
}): {
  prepare(): Promise<void>;
  setLayout(layout: SignalLayout): void;
  render(frame: SignalFrame): void;
  dispose(): void;
}
```

`setLayout` updates size, projection, geometry and mask planes but keeps renderer, environment and canvas alive. Rebuild geometry only on meaningful layout change, disposing replaced resources. `render` never reads DOM or schedules frames. Scene agent owns its actual inferred return type; page agent imports that type through `ReturnType`. `prepare` is async HDR preparation, safely resolving after disposal. A failed HDR must still permit a restrained lit scene if practical; renderer failure exposes SVG fallback.

## Shared scroll controller

`SignalRoute` owns the only signal RAF. Cache main, section, origin/socket, image and text references once. Measure after fonts settle and after ResizeObserver/image layout changes; use offset chains or equivalent untransformed boxes. Image aspect ratios reserve space. Resize changes call `setLayout`, never recreate the scene effect. The four section elements remain semantic landmarks.

Scroll/pointer focus/resize listeners only update refs and schedule a frame. The camera uses **actual scrollY immediately** so geometry and DOM masks cannot lag behind native scrolling. Damp only energy and decorative CSS values with `1-exp(-10*dt)`. Stop RAF when settled, stop while hidden, wake on scroll/resize/visibility/focus. No React state per frame. Ready/fallback and measured SVG paths may use occasional state.

`sampleSignalFrame` is deterministic and clamps every normalized quantity. With `r = scrollY-mainTop+0.45*viewportHeight`, use smoothstep over these measured intervals:

| Value | Interval in document-relative y |
| --- | --- |
| heroExit | hero bottom minus 0.65 viewport → hero bottom plus 0.15 viewport |
| route | about top minus 0.20 viewport → about top plus 0.45 viewport |
| align | work top minus 0.55 viewport → work top plus 0.10 viewport |
| merge | last project image bottom plus 0.10 viewport → terminal y |

Use `r` as the interval input. `progress = clamp(scrollY/max(1,maxScroll))`. `readingY` starts at origin.y, advances through the hero without an initial jump, then tracks r; ease to terminal.y over the last min(260px, 0.3 viewport) of scrolling and reach it exactly at maxScroll. It cannot move backward as native scroll advances. `projectActivity[i]` is a smooth proximity envelope around each image center, falling to zero approximately 0.8 viewport away. `gridOpacity = 0.22*(1-heroExit)+0.035*merge`; CSS grid line alpha supplies the remaining restraint. Optional `energy` defaults 0, `focusIndex` defaults -1. Reduced motion forces energy 0.

Controller writes shared CSS properties on main: `--hero-exit`, `--route-progress`, `--align-progress`, `--merge-progress`, `--grid-opacity`. Each project receives `--project-activity` (maximum of frame activity and a modest focus contribution). Set `data-signal-at-contact` only on arrival. CSS and Three consume this same frame; remove the blanket IntersectionObserver blur/translate reveal system.

## Geometry: substantial, continuous topology

`buildSignalTopology` returns three continuous sampled centerlines with radii, all derived from the same measured layout. Use smooth cubic routes/curve sampling; keep y monotone after the hero. Three close strands read as one hero cable; **do not retain the existing three offsets around one long spine as the work topology**. All endpoints are pinned to origin/socket at z=0. Two strands taper to zero after merging; the remaining strand forms a small final collar at the socket.

1. **Signal / hero:** preserve a generous organic loop to the right of the existing name. Radius roughly 5–6px desktop, 2.5–3.5px mobile. Braid envelope 7–12px. Actual z travels approximately -45 to +90px, with one brief +120px near-camera arc in empty hero space. It stretches into the next composition, rather than ending at the hero boundary.
2. **Route / about:** spread the bundle into three visibly separate branches over the hero/about handoff. One follows the portrait's outside left edge, one passes behind the portrait at z=-55, and one bends through the portrait/content gutter. Desktop branch spread should reach at least 18% of page width. Route around the biography text; never run foreground wire across affiliation labels. Gather below the portrait/content composition.
3. **Align / work entrance:** three branches converge into ordered parallel channels, with roughly 14–22px gaps desktop and 6–9px mobile, through the negative space leading into Selected Work. Their alignment supplies the heading axis. Give the heading at most 12px of horizontal settling driven by `align`; it stays readable throughout.
4. **Transform / work:** use each image rectangle to author distinct entry/exit points. Rekindle receives a recessed branch through the upper-left quarter and a short foreground edge pass. MarketMind changes routing side, with a crossing in the empty gap before it. AutoCPT receives the most compact, ordered channels, including a short front pass near an image corner. NBAnomaly separates a final pair and recombines below it. A crossing must exchange strand order and use a genuine positive/negative z separation. Most of each screenshot remains unobscured. Foreground passes use its outer 10–15%, never the central interface. Between images, return to spare rails; do not surround every card with loops.
5. **Connect / contact:** all branches converge over at least 0.6 viewport into one conduit. Eliminate braid noise and taper the two secondary strands. The final approach has smooth vertical tangents and terminates exactly at the existing apostrophe socket. Sparse composition, quiet mint arrival.

Spatial changes along the continuous document establish the narrative even in a static screenshot or reduced motion. Small frame-driven shader deformation can reinforce tension, but cannot create the topology by itself. Protect readable content through routing and stacking rather than opaque panels behind paragraphs.

## One-canvas depth and DOM occlusion

Use a transparent **fixed viewport-sized canvas on desktop and mobile**. Avoid the current document-height mobile framebuffer. Use a perspective camera at z=1200, x=width/2, y=mainTop-scrollY-viewportHeight/2. Set vertical FOV to `2*atan(viewportHeight/(2*1200))` in degrees: the z=0 content plane maps 1:1 to CSS pixels. Near/far encompass roughly z=-150…+160. Resize updates FOV/aspect. Never damp camera scrolling or shift the camera independently of masks.

For portrait and each project image, create a rectangle proxy plane at **z=0** with `colorWrite:false`, `depthWrite:true`, `depthTest:true`, double-sided, rendered before wire meshes (`renderOrder=-10`). They write depth without covering the underlying DOM image. Wires behind that plane disappear exactly within its bounds; wire at positive z draws over the image. These five inexpensive planes bridge DOM and WebGL while wire crossings use genuine geometry depth. No screenshot textures, second renderer, stencil framework or section canvases.

Stacking contract: main creates isolation; environment/grid z=0, image content z=1, fixed canvas z=2, readable text/links/controls z=3. Sections/articles must not create ancestor stacking contexts that trap image and text together: avoid whole-card transforms, opacity and z-index. Apply text effects to inner text wrappers only. Canvas has pointer-events:none. Image proxies and DOM boxes stay untransformed; avoid image parallax that would desynchronize them. Tiny edge influence can animate inside the fixed image box.

Depth cues: darker, rougher and lower-contrast wire behind z=-40; cleaner studio highlight near z=0; slightly larger perspective appearance at positive z. Mix distant color gently toward graphite and attenuate fine specular/brush detail to suggest atmospheric softness; do not blur the canvas or add a DOF pass. Remove the existing global drop-shadow. A localized image-edge highlight/shadow may use a narrow pseudo-element driven by `--project-activity`, max alpha about .035 light/.10 shadow, only at the authored wire entry edge. It is an understated DOM bridge, never a large halo. Signal emissive is confined to a short moving band, with no bloom.

## Graphite composition and pacing

Use one background `#151817` (allow tiny environmental luminance changes only); warm text `#eeeae1`, secondary `#a7ada7`, muted line `#343a36`, quiet cable `#537468`, signal mint `#b4e9ce`. Remove paper/sage/green section fills and gradient transitions. Keep Archivo and the existing typographic treatments. Mint is chiefly the packet/socket and small metadata. Remove the rounded header contact pill. Keep project imagery's original colors.

Environment grid belongs to main, follows the shared opacity, fades through about, is nearly absent in work, and barely reappears in contact. Keep technical metadata small: use existing project categories and unobtrusive 01–04 indices, not extra slogans.

Replace the two-column repeated card grid with four paced compositions on a 12-column desktop grid, with 100–180px of flexible breathing room between projects: Rekindle broad (columns 3–12), MarketMind narrower left (1–9), AutoCPT medium right (5–12), NBAnomaly broad centered (2–11). Captions can sit in adjacent empty columns where space permits; otherwise below. Preserve full readable screenshots and original aspect ratio. Widths/order and route handoffs provide variety without floating cards. About keeps portrait left and biography right; allow enough inter-section space for branching. Contact occupies a quieter, spacious final viewport.

Below 700px, retain all content in natural reading order, image widths approximately 88–100% of available content width, modest alternating insets, and a reserved left signal gutter around 28–44px. Branches still separate around the portrait and cross at project image margins, but avoid text lanes. No horizontal overflow. Use DPR cap 1 mobile/1.5 desktop, roughly 400–650 centerline samples per strand, 8–12 radial segments mobile/12–18 desktop. One active packet; no ambient perpetual RAF or pointer repulsion.

Reduced motion keeps the same static topology and depth, instantaneous native-scroll projection, all copy visible, no damped DOM travel, packet pulse or background drift. SVG fallback comes from the same topology arrays, with three paths that visibly split/rejoin. Put fallback behind images and text for safe readable occlusion; real foreground effects may degrade there. Failure must not hide content or links.

## Acceptance evidence

- Scene/model tests: finite positions/normals and outward tube winding; endpoints anchored; substantial about split; ordered work entrance; at least one genuine order-changing crossing; negative and positive z image passes; two terminal tapers; monotone/clamped reading progress ending at socket.
- Scene lifecycle tests: renderer survives `setLayout`; camera registers z=0 to viewport at multiple scroll positions; exactly five correctly placed depth-only proxies; viewport-sized buffer on mobile; repeated disposal safe; late HDR completion/context loss safe. Update obsolete tests that require three total scene children or a page-height mobile canvas.
- Controller tests: resize updates existing scene; scroll uses shared frame with no per-frame React render; one scheduled RAF; hidden/reduced motion behavior; cleanup removes observers/listeners and disposes once. Existing navigation, project links, content and résumé tests continue passing.
- Run `bun run typecheck`, `bun run test`, `bun run build`, and relevant lint. No new dependencies.
- Inspect actual browser at desktop ~1440px and mobile ~390px: hero/about handoff, aligned work entrance, all four project compositions, behind/front wire interaction, final socket. Check a mid-scroll resize, reverse scrolling, keyboard focus, reduced motion and simulated WebGL failure. Verify real image occlusion edges remain registered while scrolling, readable text never intersects foreground wire, and no background seams. Unit tests alone cannot establish this visual result.
