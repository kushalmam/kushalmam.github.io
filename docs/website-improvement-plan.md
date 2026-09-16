# Website improvement plan

Preserve the portfolio’s editorial identity and verified experience/project facts.
Luna agents perform the implementation and focused verification; the coordinating
agent records the plan, checks integration, and runs the final gates.

| Criterion | Owner | Acceptance check |
| --- | --- | --- |
| 1. Visual hierarchy | Luna visual | Hero, section headings, and evidence have clear relative emphasis |
| 2. Typography | Luna visual | Comfortable prose measure and fluid display sizes |
| 3. Spacing | Luna visual | Consistent section rhythm and aligned project content |
| 4. Responsive layout | Luna visual | Narrow screens retain all content without horizontal overflow |
| 5. Contrast | Luna visual | Readable secondary text and controls in both themes |
| 6. Keyboard accessibility | Luna interactions | Controls and anchor destinations work with keyboard focus |
| 7. Navigation | Luna interactions | Active section and anchor behavior remain accurate |
| 8. Project disclosures | Luna interactions | Stable native disclosure behavior and clear semantics |
| 9. Motion preferences | Luna performance | Reduced motion avoids unnecessary animation/runtime work |
| 10. Rendering performance | Luna performance | Decorative rendering pauses when unnecessary |
| 11. Metadata | Luna performance | Accurate, consistent document and sharing metadata |
| 12. Resilience | Luna performance | Storage/rendering failures preserve usable content |

## Execution

1. Inspect existing implementation and run baseline checks.
2. Run three Luna implementation agents concurrently with separate file ownership.
3. Review combined changes, perform focused regression checks and browser inspection.
4. Run tests, typecheck, lint, and production build; record outcomes and limitations.

No publication or deployment is part of this pass.

## Completed results

All three implementation agents used `gpt-5.6-luna`; Luna also performed the
combined regression review and final verification. The coordinator handled this
plan, integration feedback, and browser checks.

- Visual: fixed narrow-screen overflow at its animation sources, restored mobile
  gutters, tuned tablet composition, improved reading rhythm and touch/focus
  states, and strengthened light-theme and inactive-diagram contrast.
- Interactions: added named landmarks and project regions, keyboard focus after
  section navigation, modified-click guards, stable disclosure semantics, and
  theme recovery when stored preferences are cleared.
- Performance and resilience: deferred Spline loading in hidden tabs, repaired
  renderer visibility lifecycle handling, and made project timers respond to
  live reduced-motion preferences and document visibility.
- Metadata/assets: added sharing metadata and connection hints, and restricted
  the study page’s font imports to Latin subsets.

## Verification

- Baseline: 22 tests passed; typecheck, lint, and production build passed.
- Final combined changes: 26 tests passed; typecheck, lint, production build,
  and `git diff --check` passed.
- Browser checks: document width equals viewport width at 320, 375, 768, and
  1440 CSS pixels. Mobile gutters measure 20px. Project disclosures open and
  switch exclusively, and section navigation transfers keyboard focus.
- Both themes visually inspected. Visual agent measured light accent contrast
  at 4.57:1 and muted text at 6.17:1 against the page surface.

These are focused regression and responsive checks, not a full accessibility
certification or a measured Lighthouse/GPU performance benchmark. The optional
Spline scene still depends on external runtime and scene hosting.
