# Font audit — AI-slop risk and replacement options

Scope: `src/`, `index.html`, `public/`, `scripts/assets/`. Built assets in `dist/` are ignored.

## What is actually loaded

| Font | Role and locations | Weights / cuts | AI-slop risk | Verdict |
| --- | --- | --- | --- | --- |
| **Archivo** (variable) | Site sans. Root `font-family`, header wordmark, body copy, About lead/text, Work title, project titles, Contact heading/values. Loaded via custom `@font-face` from `@fontsource-variable/archivo`. | 100–900, width 62–125%; used at 520–760 weight and 82–88% width | **3/10** | Keep. Not an AI-default face; the stretched/tight display usage is the trope, not the font. |
| **Redaction** | Hero name (`.name`), italic accent in `.hero-role em`, and the name-cut effect via Redaction 10/35/70/100. Imported in `src/main.tsx`. | 700, 400 italic; optical cuts 10/35/70/100 at 700 | **1/10** | Keep. Most distinctive part of the identity; very unlikely to read as AI-generated. |
| **Departure Mono** | 11px uppercase micro-labels: nav stages, project numbers, contact labels, privacy link. Local `woff2` in `src/assets/fonts/`. | 400 | **5/10** | Optional replace. Good font, but pixel-mono + tiny uppercase metadata is a very common indie-dev/AI portfolio signal. |
| **Helvetica Neue / Arial** | Sans fallback after Archivo. | — | 1/10 | Fine as a fallback. |
| **Times New Roman** | Serif fallback after Redaction (`--serif`). | — | 1/10 | Fine as a fallback. |
| **ui-monospace / SF Mono / Menlo** | `public/privacy/index.html`, `public/404.html`. | — | 0/10 | Fine technically, but off-brand versus the main site. |
| **Georgia / Times New Roman / Arial** | `public/images/og-preview.svg`, `index.html` static fallback, `public/404.html` and `public/privacy/index.html` headings. | — | **7/10** in OG/static fallback | Replace. Generic serif/sans makes the social card and no-JS/error surfaces feel detached from the site. |
| **Manrope / DM Mono / Newsreader** | Deleted with `scripts/assets/rekindle-preview.html`. | — | 6–7/10 | Removed. The exported Rekindle PNG is still used. |

## Why the site can still read “AI” even with good fonts

The faces are not the main problem. The tells are in the typographic *system*:

1. **Huge, tightly tracked, width-condensed display sans** (Archivo at 82–84% width, `-0.065em` to `-0.07em`). This is the default “award-winning AI portfolio” hero treatment.
2. **Tiny uppercase mono labels everywhere.** A mono font at 11px in uppercase with wide tracking is the single most recognizable “technical portfolio” cliché.
3. **Serif italic accent word inside a sans headline** (`.hero-role em`). Distinctive face, but the pattern is common in AI-generated editorial layouts.
4. **Too many families in the stack** (Archivo + five Redaction cuts + Departure Mono). AI output tends to over-stack fonts to look designed.
5. **Generic system fonts on the OG card and static/error pages**, which breaks the identity exactly where people first see a link.

## Replacement shortlist

### Sans — keep Archivo unless you want a bigger change

- Keep **Archivo** (recommended). It is a proper editorial grotesque, not Inter/Space Grotesk/Geist.
- Free alternatives with more character: **General Sans**, **Hubot Sans** (variable width), **Familjen Grotesk**, **Bricolage Grotesque** (display only).
- Commercial alternatives: **Söhne**, **ABC Diatype**, **Founders Grotesk**, **Neue Haas Grotesk**, **Atlas Grotesk**.
- Avoid: Inter, Geist, Space Grotesk, DM Sans, Manrope, Poppins, Montserrat, Plus Jakarta Sans.

### Serif — keep Redaction

- Keep **Redaction** (strongly recommended). It is doing the most anti-slop work on the site.
- If you ever replace it: **Signifier**, **Editorial New**, **Times Now**, **Canela** (commercial), or **Gelasio** / **STIX Two Text** (open).
- Avoid: Instrument Serif, Fraunces, Newsreader, Playfair Display, DM Serif Display. These are current AI-portfolio defaults.

### Mono — the one worthwhile swap

- **Commit Mono** — neutral, excellent at 11px, free. Recommended if you want the labels to recede.
- **Sometype Mono** — more editorial and less “coding font”, free.
- **Fragment Mono** — Helvetica-adjacent, quieter than Departure Mono, free.
- **Martian Mono** — more character and a width axis, free, but trendy.
- **Berkeley Mono** — commercial, very respected, still has techy connotations.
- Avoid: IBM Plex Mono, JetBrains Mono, Space Mono, Geist Mono, Fira Code, Roboto Mono.

### System / OG / static surfaces

- Render `og-preview.png` with **Archivo + Redaction** instead of Georgia/Arial.
- Use Archivo on `/404` and `/privacy`; optionally use Departure Mono (or its replacement) for their small labels.
- Update the `index.html` no-JS fallback to Archivo/Redaction with the same fallback stack.

## Recommended minimal change

1. Keep **Archivo** and **Redaction**.
2. Replace **Departure Mono** with **Commit Mono** or **Sometype Mono** (only one).
3. Regenerate the OG image and align `/404`, `/privacy`, and the no-JS fallback with the site fonts.
4. The stale `scripts/assets/rekindle-preview.html` preview has been removed.

This removes most of the “AI portfolio” signal without flattening the site’s identity. Replacing Archivo or Redaction is optional and higher-risk.

## Applied

- Removed `scripts/assets/rekindle-preview.html` and its README reference.
- Header stage navigation (`Ingest / Route / Transform / Output`) no longer uses Departure Mono uppercase micro-type. It now uses Archivo at 13px/560 in sentence case (12px on mobile), with normal tracking. The shared mono label styles for affiliations, project categories, and contact labels are unchanged.
- The travelling stage pill (`.guide-dot__label`) now uses Archivo at 10px/600 in sentence case instead of Departure Mono. Redaction was tested for the pill but is too wide and cramped at that size.
