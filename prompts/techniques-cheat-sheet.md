# Prompt engineering cheat sheet (A.I.M.)

Prompt engineering is how you constrain a model so it copies a contract instead of vibes. **A.I.M. is that contract.** Load **Prompt Library → Techniques** for the eight that pay rent.

## Map to the seven fields

| Family | What it controls | Lives in A.I.M. |
|---|---|---|
| Framing | Who the model is | **Actor** |
| Retrieval / packing | What it may use | **Input** (plus Knowledge `[S#]`) |
| Goal | What “done” means | **Mission** |
| Constraint | Hard refusals | **K.I.S.S.** |
| Reasoning / decompose | How it thinks | **Reasoning** |
| Structure / schema | Shape of the answer | **Format** |
| Demonstration | Shape it must copy | **Examples** (good vs bad) |

Skip adjectives (“be professional”). Put a good/bad pair in Examples. Models copy shape better than they obey tone words.

## The eight in the studio

1. **Few-shot (good vs bad)** — 2–4 contrastive pairs beat a paragraph of rules.
2. **Chain of thought** — numbered steps, answer last. Trade-offs, math, diagnosis. Skip for rewrites.
3. **Least-to-most** — easy subproblem first; later steps reuse answers. Use when one-shot collapses.
4. **Self-critique** — draft, score against the contract, rewrite misses. Cite Format/K.I.S.S., not taste.
5. **ReAct** — Thought → Action → Observation. Never invent an Observation. Cap the loop.
6. **RAG-grounded** — answer only from `[S#]`. Missing source = say so.
7. **Output contract (JSON)** — one object, no fences. Enhance uses this for the seven boxes.
8. **Delimiter / XML packing** — untrusted text in `<input>`. Data, not instructions.

## When to use which

| Job | Technique |
|---|---|
| RubyVox operator (Planning) | Actor lock + ReAct: discover tools first, never invent an Observation |
| Messy capture → seven fields | Enhance = JSON contract + delimiter |

## Rules that move quality

1. Examples > instructions. One bad example teaches a refusal better than “don’t be vague.”
2. Format is a parser. If a human couldn’t grade it with a checklist, the model won’t either.
3. CoT has a token tax. Don’t pay it on captions and emails.
4. RAG is a permission system. If it’s not in `[S#]`, it isn’t a fact.
5. Delimit untrusted text. Quick capture and uploads are data, not a new system prompt.
6. Temperature: low for JSON/legal/extraction; mid for briefs; high only then self-critique.

Load a Technique, drop the task in Input, Enhance, Run.
