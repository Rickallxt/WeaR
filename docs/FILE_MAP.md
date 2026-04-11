# File Map

## Root

- `README.md`
  - basic repo intro and local run instructions
- `package.json`
  - scripts and dependency definitions
- `dev.mjs`
  - local combined dev runner
- `server.mjs`
  - Node HTTP API entrypoint
- `vite.config.ts`
  - Vite config and API proxy behavior
- `tsconfig.app.json`
  - app typecheck config
- `tsconfig.node.json`
  - node/server typecheck config
- `postcss.config.mjs`
  - Tailwind/PostCSS config
- `.env.example`
  - environment variable template
- `.gitignore`
  - repository ignore rules

## docs

- Handoff docs for Claude Code

## scripts

- `scripts/audit-lint.mjs`
  - custom repo lint/audit script

## server

- `server/wardrobeEngine.mjs`
  - extracted fallback and parsing helpers for chat, options, and image demo generation
- `server/wardrobeIdentify.mjs`
  - extracted fallback identification logic for uploaded wardrobe items

## src

### Entry

- `src/App.tsx`
  - current export wrapper around `AppEntry`
  - also still contains a legacy commented landing-page implementation
- `src/AppEntry.tsx`
  - current application entry
- `src/main.tsx`
  - React DOM bootstrapping
- `src/index.css`
  - design tokens and global styling system

### components

- `src/components/WearDesktopApp.tsx`
  - top-level app coordinator and shell state
- `src/components/Sidebar.tsx`
  - left-side nav and profile summary
- `src/components/SplashScreen.tsx`
  - premium loader/splash experience
- `src/components/OnboardingFlow.tsx`
  - multi-step onboarding flow
- `src/components/ItemReviewModal.tsx`
  - upload review/edit modal
- `src/components/DemoWardrobeRack.tsx`
  - example-item selector rack
- `src/components/Chrome.tsx`
  - shared UI primitives and visual building blocks

### components/screens

- `src/components/screens/DesktopScreens.tsx`
  - Home
  - Wardrobe
  - Outfit Studio
  - Style Profile
  - Saved Looks
  - Settings
- `src/components/screens/GenerateScreen.tsx`
  - generation workflow
  - event-aware assistant chat
  - option selection
  - image output

### data

- `src/data/wearData.ts`
  - app types
  - seeded demo data
  - nav metadata
  - outfit/saved look content
- `src/data/exampleWardrobe.ts`
  - curated demo/example wardrobe pieces

### lib

- `src/lib/cx.ts`
  - className helper
- `src/lib/fileData.ts`
  - file upload conversion helper
- `src/lib/generationApi.ts`
  - browser-side API client for AI and generation flows
- `src/lib/wardrobeDrafts.ts`
  - transform detection output into wardrobe item shape
- `src/lib/wardrobeVisuals.ts`
  - SVG-based fashion placeholder generation

## tests

- `tests/run-tests.mjs`
  - currently executed by `npm run test`
- `tests/wardrobe-engine.test.mjs`
  - additional Node test file not currently executed by the default script

## Most Important Files For Claude Code

1. `src/components/WearDesktopApp.tsx`
2. `src/components/screens/GenerateScreen.tsx`
3. `src/components/screens/DesktopScreens.tsx`
4. `src/components/OnboardingFlow.tsx`
5. `src/data/wearData.ts`
6. `src/index.css`
7. `server.mjs`
8. `server/wardrobeEngine.mjs`
9. `server/wardrobeIdentify.mjs`

## File Map Notes

- The repo is intentionally compact.
- Large screens are still fairly monolithic.
- Mock/demo data is deeply integrated into the current UX.
- There is enough structure to refactor incrementally without a rewrite.
