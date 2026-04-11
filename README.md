# WeaR

Premium desktop fashion-tech app prototype built with React, Tailwind CSS, and Framer Motion.

## What It Includes

- Desktop-first WeaR app shell
- Premium splash loader
- Onboarding flow
- Wardrobe management
- Generate-from-wardrobe flow
- Event-aware chat context
- Upload review and auto-identification flow
- Dashboard, outfit studio, saved looks, and settings screens

## Run Locally

```powershell
& 'C:\Program Files\nodejs\npm.cmd' install
& 'C:\Program Files\nodejs\npm.cmd' run dev
```

## Validation

```powershell
& 'C:\Program Files\nodejs\npm.cmd' run typecheck
& 'C:\Program Files\nodejs\npm.cmd' run lint
& 'C:\Program Files\nodejs\npm.cmd' run test
& 'C:\Program Files\nodejs\npm.cmd' run build
```

## OpenAI Setup

Create a `.env` file from `.env.example` and add your `OPENAI_API_KEY` to enable live wardrobe chat, item identification, and outfit image generation.
