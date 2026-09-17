import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Provider = 'grok' | 'claude'

export const GROK_MODELS = ['grok-4', 'grok-4-fast-reasoning', 'grok-4-fast-non-reasoning', 'grok-3', 'grok-3-mini']
export const CLAUDE_MODELS = ['claude-opus-5', 'claude-sonnet-5', 'claude-haiku-4-5']

export interface SettingsState {
  provider: Provider
  grokModel: string
  claudeModel: string
  temperature: number
  maxTokens: number
  clearAfterCopy: boolean
  setProvider: (provider: Provider) => void
  setGrokModel: (model: string) => void
  setClaudeModel: (model: string) => void
  setTemperature: (temperature: number) => void
  setMaxTokens: (maxTokens: number) => void
  setClearAfterCopy: (value: boolean) => void
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      provider: 'grok',
      grokModel: GROK_MODELS[0],
      claudeModel: CLAUDE_MODELS[0],
      temperature: 0.7,
      maxTokens: 4096,
      clearAfterCopy: true,
      setProvider: (provider) => set({ provider }),
      setGrokModel: (grokModel) => set({ grokModel }),
      setClaudeModel: (claudeModel) => set({ claudeModel }),
      setTemperature: (temperature) => set({ temperature }),
      setMaxTokens: (maxTokens) => set({ maxTokens }),
      setClearAfterCopy: (clearAfterCopy) => set({ clearAfterCopy }),
    }),
    { name: 'aim-settings' },
  ),
)

export function activeModel(state: Pick<SettingsState, 'provider' | 'grokModel' | 'claudeModel'>): string {
  return state.provider === 'claude' ? state.claudeModel : state.grokModel
}
