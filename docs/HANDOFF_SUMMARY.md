# WeaR Handoff Summary

## Update

Read `docs/CODEX_CHANGE_NOTE_2026-04-13.md` first for the latest implemented state.
This summary reflects an older baseline and should not be treated as the most current source of truth on mobile UX or theme direction.

## Repository Purpose

WeaR is a premium desktop-first fashion-tech prototype focused on wardrobe-first styling. The current repository delivers a high-fidelity front-end experience with a lightweight Node API layer for AI-assisted event chat, outfit optioning, item identification, and outfit image generation.

This is not a production system yet. It is a polished prototype with strong UX direction, solid visual identity, and a mixed live/demo AI flow.

## Current State

- React + Vite + Tailwind CSS + Framer Motion desktop app shell is working.
- Node HTTP API is working for local AI-backed and demo-backed flows.
- Wardrobe management, onboarding, generation flow, saved looks, profile, settings, and splash screen all exist.
- Upload review flow and item auto-identification flow are present.
- Example wardrobe items and premium mock fashion visuals are integrated.
- Build, typecheck, custom lint, and lightweight tests pass.

## What Is Strong

- Clear wardrobe-first product positioning throughout the app.
- Strong visual discipline: rounded surfaces, restrained accents, premium light theme.
- Good separation between UI shell, data mocks, helper utilities, and API calls.
- Meaningful fallback logic allows demo mode to remain usable without OpenAI credentials.
- The generation flow is already closer to a real product than a landing-page mock.

## What Is Not Production-Ready

- No persistence layer for profile, wardrobe, uploads, or saved looks.
- No authentication, user accounts, or secure multi-user data model.
- AI integration is partially mock/demo-driven when `OPENAI_API_KEY` is absent.
- Backend uses lightweight custom HTTP handling instead of a more maintainable API framework.
- Error handling, observability, and validation depth are still limited.

## Main Handoff Priorities

1. Preserve wardrobe-first logic above all else.
2. Avoid turning the product into a shopping-first or marketplace-first UX.
3. Keep the premium visual system intact while improving structural quality.
4. Convert mocked state into persistent user state before large new feature expansion.
5. Clean technical debt in the server and entry files before larger integration work.

## Recommended First Focus For Claude Code

1. Clean repo hygiene and reduce ambiguity.
2. Stabilize architecture boundaries.
3. Add persistence and proper data ownership.
4. Harden AI integration and state transitions.
5. Improve test coverage for UI-critical and API-critical behavior.

## Non-Negotiable Product Guardrails

- Recommendations must come from the user's own wardrobe.
- Shopping suggestions must remain secondary.
- The app should feel premium, minimal, youthful, and slightly Y2K.
- UX should stay assistant-first, flow-driven, and low-friction.
