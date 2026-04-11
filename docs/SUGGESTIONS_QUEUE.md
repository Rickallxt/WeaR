# Suggestions Queue

Every suggestion below is intentionally documented only. None of these changes should be auto-applied without approval.

## SUG-001

- ID: `SUG-001`
- Title: Remove legacy landing-page code from `src/App.tsx`
- Description: Delete the large commented landing-page implementation and keep `App.tsx` as a clean app entry wrapper.
- Reason: The current file misrepresents the repo's purpose and adds noise during onboarding.
- Impact: High
- Proposed Change: Replace `src/App.tsx` with a minimal export-only entry or move legacy code out of the repo.
- Status: `PENDING_APPROVAL`

## SUG-002

- ID: `SUG-002`
- Title: Consolidate `server.mjs` into a clean entrypoint
- Description: Remove duplicated local helper implementations and rely only on extracted helper modules.
- Reason: The server currently mixes entrypoint concerns with overlapping utility logic.
- Impact: High
- Proposed Change: Keep request routing in `server.mjs` and move all helper logic into `server/` modules.
- Status: `PENDING_APPROVAL`

## SUG-003

- ID: `SUG-003`
- Title: Add persistence for profile and wardrobe state
- Description: Save onboarding, wardrobe items, uploads, and saved looks beyond a single in-memory session.
- Reason: The product feels real, but current state disappears on reload.
- Impact: Very High
- Proposed Change: Introduce a persistence layer and clear client/server ownership for user state.
- Status: `PENDING_APPROVAL`

## SUG-004

- ID: `SUG-004`
- Title: Clarify live vs demo AI states in the UI
- Description: Make it impossible to confuse demo behavior with live OpenAI-backed behavior.
- Reason: The current product can feel more live than it really is when credentials are missing.
- Impact: High
- Proposed Change: Add explicit mode messaging, badges, and result-source indicators across generation and upload flows.
- Status: `PENDING_APPROVAL`

## SUG-005

- ID: `SUG-005`
- Title: Unify the test strategy
- Description: Bring all existing tests under one consistent runner and expand coverage for critical flows.
- Reason: Current test coverage exists, but it is fragmented and misses UI/state transitions.
- Impact: High
- Proposed Change: Standardize on one test runner and include both server helper tests and key front-end logic tests.
- Status: `PENDING_APPROVAL`

## SUG-006

- ID: `SUG-006`
- Title: Add schema validation for API contracts
- Description: Validate incoming and outgoing AI payload shapes formally.
- Reason: Current request handling relies on assumptions and loose parsing.
- Impact: High
- Proposed Change: Introduce schema validation for all API endpoints and normalize responses before returning them.
- Status: `PENDING_APPROVAL`

## SUG-007

- ID: `SUG-007`
- Title: Split large screen files into smaller feature modules
- Description: Break `DesktopScreens.tsx` and `GenerateScreen.tsx` into smaller screen-specific and card-specific modules.
- Reason: Large monolithic screens are harder to maintain, test, and evolve.
- Impact: Medium
- Proposed Change: Extract per-screen sections and reusable subcomponents while keeping behavior intact.
- Status: `PENDING_APPROVAL`

## SUG-008

- ID: `SUG-008`
- Title: Make dashboard insights data-driven
- Description: Replace remaining static narrative insight content with wardrobe-derived calculations or AI summaries.
- Reason: Static insight copy weakens trust once users expect live intelligence.
- Impact: High
- Proposed Change: Compute insight cards from real wardrobe/profile data and add fallback behavior for sparse wardrobes.
- Status: `PENDING_APPROVAL`

## SUG-009

- ID: `SUG-009`
- Title: Strengthen upload review UX
- Description: Improve the review modal with richer controls and clearer confidence-based guidance.
- Reason: The current review flow works, but it still feels prototype-shallow for such a critical moment.
- Impact: Medium
- Proposed Change: Add better field grouping, image refinement affordances, and confidence-specific guidance copy.
- Status: `PENDING_APPROVAL`

## SUG-010

- ID: `SUG-010`
- Title: Distinguish demo/example wardrobe items more clearly
- Description: Prevent future confusion between demo items and user-owned persisted items.
- Reason: Blended demo and real inventory is helpful now, but risky later.
- Impact: Medium
- Proposed Change: Add stronger visual distinctions, filters, or ownership metadata treatment for example items.
- Status: `PENDING_APPROVAL`

## SUG-011

- ID: `SUG-011`
- Title: Expand saved looks into a real collection workflow
- Description: Turn the current visual collection surfaces into editable, user-owned collections.
- Reason: Saved looks are currently attractive but not fully interactive.
- Impact: Medium
- Proposed Change: Add create/edit/delete/pin flows with persistence and collection metadata.
- Status: `PENDING_APPROVAL`

## SUG-012

- ID: `SUG-012`
- Title: Add proper repo-level linting and formatting
- Description: Introduce a standard lint/format setup in addition to the custom audit script.
- Reason: Handoff quality improves when style and hygiene rules are conventional and automated.
- Impact: Medium
- Proposed Change: Add ESLint and formatting standards while keeping the current audit-lint checks where useful.
- Status: `PENDING_APPROVAL`

## SUG-013

- ID: `SUG-013`
- Title: Formalize the client/server shared contract
- Description: Define shared request/response models instead of relying on duplicated assumptions.
- Reason: This will become increasingly fragile as the product evolves.
- Impact: Medium
- Proposed Change: Move shared API types into a common contract layer used by both front-end and server code.
- Status: `PENDING_APPROVAL`

## SUG-014

- ID: `SUG-014`
- Title: Introduce end-to-end tests for generation and upload flows
- Description: Add journey-level tests for onboarding, wardrobe upload, option generation, and image output states.
- Reason: Premium interaction-heavy apps need more than helper-level tests.
- Impact: High
- Proposed Change: Add browser-based journey tests covering the highest-risk flows.
- Status: `PENDING_APPROVAL`

## SUG-015

- ID: `SUG-015`
- Title: Improve event chat memory and recommendation continuity
- Description: Persist or summarize event context so users can refine recommendations over time.
- Reason: Current event context is useful but short-lived and session-bound.
- Impact: Medium
- Proposed Change: Add conversation memory and recommendation session state tied to the user's styling task.
- Status: `PENDING_APPROVAL`
