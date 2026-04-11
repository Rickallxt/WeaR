# Architecture Status

## High-Level Architecture

The repository is a two-part local application:

1. Front-end desktop prototype
2. Lightweight local backend API

### Front-End

- Framework: React 19
- Build tool: Vite
- Styling: Tailwind CSS v4 + custom CSS tokens in `src/index.css`
- Motion: Framer Motion
- State model: local React state, no external state manager

### Back-End

- Runtime: Node.js
- Server style: minimal `node:http` server in `server.mjs`
- AI transport: OpenAI Responses API over `fetch`
- Current mode support:
  - live mode when `OPENAI_API_KEY` is available
  - demo/mock mode when it is not

## Current Front-End Structure

### App Entry

- `src/AppEntry.tsx` is the active application entry
- `src/App.tsx` re-exports `AppEntry`

### Core Application Shell

- `src/components/WearDesktopApp.tsx`
  - owns top-level shell state
  - controls onboarding completion
  - manages active screen switching
  - fetches AI backend status
  - manages upload review modal
  - manages in-memory wardrobe state

### Shared UI Primitives

- `src/components/Chrome.tsx`
  - panel primitives
  - badges
  - art blocks
  - wardrobe mosaic
  - metric cards
- `src/index.css`
  - design tokens
  - button classes
  - ambient background
  - motion/accessibility baseline

### Main Feature Screens

- `src/components/screens/DesktopScreens.tsx`
  - Home
  - Wardrobe
  - Outfit Studio
  - Style Profile
  - Saved Looks
  - Settings
- `src/components/screens/GenerateScreen.tsx`
  - generation-specific workflow
  - event chat
  - option selection
  - final image preview

### Onboarding and Supporting Components

- `src/components/OnboardingFlow.tsx`
- `src/components/SplashScreen.tsx`
- `src/components/Sidebar.tsx`
- `src/components/ItemReviewModal.tsx`
- `src/components/DemoWardrobeRack.tsx`

## Current Data Model Status

### Static / Mocked Data

- `src/data/wearData.ts`
  - core types
  - base profile
  - seeded wardrobe items
  - nav config
  - outfit examples
  - saved collections
- `src/data/exampleWardrobe.ts`
  - curated example/demo pieces

### Utility Layers

- `src/lib/generationApi.ts`
  - browser API client
- `src/lib/wardrobeDrafts.ts`
  - build wardrobe items from detection results
- `src/lib/wardrobeVisuals.ts`
  - fashion placeholder/mock imagery
- `src/lib/fileData.ts`
  - upload file to data URL helper

## Current AI Integration Status

### Browser -> API

The browser calls:

- `GET /api/openai/status`
- `POST /api/wardrobe/chat`
- `POST /api/wardrobe/options`
- `POST /api/wardrobe/identify`
- `POST /api/wardrobe/generate-image`

### API -> OpenAI

The server uses OpenAI Responses API for:

- event-context chat
- option generation
- upload identification
- image generation

### Demo / Mock Mode

When no key exists:

- chat uses fallback text generation
- outfit options are synthesized locally
- image generation returns an SVG collage/demo render
- upload identification uses heuristic inference

## Validation Status

Current scripts:

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`

Current reality:

- `typecheck` passes
- custom audit lint passes
- `tests/run-tests.mjs` passes
- production build passes

## Architecture Strengths

- Simple enough to understand quickly
- Good prototype-to-product direction
- Strong separation between view layer and helper utilities
- Usable demo mode without secrets
- Strong product coherence around wardrobe-first logic

## Architecture Weaknesses

- No persistence boundary yet
- No service layer beyond ad hoc fetch wrappers
- No typed shared contract between client and server beyond parallel TS/JS assumptions
- `server.mjs` still contains duplicated legacy helper logic instead of relying only on extracted helpers
- `src/App.tsx` still contains a large commented-out landing-page implementation, which creates confusion about the real app entry
- Tests are fragmented: `tests/wardrobe-engine.test.mjs` exists, but the main test script only runs `tests/run-tests.mjs`

## Fragile Areas

- In-memory wardrobe state in `WearDesktopApp`
- Upload review state coupling
- Parsing strict JSON from model text output
- Server-side helper duplication in `server.mjs`
- Mismatch risk between mock data assumptions and future persistence/API contracts
- High visual coupling inside large screen components

## Handoff Recommendation

Claude Code should treat this repository as:

- visually strong
- structurally promising
- still pre-production

The next work should emphasize stabilization, data ownership, cleanup, and persistence before heavy feature expansion.
