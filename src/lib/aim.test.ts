import { describe, expect, it } from 'vitest'
import { compilePrompt, emptyFields, isEmpty, mergeFields } from './aim'

describe('compilePrompt', () => {
  it('returns an empty string when every field is blank', () => {
    expect(compilePrompt(emptyFields())).toBe('')
  })

  it('emits only populated sections in canonical order', () => {
    const prompt = compilePrompt({
      ...emptyFields(),
      format: 'Bulleted list',
      actor: 'Senior underwriter',
    })
    expect(prompt).toBe('## ACTOR\nSenior underwriter\n\n## FORMAT\nBulleted list')
  })
})

describe('mergeFields', () => {
  it('overrides only the keys present in the patch', () => {
    const merged = mergeFields({ ...emptyFields(), actor: 'A' }, { mission: 'M' })
    expect(merged.actor).toBe('A')
    expect(merged.mission).toBe('M')
    expect(isEmpty(merged)).toBe(false)
  })
})
