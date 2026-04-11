# UX / UI Spec

## Product UX Principles

### 1. Assistant-First

- The product should feel like a stylistic assistant, not a settings-heavy admin tool.
- Guidance should be contextual, helpful, and wardrobe-aware.
- The assistant should reduce decision fatigue instead of creating more configuration burden.

### 2. Flow-Driven

- The app should move users through meaningful flows:
  - onboarding
  - wardrobe mapping
  - event-aware generation
  - look saving
- Each flow should feel linear enough to be easy, but flexible enough to revisit.

### 3. Minimal Friction

- Ask only for data that improves styling output.
- Prefer chips, segmented controls, cards, and visual selectors over dense forms.
- Keep the user feeling styled, not processed.

### 4. Wardrobe-First

- Every primary recommendation must clearly come from owned items.
- New purchases must remain secondary and outside the core path.
- Language should reinforce wardrobe reuse, fit intelligence, and outfit confidence.

### 5. Premium Clarity

- Layout should feel expensive, calm, and intentional.
- Motion should support hierarchy, not create noise.
- Empty states must still feel designed and aspirational.

## Main Screen Spec

## Home

### Purpose

- Give the user a high-confidence starting point
- Surface today's wardrobe-first recommendation
- Reinforce product value quickly

### Required Content

- greeting and profile-aware framing
- wardrobe metrics
- today's recommendation
- alternate combinations
- saved look preview
- fit/style insight cards

### UX Rules

- The primary hero content should always feel actionable.
- Metrics should derive from wardrobe state whenever possible.
- Copy should stay concise and fashion-aware.

## Generation Flow

### Purpose

- Help users generate an event-aware outfit from their own wardrobe

### Required Steps

1. Select owned items
2. Add event/context information
3. Review generated options
4. Generate final composed image

### UX Rules

- Item selection must come before generation.
- Event chat should enhance relevance, not hijack the flow.
- The system should always reinforce that generation is using owned pieces.
- Demo/example items should be clearly marked.

## Wardrobe

### Purpose

- Serve as the visual closet builder and inventory browser

### Required Content

- searchable/filterable wardrobe view
- item visuals
- metadata display
- upload actions
- example-item insertion

### UX Rules

- The wardrobe should feel like an editorial rack, not a spreadsheet.
- Item cards should prioritize scanability:
  - image
  - name
  - category/fit
  - key tags
  - source/detection state
- Search and filtering should stay lightweight and instant.

## Upload Flow

### Purpose

- Convert a raw clothing photo into a usable wardrobe item

### Required Stages

1. user uploads image
2. app shows processing state
3. app shows auto-detected result
4. user reviews/edits details
5. item is saved into wardrobe

### UX Rules

- Processing must feel premium and trustworthy.
- Review must be editable and forgiving.
- Error states should gracefully fall back to manual correction.
- The user should never feel locked out by imperfect detection.

## Assistant Behavior

### Tone

- premium
- concise
- context-aware
- fashion-first
- not overly technical

### Responsibilities

- ask about event, mood, weather, formality, and desired feeling
- sharpen the recommendation using context
- explain why a look works without sounding clinical
- avoid shopping-first suggestions unless explicitly secondary

### Guardrails

- never drift into generic chatbot language
- never frame itself like a commerce recommender
- never forget that the wardrobe is the primary source of truth

## Interaction Rules

- Buttons should be large enough for confident clicking and visually weighted by importance.
- Hover motion should stay subtle and premium.
- Loading states should reassure rather than distract.
- Empty states should remain aspirational and branded.
- Detection states should be visually differentiated:
  - curated
  - auto-detected
  - reviewed
  - error
- Demo/example content must be visible as demo/example content.

## UI System

## Colors

### Core Tokens

- Background: warm off-white / soft stone
- Text: deep charcoal
- Muted text: cool neutral gray
- Accent 1: periwinkle
- Accent 2: soft lime

### Usage Rules

- Keep color restrained.
- Use accents for active states, AI states, focus treatment, badges, and loader highlights.
- Do not flood large surfaces with saturated color.

## Typography

- Display font: `Syne`
- Body/system font: `Instrument Sans`

### Rules

- Display font for major headers and premium emphasis only
- Body font for readability and functional UI
- Avoid tiny type in cards and metadata

## Spacing

- Use roomy section spacing and large-radius cards
- Respect desktop-first proportions
- Avoid empty dead zones and avoid dense stacked micro-panels
- Keep rhythm consistent between screen headers, feature panels, and action areas

## Components

### Core Components

- `Panel`
- `SurfaceBadge`
- `WardrobeMosaic`
- `ItemArtwork`
- `MetricCard`
- `DemoWardrobeRack`
- `ItemReviewModal`

### Component Rules

- Rounded corners throughout
- Glass only for major premium surfaces
- Solid and soft panels for readability and density balance
- Badge system should carry state and metadata without clutter

## Motion

### Motion Principles

- smooth
- controlled
- premium
- never noisy

### Current Motion Language

- splash loader spiral motion
- screen transitions
- subtle hover elevation
- ambient floating cues

### Motion Rules

- motion should guide hierarchy and emotional polish
- reduced-motion mode must remain respected
- generation and upload states should feel intentional, not gimmicky
