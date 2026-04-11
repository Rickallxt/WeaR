# Next Steps

## Recommended Sequence

### Phase 1: Repo Cleanup and Stabilization

1. Remove legacy landing-page code from `src/App.tsx`.
2. Consolidate server helper ownership so `server.mjs` is only an entrypoint.
3. Decide on one testing approach and wire all tests into the default test script.
4. Add formal linting and formatting standards.

### Phase 2: Persistence Foundations

1. Persist onboarding/profile state.
2. Persist wardrobe items and associated metadata.
3. Persist uploaded image references.
4. Persist saved looks and collections.

### Phase 3: AI Reliability

1. Harden request/response validation for all AI endpoints.
2. Add structured telemetry and error states.
3. Add stronger fallback distinctions in the UI so demo vs live is explicit.
4. Improve output contracts for chat, option generation, and identification.

### Phase 4: UX Deepening

1. Make dashboard insights derive from real wardrobe/user state.
2. Expand saved looks into a real collection system.
3. Improve upload review with richer editing and confidence-aware guidance.
4. Add better recommendation refinement controls in Outfit Studio and Generate.

### Phase 5: Production Readiness

1. Introduce auth and user accounts.
2. Introduce real storage and upload handling.
3. Add end-to-end tests and visual regression checks.
4. Prepare deployment architecture for front-end and API separately.

## Immediate High-Leverage Actions

- Clean `App.tsx`
- Clean `server.mjs`
- Unify tests
- Add persistence plan
- Document live-vs-demo behavior more explicitly in the UI

## What Should Not Happen Next

- Do not do a full rewrite.
- Do not over-engineer before persistence exists.
- Do not add shopping-first flows.
- Do not replace the visual system with a generic dashboard system.
- Do not expand AI prompts heavily before hardening the data and contract layer.
