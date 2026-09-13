# Anti-slop patterns for a software-engineer portfolio

Research date: 2026-09-12. The principles below are deliberately practical rather than a claim that there is one correct portfolio aesthetic. “Anti-slop” is treated here as reducing generic claims, decorative friction, and unsupported certainty while making a visitor’s next decision easy.

## Grounded principles

1. **Lead with proof-shaped project stories, not a cloud of adjectives.**

   This is a portfolio/content recommendation, not a measured universal law. A project entry should answer: what was the problem, what did I own, what changed, and what evidence supports that change? GitHub’s own profile guidance describes a profile as a place to showcase work, contributions, and selected pinned items, and specifically suggests giving projects a concise overview and context. That supports selecting a small number of representative projects and adding ownership/context; it does not prove that a particular number of projects converts better. [GitHub profile documentation](https://docs.github.com/en/account-and-profile/concepts/personal-profile) · [GitHub profile/resume guidance](https://docs.github.com/en/account-and-profile/tutorials/using-your-github-profile-to-enhance-your-resume)

2. **Make claims auditable: attach scope, attribution, and measurement boundaries.**

   This is an evidence-handling principle. Percentages, latency, scale, and awards should say what was measured, where, when, and whether the result is personal work, team work, offline evaluation, or production impact. Avoid “AI-powered,” “scalable,” or “high-performance” as standalone proof. The portfolio’s existing research notes already flag unsupported measurement context; preserve that caution. The primary-source basis is the user-centred design guidance from GOV.UK, which says needs and decisions should be based on evidence rather than assumptions and should be continually validated. [GOV.UK: learning user needs](https://www.gov.uk/service-manual/user-research/start-by-learning-user-needs)

3. **Write in a recognizable, plain voice and front-load the useful words.**

   ONS guidance recommends plain language, task-focused headings, verb-led calls to action, concise sections, and putting important information first; it also reports that expert users prefer clear language. Applying this to a portfolio means replacing “I build innovative solutions…” with a concrete role/problem sentence, then putting the distinctive technology or outcome early. The choice of voice, humor, and visual tone remains taste; clarity and scanability are the evidence-backed constraints. [ONS plain-language guidance](https://service-manual.ons.gov.uk/content/writing-for-users/plain-language) · [ONS user-needs guidance](https://service-manual.ons.gov.uk/content/writing-for-users/user-needs)

4. **Use semantic structure as part of the design, not as invisible cleanup.**

   W3C says headings should convey meaning and structure and links should have meaningful text; MDN explains that headings and landmarks act as navigation signposts for assistive technology and that semantic elements provide built-in browser accessibility. For a portfolio, use a real heading hierarchy, descriptive project links (“Read the Rekindle evaluation”), native buttons for interactions, useful image alternatives, and visible keyboard focus. This also makes the page easier to scan and gives the work structure beyond visual styling. [W3C writing for accessibility](https://www.w3.org/WAI/tips/writing/) · [MDN: HTML as a basis for accessibility](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML)

5. **Treat motion and visual novelty as optional evidence, not the content itself.**

   This is partly taste, but accessibility standards give a firm floor: WCAG 2.2 includes requirements around keyboard access, visible focus, reflow, animation, and focus not being obscured. Therefore an animated “systems” scene should have a static/semantic path to the same information, respect reduced-motion preferences, remain keyboard-usable, and never delay the core work narrative. A distinctive visual system can be good; it becomes slop when it replaces explanation or blocks comprehension. [WCAG 2.2](https://www.w3.org/TR/WCAG22/) · [W3C accessible names and descriptions](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/)

6. **Make the portfolio itself a credible software artifact: fast, stable, and measurable.**

   web.dev defines Core Web Vitals as field-measurable, user-centric outcomes covering loading, interactivity, and visual stability, with current “good” thresholds of LCP ≤2.5s, INP ≤200ms, and CLS ≤0.1 at the 75th percentile. These thresholds are not a portfolio-style rule, but they are a useful engineering acceptance test: don’t let a large visual bundle, layout-shifting imagery, or animation-first loading undermine the experience. Report actual field or lab evidence and label which one it is. [web.dev Web Vitals](https://web.dev/articles/vitals)

7. **Design for the visitor’s task, then add personality around it.**

   ONS and GOV.UK both frame content around user needs and warn against assuming the solution before understanding the need. For a portfolio, likely tasks include “decide whether this engineer can solve my problem,” “inspect one relevant project,” and “contact them.” A compact route from identity → strongest proof → deeper case study → contact is a reasoned information architecture; exact typography, color, and interaction style are taste. [GOV.UK: user research and service design](https://www.gov.uk/service-manual/user-research/how-user-research-improves-service-design) · [GOV.UK: writing for user interfaces](https://www.gov.uk/service-manual/design/writing-for-user-interfaces)

## How to apply this to this repo

- Keep the strongest three projects concrete and distinguish personal ownership from team or upstream work.
- Prefer short, specific labels and project links over generic “Explore”/“Learn more” controls.
- Preserve a no-JavaScript or reduced-motion reading path for essential experience and project content.
- Keep numerical claims only when their denominator, evaluation boundary, and attribution are known; otherwise state the limitation.
- Validate keyboard navigation, narrow reflow, semantic headings/links, and performance after visual changes. The existing `docs/research/portfolio-validation.md` records several of these checks and their current limits.

## Taste vs. evidence

Evidence supports clarity, meaningful structure, inclusive interaction, user-needs framing, and measured performance. It does **not** establish that brutalist/editorial styling, dark mode, a 3D scene, a specific number of projects, or a particular copywriting persona is universally superior. Those are design bets to test against the portfolio’s audience and the author’s real voice.
