# Signal, second art-direction pass

## Options considered

1. **Folded ribbon:** one wide satin surface, a full-width portrait crop, graphite and ivory modes, uniformly flush project images. Strong silhouette, but the ribbon competes with the surname and makes the lower page feel like separate panels.
2. **Loose cable:** larger separating loops around a small portrait, floating organization marks, smoky dark mode, freely staggered cards. More spatial personality, but too many unrelated positions and loops for the requested restraint.
3. **Compact braid — selected:** three physical strands travel together, separate briefly around About, cross in the project gutter, and gather at Contact. An offset portrait anchors About; Spotify and NYU marks sit with their actual roles. Enamel/daylight versus patinated metal/night. Four real project previews have different mounting colors and a modest alternating offset, with identical caption rules.

## Implementation constraints

Keep the hero's name and main silhouette. Use actual tube geometry, depth testing, surface-normal lighting, and localized signal illumination. Tie deformation to scroll rather than a perpetual idle animation. Render only a viewport-sized transparent canvas, cap pixel density, and dispose GPU resources. Reduced motion preserves static geometry. Keep a theme-aware SVG route if WebGL is unavailable.

Reuse `public/images/portrait.jpg`, existing `OrgMark.tsx` vectors (also present as older logo assets), and project previews recovered from `3c38b2c`. No invented product screens. No node badges, category micro-labels, or explanatory section labels.
