# Claude Code Change Note - 2026-04-11

## Request handled

- The app was not working end to end.
- Replace the OpenAI-backed server flow with locally available models on this laptop.
- Leave a clear file in the repo that records exactly what changed for later Claude Code handoff.

## Local model stack confirmed on this laptop

- Ollama is running on `http://127.0.0.1:11434`
- Available models detected:
  - `gemma3:latest`
  - `qwen2.5-coder:7b`
  - `embeddinggemma:latest`

## Exact changes made

### 1. Swapped the backend from OpenAI to Ollama local models

File: `server.mjs`

- Removed the OpenAI Responses API transport.
- Added local Ollama configuration via:
  - `OLLAMA_BASE_URL`
  - `OLLAMA_CHAT_MODEL`
  - `OLLAMA_LOGIC_MODEL`
  - `OLLAMA_VISION_MODEL`
  - `LOCAL_IMAGE_RENDERER`
  - `LOCAL_AI_TIMEOUT_MS`
- Added Ollama `/api/tags` health/model checks for the status endpoint.
- Added Ollama `/api/generate` calls for:
  - event chat via `gemma3:latest`
  - outfit option generation via `qwen2.5-coder:7b`
  - upload item identification via `gemma3:latest`
- Kept deterministic fallback behavior if local AI fails.
- Added `/api/ai/status` as the new primary status route.
- Kept `/api/openai/status` as a compatibility alias so older callers do not break immediately.

### 2. Fixed a real runtime bug in request validation

File: `server/schemas.mjs`

- Replaced `z.record(z.unknown())` usages with `z.record(z.string(), z.unknown())`.
- This fixed the runtime `Cannot read properties of undefined (reading '_zod')` error that was causing `500` responses on:
  - `/api/wardrobe/chat`
  - `/api/wardrobe/options`
  - `/api/wardrobe/identify`
  - `/api/wardrobe/generate-image`

### 3. Kept image preview local and explicit

File: `server/wardrobeEngine.mjs`

- The outfit image route now returns the existing on-device collage render as a local preview.
- Updated the response copy from demo wording to local wording:
  - `Local collage preview using ...`
- Response mode now reports `local`.

### 4. Updated the browser contract and labels away from OpenAI wording

Files:

- `src/lib/apiContract.ts`
- `src/lib/generationApi.ts`
- `src/data/wearData.ts`
- `src/lib/wardrobeDrafts.ts`
- `src/components/ItemReviewModal.tsx`
- `src/components/WearDesktopApp.tsx`
- `src/components/screens/GenerateScreen.tsx`

Changes:

- Switched API mode unions from `openai` to `local` where appropriate.
- Updated the client status endpoint from `/api/openai/status` to `/api/ai/status`.
- Updated UI copy from OpenAI-specific language to local-AI language.
- Preserved `openai` in `WardrobeDetectionMode` only for backward compatibility with any older local saved state.

### 5. Updated local environment documentation

Files:

- `.env.example`
- `README.md`

Changes:

- Replaced OpenAI env examples with Ollama/local renderer examples.
- Updated setup docs to explain the expected local Ollama models.

### 6. Fixed local dev server launch reliability on Windows

File: `dev.mjs`

- Changed the web child process command from `npm` to `npm.cmd` on Windows.
- This makes the combined launcher more reliable on Windows shells.

### 7. Fixed dev reachability for the browser URL we were using

File: `vite.config.ts`

- Added `server.host = '127.0.0.1'`
- This makes the Vite dev server bind on IPv4 so `http://127.0.0.1:5173` works directly.

### 8. Updated tests for the local render behavior

File: `tests/wardrobe-engine.test.mjs`

- Updated the image preview expectations from demo wording to local wording.

## Validation run

### Automated validation

- `npm run test` -> passed
- `npm run build` -> passed
- `npm run typecheck` -> passed implicitly through build and also passed earlier directly

### Live smoke checks completed

- `GET http://127.0.0.1:8787/api/ai/status` -> returns connected local AI status
- `POST http://127.0.0.1:8787/api/wardrobe/chat` -> returns `mode: "local"`
- `POST http://127.0.0.1:8787/api/wardrobe/options` -> returns `mode: "local"`
- `POST http://127.0.0.1:8787/api/wardrobe/identify` -> returns `mode: "local"`
- `POST http://127.0.0.1:8787/api/wardrobe/generate-image` -> returns `mode: "local"`
- `GET http://127.0.0.1:5173` -> returns HTTP `200`
- `GET http://127.0.0.1:5173/api/ai/status` -> proxy works correctly

## Current running app state

At the end of this session the app was running locally at:

- Frontend: `http://127.0.0.1:5173`
- API: `http://127.0.0.1:8787`

Observed listeners during verification:

- Vite listener PID: `49584`
- API listener PID: `52548`

These PIDs are runtime-only and may change after restart.

## Important note for future Claude Code work

- The app is now local-AI-first, not OpenAI-first.
- The chat, option, and identification flows use Ollama.
- The image step is still a local collage render, not a true local generative image model.
- `embeddinggemma:latest` is installed locally but is not wired into app memory/search yet.
- There are other modified files already present in the repo that were not part of this change scope; do not overwrite unrelated user work while extending this flow.
