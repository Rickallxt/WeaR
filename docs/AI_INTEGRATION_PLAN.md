# AI Integration Plan

## Current AI Scope

The repository currently uses AI for four product moments:

1. Event-aware assistant chat
2. Wardrobe-based outfit option generation
3. Uploaded item auto-identification
4. Final outfit image generation

## Current Integration Flow

### Browser Layer

`src/lib/generationApi.ts` calls local endpoints:

- `/api/openai/status`
- `/api/wardrobe/chat`
- `/api/wardrobe/options`
- `/api/wardrobe/identify`
- `/api/wardrobe/generate-image`

### Server Layer

`server.mjs` routes requests and calls OpenAI Responses API when credentials are available.

### Fallback Layer

When no key exists:

- `buildFallbackChat`
- `buildFallbackOptions`
- `buildFallbackImage`
- `buildFallbackIdentification`

keep the UX functional in demo mode.

## Current Mock / Demo Logic

These areas are currently mocked or partially mocked:

- event chat fallback reply generation
- outfit option fallback generation
- demo outfit image collage generation
- upload identification heuristics
- seeded wardrobe visuals and example wardrobe visuals

These mocks are useful and should be preserved as explicit fallback behavior, not mistaken for production behavior.

## Integration Strengths

- The app is usable without live AI credentials.
- The UI already has strong AI affordances and clear interaction points.
- The current product flow is structurally aligned with real AI usage.

## Integration Weaknesses

- Response parsing depends on strict JSON extraction from model output.
- No schema validation layer protects the API boundary.
- Error differentiation is still shallow.
- Demo and live states are not distinct enough at the product-trust level.
- The server entrypoint owns too much integration detail directly.

## Proposed AI Integration Direction

### Phase 1: Stabilize Existing Flows

- validate request bodies
- validate response bodies
- centralize AI prompt builders
- centralize result normalizers
- centralize fallback behavior definitions

### Phase 2: Improve Live Reliability

- make mode reporting explicit everywhere
- add telemetry for request success/failure
- add timeout handling and graceful degraded states
- add better parse failure recovery

### Phase 3: Deepen Product Intelligence

- improve context memory for event chat
- improve wardrobe-based ranking logic
- better explain why an outfit works
- improve upload-identification confidence messaging

### Phase 4: Support Production Data

- move from data URLs and in-memory assumptions toward real asset storage
- store AI results with provenance
- persist recommendation sessions
- persist upload review decisions

## Guidance For Claude Code

- Do not remove demo mode.
- Do not treat mocks as technical debt to delete immediately.
- Convert them into explicit degraded-mode behavior.
- Keep the wardrobe-first rule central in every prompt and output.
- Prefer stabilizing the contract layer over prompt experimentation first.

## Recommended Endpoint Ownership

- `server.mjs`
  - HTTP routing only
- `server/ai/chat.mjs`
  - event chat prompt + parsing
- `server/ai/options.mjs`
  - wardrobe option prompt + parsing
- `server/ai/identify.mjs`
  - item identification prompt + parsing
- `server/ai/image.mjs`
  - image generation prompt + parsing
- `server/fallbacks/*.mjs`
  - explicit fallback logic

This is a recommendation only. It should not be applied automatically without approval.
