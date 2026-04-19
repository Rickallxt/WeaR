# Codex Change Note - 2026-04-13

## Request handled

- Continue the WeaR redesign after the approved Stitch direction.
- Implement the approved mobile `Anticipatory Zero UI` direction in the actual app code.
- Add light mode as a first-class companion to the dark mode concept.
- Leave a clear handoff note so future Claude sessions know what changed and where to continue.

## Design direction implemented

This pass moved the mobile app toward:

- one dominant outfit decision on open
- faster refinement with taps and swipes instead of forms
- wardrobe decision support instead of inventory browsing
- a more coherent dark/light premium visual system
- mobile-native companion screens so the app no longer falls back to desktop language after the hero flow

## Exact changes made

### 1. Replaced the mobile home/generate/wardrobe path with zero-UI mobile surfaces

Files:

- `src/components/mobile/MobileWorkspace.tsx`
- `src/components/mobile/MobileZeroUI.tsx`

Changes:

- Mobile `dashboard` now opens into a hero outfit state instead of the older dashboard layout.
- Mobile `generate` now uses a quick-refine surface instead of the older chat-heavy / form-heavy generation screen.
- Mobile `wardrobe` now uses a decision-support view centered on:
  - suggested today
  - frequently used
  - not worn recently
  - reusable upload memory
- Shared mobile state now keeps the active hero suggestion, refinement, and attachment choices synchronized across the hero/refine flow.
- The mobile shell now hides the top header and bottom tab bar on the hero/refine surfaces so the app opens into the decision rather than into navigation chrome.

### 2. Added mobile-native secondary surfaces

File:

- `src/components/mobile/MobileCompanionScreens.tsx`

Changes:

- Added mobile-native `Saved`, `Profile`, and `Settings` surfaces.
- `Saved` now acts more like a rewear library with one leading collection and simpler reuse actions.
- `Profile` now acts more like a summary of style signals instead of a full desktop-style report.
- `Settings` now focuses on:
  - the approved theme pair
  - account summary
  - password reset
  - sign out
- These mobile surfaces are now routed from `MobileWorkspace.tsx` instead of dropping into the older desktop screens.

### 3. Refined the shared mobile shell

Files:

- `src/components/mobile/BottomTabBar.tsx`
- `src/components/mobile/MobileHeader.tsx`
- `src/components/Chrome.tsx`

Changes:

- Reworked the bottom tab bar into a floating glass dock with clearer active state.
- Softened and simplified the mobile header treatment.
- Retuned badges, glyph coloring, and shared chrome primitives so they work across the new dark/light pair.

### 4. Applied the approved theme pair in code

Files:

- `src/lib/theme.ts`
- `src/index.css`
- `src/components/screens/SettingsScreen.tsx`

Changes:

- Reduced the exposed theme set to the approved pair only:
  - `Obsidian` (`dark`)
  - `Alabaster` (`light`)
- Changed the default theme to `dark` so the app opens in the approved hero mode direction by default.
- Reworked root light and dark tokens to better match the approved Stitch concepts.
- Updated body/background treatment, surfaces, accents, panel gradients, and button states to support the new visual system.
- Kept light mode intentionally designed rather than mechanically inverted.

### 5. Improved mobile entry flow cohesion

Files:

- `src/components/AuthScreen.tsx`
- `src/components/OnboardingFlow.tsx`

Changes:

- Added a mobile-first auth variant with:
  - shorter copy
  - single-column layout
  - simpler mode switching
  - faster transition into the app
- Compressed onboarding behavior on mobile:
  - reduced the sense of a large desktop wizard
  - shortened one stale validation message
  - simplified the left-side step summary into a more compact mobile status block
  - made the bottom action area feel more mobile-native

### 6. Refreshed Graphify after the structural changes

Files:

- `graphify-out/`

Changes:

- Rebuilt Graphify after the mobile architecture and new files landed.
- Latest snapshot summary after this pass:
  - `221` nodes
  - `364` edges
  - `23` communities
  - `52` code files
  - `33` wiki articles

## Validation run

### Passed

- `npm run build`
- `npm run lint`
- `npm run test`
- `python scripts/rebuild_graphify.py`

### Build note

- Vite reports a non-blocking chunk-size warning on the main JS bundle after minification.
- This does not block the build, but code-splitting is now a reasonable next optimization target.

## Current state after this pass

- Mobile now has a real zero-UI home/refine flow.
- Light mode exists and is intentional.
- The mobile app no longer falls back to desktop `Saved`, `Profile`, and `Settings` screens.
- Graphify reflects the new structure and should be read before future architecture work.

## Important note for future Claude work

Read these first:

1. `graphify-out/GRAPH_REPORT.md`
2. `graphify-out/wiki/index.md`
3. `docs/CODEX_CHANGE_NOTE_2026-04-13.md`

Then use raw file reads only for the areas being edited.

## Highest-value next steps

1. Tighten desktop cohesion so desktop reflects the same `decision-first` product language now present on mobile.
2. Address JS bundle size by code-splitting the heaviest screens and/or generation flows.
3. Add a real lock-screen / glanceable outfit surface if the mobile product continues in this direction.
4. Continue migrating older desktop-first surfaces toward the same visual/token system so the app feels like one product, not two eras.

## Guardrails to preserve

- Keep WeaR wardrobe-first.
- Do not turn the product into shopping UI or e-commerce browsing.
- Keep one dominant action per mobile surface.
- Avoid slipping back into dashboard-heavy, equal-weight layouts on mobile.
- Preserve the approved dark/light pairing rather than reopening theme sprawl.
