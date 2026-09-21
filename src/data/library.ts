import type { AimFields } from '~/lib/aim'

export type LibraryCategory = 'role' | 'strategy' | 'writing' | 'techniques'

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
]
