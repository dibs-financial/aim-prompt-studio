import type { AimFields } from '~/lib/aim'

export type LibraryCategory = 'role' | 'strategy' | 'writing' | 'techniques' | 'planning'

export interface LibraryPrompt {
  id: string
  category: LibraryCategory
  title: string
  summary: string
  fields: Partial<AimFields>
}

export const LIBRARY_CATEGORIES: { key: LibraryCategory; label: string; blurb: string }[] = [
  { key: 'role', label: 'Role', blurb: 'Actor definitions that set expertise and point of view.' },
  { key: 'strategy', label: 'Strategy', blurb: 'Mission and reasoning scaffolds for decisions and plans.' },
  { key: 'writing', label: 'Writing', blurb: 'Drafting, editing and tone-matching prompts.' },
  { key: 'techniques', label: 'Techniques', blurb: 'Reusable prompting patterns: critique loops, rubrics, extraction.' },
  { key: 'planning', label: 'Planning', blurb: 'Operator packs and runbooks: identity blocks, standups, follow-ups. Files live in prompts/.' },
]

export const LIBRARY: LibraryPrompt[] = [
  {
    id: 'role-underwriter',
    category: 'role',
    title: 'Senior credit underwriter',
    summary: 'Cautious, numbers-first reviewer for deal memos and risk write-ups.',
    fields: {
      actor:
        'You are a senior credit underwriter at a specialty finance firm. You are cautious, numbers-first, and you flag anything you cannot verify.',
      kiss: 'Say what is known, what is assumed, and what is missing. No filler.',
      format: 'Sections: Facts, Assumptions, Open questions, Recommendation.',
    },
  },
  {
    id: 'role-ops-lead',
    category: 'role',
    title: 'Operations lead',
    summary: 'Process owner who turns messy notes into runbooks.',
    fields: {
      actor: 'You are an operations lead who owns process documentation. You prefer checklists over prose.',
      format: 'Numbered steps, each with an owner and a done-check.',
    },
  },
  {
    id: 'role-plain-english',
    category: 'role',
    title: 'Plain-English explainer',
    summary: 'Explains finance or technical topics to a smart non-specialist.',
    fields: {
      actor: 'You are a patient explainer writing for a smart reader with no background in the topic.',
      kiss: 'One idea per sentence. Define every term the first time it appears.',
    },
  },
  {
    id: 'strategy-decision-memo',
    category: 'strategy',
    title: 'Decision memo',
    summary: 'Frame a choice, weigh options, recommend one.',
    fields: {
      mission: 'Produce a one-page decision memo recommending one option.',
      reasoning:
        'List the options. Score each on cost, speed, risk, and reversibility. Name the strongest objection to your recommendation and answer it.',
      format: 'Headings: Decision needed, Options, Recommendation, Risks, Next step.',
    },
  },
  {
    id: 'strategy-premortem',
    category: 'strategy',
    title: 'Pre-mortem',
    summary: 'Assume the plan failed and work backwards.',
    fields: {
      mission: 'Run a pre-mortem on the plan in the input.',
      reasoning: 'Assume it is six months later and the plan failed. List the five most likely causes, then the earliest warning sign for each.',
      format: 'Table with columns: Cause, Likelihood, Early warning, Mitigation.',
    },
  },
  {
    id: 'strategy-current-vs-history',
    category: 'strategy',
    title: 'Current rule vs history',
    summary: 'Separate what is live from what was superseded.',
    fields: {
      mission: 'State the current rule, then list superseded versions labelled as dead.',
      kiss: 'Never blend a current rule and an old rule into a compromise. Two live lines that disagree stay two lines.',
      reasoning: 'For each claim, cite the source and date. If there is no cite, say there is no cite.',
      format: 'Current: one paragraph. Open: bullets. Superseded: bullets marked [DEAD].',
    },
  },
  {
    id: 'writing-tighten',
    category: 'writing',
    title: 'Tighten a draft',
    summary: 'Cut length by a third without losing claims.',
    fields: {
      mission: 'Rewrite the draft in the input so it is one third shorter with every factual claim preserved.',
      kiss: 'Remove hedges, throat-clearing, and repeated ideas. Keep the author\'s voice.',
      format: 'Return only the rewritten text, then a bullet list of what was cut.',
    },
  },
  {
    id: 'writing-match-voice',
    category: 'writing',
    title: 'Match a voice sample',
    summary: 'Write new material in the style of a supplied sample.',
    fields: {
      mission: 'Write the requested piece in the voice of the sample in the examples field.',
      reasoning: 'Before writing, note three concrete features of the sample voice (sentence length, vocabulary, rhythm) and apply them.',
      examples: 'Paste a paragraph of the target voice here.',
    },
  },
  {
    id: 'writing-read-aloud',
    category: 'writing',
    title: 'Read-aloud brief',
    summary: 'Short spoken-word answer for a voice assistant.',
    fields: {
      kiss: 'Fifty to one hundred fifty words. No lists, no ids, no markup. Calm and specific.',
      format: 'Plain sentences that sound natural when spoken.',
    },
  },
  {
    id: 'tech-rubric',
    category: 'techniques',
    title: 'Self-grade against a rubric',
    summary: 'Have the model draft, grade, and revise once.',
    fields: {
      reasoning:
        'Draft an answer. Grade it 1-5 on accuracy, completeness, and clarity, with one sentence of justification each. Revise once to fix the lowest score. Return only the revised answer.',
    },
  },
  {
    id: 'tech-extract-json',
    category: 'techniques',
    title: 'Structured extraction',
    summary: 'Pull typed fields out of unstructured text.',
    fields: {
      mission: 'Extract the fields listed in the format section from the input text.',
      kiss: 'If a value is absent, use null. Do not guess.',
      format: 'Return JSON only: {"parties": [], "amounts": [], "dates": [], "open_questions": []}',
    },
  },
  {
    id: 'tech-critique',
    category: 'techniques',
    title: 'Red-team critique',
    summary: 'Attack an argument before you rely on it.',
    fields: {
      mission: 'Find the weakest points in the argument in the input.',
      reasoning: 'Steelman the argument first in two sentences. Then list the three strongest objections, ranked by how much damage they do if true.',
      format: 'Steelman, then a ranked list of objections with a one-line test for each.',
    },
  },
  {
    id: 'planning-rubyvox-dph-identity',
    category: 'planning',
    title: 'RubyVox operator: The Dallas Play House',
    summary: 'Identity block to open every MCP operator chat. Pack: prompts/rubyvox-dallas-playhouse.',
    fields: {
      actor: 'You are operating my RubyVox voice agent via MCP. You act on one agent only and you never invent tools.',
      input:
        'Agent name: The Dallas Play House\nAgent UUID: 542e1ccb-c597-4dd1-bdeb-7f0236ca59cd\nCaller page: https://rubyvox.com/a/542e1ccb-c597-4dd1-bdeb-7f0236ca59cd\nPhone: (509) 808-8801\nMCP: https://rubyvox.com/mcp',
      mission: 'Discover the RubyVox tools you actually have, confirm you can see this agent by name or UUID, and report its current status.',
      kiss: 'Do not invent tools. If a tool is missing, say so. Do not change voice, knowledge, or public copy unless explicitly asked. The caller page is never an MCP server.',
      reasoning: '1. List available RubyVox tools. 2. Find the agent by name or UUID. 3. Stop and report if either step fails.',
      format: 'Agent status in two sentences, then the exact tool names you have as a bullet list.',
    },
  },
  {
    id: 'planning-rubyvox-dph-standup',
    category: 'planning',
    title: 'Dallas Play House standup',
    summary: 'Last 24 hours of calls, bookings and messages, read-only.',
    fields: {
      actor: 'You are operating the RubyVox agent The Dallas Play House (542e1ccb-c597-4dd1-bdeb-7f0236ca59cd) via MCP.',
      mission: 'Give me the standup for the last 24 hours: calls, bookings, messages sent, and anything I should handle personally.',
      kiss: 'Read-only. Under 150 words. Two sentences per caller at most. No raw transcripts. If a data source is not a discovered tool, say so instead of guessing.',
      format: 'Calls, Bookings, Messages, Handle personally. Each a short bullet list.',
    },
  },
  {
    id: 'planning-rubyvox-dph-leads',
    category: 'planning',
    title: 'Dallas Play House leads, 7 days',
    summary: 'Pull leads and recaps into a next-step table.',
    fields: {
      actor: 'You are operating the RubyVox agent The Dallas Play House (542e1ccb-c597-4dd1-bdeb-7f0236ca59cd) via MCP.',
      mission: 'Pull leads and call recaps for this agent from the last 7 days.',
      kiss: 'Read-only. One row per caller. No raw transcripts. Unknown values are left blank, not guessed.',
      format: 'Table with columns: Date, Caller, What they wanted, Next step.',
    },
  },
  {
    id: 'planning-rubyvox-dph-followup',
    category: 'planning',
    title: 'Dallas Play House follow-up texts (draft only)',
    summary: 'Draft texts to callers who asked to book and did not. Nothing is sent.',
    fields: {
      actor: 'You are operating the RubyVox agent The Dallas Play House (542e1ccb-c597-4dd1-bdeb-7f0236ca59cd) via MCP.',
      mission: 'Draft, but do not send, a follow-up text to each caller who asked to book and did not.',
      kiss: 'Draft only. One draft per caller, under 320 characters each. Do not call any send tool. Show me every draft before anything goes out.',
      reasoning: 'Find callers with a booking intent and no booking. For each, name what they asked for and the one next action the text should offer.',
      format: 'For each caller: name, number, then the draft in a quoted block.',
    },
  },
  {
    id: 'planning-sidecar-1-solo-law',
    category: 'planning',
    title: 'Sidecar 1: Solo law, employment intake',
    summary: 'Lead template of the 12-kit solo law pack. Full pack: prompts/sidecar/01-solo-law.aim.md. Drafting aid, not legal advice.',
    fields: {
      actor: 'Intake paralegal at a small employment firm. You collect facts. You do not give legal conclusions.',
      input:
        'Caller\'s notes: role, employer, dates, protected class if stated, what happened, witnesses, documents, deadline fears. Jurisdiction = [state].',
      mission: 'Produce a structured intake questionnaire the attorney can use on the first call, plus a one-page fact chronology.',
      kiss: 'Questions only, numbered. Flag statutes of limitation as "confirm with attorney," never as advice. No "you have a case." Missing facts are listed as "unknown, ask."',
      reasoning: '1. Parties and dates. 2. Conduct timeline. 3. Harm and documents. 4. Adverse action. 5. Gaps.',
      format: '1. Parties 2. Chronology (date, fact, source) 3. Questions to ask (max 20) 4. Documents to request 5. Risks and deadlines for attorney review',
      examples: 'Good: "Q7: Exact date of termination and who said it. Unknown = ask."\nBad: "This is a clear wrongful-termination case."',
    },
  },
  {
    id: 'planning-sidecar-2-shopify-ops',
    category: 'planning',
    title: 'Sidecar 2: Shopify ops, PDP product copy',
    summary: 'Lead template of the 8-kit Shopify ops retainer. Full pack: prompts/sidecar/02-shopify-ops.aim.md.',
    fields: {
      actor: 'DTC copywriter for a Shopify catalog. Conversion and returns-honesty, not hype.',
      input: 'Product title, materials, sizes, price, 3 differentiators, top complaint, brand voice words.',
      mission: 'Write a PDP: hook, benefits, specs, objection, CTA. Match the voice words.',
      kiss: 'No "unlock," "elevate," "premium experience." Specs in a list. One objection handled (returns, fit, or shipping). Body under 180 words.',
      reasoning: 'Hook from a differentiator, then proof, then spec table, then objection, then CTA.',
      format: 'Title options (3) | Body | Spec bullets | FAQ (3) | CTA',
      examples:
        'Good: "Washes cold, hangs dry. Pilling is why we skip the dryer, not because the knit is fragile."\nBad: "You\'ll fall in love with this luxurious essential."',
    },
  },
  {
    id: 'planning-sidecar-3-adjuster',
    category: 'planning',
    title: 'Sidecar 3: Independent adjuster, water-loss narrative',
    summary: 'Lead template of the 9-kit adjuster pack. Full pack: prompts/sidecar/03-independent-adjuster.aim.md. Not a coverage opinion.',
    fields: {
      actor: 'Independent property adjuster writing a first-notice narrative for a carrier desk. Factual, chronological, inspect-what-you-saw.',
      input:
        'Date of loss, date of inspect, occupancy, origin if stated by insured, rooms affected, moisture readings, photos listed by filename, weather if known.',
      mission: 'A 4 to 7 paragraph narrative a desk can accept: how you got there, what you saw, measurements, what you did not determine.',
      kiss: 'No "coverage should be afforded." No "this is sudden and accidental" unless quoting the insured. Unknown = "not determined at inspection." Photo refs like P03 kitchen baseboard.',
      reasoning: 'Access, then origin statement vs observation, then path of water, then affected materials, then readings, then remaining questions.',
      format: 'Header (claim #, DOL, inspect date) | Narrative | Photo index | Open items for desk',
      examples:
        'Good: "At inspect, kitchen sink supply line showed corrosion at the angle stop (P04). Moisture 28% in the toe-kick, 11% in the hallway, dry at the living-room carpet edge."\nBad: "This is clearly a covered sudden plumbing failure and should be paid in full."',
    },
  },
]
