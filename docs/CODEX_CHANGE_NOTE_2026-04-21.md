# Codex Change Note - 2026-04-21

## Request handled

- Scanned the current Graphify snapshot and app surfaces before editing.
- Moved the mobile product flow closer to the target journey:
  - auth first
  - lightweight style setup
  - face reference capture
  - main chat as the primary interface
  - plus-button photo attachments
  - generated outfit previews
  - yes/no feedback with approved-look memory

## Current vs target audit

- Current app already had server-managed auth, onboarding, user-scoped profile/wardrobe/media state, upload review, local AI endpoints, and a zero-UI mobile styling surface.
- Target needed the post-login journey to become chat-led instead of screen-led, with wardrobe photos attached from the chat input and approved outfits stored as taste memory.
- The remaining biggest gap is real face-conditioned image generation. This pass stores face references in profile memory and prepares the UI path, but the local image renderer still produces wardrobe-collage previews.

## Code changes

- `src/data/wearData.ts`
  - Added `FacePhoto`, `FacePhotoAngle`, and `ApprovedLookMemory`.
  - Extended `UserProfile` with `facePhotos`, `approvedLooks`, and `tasteNotes`.
  - Added `withProfileDefaults()` so older saved profiles stay compatible.
- `src/components/OnboardingFlow.tsx`
  - Added a final face-reference step with front and side-angle capture.
  - Stores captured images in profile memory.
- `src/components/WearAppRuntime.tsx`
  - Normalizes loaded and saved profiles through `withProfileDefaults()`.
  - Added `handleUploadChatAsset()` for chat attachments that save to the media library without forcing the review modal.
- `src/components/mobile/MobileWorkspace.tsx`
  - Routes the mobile style surface to `MobileStyleChatV2`.
  - Passes profile, media assets, chat upload, event-session, and profile-save callbacks.
- `src/components/mobile/MobileZeroUI.tsx`
  - Added `MobileStyleChatV2` as the new primary mobile stylist chat.
  - Supports camera/gallery/previous-upload attachments from the plus button.
  - Uses existing chat/options/image endpoints to generate up to three looks.
  - Lets users approve or reject generated looks.
  - Saves approved looks and taste notes back into profile memory.
- `src/components/mobile/MobileChatScreen.tsx`
  - Fixed lint issues in the older unused chat surface.
- `tests/wardrobe-engine.test.mjs`
  - Updated stale expectations to the current local-collage fallback contract.

## Validation

- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run test` passed outside the sandbox. The first sandboxed run failed with Windows `spawn EPERM`, then passed when rerun with approved escalation.
- `npm run build` passed with the existing non-blocking Vite chunk-size warning.

## Follow-up recommendations

- Connect stored `profile.facePhotos` to a real face-conditioned image-generation path when the renderer supports it.
- Decide whether the old `MobileStyleChat` and `MobileChatScreen` should be removed after Claude verifies `MobileStyleChatV2`.
- Add a real generated-look persistence model later if approved outfits should outgrow profile memory.
- Code-split the mobile/chat/generation surfaces to reduce the main JS chunk.

## Free local image provider update

- Added `server/freeImageProviders.mjs` so `/api/wardrobe/generate-image` can optionally use free local engines before falling back to the wardrobe collage.
- Supported providers:
  - `IMAGE_PROVIDER=local-collage` keeps the built-in always-free preview.
  - `IMAGE_PROVIDER=localai` calls a local LocalAI `/v1/images/generations` server.
  - `IMAGE_PROVIDER=comfyui` uploads references to ComfyUI, queues an API workflow JSON, polls history, and returns the output image.
  - `IMAGE_PROVIDER=auto` tries ComfyUI, then LocalAI, then collage.
- Added `docs/LOCAL_IMAGE_GENERATION.md` with the local setup contract and workflow placeholder tokens.
- The adapter resolves user-scoped `mediaAssetId` images server-side before generation, so prior uploaded wardrobe photos can be reused by local image providers.
- Licensing warning remains: ComfyUI/LocalAI are free local tools, but some try-on workflows/models such as CatVTON or IDM-VTON may be free-only/non-commercial unless separately licensed.
- Updated `scripts/rebuild_graphify.py` to include `.mjs`/`.cjs` files in the code snapshot and mirror them as temporary `.js` files for AST extraction, so the Node server/provider layer is visible in Graphify.

## Local integration test update - 2026-04-22

- Ollama is reachable locally with `gemma3:latest`, `qwen2.5-coder:7b`, `qwen3.5:latest`, and `embeddinggemma:latest`.
- A real API integration test found a Windows local persistence issue: signup failed on `rename .wear-local/db.json.tmp -> .wear-local/db.json`.
- Patched `server/localDataAdapter.mjs` so `writeDb()` keeps the atomic rename path, then falls back to copy/unlink on Windows `EACCES`/`EPERM`.
- Retested auth + `/api/ai/status` + `/api/wardrobe/generate-image` successfully:
  - signup authenticated
  - AI status connected
  - image route returned a renderable local SVG collage
  - `IMAGE_PROVIDER=auto` correctly fell back when LocalAI/ComfyUI were not reachable
- Retested chat/options:
  - default `gemma3:latest + qwen2.5-coder:7b` returned `local` chat and `local` outfit options
  - `qwen3.5:latest` is reachable but currently falls back to demo for strict JSON chat/options, so keep it optional until the prompt/parser is tuned

## Chat-first mobile data handoff - 2026-04-23

- Added `SavedOutfit` plus wardrobe laundry metadata (`inLaundry`, `laundrySince`, `lastWornAt`) in `src/data/wearData.ts`.
- Added `chat` screen-key compatibility while preserving the legacy `generate` route as an alias so mobile can migrate without breaking the current desktop shell.
- Added localStorage helpers in `src/lib/persistence.ts` for:
  - `loadOutfits()` / `saveOutfits()`
  - best-effort `SavedCollection[] -> SavedOutfit[]` migration by wardrobe item-name lookup
  - `toggleLaundry()` and `pruneStaleLaundryItems()`
- Updated the server default `OLLAMA_CHAT_MODEL` to `qwen3.5:latest` and documented the `OLLAMA_*` overrides in `.env.example`.
- No UI files were touched in this slice; the mobile redesign workers should wire the new outfit/laundry helpers into chat and wardrobe without removing legacy `SavedCollection` support yet.

## Chat-first mobile redesign integration - 2026-04-23

- Collapsed the mobile app into two persistent surfaces: `Chat` and `Wardrobe`.
- `src/components/mobile/MobileWorkspace.tsx`
  - keeps `MobileStyleChatV2` mounted while users move into wardrobe, so composer draft text and attachments survive the round trip
  - routes wardrobe picks and saved outfits back into chat through explicit composer intents
  - mounts the new `AvatarSheet` and `WardrobePickerSheet`
- `src/components/mobile/MobileZeroUI.tsx`
  - removed automatic `/api/wardrobe/generate-image` use from the default chat path
  - added the new entry chips (`Meeting`, `Dinner`, `Date`)
  - rewrote the plus menu to exactly three actions: choose from wardrobe, upload photo, open camera
  - uses `requestWardrobeIdentification()` only for newly attached photos, then keeps outfit recommendations text-plus-thumbnails inside chat
  - turns approved looks into taste memory through the top-level runtime callback instead of handling cross-state persistence locally
  - rewrote wardrobe into `Items | Outfits | Laundry`, with laundry exclusion and outfit reuse actions
- `src/components/WearAppRuntime.tsx`
  - now owns `SavedOutfit[]` state, local migration bootstrap, outfit reuse persistence, and `lastWornAt` updates
  - adds a single approval path that updates profile memory, saved outfits, and wardrobe wear history together
  - keeps desktop compatibility by treating `chat` as the mobile alias while desktop still uses `generate`
- `src/components/mobile/BottomTabBar.tsx` now exposes only `Chat` and `Wardrobe`.
- `src/components/mobile/MobileHeader.tsx` now opens the avatar/account sheet from the right-side avatar button.
- Stitch companion design project created for the same flow:
  - project: `projects/14926010877830434619`
  - dark chat screen: `projects/14926010877830434619/screens/32df8c4789a748b9b65abf92ccd6b1d6`
  - wardrobe screen: `projects/14926010877830434619/screens/d46f9ab5a7f24638b2745ed8a9d1c9f9`
  - light chat screen: `projects/14926010877830434619/screens/32f84a459b61447c8b2f8a832c58c352`

## Live Ollama stabilization - 2026-04-23

- Ran a live local smoke test against the repo server with `qwen3.5:latest`, `qwen2.5-coder:7b`, and the updated chat-first flow.
- Found that `/api/wardrobe/options` already returned `mode: "local"`, but `/api/wardrobe/chat` was falling back to demo because Qwen 3.5 enabled Ollama thinking mode by default.
- The raw Ollama `/api/generate` response placed the structured JSON payload in the `thinking` field and left `response` empty, which meant the server parser treated the turn as invalid.
- Patched `server/appServer.mjs` to:
  - pass `think: false` on normal app generation requests
  - pass `keep_alive` using `OLLAMA_KEEP_ALIVE` so the local model stays warm between turns
- Patched `src/components/mobile/MobileWorkspace.tsx` so any legacy mobile screen key that is not `wardrobe` safely resolves back to `chat` instead of leaving the shell visually blank.

## Electron dev startup fix - 2026-04-23

- Fixed the startup dialog that showed `listen EADDRINUSE: address already in use :::8787` before the app opened.
- Root cause:
  - `dev-electron.mjs` already starts the API on `8787`
  - `electron/main.mjs` was trying to start the API again
  - `electron/main.mjs` used `process.execPath` without `ELECTRON_RUN_AS_NODE`, so the child process launched as another Electron app instead of a plain Node server
- Patched `electron/main.mjs` to:
  - skip internal API startup when `WEAR_EXTERNAL_API=1`
  - launch the bundled API child with `ELECTRON_RUN_AS_NODE=1` when the app owns the server
  - log child-process startup errors explicitly
- Patched `dev-electron.mjs` to pass `WEAR_EXTERNAL_API=1` into the Electron process so `npm run electron:dev` uses the external API exactly once.

## Chat composer visibility fix - 2026-04-24

- Fixed the chat-first mobile screen so the composer/input bar stays visible on first open instead of slipping below the viewport.
- Root cause:
  - `MobileStyleChatV2` used a `min-height: 100dvh` column plus header/tab padding, which let the scroll area consume too much height
  - the scroll region did not opt into `min-h-0`, so it could push the sticky composer off-screen
  - some `var(--safe-bottom)` expressions had no fallback, which could invalidate spacing rules when the variable was unset
- Patched:
  - `src/components/mobile/MobileZeroUI.tsx`
    - chat shell now uses a constrained `h-[100dvh]` layout with `boxSizing: border-box`
    - message list now uses `min-h-0`
    - composer wrapper now stays as a non-shrinking sticky footer
    - safe-bottom expressions now include `0px` fallbacks
  - `src/components/mobile/BottomTabBar.tsx`
    - safe-bottom expression now includes a fallback
  - `src/index.css`
    - shared safe-area helpers now include `0px` fallbacks for both top and bottom insets

## Current blocker for Claude - 2026-04-24

- The user still reports that the live app opens without a visible chat input/composer, even after the `MobileStyleChatV2` layout patch above.
- Current status:
  - the dev stack boots cleanly
  - auth + API + local Ollama flows are working
  - the UI code contains the composer markup in `src/components/mobile/MobileZeroUI.tsx`
  - the attempted viewport/layout fix compiles and ships, but did not resolve the user-visible issue in the running app
- Highest-probability next debugging targets:
  - confirm whether the app is actually rendering `MobileStyleChatV2` and not an older mobile chat surface or cached renderer path
  - inspect the real computed layout in the Electron window to see whether the composer is clipped, overlapped, transparent, or not mounted
  - verify whether `PresentationStage` sizing or a fixed-position container is interfering with the sticky composer inside the phone shell
  - inspect `electron/shell.html`, `src/hooks/useMobileLayout.ts`, and any presentation/demo path that might route the app into an older shell state
- Recommendation:
  - treat the chat-composer bug as still open
  - do not assume the `2026-04-24` layout patch solved it until Claude verifies it visually in the live window
