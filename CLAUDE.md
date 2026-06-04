# Animation Vocabulary — working notes

An interactive glossary of ~91 animation terms (`src/data/terms.ts`), grouped into
categories. Each term renders a card with a live demo (the `anim-playground` web
component in `src/scripts/playground.ts`). Astro + Motion + Tailwind, deployed to
Cloudflare. 8 locales.

## The "use case" initiative (in progress)

Every term should show **where you'd actually use the animation in a real UI**, not just
abstract shapes. Each card has **two tabs**:

- **Use case** (default) — a realistic UI component demonstrating the concept in context
  (image carousel, search bar, FAQ row, to-do list, tab bar, compose sheet…).
- **Abstract** — the original teaching demo (raw boxes/dots), preserved.

A term opts in by setting `useCaseDemo` in `terms.ts`. Terms without it render a single
demo, no tabs (incremental fallback). Both tabs share the same `controls` and both
receive the same `play(params)`.

**Status:** the **Transitions** category is the finished pilot. Roll the same pattern out
to the other visual categories (Entrances, Sequencing, Transforms, Scroll, Feedback,
Spring, Looping, Polish) next. Conceptual categories (Easing, Performance, Principles)
are decided separately.

## The bar for realism & interaction (important — this is what the user cares about)

When building demos, match this standard. The user reviews closely and wants polish.

1. **Drive demos by direct interaction, not config toggles.** If a concept is triggered by
   an action (open/close, expand/collapse, next/prev, check/uncheck), the user **clicks
   the actual component** — click the FAB to open, the Send/✕ button to close, the FAQ
   header to expand, a thumbnail to zoom, a to-do row to complete. Do **not** ship a
   `toggle("open")`-style control for these; remove it. Controls are reserved for genuine
   parameters (duration, easing, counts).
2. **Every clickable element gets `cursor: pointer`.**
3. **No redundant controls.** Because both tabs share controls, a toggle that duplicates a
   click interaction leaves a dead control on the other tab — delete it.
4. **Interaction-driven demos record no animation in `play()`.** Keep internal state
   (`let open`, `let duration`) in the factory closure; attach listeners there; `play(p)`
   only updates params like `duration`. This keeps the hover-loop inert for these cards
   (the loop only replays demos whose `play()` records animations).
5. **Motion details the user has called out:**
   - Affordances (e.g. a close button) should appear **after** the entrance animation
     settles, via the animation's `.then()` — never pop in mid-flight.
   - Use **geometric icons** (rotated bordered box for a chevron, SVG) over font glyphs
     when centering/rotation matters — glyphs sit off-center on the baseline.
   - Size icons to their container — a too-small `+` in a FAB or a tiny search glyph reads
     as a bug.
   - FLIP reorders must capture the **outgoing** node in a local const before reassigning
     the tracked variable; a `.then(() => panel.remove())` that closes over a mutated
     `panel`/`slide` will remove the wrong (incoming) element. This was a real bug.

## Component kit

Realistic demos are built from shared builders in `src/scripts/demos/kit.ts`
(`imageTile`, `listRow`, `searchField`, `fab`, `segmented`, `frame`, `textLine`,
`gradientFor`, `elem`). Styling lives in the `.uikit-*` classes in `src/styles/global.css`.
Prefer extending the kit over hand-rolling inline DOM, so demos share one visual language.

**Reference implementation:** the 7 `…UseCase` factories in
`src/scripts/demos/transitions.ts` are the finished, signed-off examples. Copy their
structure (closure state + click listeners + `play` only setting `duration`) when building
new categories.

**Naming:** when a demo shows the site owner's name, spell it **"Sam KaLok"** (capital L).

## Demo authoring mechanics

- A demo factory: `(stage) => { clearStage(stage); …; return { play(p), code(p)?, cleanup()?, continuous? } }`.
- Register new factories in the category module's `demos` map (e.g. `transitions.ts`);
  same-namespace additions need **no** change to `index.ts`.
- All visible demo text goes through `dt("English source")`; add translations to
  `src/i18n/demo-strings.ts` (English passes through; other locales fall back to English
  until translated).
- The sidebar hint (`navHint` in `src/i18n/ui.ts`) tells users they can hover to loop **or
  click to interact** — keep it accurate as more demos become interactive.

## Verify before reporting done

1. `npx astro check` (0 errors) and `pnpm build` (8 pages).
2. Dev server runs on `localhost:4321`; demos are dynamically imported, so a hard refresh
   (or a server restart) is needed after edits — stale modules persist otherwise.
3. The browser extension is often disconnected, so visual verification may not be
   possible — say so honestly rather than claiming a UI works.
