# Industrial-editorial polish

The portfolio retains its content, project evidence, case-study disclosures, and
asymmetric hero. The current pass makes the visual language consistent across it.

- Archivo is the primary face (body and display), Newsreader italic appears in the
  hero/contact concepts, and IBM Plex Mono is reserved for metadata. The unused
  Plex Sans font imports were removed from the homepage.
- Studio illumination uses the requested dark graphite/steel and warm-paper ramps,
  very low-alpha light pools aligned toward the object, and static 1.8% grain.
  Construction marks are confined to the project introduction.
- The Blender camera and object position stay fixed. Actual pivot rotation is
  ±1.4° / ±.45°. A 14-second operation briefly raises the cover and separates layers;
  a neutral key light changes gently for 11 seconds, then rests. CSS bobbing is gone.
  Pointer translation is capped at ±1px per axis and disabled for touch/reduced motion.
- Project layouts stay distinct. Rekindle has one lime ranking track and a grouped
  static metric; AutoCPT has six active bars among 36 neutral/active waveform bars;
  MarketMind uses solid/dashed signals, neutral evidence, and sans explanatory copy.
- The Spotify strip remains a thin-rule context section. The project chapter has
  `clamp(11rem, 14vw, 16rem)` breathing room and deliberate headline line breaks.
  Experience uses larger employer names, clear dates, and longer intervals.
- Mobile reads label → headline → support → large object → CTA. The portrait stays
  upright with a restrained grade and its existing caption.

## Contrast and motion checks

Calculated against the least favorable base colors (#101419 dark / #E9EDEC light):

| Text role | Dark | Light |
| --- | ---: | ---: |
| Primary | 16.09:1 | 15.16:1 |
| Secondary | 8.09:1 | 5.99:1 |
| Metadata (data token blended 78% with 22% primary) | 7.68:1 | 5.07:1 |
| Accent text | 15.30:1 | 5.09:1 |

The requested #72B800 light-mode accent is used for physical/diagram signals. Small
links, focus indicators, and metric text use #476E00 to keep text legible. These
are palette calculations, not a claim of a complete accessibility certification.

The 28-second transparent WebM is about 1.34 MB and uses no client-side 3D renderer
or GPU canvas. Reduced-motion visitors retain the high-quality still and do not
load the video. Visibility/manual pause, playback failure, and reduced-motion
behavior have regression coverage. The editable source and render/export workflow
are in `scripts/hero/`.
