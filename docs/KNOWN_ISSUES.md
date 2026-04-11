# Known Issues

## Highest Priority Issues

### KI-001: No persistence for user data

- Profile, wardrobe, saved looks, and uploads are all in local in-memory React state.
- Reloading the app loses progress.
- This is the biggest gap between prototype quality and real product readiness.

### KI-002: AI flows partially rely on mock/demo behavior

- The app behaves well without `OPENAI_API_KEY`, but that means critical product flows are not fully live.
- Upload identification, optioning, and image generation may be demo-backed rather than true model-backed depending on environment.

### KI-003: `server.mjs` contains duplicated legacy helper functions

- The file imports extracted helpers from `server/wardrobeEngine.mjs` but still defines overlapping local helper functions.
- This increases confusion and raises maintenance risk.
- There is also visible mojibake inside the unused local fallback chat strings.

### KI-004: `src/App.tsx` still contains an old commented-out landing page

- The active app correctly exports `AppEntry`, but the file also carries a large legacy block.
- This is a repo hygiene issue and a likely source of confusion for handoff engineers.

### KI-005: Test coverage is uneven

- The main test script runs `tests/run-tests.mjs`.
- `tests/wardrobe-engine.test.mjs` exists but is not included in the default test command.
- UI flows are mostly untested.

## Product / UX Issues

### KI-006: Dashboard and several screens still use seeded narrative content

- The app looks polished, but some insight copy is still static rather than computed from user wardrobe data.
- This can make the product feel smarter than it is.

### KI-007: Assistant context is event-aware but not memory-aware across sessions

- The event chat is useful in-session.
- It does not persist, summarize long-running context, or track prior recommendations over time.

### KI-008: Upload review UX is premium but still shallow

- It supports review and correction.
- It does not yet support richer editing like cropping, multiple photos, or confidence-specific review prompts.

### KI-009: Example/demo items are tightly blended with real wardrobe items

- This is good for demo usability.
- It creates future risk if the app does not clearly distinguish demo items from user-owned persisted items.

### KI-010: Saved looks are visual but not interactive enough

- Collections exist as display surfaces.
- They do not yet behave like a full organization system with create/edit/delete/pin flows.

## Technical / Code Quality Issues

### KI-011: No formal linting stack

- The repo uses a custom audit-lint script rather than ESLint/Prettier.
- This is acceptable for a prototype but weak for larger team handoff.

### KI-012: API validation is permissive

- Request payloads are not validated with a schema library.
- Incorrect client payloads could fail late or ambiguously.

### KI-013: Browser/server contract is not centrally typed

- Front-end and back-end share conceptual shapes but not a formal contract layer.
- This will become fragile during iteration.

### KI-014: No auth, no access control, no storage boundary

- The app is effectively single-session and local-prototype oriented.
- Productionization will require foundational architecture work.

### KI-015: No visual regression or end-to-end flow testing

- The current validation harness is helpful but not enough for a premium interaction-heavy UI.

## Visual / UI Issues

### KI-016: Some screens are large monoliths

- `DesktopScreens.tsx` and `GenerateScreen.tsx` do a lot.
- This slows future iteration on layout, testing, and per-screen ownership.

### KI-017: Desktop polish is stronger than mobile polish

- The app is desktop-first by design, which is correct.
- Some responsive behavior is acceptable but not deeply refined for narrower breakpoints.

### KI-018: UI system is partly tokenized and partly inline Tailwind-heavy

- Visual consistency is good.
- Maintainability for future designers/developers would improve with more structured component tokens and variants.
