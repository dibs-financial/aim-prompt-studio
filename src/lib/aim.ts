/**
 * The A.I.M. prompt model: seven structured fields that compile into one prompt.
 */
export const AIM_FIELD_KEYS = [
  'actor',
  'input',
  'mission',
  'kiss',
  'reasoning',
  'format',
  'examples',
] as const

export type AimFieldKey = (typeof AIM_FIELD_KEYS)[number]

export type AimFields = Record<AimFieldKey, string>

export interface AimFieldMeta {
  key: AimFieldKey
  label: string
  heading: string
  hint: string
  rows: number
}

export const AIM_FIELDS: AimFieldMeta[] = [
  {
    key: 'actor',
    label: 'Actor',
    heading: 'ACTOR',
    hint: 'Who the model is: role, expertise, point of view.',
    rows: 2,
  },
  {
    key: 'input',
    label: 'Input',
    heading: 'INPUT',
    hint: 'Context and raw material the model works from.',
    rows: 5,
  },
  {
    key: 'mission',
    label: 'Mission',
    heading: 'MISSION',
    hint: 'The one outcome this prompt must produce.',
    rows: 3,
  },
  {
    key: 'kiss',
    label: 'K.I.S.S.',
    heading: 'K.I.S.S. (KEEP IT SIMPLE)',
    hint: 'Constraints and simplifications: scope, length, what to leave out.',
    rows: 2,
  },
  {
    key: 'reasoning',
    label: 'Reasoning',
    heading: 'REASONING',
    hint: 'How to think about it: steps, checks, trade-offs to weigh.',
    rows: 3,
  },
  {
    key: 'format',
    label: 'Format',
    heading: 'FORMAT',
    hint: 'Shape of the answer: sections, tables, JSON, word count.',
    rows: 2,
  },
  {
    key: 'examples',
    label: 'Examples',
    heading: 'EXAMPLES',
    hint: 'Sample inputs and outputs, or a style sample to match.',
    rows: 3,
  },
]

export function emptyFields(): AimFields {
  return {
    actor: '',
    input: '',
    mission: '',
    kiss: '',
    reasoning: '',
    format: '',
    examples: '',
  }
}

export function isEmpty(fields: AimFields): boolean {
  return AIM_FIELD_KEYS.every((key) => fields[key].trim() === '')
}

/** Compile the seven fields into a single prompt. Empty fields are skipped. */
export function compilePrompt(fields: AimFields): string {
  const sections = AIM_FIELDS.filter((meta) => fields[meta.key].trim() !== '').map(
    (meta) => `## ${meta.heading}\n${fields[meta.key].trim()}`,
  )
  return sections.join('\n\n')
}

/** Merge a partial set of fields over an existing set, ignoring undefined values. */
export function mergeFields(base: AimFields, patch: Partial<AimFields>): AimFields {
  const next = { ...base }
  for (const key of AIM_FIELD_KEYS) {
    const value = patch[key]
    if (typeof value === 'string') next[key] = value
  }
  return next
}
