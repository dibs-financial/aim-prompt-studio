import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { emptyFields, mergeFields, type AimFieldKey, type AimFields } from '~/lib/aim'

export type StudioStatus = 'idle' | 'enhancing' | 'running'

interface StudioState {
  capture: string
  fields: AimFields
  output: string
  status: StudioStatus
  error: string | null
  setCapture: (capture: string) => void
  setField: (key: AimFieldKey, value: string) => void
  setFields: (fields: Partial<AimFields>) => void
  replaceFields: (fields: AimFields) => void
  appendToInput: (text: string) => void
  setOutput: (output: string) => void
  setStatus: (status: StudioStatus) => void
  setError: (error: string | null) => void
  clearBoxes: () => void
}

export const useStudio = create<StudioState>()(
  persist(
    (set) => ({
      capture: '',
      fields: emptyFields(),
      output: '',
      status: 'idle',
      error: null,
      setCapture: (capture) => set({ capture }),
      setField: (key, value) => set((state) => ({ fields: { ...state.fields, [key]: value } })),
      setFields: (patch) => set((state) => ({ fields: mergeFields(state.fields, patch) })),
      replaceFields: (fields) => set({ fields }),
      appendToInput: (text) =>
        set((state) => ({
          fields: {
            ...state.fields,
            input: state.fields.input.trim() ? `${state.fields.input.trim()}\n\n${text}` : text,
          },
        })),
      setOutput: (output) => set({ output }),
      setStatus: (status) => set({ status }),
      setError: (error) => set({ error }),
      clearBoxes: () => set({ capture: '', fields: emptyFields(), output: '', error: null, status: 'idle' }),
    }),
    {
      name: 'aim-studio',
      partialize: (state) => ({ capture: state.capture, fields: state.fields, output: state.output }),
    },
  ),
)
