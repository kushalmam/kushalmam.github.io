# Portfolio validation — 2026-09-07

## Completed

- `bun run build`, `bun run lint`, and `bun run test` pass; six existing tests across two files.
- Browser inspection of the updated homepage at desktop, 390px, and 320px widths. No document-level horizontal overflow at the two narrow widths. Dates moved below role text on mobile.
- Keyboard: first Tab reaches Skip to content; activating it and pressing Tab reaches View selected work; activating that link reaches the work section. Menu opens, Tab enters its links, and Escape closes it and restores focus to the toggle.
- Accessibility tree exposes the updated roles, heading hierarchy, project-specific source link names, and descriptive workflow image labels. This is tree inspection, not a screen-reader listening session.
- Essential experience and project prose is rendered without IntersectionObserver reveal gating. Decorative logo alt text and existing focus styles were retained.

## Remaining validation limits

- Public PageSpeed request for `https://kushalmam.github.io/` returned HTTP 429 / quota exhausted. No deployed Core Web Vitals or real-user performance numbers were obtained. Local build or Vite startup timing is not a substitute.
- Vite reports a 734.51 kB Three.js chunk (189.59 kB gzip); it is separate from the main bundle. This warning alone does not establish poor real-user performance.
- Narrow viewport reflow was checked, but browser zoom and a dedicated screen-reader session have not been tested. Reduced-motion handling requires runtime verification beyond source inspection.
- Changes are local; this pass does not deploy the site or regenerate the downloadable resume PDF.
