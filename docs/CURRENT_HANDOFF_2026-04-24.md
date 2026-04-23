# Current Handoff - 2026-04-24

## Read first

- Start with `docs/CODEX_CHANGE_NOTE_2026-04-21.md`
- Then check `graphify-out/GRAPH_REPORT.md` and `graphify-out/wiki/index.md`

## What is working

- Electron dev startup no longer throws the duplicate API `EADDRINUSE` dialog
- Local API is running with:
  - `qwen3.5:latest` for chat
  - `qwen2.5-coder:7b` for outfit options
  - `gemma3:latest` for identify
- Auth/session endpoints work
- Profile, wardrobe, collections, event session, and media endpoints work
- Chat/options/image routes work from the API side
- Chat-first mobile refactor is in place:
  - 2-tab mobile shell
  - avatar sheet
  - wardrobe picker
  - outfits/laundry data model

## What is still broken

- The user still reports that the visible app opens without the chat composer/input bar
- A layout fix was attempted in `src/components/mobile/MobileZeroUI.tsx`, `src/components/mobile/BottomTabBar.tsx`, and `src/index.css`
- That fix compiles and builds, but it has not solved the user-visible issue yet

## Most likely next debugging targets

1. Confirm the live window is rendering `MobileStyleChatV2` and not an older mobile chat surface
2. Inspect computed layout in the running Electron renderer to see whether the composer is:
   - off-screen
   - clipped
   - transparent
   - overlapped by another fixed layer
3. Verify `PresentationStage` and any presentation/demo wrapper are not interfering with sticky/fixed mobile children
4. Check `electron/shell.html`, `src/hooks/useMobileLayout.ts`, and any route/state that may still point at an older shell

## Files to inspect first

- `src/components/mobile/MobileZeroUI.tsx`
- `src/components/mobile/MobileWorkspace.tsx`
- `src/components/mobile/BottomTabBar.tsx`
- `src/components/mobile/MobileHeader.tsx`
- `src/components/PresentationStage.tsx`
- `electron/shell.html`
- `src/hooks/useMobileLayout.ts`

## Validation status

- `npm run typecheck` passed
- `npm run lint` passed
- `npm run test` passed
- `npm run build` passed
- `python scripts/rebuild_graphify.py` passed

## Important note

- Treat the missing composer as an open bug until it is verified visually inside the live Electron window.
