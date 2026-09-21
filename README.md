# A.I.M. Prompt Studio

Structured prompt builder for Actor / Input / Mission / K.I.S.S. / Reasoning / Format / Examples.

Dump messy notes, **AI Enhance** into the seven fields, **Run** on platform Grok, copy the xAI output to save History and clear the boxes.

## Features

- Quick capture → Enhance (rebuilds from capture)
- Live preview, Run with Grok, copy output → History
- Hybrid RAG Knowledge lab
- Prompt library (role, strategy, writing, techniques, planning)
- Settings for Grok / Claude (Claude when `ANTHROPIC_API_KEY` is injected)
- Auth + optional Stripe later; models are open in this preview

## Stack

TanStack Start, React, Tailwind v4, Zustand, Better Auth.

## Setup

```bash
npm install
cp .env.example .env   # set XAI_API_KEY (never commit keys)
npm run dev
```

Open http://localhost:3000.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with SSR and hot reload on port 3000 |
| `npm run build` | Production build into `dist/` (client assets + server handler) |
| `npm start` | Serves the production build with `server.mjs` (`PORT` defaults to 3000) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest unit tests for the prompt compiler and retrieval engine |

## How it fits together

| Area | Where |
| --- | --- |
| Seven-field model and prompt compiler | `src/lib/aim.ts` |
| Hybrid retrieval (BM25 + trigram TF-IDF, reciprocal rank fusion) | `src/lib/rag.ts` |
| Prompt library entries | `src/data/library.ts` |
| Client state (studio, history, knowledge, settings; persisted to localStorage) | `src/store/` |
| Server functions: provider status, Enhance, Run | `src/server/functions.ts` |
| Provider adapters: xAI chat completions, Anthropic SDK | `src/server/providers.ts` |
| Better Auth (in-memory preview adapter) and `/api/auth/*` | `src/lib/auth.ts`, `src/routes/api/auth/$.ts` |
| Pages | `src/routes/` (Studio `/`, `/knowledge`, `/library`, `/history`, `/settings`) |

### Providers

- **Grok** talks to the xAI chat completions endpoint using `XAI_API_KEY` (and `XAI_BASE_URL`, default `https://api.x.ai/v1`). Enhance asks for JSON mode and validates the seven fields.
- **Claude** is available in Settings only when the server has `ANTHROPIC_API_KEY`. Enhance uses structured outputs; Run streams with adaptive thinking and server-side refusal fallbacks enabled.

API keys never leave the server: the browser calls TanStack Start server functions, which call the providers.

### Knowledge lab

Documents are chunked on blank lines and stored in the browser. A query is ranked twice, by BM25 over tokens and by TF-IDF cosine over character trigrams, and the two rankings are fused with reciprocal rank fusion. Selected chunks are appended to the Studio's Input field as a cited reference block.

### Auth

Better Auth is wired with the in-memory adapter and email/password so sign-in works out of the box in the preview; accounts reset when the server restarts. Nothing is gated on a session yet. Swap in a database adapter and add Stripe when tiers arrive.
