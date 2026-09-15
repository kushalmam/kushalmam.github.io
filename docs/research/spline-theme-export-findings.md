# Spline theme and export findings

Checked 2026-09-14. Primary sources only. No Spline file, export, or main-site implementation was changed during this investigation.

## Isolated implementation and visual validation

### Follow-up: earlier export test

`/spline-study.html?source=earlier` loads the original export for both panels.
The candidate hides only objects named `Flow`, `Button`, `Rectangle`, and
`Keep Your Data`, verified through the runtime's public object enumeration.
No watermark assets, lights, wire groups, materials, or renderer internals are
changed. No remote export was regenerated.

Browser observations: the earlier candidate runs its wires and animation without
a visible badge in dark and light previews, whereas the refreshed export showed
one. This supports reusing the earlier hosted export as a potential dark-mode
option, not a guarantee about permanent availability or future exports.
Light mode still has the original global vignette, producing gray/dark corners;
therefore this is not yet a complete light/dark production solution. The live
portfolio remains on the pre-Spline renderer.

`/spline-study.html` compares the original `wsJFrnRqL89Q5Hh6` export, left
untouched, with the existing vignette-free `wPyTzb77ryucbKu0` export. No new
remote exports were generated. Both use runtime 2.0.46 and the same automatic
backend selection. The backend itself was not instrumented.

Observed in the local browser at 1280 × 720:

- Original reference retains its authored text, lighting, effects, and animation.
- Candidate dark and light themes render the actual animated wires. Light mode
  has an ivory surface at center and edges, not the earlier black/gray vignette.
- Theme changes do not reload the asset or invert/recolor the wire material.
- The optional CSS edge fade is distinct from Spline's postprocessing. It is a
  visual approximation of the edge treatment, not a restored original effect.
- Directly rotating the `lines` group initially moved it out of view. Compensating
  its position around the top-level `Camera` object's projected center keeps the
  horizontal bundle in frame. Canvas and badge stay upright. Returning to vertical
  restores the captured position and angle without cumulative transforms.
- Horizontal mode changes the geometry's relation to the stationary light, so its
  reflections differ from vertical. The default vertical comparison is the closest
  baseline; horizontal mode remains an optional study, not a fidelity guarantee.
- The candidate still displays its export-owned badge. This blocks a badge-free
  production restoration under the user's stated requirement.

Automated controller tests cover reference non-mutation, theme selection while
loading, switching without reloading, pause/resume calls, disposal during loading,
load failure, and reversible group orientation. These tests do **not** substitute
for GPU screenshots or prove pixel-level fidelity. Mobile/GPU performance and
account export entitlements have not been validated.

Before any production restoration: resolve the badge with a legitimately
watermark-free export, verify the *fresh* exported URL in both themes, check
horizontal framing/reflections at desktop and mobile sizes, and get visual approval.

## Confirmed runtime controls (2.0.46)

The published, version-pinned [TypeScript declaration](https://unpkg.com/@splinetool/runtime@2.0.46/runtime.d.ts) confirms:

- `findObjectByName(name)` returns the first match or `undefined`; `findObjectById(uuid)` avoids duplicate-name ambiguity.
- `getAllObjects()` returns a flat `SPEObject[]`. Each object exposes `name`, `uuid`, `visible`, `position`, `rotation`, and `scale`; inspect these to identify the authored wires group and decorative objects.
- Returned proxy `.rotation` is a Three.js Euler in **radians**, explicitly documented in `CreateObjectOptions`. Creation-option rotation itself uses degrees. For a verified `lines` group, retain its starting rotation and apply `lines.rotation.z = initialZ + Math.PI / 2` for a 90-degree offset.
- `setZoom(number)`, `setSize(width, height)`, `setBackgroundColor(cssColor)`, `play()`, `stop()`, and `requestRender()` exist.
- There is no typed `setCamera`, camera-target setter, or vignette/postprocessing setter. `controls`, `data`, and `eventManager` are typed `any`; their presence does not establish a supported camera/effects mutation contract.
- `color` can add a color layer; `setMaterial` replaces authored material handling. Neither is appropriate when preserving the original wire appearance.

The [official React integration](https://github.com/splinetool/react-spline#read-and-modify-spline-objects) documents object lookup and transform mutation after loading. The [Code API overview](https://docs.spline.design/exporting-your-scene/web/code-api-for-web) explicitly supports position, scale, rotation, variables, events, and transitions.

**Implementation recommendation, not an animation guarantee:** use the existing runtime/export, change only the verified group transform and scene background, and leave materials and animation configuration intact. Observe a full animation cycle: an authored transition targeting the same group rotation could override a runtime adjustment. Identify unwanted objects before changing visibility; hiding all non-wire objects indiscriminately could remove lights or an ancestor of the wires.

## Alpha and postprocessing

[Play Settings](https://docs.spline.design/exporting-your-scene/play-settings) documents hiding BG Color for transparent embedding. The [official Viewer examples](https://viewer.spline.design/) accept CSS background overrides and demonstrate an `rgba(...)` value with partial alpha. This confirms an intended transparency capability, **not** that every runtime backend, material, and postprocessing combination preserves alpha.

The [2.0.46 implementation](https://unpkg.com/@splinetool/runtime@2.0.46/build/runtime.js) parses the color and passes it to `activePage.setBackgroundColor`, then requests rendering. That entry point alone does not prove final-canvas alpha behavior. The repo's `SplineBackground.tsx` comment records alpha rendering as black for this export; this investigation did not independently reproduce it or establish its cause.

[Effects documentation](https://docs.spline.design/cameras/effects-post-processing) says postprocessing applies globally, lists Vignette, and documents toggling effects with the editor's eye icon and opening settings with its settings icon. It does not document a public runtime switch or guarantee background exclusion. The reported light-background darkening is consistent with a global vignette, but attribution should be verified in the actual export.

For the isolated lab, test an opaque page-matched color first and inspect both center and corners. A background-color change alone cannot be assumed to remove vignette darkening. Do not label unsupported private runtime mutations as supported API. Runtime 2.0.46 can choose WebGPU or WebGL; its declaration requires all instances on one page to use the same backend, so record the backend when comparing panels.

## Export snapshots and watermark

### Local light-mode fix (earlier export, September 14)

The isolated `?source=earlier&theme=light` preview now disables only the authored
vignette in light mode and restores its authored setting in dark mode. The opaque
ivory surface and optional CSS ivory edge fade preserve the original wire materials
and animation. The original reference and main portfolio are unchanged.

This uses a guarded, **unsupported internal adapter** for pinned runtime 2.0.46:
`_scene.activePage.data.postprocessing`. The [classic renderer implementation](https://unpkg.com/@splinetool/runtime@2.0.46/build/runtime-classicRuntime-Z4JNOMJD.js)
compares that configuration by identity before updating its effect passes. Changing
`vignette.enabled` in place failed visually; replacing the configuration and nested
vignette object succeeded. Other effects remain unchanged. Public `requestRender()`
only queues a frame; a paused scene has no loop to consume it. After a paused visual
edit, the preview briefly runs the normal loop (500 ms) to settle shader compilation
and temporal passes, then restores pause. Animation can advance during this refresh.
An incompatible vignette
hook fails the preview explicitly.

Browser verification: fresh light load changed gray/black edges to ivory while
retaining metallic wires and colored pulses; switching to dark restored the dark
effect. No watermark assets or renderer branding methods were changed. Unit tests
cover configuration replacement and controller theme switching, but real browser
checks remain required before any runtime upgrade or production promotion.

[Code export documentation](https://docs.spline.design/exporting-your-scene/web/exporting-as-code) confirms that drafts are scene snapshots, the main URL points to Production, and scene/export-setting changes require Generate Draft or Promote to Production to reach the export. It also states that animations and events are enabled for Vanilla JS and React exports; switching to a different geometry-oriented export is not an equivalent way to preserve the authored behavior.

**Inference:** republishing can change what bytes the existing production URL serves; a fresh request can reveal that export's watermark setting. A query-string cache buster does not itself establish or remove watermark entitlement. No official source reviewed says that cache busting causes a watermark, or guarantees that a previously unmarked cached export stays unmarked after regeneration. The earlier observed watermark regression requires comparing the old and new export/settings to determine its precise cause.

Current [pricing](https://spline.design/pricing) lists Free web exports with a watermark and Hobby with no watermark on 3D web exports (currently $15/seat/month monthly or $12/seat/month billed yearly). Pro and Max inherit Hobby. Enterprise lists Code & Self-hosted exports. [Play Settings](https://docs.spline.design/exporting-your-scene/play-settings) says Hobby, Pro, and Max can remove the logo for Public URLs, Viewer embeds, and Code Exports; native Apple/Android removal requires Pro or Max. Export-download access and logo-removal eligibility are separate questions: verify the actual workspace's available controls before promising a downloadable export on a particular plan.

For any future authorized publishing step, confirm workspace entitlement and the logo option, create a separate draft for inspection, and inspect its freshly loaded URL before replacing production. No account entitlement or current editor setting was verified here. CSS masking, cropping, or deleting the badge is not a documented watermark-free export option.

## Follow-up: badge ownership and query suffix

Direct inspection of the pinned [runtime implementation](https://unpkg.com/@splinetool/runtime@2.0.46/build/runtime.js) establishes the following:

- `Application.start` decodes the supplied bytes into document data. During per-instance renderer configuration it checks `r.shared.images.SplineWatermark`, loads that image through the instance's asset manager, and passes its texture to `this._renderer.pipeline.setWatermark`. This is scene-asset-driven, per-renderer setup, not a singleton DOM badge.
- `Application.load` passes its URL directly to `fetch`, reads an ArrayBuffer, and calls `start` with the bytes and variables. That path does not pass the scene URL into `start` or use it for an entitlement/domain check.
- Its suffix validation uses `endsWith('.splinecode')` and only logs a warning. A `?v=no-vignette-1` suffix therefore causes that warning without preventing loading.
- `getAllObjects` actually filters internal/invisible objects during traversal; its typed “all objects” description is not an exhaustive raw scene-tree guarantee.

**Limit:** no scene bytes were fetched in this follow-up. The code supports per-export watermark assets as an explanation for different badges in two instances. It does not prove which assets either export currently contains, what publishing action introduced them, or whether the CDN serves identical bytes for query variants. Do not blame the query string or republishing as the established cause without that comparison. No badge suppression was attempted.
