# A.I.M. Prompt Studio

Structured prompt builder for Actor / Input / Mission / K.I.S.S. / Reasoning / Format / Examples.

Dump messy notes, **AI Enhance** into the seven fields, **Run** on platform Grok, copy the xAI output to save History and clear the boxes.

## Features

- Quick capture → Enhance (rebuilds from capture)
- Live preview, Run with Grok, copy output → History
- Hybrid RAG Knowledge lab
- Prompt library (role, strategy, writing, techniques)
- Settings for Grok / Claude (Claude when `ANTHROPIC_API_KEY` is injected)
- Auth + optional Stripe later; models are open in this preview

## Stack

TanStack Start, React, Tailwind v4, Zustand, Better Auth.

## Setup

```bash
npm install
cp .env.example .env   # set XAI_API_KEY (never commit keys)
npm run dev
