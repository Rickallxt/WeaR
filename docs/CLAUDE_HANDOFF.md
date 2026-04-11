# CLAUDE HANDOFF — Lead Intelligence / Outfit System

## ROLE

You are the implementation engineer.

You do NOT redesign the product.
You do NOT make assumptions.
You do NOT implement unapproved changes.

You ONLY:
- read documentation
- follow defined UX/UI direction
- execute approved suggestions
- maintain consistency and efficiency

---

## CURRENT PROJECT STATE

This project is an early-stage system with:

- working frontend structure (React + Tailwind + motion)
- backend logic (basic AI + routes)
- prototype UX flows
- partial AI integration

However, it is:

- not production ready
- UX is feature-driven, not flow-driven
- architecture needs structuring
- AI usage is not optimized yet
- lacks strong system boundaries

---

## CORE PRODUCT DIRECTION

This product is NOT a tool.

It is:

> A decision engine that removes friction from "what should I wear / what should I do"

### Principles

- assistant-first
- flow-driven
- outcome-focused
- minimal user thinking
- fast value delivery
- premium feel

---

## UX SYSTEM (LOCKED DIRECTION)

### GLOBAL RULES

- one primary action per screen
- always show the next step
- avoid dashboards
- avoid clutter
- no equal-weight UI elements
- reduce navigation depth

---

## MAIN FLOW

---

## HOME SCREEN

Purpose:
- entry point
- no confusion
- instant action

Layout:

- greeting
- main question: "What do you need today?"
- 3 actions:
  - Plan outfit
  - Quick outfit
  - Add item
- smart suggestions
- recent items/looks

---

## GENERATION FLOW

Steps:

1. intent (event/use case)
2. context (weather + mood)
3. generate result

Output MUST include:

- outfit
- explanation (WHY it works)

User actions:

- save
- regenerate
- swap item

---

## WARDROBE

NOT a grid.

Must become:

- recommended items
- underused items
- most used items
- actionable suggestions

---

## UPLOAD FLOW

Steps:

1. upload
2. AI detection
3. user confirm
4. instant value

System MUST show:

- how item can be used
- at least one generated outfit

---

## AI BEHAVIOR

AI must feel like:

> a stylist, not a tool

It should:

- suggest proactively
- react to user behavior
- guide decisions

---

## UI SYSTEM

### Colors
- neutral base
- one accent color only

### Typography
- strong hierarchy
- large primary headings

### Layout
- spacing > borders
- clean cards
- minimal text

### Motion
- purposeful only
- transitions between steps

---

## AI INTEGRATION STRATEGY

Use local models:

- gemma3 → reasoning, explanations
- qwen2.5-coder → structured logic
- embeddinggemma → memory/search

Rules:

- avoid unnecessary calls
- minimize token usage
- reuse context
- keep prompts short

---

## ARCHITECTURE PRINCIPLES

- modular structure
- no monolithic files
- separate:
  - UI
  - logic
  - AI layer
  - data layer

---

## SUGGESTION CONTROL SYSTEM

ALL improvements must go through verification.

---

## SUGGESTIONS QUEUE

Located in: /docs/SUGGESTIONS_QUEUE.md

---

## RULES

- DO NOT implement any suggestion automatically
- DO NOT modify UX direction without approval
- DO NOT refactor large areas without approval

---

## WHEN GIVEN A TASK

Always:

1. read relevant docs only
2. keep scope minimal
3. implement only requested feature
4. avoid side effects
5. maintain consistency

---

## WHAT NOT TO DO

- no full rewrites
- no architecture overhauls
- no adding features not requested
- no speculative improvements

---

## PRIORITY ORDER

1. UX flow correctness
2. UI clarity
3. functionality
4. performance
5. polish

---

## FINAL RULE

If something is unclear:

- ask
- or add a suggestion (PENDING_APPROVAL)

DO NOT guess.
